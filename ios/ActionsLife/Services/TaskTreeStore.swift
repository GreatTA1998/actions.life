import Foundation
import SwiftData

@MainActor
@Observable
final class TaskTreeStore {
    let uid: String
    private let context: ModelContext
    private let sync: SyncEngine

    private(set) var inbox: [TaskTree] = []
    private(set) var allSnapshots: [TaskSnapshot] = []
    private(set) var profile: UserProfile?
    private(set) var lastScheduledISO: String?
    var listHeightSplit: Double = 0.5

    init(context: ModelContext, uid: String) {
        self.context = context
        self.uid = uid
        self.sync = SyncEngine(context: context)
        reload()
    }

    func reload() {
        allSnapshots = fetchRecords().map { $0.snapshot() }
        inbox = TreeMaintenance.inboxForest(allSnapshots)
        profile = fetchProfile()
        if let profile {
            listHeightSplit = profile.listHeightSplit
        }
    }

    func tasks(on dayISO: String) -> [TaskSnapshot] {
        allSnapshots
            .filter { $0.startDateISO == dayISO }
            .sorted { lhs, rhs in
                (lhs.startTime.isEmpty ? "99:99" : lhs.startTime) < (rhs.startTime.isEmpty ? "99:99" : rhs.startTime)
            }
    }

    func task(id: String) -> TaskRecord? {
        fetchRecords().first { $0.id == id }
    }

    @discardableResult
    func create(
        name: String,
        parentID: String = "",
        onList: Bool = true,
        startDateISO: String = "",
        startTime: String = "",
        duration: Double = 30,
        notes: String = "",
        id: String? = nil,
        childrenLayout: String = "normal",
        isDone: Bool = false,
        imageDownloadURL: String = ""
    ) -> TaskRecord {
        let order = TreeMaintenance.nextOrderValue(maxOrderValue: profile?.maxOrderValue ?? 10)
        var snapshots = allSnapshots
        let newID = id ?? UUID().uuidString.replacingOccurrences(of: "-", with: "")
        var rootID = newID
        var treeISOs = [startDateISO].filter { !$0.isEmpty }
        if !parentID.isEmpty, let parent = snapshots.first(where: { $0.id == parentID }) {
            rootID = parent.rootID
            treeISOs = parent.treeISOs
            if !startDateISO.isEmpty {
                treeISOs.append(startDateISO)
            }
        }

        let record = TaskRecord(
            id: newID,
            ownerUID: uid,
            name: name,
            duration: duration,
            parentID: parentID,
            startTime: startTime,
            startDateISO: startDateISO,
            notes: notes,
            isDone: isDone,
            imageDownloadURL: imageDownloadURL,
            childrenLayout: childrenLayout,
            onList: onList,
            orderValue: order,
            treeISOs: treeISOs,
            rootID: rootID
        )
        context.insert(record)

        if !parentID.isEmpty, !startDateISO.isEmpty {
            applySnapshotsAfter { docs in
                for i in docs.indices where docs[i].rootID == rootID {
                    docs[i].treeISOs = treeISOs
                }
            }
        }

        bumpMaxOrder(to: order)
        sync.enqueue(uid: uid, kind: .create, collection: "tasks", documentID: record.id)
        save()
        return record
    }

    func rename(_ id: String, to name: String) {
        patch(id) { $0.name = name }
    }

    func setNotes(_ id: String, notes: String) {
        patch(id) { $0.notes = notes }
    }

    func setDuration(_ id: String, minutes: Double) {
        update(id) { $0.duration = max(1, minutes) }
    }

    func toggleDone(_ id: String) {
        update(id) { $0.isDone.toggle() }
    }

    func setCollapsed(_ id: String, isCollapsed: Bool) {
        update(id) { $0.isCollapsed = isCollapsed }
    }

    func schedule(_ id: String, dayISO: String, time: String? = nil, duration: Double? = nil) {
        applySnapshotsAfter { docs in
            TreeMaintenance.applyDateChange(taskID: id, newDate: dayISO, docs: &docs)
            if let index = docs.firstIndex(where: { $0.id == id }) {
                if let time {
                    docs[index].startTime = time
                }
                if let duration {
                    docs[index].duration = duration
                }
            }
        }
        sync.enqueue(uid: uid, kind: .batchTree, collection: "tasks", documentID: id)
        lastScheduledISO = dayISO.isEmpty ? nil : dayISO
        save()
    }

    func clearSchedule(_ id: String) {
        applySnapshotsAfter { docs in
            TreeMaintenance.applyDateChange(taskID: id, newDate: "", docs: &docs)
            if let index = docs.firstIndex(where: { $0.id == id }) {
                docs[index].startTime = ""
            }
        }
        sync.enqueue(uid: uid, kind: .batchTree, collection: "tasks", documentID: id)
        save()
    }

