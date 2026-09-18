import Foundation
import Security

struct PersistedSession: Codable, Equatable, Sendable {
    var uid: String
    var email: String?
    var isAnonymous: Bool
    var provider: AuthProviderKind
}

enum AuthProviderKind: String, Codable, Sendable {
    case anonymous
    case google
    case apple
}

/// Keychain is the signed-build source of truth. Unsigned Debug (`CODE_SIGNING_ALLOWED=NO`)
/// often cannot persist Keychain across `simctl terminate`, so the same payload is also
/// written to Application Support. Restore reads Keychain first, then the file.
enum LocalSessionStore {
    private static let service = "life.actions.ios.session"
    private static let account = "current"

    static func load() -> PersistedSession? {
        if let session = loadFromKeychain() {
            try? writeFile(session, to: fileURL())
            return session
        }
        return try? readFile(from: fileURL())
    }

    static func save(_ session: PersistedSession) {
        try? writeFile(session, to: fileURL())
        saveToKeychain(session)
    }

    static func clear() {
        clearKeychain()
        try? FileManager.default.removeItem(at: fileURL())
    }

    static func fileURL() -> URL {
        let root = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSTemporaryDirectory(), isDirectory: true)
        let directory = root.appendingPathComponent("ActionsLife", isDirectory: true)
        return directory.appendingPathComponent("session.json")
    }

    static func encode(_ session: PersistedSession) throws -> Data {
        try JSONEncoder().encode(session)
    }

    static func decode(_ data: Data) throws -> PersistedSession {
        try JSONDecoder().decode(PersistedSession.self, from: data)
    }

    static func writeFile(_ session: PersistedSession, to url: URL) throws {
        try FileManager.default.createDirectory(
            at: url.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        try encode(session).write(to: url, options: .atomic)
    }

    static func readFile(from url: URL) throws -> PersistedSession? {
        guard FileManager.default.fileExists(atPath: url.path) else { return nil }
        return try decode(Data(contentsOf: url))
    }

    private static func loadFromKeychain() -> PersistedSession? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        guard status == errSecSuccess, let data = item as? Data else { return nil }
        return try? decode(data)
    }

    private static func saveToKeychain(_ session: PersistedSession) {
        guard let data = try? encode(session) else { return }
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
        SecItemDelete(query as CFDictionary)
        var insert = query
        insert[kSecValueData as String] = data
        insert[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
        SecItemAdd(insert as CFDictionary, nil)
    }

    private static func clearKeychain() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
        SecItemDelete(query as CFDictionary)
    }
}
