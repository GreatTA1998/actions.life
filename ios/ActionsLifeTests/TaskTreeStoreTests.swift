import SwiftData
import XCTest
@testable import ActionsLife

@MainActor
final class TaskTreeStoreTests: XCTestCase {
    func testCreateNestScheduleAndReloadFromSameStore() throws {
        let container = Persistence.makeContainer(inMemory: true, name: "create-nest")
        let context = ModelContext(container)
        let uid = "test-user"
        context.insert(UserProfile(uid: uid))
        try context.save()

        let store = TaskTreeStore(context: context, uid: uid)
        let root = store.create(name: "Pack", onList: true)
        store.addSubtask(under: root.id, name: "Passport")
        store.schedule(root.id, dayISO: "2026-09-17", time: "09:30")

        XCTAssertEqual(store.inbox.count, 1)
        XCTAssertEqual(store.inbox[0].children.map(\.task.name), ["Passport"])
        XCTAssertEqual(store.tasks(on: "2026-09-17").map(\.name), ["Pack"])
        XCTAssertEqual(store.inbox[0].task.treeISOs, ["2026-09-17"])
        XCTAssertEqual(store.inbox[0].children[0].task.treeISOs, ["2026-09-17"])
        XCTAssertEqual(store.inbox[0].children[0].task.rootID, root.id)
    }

    func testLocalPersistenceSurvivesNewStoreOnSameContainer() throws {
        let container = Persistence.makeContainer(inMemory: true, name: "persist-reopen")
        let uid = "persist-user"
        do {
            let context = ModelContext(container)
            context.insert(UserProfile(uid: uid))
            let store = TaskTreeStore(context: context, uid: uid)
            store.create(name: "Survives relaunch", id: "keep-me")
        }

        let reopened = TaskTreeStore(context: ModelContext(container), uid: uid)
        XCTAssertEqual(reopened.inbox.map(\.task.name), ["Survives relaunch"])
        XCTAssertEqual(reopened.inbox.first?.id, "keep-me")
    }

    func testSeedCreatesNestedInboxAndCalendarBlocks() throws {
        let container = Persistence.makeContainer(inMemory: true, name: "seed-guest")
        let context = ModelContext(container)
        context.insert(UserProfile(uid: "seed-user"))
        try context.save()

        let store = TaskTreeStore(context: context, uid: "seed-user")
        store.seedGuestDataIfNeeded()

        let names = store.inbox.map(\.task.name)
        XCTAssertTrue(names.contains("TO-DO"))
        XCTAssertTrue(names.contains("Visa timeline"))
        let todo = store.inbox.first { $0.task.name == "TO-DO" }
        XCTAssertEqual(todo?.children.count, 4)
        XCTAssertFalse(store.tasks(on: DateISO.dayString(from: .now)).isEmpty)
    }

    func testScheduleDateWithoutTimeStaysAllDay() throws {
        let container = Persistence.makeContainer(inMemory: true, name: "all-day")
        let context = ModelContext(container)
        context.insert(UserProfile(uid: "all-day-user"))
        try context.save()

        let store = TaskTreeStore(context: context, uid: "all-day-user")
        let task = store.create(name: "Visa renewal", onList: true)
        store.schedule(task.id, dayISO: "2026-09-25")

        let scheduled = store.tasks(on: "2026-09-25").first
        XCTAssertEqual(scheduled?.name, "Visa renewal")
        XCTAssertEqual(scheduled?.startTime, "")
        let split = CalendarLayout.split(tasks: store.tasks(on: "2026-09-25"))
        XCTAssertEqual(split.allDay.map(\.id), [task.id])
        XCTAssertTrue(split.timed.isEmpty)

        store.schedule(task.id, dayISO: "2026-09-26")
        XCTAssertEqual(store.task(id: task.id)?.startTime, "")
        XCTAssertEqual(store.task(id: task.id)?.startDateISO, "2026-09-26")

        store.schedule(task.id, dayISO: "2026-09-26", time: "10:00")
        XCTAssertEqual(store.task(id: task.id)?.startTime, "10:00")
        XCTAssertEqual(CalendarLayout.split(tasks: store.tasks(on: "2026-09-26")).timed.map(\.id), [task.id])
        XCTAssertEqual(store.lastScheduledISO, "2026-09-26")
    }
}
