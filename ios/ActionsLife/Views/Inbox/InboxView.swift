import SwiftUI

struct InboxView: View {
    @Bindable var store: TaskTreeStore
    @Binding var selectedTaskID: String?
    var onAddRoot: () -> Void
    var onAddChild: (String) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text("Inbox")
                    .font(.headline)
                    .foregroundStyle(Theme.ink)
                Spacer()
                Button(action: onAddRoot) {
                    Image(systemName: "plus")
                }
                .accessibilityLabel("Add task")
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)

            if store.inbox.isEmpty {
                ContentUnavailableView {
                    Label("Nothing on the list", systemImage: "checklist")
                } description: {
                    Text("Add a task, then open it to nest subtasks or put it on a day.")
                } actions: {
                    Button("Add task", action: onAddRoot)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 0) {
                        ForEach(store.inbox) { tree in
                            TaskRowView(
                                tree: tree,
                                depth: 0,
                                store: store,
                                selectedTaskID: $selectedTaskID,
                                onAddChild: onAddChild
                            )
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.bottom, 28)
                }
            }
        }
        .background(Theme.listBackground)
    }
}
