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

export default function BalancedTrees() {
  return (
    <article>
      <PageHeader eyebrow="Non-Linear Data Structures" title="Balanced Trees" description="Self-balancing search trees keep height logarithmic despite changing data. AVL, Red-Black and multiway trees trade strictness, update cost and storage layout to keep operations efficient." tags={["AVL", "Red-Black", "B-tree", "Rotations"]} />

      <Section title="Why Balance Matters">
        <P>A plain binary search tree can become a chain when keys arrive in sorted order. Its height then grows to <C>n − 1</C>, making search, insertion and deletion <C>O(n)</C>. A balanced search tree rearranges nodes as updates happen so height stays <C>O(log n)</C>.</P>
        <Diagram caption="Same keys, different heights: balance keeps root-to-leaf paths short.">{`
          Degenerate BST                 Balanced BST
              1                              4
               \\                           / \\
                2                         2   6
                 \\                       / \\ / \\
                  3                     1  3 5  7
                   \\
                    4
        `}</Diagram>
        <P>Rotations preserve inorder key order while changing local shape. Different families use different invariants: AVL trees are very strictly height-balanced; Red-Black trees allow more flexibility and often do fewer rotations during updates.</P>
      </Section>

      <Section title="AVL Trees and Balance Factor">
        <P>An <Strong>AVL tree</Strong> stores the height of each node and requires the height difference between its left and right subtrees to be at most one. Define the balance factor as <C>height(left) − height(right)</C>. A factor of +2 or −2 signals the first ancestor needing repair.</P>
        <SubSection title="The four rotation cases">
          <List items={[
            <><Strong>LL:</Strong> insertion in the left subtree of the left child; rotate right once.</>,
            <><Strong>RR:</Strong> insertion in the right subtree of the right child; rotate left once.</>,
            <><Strong>LR:</Strong> insertion in the right subtree of the left child; rotate left at the child, then right at the unbalanced node.</>,
            <><Strong>RL:</Strong> insertion in the left subtree of the right child; rotate right at the child, then left at the unbalanced node.</>,
          ]} />
          <Diagram caption="LL is repaired by one right rotation; LR needs a child rotation followed by a right rotation.">{`
            LL before           right rotate       LR before
                 z                  y                  z
                /                  /                  /
               y        →         x                  x
              /                  / \\                  \\
             x                  a   z                  y

          RR mirrors LL; RL mirrors LR.
          Always refresh the demoted node's height before the new root's height.
          `}</Diagram>
        </SubSection>
        <SubSection title="AVL insertion implementation">
          <P>Insert like a BST, update heights while unwinding, and rebalance at each ancestor. Rotations return the new root of the rotated subtree.</P>
          <CodeBlock title="avl_insert.py" code={`
            from dataclasses import dataclass

            @dataclass
            class AVLNode:
                key: int
                left: "AVLNode | None" = None
                right: "AVLNode | None" = None
                height: int = 1

            def height(node: AVLNode | None) -> int:
                return node.height if node else 0

            def update(node: AVLNode) -> None:
                node.height = 1 + max(height(node.left), height(node.right))

            def balance(node: AVLNode) -> int:
                return height(node.left) - height(node.right)

            def rotate_right(root: AVLNode) -> AVLNode:
                pivot = root.left
                assert pivot is not None
                middle = pivot.right
                pivot.right = root
                root.left = middle
                update(root)
                update(pivot)
                return pivot

            def rotate_left(root: AVLNode) -> AVLNode:
                pivot = root.right
                assert pivot is not None
                middle = pivot.left
                pivot.left = root
                root.right = middle
                update(root)
                update(pivot)
                return pivot

            def avl_insert(root: AVLNode | None, key: int) -> AVLNode:
                if root is None:
                    return AVLNode(key)
                if key < root.key:
                    root.left = avl_insert(root.left, key)
                elif key > root.key:
                    root.right = avl_insert(root.right, key)
                else:
                    return root  # ignore duplicates

                update(root)
                factor = balance(root)

                if factor > 1:
                    if key > root.left.key:
                        root.left = rotate_left(root.left)
                    return rotate_right(root)
                if factor < -1:
                    if key < root.right.key:
                        root.right = rotate_right(root.right)
                    return rotate_left(root)
                return root
          `} />
        </SubSection>
        <SubSection title="AVL deletion overview">
          <P>Delete using ordinary BST cases, then update heights and rebalance every ancestor on the way back up. Unlike insertion, deletion may reduce subtree height and trigger repairs at multiple ancestors. Choose single or double rotations from the child's balance factor; equality cases require care.</P>
        </SubSection>
      </Section>

      <Section title="Red-Black Trees">
        <P>A <Strong>Red-Black tree</Strong> colors each node red or black and maintains five rules that prevent any root-to-leaf path from becoming much longer than another:</P>
        <List ordered items={[
          <>Every node is either red or black.</>,
          <>The root is black.</>,
          <>All leaves (the conceptual NIL sentinel children) are black.</>,
          <>A red node cannot have a red child.</>,
          <>Every path from a node to a descendant NIL leaf contains the same number of black nodes.</>,
        ]} />
        <P>These rules imply logarithmic height: a longest path is at most about twice the shortest path. Insertions color a new node red; fix-up recolors when its uncle is red, and rotates when the red-parent path bends or extends. Deletion fix-up is more involved because removing a black node can break black-height balance.</P>
        <Callout type="insight" title="Flexible balance">AVL trees enforce a tighter local height bound, which can make lookup paths shorter. Red-Black trees accept more height variation, often reducing rebalancing work across mixed insert/delete workloads.</Callout>
        <SubSection title="Where they are used">
          <List items={[
            <>Java's <C>TreeMap</C> and <C>TreeSet</C> are based on Red-Black trees.</>,
            <>C++ <C>std::map</C> and <C>std::set</C> are commonly implemented with Red-Black trees.</>,
            <>The Linux kernel uses Red-Black trees for ordered structures, including the classic scheduler's task tracking (scheduler internals evolve across kernel versions).</>,
          ]} />
        </SubSection>
      </Section>

      <Section title="AVL vs Red-Black">
        <Diagram caption="AVL prioritizes tighter height balance; Red-Black allows a wider path-length range.">{`
          AVL invariant: |height(left) − height(right)| ≤ 1 per node
          Red-Black invariant: equal black-height; red nodes never adjacent

          AVL search paths: usually shorter
          Red-Black updates: typically fewer rotations
        `}</Diagram>
        <table className="w-full text-left text-sm border-separate border-spacing-0 overflow-hidden rounded-xl border border-white/10">
          <thead><tr className="bg-white/[0.04]"><th className="px-4 py-3 text-slate-200">Aspect</th><th className="px-4 py-3 text-slate-200">AVL</th><th className="px-4 py-3 text-slate-200">Red-Black</th></tr></thead>
          <tbody className="text-slate-300">
            <tr><td className="border-t border-white/10 px-4 py-3">Balance strength</td><td className="border-t border-white/10 px-4 py-3">Stricter</td><td className="border-t border-white/10 px-4 py-3">More flexible</td></tr>
            <tr><td className="border-t border-white/10 px-4 py-3">Lookup</td><td className="border-t border-white/10 px-4 py-3">Often fewer comparisons</td><td className="border-t border-white/10 px-4 py-3">Still O(log n)</td></tr>
            <tr><td className="border-t border-white/10 px-4 py-3">Updates</td><td className="border-t border-white/10 px-4 py-3">May rebalance on taller paths</td><td className="border-t border-white/10 px-4 py-3">Usually fewer rotations</td></tr>
            <tr><td className="border-t border-white/10 px-4 py-3">Typical fit</td><td className="border-t border-white/10 px-4 py-3">Lookup-heavy maps</td><td className="border-t border-white/10 px-4 py-3">Mixed ordered-map workloads</td></tr>
          </tbody>
        </table>
      </Section>

      <Section title="B-Trees and B+ Trees">
        <P>A <Strong>B-tree</Strong> is a balanced multiway search tree: one node stores several sorted keys and has multiple children. A B-tree of order <C>m</C> is commonly described as having at most <C>m</C> children and <C>m − 1</C> keys, though exact minimum-occupancy conventions vary. Disk and database pages hold many keys, reducing expensive I/O by keeping the height very small.</P>
        <Diagram caption="When a node overflows, split around a median and promote the separator to the parent.">{`
          Before split (overflow):       Split and promote:
             [ 10 | 20 | 30 ]                 [ 20 ]
             /    |    |    \\                /    \\
            ...   ...  ...   ...          [10]      [30]

          A root split creates a new root; leaves remain at the same depth.
        `}</Diagram>
        <P>A <Strong>B+ tree</Strong> keeps all records (or record pointers) in linked leaves; internal nodes contain separators only. Linked leaves make range scans efficient. B+ trees are widely used for database indexes and file-system metadata.</P>
        <Callout type="note">“Order” varies by textbook and library. When reasoning about splits, state whether order means maximum children or maximum keys instead of relying on the word alone.</Callout>
      </Section>

      <Section title="Other Balanced Search Structures">
        <List items={[
          <><Strong>Splay trees:</Strong> rotate every accessed node toward the root. An individual operation can be <C>O(n)</C>, but a sequence of operations is amortized <C>O(log n)</C>; recently used keys become quick to reach.</>,
          <><Strong>Treaps:</Strong> combine BST ordering by key with heap ordering by random priority. Expected height is <C>O(log n)</C>, and split/merge operations are compact to implement.</>,
          <><Strong>Skip lists:</Strong> layered linked lists use randomized express lanes to search, insert and delete in expected <C>O(log n)</C>. They are an alternative to balanced trees, often simpler to make concurrent.</>,
        ]} />
      </Section>

      <Section title="Complexity and Selection">
        <ComplexityTable rows={[
          { operation: <C>AVL search / insert / delete</C>, time: "O(log n)", note: "Worst-case height is logarithmic" },
          { operation: <C>Red-Black search / insert / delete</C>, time: "O(log n)", note: "Worst-case height is logarithmic" },
          { operation: <C>B-tree search / insert / delete</C>, time: "O(log n)", note: "Few page accesses; node work depends on fanout" },
          { operation: <C>splay operation</C>, time: "O(log n)*", note: "Amortized; one operation can be O(n)" },
          { operation: <C>treap operation</C>, time: "O(log n)*", note: "Expected with random priorities" },
          { operation: <C>skip-list operation</C>, time: "O(log n)*", note: "Expected; O(n) worst case" },
          { operation: <C>ordered traversal</C>, time: "O(n)", space: "O(log n)", note: "Balanced-tree recursion/stack" },
        ]} />
        <P>Choose based on workload and environment: AVL for a strict in-memory search tree, Red-Black for general ordered maps with frequent updates, and B/B+ trees when block-oriented storage and range scans matter. In application code, prefer a well-tested library implementation.</P>
        <ProsCons pros={["Keep operations logarithmic as data changes", "Maintain sorted order and support range queries", "Multiway trees reduce storage-page I/O"]} cons={["Rotations and fix-up logic are subtle", "Metadata and pointers add implementation complexity", "The best variant depends on workload and storage"]} />
      </Section>

      <Section title="Practice Problems">
        <Practice problems={[
          { name: "Insert into a Binary Search Tree", difficulty: "Easy", hint: "Restore the subtree root after recursion." },
          { name: "Balance a Binary Search Tree", difficulty: "Medium", hint: "Inorder to sorted values, then build by midpoint." },
          { name: "Count of Smaller Numbers After Self", difficulty: "Hard", hint: "Use an augmented balanced search tree or merge counting." },
          { name: "My Calendar I", difficulty: "Medium", hint: "Keep non-overlapping intervals ordered by start." },
          { name: "Design Skiplist", difficulty: "Hard", hint: "Maintain forward links at randomized levels." },
        ]} />
      </Section>
      <KeyTakeaways items={[
        <>A plain BST is only logarithmic when its height is controlled.</>,
        <>AVL trees use subtree heights and rotations; Red-Black trees use colors and black-height rules.</>,
        <>B-trees and B+ trees branch widely to reduce disk-page accesses.</>,
        <>Splay trees, treaps and skip lists offer different amortized or expected guarantees.</>,
      ]} />
    </article>
  );
}