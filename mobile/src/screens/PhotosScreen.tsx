import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { TaskTreeStore } from '../services/taskStore';
import { colors, type } from '../theme';

export function PhotosScreen({
  store,
  onOpenTask,
}: {
  store: TaskTreeStore;
  onOpenTask: (id: string) => void;
}) {
  const photos = store.photoTasks();
  return (
    <ScrollView style={styles.wrap} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Photos</Text>
      {photos.length === 0 ? (
        <Text style={styles.empty}>No photos on tasks yet.</Text>
      ) : (
        <View style={styles.grid}>
          {photos.map((task) => (
            <Pressable key={task.id} onPress={() => onOpenTask(task.id)} style={styles.card}>
              <Image source={{ uri: task.imageDownloadURL }} style={styles.image} />
              <View style={styles.caption}>
                <Text style={styles.name} numberOfLines={1}>
                  {task.name}
                </Text>
                <Text style={styles.date}>{task.startDateISO}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.listBg },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink, marginBottom: 12 },
  empty: { color: colors.muted },
  grid: { gap: 12 },
  card: { borderRadius: 12, overflow: 'hidden', backgroundColor: colors.card },
  image: { width: '100%', height: 220 },
  caption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: { color: '#fff', fontWeight: '600', flex: 1, marginRight: 8 },
  date: { color: '#fff', fontSize: type.small },
});
