import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { colors } from '../data/constants';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';

interface Props {
  onAuthed: () => void;
  onBack?: () => void;
}

export function AuthScreen({ onAuthed, onBack }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmSent, setConfirmSent] = useState(false);

  const submit = async () => {
    setError('');
    if (!email.trim() || password.length < 6) {
      setError('Enter an email and a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        // If email confirmation is on, there's no session yet.
        if (!data.session) { setConfirmSent(true); return; }
        onAuthed();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        onAuthed();
      }
    } catch (e) {
      setError((e as Error).message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  if (confirmSent) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.mailIcon}><Text style={{ fontSize: 26 }}>✉️</Text></View>
          <Text style={styles.title}>Confirm your email</Text>
          <Text style={styles.subtitle}>
            We sent a confirmation link to <Text style={styles.bold}>{email.trim()}</Text>. Open it to activate your account, then sign in.
          </Text>
          <Button label="Back to sign in" onPress={() => { setConfirmSent(false); setMode('signin'); setPassword(''); }} style={{ marginTop: 8 }} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.logoRow}>
            <View style={styles.logo}><Text style={styles.logoText}>R</Text></View>
            <Text style={styles.brand}>Repurpose</Text>
          </View>

          <Text style={styles.title}>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</Text>
          <Text style={styles.subtitle}>
            {mode === 'signin' ? 'Sign in to keep repurposing.' : '10 free repurposes every month. Your content, your account.'}
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@studio.com"
            placeholderTextColor={colors.textDim}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textDim}
            secureTextEntry
            style={styles.input}
          />

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            label={busy ? '' : mode === 'signin' ? 'Sign in' : 'Create account'}
            onPress={submit}
            disabled={busy}
            style={{ marginTop: 18 }}
          />
          {busy && <ActivityIndicator color={colors.accent} style={{ marginTop: -38, marginBottom: 18 }} />}

          <TouchableOpacity
            onPress={() => { setError(''); setMode(mode === 'signin' ? 'signup' : 'signin'); }}
            style={styles.switchRow}
          >
            <Text style={styles.switchText}>
              {mode === 'signin' ? 'New to Repurpose? ' : 'Already have an account? '}
              <Text style={styles.switchLink}>{mode === 'signin' ? 'Create an account' : 'Sign in'}</Text>
            </Text>
          </TouchableOpacity>

          {onBack && (
            <TouchableOpacity onPress={onBack} style={{ marginTop: 6, alignSelf: 'center' }}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.bg },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  logo: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontWeight: '800', color: colors.accentOn, fontSize: 17 },
  brand: { fontWeight: '700', fontSize: 17, color: colors.text },
  mailIcon: { width: 46, height: 46, borderRadius: 13, backgroundColor: colors.accentSubtle, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 23, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 20, color: colors.textMuted, marginBottom: 20 },
  bold: { color: colors.text, fontWeight: '600' },
  label: { fontSize: 12.5, color: colors.textMuted, marginBottom: 6, marginTop: 12 },
  input: { height: 48, backgroundColor: '#0e0e10', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 14, color: colors.text, fontSize: 15 },
  errorBox: { marginTop: 14, padding: 11, borderRadius: 10, backgroundColor: 'rgba(255,80,80,0.1)', borderWidth: 1, borderColor: 'rgba(255,80,80,0.3)' },
  errorText: { color: '#ffb4b4', fontSize: 12.5 },
  switchRow: { marginTop: 18, alignItems: 'center' },
  switchText: { fontSize: 13.5, color: colors.textMuted },
  switchLink: { color: colors.accent, fontWeight: '600' },
  backText: { fontSize: 13.5, color: colors.textDim },
});
