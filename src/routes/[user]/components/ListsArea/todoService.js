export function reconstructTreeInMemory(firestoreTaskDocs) {
  const memoryTree = []

  const memo = { '': [] }
  for (const node of firestoreTaskDocs) {
    if (!memo[node.parentID]) memo[node.parentID] = []
    if (!memo[node.id]) memo[node.id] = []
    memo[node.parentID].push(node)
  }

  const roots = memo[''].sort((a, b) => a.orderValue - b.orderValue)
  for (const root of roots) {
    extendTree(root, memo)
    memoryTree.push(root)
  }
  return memoryTree
}

function extendTree(node, memo) {
  node.children = memo[node.id]
  node.children = node.children.sort((a, b) => a.orderValue - b.orderValue)
  for (const child of node.children) {
    extendTree(child, memo)
  }
}

export default {
  reconstructTreeInMemory
}