import Foundation

#if canImport(FirebaseCore)
import FirebaseCore
import FirebaseFirestore
#endif

/// Configures Firebase only when `GoogleService-Info.plist` is in the bundle.
/// The app must launch and render SwiftData without this file and without a network.
enum FirebaseBootstrap {
    private(set) static var isConfigured = false

    static let firestoreDatabaseID = "schema-compliant"

    static var hasGoogleServiceInfo: Bool {
        Bundle.main.url(forResource: "GoogleService-Info", withExtension: "plist") != nil
    }

    static func configureIfPossible() {
        guard !isConfigured else { return }
        guard hasGoogleServiceInfo else { return }

        #if canImport(FirebaseCore)
        FirebaseApp.configure()
        configureNamedFirestore()
        isConfigured = true
        #endif
    }

    #if canImport(FirebaseCore)
    private static func configureNamedFirestore() {
        let store = Firestore.firestore(database: firestoreDatabaseID)
        let settings = FirestoreSettings()
        settings.cacheSettings = PersistentCacheSettings()
        store.settings = settings
    }
    #endif
}
