import Foundation

@MainActor
enum SeedData {
    static func insert(into store: TaskTreeStore) {
        let today = DateISO.dayString(from: .now)
        let now = DateISO.timeString(from: .now)
        let tomorrow = DateISO.dayString(from: Calendar.current.date(byAdding: .day, value: 1, to: .now) ?? .now)
        let plusEight = DateISO.dayString(from: Calendar.current.date(byAdding: .day, value: 8, to: .now) ?? .now)
        let minusThreeMonths = DateISO.dayString(from: Calendar.current.date(byAdding: .month, value: -3, to: .now) ?? .now)
        let plusElevenMonths = DateISO.dayString(from: Calendar.current.date(byAdding: .month, value: 11, to: .now) ?? .now)

        store.create(
            name: "Bird-watching with family",
            onList: false,
            startDateISO: today,
            startTime: now,
            duration: 106,
            id: "photo-bird",
            isDone: true,
            imageDownloadURL: "https://i.imgur.com/waIioxd.jpeg"
        )
        store.create(
            name: "Drawing with friends",
            onList: false,
            startDateISO: tomorrow,
            startTime: now,
            duration: 106,
            id: "photo-dog",
            imageDownloadURL: "https://i.imgur.com/Pu7PxCi.jpeg"
        )

        store.create(name: "TO-DO", id: "getting-started")
        store.create(name: "Drag me to the calendar", parentID: "getting-started", id: "todo-drag")
        store.create(name: "Attach a photo", parentID: "getting-started", id: "todo-photo")
        store.create(
            name: "Draw a habit icon",
            parentID: "getting-started",
            notes: "Create a repeat template, then replace the checkbox with an icon",
            id: "todo-icon"
        )
        store.create(
            name: "Connect with Google Calendar",
            parentID: "getting-started",
            notes: "Multiple accounts can be associated",
            id: "todo-gcal"
        )

        store.create(name: "Visa timeline", id: "visa", childrenLayout: "timeline")
        store.create(
            name: "Startup visa",
            parentID: "visa",
            startDateISO: minusThreeMonths,
            id: "visa-startup",
            isDone: true
        )
        store.create(
            name: "Visa renewal",
            parentID: "visa",
            startDateISO: plusEight,
            id: "visa-renewal"
        )
        store.create(
            name: "Business Manager visa",
            parentID: "visa",
            startDateISO: plusElevenMonths,
            id: "visa-manager"
        )
    }
}
