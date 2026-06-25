import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../data/constants';

interface Props {
  mono: string;
  accent?: boolean;
  size?: number;
}

export function MonoChip({ mono, accent = false, size = 24 }: Props) {
  return (
    <View style={[styles.chip, { width: size, height: size, borderRadius: size * 0.29 },
      accent ? styles.accent : styles.default]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }, accent ? styles.accentText : styles.defaultText]}>
        {mono}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  accent: { backgroundColor: colors.accent },
  default: { backgroundColor: '#2a2a2e' },
  text: { fontWeight: '700' },
  accentText: { color: colors.accentOn },
  defaultText: { color: 'rgba(244,244,246,0.7)' },
});
