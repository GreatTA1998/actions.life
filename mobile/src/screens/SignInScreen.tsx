import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import type { PersistedSession } from '../models/types';
import {
  continueAsGuest,
  finishGoogleAuthSession,
  googleNativeConfigPresent,
  signInWithApple,
  signInWithGoogleNative,
  useGoogleAuthRequest,
} from '../services/authSession';
import { colors, type } from '../theme';

type Props = {
  onSession: (session: PersistedSession) => void;
};

export function SignInScreen({ onSession }: Props) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [request, , promptAsync] = useGoogleAuthRequest();

  async function run(label: string, action: () => Promise<PersistedSession>) {
    setBusy(true);
    setNotice('');
    try {
      const session = await action();
      onSession(session);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setNotice(message);
      if (message && message !== 'NATIVE_GOOGLE_UNAVAILABLE') {
        Alert.alert(label, message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    setNotice('');
    try {
      try {
        const session = await signInWithGoogleNative(null);
        onSession(session);
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message !== 'NATIVE_GOOGLE_UNAVAILABLE') throw error;
      }
      if (!request) {
        setNotice(
          'Google Sign-In is wired. Add iOS/Android OAuth client IDs (or a native Google Sign-In build) to enable it. Guest works offline now.',
        );
        return;
      }
      const result = await promptAsync();
      if (result.type !== 'success') return;
      const idToken =
        'params' in result && result.params && typeof result.params.id_token === 'string'
          ? result.params.id_token
          : undefined;
      const accessAuth = 'authentication' in result ? result.authentication : null;
      const token = idToken ?? accessAuth?.idToken;
      if (!token) {
        setNotice(
          'Google returned no ID token. Register native OAuth clients; do not use production actions.life/auth/callback.',
        );
        return;
      }
      onSession(await finishGoogleAuthSession(token, null));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setNotice(message);
      Alert.alert('Google', message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.kicker}>Planner</Text>
        <Text style={styles.title}>actions.life</Text>
        <Text style={styles.body}>
          A todo list next to a calendar. Every task can have nested subtasks. Opens offline and
          stays on this device until you sign in.
        </Text>

        <Pressable
          style={[styles.button, styles.primary]}
          onPress={() => void run('Guest', continueAsGuest)}
          disabled={busy}
        >
          <Text style={styles.primaryText}>Continue as guest</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => void onGoogle()} disabled={busy}>
          <Text style={styles.googleMark}>G</Text>
          <Text style={styles.buttonText}>Continue with Google</Text>
        </Pressable>

        {Platform.OS === 'ios' ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={22}
            style={styles.apple}
            onPress={() => void run('Apple', () => signInWithApple(null))}
          />
        ) : null}

        {busy ? <ActivityIndicator color={colors.accent} style={styles.spinner} /> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        {!googleNativeConfigPresent() ? (
          <Text style={styles.hint}>
            Live Google Sign-In waits on Firebase iOS/Android app + OAuth clients. The guest path
            is fully offline. Native Google never redirects to production actions.life/auth/callback.
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.listBg,
    justifyContent: 'center',
  },
  card: {
    padding: 28,
  },
  kicker: {
    color: colors.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontSize: type.micro,
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 12,
  },
  body: {
    color: colors.muted,
    fontSize: type.body,
    lineHeight: 22,
    marginBottom: 28,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingVertical: 14,
    marginBottom: 12,
    backgroundColor: colors.card,
  },
  primary: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  primaryText: {
    color: colors.card,
    fontWeight: '700',
    fontSize: type.body,
  },
  buttonText: {
    color: colors.ink,
    fontWeight: '600',
    fontSize: type.body,
  },
  googleMark: {
    fontWeight: '800',
    color: '#4285F4',
  },
  apple: {
    height: 48,
    marginBottom: 12,
  },
  spinner: {
    marginTop: 8,
  },
  notice: {
    marginTop: 12,
    color: colors.danger,
    fontSize: type.small,
  },
  hint: {
    marginTop: 18,
    color: colors.muted,
    fontSize: type.small,
    lineHeight: 18,
  },
});
