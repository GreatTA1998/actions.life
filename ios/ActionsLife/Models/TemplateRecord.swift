import Foundation
import SwiftData

/// Local SwiftData row that mirrors `users/{uid}/templates/{id}`. Unused in slice 1 UI.
@Model
final class TemplateRecord {
    @Attribute(.unique) var id: String
    var ownerUID: String
    var name: String
    var duration: Double
    var startTime: String
    var orderValue: Double
    var tags: String
    var notes: String
    var imageDownloadURL: String
    var imageFullPath: String
    var iconURL: String
    var rrStr: String
    var prevEndISO: String
    var previewSpan: Double
    var isStarred: Bool
    var rootID: String
    var parentID: String
    var isDone: Bool
    var isCollapsed: Bool
    var pendingSync: Bool
    var updatedAt: Date

    init(
        id: String = UUID().uuidString.replacingOccurrences(of: "-", with: ""),
        ownerUID: String,
        name: String,
        duration: Double = 30,
        startTime: String = "",
        orderValue: Double,
        tags: String = "",
        notes: String = "",
        imageDownloadURL: String = "",
        imageFullPath: String = "",
        iconURL: String = "",
        rrStr: String = "",
        prevEndISO: String = "",
        previewSpan: Double = 14,
        isStarred: Bool = true,
        rootID: String = "",
        parentID: String = "",
        isDone: Bool = false,
        isCollapsed: Bool = false,
        pendingSync: Bool = true,
        updatedAt: Date = .now
    ) {
        self.id = id
        self.ownerUID = ownerUID
        self.name = name
        self.duration = duration
        self.startTime = startTime
        self.orderValue = orderValue
        self.tags = tags
        self.notes = notes
        self.imageDownloadURL = imageDownloadURL
        self.imageFullPath = imageFullPath
        self.iconURL = iconURL
        self.rrStr = rrStr
        self.prevEndISO = prevEndISO
        self.previewSpan = previewSpan
        self.isStarred = isStarred
        self.rootID = rootID.isEmpty ? id : rootID
        self.parentID = parentID
        self.isDone = isDone
        self.isCollapsed = isCollapsed
        self.pendingSync = pendingSync
        self.updatedAt = updatedAt
    }
}
