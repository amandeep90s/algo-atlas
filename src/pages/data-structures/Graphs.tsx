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
  Section,
  Strong,
  SubSection,
  Table,
} from "../../components/doc";

export default function Graphs() {
  return (
    <article>
      <PageHeader
        eyebrow="Non-Linear Data Structures"
        title="Graphs"
        description="Graphs model relationships: from road networks and social connections to dependencies and state spaces. The right representation depends on density and the operations you need."
        tags={["Vertices and edges", "Adjacency list", "Directed & weighted", "Graph modeling"]}
      />

      <Section title="Graph Terminology">
        <P>
          A graph is a pair <C>G = (V, E)</C>: a set of <Strong>vertices</Strong> (also called nodes) and a set of
          <Strong> edges</Strong> connecting them. A graph may be directed or undirected, weighted or unweighted, and
          may contain cycles or disconnected components.
        </P>
        <Diagram caption="The left graph is undirected; the right graph has directed, weighted edges.">{`
             undirected                         directed + weighted

                 A                              A --4--> B
                / \\                             ^       |
               B---C                             |       | 2
               |                                 1       v
               D                                 C <--3--+
        `}</Diagram>
        <List items={[
          <><Strong>Degree</Strong> is the number of incident edges in an undirected graph. In directed graphs, <C>in-degree</C> counts incoming edges and <C>out-degree</C> counts outgoing edges.</>,
          <><Strong>Path</Strong> is a sequence of adjacent vertices; a <Strong>cycle</Strong> is a path that returns to its starting vertex.</>,
          <><Strong>Connected</Strong> means every pair has a path in an undirected graph. A directed graph is <Strong>strongly connected</Strong> when every vertex can reach every other.</>,
          <><Strong>DAG</Strong> is a directed acyclic graph; it admits a topological ordering.</>,
          <><Strong>Dense</Strong> graphs have many edges relative to <C>V²</C>; <Strong>sparse</Strong> graphs have relatively few.</>,
          <><Strong>Bipartite</Strong> graphs split vertices into two sets so every edge crosses between sets.</>,
          <>A <Strong>tree</Strong> is a connected, acyclic, undirected graph; with <C>V</C> vertices it has exactly <C>V - 1</C> edges.</>,
        ]} />
      </Section>

      <Section title="Graph Representations">
        <P>
          An input often gives an edge list such as <C>(u, v)</C> pairs. Convert it once into the representation that
          matches the workload. For an undirected edge, record both directions in adjacency structures.
        </P>
        <SubSection title="Adjacency list">
          <P>
            A dictionary maps each vertex to its neighbors. It is the default for sparse graphs and traversal. Use
            <C>defaultdict(list)</C> when vertices can be created as edges are read; explicitly initialize isolated
            vertices if they matter.
          </P>
          <CodeBlock title="adjacency_list.py" code={`
            from collections import defaultdict

            vertices = ["A", "B", "C", "D"]
            edges = [("A", "B"), ("A", "C"), ("B", "D")]
            graph = {vertex: [] for vertex in vertices}
            for u, v in edges:
                graph[u].append(v)
                graph[v].append(u)  # omit this line for a directed graph

            adjacency = defaultdict(list)
            for u, v in edges:
                adjacency[u].append(v)
                adjacency[v].append(u)
          `} />
        </SubSection>
        <SubSection title="Adjacency matrix">
          <P>
            A <C>V × V</C> matrix stores whether an edge exists (or its weight). A symmetric matrix represents an
            undirected graph. Initialize it with a numeric sentinel for “no edge” when zero is a valid weight.
          </P>
          <CodeBlock title="adjacency_matrix.py" code={`
            n = 4
            edges = [(0, 1), (0, 2), (1, 3)]
            matrix = [[False] * n for _ in range(n)]
            for u, v in edges:
                matrix[u][v] = True
                matrix[v][u] = True  # omit for directed graphs
          `} />
        </SubSection>
        <SubSection title="Edge list">
          <P>
            Keep edges as pairs or triples <C>(u, v, weight)</C>. It is compact and convenient when algorithms process
            every edge (for example, Kruskal's MST), but does not efficiently provide one vertex's neighbors.
          </P>
          <CodeBlock title="edge_list.py" code={`
            edges = [("A", "B"), ("A", "C"), ("B", "D")]
            weighted_edges = [("A", "B", 4), ("B", "C", 2)]
          `} />
        </SubSection>
        <Table headers={["Representation", "Space", "Check edge (u, v)", "Iterate neighbors of u", "Good fit"]} rows={[
          ["Adjacency list", <C>O(V + E)</C>, <><C>O(degree(u))</C> (or O(1) with sets)</>, <C>O(degree(u))</C>, "Sparse graphs and traversal"],
          ["Adjacency matrix", <C>O(V²)</C>, <C>O(1)</C>, <C>O(V)</C>, "Dense graphs or frequent edge checks"],
          ["Edge list", <C>O(E)</C>, <C>O(E)</C>, <C>O(E)</C>, "Sorting or scanning all edges"],
        ]} />
      </Section>

      <Section title="A Reusable Graph Class">
        <P>
          This undirected unweighted class uses sets to prevent duplicate edges and support constant-time membership.
          A directed graph would add only <C>u → v</C>; a weighted graph can map each neighbor to its weight.
        </P>
        <CodeBlock title="graph.py" code={`
          class Graph:
              def __init__(self) -> None:
                  self.adj: dict[str, set[str]] = {}

              def add_vertex(self, vertex: str) -> None:
                  self.adj.setdefault(vertex, set())

              def add_edge(self, u: str, v: str) -> None:
                  self.add_vertex(u)
                  self.add_vertex(v)
                  self.adj[u].add(v)
                  self.adj[v].add(u)

              def remove_edge(self, u: str, v: str) -> None:
                  self.adj.get(u, set()).discard(v)
                  self.adj.get(v, set()).discard(u)

              def neighbors(self, vertex: str) -> set[str]:
                  return self.adj.get(vertex, set())

              def has_edge(self, u: str, v: str) -> bool:
                  return v in self.adj.get(u, set())

          # Weighted adjacency: dict[Vertex, dict[Neighbor, Weight]]
          weighted = {"A": {"B": 4}, "B": {"A": 4}}
        `} />
        <Callout type="note" title="Avoid accidental graph mutation">
          <C>defaultdict(list)</C> creates a missing key on lookup. If reading an unknown vertex should not mutate the
          graph, use <C>dict.get(vertex, [])</C> or an explicit membership check.
        </Callout>
      </Section>

      <Section title="Implicit Graphs">
        <P>
          The graph need not be materialized. In a grid, each cell is a vertex and legal moves generate neighbors on
          demand. Four-direction movement uses orthogonal offsets; eight-direction movement adds diagonals. For a word
          ladder, words are vertices and edges connect words differing by one letter; generate candidate neighbors
          instead of building all pairwise edges.
        </P>
        <CodeBlock title="grid_neighbors.py" code={`
          FOUR_DIRECTIONS = ((1, 0), (-1, 0), (0, 1), (0, -1))
          EIGHT_DIRECTIONS = tuple(
              (dr, dc)
              for dr in (-1, 0, 1)
              for dc in (-1, 0, 1)
              if (dr, dc) != (0, 0)
          )

          def neighbors(r: int, c: int, rows: int, cols: int):
              for dr, dc in FOUR_DIRECTIONS:
                  nr, nc = r + dr, c + dc
                  if 0 <= nr < rows and 0 <= nc < cols:
                      yield nr, nc
        `} />
        <Callout type="tip">
          Implicit representations save memory and often reduce setup time. Keep the neighbor-generation rule simple,
          since BFS or DFS may call it once for every expanded vertex.
        </Callout>
      </Section>

      <Section title="Useful Facts and Weighted Graphs">
        <SubSection title="Handshake lemma">
          <P>
            In any finite undirected graph, the sum of all vertex degrees is <C>2E</C>, because every edge contributes
            one to the degree at each endpoint. Therefore the number of odd-degree vertices is even. For directed graphs,
            the sum of in-degrees and the sum of out-degrees each equal <C>E</C>.
          </P>
        </SubSection>
        <SubSection title="Weights and parallel edges">
          <P>
            Weights can model distance, cost, time, or capacity. Decide whether parallel edges and self-loops are valid
            in the problem. For shortest paths, non-negative weights enable Dijkstra; negative edges require a different
            approach such as Bellman–Ford. In an unweighted graph, each edge is effectively unit cost.
          </P>
        </SubSection>
      </Section>

      <Section title="Graph Algorithm Roadmap">
        <P>
          Data structures describe a graph; algorithms answer questions about it. The following guides build on these
          representations:
        </P>
        <List items={[
          <><a href="/graph-algorithms/traversal" className="text-indigo-300 hover:text-indigo-200">BFS and DFS</a>: reachability, connected components, and traversal trees, typically <C>O(V + E)</C>.</>,
          <><a href="/graph-algorithms/shortest-paths" className="text-indigo-300 hover:text-indigo-200">Shortest paths</a>: BFS for unweighted graphs, Dijkstra for non-negative weights, and Bellman–Ford for negative edges.</>,
          <><a href="/graph-algorithms/minimum-spanning-tree" className="text-indigo-300 hover:text-indigo-200">Minimum spanning trees</a>: Prim's and Kruskal's algorithms connect all vertices at minimum total weight.</>,
          <><a href="/graph-algorithms/topological-sort" className="text-indigo-300 hover:text-indigo-200">Topological sort</a>: order tasks in a DAG; failure to order every vertex signals a cycle.</>,
          <><a href="/graph-algorithms/advanced" className="text-indigo-300 hover:text-indigo-200">Strongly connected components</a>: partition a directed graph into maximal mutually reachable groups.</>,
        ]} />
      </Section>

      <Section title="Complexity and Practice">
        <ComplexityTable rows={[
          { operation: <C>store adjacency list</C>, time: "O(V + E)", space: "O(V + E)" },
          { operation: <C>store adjacency matrix</C>, time: "O(V²)", space: "O(V²)" },
          { operation: <C>add edge (list)</C>, time: "O(1)", space: "O(1)" },
          { operation: <C>check edge (matrix)</C>, time: "O(1)", space: "O(1)" },
          { operation: <C>iterate neighbors (list)</C>, time: "O(degree(v))", space: "O(1)" },
          { operation: <C>BFS / DFS</C>, time: "O(V + E)", space: "O(V)" },
        ]} />
        <Practice problems={[
          { name: "Number of Islands", difficulty: "Medium", hint: "Treat land cells as vertices and visit four-directional neighbors." },
          { name: "Clone Graph", difficulty: "Medium", hint: "Map each original vertex to one copied vertex." },
          { name: "Course Schedule", difficulty: "Medium", hint: "A valid course order exists exactly when prerequisites form a DAG." },
          { name: "Word Ladder", difficulty: "Hard", hint: "Use implicit neighbors and BFS over word transformations." },
          { name: "Network Delay Time", difficulty: "Medium", hint: "Use a weighted adjacency list and Dijkstra's algorithm." },
          { name: "Is Graph Bipartite?", difficulty: "Medium", hint: "Two-color each component with BFS or DFS." },
        ]} />
      </Section>

      <KeyTakeaways items={[
        <>Graphs consist of vertices and edges, with directedness and weights determined by the model.</>,
        <>Adjacency lists suit sparse graphs; matrices provide constant-time edge checks at quadratic space cost.</>,
        <>Represent edge lists directly when an algorithm scans or sorts all edges.</>,
        <>Grid movement and word transformations are graphs even when their edges are generated implicitly.</>,
        <>The adjacency-list traversal baseline is <C>O(V + E)</C>; match the representation to the algorithm's operations.</>,
      ]} />
    </article>
  );
}