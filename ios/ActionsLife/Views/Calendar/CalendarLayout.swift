import CoreGraphics
import Foundation

enum CalendarLayout {
    static let startHour = 0
    static let endHour = 24
    static let timeAxisWidth: CGFloat = 44
    static let minimumEventHeight: CGFloat = 28

    static func hourHeight(pixelsPerHour: Double) -> CGFloat {
        CGFloat(max(36, pixelsPerHour))
    }

    static func canvasHeight(pixelsPerHour: Double) -> CGFloat {
        CGFloat(endHour - startHour) * hourHeight(pixelsPerHour: pixelsPerHour)
    }

    static func hours() -> [Int] {
        Array(startHour..<endHour)
    }

    struct PlacedEvent: Identifiable, Equatable {
        var id: String { task.id }
        var task: TaskSnapshot
        var y: CGFloat
        var height: CGFloat
    }

    static func split(tasks: [TaskSnapshot]) -> (allDay: [TaskSnapshot], timed: [TaskSnapshot]) {
        var allDay: [TaskSnapshot] = []
        var timed: [TaskSnapshot] = []
        for task in tasks {
            if task.startTime.isEmpty {
                allDay.append(task)
            } else {
                timed.append(task)
            }
        }
        return (allDay, timed)
    }

    static func placeTimed(_ tasks: [TaskSnapshot], pixelsPerHour: Double) -> [PlacedEvent] {
        let hourH = hourHeight(pixelsPerHour: pixelsPerHour)
        return tasks.map { task in
            let startMinutes = DateISO.minutes(fromClock: task.startTime) ?? 0
            let clampedStart = min(max(startMinutes, 0), endHour * 60 - 1)
            let y = CGFloat(clampedStart - startHour * 60) / 60 * hourH
            let durationHeight = CGFloat(max(task.duration, 15) / 60) * hourH
            let height = min(max(minimumEventHeight, durationHeight), canvasHeight(pixelsPerHour: pixelsPerHour) - y)
            return PlacedEvent(task: task, y: y, height: height)
        }
    }

    static func scrollTargetHour(now: Date = .now, calendar: Calendar = .current) -> Int {
        let hour = calendar.component(.hour, from: now)
        return min(max(hour - 1, startHour), max(endHour - 4, startHour))
    }
}
