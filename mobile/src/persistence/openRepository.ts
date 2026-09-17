import type { TaskRepository } from './repository';
import { openJsonRepository } from './jsonRepository';
import { SqliteRepository } from './sqliteRepository';

export async function openTaskRepository(): Promise<{ repo: TaskRepository; kind: 'sqlite' | 'json' }> {
  try {
    const repo = await SqliteRepository.open();
    return { repo, kind: 'sqlite' };
  } catch {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const repo = await openJsonRepository(AsyncStorage);
    return { repo, kind: 'json' };
  }
}
