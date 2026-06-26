import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { NewRepurposeScreen } from './src/screens/NewRepurposeScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { colors, PROJECTS, SRC_TYPES } from './src/data/constants';

const LIBRARY_KEY = 'repurpose.library.v1';

type Screen = 'onboarding' | 'home' | 'library' | 'settings' | 'new' | 'results';
type TabId = 'home' | 'library' | 'settings';

type Project = {
  id: string;
  title: string;
  src: string;
  date: string;
  outputs: number;
  status: string;
  formats: string[];
};

interface ResultsState {
  id: string | null; // library id if this was opened from a saved project
  title: string;
  voice: string;
  srcType: string;
  selected: string[];
}

function deriveTitle(sourceText: string, srcType: string): string {
  const first = (sourceText || '').trim().split('\n')[0] ?? '';
  if (first) return first.length > 60 ? first.slice(0, 60) + '…' : first;
  return `${SRC_TYPES.find((t) => t.id === srcType)?.label ?? 'New'} repurpose`;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [resultsState, setResultsState] = useState<ResultsState | null>(null);
  const [library, setLibrary] = useState<Project[]>(PROJECTS);
  const hydrated = useRef(false);

  // Load any previously saved library on launch.
  useEffect(() => {
    AsyncStorage.getItem(LIBRARY_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length) setLibrary(parsed);
        }
      })
      .catch(() => {})
      .finally(() => { hydrated.current = true; });
  }, []);

  // Persist the library whenever it changes (after the initial hydrate).
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(library)).catch(() => {});
  }, [library]);

  const handleNewRepurposeComplete = ({ selected, voice, srcType, sourceText }: { selected: string[]; voice: string; srcType: string; sourceText: string }) => {
    setResultsState({
      id: null, // not yet saved
      title: deriveTitle(sourceText, srcType),
      voice,
      srcType,
      selected,
    });
    setScreen('results');
  };

  const handleSelectProject = (project: Project) => {
    setResultsState({
      id: project.id,
      title: project.title,
      voice: 'My main voice',
      srcType: project.formats[0] ?? 'idea',
      selected: project.formats,
    });
    setScreen('results');
  };

  const handleSaveToLibrary = () => {
    if (!resultsState) return;
    if (resultsState.id) return; // already in the library
    const srcLabel = SRC_TYPES.find((t) => t.id === resultsState.srcType)?.label ?? 'Source';
    const newProject: Project = {
      id: String(Date.now()),
      title: resultsState.title,
      src: `${srcLabel} · just now`,
      date: 'Just now',
      outputs: resultsState.selected.length,
      status: 'Ready',
      formats: resultsState.selected,
    };
    setLibrary((prev) => [newProject, ...prev]);
    setResultsState({ ...resultsState, id: newProject.id }); // mark saved
  };

  const handleExitResults = () => {
    setScreen('home');
    setActiveTab('home');
    setResultsState(null);
  };

  const renderScreen = () => {
    if (screen === 'onboarding') {
      return <OnboardingScreen onComplete={() => setScreen('home')} />;
    }

    if (screen === 'new') {
      return <NewRepurposeScreen onExit={() => setScreen('home')} onComplete={handleNewRepurposeComplete} />;
    }

    if (screen === 'results' && resultsState) {
      return (
        <ResultsScreen
          title={resultsState.title}
          voice={resultsState.voice}
          selected={resultsState.selected}
          saved={!!resultsState.id}
          onSave={handleSaveToLibrary}
          onExit={handleExitResults}
        />
      );
    }

    return (
      <View style={styles.mainContainer}>
        {screen === 'home' && activeTab === 'home' && <HomeScreen projects={library} onNewRepurpose={() => setScreen('new')} onViewLibrary={() => { setScreen('home'); setActiveTab('library'); }} onSelectProject={handleSelectProject} />}

        {screen === 'home' && activeTab === 'library' && <LibraryScreen projects={library} onSelectProject={handleSelectProject} />}

        {screen === 'home' && activeTab === 'settings' && <SettingsScreen />}

        <View style={styles.tabBar}>
          <TabBarItem label="Home" icon="🏠" active={activeTab === 'home'} onPress={() => { setScreen('home'); setActiveTab('home'); }} />
          <TabBarItem label="Library" icon="📚" active={activeTab === 'library'} onPress={() => { setScreen('home'); setActiveTab('library'); }} />
          <TabBarItem label="Settings" icon="⚙️" active={activeTab === 'settings'} onPress={() => { setScreen('home'); setActiveTab('settings'); }} />
        </View>
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
  mainContainer: { flex: 1 },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around', paddingTop: 8, paddingBottom: 20 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 6 },
  tabLabel: { fontSize: 10.5, fontWeight: '600' },
  tabLabelActive: { color: colors.accent },
  tabLabelInactive: { color: colors.textDim },
});
