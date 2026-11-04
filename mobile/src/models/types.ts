export type TaskRecord = {
  id: string;
  ownerUID: string;
  name: string;
  duration: number;
  parentID: string;
  startTime: string;
  startDateISO: string;
  iconURL: string;
  timeZone: string;
  notes: string;
  templateID: string;
  isDone: boolean;
  imageDownloadURL: string;
  imageFullPath: string;
  childrenLayout: string;
  photoLayout: string;
  isCollapsed: boolean;
  tagIDs: string[];
  onList: boolean;
  orderValue: number;
  treeISOs: string[];
  rootID: string;
  pendingSync: boolean;
  updatedAt: number;
  isTombstone: boolean;
};

export type TaskTree = {
  task: TaskRecord;
  children: TaskTree[];
};

export type UserProfile = {
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
  didSeed: boolean;
  pendingSync: boolean;
  updatedAt: number;
};

export type SyncKind = 'create' | 'update' | 'delete' | 'batchTree';

export type SyncOperation = {
  id: string;
  ownerUID: string;
  kind: SyncKind;
  collection: string;
  documentID: string;
  createdAt: number;
};

export type AuthProvider = 'anonymous' | 'google' | 'apple';

export type PersistedSession = {
  uid: string;
  email: string;
  isAnonymous: boolean;
  provider: AuthProvider;
};

export function defaultTask(partial: Partial<TaskRecord> & Pick<TaskRecord, 'id'>): TaskRecord {
  return {
    ownerUID: '',
    name: partial.name ?? partial.id,
    duration: 30,
    parentID: '',
    startTime: '',
    startDateISO: '',
    iconURL: '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notes: '',
    templateID: '',
    isDone: false,
    imageDownloadURL: '',
    imageFullPath: '',
    childrenLayout: 'normal',
    photoLayout: 'split-view',
    isCollapsed: false,
    tagIDs: [],
    onList: true,
    orderValue: 1,
    treeISOs: [],
    rootID: partial.id,
    pendingSync: false,
    updatedAt: 0,
    isTombstone: false,
    ...partial,
  };
}

export function defaultProfile(uid: string): UserProfile {
  return {
    uid,
    email: '',
    maxOrderValue: 10,
    calendarTheme: 'mutedEarth',
    fontScale: 0.75,
    defaultPhotoLayout: 'split-view',
    calSnapInterval: 1,
    listAreaWidthRatio: 0.00223,
    listAreaHeightRatio: 0.004,
    listWidthSplit: 0.5,
    listHeightSplit: 0.5,
    simpleMode: false,
    photoUploadAutoArchive: false,
    photoCompressWhenAttachingToTask: true,
    hideRoutines: true,
    lastRanRoutines: '',
    nickname: '',
    avatarFilter: '',
    tags: {},
    pixelsPerHour: 50,
    calColumnWidth: 160,
    didSeed: false,
    pendingSync: false,
    updatedAt: Date.now(),
  };
}
