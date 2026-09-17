import XCTest
@testable import ActionsLife

final class LocalSessionStoreTests: XCTestCase {
    func testSessionCodecRoundTrip() throws {
        let session = PersistedSession(
            uid: "guest-uid",
            email: nil,
            isAnonymous: true,
            provider: .anonymous
        )
        let data = try LocalSessionStore.encode(session)
        XCTAssertEqual(try LocalSessionStore.decode(data), session)
    }

    func testFileArchiveRoundTripIndependentOfKeychain() throws {
        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent("ActionsLife-tests", isDirectory: true)
            .appendingPathComponent(UUID().uuidString, isDirectory: true)
            .appendingPathComponent("session.json")
        let session = PersistedSession(
            uid: "restored-guest",
            email: nil,
            isAnonymous: true,
            provider: .anonymous
        )
        try LocalSessionStore.writeFile(session, to: url)
        XCTAssertEqual(try LocalSessionStore.readFile(from: url)?.uid, "restored-guest")
        try FileManager.default.removeItem(at: url.deletingLastPathComponent())
        XCTAssertNil(try LocalSessionStore.readFile(from: url))
    }
}
