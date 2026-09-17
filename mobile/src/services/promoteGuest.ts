import type { PersistedSession } from '../models/types';
import { migrateUid } from '../persistence/migrate';
import type { TaskRepository } from '../persistence/repository';
import { saveSession } from '../persistence/sessionStore';
import { isLocalOnlyUid } from './syncMerge';
import { tryFirebase } from './firebase';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/** If the first launch was offline (`guest-…`), copy local data onto a Firebase anonymous UID. */
export async function promoteLocalGuest(
  session: PersistedSession,
  repo: TaskRepository,
): Promise<PersistedSession> {
  if (!session.isAnonymous || !isLocalOnlyUid(session.uid)) return session;
  const firebase = await withTimeout(tryFirebase(), 2500);
  if (!firebase) return session;
  const { signInAnonymously } = await import('firebase/auth');
  const result = await withTimeout(signInAnonymously(firebase.auth), 4000);
  const next: PersistedSession = {
    uid: result.user.uid,
    email: '',
    isAnonymous: true,
    provider: 'anonymous',
  };
  await migrateUid(repo, session.uid, next.uid);
  await saveSession(next);
  return next;
}
