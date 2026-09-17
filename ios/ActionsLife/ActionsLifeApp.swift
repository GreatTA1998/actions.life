import SwiftData
import SwiftUI

@main
struct ActionsLifeApp: App {
    @State private var authSession: AuthSession
    private let container: ModelContainer

    init() {
        FirebaseBootstrap.configureIfPossible()
        let container = Persistence.makeContainer()
        self.container = container
        _authSession = State(initialValue: AuthSession(modelContainer: container))
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(authSession)
                .modelContainer(container)
                .tint(Theme.accent)
                .onOpenURL { url in
                    authSession.handleOpenURL(url)
                }
        }
    }
}
