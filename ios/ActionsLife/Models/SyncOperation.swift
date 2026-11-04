import Foundation
import SwiftData

enum SyncKind: String, Codable, Sendable {
    case create
    case update
    case delete
    case batchTree
}

/// Local outbox row. Slice 1 enqueues writes; drain waits for Firebase configuration.
@Model
final class SyncOperation {
    @Attribute(.unique) var id: String
    var ownerUID: String
    var kindRaw: String
    var collectionName: String
    var documentID: String
    var payloadJSON: Data
    var createdAt: Date
    var attempts: Int

    var kind: SyncKind {
        get { SyncKind(rawValue: kindRaw) ?? .update }
        set { kindRaw = newValue.rawValue }
    }

    init(
        id: String = UUID().uuidString,
        ownerUID: String,
        kind: SyncKind,
        collectionName: String,
        documentID: String,
        payloadJSON: Data = Data(),
        createdAt: Date = .now,
        attempts: Int = 0
    ) {
        self.id = id
        self.ownerUID = ownerUID
        self.kindRaw = kind.rawValue
        self.collectionName = collectionName
        self.documentID = documentID
        self.payloadJSON = payloadJSON
        self.createdAt = createdAt
        self.attempts = attempts
    }
}
