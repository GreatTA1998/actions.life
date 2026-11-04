import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, type } from '../theme';
import type { TaskRecord, TaskTree } from '../models/types';
import { TaskRow } from './TaskRow';

type Props = {
  forest: TaskTree[];
  onToggleDone: (id: string) => void;
  onToggleCollapsed: (id: string) => void;
  onOpen: (id: string) => void;
  onMenu: (task: TaskRecord) => void;
  onDragStart?: (task: TaskRecord) => void;
  /** Bump after creating a root task so the new row is not left under the composer. */
  revealTopToken?: number;
};

export function Inbox({
  forest,
  onToggleDone,
  onToggleCollapsed,
  onOpen,
  onMenu,
  onDragStart,
  revealTopToken,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!revealTopToken) return;
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [revealTopToken]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Inbox</Text>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {forest.length === 0 ? (
          <Text style={styles.empty}>Nothing on the list. Add a task below.</Text>
        ) : (
          forest.map((node) => (
            <TaskRow
              key={node.task.id}
              node={node}
              depth={0}
              onToggleDone={onToggleDone}
              onToggleCollapsed={onToggleCollapsed}
              onOpen={onOpen}
              onMenu={onMenu}
              onDragStart={onDragStart}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.listBg,
  },
  heading: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    color: colors.muted,
    fontSize: type.small,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  content: {
    paddingBottom: 72,
  },
  empty: {
    padding: 16,
    color: colors.muted,
    fontSize: type.small,
  },
});
