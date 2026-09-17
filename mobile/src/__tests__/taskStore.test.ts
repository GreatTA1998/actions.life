import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MemoryRepository } from '../persistence/memoryRepository';
import { migrateUid } from '../persistence/migrate';
import { TaskTreeStore } from '../services/taskStore';
import { mergeRemoteTasks, toFirestoreTask } from '../services/syncMerge';
import { defaultTask } from '../models/types';
import { todayISO } from '../dates';

async function boot(uid = 'guest-test') {
  const repo = new MemoryRepository();
  const store = new TaskTreeStore(repo, uid);
  await store.init();
  return { repo, store };
}

test('guest seed creates inbox forest and calendar blocks', async () => {
  const { store } = await boot();
  const names = store.inbox.map((node) => node.task.name);
  assert.ok(names.includes('TO-DO'));
  assert.ok(names.includes('Visa timeline'));
  const todo = store.inbox.find((node) => node.task.id === 'getting-started');
  assert.equal(todo?.children.length, 4);
  const today = store.tasksOnDay(todayISO());
  assert.ok(today.some((task) => task.id === 'photo-bird'));
  assert.ok(store.photoTasks().some((task) => task.id === 'photo-bird'));
});

test('create, nest, complete, and schedule persist across relaunch', async () => {
  const { repo, store } = await boot('persist-user');
  const created = await store.create({ name: 'Write report', onList: true });
  await store.addSubtask(created.id, 'Outline');
  await store.addSubtask(created.id, 'Draft');
  const outline = store.allTasks().find((task) => task.name === 'Outline');
  const draft = store.allTasks().find((task) => task.name === 'Draft');
  assert.ok(outline);
  assert.ok(draft);
  await store.indent(draft.id);
  await store.toggleDone(outline.id);
  await store.schedule(created.id, todayISO(), '10:30', 45);

  const relaunch = new TaskTreeStore(repo, 'persist-user');
  await relaunch.init();
  const report = relaunch.task(created.id);
  assert.equal(report?.name, 'Write report');
  assert.equal(report?.startDateISO, todayISO());
  assert.equal(report?.startTime, '10:30');
  const nestedDraft = relaunch.allTasks().find((task) => task.name === 'Draft');
  assert.equal(nestedDraft?.parentID, outline.id);
  assert.equal(relaunch.allTasks().find((task) => task.name === 'Outline')?.isDone, true);
  assert.equal(nestedDraft?.rootID, created.id);
  assert.ok(relaunch.tasksOnDay(todayISO()).some((task) => task.id === created.id));
  assert.ok(relaunch.inbox.some((node) => node.task.id === created.id));
});

test('archive hides a subtree from the inbox without deleting it', async () => {
  const { store } = await boot('archive-user');
  const parent = await store.create({ name: 'Parent' });
  await store.addSubtask(parent.id, 'Child');
  await store.archive(parent.id);
  assert.equal(store.inbox.some((node) => node.task.id === parent.id), false);
  assert.equal(store.task(parent.id)?.onList, false);
  assert.ok(store.lastUndo);
});

test('sync outbox records mutations', async () => {
  const { repo, store } = await boot('outbox-user');
  await store.create({ name: 'Queued' });
  const pending = await repo.loadOutbox('outbox-user');
  assert.ok(pending.length > 0);
});

test('simpleMode archives a task when it is scheduled', async () => {
  const { store } = await boot('simple-user');
  await store.setSimpleMode(true);
  const created = await store.create({ name: 'Call mom', onList: true });
  await store.schedule(created.id, todayISO(), '14:00');
  assert.equal(store.task(created.id)?.onList, false);
  assert.equal(store.inbox.some((node) => node.task.id === created.id), false);
});

test('mergeRemoteTasks keeps pending local rows', () => {
  const local = [
    defaultTask({ id: 'a', name: 'Local', pendingSync: true, onList: true, orderValue: 1 }),
    defaultTask({ id: 'b', name: 'Stay', pendingSync: false, onList: true, orderValue: 2 }),
  ];
  const remote = [
    defaultTask({ id: 'a', name: 'Remote', pendingSync: false, onList: true, orderValue: 1 }),
    defaultTask({ id: 'c', name: 'New', pendingSync: false, onList: true, orderValue: 3 }),
  ];
  const merged = mergeRemoteTasks(local, remote);
  assert.equal(merged.find((task) => task.id === 'a')?.name, 'Local');
  assert.ok(merged.some((task) => task.id === 'c'));
  assert.ok(!('pendingSync' in toFirestoreTask(local[0])));
});

test('migrateUid copies tasks to the new owner', async () => {
  const { repo, store } = await boot('guest-old');
  const created = await store.create({ name: 'Keep me' });
  await migrateUid(repo, 'guest-old', 'firebase-new');
  const next = new TaskTreeStore(repo, 'firebase-new');
  await next.init();
  assert.equal(next.task(created.id)?.name, 'Keep me');
  assert.equal(next.task(created.id)?.ownerUID, 'firebase-new');
});

test('migrateUid does not wipe the destination when the source is already empty', async () => {
  const { repo, store } = await boot('guest-source');
  const created = await store.create({ name: 'Keep me' });
  await migrateUid(repo, 'guest-source', 'firebase-dest');
  await migrateUid(repo, 'guest-source', 'firebase-dest');
  const next = new TaskTreeStore(repo, 'firebase-dest');
  await next.init();
  assert.equal(next.task(created.id)?.name, 'Keep me');
});

test('undo restores an archived subtree to the inbox', async () => {
  const { store } = await boot('undo-user');
  const parent = await store.create({ name: 'Parent' });
  await store.addSubtask(parent.id, 'Child');
  await store.archive(parent.id);
  assert.ok(store.lastUndo);
  await store.lastUndo.run();
  store.clearUndo();
  assert.equal(store.task(parent.id)?.onList, true);
  assert.equal(store.inbox.some((node) => node.task.id === parent.id), true);
  assert.equal(store.lastUndo, null);
});

test('agenda includes seeded photo blocks', async () => {
  const { store } = await boot('agenda-user');
  const today = store.agendaDays(2)[0];
  assert.equal(today.iso, todayISO());
  assert.ok(today.tasks.some((task) => task.id === 'photo-bird'));
});

test('indent nests a task under its previous sibling', async () => {
  const { store } = await boot('indent-user');
  const parent = await store.create({ name: 'Parent' });
  await store.addSubtask(parent.id, 'First');
  await store.addSubtask(parent.id, 'Second');
  const first = store.allTasks().find((task) => task.name === 'First');
  const second = store.allTasks().find((task) => task.name === 'Second');
  assert.ok(first);
  assert.ok(second);
  const ok = await store.indent(second.id);
  assert.equal(ok, true);
  assert.equal(store.task(second.id)?.parentID, first.id);
  const refused = await store.indent(first.id);
  assert.equal(refused, false);
});

test('drainIfPossible skips local-only guest UIDs', async () => {
  const { store } = await boot('guest-offline');
  const result = await store.syncNow();
  assert.equal(result.drained, 0);
  assert.match(result.reason, /local-only/);
});
