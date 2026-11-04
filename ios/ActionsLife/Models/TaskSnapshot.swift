import Foundation

/// Value-type view of a task used by tree algorithms and the UI.
struct TaskSnapshot: Equatable, Identifiable, Hashable, Sendable {
    var id: String
    var parentID: String
    var rootID: String
    var startDateISO: String
    var orderValue: Double
    var name: String
    var onList: Bool
    var isDone: Bool
    var isCollapsed: Bool
    var treeISOs: [String]
    var startTime: String
    var duration: Double
    var notes: String
}

struct TaskTree: Identifiable, Equatable, Hashable {
    var task: TaskSnapshot
    var children: [TaskTree]

    var id: String { task.id }
}

enum TreeMaintenance {
    static func nodesByParent(_ docs: [TaskSnapshot]) -> [String: [TaskSnapshot]] {
        let sorted = docs.sorted { $0.orderValue < $1.orderValue }
        var grouped: [String: [TaskSnapshot]] = ["": []]
        for doc in sorted {
            grouped[doc.id] = []
        }
        for doc in sorted {
            grouped[doc.parentID, default: []].append(doc)
        }
        return grouped
    }

    static func buildForest(_ docs: [TaskSnapshot]) -> [TaskTree] {
        let memo = nodesByParent(docs)
        func hydrate(_ node: TaskSnapshot) -> TaskTree {
            TaskTree(task: node, children: (memo[node.id] ?? []).map(hydrate))
        }
        return (memo[""] ?? []).map(hydrate)
    }

    static func inboxForest(_ docs: [TaskSnapshot]) -> [TaskTree] {
        buildForest(docs.filter { $0.onList })
    }

    static func subtreeIDs(of id: String, in docs: [TaskSnapshot]) -> [String] {
        let children = Dictionary(grouping: docs, by: \.parentID)
        var result = [id]
        func walk(_ current: String) {
            for child in children[current] ?? [] {
                result.append(child.id)
                walk(child.id)
            }
        }
        walk(id)
        return result
    }

    static func removeOneInstance(_ array: [String], item: String) -> [String] {
        guard let index = array.firstIndex(of: item) else { return array }
        var copy = array
        copy.remove(at: index)
        return copy
    }

    static func correctTreeISOs(prevDate: String, newDate: String, array: [String]) -> [String] {
        var next = array
        if !prevDate.isEmpty {
            next = removeOneInstance(next, item: prevDate)
        }
        if !newDate.isEmpty {
            next.append(newDate)
        }
        return next
    }

    static func applyDateChange(taskID: String, newDate: String, docs: inout [TaskSnapshot]) {
        guard let index = docs.firstIndex(where: { $0.id == taskID }) else { return }
        let task = docs[index]
        guard task.startDateISO != newDate else { return }
        let newISOs = correctTreeISOs(prevDate: task.startDateISO, newDate: newDate, array: task.treeISOs)
        docs[index].startDateISO = newDate
        for i in docs.indices where docs[i].rootID == task.rootID {
            docs[i].treeISOs = newISOs
        }
    }

    static func applyReparent(taskID: String, newParentID: String, docs: inout [TaskSnapshot]) {
        guard let index = docs.firstIndex(where: { $0.id == taskID }) else { return }
        let task = docs[index]
        guard task.parentID != newParentID else { return }
        guard newParentID != taskID else { return }
        if !newParentID.isEmpty {
            let descendantIDs = Set(subtreeIDs(of: taskID, in: docs))
            guard !descendantIDs.contains(newParentID) else { return }
        }

        let movedIDs = Set(subtreeIDs(of: taskID, in: docs))
        var prevFamilyISOs = task.treeISOs
        for node in docs where movedIDs.contains(node.id) && !node.startDateISO.isEmpty {
            prevFamilyISOs = removeOneInstance(prevFamilyISOs, item: node.startDateISO)
        }

        let oldRoot = task.rootID
        for i in docs.indices where docs[i].rootID == oldRoot && !movedIDs.contains(docs[i].id) {
            docs[i].treeISOs = prevFamilyISOs
        }

        var newRoot = taskID
        var newFamilyISOs: [String] = []
        if !newParentID.isEmpty, let parent = docs.first(where: { $0.id == newParentID }) {
            newRoot = parent.rootID
            newFamilyISOs = parent.treeISOs
        }
        for node in docs where movedIDs.contains(node.id) && !node.startDateISO.isEmpty {
            newFamilyISOs.append(node.startDateISO)
        }

        docs[index].parentID = newParentID
        for i in docs.indices where movedIDs.contains(docs[i].id) || docs[i].rootID == newRoot {
            docs[i].rootID = movedIDs.contains(docs[i].id) ? newRoot : docs[i].rootID
            docs[i].treeISOs = newFamilyISOs
        }
    }

    static func applyDeletion(taskID: String, docs: inout [TaskSnapshot]) {
        guard let task = docs.first(where: { $0.id == taskID }) else { return }
        let removedIDs = Set(subtreeIDs(of: taskID, in: docs))
        var newISOs = task.treeISOs
        for node in docs where removedIDs.contains(node.id) && !node.startDateISO.isEmpty {
            newISOs = removeOneInstance(newISOs, item: node.startDateISO)
        }
        let oldRoot = task.rootID
        docs.removeAll { removedIDs.contains($0.id) }
        for i in docs.indices where docs[i].rootID == oldRoot {
            docs[i].treeISOs = newISOs
        }
    }

    static func nextOrderValue(maxOrderValue: Double) -> Double {
        maxOrderValue + 1
    }

    static func previousSibling(of id: String, in forest: [TaskTree]) -> TaskSnapshot? {
        func search(_ nodes: [TaskTree]) -> TaskSnapshot? {
            for (index, node) in nodes.enumerated() {
                if node.id == id {
                    return index > 0 ? nodes[index - 1].task : nil
                }
                if let found = search(node.children) {
                    return found
                }
            }
            return nil
        }
        return search(forest)
    }

    static func parentID(of id: String, in docs: [TaskSnapshot]) -> String? {
        docs.first(where: { $0.id == id })?.parentID
    }
}
