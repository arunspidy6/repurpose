import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { colors, PLATFORMS, OUTPUTS } from '../data/constants';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

interface Props {
  title: string;
  voice: string;
  selected: string[];
  saved?: boolean;
  onSave?: () => void;
  onExit: () => void;
}

export function ResultsScreen({ title, voice, selected, saved = false, onSave, onExit }: Props) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [toast, setToast] = useState('');

  const getPlatform = (id: string) => PLATFORMS.find((p) => p.id === id);

  const openEditor = (id: string) => {
    setEditingId(id);
    setEditText(OUTPUTS[id] || '');
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingId(null);
    setEditText('');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1700);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.headerMeta}>
            {selected.length} outputs · {voice}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (saved) { showToast('Already in your library'); return; }
            onSave?.();
            showToast('Saved to library');
          }}
          style={[styles.saveButton, saved && styles.saveButtonDone]}
        >
          <Text style={[styles.saveButtonText, saved && styles.saveButtonTextDone]}>{saved ? '✓ Saved' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentPadding}>
        {selected.map((id) => {
          const p = getPlatform(id);
          const preview = OUTPUTS[id] || '';

          return (
            <TouchableOpacity key={id} onPress={() => openEditor(id)} activeOpacity={0.7}>
              <Card style={styles.outputCard}>
                <View style={styles.outputHeader}>
                  <View style={styles.outputMono}>
                    <Text style={styles.outputMonoText}>{p?.mono}</Text>
                  </View>
                  <View style={styles.outputInfo}>
                    <Text style={styles.outputName}>{p?.name}</Text>
                    <Text style={styles.outputSub}>{p?.sub}</Text>
                  </View>
                  <TouchableOpacity onPress={() => { showToast('Copied to clipboard'); }} style={styles.copyButton}>
                    <Text style={styles.copyIcon}>📋</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.outputPreview} numberOfLines={4}>
                  {preview}
                </Text>
                <View style={styles.outputFooter}>
                  <Text style={styles.tapToEdit}>Tap to edit</Text>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Send to scheduler" variant="secondary" size="md" onPress={() => showToast('Sent to your scheduler')} style={{ flex: 1 }} />
        <Button label="Export all" onPress={() => showToast(`Exported ${selected.length} outputs`)} style={{ flex: 1, marginLeft: 10 }} />
      </View>

      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastIcon}>✓</Text>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      <Modal visible={editorOpen} animationType="slide" transparent onRequestClose={closeEditor}>
        <View style={styles.editorOverlay}>
          <TouchableOpacity style={styles.editorBackdrop} onPress={closeEditor} activeOpacity={1} />
          <View style={styles.editorSheet}>
            <View style={styles.dragHandle} />

            <View style={styles.editorHeader}>
              <View style={styles.editorMono}>
                <Text style={styles.editorMonoText}>{getPlatform(editingId || '')?.mono}</Text>
              </View>
              <View style={styles.editorInfo}>
                <Text style={styles.editorName}>{getPlatform(editingId || '')?.name}</Text>
                <Text style={styles.editorSub}>{getPlatform(editingId || '')?.sub}</Text>
              </View>
              <TouchableOpacity onPress={closeEditor} style={styles.editorClose}>
                <Text style={styles.editorCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput value={editText} onChangeText={setEditText} multiline placeholder="Edit your content..." placeholderTextColor={colors.textDim} style={styles.editorInput} />

            <View style={styles.editorFooter}>
              <TouchableOpacity onPress={() => showToast('Generating a new variation…')} style={styles.editorRegenerateButton}>
                <Text style={styles.editorRegenerateIcon}>🔄</Text>
              </TouchableOpacity>
              <Button label="Share" variant="secondary" size="md" onPress={() => showToast('Opening share sheet…')} style={{ flex: 1, marginHorizontal: 8 }} />
              <Button label="Copy" onPress={() => { showToast('Copied to clipboard'); }} style={{ flex: 1.4 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 58, paddingBottom: 14, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.06)' },
  backButton: { width: 38, height: 38, borderRadius: 11, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, color: colors.textMuted },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  headerMeta: { fontSize: 12.5, color: colors.textDim, marginTop: 1 },
  saveButton: { height: 36, paddingHorizontal: 15, borderRadius: 11, backgroundColor: colors.accentSubtle, alignItems: 'center', justifyContent: 'center' },
  saveButtonDone: { backgroundColor: 'rgba(255,255,255,0.06)' },
  saveButtonText: { fontSize: 14, fontWeight: '600', color: colors.accent },
  saveButtonTextDone: { color: colors.textDim },
  content: { flex: 1 },
  contentPadding: { padding: 20, paddingBottom: 120 },
  outputCard: { padding: 16, marginBottom: 12 },
  outputHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 12 },
  outputMono: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  outputMonoText: { fontSize: 12.5, fontWeight: '700', color: colors.textMuted },
  outputInfo: { flex: 1 },
  outputName: { fontSize: 15.5, fontWeight: '600', color: colors.text },
  outputSub: { fontSize: 12, color: colors.textFaint, marginTop: 2 },
  copyButton: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  copyIcon: { fontSize: 16 },
  outputPreview: { fontSize: 13.5, lineHeight: 21, color: 'rgba(244,244,246,0.62)', marginBottom: 12 },
  outputFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tapToEdit: { fontSize: 12, color: colors.textFaint },
  chevron: { fontSize: 13, color: colors.textFaint },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 10, padding: 20, paddingBottom: 32, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border },
  toast: { position: 'absolute', bottom: 108, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#1f1f22', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 13, paddingHorizontal: 18, paddingVertical: 12 },
  toastIcon: { fontSize: 17, color: colors.accent },
  toastText: { fontSize: 14.5, fontWeight: '600', color: colors.text },
  editorOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  editorBackdrop: { flex: 1 },
  editorSheet: { height: '90%', backgroundColor: colors.cardAlt, borderTopLeftRadius: 26, borderTopRightRadius: 26, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', flexDirection: 'column' },
  dragHandle: { width: 38, height: 5, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.18)', alignSelf: 'center', marginTop: 11, marginBottom: 4 },
  editorHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.07)' },
  editorMono: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.accentSubtle, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  editorMonoText: { fontSize: 12.5, fontWeight: '700', color: colors.accent },
  editorInfo: { flex: 1 },
  editorName: { fontSize: 16, fontWeight: '700', color: colors.text },
  editorSub: { fontSize: 12.5, color: colors.textDim, marginTop: 1 },
  editorClose: { width: 32, height: 32, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  editorCloseIcon: { fontSize: 15, color: colors.textMuted },
  editorInput: { flex: 1, paddingHorizontal: 20, paddingVertical: 16, color: colors.text, fontSize: 15.5, lineHeight: 24 },
  editorFooter: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.07)' },
  editorRegenerateButton: { width: 50, height: 50, borderRadius: 14, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  editorRegenerateIcon: { fontSize: 20 },
});
