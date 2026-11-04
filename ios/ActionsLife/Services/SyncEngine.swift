import Foundation
import SwiftData

/// Enqueues SwiftData mutations for later Firestore drain.
/// Slice 1 never blocks the UI on the network.
@MainActor
@Observable
final class SyncEngine {
    private let context: ModelContext

    init(context: ModelContext) {
        self.context = context
    }

    func enqueue(
        uid: String,
        kind: SyncKind,
        collection: String,
        documentID: String,
        payload: [String: String] = [:]
    ) {
        let data = (try? JSONEncoder().encode(payload)) ?? Data()
        context.insert(
            SyncOperation(
                ownerUID: uid,
                kind: kind,
                collectionName: collection,
                documentID: documentID,
                payloadJSON: data
            )
        )
    }

    func pendingCount(uid: String) -> Int {
        let descriptor = FetchDescriptor<SyncOperation>(
            predicate: #Predicate { $0.ownerUID == uid }
        )
        return (try? context.fetchCount(descriptor)) ?? 0
    }

    func drainIfPossible(uid: String) async {
        guard FirebaseBootstrap.isConfigured else { return }
        // Slice 3: map the outbox onto Firestore `users/{uid}/tasks` (named DB schema-compliant).
        _ = uid
    }
}
