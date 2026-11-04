import Foundation
import SwiftData

/// Local SwiftData row that mirrors `users/{uid}`.
@Model
final class UserProfile {
    @Attribute(.unique) var uid: String
    var email: String
    var maxOrderValue: Double
    var calendarTheme: String
    var fontScale: Double
    var defaultPhotoLayout: String
    var calSnapInterval: Double
    var listAreaWidthRatio: Double
    var listAreaHeightRatio: Double
    var listWidthSplit: Double
    var listHeightSplit: Double
    var simpleMode: Bool
    var photoUploadAutoArchive: Bool
    var photoCompressWhenAttachingToTask: Bool
    var hideRoutines: Bool
    var lastRanRoutines: String
    var nickname: String
    var avatarFilter: String
    var tagsJSON: Data
    var pixelsPerHour: Double
    var calColumnWidth: Double
    var didSeed: Bool
    var pendingSync: Bool
    var updatedAt: Date

    init(
        uid: String,
        email: String = "",
        maxOrderValue: Double = 10,
        calendarTheme: String = "mutedEarth",
        fontScale: Double = 0.75,
        defaultPhotoLayout: String = "split-view",
        calSnapInterval: Double = 1,
        listAreaWidthRatio: Double = 0.00223,
        listAreaHeightRatio: Double = 0.004,
        listWidthSplit: Double = 0.5,
        listHeightSplit: Double = 0.5,
        simpleMode: Bool = false,
        photoUploadAutoArchive: Bool = false,
        photoCompressWhenAttachingToTask: Bool = true,
        hideRoutines: Bool = true,
        lastRanRoutines: String = "",
        nickname: String = "",
        avatarFilter: String = "",
        tagsJSON: Data = Data("{}".utf8),
        pixelsPerHour: Double = 50,
        calColumnWidth: Double = 160,
        didSeed: Bool = false,
        pendingSync: Bool = true,
        updatedAt: Date = .now
    ) {
        self.uid = uid
        self.email = email
        self.maxOrderValue = maxOrderValue
        self.calendarTheme = calendarTheme
        self.fontScale = fontScale
        self.defaultPhotoLayout = defaultPhotoLayout
        self.calSnapInterval = calSnapInterval
        self.listAreaWidthRatio = listAreaWidthRatio
        self.listAreaHeightRatio = listAreaHeightRatio
        self.listWidthSplit = listWidthSplit
        self.listHeightSplit = listHeightSplit
        self.simpleMode = simpleMode
        self.photoUploadAutoArchive = photoUploadAutoArchive
        self.photoCompressWhenAttachingToTask = photoCompressWhenAttachingToTask
        self.hideRoutines = hideRoutines
        self.lastRanRoutines = lastRanRoutines
        self.nickname = nickname
        self.avatarFilter = avatarFilter
        self.tagsJSON = tagsJSON
        self.pixelsPerHour = pixelsPerHour
        self.calColumnWidth = calColumnWidth
        self.didSeed = didSeed
        self.pendingSync = pendingSync
        self.updatedAt = updatedAt
    }
}
