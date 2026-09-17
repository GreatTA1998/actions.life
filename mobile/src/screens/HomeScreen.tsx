import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Inbox } from '../components/Inbox';
import { CAL_PX_PER_HOUR, CAL_START_HOUR, DayCalendar } from '../components/DayCalendar';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { SplitPane } from '../components/SplitPane';
import { formatMinutes, todayISO } from '../dates';
import type { TaskRecord } from '../models/types';
import type { TaskTreeStore } from '../services/taskStore';
import { colors, type } from '../theme';

type Props = {
  store: TaskTreeStore;
  dragging: TaskRecord | null;
  onDragStart: (task: TaskRecord) => void;
  onDragEnd: () => void;
  onOpen: (id: string) => void;
  onMenu: (task: TaskRecord) => void;
};

export type HomeScreenHandle = {
  dropAt: (pageX: number, pageY: number, task: TaskRecord) => void;
};

export const HomeScreen = forwardRef<HomeScreenHandle, Props>(function HomeScreen(
  { store, dragging, onDragStart, onDragEnd, onOpen, onMenu },
  ref,
) {
  const [composer, setComposer] = useState('');
  const [selectedISO, setSelectedISO] = useState(todayISO());
  const [revealTopToken, setRevealTopToken] = useState(0);
  const gridRef = useRef<View>(null);
  const selectedRef = useRef(selectedISO);
  selectedRef.current = selectedISO;
  const dayTasks = useMemo(
    () => store.tasksOnDay(selectedISO),
    [store, selectedISO, store.inbox, store.allTasks()],
  );

  useImperativeHandle(ref, () => ({
    dropAt(pageX, pageY, task) {
      const node = gridRef.current as (View & { measureInWindow?: Function }) | null;
      if (!node?.measureInWindow) return;
      node.measureInWindow((x: number, y: number, w: number, h: number) => {
        if (pageX < x || pageX > x + w || pageY < y || pageY > y + h) return;
        const minutes = CAL_START_HOUR * 60 + ((pageY - y) / CAL_PX_PER_HOUR) * 60;
        const snapped = Math.max(0, Math.round(minutes / 15) * 15);
        void store.schedule(task.id, selectedRef.current, formatMinutes(snapped));
        onDragEnd();
      });
    },
  }));

  async function addRoot() {
    const name = composer.trim();
    if (!name) return;
    setComposer('');
    await store.create({ name, onList: true, place: 'start' });
    setRevealTopToken((value) => value + 1);
  }

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      {dragging ? (
        <Text style={styles.dragHint}>Drop on a calendar hour — or tap a time</Text>
      ) : null}
      <SplitPane
        split={store.listHeightSplit}
        onChange={(value) => {
          void store.setListHeightSplit(value);
        }}
        top={
          <ErrorBoundary label="Calendar">
            <DayCalendar
              selectedISO={selectedISO}
              todayISO={todayISO()}
              tasks={dayTasks}
              onSelectDay={setSelectedISO}
              onOpenTask={onOpen}
              onCreateAt={(iso, time) => {
                if (dragging) {
                  void store.schedule(dragging.id, iso, time).then(onDragEnd);
                  return;
                }
                void store
                  .create({
                    name: 'New event',
                    onList: true,
                    startDateISO: iso,
                    startTime: time,
                    place: 'start',
                  })
                  .then(() => setRevealTopToken((value) => value + 1));
              }}
              gridRef={gridRef}
              dropHint={!!dragging}
            />
          </ErrorBoundary>
        }
        bottom={
          <Inbox
            forest={store.inbox}
            onToggleDone={(id) => void store.toggleDone(id)}
            onToggleCollapsed={(id) => {
              const task = store.task(id);
              if (task) void store.setCollapsed(id, !task.isCollapsed);
            }}
            onOpen={onOpen}
            onMenu={onMenu}
            onDragStart={onDragStart}
            revealTopToken={revealTopToken}
          />
        }
      />
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
  );
});

const styles = StyleSheet.create({
  fill: { flex: 1 },
  dragHint: {
    textAlign: 'center',
    paddingVertical: 6,
    backgroundColor: colors.accentSoft,
    color: colors.accent,
    fontWeight: '600',
    fontSize: type.small,
  },
  composer: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    backgroundColor: colors.navbar,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    zIndex: 2,
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
});
