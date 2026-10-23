import {
  Callout,
  CodeBlock,
  ComplexityTable,
  C,
  Diagram,
  KeyTakeaways,
  P,
  PageHeader,
  Practice,
  ProsCons,
  Section,
  Strong,
  SubSection,
  Table,
} from "../../components/doc";

export default function UnionFind() {
  return (
    <article>
      <PageHeader
        eyebrow="Non-Linear Data Structures"
        title="Union-Find"
        description="Union-find, or disjoint set union (DSU), tracks a partition of items into non-overlapping groups and answers connectivity queries almost in constant time."
        tags={["Disjoint sets", "Path compression", "Union by size", "Amortized O(α(n))"]}
      />

      <Section title="Disjoint Sets and Operations">
        <P>
          A <Strong>disjoint set</Strong> collection partitions elements into separate components. <C>find(x)</C>
          identifies the representative of x's component; <C>union(a, b)</C> merges two components. Two elements are
          connected exactly when their representatives match. The representative is an implementation detail, not
          necessarily the smallest or most meaningful element.
        </P>
        <Diagram caption="Each set is represented by a rooted tree. A union joins roots; find follows parent links.">{`
              before union(2, 5)                after union

                  0                                0
                 / \\                              / \\
                1   2                            1   2
                    /                                / \\
                   3                                3   5
                                                      |
                                                      6

                 {0,1}        {2,3,5,6}   ->       one component
        `}</Diagram>
        <P>
          DSU is ideal when edges are added over time and we only need connectivity. It does not efficiently support
          deleting edges, splitting sets, or finding an actual path between vertices.
        </P>
      </Section>

      <Section title="Naive Quick-Find and Quick-Union">
        <SubSection title="Quick-find: component labels">
          <P>
            Store a component ID for every element. Connectivity is a constant-time ID comparison, but union must scan
            the whole array and relabel one component, costing <C>O(n)</C>.
          </P>
          <CodeBlock code={`
            class QuickFind:
                def __init__(self, n: int) -> None:
                    self.component = list(range(n))

                def find(self, x: int) -> int:
                    return self.component[x]

                def union(self, a: int, b: int) -> bool:
                    old = self.find(a)
                    new = self.find(b)
                    if old == new:
                        return False
                    for i, label in enumerate(self.component):
                        if label == old:
                            self.component[i] = new
                    return True
          `} />
        </SubSection>
        <SubSection title="Quick-union: parent forest">
          <P>
            Store a parent pointer for each item; roots point to themselves. A naive union links one root to the other.
            Without balancing, adversarial operations can create a chain and make <C>find</C> take <C>O(n)</C>.
          </P>
          <CodeBlock code={`
            def naive_find(parent: list[int], x: int) -> int:
                while parent[x] != x:
                    x = parent[x]
                return x

            def naive_union(parent: list[int], a: int, b: int) -> bool:
                root_a = naive_find(parent, a)
                root_b = naive_find(parent, b)
                if root_a == root_b:
                    return False
                parent[root_a] = root_b
                return True
          `} />
        </SubSection>
      </Section>

      <Section title="Balancing and Path Compression">
        <P>
          <Strong>Union by size</Strong> attaches the smaller tree under the larger; <Strong>union by rank</Strong>
          attaches the shallower tree under the deeper one. Rank is an upper bound on height and increases only when
          equal-rank roots merge. Both keep trees shallow.
        </P>
        <P>
          <Strong>Path compression</Strong> rewrites pointers during <C>find</C> so later lookups are faster. Recursive
          compression points each visited node directly to the root. Iterative <Strong>path halving</Strong> points each
          node to its grandparent while walking upward.
        </P>
        <Diagram caption="After a compressed find, nodes on the queried path point directly to the root.">{`
               before find(4)                    after find(4)

                    0                                  0
                    |                               / / \\
                    1                              1  2  4
                    |
                    2
                    |
                    4
        `}</Diagram>
        <CodeBlock title="union_find.py" code={`
          class UnionFind:
              def __init__(self, n: int) -> None:
                  if n < 0:
                      raise ValueError("n must be non-negative")
                  self.parent = list(range(n))
                  self.size = [1] * n
                  self.components = n

              def find(self, x: int) -> int:
                  if not 0 <= x < len(self.parent):
                      raise IndexError("element out of range")
                  # Path halving: each node skips to its grandparent.
                  while self.parent[x] != x:
                      self.parent[x] = self.parent[self.parent[x]]
                      x = self.parent[x]
                  return x

              def union(self, a: int, b: int) -> bool:
                  root_a = self.find(a)
                  root_b = self.find(b)
                  if root_a == root_b:
                      return False
                  if self.size[root_a] < self.size[root_b]:
                      root_a, root_b = root_b, root_a
                  self.parent[root_b] = root_a
                  self.size[root_a] += self.size[root_b]
                  self.components -= 1
                  return True

              def connected(self, a: int, b: int) -> bool:
                  return self.find(a) == self.find(b)

              def component_size(self, x: int) -> int:
                  return self.size[self.find(x)]

              def count(self) -> int:
                  return self.components

          dsu = UnionFind(5)
          dsu.union(0, 1)
          dsu.union(1, 4)
          print(dsu.connected(0, 4), dsu.component_size(4), dsu.count())
        `} output="True 3 3" />
        <SubSection title="Recursive path compression variant">
          <CodeBlock code={`
            def find_recursive(parent: list[int], x: int) -> int:
                if parent[x] != x:
                    parent[x] = find_recursive(parent, parent[x])
                return parent[x]
          `} />
          <P>
            The iterative class avoids recursion depth concerns in Python. The recursive form is concise and safe with
            balancing because tree height remains logarithmic even before compression.
          </P>
        </SubSection>
      </Section>

      <Section title="Inverse Ackermann Complexity">
        <P>
          Combining path compression with union by size/rank makes a sequence of <C>m</C> operations on <C>n</C>
          elements take <C>O(m α(n))</C> total amortized time. <C>α(n)</C>, the inverse Ackermann function, grows so
          slowly that it is at most a tiny single-digit number for any input size that could occur in practice. It is
          not literally constant asymptotically, but DSU operations are effectively constant time in applications.
        </P>
        <Callout type="insight" title="Amortized, not per-call worst case">
          A particular first <C>find</C> can still traverse a path. The bound describes the average cost across a
          sequence of operations, as compression flattens paths and balancing limits tree height.
        </Callout>
      </Section>

      <Section title="Applications">
        <SubSection title="Connected components and cycle detection">
          <P>
            Start with one component per vertex and union every edge. The number of components is the remaining DSU
            count. In an undirected graph, an edge whose endpoints already share a root closes a cycle (including
            parallel-edge cycles under the usual multigraph definition).
          </P>
          <CodeBlock code={`
            def has_cycle(n: int, edges: list[tuple[int, int]]) -> bool:
                dsu = UnionFind(n)
                for u, v in edges:
                    if not dsu.union(u, v):
                        return True
                return False
          `} />
        </SubSection>
        <SubSection title="Kruskal's minimum spanning tree">
          <P>
            Sort weighted edges by weight. Add an edge exactly when its endpoints are in different components, then
            union them. DSU prevents cycles; sorting dominates runtime at <C>O(E log E)</C>. See the graph algorithms
            guide for a full MST implementation.
          </P>
        </SubSection>
        <SubSection title="Accounts merge and equation satisfiability">
          <P>
            For accounts merge, union account indices that share an email, then group emails by final root. For equations
            such as <C>a == b</C> and <C>b != c</C>, union every equality first, then check that no inequality has
            endpoints in the same component.
          </P>
          <CodeBlock code={`
            def equations_possible(equations: list[str]) -> bool:
                dsu = UnionFind(26)
                for equation in equations:
                    if equation[1:3] == "==":
                        dsu.union(ord(equation[0]) - 97, ord(equation[3]) - 97)
                return all(
                    dsu.find(ord(eq[0]) - 97) != dsu.find(ord(eq[3]) - 97)
                    for eq in equations if eq[1:3] == "!="
                )
          `} />
        </SubSection>
        <SubSection title="Online connectivity: Number of Islands II">
          <P>
            For a grid with <C>rows</C> and <C>cols</C>, map cell <C>(r, c)</C> to <C>r * cols + c</C>. When land
            is added, initialize its DSU element and union with each existing land neighbor. This supports online
            updates without rescanning the whole grid after each insertion.
          </P>
          <CodeBlock code={`
            def cell_id(r: int, c: int, cols: int) -> int:
                return r * cols + c
          `} />
        </SubSection>
      </Section>

      <Section title="Complexity and Variants">
        <Table headers={["Variant", "find", "union", "Trade-off"]} rows={[
          ["Quick-find", <C>O(1)</C>, <C>O(n)</C>, "Fast queries; expensive merges"],
          ["Quick-union (unbalanced)", <><C>O(n)</C> worst case</>, <><C>O(n)</C> worst case</>, "Simple but can degenerate into a chain"],
          ["Union by size/rank", <C>O(log n)</C>, <C>O(log n)</C>, "Balancing bounds tree height"],
          ["Size/rank + path compression", <><C>O(α(n))</C> amortized</>, <><C>O(α(n))</C> amortized</>, "Effectively constant across a sequence"],
        ]} />
        <ComplexityTable rows={[
          { operation: <C>make n sets</C>, time: "O(n)", space: "O(n)" },
          { operation: <C>find / connected</C>, time: "O(α(n))", space: "O(1)", note: "Amortized" },
          { operation: <C>union</C>, time: "O(α(n))", space: "O(1)", note: "Amortized" },
          { operation: <C>component count / size</C>, time: "O(α(n))", space: "O(1)" },
        ]} />
        <ProsCons pros={["Very fast incremental connectivity", "Tiny, array-based memory footprint", "Combines naturally with edge-sorted Kruskal"]} cons={["Cannot efficiently split sets or delete edges", "Does not provide a path between connected vertices", "Roots are arbitrary representatives"]} />
      </Section>

      <Section title="Practice Problems">
        <Practice problems={[
          { name: "Number of Connected Components", difficulty: "Medium", hint: "Union each edge and return the remaining set count." },
          { name: "Redundant Connection", difficulty: "Medium", hint: "The first edge that fails to merge closes a cycle." },
          { name: "Accounts Merge", difficulty: "Medium", hint: "Union account IDs that share an email address." },
          { name: "Number of Islands II", difficulty: "Hard", hint: "Create a set for each land addition; merge adjacent land." },
          { name: "Satisfiability of Equality Equations", difficulty: "Medium", hint: "Apply equalities first, then test inequalities." },
          { name: "Minimum Cost to Connect All Points", difficulty: "Medium", hint: "Sort candidate edges and accept cross-component edges." },
        ]} />
      </Section>

      <KeyTakeaways items={[
        <>DSU partitions elements into components using <C>find</C> and <C>union</C>.</>,
        <>Union by size/rank prevents tall trees; path compression flattens paths during lookup.</>,
        <>Together they give <><C>O(α(n))</C> amortized</> cost per operation, effectively constant in practice.</>,
        <>A successful union reduces the component count; a failed union can detect a cycle in an undirected graph.</>,
        <>DSU is for incremental connectivity—not edge deletion or path reconstruction.</>,
      ]} />
    </article>
  );
}