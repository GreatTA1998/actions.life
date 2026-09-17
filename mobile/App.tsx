import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { PersistedSession } from './src/models/types';
import type { TaskRepository } from './src/persistence/repository';
import { openTaskRepository } from './src/persistence/openRepository';
import { restoreSession, signOut } from './src/services/authSession';
import { TaskTreeStore } from './src/services/taskStore';
import { HomeScreen } from './src/screens/HomeScreen';
import { SignInScreen } from './src/screens/SignInScreen';
import { colors } from './src/theme';

export default function App() {
  const [ready, setReady] = useState(false);
  const [repo, setRepo] = useState<TaskRepository | null>(null);
  const [session, setSession] = useState<PersistedSession | null>(null);
  const [store, setStore] = useState<TaskTreeStore | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [opened, restored] = await Promise.all([openTaskRepository(), restoreSession()]);
      if (cancelled) return;
      setRepo(opened.repo);
      setSession(restored);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!repo || !session) {
      setStore(null);
      return;
    }
    let cancelled = false;
    const next = new TaskTreeStore(repo, session.uid);
    const unsub = next.subscribe(() => setTick((value) => value + 1));
    void next.init().then(() => {
      if (!cancelled) setStore(next);
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [repo, session?.uid]);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.bootText}>Opening inbox…</Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  if (!session) {
    return (
      <>
        <SignInScreen onSession={setSession} />
        <StatusBar style="dark" />
      </>
    );
  }

  if (!store) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.bootText}>Loading your list…</Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <>
      <HomeScreen
        key={store.uid}
        store={store}
        email={session.email}
        onSignOut={() => {
          void signOut().then(() => {
            setStore(null);
            setSession(null);
          });
        }}
      />
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.listBg,
    gap: 12,
  },
  bootText: {
    color: colors.muted,
  },
});
