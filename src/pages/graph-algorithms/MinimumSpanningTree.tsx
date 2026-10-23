import { Callout, CodeBlock, ComplexityTable, C, Diagram, KeyTakeaways, List, P, PageHeader, Practice, ProsCons, Section, Strong, SubSection, Table } from "../../components/doc";

export default function MinimumSpanningTree() {
  return (
    <article>
      <PageHeader eyebrow="Graph Algorithms" title="Minimum Spanning Trees" description="Connect every vertex of a connected, weighted, undirected graph at minimum total cost. Greedy cut and cycle properties lead to Kruskal's and Prim's algorithms." tags={["Kruskal", "Prim", "Union-Find", "Greedy"]} />
      <Section title="Spanning Trees and Minimum Cost">
        <P>A <Strong>spanning tree</Strong> is a connected, acyclic subgraph containing every vertex. Every spanning tree on <C>V</C> vertices has exactly <C>V - 1</C> edges. A <Strong>minimum spanning tree (MST)</Strong> is a spanning tree with minimum sum of edge weights.</P>
        <P>MST is defined for undirected weighted graphs. If a graph is disconnected, there is no spanning tree; the minimum spanning forest contains one MST per component.</P>
        <Diagram caption="One possible MST: select the lightest edges that connect new components without creating a cycle.">{`
          1             2
          A ----1------ B
           \\           | \\
          4  \\         2|  \\3
               \\       |    \\
                C ----1---- D

Selected: A-B (1), B-C (2), C-D (1)
Total weight: 4
        `}</Diagram>
        <Table headers={["Kruskal step", "Action", "Forest state"]} rows={[["1", "Sort candidate edges by weight", "No edges selected"], ["2", "Take A-B (weight 1)", "Component {A, B}"], ["3", "Take C-D (weight 1)", "Components {A, B} and {C, D}"], ["4", "Take B-C (weight 2)", "All four vertices connected; stop at V - 1 edges"], ["5", "Skip any later edge that closes a cycle", "Total selected cost = 4"]]} />
      </Section>
      <Section title="Cut and Cycle Properties">
        <P>A <Strong>cut</Strong> partitions vertices into two groups; an edge crosses the cut if its endpoints lie on opposite sides. The lightest edge crossing any cut is safe for some MST (if weights tie, there may be multiple valid choices). This <Strong>cut property</Strong> justifies greedy growth.</P>
        <P>The <Strong>cycle property</Strong> says a uniquely heaviest edge on a cycle cannot belong to an MST. If equal weights occur, do not assume every maximum edge is excluded; some tied edge choices may still be valid.</P>
        <Callout type="insight" title="The shared invariant">Kruskal grows a forest by joining components with the cheapest safe edge. Prim grows one tree by adding the cheapest edge crossing from its current tree to an outside vertex.</Callout>
      </Section>
      <Section title="Kruskal with Union-Find">
        <P>Sort edges in nondecreasing weight. A disjoint-set union structure answers whether an edge would join distinct components. Add only such edges and stop after selecting <C>V - 1</C>.</P>
        <CodeBlock title="kruskal.py" code={`class UnionFind:
    def __init__(self, n: int):
        self.parent = list(range(n))
        self.size = [1] * n
        self.components = n

    def find(self, x: int) -> int:
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]  # path halving
            x = self.parent[x]
        return x

    def union(self, a: int, b: int) -> bool:
        root_a, root_b = self.find(a), self.find(b)
        if root_a == root_b:
            return False
        if self.size[root_a] < self.size[root_b]:
            root_a, root_b = root_b, root_a
        self.parent[root_b] = root_a
        self.size[root_a] += self.size[root_b]
        self.components -= 1
        return True


def kruskal(n: int, edges: list[tuple[int, int, int]]):
    """Edges are (weight, u, v); return forest edges and total cost."""
    union_find = UnionFind(n)
    chosen = []
    total = 0
    for weight, u, v in sorted(edges):
        if union_find.union(u, v):
            chosen.append((u, v, weight))
            total += weight
            if len(chosen) == n - 1:
                break
    return chosen, total  # a disconnected graph returns its minimum spanning forest`} />
        <Callout type="note">A spanning tree may have negative-weight edges; Kruskal and Prim remain valid. The algorithm minimizes the total while still connecting all vertices.</Callout>
      </Section>
      <Section title="Prim with a Heap">
        <P>Start from any vertex. Put its outgoing edges into a min-heap; repeatedly accept the cheapest edge whose destination is not already in the tree, then add that destination's outgoing edges. Heap entries are lazy: stale edges are discarded when their destination is visited.</P>
        <CodeBlock title="prim_heap.py" code={`import heapq

def prim(graph: dict[int, list[tuple[int, int]]], start: int = 0):
    """Undirected adjacency list of (neighbor, weight). Return None if disconnected."""
    if not graph:
        return [], 0
    visited = {start}
    heap = [(weight, start, neighbor) for neighbor, weight in graph[start]]
    heapq.heapify(heap)
    chosen = []
    total = 0
    while heap and len(visited) < len(graph):
        weight, source, node = heapq.heappop(heap)
        if node in visited:
            continue
        visited.add(node)
        chosen.append((source, node, weight))
        total += weight
        for neighbor, edge_weight in graph[node]:
            if neighbor not in visited:
                heapq.heappush(heap, (edge_weight, node, neighbor))
    if len(visited) != len(graph):
        return None
    return chosen, total`} />
        <SubSection title="Dense graph array variant">
          <P>For dense graphs, an array implementation avoids heap overhead. Store the cheapest known edge that connects each outside vertex to the tree; repeatedly choose the minimum key and update all vertices. This is <C>O(V^2)</C> time and <C>O(V)</C> auxiliary space with a weight matrix.</P>
          <CodeBlock title="prim_dense.py" code={`from math import inf

def prim_dense(weight: list[list[float]]) -> float | None:
    n = len(weight)
    if n == 0:
        return 0
    best = [inf] * n
    best[0] = 0
    used = [False] * n
    total = 0
    for _ in range(n):
        node = min((i for i in range(n) if not used[i]), key=lambda i: best[i], default=-1)
        if node == -1 or best[node] == inf:
            return None
        used[node] = True
        total += best[node]
        for neighbor in range(n):
            if not used[neighbor] and weight[node][neighbor] < best[neighbor]:
                best[neighbor] = weight[node][neighbor]
    return total`} />
          <P>Use <C>inf</C> for missing edges, not zero, when zero-weight edges are valid. The matrix must represent an undirected graph symmetrically.</P>
        </SubSection>
      </Section>
      <Section title="Kruskal vs Prim">
        <Table headers={["Property", "Kruskal", "Prim"]} rows={[["Growth", "Forest, then merges components", "One tree grows outward"], ["Main structure", "Sorted edge list + Union-Find", "Priority queue or key array"], ["Sparse graph", "O(E log E), often excellent", "O(E log V) with adjacency list"], ["Dense graph", "Sort all edges", "O(V^2) array version is competitive"], ["Disconnected graph", "Naturally returns a minimum forest", "Run from each component for a forest"], ["Input style", "Edge list", "Adjacency list or matrix"]]} />
        <ProsCons pros={["Both are correct greedy algorithms backed by cut/cycle properties.", "Kruskal is compact when input is already an edge list.", "Prim is convenient for adjacency-list exploration and grows from a chosen seed."]} cons={["Kruskal needs sorting and a reliable disjoint-set implementation.", "Heap Prim can store many candidate edges.", "A disconnected input cannot have a spanning tree; handle that explicitly."]} />
      </Section>
      <Section title="Boruvka and Applications">
        <P><Strong>Boruvka's algorithm</Strong> repeatedly finds the cheapest outgoing edge for every current component and merges those choices. The component count shrinks quickly, giving parallelizable rounds and a useful distributed MST strategy.</P>
        <List items={[<><Strong>Network design:</Strong> connect sites with minimum total cable, road, or pipeline cost.</>, <><Strong>Clustering:</Strong> remove the largest edges from an MST to split data into clusters.</>, <><Strong>Approximation and structure:</Strong> an MST provides a low-cost backbone and helps reason about connectivity.</>]} />
      </Section>
      <Section title="Complexity and Practice">
        <ComplexityTable rows={[
          { operation: "Kruskal", time: "O(E log E)", space: "O(V + E)", note: "Union-Find adds near-constant amortized operations" },
          { operation: "Prim with binary heap", time: "O(E log V)", space: "O(V + E)" },
          { operation: "Prim dense array / matrix", time: "O(V^2)", space: "O(V^2)", note: "Matrix input dominates storage" },
          { operation: "Union-Find find / union", time: "O(alpha(V))", space: "O(V)", note: "Amortized with path compression and union by size" },
        ]} />
        <Callout type="warning" title="MST is not a shortest-path tree">An MST minimizes the sum of its selected edges globally. It does not necessarily minimize the distance from a chosen root to every vertex. Use Dijkstra for single-source shortest paths.</Callout>
        <Practice problems={[
          { name: "Min Cost to Connect All Points", difficulty: "Medium", hint: "Complete-graph Prim avoids materializing every edge." },
          { name: "Connecting Cities With Minimum Cost", difficulty: "Medium", hint: "Sort connections and use Union-Find." },
          { name: "Optimize Water Distribution in a Village", difficulty: "Hard", hint: "Model building a well as an edge to a virtual source." },
          { name: "Find Critical and Pseudo-Critical Edges in MST", difficulty: "Hard", hint: "Compare MST costs when an edge is forced or removed." },
          { name: "Min Cost to Connect All Points (Prim)", difficulty: "Medium", hint: "Generate Manhattan distances on demand." },
        ]} />
        <KeyTakeaways items={["An MST connects every vertex with V - 1 edges and no cycles.", "Kruskal chooses safe edges globally; Prim chooses safe edges crossing its growing cut.", "Union-Find makes cycle prevention efficient in Kruskal.", "Check connectivity and distinguish an MST from shortest paths.", "Use dense Prim when an O(V^2) scan beats heap and edge sorting overhead."]} />
      </Section>
    </article>
  );
}
