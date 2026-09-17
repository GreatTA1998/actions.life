import { Platform } from 'react-native';
import type { PersistedSession } from '../models/types';

const SESSION_KEY = 'actions-life.session';
const GUEST_KEY = 'actions-life.device-guest-uid';
const SECURE_OPTIONS = { keychainService: 'life.actions.expo' };

async function kv() {
  if (Platform.OS !== 'web') {
    try {
      const SecureStore = await import('expo-secure-store');
      return {
        async getItem(key: string) {
          try {
            return await SecureStore.getItemAsync(key, SECURE_OPTIONS);
          } catch {
            return null;
          }
        },
        async setItem(key: string, value: string) {
          try {
            await SecureStore.setItemAsync(key, value, SECURE_OPTIONS);
          } catch {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.setItem(key, value);
          }
        },
        async removeItem(key: string) {
          try {
            await SecureStore.deleteItemAsync(key, SECURE_OPTIONS);
          } catch {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.removeItem(key);
          }
        },
      };
    } catch {
      // fall through to AsyncStorage
    }
  }
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  return AsyncStorage;
}

export async function loadSession(): Promise<PersistedSession | null> {
  const store = await kv();
  const raw = await store.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return null;
  }
}

export async function saveSession(session: PersistedSession): Promise<void> {
  const store = await kv();
  await store.setItem(SESSION_KEY, JSON.stringify(session));
  // Sign-out only clears SESSION_KEY. Keep the anonymous inbox uid so
  // "Continue as guest" restores instead of minting an empty guest-* and reseeding.
  if (session.isAnonymous) {
    await store.setItem(GUEST_KEY, session.uid);
  }
}

export async function clearSession(): Promise<void> {
  const store = await kv();
  await store.removeItem(SESSION_KEY);
}

export async function loadOrCreateDeviceGuestUid(): Promise<string> {
  const store = await kv();
  const existing = await store.getItem(GUEST_KEY);
  if (existing) return existing;
  const uid = `guest-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  await store.setItem(GUEST_KEY, uid);
  return uid;
}
