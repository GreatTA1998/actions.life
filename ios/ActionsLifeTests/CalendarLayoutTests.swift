import XCTest
@testable import ActionsLife

final class CalendarLayoutTests: XCTestCase {
    func testTenAMSitsAtTenOnTheDayCanvas() {
        let placed = CalendarLayout.placeTimed([event(time: "10:00", duration: 60)], pixelsPerHour: 50)
        XCTAssertEqual(placed.count, 1)
        XCTAssertEqual(placed[0].y, 10 * 50)
        XCTAssertEqual(placed[0].height, 50)
    }

    func testDurationMapsToHourHeight() {
        let placed = CalendarLayout.placeTimed([event(time: "08:30", duration: 106)], pixelsPerHour: 50)
        XCTAssertEqual(placed[0].y, 8.5 * 50, accuracy: 0.01)
        XCTAssertEqual(placed[0].height, 106.0 / 60 * 50, accuracy: 0.01)
    }

    func testMissingTimeGoesAllDayNotOnHourGrid() {
        let split = CalendarLayout.split(tasks: [
            event(id: "untimed", time: "", duration: 30),
            event(id: "timed", time: "10:00", duration: 30)
        ])
        XCTAssertEqual(split.allDay.map(\.id), ["untimed"])
        XCTAssertEqual(split.timed.map(\.id), ["timed"])
    }

    func testParsesTimesWithSeconds() {
        XCTAssertEqual(DateISO.minutes(fromClock: "10:00"), 600)
        XCTAssertEqual(DateISO.minutes(fromClock: "10:00:00"), 600)
        XCTAssertEqual(DateISO.minutes(fromClock: "07:15"), 435)
    }

    func testCanvasCoversFullDay() {
        XCTAssertEqual(CalendarLayout.hours().count, 24)
        XCTAssertEqual(CalendarLayout.canvasHeight(pixelsPerHour: 50), 24 * 50)
    }

    private func event(id: String = "timed", time: String, duration: Double) -> TaskSnapshot {
        TaskSnapshot(
            id: id,
            parentID: "",
            rootID: id,
            startDateISO: "2026-09-17",
            orderValue: 1,
            name: "Event",
            onList: false,
            isDone: false,
            isCollapsed: false,
            treeISOs: ["2026-09-17"],
            startTime: time,
            duration: duration,
            notes: ""
        )
    }
}
