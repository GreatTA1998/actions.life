import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, AppState, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { PersistedSession } from './src/models/types';
import type { TaskRepository } from './src/persistence/repository';
import { migrateUid } from './src/persistence/migrate';
import { openTaskRepository } from './src/persistence/openRepository';
import { restoreSession, signOut } from './src/services/authSession';
import { promoteLocalGuest } from './src/services/promoteGuest';
import { isLocalOnlyUid } from './src/services/syncMerge';
import { TaskTreeStore } from './src/services/taskStore';
import { AppShell } from './src/screens/AppShell';
import { SignInScreen } from './src/screens/SignInScreen';
import { colors } from './src/theme';

export default function App() {
  const [ready, setReady] = useState(false);
  const [repo, setRepo] = useState<TaskRepository | null>(null);
  const [session, setSession] = useState<PersistedSession | null>(null);
  const [store, setStore] = useState<TaskTreeStore | null>(null);
  const [, setTick] = useState(0);
  const previousUid = useRef<string | null>(null);

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
      if (!session) setStore(null);
      return;
    }
    let cancelled = false;
    let unsub = () => {};
    (async () => {
      if (previousUid.current && previousUid.current !== session.uid) {
        await migrateUid(repo, previousUid.current, session.uid);
      }
      previousUid.current = session.uid;
      if (cancelled) return;
      const next = new TaskTreeStore(repo, session.uid);
      unsub = next.subscribe(() => setTick((value) => value + 1));
      await next.init();
      if (cancelled) return;
      setStore(next);
      try {
        const promoted = await promoteLocalGuest(session, repo);
        if (cancelled) return;
        if (promoted.uid !== session.uid) {
          previousUid.current = promoted.uid;
          setSession(promoted);
          return;
        }
      } catch {
        // stay on local guest
      }
      if (!isLocalOnlyUid(next.uid)) void next.syncNow();
    })();
    return () => {
      cancelled = true;
      unsub();
    };
  }, [repo, session?.uid]);

  useEffect(() => {
    if (!store) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !isLocalOnlyUid(store.uid)) void store.syncNow();
    });
    return () => sub.remove();
  }, [store]);

  let body: ReactNode;
  if (!ready) {
    body = (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.bootText}>Opening inbox…</Text>
      </View>
    );
  } else if (!session) {
    body = <SignInScreen onSession={setSession} />;
  } else if (!store) {
    body = (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.bootText}>Loading your list…</Text>
      </View>
    );
  } else {
    body = (
      <AppShell
        key={store.uid}
        store={store}
        session={session}
        onSession={setSession}
        onSignOut={() => {
          void signOut(session).then(() => {
            previousUid.current = null;
            setStore(null);
            setSession(null);
          });
        }}
      />
    );
  }

  return (
    <SafeAreaProvider>
      {body}
      <StatusBar style="dark" />
    </SafeAreaProvider>
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
