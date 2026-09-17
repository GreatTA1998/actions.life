import { Platform } from 'react-native';
import type { TaskRepository } from './repository';
import { openJsonRepository } from './jsonRepository';
import { SqliteRepository } from './sqliteRepository';

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`sqlite-timeout-${ms}`)), ms);
  });
}

export async function openTaskRepository(): Promise<{ repo: TaskRepository; kind: 'sqlite' | 'json' }> {
  if (Platform.OS !== 'web') {
    try {
      const repo = await Promise.race([SqliteRepository.open(), timeout(2500)]);
      return { repo, kind: 'sqlite' };
    } catch {
      // Fall through to JSON persistence (Expo Go web, missing native module, etc.)
    }
  }
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  const repo = await openJsonRepository(AsyncStorage);
  return { repo, kind: 'json' };
}
