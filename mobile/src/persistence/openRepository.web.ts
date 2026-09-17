import type { TaskRepository } from './repository';
import { openJsonRepository } from './jsonRepository';

export async function openTaskRepository(): Promise<{ repo: TaskRepository; kind: 'sqlite' | 'json' }> {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  const repo = await openJsonRepository(AsyncStorage);
  return { repo, kind: 'json' };
}
