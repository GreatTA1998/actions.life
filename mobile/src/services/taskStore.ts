import { addDaysISO, todayISO } from '../dates';
import { randomID } from '../ids';
import { defaultProfile, defaultTask, type TaskRecord, type TaskTree, type UserProfile } from '../models/types';
import type { TaskRepository } from '../persistence/repository';
import {
  applyDateChange,
  applyDeletion,
  adjacentSibling,
  applyReparent,
  inboxForest,
  nextOrderValue,
  parentIDOf,
  previousSibling,
  subtreeIDs,
} from '../tree/treeMaintenance';
import { peekFirebase } from './firebase';
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
  iconURL?: string;
  tagIDs?: string[];
  /** Root inbox rows go above the fold when set to `start`. */
  place?: 'start' | 'end';
};

export function mergeTaskRecords(disk: TaskRecord[], memory: TaskRecord[]): TaskRecord[] {
  const byId = new Map<string, TaskRecord>();
  for (const task of disk) byId.set(task.id, task);
  for (const task of memory) {
    const existing = byId.get(task.id);
    if (!existing || task.updatedAt >= existing.updatedAt) byId.set(task.id, task);
  }
  return [...byId.values()];
}

export class TaskTreeStore {
  readonly uid: string;
  private records: TaskRecord[] = [];
  inbox: TaskTree[] = [];
  profile: UserProfile;
  listHeightSplit = 0.5;
  hydrated = false;
  private writeThrough = false;
  private repo: TaskRepository;
  private readonly sync: SyncEngine;
  private listeners = new Set<() => void>();

  constructor(repo: TaskRepository, uid: string) {
    this.uid = uid;
    this.repo = repo;
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
    const loaded = await this.repo.loadTasks(this.uid);
    const loadedProfile = await this.repo.loadProfile(this.uid);
    this.records = mergeTaskRecords(loaded, this.records);
    if (loadedProfile) {
      this.profile = {
        ...loadedProfile,
        didSeed: loadedProfile.didSeed || this.profile.didSeed,
      };
    }
    this.listHeightSplit = this.profile.listHeightSplit;
    this.reloadViews();
    this.notify();
    this.writeThrough = true;
    if (!this.profile.didSeed && this.records.length === 0) {
      await insertGuestSeed(this);
      this.profile = { ...this.profile, didSeed: true, updatedAt: Date.now() };
      await this.repo.saveProfile(this.profile);
      this.reloadViews();
    } else if (!this.profile.didSeed) {
      this.profile = { ...this.profile, didSeed: true, updatedAt: Date.now() };
      await this.repo.saveProfile(this.profile);
    } else if (this.records.length !== loaded.length) {
      await this.persist();
    }
    this.hydrated = true;
    this.notify();
  }

