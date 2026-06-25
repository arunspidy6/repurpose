import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../data/constants';

interface Props {
  onPress: () => void;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  disabled?: boolean;
}

export function Button({ onPress, label, variant = 'primary', size = 'lg', style, disabled }: Props) {
  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 12, minHeight: 32 },
    md: { paddingVertical: 12, paddingHorizontal: 16, minHeight: 44 },
    lg: { paddingVertical: 16, paddingHorizontal: 20, minHeight: 54 },
  };

  const variantStyles = {
    primary: { backgroundColor: colors.accent },
    secondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent' },
  };

  const textColors = {
    primary: colors.accentOn,
    secondary: colors.text,
    ghost: colors.textMuted,
  };

  const textSizes = { sm: 13, md: 15, lg: 17 };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        { opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColors[variant], fontSize: textSizes[size], fontWeight: variant === 'primary' ? '700' : '600' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: 'System' },
});
