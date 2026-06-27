import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { colors, VOICES } from '../data/constants';
import { Card } from '../components/Card';

interface Props {
  email?: string;
  usage?: { used: number; limit: number } | null;
  authEnabled?: boolean;
  onSignOut?: () => void;
}

export function SettingsScreen({ email, usage, authEnabled = false, onSignOut }: Props) {
  const [darkMode, setDarkMode] = useState(true);
  const [haptic, setHaptic] = useState(true);
  const [activeVoice] = useState('My main voice');

  const initial = (email || 'You').trim().charAt(0).toUpperCase();
  const remaining = usage ? Math.max(usage.limit - usage.used, 0) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <Card style={styles.profileCard}>
        <View style={styles.profileContent}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{initial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>{email || 'Your account'}</Text>
            <Text style={styles.profileEmail}>
              {authEnabled ? 'Free plan' : 'Not signed in'}
              {usage ? ` · ${usage.used}/${usage.limit} this month` : ''}
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.upgradeCard}>
        <View style={styles.upgradeHeader}>
          <Text style={styles.upgradeTitle}>Repurpose Pro</Text>
          <Text style={styles.upgradePrice}>Coming soon</Text>
        </View>
        <Text style={styles.upgradeDesc}>
          {remaining !== null
            ? `${remaining} free repurpose${remaining === 1 ? '' : 's'} left this month. Unlimited generation arrives with Pro.`
            : 'Unlimited repurposes, brand voice memory, and advanced export — arriving with Pro.'}
        </Text>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Brand voices</Text>
        <Card style={styles.voicesList}>
          {VOICES.map((voice, i) => (
            <View key={voice} style={[styles.voiceRow, i < VOICES.length - 1 && styles.voiceRowBorder]}>
              <View style={styles.voiceIcon}>
                <Text style={styles.voiceIconSymbol}>🎤</Text>
              </View>
              <Text style={styles.voiceText}>{voice}</Text>
              {activeVoice === voice && <Text style={styles.voiceActive}>Active</Text>}
            </View>
          ))}
          <TouchableOpacity style={styles.addVoiceRow}>
            <View style={styles.addVoiceIcon}>
              <Text style={styles.addVoiceSymbol}>+</Text>
            </View>
            <Text style={styles.addVoiceText}>Add a voice</Text>
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Preferences</Text>
        <Card style={styles.preferencesList}>
          <View style={[styles.prefRow, styles.prefRowBorder]}>
            <Text style={styles.prefLabel}>Dark appearance</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: '#ccc', true: colors.accent }} />
          </View>
          <View style={[styles.prefRow, styles.prefRowBorder]}>
            <Text style={styles.prefLabel}>Haptic feedback</Text>
            <Switch value={haptic} onValueChange={setHaptic} trackColor={{ false: '#ccc', true: colors.accent }} />
          </View>
          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Default export</Text>
            <Text style={styles.prefValue}>Copy ›</Text>
          </View>
        </Card>
      </View>

      {authEnabled && onSignOut && (
        <TouchableOpacity onPress={onSignOut} style={styles.signOut} activeOpacity={0.7}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 20 },
  title: { fontSize: 30, fontWeight: '800', color: colors.text, marginBottom: 22, letterSpacing: -1.1 },
  profileCard: { padding: 16, marginBottom: 22 },
  profileContent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  profileAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  profileAvatarText: { fontSize: 20, fontWeight: '700', color: colors.accentOn },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '700', color: colors.text },
  profileEmail: { fontSize: 13.5, color: colors.textDim, marginTop: 3 },
  profileChevron: { fontSize: 12, color: 'rgba(244,244,246,0.3)' },
  upgradeCard: { padding: 18, marginBottom: 22, backgroundColor: colors.accentBg, borderColor: colors.accentBorder },
  upgradeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 },
  upgradeTitle: { fontSize: 19, fontWeight: '800', color: colors.accent },
  upgradePrice: { fontSize: 14, fontWeight: '700', color: colors.accent },
  upgradeDesc: { fontSize: 14, lineHeight: 21, color: 'rgba(244,244,246,0.7)' },
  section: { marginBottom: 22 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: colors.textFaint, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 9, paddingLeft: 4 },
  voicesList: { overflow: 'hidden' },
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 16, paddingVertical: 13 },
  voiceRowBorder: { borderBottomWidth: 0.5, borderBottomColor: colors.border },
  voiceIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.accentSubtle, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  voiceIconSymbol: { fontSize: 16 },
  voiceText: { flex: 1, fontSize: 15.5, fontWeight: '500', color: colors.text },
  voiceActive: { fontSize: 12.5, fontWeight: '600', color: colors.accent },
  addVoiceRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 16, paddingVertical: 13 },
  addVoiceIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  addVoiceSymbol: { fontSize: 18, color: colors.textMuted },
  addVoiceText: { fontSize: 15.5, color: colors.textMuted },
  preferencesList: { overflow: 'hidden' },
  prefRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  prefRowBorder: { borderBottomWidth: 0.5, borderBottomColor: colors.border },
  prefLabel: { fontSize: 15.5, color: colors.text },
  prefValue: { fontSize: 14.5, color: colors.textDim },
  signOut: { marginTop: 4, marginBottom: 20, alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)' },
  signOutText: { fontSize: 14.5, fontWeight: '600', color: '#ff6b6b' },
});