  /** Swap the in-memory boot repo for SQLite without dropping rows created on first paint. */
  async adoptRepository(repo: TaskRepository): Promise<void> {
    if (this.repo === repo) {
      this.writeThrough = true;
      this.hydrated = true;
      return;
    }
    const loaded = await repo.loadTasks(this.uid);
    const loadedProfile = await repo.loadProfile(this.uid);
    this.records = mergeTaskRecords(loaded, this.records);
    if (loadedProfile) {
      this.profile = {
        ...loadedProfile,
        didSeed: loadedProfile.didSeed || this.profile.didSeed,
      };
    }
    this.listHeightSplit = this.profile.listHeightSplit;
    this.repo = repo;
    this.writeThrough = true;
    this.hydrated = true;
    await this.persist();
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

  async create(input: CreateTaskInput, options?: { persist?: boolean }): Promise<TaskRecord> {
    const parentID = input.parentID ?? '';
    let order: number;
    if (input.place === 'start') {
      const siblings = this.records.filter((doc) => doc.parentID === parentID && !doc.isTombstone);
      const min = siblings.reduce((lowest, doc) => Math.min(lowest, doc.orderValue), 0);
      order = min - 1;
    } else {
      order = nextOrderValue(this.profile.maxOrderValue);
    }
    const id = input.id ?? randomID();
    const startDateISO = input.startDateISO ?? '';
    let rootID = id;
    let treeISOs = [startDateISO].filter(Boolean);
    let tagIDs: string[] = input.tagIDs ? [...input.tagIDs] : [];
    if (parentID) {
      const parent = this.records.find((doc) => doc.id === parentID);
      if (parent) {
        rootID = parent.rootID;
        if (!input.tagIDs) tagIDs = [...parent.tagIDs];
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
      iconURL: input.iconURL ?? '',
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
    const maxOrderValue = Math.max(this.profile.maxOrderValue, order);
    this.profile = { ...this.profile, maxOrderValue, updatedAt: Date.now(), pendingSync: true };
    if (this.writeThrough) await this.sync.enqueue(this.uid, 'create', 'tasks', id);
    if (options?.persist === false) {
      this.reloadViews();
      this.notify();
    } else {
      await this.persist();
    }
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

  lastSyncReason = 'not-yet';
  lastUndo: { label: string; run: () => Promise<void> } | null = null;

  async schedule(id: string, dayISO: string, time?: string, duration?: number): Promise<void> {
    const previous = this.task(id);
    this.records = applyDateChange(id, dayISO, this.records);
    this.records = this.records.map((doc) => {
      if (doc.id !== id) return doc;
      return {
        ...doc,
        startTime: time ?? doc.startTime,
        duration: duration ?? doc.duration,
        onList: this.profile.simpleMode ? false : doc.onList,
        pendingSync: true,
        updatedAt: Date.now(),
      };
    });
    await this.sync.enqueue(this.uid, 'batchTree', 'tasks', id);
    if (this.profile.simpleMode && previous?.onList) {
      this.lastUndo = {
        label: 'Archived from the list',
        run: () => this.setOnList(id, true),
      };
    }
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

  async indent(id: string): Promise<boolean> {
    const sibling = previousSibling(id, this.inbox);
    if (!sibling) return false;
    await this.nest(id, sibling.id);
    if (sibling.isCollapsed) await this.setCollapsed(sibling.id, false);
    return true;
  }

  async outdent(id: string): Promise<boolean> {
    const currentParent = parentIDOf(id, this.records);
    if (!currentParent) return false;
    const grandparent = parentIDOf(currentParent, this.records) ?? '';
    await this.nest(id, grandparent);
    return true;
  }

  async archive(id: string): Promise<void> {
    const ids = new Set(subtreeIDs(id, this.records));
    const count = ids.size;
    this.records = this.records.map((doc) =>
      ids.has(doc.id) ? { ...doc, onList: false, pendingSync: true, updatedAt: Date.now() } : doc,
    );
    this.lastUndo = {
      label: `${count} task${count > 1 ? 's' : ''} archived from the list`,
      run: () => this.unarchive(id),
    };
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

  async moveAmongSiblings(id: string, delta: -1 | 1): Promise<boolean> {
    const neighbor = adjacentSibling(id, this.inbox, delta);
    const self = this.task(id);
    if (!neighbor || !self) return false;
    let nextSelf = neighbor.orderValue;
    let nextNeighbor = self.orderValue;
    if (nextSelf === nextNeighbor) {
      nextSelf = self.orderValue + delta;
    }
    this.records = this.records.map((doc) => {
      if (doc.id === id) {
        return { ...doc, orderValue: nextSelf, pendingSync: true, updatedAt: Date.now() };
      }
      if (doc.id === neighbor.id) {
        return { ...doc, orderValue: nextNeighbor, pendingSync: true, updatedAt: Date.now() };
      }
      return doc;
    });
    await this.sync.enqueue(this.uid, 'batchTree', 'tasks', id);
    await this.persist();
    return true;
  }

  async setSimpleMode(value: boolean): Promise<void> {
    this.profile = { ...this.profile, simpleMode: value, pendingSync: true, updatedAt: Date.now() };
    await this.repo.saveProfile(this.profile);
    this.notify();
  }

  photoTasks(): TaskRecord[] {
    return this.records
      .filter((task) => task.imageDownloadURL)
      .sort((a, b) => (b.startDateISO || '').localeCompare(a.startDateISO || ''));
  }

  agendaDays(count = 14): { iso: string; tasks: TaskRecord[] }[] {
    const start = todayISO();
    const days: { iso: string; tasks: TaskRecord[] }[] = [];
    for (let i = 0; i < count; i += 1) {
      const iso = addDaysISO(start, i);
      days.push({ iso, tasks: this.tasksOnDay(iso) });
    }
    return days;
  }

  async syncNow(): Promise<{ drained: number; reason: string }> {
    const result = await this.sync.drainIfPossible({
      uid: this.uid,
      tasks: this.records,
      profile: this.profile,
    });
    this.lastSyncReason = result.reason;
    if (result.reason === 'ok') {
      this.records = this.records.map((task) => ({ ...task, pendingSync: false }));
      await this.repo.replaceTasks(this.uid, this.records);
      const pulled = await this.sync.pull(this.uid, this.records);
      if (pulled) {
        this.records = pulled;
        await this.repo.replaceTasks(this.uid, this.records);
        this.reloadViews();
      }
    }
    this.notify();
    return result;
  }

  clearUndo() {
    this.lastUndo = null;
    this.notify();
  }

  private splitTimer: ReturnType<typeof setTimeout> | null = null;
  private syncTimer: ReturnType<typeof setTimeout> | null = null;

  async setListHeightSplit(value: number): Promise<void> {
    this.listHeightSplit = Math.min(0.85, Math.max(0.25, value));
    this.profile = { ...this.profile, listHeightSplit: this.listHeightSplit, updatedAt: Date.now() };
    this.notify();
    if (this.splitTimer) clearTimeout(this.splitTimer);
    this.splitTimer = setTimeout(() => {
      void this.repo.saveProfile(this.profile);
    }, 200);
  }

  async flush(): Promise<void> {
    await this.persist();
  }

  private async patch(id: string, changes: Partial<TaskRecord>): Promise<void> {
    this.records = this.records.map((doc) =>
      doc.id === id ? { ...doc, ...changes, pendingSync: true, updatedAt: Date.now() } : doc,
    );
    if (this.writeThrough) await this.sync.enqueue(this.uid, 'update', 'tasks', id);
    await this.persist();
  }

  private async update(id: string, changes: Partial<TaskRecord>): Promise<void> {
    this.records = this.records.map((doc) =>
      doc.id === id ? { ...doc, ...changes, pendingSync: true, updatedAt: Date.now() } : doc,
    );
    if (this.writeThrough) await this.sync.enqueue(this.uid, 'update', 'tasks', id);
    await this.persist();
  }

  private async persist(): Promise<void> {
    this.reloadViews();
    this.notify();
    if (!this.writeThrough) return;
    await this.repo.replaceTasks(this.uid, this.records);
    await this.repo.saveProfile(this.profile);
    const signedIn = peekFirebase()?.auth.currentUser;
    if (!signedIn || signedIn.uid !== this.uid) return;
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      void this.syncNow();
    }, 400);
  }
}
