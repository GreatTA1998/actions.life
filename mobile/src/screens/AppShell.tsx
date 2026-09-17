import { useRef, useState } from 'react';
import { Modal, Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { TabBar, type AppTab } from '../components/TabBar';
import { todayISO } from '../dates';
import type { PersistedSession, TaskRecord } from '../models/types';
import {
  finishGoogleAuthSession,
  signInWithGoogleNative,
  useGoogleAuthRequest,
} from '../services/authSession';
import type { TaskTreeStore } from '../services/taskStore';
import { colors, type } from '../theme';
import { HomeScreen, type HomeScreenHandle } from './HomeScreen';
import { PhotosScreen } from './PhotosScreen';
import { RoutinesScreen } from './RoutinesScreen';
import { ScheduleScreen } from './ScheduleScreen';
import { SettingsScreen } from './SettingsScreen';
import { TaskDetailModal } from './TaskDetailModal';

type Props = {
  store: TaskTreeStore;
  session: PersistedSession;
  onSignOut: () => void;
  onSession: (session: PersistedSession) => void;
};

export function AppShell({ store, session, onSignOut, onSession }: Props) {
  const [tab, setTab] = useState<AppTab>('calendar');
  const [openId, setOpenId] = useState<string | null>(null);
  const [menuTask, setMenuTask] = useState<TaskRecord | null>(null);
  const [dragging, setDragging] = useState<TaskRecord | null>(null);
  const homeRef = useRef<HomeScreenHandle>(null);
  const [request, , promptAsync] = useGoogleAuthRequest();
  const openTask = openId ? store.task(openId) : undefined;
  const undo = store.lastUndo;

  async function linkGoogle() {
    try {
      try {
        onSession(await signInWithGoogleNative(session));
        void store.syncNow();
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message !== 'NATIVE_GOOGLE_UNAVAILABLE') throw error;
      }
      if (!request) throw new Error('Add iOS/Android Google OAuth client IDs to enable live Google Sign-In.');
      const result = await promptAsync();
      if (result.type !== 'success') return;
      const idToken =
        'params' in result && result.params && typeof result.params.id_token === 'string'
          ? result.params.id_token
          : result.authentication?.idToken;
      if (!idToken) throw new Error('Google returned no ID token.');
      onSession(await finishGoogleAuthSession(idToken, session));
      void store.syncNow();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setTab('settings');
      store.lastSyncReason = message;
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>actions.life</Text>
          <Text style={styles.sub}>{session.email || 'Guest'}</Text>
        </View>
        <Pressable onPress={onSignOut} hitSlop={8}>
          <Text style={styles.link}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        {tab === 'calendar' ? (
          <HomeScreen
            ref={homeRef}
            store={store}
            dragging={dragging}
            onDragStart={setDragging}
            onDragEnd={() => setDragging(null)}
            onOpen={setOpenId}
            onMenu={setMenuTask}
          />
        ) : null}
        {tab === 'schedule' ? <ScheduleScreen store={store} onOpenTask={setOpenId} /> : null}
        {tab === 'routines' ? <RoutinesScreen store={store} /> : null}
        {tab === 'photos' ? <PhotosScreen store={store} onOpenTask={setOpenId} /> : null}
        {tab === 'settings' ? (
          <SettingsScreen
            store={store}
            session={session}
            onSignOut={onSignOut}
            onLinkGoogle={() => void linkGoogle()}
          />
        ) : null}
      </View>

      {dragging && tab === 'calendar' ? (
        <Pressable
          style={styles.dragCatch}
          onPress={(event) => {
            homeRef.current?.dropAt(event.nativeEvent.pageX, event.nativeEvent.pageY, dragging);
            setDragging(null);
          }}
        />
      ) : null}

      {undo ? (
        <Pressable
          style={styles.undo}
          onPress={() => {
            void undo.run().then(() => store.clearUndo());
          }}
        >
          <Text style={styles.undoText}>{undo.label} — Undo</Text>
        </Pressable>
      ) : null}

      <TabBar tab={tab} onChange={setTab} />

      {openTask ? (
        <TaskDetailModal
          key={openTask.id}
          task={openTask}
          store={store}
          onClose={() => setOpenId(null)}
          onOpenTask={setOpenId}
        />
      ) : null}

      <Modal visible={!!menuTask} transparent animationType="fade" onRequestClose={() => setMenuTask(null)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuTask(null)}>
          <View style={styles.sheet}>
            {menuTask ? (
              <>
                <Text style={styles.sheetTitle}>{menuTask.name}</Text>
                <Action
                  label="Open details"
                  onPress={() => {
                    setOpenId(menuTask.id);
                    setMenuTask(null);
                  }}
                />
                <Action
                  label="Add subtask"
                  onPress={() => {
                    const parentId = menuTask.id;
                    setMenuTask(null);
                    void store.addSubtask(parentId, 'New subtask').then(() => {
                      const created = store.allTasks().filter((doc) => doc.parentID === parentId).at(-1);
                      if (created) setOpenId(created.id);
                    });
                  }}
                />
                <Action
                  label="Indent"
                  onPress={() => {
                    const id = menuTask.id;
                    setMenuTask(null);
                    void store.indent(id).then((ok) => {
                      if (!ok) {
                        Alert.alert(
                          'Indent',
                          'Put this task below another one at the same level, then Indent nests it underneath.',
                        );
                      }
                    });
                  }}
                />
                <Action
                  label="Outdent"
                  onPress={() => {
                    const id = menuTask.id;
                    setMenuTask(null);
                    void store.outdent(id).then((ok) => {
                      if (!ok) {
                        Alert.alert('Outdent', 'This task is already at the top level.');
                      }
                    });
                  }}
                />
                <Action
                  label="Move up"
                  onPress={() => {
                    const id = menuTask.id;
                    setMenuTask(null);
                    void store.moveAmongSiblings(id, -1).then((ok) => {
                      if (!ok) Alert.alert('Move up', 'This task is already first among its siblings.');
                    });
                  }}
                />
                <Action
                  label="Move down"
                  onPress={() => {
                    const id = menuTask.id;
                    setMenuTask(null);
                    void store.moveAmongSiblings(id, 1).then((ok) => {
                      if (!ok) Alert.alert('Move down', 'This task is already last among its siblings.');
                    });
                  }}
                />
                <Action
                  label="Schedule today"
                  onPress={() =>
                    void store
                      .schedule(menuTask.id, todayISO(), menuTask.startTime || '09:00')
                      .then(() => setMenuTask(null))
                  }
                />
                <Action
                  label="Drag to calendar"
                  onPress={() => {
                    setDragging(menuTask);
                    setMenuTask(null);
                    setTab('calendar');
                  }}
                />
                <Action
                  label={menuTask.onList ? 'Archive' : 'Unarchive'}
                  onPress={() =>
                    void (menuTask.onList ? store.archive(menuTask.id) : store.unarchive(menuTask.id)).then(() =>
                      setMenuTask(null),
                    )
                  }
                />
              </>
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.action}>
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navbar },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  brand: { color: colors.ink, fontSize: type.body, fontWeight: '700' },
  sub: { color: colors.muted, fontSize: type.micro, marginTop: 2 },
  link: { color: colors.accent, fontWeight: '600' },
  body: { flex: 1 },
  dragCatch: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
  },
  undo: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: colors.ink,
    borderRadius: 10,
    padding: 12,
    zIndex: 30,
  },
  undoText: { color: colors.card, textAlign: 'center', fontWeight: '600' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.navbar,
    padding: 16,
    paddingBottom: 28,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetTitle: { fontSize: type.body, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  action: { paddingVertical: 12 },
  actionText: { fontSize: type.body, color: colors.ink },
});
