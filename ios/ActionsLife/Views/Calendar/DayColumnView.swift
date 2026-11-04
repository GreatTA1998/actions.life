import SwiftUI

struct DayColumnView: View {
    @Bindable var store: TaskTreeStore
    let day: Date
    let tasks: [TaskSnapshot]
    let pixelsPerHour: Double
    @Binding var selectedTaskID: String?

    private var hourHeight: CGFloat { CalendarLayout.hourHeight(pixelsPerHour: pixelsPerHour) }
    private var canvasHeight: CGFloat { CalendarLayout.canvasHeight(pixelsPerHour: pixelsPerHour) }
    private var split: (allDay: [TaskSnapshot], timed: [TaskSnapshot]) { CalendarLayout.split(tasks: tasks) }
    private var placed: [CalendarLayout.PlacedEvent] {
        CalendarLayout.placeTimed(split.timed, pixelsPerHour: pixelsPerHour)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if !split.allDay.isEmpty {
                allDaySection
            }
            ScrollViewReader { proxy in
                ScrollView {
                    timedCanvas
                }
                .onAppear {
                    proxy.scrollTo(hourID(CalendarLayout.scrollTargetHour()), anchor: .top)
                }
                .onChange(of: DateISO.dayString(from: day)) { _, _ in
                    proxy.scrollTo(hourID(CalendarLayout.scrollTargetHour()), anchor: .top)
                }
            }
        }
        .background(Theme.calendarBackground)
        .accessibilityLabel("Schedule for \(DateISO.dayString(from: day))")
        .dropDestination(for: String.self) { ids, _ in
            guard let id = ids.first else { return false }
            store.schedule(id, dayISO: DateISO.dayString(from: day))
            return true
        }
    }

    private var allDaySection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("All day")
                .font(.caption2.weight(.semibold))
                .foregroundStyle(Theme.secondaryInk)
            ForEach(split.allDay) { task in
                Button {
                    selectedTaskID = task.id
                } label: {
                    Text(task.name.isEmpty ? "Untitled" : task.name)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Theme.ink)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 8)
                        .background(Theme.block, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
    }

    private var timedCanvas: some View {
        ZStack(alignment: .topLeading) {
            hourGrid
            ForEach(placed) { event in
                VStack(spacing: 0) {
                    Color.clear.frame(height: event.y)
                    timedBlock(event)
                    Spacer(minLength: 0)
                }
                .frame(height: canvasHeight, alignment: .top)
                .padding(.leading, CalendarLayout.timeAxisWidth)
                .padding(.trailing, 8)
            }
        }
        .frame(height: canvasHeight, alignment: .topLeading)
        .clipped()
    }

    private var hourGrid: some View {
        VStack(spacing: 0) {
            ForEach(CalendarLayout.hours(), id: \.self) { hour in
                HStack(alignment: .top, spacing: 8) {
                    Text(label(hour))
                        .font(.caption2)
                        .foregroundStyle(Theme.secondaryInk)
                        .frame(width: CalendarLayout.timeAxisWidth - 8, alignment: .trailing)
                    Rectangle()
                        .fill(Theme.grid)
                        .frame(height: 1)
                }
                .frame(height: hourHeight, alignment: .top)
                .id(hourID(hour))
            }
        }
    }

    private func timedBlock(_ event: CalendarLayout.PlacedEvent) -> some View {
        Button {
            selectedTaskID = event.task.id
        } label: {
            VStack(alignment: .leading, spacing: 2) {
                Text(event.task.name.isEmpty ? "Untitled" : event.task.name)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Theme.ink)
                    .lineLimit(2)
                Text(event.task.startTime)
                    .font(.caption2)
                    .foregroundStyle(Theme.secondaryInk)
            }
            .padding(8)
            .frame(maxWidth: .infinity, minHeight: event.height, maxHeight: event.height, alignment: .topLeading)
            .background(Theme.block, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .stroke(Theme.accent.opacity(0.45), lineWidth: 1)
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(event.task.name), \(event.task.startTime)")
    }

    private func hourID(_ hour: Int) -> String {
        "hour-\(DateISO.dayString(from: day))-\(hour)"
    }

    private func label(_ hour: Int) -> String {
        String(format: "%02d:00", hour)
    }
}
