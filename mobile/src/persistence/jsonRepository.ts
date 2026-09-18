import type { SyncOperation, TaskRecord, UserProfile } from '../models/types';
import type { TaskRepository } from './repository';

export type KeyValueStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem?(key: string): Promise<void>;
};

type Bundle = {
  tasks: Record<string, TaskRecord[]>;
  profiles: Record<string, UserProfile>;
  outbox: Record<string, SyncOperation[]>;
};

const EMPTY: Bundle = { tasks: {}, profiles: {}, outbox: {} };

export class JsonRepository implements TaskRepository {
  private bundle: Bundle = EMPTY;

  constructor(
    private readonly kv: KeyValueStore,
    private readonly key = 'actions-life.db.json',
  ) {}

  async hydrate(): Promise<void> {
    const raw = await this.kv.getItem(this.key);
    this.bundle = raw ? (JSON.parse(raw) as Bundle) : { tasks: {}, profiles: {}, outbox: {} };
  }

  private async flush(): Promise<void> {
    await this.kv.setItem(this.key, JSON.stringify(this.bundle));
  }

  async loadTasks(uid: string): Promise<TaskRecord[]> {
    return (this.bundle.tasks[uid] ?? []).map((task) => ({
      ...task,
      treeISOs: [...task.treeISOs],
      tagIDs: [...task.tagIDs],
    }));
  }

  async replaceTasks(uid: string, tasks: TaskRecord[]): Promise<void> {
    this.bundle.tasks[uid] = tasks.map((task) => ({
      ...task,
      treeISOs: [...task.treeISOs],
      tagIDs: [...task.tagIDs],
    }));
    await this.flush();
  }

  async loadProfile(uid: string): Promise<UserProfile | null> {
    const profile = this.bundle.profiles[uid];
    return profile ? { ...profile } : null;
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    this.bundle.profiles[profile.uid] = { ...profile };
    await this.flush();
  }

  async enqueue(op: SyncOperation): Promise<void> {
    const list = this.bundle.outbox[op.ownerUID] ?? [];
    list.push({ ...op });
    this.bundle.outbox[op.ownerUID] = list;
    await this.flush();
  }

  async loadOutbox(uid: string): Promise<SyncOperation[]> {
    return [...(this.bundle.outbox[uid] ?? [])];
  }

  async clearOutbox(uid: string): Promise<void> {
    this.bundle.outbox[uid] = [];
    await this.flush();
  }
}

export async function openJsonRepository(kv: KeyValueStore): Promise<JsonRepository> {
  const repo = new JsonRepository(kv);
  await repo.hydrate();
  return repo;
}
