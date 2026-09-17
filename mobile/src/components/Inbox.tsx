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
};

export function Inbox({ forest, onToggleDone, onToggleCollapsed, onOpen, onMenu }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Inbox</Text>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
    paddingBottom: 24,
  },
  empty: {
    padding: 16,
    color: colors.muted,
    fontSize: type.small,
  },
});
