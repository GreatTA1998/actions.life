import type { TaskRecord, TaskTree } from '../models/types';

export function nodesByParent(docs: TaskRecord[]): Record<string, TaskRecord[]> {
  const sorted = [...docs].sort((a, b) => a.orderValue - b.orderValue);
  const grouped: Record<string, TaskRecord[]> = { '': [] };
  for (const doc of sorted) grouped[doc.id] = [];
  for (const doc of sorted) {
    if (!grouped[doc.parentID]) grouped[doc.parentID] = [];
    grouped[doc.parentID].push(doc);
  }
  return grouped;
}

export function buildForest(docs: TaskRecord[]): TaskTree[] {
  const memo = nodesByParent(docs);
  function hydrate(node: TaskRecord): TaskTree {
    return {
      task: node,
      children: (memo[node.id] ?? []).map(hydrate),
    };
  }
  return (memo[''] ?? []).map(hydrate);
}

export function inboxForest(docs: TaskRecord[]): TaskTree[] {
  return buildForest(docs.filter((doc) => doc.onList));
}

export function subtreeIDs(of: string, docs: TaskRecord[]): string[] {
  const children = new Map<string, TaskRecord[]>();
  for (const doc of docs) {
    const list = children.get(doc.parentID) ?? [];
    list.push(doc);
    children.set(doc.parentID, list);
  }
  const result = [of];
  function walk(current: string) {
    for (const child of children.get(current) ?? []) {
      result.push(child.id);
      walk(child.id);
    }
  }
  walk(of);
  return result;
}

export function removeOneInstance(array: string[], item: string): string[] {
  const index = array.indexOf(item);
  if (index === -1) return [...array];
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

export function correctTreeISOs(prevDate: string, newDate: string, array: string[]): string[] {
  let next = array;
  if (prevDate) next = removeOneInstance(next, prevDate);
  if (newDate) next = [...next, newDate];
  return next;
}

export function applyDateChange(taskID: string, newDate: string, docs: TaskRecord[]): TaskRecord[] {
  const next = docs.map((doc) => ({ ...doc, treeISOs: [...doc.treeISOs], tagIDs: [...doc.tagIDs] }));
  const index = next.findIndex((doc) => doc.id === taskID);
  if (index === -1) return next;
  const task = next[index];
  if (task.startDateISO === newDate) return next;
  const newISOs = correctTreeISOs(task.startDateISO, newDate, task.treeISOs);
  next[index] = { ...task, startDateISO: newDate, treeISOs: newISOs };
  return next.map((doc) => (doc.rootID === task.rootID ? { ...doc, treeISOs: newISOs } : doc));
}

export function applyReparent(taskID: string, newParentID: string, docs: TaskRecord[]): TaskRecord[] {
  const next = docs.map((doc) => ({ ...doc, treeISOs: [...doc.treeISOs], tagIDs: [...doc.tagIDs] }));
  const index = next.findIndex((doc) => doc.id === taskID);
  if (index === -1) return next;
  const task = next[index];
  if (task.parentID === newParentID || newParentID === taskID) return next;
  if (newParentID) {
    const descendantIDs = new Set(subtreeIDs(taskID, next));
    if (descendantIDs.has(newParentID)) return next;
  }

  const movedIDs = new Set(subtreeIDs(taskID, next));
  let prevFamilyISOs = [...task.treeISOs];
  for (const node of next) {
    if (movedIDs.has(node.id) && node.startDateISO) {
      prevFamilyISOs = removeOneInstance(prevFamilyISOs, node.startDateISO);
    }
  }

  const oldRoot = task.rootID;
  for (let i = 0; i < next.length; i += 1) {
    if (next[i].rootID === oldRoot && !movedIDs.has(next[i].id)) {
      next[i] = { ...next[i], treeISOs: prevFamilyISOs };
    }
  }

  let newRoot = taskID;
  let newFamilyISOs: string[] = [];
  if (newParentID) {
    const parent = next.find((doc) => doc.id === newParentID);
    if (parent) {
      newRoot = parent.rootID;
      newFamilyISOs = [...parent.treeISOs];
    }
  }
  for (const node of next) {
    if (movedIDs.has(node.id) && node.startDateISO) newFamilyISOs.push(node.startDateISO);
  }

  next[index] = { ...next[index], parentID: newParentID };
  return next.map((doc) => {
    if (movedIDs.has(doc.id) || doc.rootID === newRoot) {
      return {
        ...doc,
        parentID: doc.id === taskID ? newParentID : doc.parentID,
        rootID: movedIDs.has(doc.id) ? newRoot : doc.rootID,
        treeISOs: newFamilyISOs,
      };
    }
    return doc;
  });
}

export function applyDeletion(taskID: string, docs: TaskRecord[]): TaskRecord[] {
  const task = docs.find((doc) => doc.id === taskID);
  if (!task) return docs;
  const removedIDs = new Set(subtreeIDs(taskID, docs));
  let newISOs = [...task.treeISOs];
  for (const node of docs) {
    if (removedIDs.has(node.id) && node.startDateISO) {
      newISOs = removeOneInstance(newISOs, node.startDateISO);
    }
  }
  const oldRoot = task.rootID;
  return docs
    .filter((doc) => !removedIDs.has(doc.id))
    .map((doc) => (doc.rootID === oldRoot ? { ...doc, treeISOs: newISOs } : doc));
}

export function nextOrderValue(maxOrderValue: number): number {
  return maxOrderValue + 1;
}

export function previousSibling(id: string, forest: TaskTree[]): TaskRecord | null {
  function search(nodes: TaskTree[]): TaskRecord | null {
    for (let i = 0; i < nodes.length; i += 1) {
      if (nodes[i].task.id === id) return i > 0 ? nodes[i - 1].task : null;
      const found = search(nodes[i].children);
      if (found) return found;
    }
    return null;
  }
  return search(forest);
}

export function parentIDOf(id: string, docs: TaskRecord[]): string | undefined {
  return docs.find((doc) => doc.id === id)?.parentID;
}

export function findInForest(id: string, forest: TaskTree[]): TaskTree | null {
  for (const node of forest) {
    if (node.task.id === id) return node;
    const child = findInForest(id, node.children);
    if (child) return child;
  }
  return null;
}
