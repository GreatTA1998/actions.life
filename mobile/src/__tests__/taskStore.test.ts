import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MemoryRepository } from '../persistence/memoryRepository';
import { TaskTreeStore } from '../services/taskStore';
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
});

test('sync outbox records mutations while drain stays stubbed', async () => {
  const { repo, store } = await boot('outbox-user');
  await store.create({ name: 'Queued' });
  const pending = await repo.loadOutbox('outbox-user');
  assert.ok(pending.length > 0);
  const drain = await new (await import('../services/syncEngine')).SyncEngine(repo).drainIfPossible();
  assert.equal(drain.drained, 0);
});
