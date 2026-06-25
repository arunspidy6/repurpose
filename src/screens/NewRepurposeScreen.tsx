import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, PLATFORMS, VOICES, SRC_TYPES } from '../data/constants';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { MonoChip } from '../components/MonoChip';

interface Props {
  onExit: () => void;
  onComplete: (selected: string[], voice: string) => void;
}

export function NewRepurposeScreen({ onExit, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [srcType, setSrcType] = useState('longvideo');
  const [selected, setSelected] = useState(['hooks', 'shorts', 'reel', 'xthread']);
  const [voice, setVoice] = useState('My main voice');
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);

  useEffect(() => {
    if (!generating) return;

    const interval = setInterval(() => {
      setGenProgress((p) => {
        if (p >= selected.length) {
          clearInterval(interval);
          setGenerating(false);
          setTimeout(() => onComplete(selected, voice), 500);
          return p;
        }
        return p + 1;
      });
    }, 620);

    return () => clearInterval(interval);
  }, [generating, selected, voice, onComplete]);

  const togglePlatform = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const toggleSelectAll = () => {
    if (selected.length === PLATFORMS.length) {
      setSelected([]);
    } else {
      setSelected(PLATFORMS.map((p) => p.id));
    }
  };

  if (step === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onExit} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <View style={styles.stepBars}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.stepBar, i <= step ? styles.stepBarActive : styles.stepBarInactive]} />
            ))}
          </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
          <Text style={styles.heading}>Add your input</Text>
          <Text style={styles.subheading}>Long video, short clip, transcript, caption, or a rough idea — we'll spin it into every format.</Text>

          <View style={styles.srcTabs}>
            {SRC_TYPES.map((t) => (
              <TouchableOpacity key={t.id} onPress={() => setSrcType(t.id)} style={[styles.srcTab, srcType === t.id ? styles.srcTabActive : styles.srcTabInactive]}>
                <Text style={styles.srcTabLabel}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Card style={styles.sourceCard}>
            <Text style={styles.sourceLabel}>Selected file</Text>
            <View style={styles.sourceInput}>
              <Text style={styles.sourceValue}>keynote-talk.mp4</Text>
              <View style={styles.sourceIndicator} />
            </View>
            <View style={styles.sourceConfirm}>
              <View style={styles.sourceCheckmark}>
                <Text>✓</Text>
              </View>
              <View>
                <Text style={styles.sourceTitle}>How I grew my newsletter</Text>
                <Text style={styles.sourceMeta}>Source ready · YouTube · 24:18</Text>
              </View>
            </View>
          </Card>

          <Button label="Choose formats" onPress={() => setStep(1)} style={{ marginTop: 12 }} />
        </ScrollView>
      </View>
    );
  }

  if (step === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onExit} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <View style={styles.stepBars}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.stepBar, i <= step ? styles.stepBarActive : styles.stepBarInactive]} />
            ))}
          </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
          <View style={styles.headingRow}>
            <View>
              <Text style={styles.heading}>Pick formats</Text>
              <Text style={styles.subheading}>{selected.length} selected</Text>
            </View>
            <TouchableOpacity onPress={toggleSelectAll}>
              <Text style={styles.selectAllLink}>{selected.length === PLATFORMS.length ? 'Clear all' : 'Select all'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.platformGrid}>
            {PLATFORMS.map((p) => {
              const isSelected = selected.includes(p.id);
              return (
                <TouchableOpacity key={p.id} onPress={() => togglePlatform(p.id)} style={[styles.platformCard, isSelected ? styles.platformCardSelected : styles.platformCardUnselected]}>
                  <View style={styles.platformTop}>
                    <View style={[styles.platformMono, isSelected ? styles.platformMonoSelected : styles.platformMonoUnselected]}>
                      <Text style={[styles.platformMonoText, isSelected ? styles.platformMonoTextSelected : styles.platformMonoTextUnselected]}>{p.mono}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.platformCheck}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.platformName}>{p.name}</Text>
                  <Text style={styles.platformSub}>{p.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.voiceSection}>
            <Text style={styles.voiceLabel}>Brand voice</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.voiceScroll}>
              {VOICES.map((v) => (
                <TouchableOpacity key={v} onPress={() => setVoice(v)} style={[styles.voiceChip, voice === v ? styles.voiceChipActive : styles.voiceChipInactive]}>
                  <Text style={[styles.voiceChipText, voice === v ? styles.voiceChipActiveText : styles.voiceChipInactiveText]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Button label={`Generate ${selected.length} outputs`} onPress={() => { setStep(2); setGenerating(true); setGenProgress(0); }} style={{ marginTop: 20 }} />
        </ScrollView>
      </View>
    );
  }

  if (step === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onExit} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <View style={styles.stepBars}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.stepBar, i <= step ? styles.stepBarActive : styles.stepBarInactive]} />
            ))}
          </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
          <View style={styles.generatingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.generatingTitle}>Repurposing…</Text>
            <Text style={styles.generatingSubtitle}>Adapting your source into {selected.length} platform-native formats</Text>
          </View>

          <View style={styles.genList}>
            {selected.map((id, i) => {
              const p = PLATFORMS.find((x) => x.id === id);
              const isDone = i < genProgress;
              const isActive = i === genProgress;

              return (
                <View key={id} style={[styles.genRow, isDone || isActive ? styles.genRowActive : styles.genRowInactive]}>
                  <View style={[styles.genMono, isDone || isActive ? styles.genMonoActive : styles.genMonoInactive]}>
                    <Text style={styles.genMonoText}>{p?.mono}</Text>
                  </View>
                  <Text style={[styles.genName, isDone || isActive ? { color: colors.text } : { color: colors.textFaint }]}>{p?.name}</Text>
                  {isDone && <Text style={styles.genCheck}>✓</Text>}
                  {isActive && <ActivityIndicator color={colors.accent} />}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 58, paddingBottom: 12 },
  closeButton: { width: 38, height: 38, borderRadius: 11, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { fontSize: 18, color: colors.textMuted },
  stepBars: { flex: 1, flexDirection: 'row', gap: 6 },
  stepBar: { flex: 1, height: 4, borderRadius: 99 },
  stepBarActive: { backgroundColor: colors.accent },
  stepBarInactive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  content: { flex: 1 },
  contentPadding: { padding: 20, paddingTop: 8 },
  heading: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 7, letterSpacing: -1 },
  subheading: { fontSize: 15, color: colors.textMuted, lineHeight: 21, marginBottom: 20 },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18, gap: 12 },
  selectAllLink: { fontSize: 14, fontWeight: '600', color: colors.accent, paddingBottom: 4 },
  srcTabs: { flexDirection: 'row', gap: 9, marginBottom: 20, flexWrap: 'wrap' },
  srcTab: { flex: 0.48, paddingVertical: 15, paddingHorizontal: 12, borderRadius: 15, alignItems: 'center' },
  srcTabActive: { backgroundColor: colors.accentBg, borderWidth: 1, borderColor: colors.accentBorder },
  srcTabInactive: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  srcTabLabel: { fontSize: 14.5, fontWeight: '600', color: colors.text },
  sourceCard: { padding: 16, marginBottom: 20 },
  sourceLabel: { fontSize: 13, color: colors.textDim, fontWeight: '500', marginBottom: 12 },
  sourceInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0e0e10', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 12 },
  sourceValue: { flex: 1, fontSize: 15, color: colors.text },
  sourceIndicator: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.accent },
  sourceConfirm: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingTop: 4 },
  sourceCheckmark: { width: 42, height: 42, borderRadius: 10, backgroundColor: colors.accentSubtle, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sourceTitle: { fontSize: 14.5, fontWeight: '600', color: colors.text },
  sourceMeta: { fontSize: 12.5, color: colors.textDim, marginTop: 2 },
  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  platformCard: { width: '48%', padding: 14, borderRadius: 16, borderWidth: 1 },
  platformCardSelected: { backgroundColor: colors.accentBg, borderColor: colors.accentBorder },
  platformCardUnselected: { backgroundColor: colors.card, borderColor: colors.border },
  platformTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  platformMono: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  platformMonoSelected: { backgroundColor: colors.accent },
  platformMonoUnselected: { backgroundColor: 'rgba(255,255,255,0.06)' },
  platformMonoText: { fontSize: 12.5, fontWeight: '700' },
  platformMonoTextSelected: { color: colors.accentOn },
  platformMonoTextUnselected: { color: colors.textMuted },
  platformCheck: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  checkmark: { fontSize: 13, color: colors.accentOn, fontWeight: '700' },
  platformName: { fontSize: 14.5, fontWeight: '600', color: colors.text, marginBottom: 3 },
  platformSub: { fontSize: 12, color: colors.textDim },
  voiceSection: { marginBottom: 20 },
  voiceLabel: { fontSize: 13, fontWeight: '600', color: colors.textFaint, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 9 },
  voiceScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  voiceChip: { paddingVertical: 11, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, marginRight: 8 },
  voiceChipActive: { backgroundColor: colors.accentBg, borderColor: colors.accentBorder },
  voiceChipInactive: { backgroundColor: colors.card, borderColor: colors.border },
  voiceChipText: { fontSize: 14, fontWeight: '600' },
  voiceChipActiveText: { color: colors.accent },
  voiceChipInactiveText: { color: colors.textMuted },
  generatingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 100, gap: 22 },
  generatingTitle: { fontSize: 24, fontWeight: '800', color: colors.text },
  generatingSubtitle: { fontSize: 14.5, color: colors.textDim, textAlign: 'center' },
  genList: { gap: 9 },
  genRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 15, paddingVertical: 14, borderRadius: 14 },
  genRowActive: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  genRowInactive: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: colors.borderSubtle },
  genMono: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  genMonoActive: { backgroundColor: colors.accentSubtle },
  genMonoInactive: { backgroundColor: 'rgba(255,255,255,0.05)' },
  genMonoText: { fontSize: 12, fontWeight: '700', color: colors.accent },
  genName: { flex: 1, fontSize: 15, fontWeight: '500' },
  genCheck: { fontSize: 14, color: colors.accent, fontWeight: '700' },
});
