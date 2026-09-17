import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, type } from '../theme';
import type { TaskRecord, TaskTree } from '../models/types';

type Props = {
  node: TaskTree;
  depth: number;
  onToggleDone: (id: string) => void;
  onToggleCollapsed: (id: string) => void;
  onOpen: (id: string) => void;
  onMenu: (task: TaskRecord) => void;
  onDragStart?: (task: TaskRecord) => void;
};

export function TaskRow({ node, depth, onToggleDone, onToggleCollapsed, onOpen, onMenu, onDragStart }: Props) {
  const { task, children } = node;
  const hasChildren = children.length > 0;
  const dateBadge = task.startDateISO ? task.startDateISO.slice(5) : '';

  return (
    <View>
      <View style={[styles.row, { paddingLeft: 12 + depth * 18 }]}>
        {hasChildren ? (
          <Pressable
            onPress={() => onToggleCollapsed(task.id)}
            hitSlop={8}
            style={styles.chevronHit}
          >
            <Text style={styles.chevron}>{task.isCollapsed ? '▸' : '▾'}</Text>
          </Pressable>
        ) : (
          <View style={styles.chevronHit} />
        )}
        <Pressable
          onPress={() => onToggleDone(task.id)}
          style={[styles.box, task.isDone && styles.boxDone]}
          hitSlop={6}
        >
          {task.isDone ? <Text style={styles.check}>✓</Text> : null}
        </Pressable>
        <Pressable
          onPress={() => onOpen(task.id)}
          onLongPress={() => onDragStart?.(task)}
          delayLongPress={180}
          style={styles.body}
        >
          <Text
            style={[styles.name, task.isDone && styles.nameDone]}
            numberOfLines={2}
          >
            {task.name || 'Untitled'}
          </Text>
          {dateBadge ? <Text style={styles.badge}>{dateBadge}</Text> : null}
        </Pressable>
        <Pressable onPress={() => onMenu(task)} hitSlop={8} style={styles.menuHit}>
          <Text style={styles.menu}>⋯</Text>
        </Pressable>
      </View>
      {!task.isCollapsed
        ? children.map((child) => (
            <TaskRow
              key={child.task.id}
              node={child}
              depth={depth + 1}
              onToggleDone={onToggleDone}
              onToggleCollapsed={onToggleCollapsed}
              onOpen={onOpen}
              onMenu={onMenu}
              onDragStart={onDragStart}
            />
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingRight: 8,
    paddingVertical: 4,
  },
  chevronHit: {
    width: 22,
    alignItems: 'center',
  },
  chevron: {
    color: colors.muted,
    fontSize: 14,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: colors.card,
  },
  boxDone: {
    backgroundColor: colors.ink,
  },
  check: {
    color: colors.card,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    color: colors.ink,
    fontSize: type.body,
  },
  nameDone: {
    color: colors.done,
    textDecorationLine: 'line-through',
  },
  badge: {
    color: colors.muted,
    fontSize: type.micro,
    letterSpacing: 0.3,
  },
  menuHit: {
    width: 28,
    alignItems: 'center',
  },
  menu: {
    color: colors.muted,
    fontSize: 18,
    lineHeight: 20,
  },
});
