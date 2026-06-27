import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { NewRepurposeScreen } from './src/screens/NewRepurposeScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { colors, PROJECTS, SRC_TYPES, OUTPUTS } from './src/data/constants';
import { isSupabaseConfigured } from './src/lib/config';
import { useAuth } from './src/hooks/useAuth';
import {
  generateRepurpose,
  listRepurposes,
  saveOutputs,
  getMonthlyUsage,
  type RepurposeRow,
} from './src/lib/api';

type Screen = 'onboarding' | 'auth' | 'home' | 'library' | 'settings' | 'new' | 'generating' | 'results';
type TabId = 'home' | 'library' | 'settings';

type Project = {
  id: string;
  title: string;
  src: string;
  date: string;
  outputs: number;
  status: string;
  formats: string[];
  outputsMap?: Record<string, string>;
};

interface ResultsState {
  id: string | null;
  title: string;
  voice: string;
  srcType: string;
  selected: string[];
  outputs: Record<string, string>;
}

function deriveTitle(sourceText: string, srcType: string): string {
  const first = (sourceText || '').trim().split('\n')[0] ?? '';
  if (first) return first.length > 60 ? first.slice(0, 60) + '…' : first;
  return `${SRC_TYPES.find((t) => t.id === srcType)?.label ?? 'New'} repurpose`;
}

function rowToProject(r: RepurposeRow): Project {
  const srcLabel = SRC_TYPES.find((t) => t.id === r.source_type)?.label ?? 'Source';
  const count = Object.keys(r.outputs || {}).length;
  return {
    id: r.id,
    title: r.title || 'Untitled',
    src: `${srcLabel} · ${count} outputs`,
    date: new Date(r.created_at).toLocaleDateString(),
    outputs: count,
    status: 'Ready',
    formats: r.platforms ?? [],
    outputsMap: r.outputs ?? {},
  };
}

