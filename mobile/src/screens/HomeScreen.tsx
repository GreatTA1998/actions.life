import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Inbox } from '../components/Inbox';
import { DayCalendar } from '../components/DayCalendar';
import { SplitPane } from '../components/SplitPane';
import { todayISO } from '../dates';
import type { TaskRecord } from '../models/types';
import type { TaskTreeStore } from '../services/taskStore';
import { colors, type } from '../theme';
import { TaskDetailModal } from './TaskDetailModal';

type Props = {
  store: TaskTreeStore;
  email: string;
  onSignOut: () => void;
};

export function HomeScreen({ store, email, onSignOut }: Props) {
  const [composer, setComposer] = useState('');
  const [selectedISO, setSelectedISO] = useState(todayISO());
  const [openId, setOpenId] = useState<string | null>(null);
  const [menuTask, setMenuTask] = useState<TaskRecord | null>(null);
  const dayTasks = useMemo(
    () => store.tasksOnDay(selectedISO),
    [store, selectedISO, store.inbox, store.allTasks()],
  );
  const openTask = openId ? store.task(openId) : undefined;

  async function addRoot() {
    const name = composer.trim();
    if (!name) return;
    setComposer('');
    await store.create({ name, onList: true });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>actions.life</Text>
          <Text style={styles.sub}>{email || 'Guest'}</Text>
        </View>
        <Pressable onPress={onSignOut} hitSlop={8}>
          <Text style={styles.link}>Sign out</Text>
        </Pressable>
      </View>
      <SplitPane
        split={store.listHeightSplit}
        onChange={(value) => {
          void store.setListHeightSplit(value);
        }}
        top={
          <DayCalendar
            selectedISO={selectedISO}
            todayISO={todayISO()}
            tasks={dayTasks}
            onSelectDay={setSelectedISO}
            onOpenTask={setOpenId}
            onCreateAt={(iso, time) => {
              void store.create({
                name: 'New event',
                onList: true,
                startDateISO: iso,
                startTime: time,
              });
            }}
          />
        }
        bottom={
          <Inbox
            forest={store.inbox}
            onToggleDone={(id) => void store.toggleDone(id)}
            onToggleCollapsed={(id) => {
              const task = store.task(id);
              if (task) void store.setCollapsed(id, !task.isCollapsed);
            }}
            onOpen={setOpenId}
            onMenu={setMenuTask}
          />
        }
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.composer}>
          <TextInput
            value={composer}
            onChangeText={setComposer}
            placeholder="Add a task"
            placeholderTextColor={colors.faint}
            style={styles.input}
            onSubmitEditing={() => void addRoot()}
            returnKeyType="done"
          />
          <Pressable style={styles.add} onPress={() => void addRoot()}>
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {openTask ? (
        <TaskDetailModal
          key={openTask.id}
          task={openTask}
          store={store}
          onClose={() => setOpenId(null)}
          onOpenTask={setOpenId}
        />
      ) : null}

      <Modal
        visible={!!menuTask}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuTask(null)}
      >
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
                      const created = store
                        .allTasks()
                        .filter((doc) => doc.parentID === parentId)
                        .at(-1);
                      if (created) setOpenId(created.id);
                    });
                  }}
                />
                <Action label="Indent" onPress={() => void store.indent(menuTask.id).then(() => setMenuTask(null))} />
                <Action label="Outdent" onPress={() => void store.outdent(menuTask.id).then(() => setMenuTask(null))} />
                <Action
                  label="Schedule today"
                  onPress={() =>
                    void store.schedule(menuTask.id, todayISO(), menuTask.startTime || '09:00').then(() =>
                      setMenuTask(null),
                    )
                  }
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
  safe: {
    flex: 1,
    backgroundColor: colors.navbar,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.navbar,
  },
  brand: {
    color: colors.ink,
    fontSize: type.body,
    fontWeight: '700',
  },
  sub: {
    color: colors.muted,
    fontSize: type.micro,
    marginTop: 2,
  },
  link: {
    color: colors.accent,
    fontWeight: '600',
  },
  composer: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    backgroundColor: colors.navbar,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.listBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: type.body,
  },
  add: {
    backgroundColor: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addText: {
    color: colors.card,
    fontWeight: '700',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.navbar,
    padding: 16,
    paddingBottom: 28,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetTitle: {
    fontSize: type.body,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 8,
  },
  action: {
    paddingVertical: 12,
  },
  actionText: {
    fontSize: type.body,
    color: colors.ink,
  },
});
