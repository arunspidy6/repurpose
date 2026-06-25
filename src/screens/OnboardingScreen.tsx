import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { colors, PLATFORMS, SAMPLE_POSTS, VOICE_TRAITS } from '../data/constants';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { MonoChip } from '../components/MonoChip';

interface Props {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 1700);
  };

  if (step === 0) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.heroChipsContainer}>
          <View style={styles.heroGrid}>
            {PLATFORMS.slice(0, 8).map((p, i) => (
              <MonoChip key={p.id} mono={p.mono} accent={i % 3 === 0} size={44} />
            ))}
          </View>
        </View>

        <View style={styles.textSection}>
          <Text style={styles.title}>Repurpose</Text>
          <Text style={styles.subtitle}>
            One idea in. Every format out. Your content variation engine — turn any video, clip, caption, or rough idea into platform-native content.
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <Button label="Get started" onPress={() => setStep(1)} />
          <Button
            label="I'll set up my voice later"
            variant="ghost"
            size="md"
            onPress={onComplete}
            style={{ marginTop: 8 }}
          />
        </View>
      </ScrollView>
    );
  }

  if (step === 1) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.step}>Step 1 of 2 · Brand voice</Text>
          <Text style={styles.heading}>Teach it how you write</Text>
          <Text style={styles.description}>
            Paste 3–5 posts you're proud of. Repurpose learns your tone, length, and CTA habits — then writes everything in your voice.
          </Text>
        </View>

        <View style={styles.postsContainer}>
          {SAMPLE_POSTS.map((post, i) => (
            <Card key={i} style={styles.postCard}>
              <View style={styles.postNumber}>
                <Text style={styles.postNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.postText}>{post}</Text>
            </Card>
          ))}
          <Button label="+ Paste another post" variant="secondary" size="md" onPress={() => {}} />
        </View>

        <Button
          label="Analyze my voice"
          onPress={handleAnalyze}
          style={{ marginTop: 20, marginBottom: 20 }}
        />
      </ScrollView>
    );
  }

  if (step === 2) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {analyzing ? (
          <View style={styles.analyzingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.analyzingTitle}>Reading your voice…</Text>
            <Text style={styles.analyzingSubtitle}>Finding tone, rhythm, and your go-to CTAs</Text>
          </View>
        ) : (
          <>
            <View style={styles.resultHeader}>
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
              <Text style={styles.heading}>Here's your voice</Text>
              <Text style={styles.description}>We'll write every output to match this. Edit it anytime in Settings.</Text>
            </View>

            <View style={styles.traitsContainer}>
              {VOICE_TRAITS.map((trait, i) => (
                <Card key={i} style={styles.traitCard}>
                  <View style={styles.traitRow}>
                    <Text style={styles.traitLabel}>{trait.label}</Text>
                    <Text style={styles.traitValue}>{trait.value}</Text>
                  </View>
                </Card>
              ))}
            </View>

            <Button label="Save brand voice" onPress={onComplete} style={{ marginTop: 20, marginBottom: 20 }} />
          </>
        )}
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 40 },
  heroChipsContainer: { alignItems: 'center', marginBottom: 40 },
  heroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 9,
    width: 200,
  },
  textSection: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 40, fontWeight: '800', color: colors.text, marginBottom: 16 },
  subtitle: { fontSize: 15.5, lineHeight: 22, color: colors.textMuted, textAlign: 'center', marginBottom: 12 },
  buttonGroup: { gap: 12 },
  header: { marginBottom: 24 },
  step: { fontSize: 13, fontWeight: '700', color: colors.accent, textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 8 },
  heading: { fontSize: 30, fontWeight: '800', color: colors.text, marginBottom: 8, letterSpacing: -1 },
  description: { fontSize: 15.5, lineHeight: 22, color: colors.textMuted },
  postsContainer: { gap: 11, marginBottom: 20 },
  postCard: { flexDirection: 'row', gap: 12, padding: 14 },
  postNumber: { width: 26, height: 26, borderRadius: 8, backgroundColor: colors.accentSubtle, alignItems: 'center', justifyContent: 'center' },
  postNumberText: { fontSize: 12, fontWeight: '700', color: colors.accent },
  postText: { flex: 1, fontSize: 14, lineHeight: 21, color: 'rgba(244,244,246,0.78)' },
  analyzingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 100, gap: 22 },
  analyzingTitle: { fontSize: 21, fontWeight: '700', color: colors.text },
  analyzingSubtitle: { fontSize: 14.5, color: colors.textDim, textAlign: 'center' },
  resultHeader: { marginBottom: 24 },
  checkmark: { width: 46, height: 46, borderRadius: 13, backgroundColor: colors.accentSubtle, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  checkmarkText: { fontSize: 24, color: colors.accent },
  traitsContainer: { gap: 10, marginBottom: 20 },
  traitCard: { padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  traitRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  traitLabel: { fontSize: 14, color: colors.textDim, fontWeight: '500' },
  traitValue: { fontSize: 14.5, color: colors.text, fontWeight: '600', textAlign: 'right' },
});
