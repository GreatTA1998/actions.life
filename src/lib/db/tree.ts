type Node = {
  id: string
  parentID: string
  orderValue: number
}

export type Tree = Node & { children: Tree[] }

export function nodesByParent (docs: Node[]): Record<string, Node[]> {
  const sorted = docs.toSorted((a, b) => a.orderValue - b.orderValue)
  const R: Record<string, Node[]> = { '': [] }
  for (const doc of sorted) R[doc.id] = []
  for (const doc of sorted) R[doc.parentID]?.push(doc) // ?.push(doc)`?.push` necessary due to corrupted parentIDs like undefined
  return R
}

export function buildForest (docs: Node[]): Tree[] {
  const memo = nodesByParent(docs)

  function hydrate (node) {
    return { 
      ...node, // spread first, otherwise legacy `.children: []` values will overwrite children
      children: memo[node.id].map(hydrate)
    }
  }
  return memo[''].map(hydrate)
}

export function findSubtree ({ tree, id }) {
  if (tree.id === id) return tree
  else {
    for (const child of tree.children) {
      const result = findSubtree({ tree: child, id })
      if (result) return result
    }
  }
}