import SwiftUI

struct TaskDetailSheet: View {
    @Bindable var store: TaskTreeStore
    let taskID: String
    @Environment(\.dismiss) private var dismiss
    @State private var confirmDelete = false
    @State private var newSubtask = ""

    var body: some View {
        NavigationStack {
            Group {
                if let record = store.task(id: taskID) {
                    Form {
                        Section("Task") {
                            TextField("Name", text: nameBinding(record), axis: .vertical)
                            Toggle("Done", isOn: doneBinding(record))
                            Toggle("On inbox", isOn: listBinding(record))
                        }

                        Section("When") {
                            Toggle("Scheduled", isOn: scheduledBinding(record))
                            if !record.startDateISO.isEmpty {
                                DatePicker(
                                    "Date",
                                    selection: dateBinding(record),
                                    displayedComponents: .date
                                )
                                if record.startTime.isEmpty {
                                    Button("Add time") {
                                        store.schedule(record.id, dayISO: record.startDateISO, time: "09:00")
                                    }
                                } else {
                                    DatePicker(
                                        "Time",
                                        selection: timeBinding(record),
                                        displayedComponents: .hourAndMinute
                                    )
                                    Button("Make all-day") {
                                        store.schedule(record.id, dayISO: record.startDateISO, time: "")
                                    }
                                }
                            }
                            Stepper(value: durationBinding(record), in: 5...24 * 60, step: 5) {
                                Text("\(Int(record.duration)) minutes")
                            }
                            if !record.startDateISO.isEmpty {
                                Button("Clear date and time") {
                                    store.clearSchedule(record.id)
                                }
                            }
                        }

                        Section("Notes") {
                            TextField("Notes", text: notesBinding(record), axis: .vertical)
                                .lineLimit(3...8)
                        }

                        Section("Subtasks") {
                            ForEach(children(of: record.id)) { child in
                                Button {
                                    store.toggleDone(child.id)
                                } label: {
                                    HStack {
                                        Image(systemName: child.isDone ? "checkmark.circle.fill" : "circle")
                                            .foregroundStyle(Theme.accent)
                                        Text(child.name.isEmpty ? "Untitled" : child.name)
                                            .foregroundStyle(Theme.ink)
                                        Spacer()
                                        if !child.startDateISO.isEmpty {
                                            Text(child.startDateISO)
                                                .font(.caption)
                                                .foregroundStyle(Theme.secondaryInk)
                                        }
                                    }
                                }
                            }
                            HStack {
                                TextField("Add subtask", text: $newSubtask)
                                Button("Add") {
                                    let name = newSubtask.trimmingCharacters(in: .whitespacesAndNewlines)
                                    guard !name.isEmpty else { return }
                                    store.addSubtask(under: record.id, name: name)
                                    newSubtask = ""
                                }
                            }
                        }

                        Section {
                            Button("Archive from inbox") {
                                store.archive(record.id)
                                dismiss()
                            }
                            Button("Delete task and subtasks", role: .destructive) {
                                confirmDelete = true
                            }
                        }
                    }
                } else {
                    ContentUnavailableView("Task removed", systemImage: "trash")
                }
            }
            .navigationTitle("Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
            .onDisappear { store.persistVisibleState() }
            .confirmationDialog("Delete this task and its subtasks?", isPresented: $confirmDelete, titleVisibility: .visible) {
                Button("Delete", role: .destructive) {
                    store.deleteSubtree(taskID)
                    dismiss()
                }
                Button("Cancel", role: .cancel) {}
            }
        }
    }

    private func children(of id: String) -> [TaskSnapshot] {
        store.allSnapshots
            .filter { $0.parentID == id }
            .sorted { $0.orderValue < $1.orderValue }
    }

    private func nameBinding(_ record: TaskRecord) -> Binding<String> {
        Binding(
            get: { record.name },
            set: { store.rename(record.id, to: $0) }
        )
    }

    private func notesBinding(_ record: TaskRecord) -> Binding<String> {
        Binding(
            get: { record.notes },
            set: { store.setNotes(record.id, notes: $0) }
        )
    }

    private func doneBinding(_ record: TaskRecord) -> Binding<Bool> {
        Binding(
            get: { record.isDone },
            set: { _ in store.toggleDone(record.id) }
        )
    }

    private func listBinding(_ record: TaskRecord) -> Binding<Bool> {
        Binding(
            get: { record.onList },
            set: { onList in
                if onList { store.unarchive(record.id) } else { store.archive(record.id) }
            }
        )
    }

    private func durationBinding(_ record: TaskRecord) -> Binding<Double> {
        Binding(
            get: { record.duration },
            set: { store.setDuration(record.id, minutes: $0) }
        )
    }

    private func dateBinding(_ record: TaskRecord) -> Binding<Date> {
        Binding(
            get: { DateISO.date(fromDayISO: record.startDateISO) ?? Date() },
            set: { date in
                store.schedule(
                    record.id,
                    dayISO: DateISO.dayString(from: date)
                )
            }
        )
    }

    private func timeBinding(_ record: TaskRecord) -> Binding<Date> {
        Binding(
            get: {
                let day = DateISO.date(fromDayISO: record.startDateISO) ?? Date()
                let minutes = DateISO.minutes(fromClock: record.startTime) ?? (9 * 60)
                return Calendar.current.date(byAdding: .minute, value: minutes, to: Calendar.current.startOfDay(for: day)) ?? day
            },
            set: { date in
                let day = record.startDateISO.isEmpty ? DateISO.dayString(from: date) : record.startDateISO
                store.schedule(record.id, dayISO: day, time: DateISO.timeString(from: date))
            }
        )
    }

    private func scheduledBinding(_ record: TaskRecord) -> Binding<Bool> {
        Binding(
            get: { !record.startDateISO.isEmpty },
            set: { scheduled in
                if scheduled {
                    store.schedule(
                        record.id,
                        dayISO: DateISO.dayString(from: .now)
                    )
                } else {
                    store.clearSchedule(record.id)
                }
            }
        )
    }
}
