import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, PROJECTS, PLATFORMS } from '../data/constants';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { MonoChip } from '../components/MonoChip';

interface Props {
  onNewRepurpose: () => void;
  onViewLibrary: () => void;
  onSelectProject: (project: any) => void;
  projects?: any[];
}

export function HomeScreen({ onNewRepurpose, onViewLibrary, onSelectProject, projects = PROJECTS }: Props) {
  const recentProjects = projects.slice(0, 4);
  const getPlatform = (id: string) => PLATFORMS.find((p) => p.id === id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning, Maya</Text>
          <Text style={styles.title}>Repurpose</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>M</Text>
        </View>
      </View>

      <Card style={styles.usageCard}>
        <View style={styles.usageHeader}>
          <Text style={styles.usageLabel}>Free plan · this month</Text>
          <Text style={styles.upgradeLink}>Upgrade</Text>
        </View>
        <View style={styles.usageContent}>
          <Text style={styles.usageNumber}>3</Text>
          <Text style={styles.usageText}>of 5 repurposes used</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '60%' }]} />
        </View>
      </Card>

      <Button label="+ New repurpose" onPress={onNewRepurpose} style={{ marginBottom: 24 }} />

      <View style={styles.recentSection}>
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent projects</Text>
          <TouchableOpacity onPress={onViewLibrary}>
            <Text style={styles.seeAllLink}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.projectsList}>
          {recentProjects.map((project) => (
            <TouchableOpacity key={project.id} onPress={() => onSelectProject(project)} activeOpacity={0.7}>
              <Card style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <View>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <Text style={styles.projectSrc}>{project.src}</Text>
                  </View>
                  <View style={[styles.statusBadge, project.status === 'Ready' ? styles.statusReady : styles.statusDraft]}>
                    <Text style={[styles.statusText, project.status === 'Ready' ? styles.statusReadyText : styles.statusDraftText]}>
                      {project.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.projectFooter}>
                  <View style={styles.chips}>
                    {project.formats.slice(0, 4).map((fmt: string, i: number) => (
                      <MonoChip key={fmt} mono={getPlatform(fmt)?.mono || ''} accent={i === 0} size={20} />
                    ))}
                  </View>
                  <Text style={styles.projectMeta}>
                    {project.outputs} outputs · {project.date}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, marginTop: 20 },
  greeting: { fontSize: 14, color: colors.textDim, fontWeight: '500', marginBottom: 3 },
  title: { fontSize: 27, fontWeight: '800', color: colors.text, letterSpacing: -0.9 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '700', color: colors.accentOn },
  usageCard: { padding: 16, marginBottom: 24 },
  usageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  usageLabel: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
  upgradeLink: { fontSize: 13, fontWeight: '600', color: colors.accent },
  usageContent: { marginBottom: 12 },
  usageNumber: { fontSize: 26, fontWeight: '800', color: colors.text },
  usageText: { fontSize: 14, color: colors.textDim },
  progressBar: { height: 7, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 99 },
  recentSection: { marginBottom: 20 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, letterSpacing: -0.4 },
  seeAllLink: { fontSize: 14, color: colors.textDim },
  projectsList: { gap: 11 },
  projectCard: { padding: 15 },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  projectTitle: { fontSize: 16, fontWeight: '600', color: colors.text, lineHeight: 20 },
  projectSrc: { fontSize: 13, color: colors.textDim, marginTop: 5 },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 7 },
  statusReady: { backgroundColor: colors.accentSubtle },
  statusDraft: { backgroundColor: 'rgba(255,255,255,0.07)' },
  statusText: { fontSize: 11.5, fontWeight: '600' },
  statusReadyText: { color: colors.accent },
  statusDraftText: { color: colors.textDim },
  projectFooter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chips: { flexDirection: 'row', marginRight: -3 },
  projectMeta: { fontSize: 12.5, color: colors.textFaint },
});
