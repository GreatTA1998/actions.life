import type { SyncOperation, TaskRecord, UserProfile } from '../models/types';

export interface TaskRepository {
  loadTasks(uid: string): Promise<TaskRecord[]>;
  replaceTasks(uid: string, tasks: TaskRecord[]): Promise<void>;
  loadProfile(uid: string): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;
  enqueue(op: SyncOperation): Promise<void>;
  loadOutbox(uid: string): Promise<SyncOperation[]>;
  clearOutbox(uid: string): Promise<void>;
}
