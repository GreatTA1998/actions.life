import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, type } from '../theme';
import { dayNumber, formatDayLabel, parseMinutes, surroundingDays, weekdayShort } from '../dates';
import type { TaskRecord } from '../models/types';

const START_HOUR = 6;
const END_HOUR = 22;
const PX_PER_HOUR = 50;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

type Props = {
  selectedISO: string;
  todayISO: string;
  tasks: TaskRecord[];
  onSelectDay: (iso: string) => void;
  onOpenTask: (id: string) => void;
  onCreateAt: (iso: string, time: string) => void;
};

export function DayCalendar({
  selectedISO,
  todayISO,
  tasks,
  onSelectDay,
  onOpenTask,
  onCreateAt,
}: Props) {
  const days = surroundingDays(todayISO, 7);
  const gridHeight = (END_HOUR - START_HOUR) * PX_PER_HOUR;

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>{formatDayLabel(selectedISO)}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayStrip}
      >
        {days.map((iso) => {
          const selected = iso === selectedISO;
          const isToday = iso === todayISO;
          return (
            <Pressable
              key={iso}
              onPress={() => onSelectDay(iso)}
              style={[styles.dayChip, selected && styles.dayChipOn, isToday && styles.dayChipToday]}
            >
              <Text style={[styles.dow, selected && styles.dowOn]}>{weekdayShort(iso)}</Text>
              <Text style={[styles.dom, selected && styles.domOn]}>{dayNumber(iso)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <ScrollView style={styles.gridScroll}>
        <View style={[styles.grid, { height: gridHeight }]}>
          {HOURS.map((hour) => (
            <Pressable
              key={hour}
              onPress={() => onCreateAt(selectedISO, `${String(hour).padStart(2, '0')}:00`)}
              style={[styles.hourRow, { top: (hour - START_HOUR) * PX_PER_HOUR }]}
            >
              <Text style={styles.hourLabel}>{`${hour}:00`}</Text>
              <View style={styles.hourLine} />
            </Pressable>
          ))}
          {tasks
            .filter((task) => task.startTime)
            .map((task) => {
              const minutes = parseMinutes(task.startTime);
              const top = ((minutes - START_HOUR * 60) / 60) * PX_PER_HOUR;
              const height = Math.max(28, (task.duration / 60) * PX_PER_HOUR);
              if (top + height < 0 || top > gridHeight) return null;
              return (
                <Pressable
                  key={task.id}
                  onPress={() => onOpenTask(task.id)}
                  style={[styles.block, { top: Math.max(0, top), height }]}
                >
                  <Text style={styles.blockTime}>{task.startTime}</Text>
                  <Text style={styles.blockName} numberOfLines={2}>
                    {task.name}
                  </Text>
                </Pressable>
              );
            })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.calBg,
  },
  heading: {
    paddingHorizontal: 16,
    paddingTop: 8,
    color: colors.ink,
    fontSize: type.small,
    fontWeight: '600',
  },
  dayStrip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  dayChip: {
    width: 48,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dayChipOn: {
    backgroundColor: colors.ink,
  },
  dayChipToday: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  dow: {
    color: colors.muted,
    fontSize: type.micro,
    textTransform: 'uppercase',
  },
  dowOn: {
    color: colors.card,
  },
  dom: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  domOn: {
    color: colors.card,
  },
  gridScroll: {
    flex: 1,
  },
  grid: {
    marginLeft: 8,
    marginRight: 12,
    position: 'relative',
  },
  hourRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: PX_PER_HOUR,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hourLabel: {
    width: 44,
    color: colors.faint,
    fontSize: 11,
  },
  hourLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.grid,
    marginTop: 7,
  },
  block: {
    position: 'absolute',
    left: 52,
    right: 4,
    backgroundColor: colors.accentSoft,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  blockTime: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  blockName: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '500',
  },
});
