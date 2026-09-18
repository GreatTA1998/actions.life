import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform, StatusBar as RNStatusBar, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import type { PersistedSession } from './src/models/types';
import type { TaskRepository } from './src/persistence/repository';
import { MemoryRepository } from './src/persistence/memoryRepository';
import { migrateUid } from './src/persistence/migrate';
import { openTaskRepository } from './src/persistence/openRepository';
import { restoreSession, signOut } from './src/services/authSession';
import { promoteLocalGuest } from './src/services/promoteGuest';
import { isLocalOnlyUid } from './src/services/syncMerge';
import { TaskTreeStore } from './src/services/taskStore';
import { AppShell } from './src/screens/AppShell';
import { SignInScreen } from './src/screens/SignInScreen';
import { ANDROID_STATUS_FALLBACK } from './src/safeArea';
import { colors } from './src/theme';

const fallbackMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: {
    top: Platform.OS === 'android' ? RNStatusBar.currentHeight || ANDROID_STATUS_FALLBACK : 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
};

export default function App() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [repo, setRepo] = useState<TaskRepository | null>(null);
  const [session, setSession] = useState<PersistedSession | null>(null);
  const [store, setStore] = useState<TaskTreeStore | null>(null);
  const [, setTick] = useState(0);
  const previousUid = useRef<string | null>(null);
  const memoryRepo = useRef(new MemoryRepository());
  const storeRef = useRef<TaskTreeStore | null>(null);
  const repoRef = useRef<TaskRepository | null>(null);
  repoRef.current = repo;

  useEffect(() => {
    let cancelled = false;
    void restoreSession().then((restored) => {
      if (cancelled) return;
      setSession(restored);
      setSessionChecked(true);
    });
    void openTaskRepository().then((opened) => {
      if (!cancelled) setRepo(opened.repo);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session) {
      storeRef.current = null;
      setStore(null);
      return;
    }

    const backing = repoRef.current ?? memoryRepo.current;

    if (storeRef.current?.uid !== session.uid) {
      const from = previousUid.current;
      const next = new TaskTreeStore(backing, session.uid);
      storeRef.current = next;
      setStore(next);
      previousUid.current = session.uid;
      void (async () => {
        if (from && from !== session.uid) {
          await migrateUid(backing, from, session.uid);
          if (repoRef.current && repoRef.current !== backing) {
            await migrateUid(repoRef.current, from, session.uid);
          }
        }
        await next.init();
        const disk = repoRef.current;
        if (disk && disk !== backing) await next.adoptRepository(disk);
        try {
          const promoted = await promoteLocalGuest(session, disk ?? backing);
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
    }

    const unsub = storeRef.current.subscribe(() => setTick((value) => value + 1));
    return () => {
      unsub();
    };
  }, [session?.uid]);

  useEffect(() => {
    if (!repo || !storeRef.current) return;
    void storeRef.current.adoptRepository(repo);
  }, [repo, store]);

  useEffect(() => {
    if (!store) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !isLocalOnlyUid(store.uid)) void store.syncNow();
    });
    return () => sub.remove();
  }, [store]);

  let body: ReactNode;
  if (!sessionChecked) {
    body = <View style={styles.boot} />;
  } else if (!session) {
    body = <SignInScreen onSession={setSession} />;
  } else if (!store) {
    body = <View style={styles.boot} />;
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
            storeRef.current = null;
            setStore(null);
            setSession(null);
          });
        }}
      />
    );
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics ?? fallbackMetrics}>
      {body}
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.listBg,
  },
});
