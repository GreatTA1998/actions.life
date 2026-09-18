import SwiftUI

struct DayCalendarView: View {
    @Bindable var store: TaskTreeStore
    @Binding var selectedDay: Date
    @Binding var selectedTaskID: String?

    private let calendar = Calendar.current

    private var selectedISO: String { DateISO.dayString(from: selectedDay) }

    private var scheduledTasks: [TaskSnapshot] {
        store.allSnapshots
            .filter { $0.startDateISO == selectedISO }
            .sorted { lhs, rhs in
                (lhs.startTime.isEmpty ? "99:99" : lhs.startTime)
                    < (rhs.startTime.isEmpty ? "99:99" : rhs.startTime)
            }
    }

    var body: some View {
        VStack(spacing: 0) {
            dayStrip
            Divider().overlay(Theme.grid)
            DayColumnView(
                store: store,
                day: selectedDay,
                tasks: scheduledTasks,
                pixelsPerHour: store.profile?.pixelsPerHour ?? 50,
                selectedTaskID: $selectedTaskID
            )
        }
    }

    private var dayStrip: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(selectedDay, format: .dateTime.month(.wide).year())
                    .font(.headline)
                    .foregroundStyle(Theme.ink)
                Spacer()
                Text(selectedDay, format: .dateTime.weekday(.wide).month(.abbreviated).day())
                    .font(.subheadline)
                    .foregroundStyle(Theme.secondaryInk)
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)

            ScrollViewReader { proxy in
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(days, id: \.self) { day in
                            let iso = DateISO.dayString(from: day)
                            let count = store.allSnapshots.filter { $0.startDateISO == iso }.count
                            Button {
                                selectedDay = day
                            } label: {
                                VStack(spacing: 4) {
                                    Text(day, format: .dateTime.weekday(.narrow))
                                        .font(.caption2)
                                    Text(day, format: .dateTime.day())
                                        .font(.headline)
                                    Circle()
                                        .fill(count > 0 ? Theme.accent : Color.clear)
                                        .frame(width: 5, height: 5)
                                }
                                .foregroundStyle(calendar.isDate(day, inSameDayAs: selectedDay) ? Color.white : Theme.ink)
                                .frame(width: 44, height: 58)
                                .background(
                                    calendar.isDate(day, inSameDayAs: selectedDay) ? Theme.accent : Color.white.opacity(0.6),
                                    in: RoundedRectangle(cornerRadius: 10, style: .continuous)
                                )
                            }
                            .buttonStyle(.plain)
                            .id(iso)
                            .dropDestination(for: String.self) { ids, _ in
                                guard let id = ids.first else { return false }
                                store.schedule(id, dayISO: iso)
                                selectedDay = day
                                return true
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                }
                .onAppear {
                    proxy.scrollTo(DateISO.dayString(from: selectedDay), anchor: .center)
                }
                .onChange(of: selectedDay) { _, day in
                    proxy.scrollTo(DateISO.dayString(from: day), anchor: .center)
                }
            }
            .padding(.bottom, 8)
        }
    }

    private var days: [Date] {
        let start = calendar.date(byAdding: .day, value: -14, to: calendar.startOfDay(for: .now)) ?? .now
        return (0..<29).compactMap { calendar.date(byAdding: .day, value: $0, to: start) }
    }
}
