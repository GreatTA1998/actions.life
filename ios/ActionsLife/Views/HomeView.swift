import SwiftData
import SwiftUI

struct HomeView: View {
    let uid: String
    @Environment(\.modelContext) private var modelContext
    @Environment(AuthSession.self) private var auth

    @State private var store: TaskTreeStore?
    @State private var selectedDay = Calendar.current.startOfDay(for: .now)
    @State private var selectedTaskID: String?
    @State private var composerText = ""
    @State private var showComposer = false
    @State private var composerParentID = ""
    @State private var dragStartSplit: Double?

    var body: some View {
        NavigationStack {
            Group {
                if let store {
                    GeometryReader { geo in
                        let split = store.listHeightSplit
                        let calendarHeight = max(220, geo.size.height * (1 - split))
                        VStack(spacing: 0) {
                            DayCalendarView(
                                store: store,
                                selectedDay: $selectedDay,
                                selectedTaskID: $selectedTaskID
                            )
                            .frame(height: calendarHeight)
                            .background(Theme.calendarBackground)

                            SplitHandle(
                                onChanged: { translation in
                                    let start = dragStartSplit ?? store.listHeightSplit
                                    if dragStartSplit == nil { dragStartSplit = start }
                                    store.setListHeightSplit(start - translation / geo.size.height)
                                },
                                onEnded: { dragStartSplit = nil }
                            )

                            InboxView(
                                store: store,
                                selectedTaskID: $selectedTaskID,
                                onAddRoot: { showComposer = true; composerParentID = "" },
                                onAddChild: { parent in
                                    composerParentID = parent
                                    showComposer = true
                                }
                            )
                            .frame(maxHeight: .infinity)
                        }
                    }
                    .sheet(item: selectedTaskBinding(store)) { record in
                        TaskDetailSheet(store: store, taskID: record.id)
                    }
                    .onChange(of: store.lastScheduledISO) { _, iso in
                        guard let iso, let date = DateISO.date(fromDayISO: iso) else { return }
                        selectedDay = Calendar.current.startOfDay(for: date)
                    }
                } else {
                    Theme.listBackground.ignoresSafeArea()
                }
            }
            .background(Theme.listBackground.ignoresSafeArea())
            .navigationTitle("Today")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Today") {
                        selectedDay = Calendar.current.startOfDay(for: .now)
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Button("Add task", systemImage: "plus") {
                            composerParentID = ""
                            showComposer = true
                        }
                        Button("Jump to today", systemImage: "calendar") {
                            selectedDay = Calendar.current.startOfDay(for: .now)
                        }
                        Divider()
                        Button("Sign out", systemImage: "rectangle.portrait.and.arrow.right", role: .destructive) {
                            auth.signOut()
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
            .alert("New task", isPresented: $showComposer) {
                TextField("Task name", text: $composerText)
                Button("Add") {
                    let name = composerText.trimmingCharacters(in: .whitespacesAndNewlines)
                    if !name.isEmpty {
                        store?.create(name: name, parentID: composerParentID)
                    }
                    composerText = ""
                    composerParentID = ""
                }
                Button("Cancel", role: .cancel) {
                    composerText = ""
                    composerParentID = ""
                }
            } message: {
                Text(composerParentID.isEmpty ? "Added to the inbox." : "Nested under the selected task.")
            }
        }
        .onAppear {
            if store == nil {
                let next = TaskTreeStore(context: modelContext, uid: uid)
                next.seedGuestDataIfNeeded()
                store = next
            }
        }
    }

    private func selectedTaskBinding(_ store: TaskTreeStore) -> Binding<TaskIdentity?> {
        Binding(
            get: {
                guard let id = selectedTaskID else { return nil }
                return TaskIdentity(id: id)
            },
            set: { selectedTaskID = $0?.id }
        )
    }
}

private struct TaskIdentity: Identifiable {
    var id: String
}

private struct SplitHandle: View {
    var onChanged: (CGFloat) -> Void
    var onEnded: () -> Void

    var body: some View {
        Capsule()
            .fill(Theme.handle)
            .frame(width: 48, height: 5)
            .padding(.vertical, 8)
            .frame(maxWidth: .infinity)
            .background(Theme.navbarBackground)
            .gesture(
                DragGesture()
                    .onChanged { value in
                        onChanged(value.translation.height)
                    }
                    .onEnded { _ in
                        onEnded()
                    }
            )
            .accessibilityLabel("Resize list")
    }
}
