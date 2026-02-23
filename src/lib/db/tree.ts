interface Node {
  id: string
  parentID: string
  orderValue: number
}

type Tree = Node & { children: Tree[] }

export function buildForest (docs: Node[]): Tree[] {
  const sorted = docs.toSorted((a, b) => a.orderValue - b.orderValue)
  const childrenOf: Record<string, Node[]> = { '': [] }
  for (const doc of sorted) childrenOf[doc.id] = []
  for (const doc of sorted) childrenOf[doc.parentID]?.push(doc) // `?.push` necessary due to corrupted parentIDs like undefined

  function hydrate (node) {
    return { 
      ...node, // spread first, otherwise legacy `.children: []` values will overwrite children
      children: childrenOf[node.id].map(hydrate)
    }
  }
  return childrenOf[''].map(hydrate)
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

