import { Platform } from 'react-native';
import type { TaskRepository } from './repository';
import { openJsonRepository } from './jsonRepository';
import { SqliteRepository } from './sqliteRepository';

export async function openTaskRepository(): Promise<{ repo: TaskRepository; kind: 'sqlite' | 'json' }> {
  if (Platform.OS !== 'web') {
    try {
      // Do not time out SQLite on native. A short race used to fall back to
      // empty JSON on slow emulators, which looked like a wiped inbox on reload.
      const repo = await SqliteRepository.open();
      return { repo, kind: 'sqlite' };
    } catch {
      // Fall through to JSON persistence when the native module is missing.
    }
  }
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  const repo = await openJsonRepository(AsyncStorage);
  return { repo, kind: 'json' };
}
