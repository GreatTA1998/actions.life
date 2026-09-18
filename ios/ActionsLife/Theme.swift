import SwiftUI

enum Theme {
    static let listBackground = Color(red: 247 / 255, green: 242 / 255, blue: 237 / 255)
    static let calendarBackground = Color(red: 250 / 255, green: 246 / 255, blue: 243 / 255)
    static let navbarBackground = Color(red: 253 / 255, green: 249 / 255, blue: 246 / 255)
    static let grid = Color(red: 229 / 255, green: 231 / 255, blue: 235 / 255)
    static let ink = Color(red: 26 / 255, green: 26 / 255, blue: 26 / 255)
    static let secondaryInk = Color(red: 107 / 255, green: 114 / 255, blue: 128 / 255)
    static let accent = Color(red: 90 / 255, green: 122 / 255, blue: 80 / 255)
    static let block = Color(red: 110 / 255, green: 142 / 255, blue: 96 / 255).opacity(0.55)
    static let handle = Color.black.opacity(0.12)
}

enum DateISO {
    static let date = Date.ISO8601FormatStyle().year().month().day().dateSeparator(.dash)
    static let clock: Date.FormatStyle = .dateTime.hour(.twoDigits(amPM: .omitted)).minute(.twoDigits)

    static func dayString(from date: Date, calendar: Calendar = .current) -> String {
        let comps = calendar.dateComponents([.year, .month, .day], from: date)
        guard let year = comps.year, let month = comps.month, let day = comps.day else { return "" }
        return String(format: "%04d-%02d-%02d", year, month, day)
    }

    static func timeString(from date: Date, calendar: Calendar = .current) -> String {
        let comps = calendar.dateComponents([.hour, .minute], from: date)
        return String(format: "%02d:%02d", comps.hour ?? 0, comps.minute ?? 0)
    }

    static func date(fromDayISO value: String, calendar: Calendar = .current) -> Date? {
        guard value.count == 10 else { return nil }
        let parts = value.split(separator: "-").compactMap { Int($0) }
        guard parts.count == 3 else { return nil }
        return calendar.date(from: DateComponents(year: parts[0], month: parts[1], day: parts[2]))
    }

    static func minutes(fromClock value: String) -> Int? {
        let parts = value.split(whereSeparator: { $0 == ":" || $0 == "." }).compactMap { Int($0) }
        guard parts.count >= 2 else { return nil }
        return parts[0] * 60 + parts[1]
    }
}
