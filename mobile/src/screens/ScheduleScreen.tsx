import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatDayLabel } from '../dates';
import type { TaskTreeStore } from '../services/taskStore';
import { colors, type } from '../theme';

export function ScheduleScreen({
  store,
  onOpenTask,
}: {
  store: TaskTreeStore;
  onOpenTask: (id: string) => void;
}) {
  const days = store.agendaDays(14);
  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Schedule</Text>
      {days.map((day) => (
        <View key={day.iso} style={styles.day}>
          <Text style={styles.heading}>{formatDayLabel(day.iso)}</Text>
          {day.tasks.length === 0 ? (
            <Text style={styles.empty}>Nothing scheduled</Text>
          ) : (
            day.tasks.map((task) => (
              <Pressable key={task.id} onPress={() => onOpenTask(task.id)} style={styles.row}>
                <Text style={styles.time}>{task.startTime || 'all day'}</Text>
                <Text style={[styles.name, task.isDone && styles.done]}>{task.name}</Text>
              </Pressable>
            ))
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.calBg },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink, marginBottom: 12 },
  day: { marginBottom: 18 },
  heading: { color: colors.muted, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', fontSize: type.micro },
  empty: { color: colors.faint, fontSize: type.small },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  time: { width: 64, color: colors.accent, fontWeight: '600' },
  name: { flex: 1, color: colors.ink, fontSize: type.body },
  done: { color: colors.done, textDecorationLine: 'line-through' },
});
