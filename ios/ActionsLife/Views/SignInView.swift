import AuthenticationServices
import SwiftUI

struct SignInView: View {
    @Environment(AuthSession.self) private var auth
    @State private var isWorking = false

    var body: some View {
        ZStack {
            Theme.listBackground.ignoresSafeArea()
            VStack(spacing: 28) {
                Spacer()
                VStack(spacing: 12) {
                    Image(systemName: "leaf.fill")
                        .font(.system(size: 42))
                        .foregroundStyle(Theme.accent)
                    Text("actions.life")
                        .font(.largeTitle.weight(.semibold))
                        .foregroundStyle(Theme.ink)
                    Text("A hierarchical planner. List beside calendar, and every task can have subtasks.")
                        .font(.body)
                        .foregroundStyle(Theme.secondaryInk)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 28)
                }

                VStack(spacing: 12) {
                    Button {
                        Task { await run { await auth.continueAsGuest() } }
                    } label: {
                        label("Continue as guest", systemImage: "person")
                    }
                    .buttonStyle(SignInButtonStyle(filled: true))

                    Button {
                        Task { await run { await auth.signInWithGoogle() } }
                    } label: {
                        label("Continue with Google", systemImage: "g.circle")
                    }
                    .buttonStyle(SignInButtonStyle(filled: false))

                    SignInWithAppleButton(.continue) { request in
                        request.requestedScopes = [.email, .fullName]
                        request.nonce = AppleNonce.hashed()
                    } onCompletion: { result in
                        switch result {
                        case .success(let authorization):
                            Task { await run { await auth.completeAppleSignIn(authorization) } }
                        case .failure(let error):
                            auth.lastError = error.localizedDescription
                        }
                    }
                    .signInWithAppleButtonStyle(.black)
                    .frame(height: 48)
                    .clipShape(Capsule())
                }
                .padding(.horizontal, 28)
                .disabled(isWorking)

                if let message = auth.lastError {
                    Text(message)
                        .font(.footnote)
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 28)
                }

                Text(auth.isFirebaseReady
                     ? "Guest works offline. Google Sign-In uses the same Firebase project as the web app."
                     : "Works offline. Google Sign-In needs GoogleService-Info.plist in this build.")
                    .font(.caption)
                    .foregroundStyle(Theme.secondaryInk)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)

                Spacer()
            }
        }
    }

    private func label(_ title: String, systemImage: String) -> some View {
        Label(title, systemImage: systemImage)
            .font(.headline)
            .frame(maxWidth: .infinity)
            .frame(height: 48)
    }

    private func run(_ work: @escaping () async -> Void) async {
        isWorking = true
        await work()
        isWorking = false
    }
}

private struct SignInButtonStyle: ButtonStyle {
    var filled: Bool

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .foregroundStyle(filled ? Color.white : Theme.ink)
            .background(filled ? Theme.accent : Color.white, in: Capsule())
            .overlay {
                Capsule().strokeBorder(Color.black.opacity(0.12), lineWidth: filled ? 0 : 1)
            }
            .opacity(configuration.isPressed ? 0.82 : 1)
    }
}
