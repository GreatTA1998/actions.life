import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { addDaysISO, formatMinutes, parseMinutes, todayISO } from '../dates';
import type { TaskRecord } from '../models/types';
import type { TaskTreeStore } from '../services/taskStore';
import { colors, type } from '../theme';

type Props = {
  task: TaskRecord;
  store: TaskTreeStore;
  onClose: () => void;
  onOpenTask: (id: string) => void;
};

export function TaskDetailModal({ task, store, onClose, onOpenTask }: Props) {
  const [name, setName] = useState(task.name);
  const [notes, setNotes] = useState(task.notes);
  const [subtaskName, setSubtaskName] = useState('');
  const [busy, setBusy] = useState(false);
  const children = store.allTasks().filter((doc) => doc.parentID === task.id);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete() {
    const message = children.length
      ? `This will delete ${children.length + 1} actions.`
      : 'This cannot be undone.';
    const go = () =>
      run(async () => {
        await store.deleteSubtree(task.id);
        onClose();
      });
    if (Platform.OS === 'web') {
      if (typeof globalThis.confirm === 'function' && globalThis.confirm(`Delete this tree?\n${message}`)) {
        void go();
      }
      return;
    }
    Alert.alert('Delete this tree?', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => void go(),
      },
    ]);
  }

  const live = store.task(task.id) ?? task;

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.sheet}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.grab}>
          <View style={styles.grabPill} />
        </View>
        <View style={styles.topBar}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.link}>Close</Text>
          </Pressable>
          {busy ? <ActivityIndicator color={colors.accent} /> : <View />}
        </View>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <TextInput
            value={name}
            onChangeText={setName}
            onEndEditing={() => run(() => store.rename(live.id, name.trim() || 'Untitled'))}
            style={styles.title}
            placeholder="Task name"
            placeholderTextColor={colors.faint}
          />

          <Row label="Done">
            <Switch
              value={live.isDone}
              onValueChange={() => run(() => store.toggleDone(live.id))}
              trackColor={{ true: colors.accent }}
            />
          </Row>
          <Row label="On inbox">
            <Switch
              value={live.onList}
              onValueChange={(value) => run(() => store.setOnList(live.id, value))}
              trackColor={{ true: colors.accent }}
            />
          </Row>

          <Text style={styles.section}>Schedule</Text>
          <View style={styles.chipRow}>
            <Chip
              label="Clear"
              on={live.startDateISO === ''}
              onPress={() => run(() => store.clearSchedule(live.id))}
            />
            <Chip
              label="Today"
              on={live.startDateISO === todayISO()}
              onPress={() => run(() => store.schedule(live.id, todayISO(), live.startTime || '09:00'))}
            />
            <Chip
              label="Tomorrow"
              on={live.startDateISO === addDaysISO(todayISO(), 1)}
              onPress={() =>
                run(() => store.schedule(live.id, addDaysISO(todayISO(), 1), live.startTime || '09:00'))
              }
            />
          </View>
          {live.startDateISO ? (
            <Text style={styles.meta}>
              {live.startDateISO}
              {live.startTime ? ` · ${live.startTime}` : ''}
            </Text>
          ) : null}

          <Row label="Time">
            <View style={styles.stepper}>
              <Pressable
                style={styles.step}
                onPress={() =>
                  run(() =>
                    store.schedule(
                      live.id,
                      live.startDateISO || todayISO(),
                      formatMinutes(parseMinutes(live.startTime || '09:00') - 15),
                    ),
                  )
                }
              >
                <Text style={styles.stepText}>−15m</Text>
              </Pressable>
              <Text style={styles.stepValue}>{live.startTime || '—'}</Text>
              <Pressable
                style={styles.step}
                onPress={() =>
                  run(() =>
                    store.schedule(
                      live.id,
                      live.startDateISO || todayISO(),
                      formatMinutes(parseMinutes(live.startTime || '09:00') + 15),
                    ),
                  )
                }
              >
                <Text style={styles.stepText}>+15m</Text>
              </Pressable>
            </View>
          </Row>

          <Row label="Duration">
            <View style={styles.stepper}>
              <Pressable
                style={styles.step}
                onPress={() => run(() => store.setDuration(live.id, live.duration - 5))}
              >
                <Text style={styles.stepText}>−5</Text>
              </Pressable>
              <Text style={styles.stepValue}>{live.duration}m</Text>
              <Pressable
                style={styles.step}
                onPress={() => run(() => store.setDuration(live.id, live.duration + 5))}
              >
                <Text style={styles.stepText}>+5</Text>
              </Pressable>
            </View>
          </Row>

          <Text style={styles.section}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            onEndEditing={() => run(() => store.setNotes(live.id, notes))}
            style={styles.notes}
            placeholder="Notes"
            placeholderTextColor={colors.faint}
            multiline
          />

          <Text style={styles.section}>Subtasks</Text>
          {children.map((child) => (
            <Pressable key={child.id} onPress={() => onOpenTask(child.id)} style={styles.child}>
              <Text style={[styles.childName, child.isDone && styles.done]}>{child.name}</Text>
            </Pressable>
          ))}
          <View style={styles.addRow}>
            <TextInput
              value={subtaskName}
              onChangeText={setSubtaskName}
              placeholder="Add a subtask"
              placeholderTextColor={colors.faint}
              style={styles.addInput}
              onSubmitEditing={() => {
                const value = subtaskName.trim();
                if (!value) return;
                setSubtaskName('');
                void run(() => store.addSubtask(live.id, value));
              }}
            />
            <Pressable
              style={styles.addBtn}
              onPress={() => {
                const value = subtaskName.trim();
                if (!value) return;
                setSubtaskName('');
                void run(() => store.addSubtask(live.id, value));
              }}
            >
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.archive}
            onPress={() =>
              run(async () => {
                if (live.onList) await store.archive(live.id);
                else await store.unarchive(live.id);
              })
            }
          >
            <Text style={styles.archiveText}>{live.onList ? 'Archive from inbox' : 'Move back to inbox'}</Text>
          </Pressable>
          <Pressable style={styles.delete} onPress={confirmDelete}>
            <Text style={styles.deleteText}>Delete subtree</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, on && styles.chipOn]}>
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.navbar,
  },
  grab: {
    alignItems: 'center',
    paddingTop: 8,
  },
  grabPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.handle,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  link: {
    color: colors.accent,
    fontSize: type.body,
    fontWeight: '600',
  },
  body: {
    padding: 16,
    paddingBottom: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  label: {
    color: colors.ink,
    fontSize: type.body,
  },
  section: {
    marginTop: 18,
    marginBottom: 8,
    color: colors.muted,
    fontSize: type.small,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.listBg,
  },
  chipOn: {
    backgroundColor: colors.ink,
  },
  chipText: {
    color: colors.ink,
    fontSize: type.small,
  },
  chipTextOn: {
    color: colors.card,
  },
  meta: {
    marginTop: 8,
    color: colors.muted,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  step: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.listBg,
  },
  stepText: {
    color: colors.ink,
    fontSize: type.small,
  },
  stepValue: {
    minWidth: 54,
    textAlign: 'center',
    color: colors.ink,
    fontWeight: '600',
  },
  notes: {
    minHeight: 80,
    borderRadius: 12,
    backgroundColor: colors.listBg,
    padding: 12,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  child: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  childName: {
    color: colors.ink,
    fontSize: type.body,
  },
  done: {
    color: colors.done,
    textDecorationLine: 'line-through',
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  addInput: {
    flex: 1,
    backgroundColor: colors.listBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.ink,
  },
  addBtn: {
    backgroundColor: colors.ink,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  addBtnText: {
    color: colors.card,
    fontWeight: '600',
  },
  archive: {
    marginTop: 24,
    alignItems: 'center',
    padding: 12,
  },
  archiveText: {
    color: colors.muted,
    fontWeight: '600',
  },
  delete: {
    alignItems: 'center',
    padding: 12,
  },
  deleteText: {
    color: colors.danger,
    fontWeight: '600',
  },
});
