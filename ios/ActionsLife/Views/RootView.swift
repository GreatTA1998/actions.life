import SwiftData
import SwiftUI

struct RootView: View {
    @Environment(AuthSession.self) private var auth

    var body: some View {
        Group {
            if let session = auth.session {
                HomeView(uid: session.uid)
                    .id(session.uid)
            } else {
                SignInView()
            }
        }
        .animation(.easeInOut(duration: 0.2), value: auth.session?.uid)
    }
}
