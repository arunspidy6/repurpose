import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { NewRepurposeScreen } from './src/screens/NewRepurposeScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { colors } from './src/data/constants';

type Screen = 'onboarding' | 'home' | 'library' | 'settings' | 'new' | 'results';
type TabId = 'home' | 'library' | 'settings';

interface ResultsState {
  title: string;
  voice: string;
  selected: string[];
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [resultsState, setResultsState] = useState<ResultsState | null>(null);

  const handleNewRepurposeComplete = (selected: string[], voice: string) => {
    setResultsState({
      title: 'How I grew my newsletter to 50,000 subscribers',
      voice,
      selected,
    });
    setScreen('results');
  };

  const handleSelectProject = (project: any) => {
    setResultsState({
      title: project.title,
      voice: 'My main voice',
      selected: project.formats,
    });
    setScreen('results');
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
      return <ResultsScreen title={resultsState.title} voice={resultsState.voice} selected={resultsState.selected} onExit={handleExitResults} />;
    }

    return (
      <View style={styles.mainContainer}>
        {screen === 'home' && activeTab === 'home' && <HomeScreen onNewRepurpose={() => setScreen('new')} onViewLibrary={() => { setScreen('home'); setActiveTab('library'); }} onSelectProject={handleSelectProject} />}

        {screen === 'home' && activeTab === 'library' && <LibraryScreen onSelectProject={handleSelectProject} />}

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
