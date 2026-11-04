import { Platform } from 'react-native';
import type { PersistedSession } from '../models/types';
import { restoreAnonymousGuestSession } from './guestSession';

const SESSION_KEY = 'actions-life.session';
const GUEST_KEY = 'actions-life.device-guest-uid';
const LAST_ANON_KEY = 'actions-life.last-anonymous-session';
const SECURE_OPTIONS = { keychainService: 'life.actions.expo' };

async function asyncStorage() {
  return (await import('@react-native-async-storage/async-storage')).default;
}

async function kv() {
  if (Platform.OS !== 'web') {
    try {
      const SecureStore = await import('expo-secure-store');
      const durable = await asyncStorage();
      return {
        async getItem(key: string) {
          try {
            const value = await SecureStore.getItemAsync(key, SECURE_OPTIONS);
            if (value != null) return value;
          } catch {
            // Firebase Auth signOut can disturb the iOS keychain; fall back.
          }
          try {
            return await durable.getItem(key);
          } catch {
            return null;
          }
        },
        async setItem(key: string, value: string) {
          try {
            await SecureStore.setItemAsync(key, value, SECURE_OPTIONS);
          } catch {
            // still persist durably below
          }
          await durable.setItem(key, value);
        },
        async removeItem(key: string) {
          try {
            await SecureStore.deleteItemAsync(key, SECURE_OPTIONS);
          } catch {
            // ignore
          }
          try {
            await durable.removeItem(key);
          } catch {
            // ignore
          }
        },
      };
    } catch {
      // fall through to AsyncStorage
    }
  }
  return asyncStorage();
}

export { restoreAnonymousGuestSession } from './guestSession';

export async function loadLastAnonymousSession(): Promise<PersistedSession | null> {
  const durable = await asyncStorage();
  const raw = await durable.getItem(LAST_ANON_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as PersistedSession;
      return restoreAnonymousGuestSession({ lastAnonymous: parsed, deviceGuestUid: null });
    } catch {
      // fall through
    }
  }
  const uid = (await durable.getItem(GUEST_KEY)) ?? (await (await kv()).getItem(GUEST_KEY));
  return restoreAnonymousGuestSession({ lastAnonymous: null, deviceGuestUid: uid });
}

export async function saveLastAnonymousSession(session: PersistedSession): Promise<void> {
  if (!session.isAnonymous) return;
  const durable = await asyncStorage();
  await durable.setItem(LAST_ANON_KEY, JSON.stringify(session));
  await durable.setItem(GUEST_KEY, session.uid);
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
  if (session.isAnonymous) {
    await store.setItem(GUEST_KEY, session.uid);
    await saveLastAnonymousSession(session);
  }
}

export async function clearSession(): Promise<void> {
  const store = await kv();
  await store.removeItem(SESSION_KEY);
}

export async function loadOrCreateDeviceGuestUid(): Promise<string> {
  const last = await loadLastAnonymousSession();
  if (last?.uid) return last.uid;
  const uid = `guest-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  const durable = await asyncStorage();
  await durable.setItem(GUEST_KEY, uid);
  const store = await kv();
  await store.setItem(GUEST_KEY, uid);
  return uid;
}
