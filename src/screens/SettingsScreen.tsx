import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { colors, VOICES } from '../data/constants';
import { Card } from '../components/Card';

interface Props {}

export function SettingsScreen({ }: Props) {
  const [darkMode, setDarkMode] = useState(true);
  const [haptic, setHaptic] = useState(true);
  const [activeVoice, setActiveVoice] = useState('My main voice');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <Card style={styles.profileCard}>
        <View style={styles.profileContent}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>M</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Maya Okonkwo</Text>
            <Text style={styles.profileEmail}>maya@studio.co · Free plan</Text>
          </View>
          <Text style={styles.profileChevron}>›</Text>
        </View>
      </Card>

      <TouchableOpacity activeOpacity={0.7}>
        <Card style={styles.upgradeCard}>
          <View style={styles.upgradeHeader}>
            <Text style={styles.upgradeTitle}>Repurpose Pro</Text>
            <Text style={styles.upgradePrice}>$12/mo</Text>
          </View>
          <Text style={styles.upgradeDesc}>Unlimited repurposes, brand voice memory, library search, and advanced export.</Text>
        </Card>
      </TouchableOpacity>

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
            <Text style={styles.prefValue}>Share sheet ›</Text>
          </View>
        </Card>
      </View>
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
});
