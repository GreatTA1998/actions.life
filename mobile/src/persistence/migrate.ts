import type { TaskRepository } from './repository';

export async function migrateUid(repo: TaskRepository, fromUid: string, toUid: string): Promise<void> {
  if (fromUid === toUid) return;
  const [tasks, profile, outbox] = await Promise.all([
    repo.loadTasks(fromUid),
    repo.loadProfile(fromUid),
    repo.loadOutbox(fromUid),
  ]);
  // Promote already copies then clears the source. A second migrate of the empty
  // source must not overwrite the destination.
  if (tasks.length === 0 && !profile && outbox.length === 0) return;
  const destTasks = await repo.loadTasks(toUid);
  if (tasks.length === 0 && destTasks.length > 0) return;
  await repo.replaceTasks(
    toUid,
    tasks.map((task) => ({ ...task, ownerUID: toUid, pendingSync: true })),
  );
  if (profile) {
    await repo.saveProfile({ ...profile, uid: toUid, pendingSync: true, updatedAt: Date.now() });
  }
  for (const op of outbox) {
    await repo.enqueue({ ...op, ownerUID: toUid });
  }
  await repo.replaceTasks(fromUid, []);
  await repo.clearOutbox(fromUid);
}