export default function App() {
  const { session, user, loading: authLoading, signOut } = useAuth();
  const supaOn = isSupabaseConfigured;

  const [screen, setScreen] = useState<Screen>('onboarding');
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [resultsState, setResultsState] = useState<ResultsState | null>(null);
  const [library, setLibrary] = useState<Project[]>(supaOn ? [] : PROJECTS);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const [toast, setToast] = useState('');
  const [genError, setGenError] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  }, []);

  const refreshLibrary = useCallback(async () => {
    if (!supaOn || !session) return;
    try {
      const rows = await listRepurposes();
      setLibrary(rows.map(rowToProject));
    } catch { /* ignore */ }
  }, [supaOn, session]);

  const refreshUsage = useCallback(async () => {
    if (!supaOn || !session) { setUsage(null); return; }
    try { setUsage(await getMonthlyUsage()); } catch { /* ignore */ }
  }, [supaOn, session]);

  // Once auth resolves: signed-in users skip onboarding/auth straight to home.
  useEffect(() => {
    if (authLoading || !supaOn) return;
    if (session && (screen === 'onboarding' || screen === 'auth')) {
      setScreen('home');
    }
  }, [authLoading, supaOn, session, screen]);

  useEffect(() => {
    if (session) { refreshLibrary(); refreshUsage(); }
  }, [session, refreshLibrary, refreshUsage]);

  // ── Generation ──────────────────────────────────────────────────────────
  const handleSubmit = async (input: { selected: string[]; voice: string; srcType: string; sourceText: string }) => {
    const title = deriveTitle(input.sourceText, input.srcType);

    // Mock mode (no Supabase yet): use canned sample outputs so the UI still works.
    if (!supaOn) {
      const outputs: Record<string, string> = {};
      input.selected.forEach((id) => { outputs[id] = OUTPUTS[id] || ''; });
      setResultsState({ id: null, title, voice: input.voice, srcType: input.srcType, selected: input.selected, outputs });
      setScreen('results');
      return;
    }

    if (!session) { setScreen('auth'); return; }

    setGenError('');
    setScreen('generating');
    const res = await generateRepurpose({
      title,
      sourceType: input.srcType,
      sourceText: input.sourceText,
      platforms: input.selected,
      voice: input.voice,
    });

    if (res.ok) {
      setResultsState({ id: res.id, title, voice: input.voice, srcType: input.srcType, selected: input.selected, outputs: res.outputs });
      await Promise.all([refreshLibrary(), refreshUsage()]);
      setScreen('results');
      return;
    }

    // Error paths
    if (res.reason === 'limit_reached') setGenError(`You've used all ${res.limit ?? 10} free repurposes this month.`);
    else if (res.reason === 'rate_limited') setGenError('Rate limited — try again in a moment.');
    else if (res.reason === 'unauthorized') { setScreen('auth'); return; }
    else setGenError(res.message || "Couldn't generate. Try again.");
    setScreen('new');
    showToast(genError || 'Generation failed');
  };

  const handleSelectProject = (project: Project) => {
    setResultsState({
      id: project.id,
      title: project.title,
      voice: 'My main voice',
      srcType: project.formats[0] ?? 'idea',
      selected: project.formats,
      outputs: project.outputsMap ?? {},
    });
    setScreen('results');
  };

  // Save edits to an existing (already-persisted) repurpose, or no-op in mock mode.
  const handleSaveOutputs = async (outputs: Record<string, string>) => {
    setResultsState((s) => (s ? { ...s, outputs } : s));
    if (supaOn && resultsState?.id) {
      try { await saveOutputs(resultsState.id, outputs); await refreshLibrary(); } catch (e) { showToast((e as Error).message); }
    }
  };

  const handleExitResults = () => { setScreen('home'); setActiveTab('home'); setResultsState(null); };

  // ── Render ──────────────────────────────────────────────────────────────
  if (supaOn && authLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </SafeAreaView>
    );
  }

  const renderScreen = () => {
    if (screen === 'onboarding') {
      return <OnboardingScreen onComplete={() => setScreen(supaOn && !session ? 'auth' : 'home')} />;
    }
    if (screen === 'auth') {
      return <AuthScreen onAuthed={() => setScreen('home')} onBack={() => setScreen('onboarding')} />;
    }
    if (screen === 'new') {
      return <NewRepurposeScreen onExit={() => setScreen('home')} onComplete={handleSubmit} />;
    }
    if (screen === 'generating') {
      return (
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.genTitle}>Repurposing…</Text>
          <Text style={styles.genSub}>Generating platform-native content in your voice</Text>
        </View>
      );
    }
    if (screen === 'results' && resultsState) {
      return (
        <ResultsScreen
          title={resultsState.title}
          voice={resultsState.voice}
          selected={resultsState.selected}
          outputs={resultsState.outputs}
          saved={!!resultsState.id}
          autoSaved={supaOn && !!resultsState.id}
          onSaveOutputs={handleSaveOutputs}
          onExit={handleExitResults}
        />
      );
    }

    return (
      <View style={styles.mainContainer}>
        {activeTab === 'home' && (
          <HomeScreen
            projects={library}
            usedThisMonth={usage?.used}
            monthlyLimit={usage?.limit}
            onNewRepurpose={() => setScreen('new')}
            onViewLibrary={() => setActiveTab('library')}
            onSelectProject={handleSelectProject}
          />
        )}
        {activeTab === 'library' && <LibraryScreen projects={library} onSelectProject={handleSelectProject} />}
        {activeTab === 'settings' && (
          <SettingsScreen
            email={user?.email ?? ''}
            usage={usage}
            authEnabled={supaOn}
            onSignOut={async () => { await signOut(); setScreen('onboarding'); setActiveTab('home'); }}
          />
        )}

        <View style={styles.tabBar}>
          <TabBarItem label="Home" icon="🏠" active={activeTab === 'home'} onPress={() => setActiveTab('home')} />
          <TabBarItem label="Library" icon="📚" active={activeTab === 'library'} onPress={() => setActiveTab('library')} />
          <TabBarItem label="Settings" icon="⚙️" active={activeTab === 'settings'} onPress={() => setActiveTab('settings')} />
        </View>

        {!!toast && (
          <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View>
        )}
      </View>
    );
  };

  return <SafeAreaView style={styles.container}>{renderScreen()}</SafeAreaView>;
}

function TabBarItem({ label, icon, active, onPress }: { label: string; icon: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.tabItem} activeOpacity={0.7}>
      <Text style={{ fontSize: 24, marginBottom: 5 }}>{icon}</Text>
      <Text style={[styles.tabLabel, active ? styles.tabLabelActive : styles.tabLabelInactive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', gap: 14 },
  genTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 8 },
  genSub: { fontSize: 14, color: colors.textDim, textAlign: 'center', paddingHorizontal: 40 },
  mainContainer: { flex: 1 },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around', paddingTop: 8, paddingBottom: 20 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 6 },
  tabLabel: { fontSize: 10.5, fontWeight: '600' },
  tabLabelActive: { color: colors.accent },
  tabLabelInactive: { color: colors.textDim },
  toast: { position: 'absolute', bottom: 104, alignSelf: 'center', backgroundColor: '#1f1f22', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 13, paddingHorizontal: 18, paddingVertical: 12, maxWidth: '88%' },
  toastText: { fontSize: 14, fontWeight: '600', color: colors.text, textAlign: 'center' },
});
