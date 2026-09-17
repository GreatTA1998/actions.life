import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLayoutEffect, useRef, type Ref } from 'react';
import { colors, type } from '../theme';
import {
  calendarScrollOffset,
  dayNumber,
  formatDayLabel,
  parseMinutes,
  surroundingDays,
  weekdayShort,
} from '../dates';
import type { TaskRecord } from '../models/types';

export const CAL_START_HOUR = 6;
export const CAL_END_HOUR = 22;
/** Keep this alias so a stale Metro HMR graph cannot throw PX_PER_HOUR is not defined. */
export const PX_PER_HOUR = 50;
export const CAL_PX_PER_HOUR = PX_PER_HOUR;
const HOURS = Array.from({ length: CAL_END_HOUR - CAL_START_HOUR }, (_, i) => CAL_START_HOUR + i);

type Props = {
  selectedISO: string;
  todayISO: string;
  tasks: TaskRecord[];
  onSelectDay: (iso: string) => void;
  onOpenTask: (id: string) => void;
  onCreateAt: (iso: string, time: string) => void;
  gridRef?: Ref<View>;
  dropHint?: boolean;
};

type ScrollNode = {
  scrollTo?: (opts: { x?: number; y?: number; animated?: boolean }) => void;
  getScrollableNode?: () => unknown;
  getNativeScrollRef?: () => unknown;
};

function applyScrollY(scroll: ScrollNode | null, y: number) {
  if (!scroll) return;
  scroll.scrollTo?.({ x: 0, y, animated: false });
  if (Platform.OS !== 'web') return;
  const node = (scroll.getScrollableNode?.() ?? scroll.getNativeScrollRef?.() ?? null) as {
    scrollTop?: number;
  } | null;
  if (node && typeof node.scrollTop === 'number') node.scrollTop = y;
}

export function DayCalendar({
  selectedISO,
  todayISO,
  tasks,
  onSelectDay,
  onOpenTask,
  onCreateAt,
  gridRef,
  dropHint,
}: Props) {
  const days = surroundingDays(todayISO, 7);
  const gridHeight = (CAL_END_HOUR - CAL_START_HOUR) * PX_PER_HOUR;
  const hourScrollRef = useRef<ScrollView>(null);
  const timeKey = tasks
    .map((task) => task.startTime)
    .filter(Boolean)
    .sort()
    .join(',');
  const focusY = calendarScrollOffset(
    tasks.map((task) => task.startTime),
    CAL_START_HOUR,
    PX_PER_HOUR,
  );

  function scrollToMorning() {
    applyScrollY(hourScrollRef.current as unknown as ScrollNode, focusY);
  }

  useLayoutEffect(() => {
    scrollToMorning();
    const later = setTimeout(scrollToMorning, 50);
    return () => clearTimeout(later);
  }, [selectedISO, timeKey, focusY]);

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
      <ScrollView
        ref={hourScrollRef}
        style={styles.gridScroll}
        contentOffset={{ x: 0, y: focusY }}
        onLayout={scrollToMorning}
        onContentSizeChange={scrollToMorning}
      >
        <View ref={gridRef} style={[styles.grid, { height: gridHeight }, dropHint && styles.gridDrop]}>
          {HOURS.map((hour) => (
            <Pressable
              key={hour}
              onPress={() => onCreateAt(selectedISO, `${String(hour).padStart(2, '0')}:00`)}
              style={styles.hourRow}
            >
              <Text style={[styles.hourLabel, hour === 9 && styles.hourLabelMorning]}>{`${hour}:00`}</Text>
              <View style={styles.hourLine} />
            </Pressable>
          ))}
          {tasks
            .filter((task) => task.startTime)
            .map((task) => {
              const minutes = parseMinutes(task.startTime);
              const top = ((minutes - CAL_START_HOUR * 60) / 60) * PX_PER_HOUR;
              const height = Math.max(28, (task.duration / 60) * PX_PER_HOUR);
              if (top + height < 0 || top > gridHeight) return null;
              return (
                <Pressable
                  key={task.id}
                  onPress={() => onOpenTask(task.id)}
                  style={[styles.block, { top: Math.max(0, top), height }]}
                >
                  {task.imageDownloadURL ? (
                    <Image source={{ uri: task.imageDownloadURL }} style={styles.blockPhoto} />
                  ) : null}
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
    overflow: 'hidden',
  },
  grid: {
    position: 'relative',
  },
  gridDrop: {
    backgroundColor: 'rgba(74, 103, 65, 0.08)',
  },
  hourRow: {
    height: PX_PER_HOUR,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hourLabel: {
    width: 44,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 14,
  },
  hourLabelMorning: {
    color: colors.ink,
    fontWeight: '700',
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
    overflow: 'hidden',
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
  blockPhoto: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 8,
    opacity: 0.35,
  },
});
