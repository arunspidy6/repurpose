import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, PROJECTS, PLATFORMS } from '../data/constants';
import { Card } from '../components/Card';
import { MonoChip } from '../components/MonoChip';

interface Props {
  onSelectProject: (project: any) => void;
  projects?: any[];
}

const FILTERS = ['All', 'TikTok', 'Instagram', 'Reels', 'Shorts', 'X', 'LinkedIn'];

export function LibraryScreen({ onSelectProject, projects = PROJECTS }: Props) {
  const [filter, setFilter] = useState('All');
  const getPlatform = (id: string) => PLATFORMS.find((p) => p.id === id);
  const filtered = filter === 'All'
    ? projects
    : projects.filter((p) => (p.formats ?? []).some((f: string) => getPlatform(f)?.name === filter));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Library</Text>

      <View style={styles.searchBox}>
        <Text style={styles.searchPlaceholder}>🔍 Search sources & outputs</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f ? styles.filterActive : styles.filterInactive]}>
            <Text style={[styles.filterText, filter === f ? styles.filterActiveText : styles.filterInactiveText]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.list}>
        {filtered.map((project) => (
          <TouchableOpacity key={project.id} onPress={() => onSelectProject(project)} activeOpacity={0.7}>
            <Card style={styles.item}>
              <View style={styles.itemContent}>
                <View style={styles.playIcon}>
                  <Text style={styles.playSymbol}>▶</Text>
                </View>
                <View style={styles.itemText}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {project.title}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {project.src} · {project.outputs} outputs
                  </Text>
                </View>
                <Text style={styles.itemDate}>{project.date}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 20 },
  title: { fontSize: 30, fontWeight: '800', color: colors.text, marginBottom: 18, letterSpacing: -1.1 },
  searchBox: { height: 46, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', paddingHorizontal: 14, marginBottom: 18 },
  searchPlaceholder: { fontSize: 15, color: colors.textDim },
  filtersScroll: { marginBottom: 18 },
  filterChip: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 11, marginRight: 8, borderWidth: 1 },
  filterActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterInactive: { backgroundColor: colors.card, borderColor: colors.border },
  filterText: { fontSize: 14, fontWeight: '600' },
  filterActiveText: { color: colors.accentOn },
  filterInactiveText: { color: colors.textMuted },
  list: { gap: 11 },
  item: { padding: 15, flexDirection: 'row', alignItems: 'center', gap: 13 },
  itemContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 13 },
  playIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  playSymbol: { fontSize: 18, color: colors.textMuted },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 15.5, fontWeight: '600', color: colors.text },
  itemMeta: { fontSize: 12.5, color: colors.textDim, marginTop: 4 },
  itemDate: { fontSize: 12.5, color: colors.textFaint, flexShrink: 0 },
});
