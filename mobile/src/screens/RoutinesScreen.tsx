import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { nowHM, todayISO } from '../dates';
import { HABIT_TEMPLATES } from '../services/seed';
import type { TaskTreeStore } from '../services/taskStore';
import { colors, type } from '../theme';

export function RoutinesScreen({ store }: { store: TaskTreeStore }) {
  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Routines</Text>
      <Text style={styles.lead}>
        Repeat templates from the web guest seed. Adding one places it on today&apos;s calendar.
      </Text>
      {HABIT_TEMPLATES.map((habit) => (
        <View key={habit.id} style={styles.row}>
          <View style={styles.body}>
            <Text style={styles.name}>{habit.name}</Text>
            <Text style={styles.meta}>
              {habit.rr} · {habit.duration}m
            </Text>
          </View>
          <Pressable
            style={styles.add}
            onPress={() =>
              void store.create({
                name: habit.name,
                duration: habit.duration,
                startDateISO: todayISO(),
                startTime: nowHM(),
                onList: !store.profile.simpleMode,
              })
            }
          >
            <Text style={styles.addText}>Today</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.listBg },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  lead: { color: colors.muted, marginBottom: 16, lineHeight: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: 12,
  },
  body: { flex: 1 },
  name: { color: colors.ink, fontSize: type.body, fontWeight: '600' },
  meta: { color: colors.muted, fontSize: type.small, marginTop: 2 },
  add: { backgroundColor: colors.ink, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  addText: { color: colors.card, fontWeight: '700' },
});
