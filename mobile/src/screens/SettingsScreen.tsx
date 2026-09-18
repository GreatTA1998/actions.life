import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import type { PersistedSession } from '../models/types';
import type { TaskTreeStore } from '../services/taskStore';
import { colors, type } from '../theme';

export function SettingsScreen({
  store,
  session,
  onSignOut,
  onLinkGoogle,
}: {
  store: TaskTreeStore;
  session: PersistedSession;
  onSignOut: () => void;
  onLinkGoogle: () => void;
}) {
  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>
      <Row
        label="Simple mode"
        hint="Scheduling a task archives it from the inbox (web default off / structured)."
      >
        <Switch
          value={store.profile.simpleMode}
          onValueChange={(value) => void store.setSimpleMode(value)}
          trackColor={{ true: colors.accent }}
        />
      </Row>
      <Text style={styles.section}>Account</Text>
      <Text style={styles.meta}>{session.email || (session.isAnonymous ? 'Guest' : session.provider)}</Text>
      <Text style={styles.hint}>uid {session.uid}</Text>
      <Text style={styles.hint}>sync {store.lastSyncReason}</Text>
      {session.isAnonymous ? (
        <Pressable style={styles.button} onPress={onLinkGoogle}>
          <Text style={styles.buttonText}>Link Google (keeps this inbox)</Text>
        </Pressable>
      ) : null}
      <Pressable style={styles.ghost} onPress={() => void store.syncNow()}>
        <Text style={styles.ghostText}>Sync now</Text>
      </Pressable>
      <Pressable style={styles.ghost} onPress={onSignOut}>
        <Text style={styles.danger}>Sign out</Text>
      </Pressable>
      <Text style={styles.note}>
        iOS Google Sign-In is wired (GoogleService-Info.plist for life.actions.expo). Android still
        needs google-services.json and a rebuild. Guest and offline work without that. Native Google
        never uses production actions.life/auth/callback.
      </Text>
    </ScrollView>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.body}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.navbar },
  content: { padding: 16, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink, marginBottom: 16 },
  section: { marginTop: 24, marginBottom: 8, color: colors.muted, fontWeight: '700', letterSpacing: 0.4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  body: { flex: 1 },
  label: { color: colors.ink, fontSize: type.body, fontWeight: '600' },
  hint: { color: colors.muted, fontSize: type.small, marginTop: 4 },
  meta: { color: colors.ink, fontSize: type.body },
  button: {
    marginTop: 16,
    backgroundColor: colors.ink,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: { color: colors.card, fontWeight: '700' },
  ghost: { marginTop: 12, padding: 12, alignItems: 'center' },
  ghostText: { color: colors.accent, fontWeight: '600' },
  danger: { color: colors.danger, fontWeight: '600' },
  note: { marginTop: 24, color: colors.muted, fontSize: type.small, lineHeight: 18 },
});
