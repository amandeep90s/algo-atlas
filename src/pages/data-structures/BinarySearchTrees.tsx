import {
  Callout,
  CodeBlock,
  ComplexityTable,
  C,
  Diagram,
  KeyTakeaways,
  List,
  P,
  PageHeader,
  Practice,
  ProsCons,
  Section,
  Strong,
  SubSection,
} from "../../components/doc";

export default function BinarySearchTrees() {
  return (
    <article>
      <PageHeader eyebrow="Non-Linear Data Structures" title="Binary Search Trees" description="A binary search tree keeps smaller keys left and larger keys right. Its inorder traversal is sorted, and a balanced shape supports logarithmic search, insertion and deletion." tags={["BST property", "Search", "Inorder", "Ordered data"]} />

      <Section title="The BST Property">
        <P>For each node, every key in its left subtree is smaller and every key in its right subtree is larger. The rule applies to entire subtrees—not just immediate children. A duplicate-key policy (ignore, count, or consistently place duplicates on one side) must be chosen explicitly.</P>
        <Diagram caption="Values left of a node are smaller; values right are larger.">{`
                         8
                       /   \\
                      3     10
                     / \\      \\
                    1   6      14
                       / \\     /
                      4   7   13

              inorder: 1, 3, 4, 6, 7, 8, 10, 13, 14
        `}</Diagram>
        <P>Search compares at each node and discards one subtree. The running time depends on tree height <C>h</C>: it is <C>O(h)</C>, becoming <C>O(log n)</C> when balanced and <C>O(n)</C> in a chain.</P>
      </Section>

      <Section title="A BST Implementation">
        <P>This implementation stores unique integer keys; inserting a duplicate leaves the tree unchanged. Deletion is completed in the following section.</P>
        <CodeBlock title="bst.py" code={`
          from dataclasses import dataclass

          @dataclass
          class Node:
              key: int
              left: "Node | None" = None
              right: "Node | None" = None

          class BST:
              def __init__(self):
                  self.root: Node | None = None

              def insert(self, key: int) -> None:
                  def add(node: Node | None) -> Node:
                      if node is None:
                          return Node(key)
                      if key < node.key:
                          node.left = add(node.left)
                      elif key > node.key:
                          node.right = add(node.right)
                      return node
                  self.root = add(self.root)

              def search(self, key: int) -> Node | None:
                  node = self.root
                  while node is not None:
                      if key == node.key:
                          return node
                      node = node.left if key < node.key else node.right
                  return None

              def minimum(self, node: Node | None = None) -> Node | None:
                  current = self.root if node is None else node
                  if current is None:
                      return None
                  while current.left:
                      current = current.left
                  return current

              def maximum(self, node: Node | None = None) -> Node | None:
                  current = self.root if node is None else node
                  if current is None:
                      return None
                  while current.right:
                      current = current.right
                  return current

              def delete(self, key: int) -> None:
                  def remove(node: Node | None, target: int) -> Node | None:
                      if node is None:
                          return None
                      if target < node.key:
                          node.left = remove(node.left, target)
                      elif target > node.key:
                          node.right = remove(node.right, target)
                      else:
                          if node.left is None:
                              return node.right
                          if node.right is None:
                              return node.left
                          successor = node.right
                          while successor.left:
                              successor = successor.left
                          node.key = successor.key
                          node.right = remove(node.right, successor.key)
                      return node
                  self.root = remove(self.root, key)

              def inorder(self) -> list[int]:
                  result: list[int] = []
                  def visit(node: Node | None) -> None:
                      if node:
                          visit(node.left)
                          result.append(node.key)
                          visit(node.right)
                  visit(self.root)
                  return result
        `} />
      </Section>

      <Section title="Delete: Three Cases">
        <List ordered items={[
          <><Strong>Leaf:</Strong> detach the node from its parent.</>,
          <><Strong>One child:</Strong> replace the node with its only child.</>,
          <><Strong>Two children:</Strong> copy the inorder successor (the minimum key in the right subtree), then delete that successor from the right subtree. The successor has no left child, so its removal reduces to one of the first two cases.</>,
        ]} />
        <Callout type="tip">Replacing with the inorder predecessor (maximum of the left subtree) is equally valid. Always reconnect the returned subtree root so deleting the overall root is handled correctly.</Callout>
        <SubSection title="Inorder gives sorted order">
          <P>Visit left subtree, node, then right subtree to enumerate keys in ascending order. This is also the basis for order statistics, neighbors and range queries.</P>
          <CodeBlock code={`
            class Node:
                def __init__(self, key: int):
                    self.key = key
                    self.left = self.right = None

            def insert(root: Node | None, key: int) -> Node:
                if root is None:
                    return Node(key)
                if key < root.key:
                    root.left = insert(root.left, key)
                elif key > root.key:
                    root.right = insert(root.right, key)
                return root

            def delete(root: Node | None, key: int) -> Node | None:
                if root is None:
                    return None
                if key < root.key:
                    root.left = delete(root.left, key)
                elif key > root.key:
                    root.right = delete(root.right, key)
                elif root.left is None:
                    return root.right
                elif root.right is None:
                    return root.left
                else:
                    successor = root.right
                    while successor.left:
                        successor = successor.left
                    root.key = successor.key
                    root.right = delete(root.right, successor.key)
                return root

            def inorder(root: Node | None) -> list[int]:
                if root is None:
                    return []
                return inorder(root.left) + [root.key] + inorder(root.right)

            root = None
            for value in [8, 3, 10, 1, 6, 14, 4, 7, 13]:
                root = insert(root, value)
            print(inorder(root))
            root = delete(root, 3)
            print(inorder(root))
          `} output={`[1, 3, 4, 6, 7, 8, 10, 13, 14]
[1, 4, 6, 7, 8, 10, 13, 14]`} />
        </SubSection>
      </Section>

      <Section title="Validation and Order Statistics">
        <SubSection title="Validate using bounds">
          <P>Checking each node only against its parent is insufficient. Carry an allowed lower and upper bound down the recursion so every descendant obeys all ancestor constraints.</P>
          <CodeBlock code={`
            def is_valid_bst(root: Node | None) -> bool:
                def check(node: Node | None, low: float, high: float) -> bool:
                    if node is None:
                        return True
                    if not low < node.key < high:
                        return False
                    return (check(node.left, low, node.key)
                            and check(node.right, node.key, high))
                return check(root, float("-inf"), float("inf"))
          `} />
        </SubSection>
        <SubSection title="Kth smallest">
          <P>An inorder walk yields increasing keys. Stop as soon as the kth item is visited rather than materializing the full traversal.</P>
          <CodeBlock code={`
            def kth_smallest(root: Node | None, k: int) -> int:
                if k <= 0:
                    raise ValueError("k must be positive")
                stack: list[Node] = []
                current = root
                while current or stack:
                    while current:
                        stack.append(current)
                        current = current.left
                    current = stack.pop()
                    k -= 1
                    if k == 0:
                        return current.key
                    current = current.right
                raise ValueError("k exceeds the number of nodes")
          `} />
        </SubSection>
      </Section>

      <Section title="Neighbors, Ranges and LCA">
        <SubSection title="Inorder successor and predecessor">
          <P>The successor is the smallest key larger than the target. If a right subtree exists, it is that subtree's minimum; otherwise, it is the lowest ancestor for which the target lies in the left subtree. The predecessor is symmetric.</P>
          <CodeBlock code={`
            def successor(root: Node | None, key: int) -> Node | None:
                answer = None
                node = root
                while node:
                    if key < node.key:
                        answer = node
                        node = node.left
                    else:
                        node = node.right
                return answer

            def predecessor(root: Node | None, key: int) -> Node | None:
                answer = None
                node = root
                while node:
                    if key > node.key:
                        answer = node
                        node = node.right
                    else:
                        node = node.left
                return answer
          `} />
        </SubSection>
        <SubSection title="Floor, ceil and range query">
          <P><C>floor(x)</C> is the greatest key no larger than x; <C>ceil(x)</C> is the least key no smaller than x. A range query prunes subtrees outside [low, high].</P>
          <CodeBlock code={`
            def floor_ceil(root: Node | None, key: int) -> tuple[int | None, int | None]:
                floor = ceiling = None
                node = root
                while node:
                    if node.key == key:
                        return key, key
                    if key < node.key:
                        ceiling = node.key
                        node = node.left
                    else:
                        floor = node.key
                        node = node.right
                return floor, ceiling

            def range_values(root: Node | None, low: int, high: int) -> list[int]:
                result: list[int] = []
                def visit(node: Node | None) -> None:
                    if node is None:
                        return
                    if low < node.key:
                        visit(node.left)
                    if low <= node.key <= high:
                        result.append(node.key)
                    if node.key < high:
                        visit(node.right)
                visit(root)
                return result
          `} />
        </SubSection>
        <SubSection title="Lowest common ancestor in a BST">
          <P>Given two keys in the tree, move left if both are smaller, right if both are larger; the first node between the keys is their lowest common ancestor.</P>
          <CodeBlock code={`
            def bst_lca(root: Node | None, a: int, b: int) -> Node | None:
                low, high = sorted((a, b))
                node = root
                while node:
                    if high < node.key:
                        node = node.left
                    elif low > node.key:
                        node = node.right
                    else:
                        return node
                return None
          `} />
        </SubSection>
      </Section>

      <Section title="Build a Balanced BST">
        <P>Given a sorted array, recursively choose its midpoint as the root. This creates a height-balanced tree, in <C>O(n)</C> time when each item is selected once.</P>
        <CodeBlock code={`
          def sorted_array_to_bst(values: list[int]) -> Node | None:
              def build(left: int, right: int) -> Node | None:
                  if left >= right:
                      return None
                  middle = (left + right) // 2
                  node = Node(values[middle])
                  node.left = build(left, middle)
                  node.right = build(middle + 1, right)
                  return node
              return build(0, len(values))
        `} />
        <Callout type="warning">Sorted input is essential for this construction. If duplicates are allowed, define how equal keys fit the invariant before using a strict-bound validator.</Callout>
      </Section>

      <Section title="Complexity and Why Balance Matters">
        <ComplexityTable rows={[
          { operation: <C>search / insert / delete</C>, time: "O(log n)", space: "O(h)", note: "Average for reasonably balanced shape" },
          { operation: <C>search / insert / delete</C>, time: "O(n)", space: "O(n)", note: "Worst case: degenerate tree" },
          { operation: <C>minimum / maximum</C>, time: "O(h)" },
          { operation: <C>inorder traversal</C>, time: "O(n)", space: "O(h)" },
          { operation: <C>range query</C>, time: "O(h + k)", note: "k values reported; may visit more on unbalanced trees" },
          { operation: <C>sorted array to balanced BST</C>, time: "O(n)", space: "O(log n)" },
        ]} />
        <P>Inserting already sorted values into a plain BST repeatedly creates a chain, so every later search can examine nearly every node. Self-balancing families such as AVL and Red-Black trees maintain <C>O(log n)</C> height; see <C>Balanced Trees</C>.</P>
        <SubSection title="Python alternatives">
          <List items={[
            <><C>bisect</C> provides binary search on a sorted list, but inserting into the middle still shifts elements in <C>O(n)</C>.</>,
            <><C>sortedcontainers</C> is a third-party package offering sorted list/map/set interfaces; it is not in the Python standard library.</>,
            <>For ordinary key-value lookup without sorted-order operations, use Python's built-in <C>dict</C>.</>,
          ]} />
        </SubSection>
        <ProsCons pros={["Keeps ordered keys and supports sorted traversal", "Can prune searches and range queries", "Flexible predecessor, successor and LCA operations"]} cons={["Plain BST can degrade to a linked list", "Pointer-based nodes have memory overhead", "Deletion and balancing need careful invariants"]} />
      </Section>

      <Section title="Practice Problems">
        <Practice problems={[
          { name: "Search in a Binary Search Tree", difficulty: "Easy", hint: "Discard one subtree per comparison." },
          { name: "Validate Binary Search Tree", difficulty: "Medium", hint: "Propagate lower and upper bounds." },
          { name: "Kth Smallest Element in a BST", difficulty: "Medium", hint: "Count nodes during inorder traversal." },
          { name: "Lowest Common Ancestor of a BST", difficulty: "Medium", hint: "Find where the two target keys split." },
          { name: "Delete Node in a BST", difficulty: "Medium", hint: "For two children, replace with successor." },
        ]} />
      </Section>
      <KeyTakeaways items={[
        <>Every key in a node's left/right subtree must be smaller/larger, not only its direct child.</>,
        <>Inorder traversal of a BST returns keys in sorted order.</>,
        <>Search, insertion and deletion are <C>O(h)</C>; balance is what makes them logarithmic.</>,
        <>For two-child deletion, replace with the right-subtree minimum, then remove that successor.</>,
      ]} />
    </article>
  );
}