import { Callout, CodeBlock, ComplexityTable, C, Diagram, KeyTakeaways, List, P, PageHeader, Practice, ProsCons, Section, Strong, SubSection } from "../../components/doc";

export default function TopologicalSort() {
  return (
    <article>
      <PageHeader eyebrow="Graph Algorithms" title="Topological Sort" description="Order directed acyclic graph vertices so every prerequisite appears before its dependent. Topological order is the foundation for dependency scheduling, DAG dynamic programming, and course planning." tags={["DAG", "Kahn's algorithm", "DFS", "Dependencies"]} />
      <Section title="DAGs and Ordering">
        <P>A <Strong>directed acyclic graph (DAG)</Strong> has directed edges but no directed cycles. A topological ordering is a linear order where every edge <C>{"u -> v"}</C> places <C>u</C> before <C>v</C>. A DAG always has at least one such order; multiple orders are common.</P>
        <Diagram caption="For these prerequisites, either A, B, C, D or B, A, C, D is valid.">{`
          A -----> C -----> D
           \\             ^
            \\----------->|
          B --------------+

          Edges point from prerequisite to dependent.
        `}</Diagram>
        <Diagram caption="A directed edge places its prerequisite to the left of the dependent.">{`
A ---> C ---> D
B ---> C
        `}</Diagram>
        <Callout type="warning" title="A cycle means no valid order">If dependencies contain a directed cycle, each item in the cycle indirectly depends on itself. A topological sort must report failure rather than return a partial schedule as though it were complete.</Callout>
      </Section>
      <Section title="Kahn's Algorithm">
        <P>Compute each vertex's in-degree. Begin with all zero-in-degree vertices, repeatedly remove one from the queue, append it to the answer, and decrement its neighbors. If fewer than <C>V</C> vertices are output, the remaining subgraph contains a cycle.</P>
        <CodeBlock title="kahn.py" code={`from collections import deque

def topological_sort(graph: dict[int, list[int]]) -> list[int] | None:
    indegree = {node: 0 for node in graph}
    for neighbors in graph.values():
        for neighbor in neighbors:
            indegree.setdefault(neighbor, 0)
            indegree[neighbor] += 1
    queue = deque(node for node, degree in indegree.items() if degree == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph.get(node, []):
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)
    return order if len(order) == len(indegree) else None`} />
        <P>The queue can be processed in levels: the vertices available together form a parallelizable batch, provided no additional resource constraints exist.</P>
      </Section>
      <Section title="DFS Topological Sort">
        <P>DFS appends each vertex after all its descendants have been explored (postorder). Reversing the postorder yields a topological order. Use three colors: an edge to a gray, active vertex detects a cycle.</P>
        <CodeBlock title="dfs_topological.py" code={`def topo_dfs(graph: dict[int, list[int]]) -> list[int] | None:
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {node: WHITE for node in graph}
    order = []
    def visit(node: int) -> bool:
        color[node] = GRAY
        for neighbor in graph.get(node, []):
            state = color.setdefault(neighbor, WHITE)
            if state == GRAY:
                return False
            if state == WHITE and not visit(neighbor):
                return False
        color[node] = BLACK
        order.append(node)
        return True
    for node in list(color):
        if color[node] == WHITE and not visit(node):
            return None
    return order[::-1]`} />
        <Callout type="note">DFS recursion depth can reach V. For a very long chain in Python, prefer the iterative Kahn version or implement DFS with explicit enter/exit stack states.</Callout>
      </Section>
      <Section title="Lexicographic Orders and All Orders">
        <SubSection title="Lexicographically smallest order">
          <P>Replace Kahn's FIFO queue with a min-heap. At every step, select the smallest currently available vertex. If vertices are strings, heap entries can be strings; for arbitrary objects, use a stable comparable key.</P>
          <CodeBlock title="lexicographic_topo.py" code={`import heapq

def lexicographic_topological_sort(graph: dict[str, list[str]]) -> list[str] | None:
    indegree = {node: 0 for node in graph}
    for neighbors in graph.values():
        for neighbor in neighbors:
            indegree.setdefault(neighbor, 0)
            indegree[neighbor] += 1
    available = [node for node, degree in indegree.items() if degree == 0]
    heapq.heapify(available)
    order = []
    while available:
        node = heapq.heappop(available)
        order.append(node)
        for neighbor in graph.get(node, []):
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                heapq.heappush(available, neighbor)
    return order if len(order) == len(indegree) else None`} />
        </SubSection>
        <SubSection title="Enumerate every valid ordering">
          <P>Backtrack over every currently zero-in-degree choice. Temporarily remove its outgoing contributions, recurse, then restore state. The number of orders can be factorial, so this is practical only for small graphs or when output is tightly bounded.</P>
          <CodeBlock title="all_topological_orders.py" code={`def all_topological_orders(graph: dict[int, list[int]]):
    indegree = {node: 0 for node in graph}
    for neighbors in graph.values():
        for neighbor in neighbors:
            indegree.setdefault(neighbor, 0)
            indegree[neighbor] += 1
    order = []
    results = []
    def backtrack() -> None:
        if len(order) == len(indegree):
            results.append(order.copy())
            return
        choices = [node for node, degree in indegree.items() if degree == 0 and node not in order]
        for node in choices:
            order.append(node)
            indegree[node] = -1
            for neighbor in graph.get(node, []):
                indegree[neighbor] -= 1
            backtrack()
            for neighbor in graph.get(node, []):
                indegree[neighbor] += 1
            indegree[node] = 0
            order.pop()
    backtrack()
    return results`} />
        </SubSection>
      </Section>
      <Section title="Applications">
        <List items={[<><Strong>Course Schedule I:</Strong> Kahn's algorithm; can all courses be removed from the graph?</>, <><Strong>Course Schedule II:</Strong> return the topological order, or an empty result if a cycle exists.</>, <><Strong>Build systems:</Strong> compile prerequisites before dependents; use the cycle check to report dependency loops.</>, <><Strong>Task scheduling:</Strong> use Kahn layers as parallel batches when tasks have no resource conflicts.</>, <><Strong>Alien Dictionary:</Strong> infer character precedence from adjacent words, then topologically sort; reject invalid prefix ordering and cycles.</>, <><Strong>Longest path in a DAG:</Strong> initialize a source distance, process vertices topologically, and maximize across outgoing edges; unlike general graphs this is linear even with negative weights.</>, <><Strong>Parallel Courses:</Strong> level-based Kahn processing counts prerequisite rounds; durations or concurrency limits may require a richer scheduling model.</>]} />
      </Section>
      <Section title="DAG Dynamic Programming">
        <ProsCons pros={["Kahn naturally exposes ready work and parallel layers.", "DFS postorder integrates cycle detection with traversal.", "The resulting order supports linear-time DAG dynamic programming."]} cons={["The order is not unique unless a tie-breaking rule is imposed.", "A cycle means no complete schedule exists.", "Recursive DFS can hit Python recursion limits on deep input."]} />
        <P>A topological order is a valid evaluation order for recurrences whose state depends on predecessors. For shortest paths, relax each outgoing edge once. For longest paths, use a negative-infinity initial value for unreachable vertices and maximize each transition.</P>
        <CodeBlock title="dag_longest_path.py" code={`def dag_longest_path(order: list[int], graph: dict[int, list[tuple[int, int]]], source: int):
    distance: dict[int, float] = {node: float("-inf") for node in order}
    distance[source] = 0
    parent: dict[int, int | None] = {source: None}
    for node in order:
        if distance[node] == float("-inf"):
            continue
        for neighbor, weight in graph.get(node, []):
            candidate = distance[node] + weight
            if candidate > distance.get(neighbor, float("-inf")):
                distance[neighbor] = candidate
                parent[neighbor] = node
    return distance, parent`} />
      </Section>
      <Section title="Complexity, Pitfalls, and Practice">
        <ComplexityTable rows={[
          { operation: "Kahn queue", time: "O(V + E)", space: "O(V)" },
          { operation: "DFS three-color", time: "O(V + E)", space: "O(V)" },
          { operation: "Lexicographically smallest", time: "O((V + E) log V)", space: "O(V)" },
          { operation: "Enumerate all orders", time: "O(K * (V + E))", space: "O(V) + output", note: "Output count can be factorial" },
          { operation: "DAG shortest/longest path", time: "O(V + E)", space: "O(V)" },
        ]} />
        <Callout type="warning" title="Common mistakes"><List items={[<>Count in-degree for every vertex, including destination-only vertices.</>, <>Only decrement in-degree when removing an edge from a processed vertex.</>, <>A valid ordering need not be unique; tests should check edge precedence, not one exact order.</>, <>For lexicographic order, use a heap rather than assuming insertion order is sufficient.</>]} /></Callout>
        <Practice problems={[
          { name: "Course Schedule", difficulty: "Medium", hint: "Cycle detection in the prerequisite graph." },
          { name: "Course Schedule II", difficulty: "Medium", hint: "Return Kahn's order only if all courses are emitted." },
          { name: "Alien Dictionary", difficulty: "Hard", hint: "Build only the first differing character constraint." },
          { name: "Parallel Courses", difficulty: "Medium", hint: "Process zero-in-degree vertices by layers." },
          { name: "Longest Path in a DAG", difficulty: "Hard", hint: "Topologically relax with max instead of min." },
        ]} />
        <KeyTakeaways items={["Topological order exists exactly when a directed graph is acyclic.", "Kahn's algorithm exposes ready prerequisites and detects cycles by output count.", "DFS postorder reversed is another linear-time method when recursion depth is safe.", "A min-heap gives the lexicographically smallest available choice.", "Topological order turns DAG path and dependency recurrences into one pass."]} />
      </Section>
    </article>
  );
}
