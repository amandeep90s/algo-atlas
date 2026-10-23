import { DijkstraVisualizer } from "../../components/visualizers";
import { Callout, CodeBlock, ComplexityTable, C, Diagram, KeyTakeaways, ProsCons, List, P, PageHeader, Practice, Section, Strong, SubSection, Table } from "../../components/doc";

export default function ShortestPaths() {
  return (
    <article>
      <PageHeader eyebrow="Graph Algorithms" title="Shortest Paths" description="Choose a shortest-path algorithm by graph structure and weight constraints: BFS for hops, Dijkstra for nonnegative weights, Bellman-Ford for negative edges, and dynamic programming for dense or acyclic graphs." tags={["BFS", "Dijkstra", "Bellman-Ford", "A*"]} />
      <Section title="Choose the Problem Variant">
        <P>A shortest path minimizes the sum of edge costs. First clarify whether the task asks for distances from one source, every pair, or a constrained destination; whether edges are weighted; and whether negative weights are possible.</P>
        <Table headers={["Variant", "Typical choice", "Why"]} rows={[["Unweighted / equal edge costs", "BFS", "Each edge adds one hop; levels are optimal."], ["Single source, nonnegative weights", "Dijkstra", "Greedily finalizes the smallest tentative distance."], ["Negative edges allowed", "Bellman-Ford", "Repeated relaxation handles negative edges and detects reachable negative cycles."], ["All pairs, dense or small graph", "Floyd-Warshall", "Simple O(V^3) dynamic programming."], ["DAG, any edge weights", "Topological relaxation", "One pass works even with negative edges."], ["Single target with useful heuristic", "A*", "Prioritizes promising nodes; optimality requires an admissible heuristic."]]} />
        <Diagram caption="Each path cost is the sum of its edge weights; a shortest path has the smallest total, not necessarily the fewest edges.">{`
source --------8--------> target
source --1--> B --1--> target
        `}</Diagram>
        <Callout type="warning" title="Negative cycles">If a reachable negative-weight cycle can also reach the target, no finite shortest path exists: looping around the cycle reduces the cost without bound.</Callout>
      </Section>
      <Section title="Interactive Visualizer">
        <DijkstraVisualizer />
      </Section>
      <Section title="BFS for Unweighted Graphs">
        <P>For unit-cost edges, BFS is Dijkstra with every edge weight equal to one. Save a parent when first discovered to restore a shortest path.</P>
        <CodeBlock title="bfs_shortest_path.py" code={`from collections import deque

def bfs_shortest_path(graph: dict[int, list[int]], source: int, target: int) -> list[int] | None:
    parent: dict[int, int | None] = {source: None}
    queue = deque([source])
    while queue:
        node = queue.popleft()
        if node == target:
            break
        for neighbor in graph.get(node, []):
            if neighbor not in parent:
                parent[neighbor] = node
                queue.append(neighbor)
    if target not in parent:
        return None
    path = []
    node: int | None = target
    while node is not None:
        path.append(node)
        node = parent[node]
    return path[::-1]`} />
        <Diagram caption="In an unweighted graph, the first layer reaching the target has the fewest edges.">{`
source (0)  ->  layer 1  ->  layer 2  ->  target
     queue: [frontier in nondecreasing distance]
        `}</Diagram>
      </Section>
      <Section title="Dijkstra with a Min-Heap">
        <P>Dijkstra repeatedly settles the unvisited vertex with smallest tentative distance, then relaxes its outgoing edges. Python's <C>heapq</C> has no decrease-key operation, so push improved entries and discard stale entries when popped (lazy deletion).</P>
        <CodeBlock title="dijkstra.py" code={`import heapq
from math import inf

def dijkstra(graph: dict[int, list[tuple[int, int]]], source: int):
    distance = {node: inf for node in graph}
    parent: dict[int, int | None] = {source: None}
    distance[source] = 0
    heap = [(0, source)]
    while heap:
        cost, node = heapq.heappop(heap)
        if cost != distance[node]:  # stale entry
            continue
        for neighbor, weight in graph.get(node, []):
            candidate = cost + weight
            if candidate < distance.get(neighbor, inf):
                distance[neighbor] = candidate
                parent[neighbor] = node
                heapq.heappush(heap, (candidate, neighbor))
    return distance, parent


def reconstruct_path(parent: dict[int, int | None], target: int) -> list[int] | None:
    if target not in parent:
        return None
    path = []
    node: int | None = target
    while node is not None:
        path.append(node)
        node = parent[node]
    return path[::-1]`} />
        <Callout type="warning" title="Why negative edges break Dijkstra">Dijkstra assumes a popped minimum distance can never improve. A later negative edge can create a cheaper route to an already-settled vertex, invalidating that assumption. Use Bellman-Ford or exploit DAG order instead.</Callout>
      </Section>
      <Section title="0-1 BFS and Bellman-Ford">
        <SubSection title="0-1 BFS">
          <P>When weights are exactly zero or one, a deque gives Dijkstra-like ordering without a heap: push zero-cost relaxations to the front and one-cost relaxations to the back. Keep a distance array and ignore obsolete queue states.</P>
          <CodeBlock title="zero_one_bfs.py" code={`from collections import deque
from math import inf

def zero_one_bfs(graph: dict[int, list[tuple[int, int]]], source: int) -> dict[int, float]:
    distance = {node: inf for node in graph}
    distance[source] = 0
    queue = deque([(source, 0)])
    while queue:
        node, known = queue.popleft()
        if known != distance[node]:
            continue
        for neighbor, weight in graph.get(node, []):
            candidate = known + weight
            if candidate < distance.get(neighbor, inf):
                distance[neighbor] = candidate
                state = (neighbor, candidate)
                if weight == 0:
                    queue.appendleft(state)
                else:
                    queue.append(state)
    return distance`} />
        </SubSection>
        <SubSection title="Bellman-Ford">
          <P>Relax every edge up to <C>V - 1</C> times. A shortest simple path contains at most <C>V - 1</C> edges. One further improving pass proves a negative cycle is reachable from the source.</P>
          <CodeBlock title="bellman_ford.py" code={`from math import inf

def bellman_ford(vertex_count: int, edges: list[tuple[int, int, int]], source: int):
    distance = [inf] * vertex_count
    parent: list[int | None] = [None] * vertex_count
    distance[source] = 0
    for _ in range(vertex_count - 1):
        changed = False
        for u, v, weight in edges:
            if distance[u] != inf and distance[u] + weight < distance[v]:
                distance[v] = distance[u] + weight
                parent[v] = u
                changed = True
        if not changed:
            break
    has_negative_cycle = any(
        distance[u] != inf and distance[u] + weight < distance[v]
        for u, v, weight in edges
    )
    return distance, parent, has_negative_cycle`} />
          <P>SPFA is a queue-based Bellman-Ford variant that enqueues only vertices whose distances changed. It can be fast on many sparse inputs, but its worst case remains <C>O(VE)</C>; it is not a guaranteed improvement.</P>
        </SubSection>
      </Section>
      <Section title="All-Pairs and DAG Shortest Paths">
        <SubSection title="Floyd-Warshall dynamic programming">
          <P>Let <C>dist[i][j]</C> be the best route using only the first <C>k</C> vertices as intermediates. For each intermediate <C>k</C>, update with <C>dist[i][k] + dist[k][j]</C>. A negative diagonal after all updates signals a negative cycle.</P>
          <CodeBlock title="floyd_warshall.py" code={`from math import inf

def floyd_warshall(n: int, edges: list[tuple[int, int, int]]):
    distance = [[inf] * n for _ in range(n)]
    for i in range(n):
        distance[i][i] = 0
    for u, v, weight in edges:
        distance[u][v] = min(distance[u][v], weight)
    for k in range(n):
        for i in range(n):
            if distance[i][k] == inf:
                continue
            for j in range(n):
                distance[i][j] = min(distance[i][j], distance[i][k] + distance[k][j])
    negative_cycle = any(distance[i][i] < 0 for i in range(n))
    return distance, negative_cycle`} />
        </SubSection>
        <SubSection title="DAG shortest paths">
          <P>In a directed acyclic graph, topologically order vertices, then relax each outgoing edge once in that order. Negative weights are safe because every predecessor is processed before its destination.</P>
          <CodeBlock title="dag_shortest.py" code={`from math import inf

def dag_shortest_path(order: list[int], graph: dict[int, list[tuple[int, int]]], source: int):
    distance = {node: inf for node in order}
    parent: dict[int, int | None] = {source: None}
    distance[source] = 0
    for node in order:
        if distance[node] == inf:
            continue
        for neighbor, weight in graph.get(node, []):
            candidate = distance[node] + weight
            if candidate < distance.get(neighbor, inf):
                distance[neighbor] = candidate
                parent[neighbor] = node
    return distance, parent`} />
        </SubSection>
      </Section>
      <Section title="A* Search">
        <P>A* ranks a state by <C>f(n) = g(n) + h(n)</C>: the known path cost plus an estimated remaining cost. For four-direction movement on a unit-cost grid, Manhattan distance is admissible because it never overestimates the number of required moves. Obstacles can make the actual route longer, not shorter.</P>
        <CodeBlock title="astar_grid.py" code={`import heapq

def astar_grid(open_cells: set[tuple[int, int]], start: tuple[int, int], goal: tuple[int, int]):
    def heuristic(cell: tuple[int, int]) -> int:
        return abs(cell[0] - goal[0]) + abs(cell[1] - goal[1])
    cost = {start: 0}
    parent = {start: None}
    heap = [(heuristic(start), 0, start)]
    while heap:
        _, known, cell = heapq.heappop(heap)
        if known != cost[cell]:
            continue
        if cell == goal:
            path = []
            current = cell
            while current is not None:
                path.append(current)
                current = parent[current]
            return path[::-1]
        r, c = cell
        for nxt in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            candidate = known + 1
            if nxt in open_cells and candidate < cost.get(nxt, float("inf")):
                cost[nxt] = candidate
                parent[nxt] = cell
                heapq.heappush(heap, (candidate + heuristic(nxt), candidate, nxt))
    return None`} />
        <Callout type="note">For weighted grids, the heuristic must be scaled so it does not overestimate the cheapest possible remaining cost. An inadmissible heuristic may find a route quickly but need not find an optimal one.</Callout>
      </Section>
      <Section title="Algorithm Comparison">
        <Table headers={["Algorithm", "Time", "Negative weights?", "Best fit"]} rows={[["BFS", "O(V + E)", "No (unless all equal)", "Unweighted / equal-cost edges"], ["0-1 BFS", "O(V + E)", "Only 0 and 1", "Binary edge weights"], ["Dijkstra + heap", "O((V + E) log V)", "No", "Single source, nonnegative sparse graph"], ["Bellman-Ford", "O(VE)", "Yes; detects reachable cycle", "Negative edges, modest graph"], ["SPFA", "O(VE) worst case", "Yes", "Queue-based relaxation; performance varies"], ["Floyd-Warshall", "O(V^3)", "Yes; detects any cycle", "All pairs, small/dense graph"], ["DAG relaxation", "O(V + E)", "Yes", "Acyclic directed graph"], ["A*", "Depends on heuristic", "Usually nonnegative", "Single target with useful heuristic"]]} />
        <ProsCons pros={["BFS, Dijkstra, Bellman-Ford, and DAG relaxation each fit a distinct weight structure.", "Parent pointers make a concrete route available alongside its distance.", "Early exits and graph structure can avoid unnecessary work."]} cons={["Using the wrong weight assumptions can silently produce an incorrect answer.", "All-pairs tables use quadratic memory.", "Constraints such as stop counts require additional state."]} />
        <ComplexityTable rows={[
          { operation: "Dijkstra with lazy heap", time: "O((V + E) log V)", space: "O(V + E)" },
          { operation: "Bellman-Ford", time: "O(VE)", space: "O(V)" },
          { operation: "Floyd-Warshall", time: "O(V^3)", space: "O(V^2)" },
          { operation: "BFS / DAG relaxation", time: "O(V + E)", space: "O(V)" },
        ]} />
      </Section>
      <Section title="Classic Problems and Practice">
        <List items={[<><Strong>Network Delay Time:</Strong> Dijkstra from the signal source; return the maximum finite distance, or -1 if any node is unreachable.</>, <><Strong>Cheapest Flights Within K Stops:</Strong> bound relaxations by the number of allowed edges, or use layered DP; ordinary Dijkstra without state can violate the stop constraint.</>, <><Strong>Path With Minimum Effort:</Strong> minimize the maximum edge difference; use Dijkstra with <C>max(current, edge_cost)</C> as the relaxation.</>]} />
        <Callout type="warning" title="Constrained paths need expanded state">When feasibility depends on stops, fuel, keys, or time, include that resource in the state (for example, <C>(node, stops_used)</C>); a single distance per vertex may discard a necessary alternative.</Callout>
        <Practice problems={[
          { name: "Network Delay Time", difficulty: "Medium", hint: "Run Dijkstra on directed weighted edges." },
          { name: "Path With Minimum Effort", difficulty: "Medium", hint: "Use minimax relaxation or binary search with BFS." },
          { name: "Cheapest Flights Within K Stops", difficulty: "Medium", hint: "Track the number of edges used." },
          { name: "Bellman-Ford Negative Cycle", difficulty: "Hard", hint: "Check for one more possible relaxation." },
          { name: "Find the City With the Smallest Number of Neighbors", difficulty: "Medium", hint: "All-pairs shortest paths or repeated Dijkstra." },
        ]} />
        <KeyTakeaways items={["Start by classifying edge weights and query shape.", "Use BFS for minimum hops; use Dijkstra only with nonnegative weights.", "Bellman-Ford detects source-reachable negative cycles; Floyd-Warshall detects negative diagonals.", "Exploit DAG order and admissible heuristics when the problem structure permits.", "Reconstruct paths with predecessor links and include constraint state when necessary."]} />
      </Section>
    </article>
  );
}
