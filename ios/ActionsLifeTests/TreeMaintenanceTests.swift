import XCTest
@testable import ActionsLife

final class TreeMaintenanceTests: XCTestCase {
    func testBuildForestNestsByParentAndOrder() {
        let docs = [
            snap("root", parent: "", order: 2, name: "Later"),
            snap("child", parent: "root", order: 1, name: "Child"),
            snap("root-first", parent: "", order: 1, name: "First")
        ]

        let forest = TreeMaintenance.buildForest(docs)
        XCTAssertEqual(forest.map(\.id), ["root-first", "root"])
        XCTAssertEqual(forest[1].children.map(\.id), ["child"])
    }

    func testInboxForestHidesArchivedRoots() {
        let docs = [
            snap("keep", parent: "", onList: true),
            snap("gone", parent: "", onList: false)
        ]
        let inbox = TreeMaintenance.inboxForest(docs)
        XCTAssertEqual(inbox.map(\.id), ["keep"])
    }

    func testDateChangeRewritesFamilyTreeISOs() {
        var docs = [
            snap("root", parent: "", root: "root", date: "", treeISOs: ["2026-09-18"]),
            snap("child", parent: "root", root: "root", date: "2026-09-18", treeISOs: ["2026-09-18"])
        ]

        TreeMaintenance.applyDateChange(taskID: "child", newDate: "2026-09-20", docs: &docs)

        XCTAssertEqual(docs.first(where: { $0.id == "child" })?.startDateISO, "2026-09-20")
        XCTAssertEqual(Set(docs.map(\.treeISOs)), [["2026-09-20"]])
    }

    func testReparentMovesSubtreeAndRebuildsDates() {
        var docs = [
            snap("a", parent: "", root: "a", date: "2026-01-01", treeISOs: ["2026-01-01"]),
            snap("b", parent: "", root: "b", date: "2026-02-02", treeISOs: ["2026-02-02"]),
            snap("a1", parent: "a", root: "a", date: "", treeISOs: ["2026-01-01"])
        ]

        TreeMaintenance.applyReparent(taskID: "a1", newParentID: "b", docs: &docs)

        let moved = docs.first { $0.id == "a1" }
        XCTAssertEqual(moved?.parentID, "b")
        XCTAssertEqual(moved?.rootID, "b")
        XCTAssertEqual(Set(docs.filter { $0.rootID == "b" }.flatMap(\.treeISOs)), ["2026-02-02"])
        XCTAssertEqual(docs.first { $0.id == "a" }?.treeISOs, ["2026-01-01"])
    }

    func testReparentRefusesCycles() {
        var docs = [
            snap("root", parent: "", root: "root"),
            snap("child", parent: "root", root: "root")
        ]
        TreeMaintenance.applyReparent(taskID: "root", newParentID: "child", docs: &docs)
        XCTAssertEqual(docs.first { $0.id == "root" }?.parentID, "")
    }

    func testDeletionRemovesSubtreeAndRepairsDates() {
        var docs = [
            snap("root", parent: "", root: "root", date: "", treeISOs: ["2026-03-03"]),
            snap("keep", parent: "root", root: "root", date: "", treeISOs: ["2026-03-03"]),
            snap("gone", parent: "root", root: "root", date: "2026-03-03", treeISOs: ["2026-03-03"]),
            snap("gone-child", parent: "gone", root: "root", date: "", treeISOs: ["2026-03-03"])
        ]

        TreeMaintenance.applyDeletion(taskID: "gone", docs: &docs)

        XCTAssertEqual(Set(docs.map(\.id)), ["root", "keep"])
        XCTAssertEqual(docs.first?.treeISOs, [])
    }

    func testPreviousSiblingForIndent() {
        let forest = TreeMaintenance.buildForest([
            snap("a", parent: "", order: 1),
            snap("b", parent: "", order: 2)
        ])
        XCTAssertEqual(TreeMaintenance.previousSibling(of: "b", in: forest)?.id, "a")
        XCTAssertNil(TreeMaintenance.previousSibling(of: "a", in: forest))
    }

    private func snap(
        _ id: String,
        parent: String,
        root: String? = nil,
        date: String = "",
        order: Double = 1,
        name: String = "",
        onList: Bool = true,
        treeISOs: [String]? = nil
    ) -> TaskSnapshot {
        TaskSnapshot(
            id: id,
            parentID: parent,
            rootID: root ?? id,
            startDateISO: date,
            orderValue: order,
            name: name.isEmpty ? id : name,
            onList: onList,
            isDone: false,
            isCollapsed: false,
            treeISOs: treeISOs ?? (date.isEmpty ? [] : [date]),
            startTime: "",
            duration: 30,
            notes: ""
        )
    }
}