    func nest(_ id: String, under parentID: String) {
        applySnapshotsAfter { docs in
            TreeMaintenance.applyReparent(taskID: id, newParentID: parentID, docs: &docs)
        }
        sync.enqueue(uid: uid, kind: .batchTree, collection: "tasks", documentID: id)
        save()
    }

    func indent(_ id: String) {
        let sibling = TreeMaintenance.previousSibling(of: id, in: inbox)
        guard let sibling else { return }
        nest(id, under: sibling.id)
    }

    func outdent(_ id: String) {
        guard let currentParent = TreeMaintenance.parentID(of: id, in: allSnapshots),
              !currentParent.isEmpty
        else { return }
        let grandparent = TreeMaintenance.parentID(of: currentParent, in: allSnapshots) ?? ""
        nest(id, under: grandparent)
    }

    func archive(_ id: String) {
        let ids = Set(TreeMaintenance.subtreeIDs(of: id, in: allSnapshots))
        for record in fetchRecords() where ids.contains(record.id) {
            record.onList = false
            record.pendingSync = true
            record.updatedAt = .now
        }
        sync.enqueue(uid: uid, kind: .update, collection: "tasks", documentID: id)
        save()
    }

    func unarchive(_ id: String) {
        let ids = Set(TreeMaintenance.subtreeIDs(of: id, in: allSnapshots))
        for record in fetchRecords() where ids.contains(record.id) {
            record.onList = true
            record.pendingSync = true
            record.updatedAt = .now
        }
        sync.enqueue(uid: uid, kind: .update, collection: "tasks", documentID: id)
        save()
    }

    func deleteSubtree(_ id: String) {
        applySnapshotsAfter { docs in
            TreeMaintenance.applyDeletion(taskID: id, docs: &docs)
        }
        sync.enqueue(uid: uid, kind: .delete, collection: "tasks", documentID: id)
        save()
    }

    func addSubtask(under parentID: String, name: String) {
        create(name: name, parentID: parentID, onList: true)
    }

    func setListHeightSplit(_ value: Double) {
        listHeightSplit = min(0.85, max(0.25, value))
        if let profile {
            profile.listHeightSplit = listHeightSplit
            profile.updatedAt = .now
        }
        try? context.save()
    }

    func seedGuestDataIfNeeded() {
        guard let profile, !profile.didSeed else { return }
        SeedData.insert(into: self)
        profile.didSeed = true
        profile.updatedAt = .now
        try? context.save()
        reload()
    }

    /// In-place edit that keeps the TextField focused (no inbox rebuild).
    private func patch(_ id: String, mutate: (TaskRecord) -> Void) {
        guard let record = task(id: id) else { return }
        mutate(record)
        record.pendingSync = true
        record.updatedAt = .now
        sync.enqueue(uid: uid, kind: .update, collection: "tasks", documentID: id)
        try? context.save()
    }

    func persistVisibleState() {
        try? context.save()
        reload()
    }

    private func update(_ id: String, mutate: (TaskRecord) -> Void) {
        guard let record = task(id: id) else { return }
        mutate(record)
        record.pendingSync = true
        record.updatedAt = .now
        sync.enqueue(uid: uid, kind: .update, collection: "tasks", documentID: id)
        save()
    }

    private func applySnapshotsAfter(_ transform: (inout [TaskSnapshot]) -> Void) {
        var snapshots = fetchRecords().map { $0.snapshot() }
        transform(&snapshots)
        let byID = Dictionary(uniqueKeysWithValues: snapshots.map { ($0.id, $0) })
        for record in fetchRecords() {
            if let snapshot = byID[record.id] {
                record.apply(snapshot)
            } else {
                context.delete(record)
            }
        }
    }

    private func bumpMaxOrder(to value: Double) {
        if let profile {
            profile.maxOrderValue = value
            profile.updatedAt = .now
            profile.pendingSync = true
        }
    }

    private func save() {
        try? context.save()
        reload()
    }

    private func fetchRecords() -> [TaskRecord] {
        let uid = self.uid
        let descriptor = FetchDescriptor<TaskRecord>(
            predicate: #Predicate { $0.ownerUID == uid && !$0.isTombstone },
            sortBy: [SortDescriptor(\.orderValue)]
        )
        return (try? context.fetch(descriptor)) ?? []
    }

    private func fetchProfile() -> UserProfile? {
        let uid = self.uid
        var descriptor = FetchDescriptor<UserProfile>(
            predicate: #Predicate { $0.uid == uid }
        )
        descriptor.fetchLimit = 1
        return try? context.fetch(descriptor).first
    }
}
