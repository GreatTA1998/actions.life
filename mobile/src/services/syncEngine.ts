import type { SyncKind, SyncOperation } from '../models/types';
import { randomID } from '../ids';
import type { TaskRepository } from '../persistence/repository';

export class SyncEngine {
  constructor(private readonly repo: TaskRepository) {}

  async enqueue(uid: string, kind: SyncKind, collection: string, documentID: string): Promise<void> {
    await this.repo.enqueue({
      id: randomID(),
      ownerUID: uid,
      kind,
      collection,
      documentID,
      createdAt: Date.now(),
    });
  }

  /**
   * Slice 1 stub: local outbox is the source of pending writes.
   * Drain to Firestore `users/{uid}/tasks` on named DB `schema-compliant` in slice 3,
   * after iOS/Android Firebase apps are registered.
   */
  async drainIfPossible(): Promise<{ drained: number; reason: string }> {
    return {
      drained: 0,
      reason: 'Firestore drain waits on native Firebase app config (schema-compliant).',
    };
  }

  async pending(uid: string): Promise<SyncOperation[]> {
    return this.repo.loadOutbox(uid);
  }
}
