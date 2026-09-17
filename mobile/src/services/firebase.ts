const extra = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Constants = require('expo-constants').default as {
      expoConfig?: { extra?: { googleWebClientId?: string; googleIosClientId?: string; googleAndroidClientId?: string } };
    };
    return Constants.expoConfig?.extra ?? {};
  } catch {
    return {};
  }
})();

export const firebaseWebConfig = {
  apiKey: 'AIzaSyCOVm0X6UUQQcftXf066z_0hFk497j4dNY',
  authDomain: 'project-y-2a061.firebaseapp.com',
  projectId: 'project-y-2a061',
  storageBucket: 'project-y-2a061.appspot.com',
  messagingSenderId: '132745397287',
  appId: '1:132745397287:web:b34052fb4683bc85e73a02',
  measurementId: 'G-EZSLE84PYQ',
};

export const FIRESTORE_DATABASE_ID = 'schema-compliant';

export const googleAuthConfig = {
  webClientId:
    extra.googleWebClientId ??
    '132745397287-aakar5npr4orq496580pdgpvqeupf6j5.apps.googleusercontent.com',
  iosClientId: extra.googleIosClientId ?? '',
  androidClientId: extra.googleAndroidClientId ?? '',
};

let cached: { app: unknown; auth: unknown; db: unknown } | null = null;

export function googleNativeConfigPresent(): boolean {
  return Boolean(googleAuthConfig.iosClientId || googleAuthConfig.androidClientId);
}

export function peekFirebase(): {
  auth: import('firebase/auth').Auth;
  db: import('firebase/firestore').Firestore;
} | null {
  if (!cached) return null;
  return cached as {
    auth: import('firebase/auth').Auth;
    db: import('firebase/firestore').Firestore;
  };
}

export async function tryFirebase(): Promise<{
  auth: import('firebase/auth').Auth;
  db: import('firebase/firestore').Firestore;
} | null> {
  if (cached) {
    return cached as {
      auth: import('firebase/auth').Auth;
      db: import('firebase/firestore').Firestore;
    };
  }
  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const authModule = await import('firebase/auth');
    const { initializeAuth, getAuth } = authModule;
    const getReactNativePersistence = (
      authModule as typeof authModule & {
        getReactNativePersistence?: (storage: unknown) => unknown;
      }
    ).getReactNativePersistence;
    const { initializeFirestore } = await import('firebase/firestore');
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;

    const app = getApps()[0] ?? initializeApp(firebaseWebConfig);
    let auth: import('firebase/auth').Auth;
    try {
      if (!getReactNativePersistence) throw new Error('no-rn-persistence');
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage) as never,
      });
    } catch {
      auth = getAuth(app);
    }
    const db = initializeFirestore(app, { experimentalForceLongPolling: true }, FIRESTORE_DATABASE_ID);
    cached = { app, auth, db };
    return { auth, db };
  } catch {
    return null;
  }
}
