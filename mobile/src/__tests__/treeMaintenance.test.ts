import assert from 'node:assert/strict';
import { test } from 'node:test';
import { defaultTask, type TaskRecord } from '../models/types';
import {
  applyDateChange,
  applyDeletion,
  applyReparent,
  buildForest,
  inboxForest,
  previousSibling,
} from '../tree/treeMaintenance';

function snap(
  id: string,
  opts: Partial<TaskRecord> & { parent?: string; root?: string; date?: string; order?: number } = {},
): TaskRecord {
  const parentID = opts.parent ?? opts.parentID ?? '';
  const startDateISO = opts.date ?? opts.startDateISO ?? '';
  return defaultTask({
    id,
    parentID,
    rootID: opts.root ?? opts.rootID ?? id,
    startDateISO,
    orderValue: opts.order ?? opts.orderValue ?? 1,
    name: opts.name ?? id,
    onList: opts.onList ?? true,
    treeISOs: opts.treeISOs ?? (startDateISO ? [startDateISO] : []),
    ...opts,
  });
}

test('buildForest nests by parent and order', () => {
  const forest = buildForest([
    snap('root', { parent: '', order: 2, name: 'Later' }),
    snap('child', { parent: 'root', order: 1, name: 'Child' }),
    snap('root-first', { parent: '', order: 1, name: 'First' }),
  ]);
  assert.deepEqual(forest.map((node) => node.task.id), ['root-first', 'root']);
  assert.deepEqual(forest[1].children.map((node) => node.task.id), ['child']);
});

test('inboxForest hides archived roots', () => {
  const inbox = inboxForest([
    snap('keep', { parent: '', onList: true }),
    snap('gone', { parent: '', onList: false }),
  ]);
  assert.deepEqual(inbox.map((node) => node.task.id), ['keep']);
});

test('date change rewrites family treeISOs', () => {
  let docs = [
    snap('root', { parent: '', root: 'root', date: '', treeISOs: ['2026-09-18'] }),
    snap('child', { parent: 'root', root: 'root', date: '2026-09-18', treeISOs: ['2026-09-18'] }),
  ];
  docs = applyDateChange('child', '2026-09-20', docs);
  assert.equal(docs.find((doc) => doc.id === 'child')?.startDateISO, '2026-09-20');
  assert.deepEqual(
    new Set(docs.map((doc) => doc.treeISOs.join(','))),
    new Set(['2026-09-20']),
  );
});

test('reparent moves subtree and rebuilds dates', () => {
  let docs = [
    snap('a', { parent: '', root: 'a', date: '2026-01-01', treeISOs: ['2026-01-01'] }),
    snap('b', { parent: '', root: 'b', date: '2026-02-02', treeISOs: ['2026-02-02'] }),
    snap('a1', { parent: 'a', root: 'a', date: '', treeISOs: ['2026-01-01'] }),
  ];
  docs = applyReparent('a1', 'b', docs);
  const moved = docs.find((doc) => doc.id === 'a1');
  assert.equal(moved?.parentID, 'b');
  assert.equal(moved?.rootID, 'b');
  assert.deepEqual(
    new Set(docs.filter((doc) => doc.rootID === 'b').flatMap((doc) => doc.treeISOs)),
    new Set(['2026-02-02']),
  );
  assert.deepEqual(docs.find((doc) => doc.id === 'a')?.treeISOs, ['2026-01-01']);
});

test('reparent refuses cycles', () => {
  let docs = [
    snap('root', { parent: '', root: 'root' }),
    snap('child', { parent: 'root', root: 'root' }),
  ];
  docs = applyReparent('root', 'child', docs);
  assert.equal(docs.find((doc) => doc.id === 'root')?.parentID, '');
});

test('deletion removes subtree and repairs dates', () => {
  let docs = [
    snap('root', { parent: '', root: 'root', date: '', treeISOs: ['2026-03-03'] }),
    snap('keep', { parent: 'root', root: 'root', date: '', treeISOs: ['2026-03-03'] }),
    snap('gone', { parent: 'root', root: 'root', date: '2026-03-03', treeISOs: ['2026-03-03'] }),
    snap('gone-child', { parent: 'gone', root: 'root', date: '', treeISOs: ['2026-03-03'] }),
  ];
  docs = applyDeletion('gone', docs);
  assert.deepEqual(new Set(docs.map((doc) => doc.id)), new Set(['root', 'keep']));
  assert.deepEqual(docs[0].treeISOs, []);
});

test('previousSibling for indent', () => {
  const forest = buildForest([
    snap('a', { parent: '', order: 1 }),
    snap('b', { parent: '', order: 2 }),
  ]);
  assert.equal(previousSibling('b', forest)?.id, 'a');
  assert.equal(previousSibling('a', forest), null);
});
