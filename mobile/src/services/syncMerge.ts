import { defaultTask, type TaskRecord } from '../models/types';

const LOCAL_TASK_KEYS = new Set(['ownerUID', 'pendingSync', 'updatedAt', 'isTombstone']);

export type FirestoreTask = Omit<
  TaskRecord,
  'ownerUID' | 'pendingSync' | 'updatedAt' | 'isTombstone'
>;

export function toFirestoreTask(task: TaskRecord): FirestoreTask {
  const payload = { ...task } as TaskRecord & Record<string, unknown>;
  for (const key of LOCAL_TASK_KEYS) delete payload[key];
  delete (payload as { id?: string }).id;
  return payload as FirestoreTask;
}

export function fromFirestoreTask(id: string, data: Record<string, unknown>, ownerUID: string): TaskRecord {
  return defaultTask({
    id,
    ownerUID,
    name: String(data.name ?? ''),
    duration: Number(data.duration ?? 30),
    parentID: String(data.parentID ?? ''),
    startTime: String(data.startTime ?? ''),
    startDateISO: String(data.startDateISO ?? ''),
    iconURL: String(data.iconURL ?? ''),
    timeZone: String(data.timeZone ?? ''),
    notes: String(data.notes ?? ''),
    templateID: String(data.templateID ?? ''),
    isDone: Boolean(data.isDone),
    imageDownloadURL: String(data.imageDownloadURL ?? ''),
    imageFullPath: String(data.imageFullPath ?? ''),
    childrenLayout: String(data.childrenLayout ?? 'normal'),
    photoLayout: String(data.photoLayout ?? 'split-view'),
    isCollapsed: Boolean(data.isCollapsed),
    tagIDs: Array.isArray(data.tagIDs) ? data.tagIDs.map(String) : [],
    onList: Boolean(data.onList),
    orderValue: Number(data.orderValue ?? 0),
    treeISOs: Array.isArray(data.treeISOs) ? data.treeISOs.map(String) : [],
    rootID: String(data.rootID ?? id),
    pendingSync: false,
    updatedAt: 0,
    isTombstone: false,
  });
}

export function isLocalOnlyUid(uid: string): boolean {
  return uid.startsWith('guest-') || uid.startsWith('apple-');
}

/** Last-write-wins per document: pending local rows win; otherwise remote replaces. */
export function mergeRemoteTasks(local: TaskRecord[], remote: TaskRecord[]): TaskRecord[] {
  const localById = new Map(local.map((task) => [task.id, task]));
  const remoteById = new Map(remote.map((task) => [task.id, task]));
  const ids = new Set([...localById.keys(), ...remoteById.keys()]);
  const merged: TaskRecord[] = [];
  for (const id of ids) {
    const loc = localById.get(id);
    const rem = remoteById.get(id);
    if (loc?.pendingSync || loc?.isTombstone) {
      merged.push(loc);
      continue;
    }
    if (rem) {
      merged.push({
        ...rem,
        ownerUID: loc?.ownerUID ?? rem.ownerUID,
        pendingSync: false,
        updatedAt: loc?.updatedAt ?? 0,
        isTombstone: false,
      });
      continue;
    }
    if (loc) merged.push(loc);
  }
  return merged;
}

export function toFirestoreProfile(profile: {
  uid: string;
  email: string;
  maxOrderValue: number;
  calendarTheme: string;
  fontScale: number;
  defaultPhotoLayout: string;
  calSnapInterval: number;
  listAreaWidthRatio: number;
  listAreaHeightRatio: number;
  listWidthSplit: number;
  listHeightSplit: number;
  simpleMode: boolean;
  photoUploadAutoArchive: boolean;
  photoCompressWhenAttachingToTask: boolean;
  hideRoutines: boolean;
  lastRanRoutines: string;
  nickname: string;
  avatarFilter: string;
  tags: Record<string, { color: string; name: string }>;
  pixelsPerHour: number;
  calColumnWidth: number;
}) {
  return {
    uid: profile.uid,
    email: profile.email,
    maxOrderValue: profile.maxOrderValue,
    calendarTheme: profile.calendarTheme,
    fontScale: profile.fontScale,
    defaultPhotoLayout: profile.defaultPhotoLayout,
    calSnapInterval: profile.calSnapInterval,
    listAreaWidthRatio: profile.listAreaWidthRatio,
    listAreaHeightRatio: profile.listAreaHeightRatio,
    listWidthSplit: profile.listWidthSplit,
    listHeightSplit: profile.listHeightSplit,
    simpleMode: profile.simpleMode,
    photoUploadAutoArchive: profile.photoUploadAutoArchive,
    photoCompressWhenAttachingToTask: profile.photoCompressWhenAttachingToTask,
    hideRoutines: profile.hideRoutines,
    lastRanRoutines: profile.lastRanRoutines,
    nickname: profile.nickname,
    avatarFilter: profile.avatarFilter,
    tags: profile.tags,
    pixelsPerHour: profile.pixelsPerHour,
    calColumnWidth: profile.calColumnWidth,
  };
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
