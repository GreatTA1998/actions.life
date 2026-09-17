import SwiftUI

struct DayColumnView: View {
    let day: Date
    let tasks: [TaskSnapshot]
    let pixelsPerHour: Double
    @Binding var selectedTaskID: String?

    private let startHour = 6
    private let endHour = 22

    var body: some View {
        ScrollView {
            ZStack(alignment: .topLeading) {
                hourGrid
                ForEach(tasks) { task in
                    block(for: task)
                }
            }
            .padding(.leading, 8)
            .padding(.trailing, 12)
            .frame(minHeight: CGFloat(hours.count) * hourHeight)
        }
        .background(Theme.calendarBackground)
        .accessibilityLabel("Schedule for \(DateISO.dayString(from: day))")
    }

    private var hours: [Int] { Array(startHour...endHour) }
    private var hourHeight: CGFloat { CGFloat(max(36, pixelsPerHour)) }

    private var hourGrid: some View {
        VStack(spacing: 0) {
            ForEach(hours, id: \.self) { hour in
                HStack(alignment: .top, spacing: 8) {
                    Text(label(hour))
                        .font(.caption2)
                        .foregroundStyle(Theme.secondaryInk)
                        .frame(width: 36, alignment: .trailing)
                    Rectangle()
                        .fill(Theme.grid)
                        .frame(height: 1)
                }
                .frame(height: hourHeight, alignment: .top)
            }
        }
    }

    private func block(for task: TaskSnapshot) -> some View {
        let start = DateISO.minutes(fromClock: task.startTime) ?? (startHour * 60)
        let offsetMinutes = max(0, start - startHour * 60)
        let height = max(28, CGFloat(task.duration / 60.0) * hourHeight)
        return Button {
            selectedTaskID = task.id
        } label: {
            VStack(alignment: .leading, spacing: 2) {
                Text(task.name.isEmpty ? "Untitled" : task.name)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Theme.ink)
                    .lineLimit(2)
                if !task.startTime.isEmpty {
                    Text(task.startTime)
                        .font(.caption2)
                        .foregroundStyle(Theme.secondaryInk)
                }
            }
            .padding(8)
            .frame(maxWidth: .infinity, minHeight: height, alignment: .topLeading)
            .background(Theme.block, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        }
        .buttonStyle(.plain)
        .offset(x: 48, y: CGFloat(offsetMinutes) / 60.0 * hourHeight)
        .padding(.trailing, 4)
    }

    private func label(_ hour: Int) -> String {
        String(format: "%02d:00", hour)
    }
}
