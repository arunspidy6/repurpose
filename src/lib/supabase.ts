import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

// Persist the auth session in the device keychain/keystore (encrypted at rest)
// rather than plain AsyncStorage. On web, fall back to localStorage.
const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const webStorage = {
  getItem: async (key: string) => (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null),
  setItem: async (key: string, value: string) => { if (typeof localStorage !== 'undefined') localStorage.setItem(key, value); },
  removeItem: async (key: string) => { if (typeof localStorage !== 'undefined') localStorage.removeItem(key); },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: Platform.OS === 'web' ? webStorage : SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
