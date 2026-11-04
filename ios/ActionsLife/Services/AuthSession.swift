import AuthenticationServices
import Foundation
import SwiftData
import UIKit

#if canImport(FirebaseAuth)
import FirebaseAuth
import FirebaseCore
#endif

#if canImport(GoogleSignIn)
import GoogleSignIn
#endif

enum AuthConfigurationError: LocalizedError {
    case missingGoogleServiceInfo
    case missingPresenter
    case cancelled
    case underlying(String)

    var errorDescription: String? {
        switch self {
        case .missingGoogleServiceInfo:
            return "Add GoogleService-Info.plist and an iOS OAuth client to enable live Google Sign-In. Guest mode already works offline."
        case .missingPresenter:
            return "Could not find a window to present Google Sign-In."
        case .cancelled:
            return "Sign-in was cancelled."
        case .underlying(let message):
            return message
        }
    }
}

@MainActor
@Observable
final class AuthSession {
    enum State: Equatable {
        case signedOut
        case signedIn(PersistedSession)
    }

    private(set) var state: State = .signedOut
    var lastError: String?
    private let modelContainer: ModelContainer

    var session: PersistedSession? {
        if case .signedIn(let session) = state { return session }
        return nil
    }

    var isFirebaseReady: Bool { FirebaseBootstrap.isConfigured }

    init(modelContainer: ModelContainer) {
        self.modelContainer = modelContainer
        restore()
    }

    func restore() {
        #if canImport(FirebaseAuth)
        if FirebaseBootstrap.isConfigured, let user = Auth.auth().currentUser {
            let persisted = PersistedSession(
                uid: user.uid,
                email: user.email,
                isAnonymous: user.isAnonymous,
                provider: user.isAnonymous ? .anonymous : inferredProvider(user)
            )
            LocalSessionStore.save(persisted)
            state = .signedIn(persisted)
            ensureProfile(for: persisted)
            return
        }
        #endif

        if let persisted = LocalSessionStore.load() {
            state = .signedIn(persisted)
            ensureProfile(for: persisted)
        } else {
            state = .signedOut
        }
    }

    func continueAsGuest() async {
        lastError = nil

        #if canImport(FirebaseAuth)
        if FirebaseBootstrap.isConfigured {
            do {
                let result = try await Auth.auth().signInAnonymously()
                adopt(
                    PersistedSession(
                        uid: result.user.uid,
                        email: nil,
                        isAnonymous: true,
                        provider: .anonymous
                    ),
                    seedIfNeeded: true
                )
                return
            } catch {
                // Fall through to a local guest so the app still opens offline.
            }
        }
        #endif

        if case .signedIn(let existing) = state, existing.isAnonymous {
            return
        }

        adopt(
            PersistedSession(
                uid: Self.makeLocalUID(),
                email: nil,
                isAnonymous: true,
                provider: .anonymous
            ),
            seedIfNeeded: true
        )
    }

    func signInWithGoogle() async {
        lastError = nil
        guard FirebaseBootstrap.isConfigured else {
            lastError = AuthConfigurationError.missingGoogleServiceInfo.localizedDescription
            return
        }

        #if canImport(GoogleSignIn) && canImport(FirebaseAuth)
        guard let clientID = FirebaseApp.app()?.options.clientID else {
            lastError = AuthConfigurationError.missingGoogleServiceInfo.localizedDescription
            return
        }
        if let serverClientID = Bundle.main.object(forInfoDictionaryKey: "GIDServerClientID") as? String,
           !serverClientID.isEmpty {
            GIDSignIn.sharedInstance.configuration = GIDConfiguration(
                clientID: clientID,
                serverClientID: serverClientID
            )
        } else {
            GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientID)
        }
        guard let presenter = Self.topViewController() else {
            lastError = AuthConfigurationError.missingPresenter.localizedDescription
            return
        }

