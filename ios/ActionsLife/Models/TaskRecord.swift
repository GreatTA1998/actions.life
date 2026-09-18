import Foundation
import SwiftData

/// Local SwiftData row that mirrors `users/{uid}/tasks/{id}` on Firestore.
@Model
final class TaskRecord {
    @Attribute(.unique) var id: String
    var ownerUID: String

    var name: String
    var duration: Double
    var parentID: String
    var startTime: String
    var startDateISO: String
    var iconURL: String
    var timeZone: String
    var notes: String
    var templateID: String
    var isDone: Bool
    var imageDownloadURL: String
    var imageFullPath: String
    var childrenLayout: String
    var photoLayout: String
    var isCollapsed: Bool
    var tagIDs: [String]
    var onList: Bool
    var orderValue: Double
    var treeISOs: [String]
    var rootID: String

    var pendingSync: Bool
    var updatedAt: Date
    var isTombstone: Bool

    init(
        id: String = UUID().uuidString.replacingOccurrences(of: "-", with: ""),
        ownerUID: String,
        name: String = "",
        duration: Double = 30,
        parentID: String = "",
        startTime: String = "",
        startDateISO: String = "",
        iconURL: String = "",
        timeZone: String = TimeZone.current.identifier,
        notes: String = "",
        templateID: String = "",
        isDone: Bool = false,
        imageDownloadURL: String = "",
        imageFullPath: String = "",
        childrenLayout: String = "normal",
        photoLayout: String = "split-view",
        isCollapsed: Bool = false,
        tagIDs: [String] = [],
        onList: Bool = true,
        orderValue: Double,
        treeISOs: [String] = [],
        rootID: String = "",
        pendingSync: Bool = true,
        updatedAt: Date = .now,
        isTombstone: Bool = false
    ) {
        self.id = id
        self.ownerUID = ownerUID
        self.name = name
        self.duration = duration
        self.parentID = parentID
        self.startTime = startTime
        self.startDateISO = startDateISO
        self.iconURL = iconURL
        self.timeZone = timeZone
        self.notes = notes
        self.templateID = templateID
        self.isDone = isDone
        self.imageDownloadURL = imageDownloadURL
        self.imageFullPath = imageFullPath
        self.childrenLayout = childrenLayout
        self.photoLayout = photoLayout
        self.isCollapsed = isCollapsed
        self.tagIDs = tagIDs
        self.onList = onList
        self.orderValue = orderValue
        self.treeISOs = treeISOs
        self.rootID = rootID.isEmpty ? id : rootID
        self.pendingSync = pendingSync
        self.updatedAt = updatedAt
        self.isTombstone = isTombstone
    }

    func snapshot() -> TaskSnapshot {
        TaskSnapshot(
            id: id,
            parentID: parentID,
            rootID: rootID,
            startDateISO: startDateISO,
            orderValue: orderValue,
            name: name,
            onList: onList,
            isDone: isDone,
            isCollapsed: isCollapsed,
            treeISOs: treeISOs,
            startTime: startTime,
            duration: duration,
            notes: notes
        )
    }

    func apply(_ snapshot: TaskSnapshot) {
        parentID = snapshot.parentID
        rootID = snapshot.rootID
        startDateISO = snapshot.startDateISO
        orderValue = snapshot.orderValue
        name = snapshot.name
        onList = snapshot.onList
        isDone = snapshot.isDone
        isCollapsed = snapshot.isCollapsed
        treeISOs = snapshot.treeISOs
        startTime = snapshot.startTime
        duration = snapshot.duration
        notes = snapshot.notes
        updatedAt = .now
        pendingSync = true
    }
}
