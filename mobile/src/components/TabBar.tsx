import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, type } from '../theme';

export type AppTab = 'calendar' | 'schedule' | 'routines' | 'photos' | 'settings';

const TABS: { id: AppTab; label: string }[] = [
  { id: 'calendar', label: 'Home' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'routines', label: 'Routines' },
  { id: 'photos', label: 'Photos' },
  { id: 'settings', label: 'Settings' },
];

export function TabBar({ tab, onChange }: { tab: AppTab; onChange: (tab: AppTab) => void }) {
  return (
    <View style={styles.bar}>
      {TABS.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onChange(item.id)}
          style={[styles.item, tab === item.id && styles.itemOn]}
        >
          <Text style={[styles.label, tab === item.id && styles.labelOn]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.navbar,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  itemOn: {
    backgroundColor: colors.accentSoft,
  },
  label: {
    color: colors.muted,
    fontSize: type.micro,
    fontWeight: '600',
  },
  labelOn: {
    color: colors.accent,
  },
});
