import { NativeModules, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import type { PersistedSession } from '../models/types';
import { googleAuthConfig, googleNativeConfigPresent, tryFirebase } from './firebase';
import {
  clearSession,
  loadOrCreateDeviceGuestUid,
  loadSession,
  saveSession,
} from '../persistence/sessionStore';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuthRequest() {
  const iosClientId = googleAuthConfig.iosClientId || googleAuthConfig.webClientId || undefined;
  const androidClientId =
    googleAuthConfig.androidClientId || googleAuthConfig.webClientId || undefined;
  return Google.useAuthRequest({
    clientId: googleAuthConfig.webClientId || undefined,
    webClientId: googleAuthConfig.webClientId || undefined,
    iosClientId,
    androidClientId,
    scopes: ['openid', 'email'],
    redirectUri: AuthSession.makeRedirectUri({ scheme: 'actionslife', path: 'auth' }),
  });
}

function nativeGoogleAvailable(): boolean {
  return Boolean((NativeModules as { RNGoogleSignin?: unknown }).RNGoogleSignin);
}

async function idTokenFromNativeGoogle(): Promise<string> {
  const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
  GoogleSignin.configure({
    webClientId: googleAuthConfig.webClientId,
    iosClientId: googleAuthConfig.iosClientId || googleAuthConfig.webClientId || undefined,
  });
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  const idToken =
    'data' in response && response.data
      ? response.data.idToken
      : (response as { idToken?: string | null }).idToken;
  if (!idToken) throw new Error('Google Sign-In returned no ID token.');
  return idToken;
}

async function applyGoogleIdToken(idToken: string, current: PersistedSession | null): Promise<PersistedSession> {
  const firebase = await tryFirebase();
  if (!firebase) {
    throw new Error(
      'Google Sign-In is wired, but Firebase is not initialized on this build. Add the iOS/Android Firebase apps and rebuild.',
    );
  }
  const { GoogleAuthProvider, linkWithCredential, signInWithCredential } = await import('firebase/auth');
  const credential = GoogleAuthProvider.credential(idToken);
  try {
    if (current?.isAnonymous && firebase.auth.currentUser) {
      const result = await linkWithCredential(firebase.auth.currentUser, credential);
      const session: PersistedSession = {
        uid: result.user.uid,
        email: result.user.email ?? '',
        isAnonymous: false,
        provider: 'google',
      };
      await saveSession(session);
      return session;
    }
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code !== 'auth/credential-already-in-use' && code !== 'auth/provider-already-linked') {
      throw error;
    }
  }
  const result = await signInWithCredential(firebase.auth, credential);
  const session: PersistedSession = {
    uid: result.user.uid,
    email: result.user.email ?? '',
    isAnonymous: false,
    provider: 'google',
  };
  await saveSession(session);
  return session;
}

export async function restoreSession(): Promise<PersistedSession | null> {
  const local = await loadSession();
  if (local) return local;
  return null;
}

export async function continueAsGuest(): Promise<PersistedSession> {
  // Always mint a local guest UID immediately. Firebase anonymous promotion
  // happens after first paint so the UI never waits on the network.
  const uid = await loadOrCreateDeviceGuestUid();
  const session: PersistedSession = {
    uid,
    email: '',
    isAnonymous: true,
    provider: 'anonymous',
  };
  await saveSession(session);
  return session;
}

export async function signInWithGoogleNative(current: PersistedSession | null): Promise<PersistedSession> {
  if (!nativeGoogleAvailable()) {
    throw new Error('NATIVE_GOOGLE_UNAVAILABLE');
  }
  const idToken = await idTokenFromNativeGoogle();
  return applyGoogleIdToken(idToken, current);
}

export async function finishGoogleAuthSession(
  idToken: string,
  current: PersistedSession | null,
): Promise<PersistedSession> {
  return applyGoogleIdToken(idToken, current);
}

export async function signInWithApple(current: PersistedSession | null): Promise<PersistedSession> {
  if (Platform.OS !== 'ios') {
    throw new Error('Sign in with Apple is available on iOS.');
  }
  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) throw new Error('Sign in with Apple is not available on this device.');

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  const firebase = await tryFirebase();
  if (firebase && credential.identityToken) {
    const { OAuthProvider, linkWithCredential, signInWithCredential } = await import('firebase/auth');
    const provider = new OAuthProvider('apple.com');
    const firebaseCredential = provider.credential({ idToken: credential.identityToken });
    try {
      if (current?.isAnonymous && firebase.auth.currentUser) {
        const result = await linkWithCredential(firebase.auth.currentUser, firebaseCredential);
        const session: PersistedSession = {
          uid: result.user.uid,
          email: result.user.email ?? credential.email ?? '',
          isAnonymous: false,
          provider: 'apple',
        };
        await saveSession(session);
        return session;
      }
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== 'auth/credential-already-in-use' && code !== 'auth/provider-already-linked') {
        throw error;
      }
    }
    const result = await signInWithCredential(firebase.auth, firebaseCredential);
    const session: PersistedSession = {
      uid: result.user.uid,
      email: result.user.email ?? credential.email ?? '',
      isAnonymous: false,
      provider: 'apple',
    };
    await saveSession(session);
    return session;
  }

  const session: PersistedSession = {
    uid: `apple-${credential.user}`,
    email: credential.email ?? '',
    isAnonymous: false,
    provider: 'apple',
  };
  await saveSession(session);
  return session;
}

export async function signOut(): Promise<void> {
  try {
    const firebase = await tryFirebase();
    if (firebase) await firebase.auth.signOut();
  } catch {
    // local session is still cleared
  }
  try {
    if (nativeGoogleAvailable()) {
      const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
      await GoogleSignin.signOut();
    }
  } catch {
    // ignore
  }
  await clearSession();
}

export { googleNativeConfigPresent };
