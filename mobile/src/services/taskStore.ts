import { randomID } from '../ids';
import { defaultProfile, defaultTask, type TaskRecord, type TaskTree, type UserProfile } from '../models/types';
import type { TaskRepository } from '../persistence/repository';
import {
  applyDateChange,
  applyDeletion,
  applyReparent,
  inboxForest,
  nextOrderValue,
  parentIDOf,
  previousSibling,
  subtreeIDs,
} from '../tree/treeMaintenance';
import { insertGuestSeed } from './seed';
import { SyncEngine } from './syncEngine';

export type CreateTaskInput = {
  name: string;
  parentID?: string;
  onList?: boolean;
  startDateISO?: string;
  startTime?: string;
  duration?: number;
  notes?: string;
  id?: string;
  childrenLayout?: string;
  isDone?: boolean;
  imageDownloadURL?: string;
};

export class TaskTreeStore {
  readonly uid: string;
  private records: TaskRecord[] = [];
  inbox: TaskTree[] = [];
  profile: UserProfile;
  listHeightSplit = 0.5;
  private readonly sync: SyncEngine;
  private listeners = new Set<() => void>();

  constructor(
    private readonly repo: TaskRepository,
    uid: string,
  ) {
    this.uid = uid;
    this.profile = defaultProfile(uid);
    this.sync = new SyncEngine(repo);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) listener();
  }

  async init(): Promise<void> {
    this.records = await this.repo.loadTasks(this.uid);
    this.profile = (await this.repo.loadProfile(this.uid)) ?? defaultProfile(this.uid);
    this.listHeightSplit = this.profile.listHeightSplit;
    this.reloadViews();
    if (!this.profile.didSeed) {
      await insertGuestSeed(this);
      this.profile = { ...this.profile, didSeed: true, updatedAt: Date.now() };
      await this.repo.saveProfile(this.profile);
      this.reloadViews();
    }
    this.notify();
  }

  private reloadViews() {
    this.inbox = inboxForest(this.records);
  }

  allTasks(): TaskRecord[] {
    return this.records;
  }

  task(id: string): TaskRecord | undefined {
    return this.records.find((doc) => doc.id === id);
  }

  tasksOnDay(dayISO: string): TaskRecord[] {
    return this.records
      .filter((doc) => doc.startDateISO === dayISO)
      .sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'));
  }

  async create(input: CreateTaskInput): Promise<TaskRecord> {
    const order = nextOrderValue(this.profile.maxOrderValue);
    const id = input.id ?? randomID();
    const parentID = input.parentID ?? '';
    const startDateISO = input.startDateISO ?? '';
    let rootID = id;
    let treeISOs = [startDateISO].filter(Boolean);
    let tagIDs: string[] = [];
    if (parentID) {
      const parent = this.records.find((doc) => doc.id === parentID);
      if (parent) {
        rootID = parent.rootID;
        tagIDs = [...parent.tagIDs];
        treeISOs = [...parent.treeISOs];
        if (startDateISO) treeISOs = [...treeISOs, startDateISO];
      }
    }

    if (this.records.some((doc) => doc.id === id)) {
      return this.task(id)!;
    }

    const record = defaultTask({
      id,
      ownerUID: this.uid,
      name: input.name,
      duration: input.duration ?? 30,
      parentID,
      startTime: input.startTime ?? '',
      startDateISO,
      notes: input.notes ?? '',
      isDone: input.isDone ?? false,
      imageDownloadURL: input.imageDownloadURL ?? '',
      childrenLayout: input.childrenLayout ?? 'normal',
      onList: input.onList ?? true,
      orderValue: order,
      treeISOs,
      rootID,
      tagIDs,
      pendingSync: true,
      updatedAt: Date.now(),
    });

    this.records = [...this.records, record];
    if (parentID && startDateISO) {
      this.records = this.records.map((doc) =>
        doc.rootID === rootID ? { ...doc, treeISOs } : doc,
      );
    }
    this.profile = { ...this.profile, maxOrderValue: order, updatedAt: Date.now(), pendingSync: true };
    await this.sync.enqueue(this.uid, 'create', 'tasks', id);
    await this.persist();
    return record;
  }

  async rename(id: string, name: string): Promise<void> {
    await this.patch(id, { name });
  }

  async setNotes(id: string, notes: string): Promise<void> {
    await this.patch(id, { notes });
  }

  async setDuration(id: string, minutes: number): Promise<void> {
    await this.update(id, { duration: Math.max(1, minutes) });
  }

  async toggleDone(id: string): Promise<void> {
    const task = this.task(id);
    if (!task) return;
    await this.update(id, { isDone: !task.isDone });
  }

  async setCollapsed(id: string, isCollapsed: boolean): Promise<void> {
    await this.update(id, { isCollapsed });
  }

  async setOnList(id: string, onList: boolean): Promise<void> {
    await this.update(id, { onList });
  }

  async schedule(id: string, dayISO: string, time?: string, duration?: number): Promise<void> {
    this.records = applyDateChange(id, dayISO, this.records);
    this.records = this.records.map((doc) => {
      if (doc.id !== id) return doc;
      return {
        ...doc,
        startTime: time ?? doc.startTime,
        duration: duration ?? doc.duration,
        pendingSync: true,
        updatedAt: Date.now(),
      };
    });
    await this.sync.enqueue(this.uid, 'batchTree', 'tasks', id);
    await this.persist();
  }

  async clearSchedule(id: string): Promise<void> {
    this.records = applyDateChange(id, '', this.records);
    this.records = this.records.map((doc) =>
      doc.id === id ? { ...doc, startTime: '', pendingSync: true, updatedAt: Date.now() } : doc,
    );
    await this.sync.enqueue(this.uid, 'batchTree', 'tasks', id);
    await this.persist();
  }

  async nest(id: string, underParentID: string): Promise<void> {
    this.records = applyReparent(id, underParentID, this.records);
    await this.sync.enqueue(this.uid, 'batchTree', 'tasks', id);
    await this.persist();
  }

  async indent(id: string): Promise<void> {
    const sibling = previousSibling(id, this.inbox);
    if (!sibling) return;
    await this.nest(id, sibling.id);
  }

  async outdent(id: string): Promise<void> {
    const currentParent = parentIDOf(id, this.records);
    if (!currentParent) return;
    const grandparent = parentIDOf(currentParent, this.records) ?? '';
    await this.nest(id, grandparent);
  }

  async archive(id: string): Promise<void> {
    const ids = new Set(subtreeIDs(id, this.records));
    this.records = this.records.map((doc) =>
      ids.has(doc.id) ? { ...doc, onList: false, pendingSync: true, updatedAt: Date.now() } : doc,
    );
    await this.sync.enqueue(this.uid, 'update', 'tasks', id);
    await this.persist();
  }

  async unarchive(id: string): Promise<void> {
    const ids = new Set(subtreeIDs(id, this.records));
    this.records = this.records.map((doc) =>
      ids.has(doc.id) ? { ...doc, onList: true, pendingSync: true, updatedAt: Date.now() } : doc,
    );
    await this.sync.enqueue(this.uid, 'update', 'tasks', id);
    await this.persist();
  }

  async deleteSubtree(id: string): Promise<void> {
    this.records = applyDeletion(id, this.records);
    await this.sync.enqueue(this.uid, 'delete', 'tasks', id);
    await this.persist();
  }

  async addSubtask(parentID: string, name: string): Promise<void> {
    await this.create({ name, parentID, onList: true });
  }

  private splitTimer: ReturnType<typeof setTimeout> | null = null;

  async setListHeightSplit(value: number): Promise<void> {
    this.listHeightSplit = Math.min(0.85, Math.max(0.25, value));
    this.profile = { ...this.profile, listHeightSplit: this.listHeightSplit, updatedAt: Date.now() };
    this.notify();
    if (this.splitTimer) clearTimeout(this.splitTimer);
    this.splitTimer = setTimeout(() => {
      void this.repo.saveProfile(this.profile);
    }, 200);
  }

  private async patch(id: string, changes: Partial<TaskRecord>): Promise<void> {
    this.records = this.records.map((doc) =>
      doc.id === id ? { ...doc, ...changes, pendingSync: true, updatedAt: Date.now() } : doc,
    );
    await this.sync.enqueue(this.uid, 'update', 'tasks', id);
    await this.repo.replaceTasks(this.uid, this.records);
    this.reloadViews();
    this.notify();
  }

  private async update(id: string, changes: Partial<TaskRecord>): Promise<void> {
    this.records = this.records.map((doc) =>
      doc.id === id ? { ...doc, ...changes, pendingSync: true, updatedAt: Date.now() } : doc,
    );
    await this.sync.enqueue(this.uid, 'update', 'tasks', id);
    await this.persist();
  }

  private async persist(): Promise<void> {
    await this.repo.replaceTasks(this.uid, this.records);
    await this.repo.saveProfile(this.profile);
    this.reloadViews();
    this.notify();
  }
}
