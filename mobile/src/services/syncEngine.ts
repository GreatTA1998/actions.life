import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import type { SyncKind, SyncOperation, TaskRecord, UserProfile } from '../models/types';
import { randomID } from '../ids';
import type { TaskRepository } from '../persistence/repository';
import { surroundingDays, todayISO } from '../dates';
import { tryFirebase } from './firebase';
import {
  chunk,
  fromFirestoreTask,
  isLocalOnlyUid,
  mergeRemoteTasks,
  toFirestoreProfile,
  toFirestoreTask,
} from './syncMerge';

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

export class SyncEngine {
  constructor(private readonly repo: TaskRepository) {}

  async enqueue(uid: string, kind: SyncKind, collectionName: string, documentID: string): Promise<void> {
    await this.repo.enqueue({
      id: randomID(),
      ownerUID: uid,
      kind,
      collection: collectionName,
      documentID,
      createdAt: Date.now(),
    });
  }

  async pending(uid: string): Promise<SyncOperation[]> {
    return this.repo.loadOutbox(uid);
  }

  async drainIfPossible(input: {
    uid: string;
    tasks: TaskRecord[];
    profile: UserProfile;
  }): Promise<{ drained: number; reason: string }> {
    if (isLocalOnlyUid(input.uid)) {
      return { drained: 0, reason: 'local-only uid; promote guest when online' };
    }
    let firebase: Awaited<ReturnType<typeof tryFirebase>> = null;
    try {
      firebase = await withTimeout(tryFirebase(), 2500);
    } catch {
      return { drained: 0, reason: 'offline or Firebase Auth not signed in' };
    }
    if (!firebase?.auth.currentUser) {
      return { drained: 0, reason: 'offline or Firebase Auth not signed in' };
    }
    if (firebase.auth.currentUser.uid !== input.uid) {
      return { drained: 0, reason: 'auth uid mismatch' };
    }

    const outbox = await this.repo.loadOutbox(input.uid);
    const deletes = new Set(outbox.filter((op) => op.kind === 'delete').map((op) => op.documentID));
    let drained = 0;
    try {
      for (const id of deletes) {
        await deleteDoc(doc(firebase.db, `users/${input.uid}/tasks/${id}`));
        drained += 1;
      }
      const pendingIds = new Set(
        outbox.filter((op) => op.kind !== 'delete').map((op) => op.documentID),
      );
      for (const task of input.tasks) {
        if (deletes.has(task.id)) continue;
        if (task.pendingSync || pendingIds.has(task.id) || pendingIds.has(task.rootID)) {
          await setDoc(doc(firebase.db, `users/${input.uid}/tasks/${task.id}`), toFirestoreTask(task), {
            merge: true,
          });
          drained += 1;
        }
      }
      await setDoc(doc(firebase.db, `users/${input.uid}`), toFirestoreProfile(input.profile), {
        merge: true,
      });
      await this.repo.clearOutbox(input.uid);
      return { drained, reason: 'ok' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { drained, reason: message };
    }
  }

  async pull(uid: string, local: TaskRecord[]): Promise<TaskRecord[] | null> {
    if (isLocalOnlyUid(uid)) return null;
    let firebase: Awaited<ReturnType<typeof tryFirebase>> = null;
    try {
      firebase = await withTimeout(tryFirebase(), 2500);
    } catch {
      return null;
    }
    if (!firebase?.auth.currentUser || firebase.auth.currentUser.uid !== uid) return null;
    try {
      const remoteById = new Map<string, TaskRecord>();
      const inboxSnap = await getDocs(
        query(collection(firebase.db, `users/${uid}/tasks`), where('onList', '==', true)),
      );
      for (const remoteDoc of inboxSnap.docs) {
        remoteById.set(remoteDoc.id, fromFirestoreTask(remoteDoc.id, remoteDoc.data(), uid));
      }
      const dates = surroundingDays(todayISO(), 7);
      for (const group of chunk(dates, 10)) {
        const calSnap = await getDocs(
          query(
            collection(firebase.db, `users/${uid}/tasks`),
            where('treeISOs', 'array-contains-any', group),
          ),
        );
        for (const remoteDoc of calSnap.docs) {
          remoteById.set(remoteDoc.id, fromFirestoreTask(remoteDoc.id, remoteDoc.data(), uid));
        }
      }
      return mergeRemoteTasks(local, [...remoteById.values()]);
    } catch {
      return null;
    }
  }
}
