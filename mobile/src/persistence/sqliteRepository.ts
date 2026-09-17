import type { SQLiteDatabase } from 'expo-sqlite';
import type { SyncOperation, TaskRecord, UserProfile } from '../models/types';
import type { TaskRepository } from './repository';

export class SqliteRepository implements TaskRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  static async open(): Promise<SqliteRepository> {
    const SQLite = await import('expo-sqlite');
    const db = await SQLite.openDatabaseAsync('actions-life.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT NOT NULL,
        owner_uid TEXT NOT NULL,
        json TEXT NOT NULL,
        PRIMARY KEY (id, owner_uid)
      );
      CREATE TABLE IF NOT EXISTS profiles (
        uid TEXT PRIMARY KEY,
        json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS outbox (
        id TEXT PRIMARY KEY,
        owner_uid TEXT NOT NULL,
        json TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
    return new SqliteRepository(db);
  }

  async loadTasks(uid: string): Promise<TaskRecord[]> {
    const rows = await this.db.getAllAsync<{ json: string }>(
      'SELECT json FROM tasks WHERE owner_uid = ?',
      [uid],
    );
    return rows.map((row) => JSON.parse(row.json) as TaskRecord);
  }

  async replaceTasks(uid: string, tasks: TaskRecord[]): Promise<void> {
    try {
      await this.db.withExclusiveTransactionAsync(async (txn) => {
        await txn.runAsync('DELETE FROM tasks WHERE owner_uid = ?', [uid]);
        for (const task of tasks) {
          await txn.runAsync('INSERT INTO tasks (id, owner_uid, json) VALUES (?, ?, ?)', [
            task.id,
            uid,
            JSON.stringify(task),
          ]);
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/rollback/i.test(message)) throw error;
      await this.db.runAsync('DELETE FROM tasks WHERE owner_uid = ?', [uid]);
      for (const task of tasks) {
        await this.db.runAsync('INSERT INTO tasks (id, owner_uid, json) VALUES (?, ?, ?)', [
          task.id,
          uid,
          JSON.stringify(task),
        ]);
      }
    }
  }

  async loadProfile(uid: string): Promise<UserProfile | null> {
    const rows = await this.db.getAllAsync<{ json: string }>(
      'SELECT json FROM profiles WHERE uid = ?',
      [uid],
    );
    if (!rows[0]) return null;
    return JSON.parse(rows[0].json) as UserProfile;
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await this.db.runAsync(
      'INSERT OR REPLACE INTO profiles (uid, json) VALUES (?, ?)',
      [profile.uid, JSON.stringify(profile)],
    );
  }

  async enqueue(op: SyncOperation): Promise<void> {
    await this.db.runAsync(
      'INSERT OR REPLACE INTO outbox (id, owner_uid, json, created_at) VALUES (?, ?, ?, ?)',
      [op.id, op.ownerUID, JSON.stringify(op), op.createdAt],
    );
  }

  async loadOutbox(uid: string): Promise<SyncOperation[]> {
    const rows = await this.db.getAllAsync<{ json: string }>(
      'SELECT json FROM outbox WHERE owner_uid = ? ORDER BY created_at ASC',
      [uid],
    );
    return rows.map((row) => JSON.parse(row.json) as SyncOperation);
  }

  async clearOutbox(uid: string): Promise<void> {
    await this.db.runAsync('DELETE FROM outbox WHERE owner_uid = ?', [uid]);
  }
}
