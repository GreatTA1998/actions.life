import SwiftUI

struct TaskRowView: View {
    let tree: TaskTree
    let depth: Int
    @Bindable var store: TaskTreeStore
    @Binding var selectedTaskID: String?
    var onAddChild: (String) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .center, spacing: 8) {
                if !tree.children.isEmpty {
                    Button {
                        store.setCollapsed(tree.id, isCollapsed: !tree.task.isCollapsed)
                    } label: {
                        Image(systemName: tree.task.isCollapsed ? "chevron.right" : "chevron.down")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Theme.secondaryInk)
                            .frame(width: 16)
                    }
                    .buttonStyle(.plain)
                } else {
                    Color.clear.frame(width: 16)
                }

                Button {
                    store.toggleDone(tree.id)
                } label: {
                    Image(systemName: tree.task.isDone ? "checkmark.circle.fill" : "circle")
                        .font(.title3)
                        .foregroundStyle(tree.task.isDone ? Theme.accent : Theme.secondaryInk)
                }
                .buttonStyle(.plain)
                .accessibilityLabel(tree.task.isDone ? "Mark not done" : "Mark done")

                Button {
                    selectedTaskID = tree.id
                } label: {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(tree.task.name.isEmpty ? "Untitled" : tree.task.name)
                            .font(depth == 0 ? .body.weight(.medium) : .subheadline)
                            .strikethrough(tree.task.isDone)
                            .foregroundStyle(Theme.ink)
                            .multilineTextAlignment(.leading)
                        if !tree.task.startDateISO.isEmpty {
                            Text(badge)
                                .font(.caption2)
                                .foregroundStyle(Theme.secondaryInk)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .buttonStyle(.plain)
            }
            .padding(.vertical, 8)
            .padding(.leading, CGFloat(depth) * 18)
            .contentShape(Rectangle())
            .draggable(tree.id)
            .contextMenu {
                Button("Open", systemImage: "doc.text") { selectedTaskID = tree.id }
                Button("Add subtask", systemImage: "plus") { onAddChild(tree.id) }
                Button("Schedule today", systemImage: "calendar") {
                    store.schedule(tree.id, dayISO: DateISO.dayString(from: .now), time: DateISO.timeString(from: .now))
                }
                Button("Indent", systemImage: "increase.indent") { store.indent(tree.id) }
                Button("Outdent", systemImage: "decrease.indent") { store.outdent(tree.id) }
                Divider()
                Button("Archive from list", systemImage: "archivebox") { store.archive(tree.id) }
            }

            if !tree.task.isCollapsed {
                ForEach(tree.children) { child in
                    TaskRowView(
                        tree: child,
                        depth: depth + 1,
                        store: store,
                        selectedTaskID: $selectedTaskID,
                        onAddChild: onAddChild
                    )
                }
            }
        }
    }

    private var badge: String {
        if tree.task.startTime.isEmpty {
            return tree.task.startDateISO
        }
        return "\(tree.task.startDateISO) · \(tree.task.startTime)"
    }
}
