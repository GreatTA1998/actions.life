import type { SyncOperation, TaskRecord, UserProfile } from '../models/types';
import type { TaskRepository } from './repository';

export class MemoryRepository implements TaskRepository {
  tasks = new Map<string, TaskRecord[]>();
  profiles = new Map<string, UserProfile>();
  outbox = new Map<string, SyncOperation[]>();

  async loadTasks(uid: string): Promise<TaskRecord[]> {
    return (this.tasks.get(uid) ?? []).map((task) => ({
      ...task,
      treeISOs: [...task.treeISOs],
      tagIDs: [...task.tagIDs],
    }));
  }

  async replaceTasks(uid: string, tasks: TaskRecord[]): Promise<void> {
    this.tasks.set(
      uid,
      tasks.map((task) => ({ ...task, treeISOs: [...task.treeISOs], tagIDs: [...task.tagIDs] })),
    );
  }

  async loadProfile(uid: string): Promise<UserProfile | null> {
    const profile = this.profiles.get(uid);
    return profile ? { ...profile, tags: { ...profile.tags } } : null;
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    this.profiles.set(profile.uid, { ...profile, tags: { ...profile.tags } });
  }

  async enqueue(op: SyncOperation): Promise<void> {
    const list = this.outbox.get(op.ownerUID) ?? [];
    list.push({ ...op });
    this.outbox.set(op.ownerUID, list);
  }

  async loadOutbox(uid: string): Promise<SyncOperation[]> {
    return [...(this.outbox.get(uid) ?? [])];
  }

  async clearOutbox(uid: string): Promise<void> {
    this.outbox.set(uid, []);
  }
}
