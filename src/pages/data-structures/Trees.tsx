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

export default function Trees() {
  return (
    <article>
      <PageHeader eyebrow="Non-Linear Data Structures" title="Trees" description="Trees model hierarchical relationships. Their recursive shape supports efficient search, parsing, indexing and decision-making." tags={["Hierarchy", "Traversal", "Recursion", "BFS / DFS"]} />

      <Section title="Tree Terminology">
        <P>A <Strong>tree</Strong> is a connected acyclic structure. In a rooted tree, edges point conceptually from parent to child, producing a hierarchy with a single root.</P>
        <Diagram caption="A rooted tree with depths and parent-child relationships.">{`
                         A                 depth 0, root
                       /   \\
                      B     C               depth 1
                     / \\     \\
                    D   E     F             depth 2, leaves

          A is parent of B and C; B and C are siblings.
          Subtree rooted at B contains B, D, and E.
        `}</Diagram>
        <List items={[
          <><Strong>Root:</Strong> the top node, with no parent.</>,
          <><Strong>Parent / child:</Strong> an edge connects a parent to one of its children; <Strong>siblings</Strong> share a parent.</>,
          <><Strong>Leaf:</Strong> a node with no children. <Strong>Degree:</Strong> number of children.</>,
          <><Strong>Depth:</Strong> edges from the root to a node. <Strong>Level</Strong> is often depth + 1 (some sources use depth itself).</>,
          <><Strong>Height:</Strong> longest downward path to a leaf, measured in edges here. A leaf has height 0; empty-tree height is −1 by this convention.</>,
          <><Strong>Subtree:</Strong> a node together with all of its descendants.</>,
        ]} />
      </Section>

      <Section title="Binary Tree Shapes">
        <P>A binary tree has at most two ordered children per node: left and right. Structural properties influence memory layout and algorithm performance.</P>
        <List items={[
          <><Strong>Full (proper):</Strong> every node has either 0 or 2 children.</>,
          <><Strong>Complete:</Strong> all levels except possibly the last are full; the last level fills left to right. This shape enables array-based heaps.</>,
          <><Strong>Perfect:</Strong> all internal nodes have two children and all leaves share a level. With root at level 0 and height <C>h</C>, it has <C>2^(h+1) − 1</C> nodes.</>,
          <><Strong>Balanced:</Strong> height grows proportionally to <C>log n</C> (exact definitions depend on the tree family). Search paths stay short.</>,
          <><Strong>Degenerate:</Strong> each internal node has one child, making the tree a chain of height <C>n − 1</C>.</>,
        ]} />
        <Callout type="insight">A binary tree of height <C>h</C> has at most <C>2^(h+1) − 1</C> nodes (or <C>2^h</C> nodes if height is counted in levels starting at 1). This exponential capacity explains why balanced-tree height is logarithmic.</Callout>
      </Section>

      <Section title="Nodes and Construction">
        <P>For algorithms, a binary node stores a value and optional left/right child references. A level-order list uses breadth-first positions: each non-null node at index <C>i</C> has children at <C>2i + 1</C> and <C>2i + 2</C>.</P>
        <CodeBlock title="tree_nodes.py" code={`
          from collections import deque
          from dataclasses import dataclass

          @dataclass
          class TreeNode:
              value: int
              left: "TreeNode | None" = None
              right: "TreeNode | None" = None

          def build_level_order(values: list[int | None]) -> TreeNode | None:
              if not values or values[0] is None:
                  if any(value is not None for value in values[1:]):
                      raise ValueError("non-null node cannot follow an empty root")
                  return None
              root = TreeNode(values[0])
              queue = deque([root])
              index = 1
              while queue and index < len(values):
                  node = queue.popleft()
                  if index < len(values) and values[index] is not None:
                      node.left = TreeNode(values[index])
                      queue.append(node.left)
                  index += 1
                  if index < len(values) and values[index] is not None:
                      node.right = TreeNode(values[index])
                      queue.append(node.right)
                  index += 1
              if index < len(values) and any(x is not None for x in values[index:]):
                  raise ValueError("level-order data has unreachable nodes")
              return root

          root = build_level_order([1, 2, 3, None, 4, 5])
        `} />
      </Section>

      <Section title="Depth-First Traversals">
        <P>Depth-first traversals differ in when they visit the current node. For a binary node with left and right subtrees, preorder is root-left-right, inorder is left-root-right, and postorder is left-right-root.</P>
        <Diagram caption="Traversal orders for this tree: pre 1,2,4,3; in 2,4,1,3; post 4,2,3,1.">{`
                    1
                   / \\
                  2   3
                   \\
                    4
        `}</Diagram>
        <SubSection title="Recursive traversals">
          <CodeBlock code={`
            def preorder(root: TreeNode | None) -> list[int]:
                if root is None:
                    return []
                return [root.value] + preorder(root.left) + preorder(root.right)

            def inorder(root: TreeNode | None) -> list[int]:
                if root is None:
                    return []
                return inorder(root.left) + [root.value] + inorder(root.right)

            def postorder(root: TreeNode | None) -> list[int]:
                if root is None:
                    return []
                return postorder(root.left) + postorder(root.right) + [root.value]
          `} />
        </SubSection>
        <SubSection title="Iterative traversals">
          <P>An explicit stack replaces recursive call frames. Preorder pushes right before left so the left subtree is processed first. Inorder descends left before visiting each node.</P>
          <CodeBlock code={`
            def preorder_iterative(root: TreeNode | None) -> list[int]:
                if root is None:
                    return []
                result, stack = [], [root]
                while stack:
                    node = stack.pop()
                    result.append(node.value)
                    if node.right:
                        stack.append(node.right)
                    if node.left:
                        stack.append(node.left)
                return result

            def inorder_iterative(root: TreeNode | None) -> list[int]:
                result, stack = [], []
                current = root
                while current or stack:
                    while current:
                        stack.append(current)
                        current = current.left
                    current = stack.pop()
                    result.append(current.value)
                    current = current.right
                return result

            def postorder_iterative(root: TreeNode | None) -> list[int]:
                if root is None:
                    return []
                result, stack = [], [root]
                while stack:
                    node = stack.pop()
                    result.append(node.value)
                    if node.left:
                        stack.append(node.left)
                    if node.right:
                        stack.append(node.right)
                return result[::-1]
          `} />
        </SubSection>
        <SubSection title="Morris inorder">
          <P>Morris traversal temporarily threads a node's inorder predecessor back to the current node. It visits in <C>O(n)</C> time with <C>O(1)</C> auxiliary space, then restores all modified links. It is subtle: early returns or exceptions must not leave temporary pointers in the tree.</P>
        </SubSection>
      </Section>

      <Section title="Breadth-First Traversal">
        <P>Level-order traversal processes all nodes at one depth before moving down. A deque gives efficient front removal and rear insertion.</P>
        <CodeBlock code={`
          from collections import deque

          def level_order(root: TreeNode | None) -> list[list[int]]:
              if root is None:
                  return []
              result: list[list[int]] = []
              queue = deque([root])
              while queue:
                  level: list[int] = []
                  for _ in range(len(queue)):
                      node = queue.popleft()
                      level.append(node.value)
                      if node.left:
                          queue.append(node.left)
                      if node.right:
                          queue.append(node.right)
                  result.append(level)
              return result
        `} />
      </Section>

      <Section title="Common Tree Algorithms">
        <SubSection title="Depth, size and balance">
          <P>Most tree algorithms are postorder: compute facts about child subtrees, then combine them at the parent. Returning multiple values avoids recomputing subtree information.</P>
          <CodeBlock code={`
            def max_depth(root: TreeNode | None) -> int:
                if root is None:
                    return 0
                return 1 + max(max_depth(root.left), max_depth(root.right))

            def min_depth(root: TreeNode | None) -> int:
                if root is None:
                    return 0
                if root.left is None:
                    return 1 + min_depth(root.right)
                if root.right is None:
                    return 1 + min_depth(root.left)
                return 1 + min(min_depth(root.left), min_depth(root.right))

            def count_nodes(root: TreeNode | None) -> int:
                if root is None:
                    return 0
                return 1 + count_nodes(root.left) + count_nodes(root.right)

            def is_balanced(root: TreeNode | None) -> bool:
                def height(node: TreeNode | None) -> int:
                    if node is None:
                        return 0
                    left, right = height(node.left), height(node.right)
                    if left < 0 or right < 0 or abs(left - right) > 1:
                        return -1
                    return 1 + max(left, right)
                return height(root) >= 0

            def diameter(root: TreeNode | None) -> int:
                best = 0
                def height(node: TreeNode | None) -> int:
                    nonlocal best
                    if node is None:
                        return 0
                    left, right = height(node.left), height(node.right)
                    best = max(best, left + right)
                    return 1 + max(left, right)
                height(root)
                return best  # measured in edges
          `} />
        </SubSection>
        <SubSection title="Invert, symmetry and path sum">
          <CodeBlock code={`
            def invert(root: TreeNode | None) -> TreeNode | None:
                if root:
                    root.left, root.right = invert(root.right), invert(root.left)
                return root

            def is_symmetric(root: TreeNode | None) -> bool:
                def mirror(a: TreeNode | None, b: TreeNode | None) -> bool:
                    if a is None or b is None:
                        return a is b
                    return (a.value == b.value and mirror(a.left, b.right)
                            and mirror(a.right, b.left))
                return root is None or mirror(root.left, root.right)

            def has_path_sum(root: TreeNode | None, target: int) -> bool:
                if root is None:
                    return False
                if root.left is None and root.right is None:
                    return root.value == target
                remaining = target - root.value
                return (has_path_sum(root.left, remaining)
                        or has_path_sum(root.right, remaining))
          `} />
        </SubSection>
        <SubSection title="Lowest common ancestor">
          <P>For a general binary tree where both target nodes exist, return a target when found; if left and right subtrees each return a node, the current node is their lowest common ancestor.</P>
          <CodeBlock code={`
            def lowest_common_ancestor(
                root: TreeNode | None, p: TreeNode, q: TreeNode
            ) -> TreeNode | None:
                if root is None or root is p or root is q:
                    return root
                left = lowest_common_ancestor(root.left, p, q)
                right = lowest_common_ancestor(root.right, p, q)
                if left and right:
                    return root
                return left or right
          `} />
        </SubSection>
        <SubSection title="Serialize and deserialize">
          <P>Preorder with explicit null markers preserves shape. The decoder consumes tokens in the same recursive order.</P>
          <CodeBlock code={`
            def serialize(root: TreeNode | None) -> str:
                values: list[str] = []
                def visit(node: TreeNode | None) -> None:
                    if node is None:
                        values.append("#")
                        return
                    values.append(str(node.value))
                    visit(node.left)
                    visit(node.right)
                visit(root)
                return ",".join(values)

            def deserialize(data: str) -> TreeNode | None:
                tokens = iter(data.split(","))
                def build() -> TreeNode | None:
                    token = next(tokens)
                    if token == "#":
                        return None
                    node = TreeNode(int(token))
                    node.left = build()
                    node.right = build()
                    return node
                return build()
          `} />
        </SubSection>
      </Section>

      <Section title="N-ary Trees and Complexity">
        <P>An <Strong>n-ary tree</Strong> allows any number of children, often stored as <C>children: list[Node]</C>. The same DFS/BFS ideas apply; only the child iteration changes.</P>
        <ComplexityTable rows={[
          { operation: <C>DFS traversal / count nodes</C>, time: "O(n)", space: "O(h)", note: "Recursive stack; h is height" },
          { operation: <C>level-order traversal</C>, time: "O(n)", space: "O(w)", note: "w is maximum width" },
          { operation: <C>max/min depth, balance, diameter</C>, time: "O(n)", space: "O(h)" },
          { operation: <C>serialize / deserialize</C>, time: "O(n)", space: "O(n)" },
          { operation: <C>Morris inorder</C>, time: "O(n)", space: "O(1)", note: "Temporarily modifies links" },
        ]} />
        <Callout type="warning">A degenerate tree has <C>h = O(n)</C>, so recursive code can use linear call-stack space and may hit Python's recursion limit. An iterative traversal avoids interpreter recursion depth but still needs an explicit stack.</Callout>
      </Section>

      <Section title="A Useful Recursion Template">
        <P>Before coding a recursive tree problem, ask: <Strong>“What result should this node return to its parent?”</Strong> Define the empty-tree base case, recursively solve children, and combine their results once.</P>
        <CodeBlock code={`
          def solve(node: TreeNode | None) -> int:
              if node is None:
                  return 0  # choose the identity for this problem

              left_result = solve(node.left)
              right_result = solve(node.right)
              return combine(node.value, left_result, right_result)
        `} />
        <ProsCons pros={["Recursive shape mirrors the data", "Postorder naturally combines child results", "DFS needs space proportional to tree height"]} cons={["Deep trees can exceed recursion limits", "Repeated subtree work can become quadratic", "Mutation and ownership should be explicit"]} />
      </Section>

      <Section title="Practice Problems">
        <Practice problems={[
          { name: "Maximum Depth of Binary Tree", difficulty: "Easy", hint: "One plus the larger child height." },
          { name: "Invert Binary Tree", difficulty: "Easy", hint: "Swap each node's left and right subtree." },
          { name: "Binary Tree Level Order Traversal", difficulty: "Medium", hint: "Use a deque and snapshot each level's size." },
          { name: "Diameter of Binary Tree", difficulty: "Easy", hint: "At every node, combine left and right heights." },
          { name: "Validate Binary Tree Serialization", difficulty: "Medium", hint: "Track remaining child slots." },
          { name: "Serialize and Deserialize Binary Tree", difficulty: "Hard", hint: "Include explicit null markers to preserve shape." },
        ]} />
      </Section>
      <KeyTakeaways items={[
        <>Trees are recursive hierarchies; each subtree is itself a tree.</>,
        <>Preorder, inorder and postorder differ only in when the root is visited.</>,
        <>Use a deque for level-order traversal and an explicit stack for iterative DFS.</>,
        <>A degenerate tree can have height <C>O(n)</C>; balanced shapes keep height logarithmic.</>,
      ]} />
    </article>
  );
}