        do {
            let gid = try await GIDSignIn.sharedInstance.signIn(withPresenting: presenter)
            guard let idToken = gid.user.idToken?.tokenString else {
                lastError = "Google Sign-In did not return an ID token."
                return
            }
            let credential = GoogleAuthProvider.credential(
                withIDToken: idToken,
                accessToken: gid.user.accessToken.tokenString
            )
            try await finishFederatedSignIn(credential: credential, provider: .google, email: gid.user.profile?.email)
        } catch {
            lastError = (error as NSError).code == GIDSignInError.canceled.rawValue
                ? AuthConfigurationError.cancelled.localizedDescription
                : error.localizedDescription
        }
        #else
        lastError = AuthConfigurationError.missingGoogleServiceInfo.localizedDescription
        #endif
    }

    func completeAppleSignIn(_ authorization: ASAuthorization) async {
        lastError = nil
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential else {
            lastError = "Apple Sign-In returned an unexpected credential."
            return
        }

        #if canImport(FirebaseAuth)
        if FirebaseBootstrap.isConfigured {
            guard let token = credential.identityToken,
                  let tokenString = String(data: token, encoding: .utf8)
            else {
                lastError = "Apple Sign-In did not return an identity token."
                return
            }
            let nonce = AppleSignInNonce.current ?? ""
            let oauth = OAuthProvider.appleCredential(
                withIDToken: tokenString,
                rawNonce: nonce,
                fullName: credential.fullName
            )
            do {
                try await finishFederatedSignIn(
                    credential: oauth,
                    provider: .apple,
                    email: credential.email
                )
                return
            } catch {
                lastError = error.localizedDescription
                return
            }
        }
        #endif

        adopt(
            PersistedSession(
                uid: "apple-\(credential.user)",
                email: credential.email,
                isAnonymous: false,
                provider: .apple
            ),
            seedIfNeeded: true
        )
    }

    func signOut() {
        #if canImport(FirebaseAuth)
        if FirebaseBootstrap.isConfigured {
            try? Auth.auth().signOut()
        }
        #endif
        #if canImport(GoogleSignIn)
        GIDSignIn.sharedInstance.signOut()
        #endif
        LocalSessionStore.clear()
        state = .signedOut
        lastError = nil
    }

    func handleOpenURL(_ url: URL) {
        #if canImport(GoogleSignIn)
        _ = GIDSignIn.sharedInstance.handle(url)
        #endif
    }

    #if canImport(FirebaseAuth)
    private func finishFederatedSignIn(credential: AuthCredential, provider: AuthProviderKind, email: String?) async throws {
        if let current = Auth.auth().currentUser, current.isAnonymous {
            do {
                let result = try await current.link(with: credential)
                adopt(
                    PersistedSession(
                        uid: result.user.uid,
                        email: result.user.email ?? email,
                        isAnonymous: false,
                        provider: provider
                    ),
                    seedIfNeeded: false
                )
                return
            } catch {
                let ns = error as NSError
                let alreadyInUse = ns.domain == AuthErrorDomain && ns.code == AuthErrorCode.credentialAlreadyInUse.rawValue
                guard alreadyInUse else { throw error }
            }
        }

        let result = try await Auth.auth().signIn(with: credential)
        adopt(
            PersistedSession(
                uid: result.user.uid,
                email: result.user.email ?? email,
                isAnonymous: false,
                provider: provider
            ),
            seedIfNeeded: false
        )
    }

    private func inferredProvider(_ user: User) -> AuthProviderKind {
        if user.providerData.contains(where: { $0.providerID == "google.com" }) {
            return .google
        }
        if user.providerData.contains(where: { $0.providerID == "apple.com" }) {
            return .apple
        }
        return .anonymous
    }
    #endif

    private func adopt(_ session: PersistedSession, seedIfNeeded: Bool) {
        LocalSessionStore.save(session)
        state = .signedIn(session)
        ensureProfile(for: session)
        if seedIfNeeded {
            let context = ModelContext(modelContainer)
            let store = TaskTreeStore(context: context, uid: session.uid)
            store.seedGuestDataIfNeeded()
        }
    }

    private func ensureProfile(for session: PersistedSession) {
        let context = ModelContext(modelContainer)
        let uid = session.uid
        var descriptor = FetchDescriptor<UserProfile>(
            predicate: #Predicate { $0.uid == uid }
        )
        descriptor.fetchLimit = 1
        if let existing = try? context.fetch(descriptor).first {
            existing.email = session.email ?? existing.email
            try? context.save()
            return
        }
        context.insert(
            UserProfile(uid: session.uid, email: session.email ?? "")
        )
        try? context.save()
    }

    private static func makeLocalUID() -> String {
        UUID().uuidString.replacingOccurrences(of: "-", with: "").lowercased()
    }

    private static func topViewController() -> UIViewController? {
        let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        let window = scenes.flatMap(\.windows).first(where: \.isKeyWindow) ?? scenes.first?.windows.first
        var controller = window?.rootViewController
        while let presented = controller?.presentedViewController {
            controller = presented
        }
        return controller
    }
}

enum AppleSignInNonce {
    static var current: String?
}
