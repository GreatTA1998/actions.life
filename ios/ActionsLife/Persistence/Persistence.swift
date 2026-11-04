import Foundation
import SwiftData

enum Persistence {
    static let schema = Schema([
        TaskRecord.self,
        UserProfile.self,
        TemplateRecord.self,
        SyncOperation.self
    ])

    static func makeContainer(inMemory: Bool = false, name: String = "ActionsLife") -> ModelContainer {
        let configuration = ModelConfiguration(
            name,
            schema: schema,
            isStoredInMemoryOnly: inMemory
        )
        do {
            return try ModelContainer(for: schema, configurations: [configuration])
        } catch {
            fatalError("SwiftData container failed: \(error)")
        }
    }
}
