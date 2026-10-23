import { Callout, CodeBlock, C, Diagram, KeyTakeaways, List, P, PageHeader, Practice, ProsCons, Section, Strong, SubSection, Table } from "../../components/doc";

export default function AdvancedGraphs() {
  return (
    <article>
      <PageHeader eyebrow="Graph Algorithms" title="Advanced Graph Algorithms" description="Build on traversal with low-link structure, Euler tours, network flow, matchings, and tree queries. Each topic reveals a different invariant hidden in graph structure." tags={["SCC", "Low-link", "Flow", "LCA"]} />
      <Section title="Strongly Connected Components">
        <P>A strongly connected component (SCC) of a directed graph is a maximal set where every vertex can reach every other. Contracting each SCC produces a DAG called the condensation graph.</P>
        <Diagram caption="Mutually reachable groups compress into single nodes; edges between groups cannot form a cycle.">{`
          [A <-> B] ----> [C <-> D] ----> [E]
             SCC 1           SCC 2       SCC 3
        `}</Diagram>
        <SubSection title="Kosaraju: two DFS passes">
          <P>First DFS records vertices by finish time. Reverse every edge, then process vertices in decreasing finish order; each reverse-graph traversal yields one SCC. Include all vertices, even disconnected or destination-only ones.</P>
          <CodeBlock title="kosaraju.py" code={`def kosaraju(graph: dict[int, list[int]]) -> list[list[int]]:
    vertices = set(graph)
    for neighbors in graph.values():
        vertices.update(neighbors)
    reverse = {node: [] for node in vertices}
    for node, neighbors in graph.items():
        for neighbor in neighbors:
            reverse[neighbor].append(node)
    seen: set[int] = set()
    finish = []
    def first_dfs(node: int) -> None:
        seen.add(node)
        for neighbor in graph.get(node, []):
            if neighbor not in seen:
                first_dfs(neighbor)
        finish.append(node)
    for node in vertices:
        if node not in seen:
            first_dfs(node)
    seen.clear()
    components = []
    def second_dfs(node: int, component: list[int]) -> None:
        seen.add(node)
        component.append(node)
        for neighbor in reverse[node]:
            if neighbor not in seen:
                second_dfs(neighbor, component)
    for node in reversed(finish):
        if node not in seen:
            component = []
            second_dfs(node, component)
            components.append(component)
    return components`} />
        </SubSection>
        <SubSection title="Tarjan: one DFS and a stack">
          <P>Tarjan maintains discovery indices and low links. <C>low[v]</C> is the smallest discovery index reachable from <C>v</C> through DFS-tree edges plus at most one back edge. When <C>low[v] == index[v]</C>, <C>v</C> is the root of an SCC; pop through it.</P>
          <CodeBlock title="tarjan_scc.py" code={`def tarjan_scc(graph: dict[int, list[int]]) -> list[list[int]]:
    vertices = set(graph)
    for neighbors in graph.values():
        vertices.update(neighbors)
    index: dict[int, int] = {}
    low: dict[int, int] = {}
    stack = []
    on_stack: set[int] = set()
    components = []
    clock = 0
    def visit(node: int) -> None:
        nonlocal clock
        index[node] = low[node] = clock
        clock += 1
        stack.append(node)
        on_stack.add(node)
        for neighbor in graph.get(node, []):
            if neighbor not in index:
                visit(neighbor)
                low[node] = min(low[node], low[neighbor])
            elif neighbor in on_stack:
                low[node] = min(low[node], index[neighbor])
        if low[node] == index[node]:
            component = []
            while True:
                member = stack.pop()
                on_stack.remove(member)
                component.append(member)
                if member == node:
                    break
            components.append(component)
    for node in vertices:
        if node not in index:
            visit(node)
    return components`} />
        </SubSection>
      </Section>
      <Section title="Bridges and Articulation Points">
        <P>In an undirected graph, a <Strong>bridge</Strong> is an edge whose removal increases component count. An <Strong>articulation point</Strong> is a vertex whose removal disconnects its component. DFS discovery times and low links characterize when a subtree can reach an ancestor without using its parent edge.</P>
        <CodeBlock title="bridges_articulation.py" code={`def critical_connections(n: int, edges: list[tuple[int, int]]):
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
    discovery = [-1] * n
    low = [0] * n
    bridges = []
    articulation = set()
    clock = 0
    def dfs(node: int, parent: int) -> None:
        nonlocal clock
        discovery[node] = low[node] = clock
        clock += 1
        children = 0
        for neighbor in graph[node]:
            if neighbor == parent:
                continue
            if discovery[neighbor] == -1:
                children += 1
                dfs(neighbor, node)
                low[node] = min(low[node], low[neighbor])
                if low[neighbor] > discovery[node]:
                    bridges.append((node, neighbor))
                if parent != -1 and low[neighbor] >= discovery[node]:
                    articulation.add(node)
            else:
                low[node] = min(low[node], discovery[neighbor])
        if parent == -1 and children > 1:
            articulation.add(node)
    for node in range(n):
        if discovery[node] == -1:
            dfs(node, -1)
    return bridges, articulation`} />
        <Callout type="warning">This parent-vertex version assumes a simple graph (no parallel edges). With parallel edges, identify and skip only the incoming edge ID; another parallel edge is a valid back edge.</Callout>
      </Section>
      <Section title="Eulerian Paths and Itinerary">
        <P>An Eulerian path uses every edge exactly once; an Eulerian circuit also ends where it starts. <Strong>Hierholzer's algorithm</Strong> follows unused edges and stitches cycles together using a stack. In a directed itinerary problem, degree conditions and reachability determine whether a solution exists.</P>
        <CodeBlock title="reconstruct_itinerary.py" code={`from collections import defaultdict
import heapq

def itinerary(tickets: list[tuple[str, str]], start: str = "JFK") -> list[str]:
    outgoing = defaultdict(list)
    for source, destination in tickets:
        heapq.heappush(outgoing[source], destination)
    route = []
    stack = [start]
    while stack:
        while outgoing[stack[-1]]:
            stack.append(heapq.heappop(outgoing[stack[-1]]))
        route.append(stack.pop())
    route.reverse()
    if len(route) != len(tickets) + 1:
        return []
    return route`} />
        <P>Choosing the smallest available destination and reversing the completed route gives the lexicographically smallest valid itinerary. The route-length check rejects disconnected tickets that cannot all be used.</P>
      </Section>
      <Section title="Hamiltonian Paths">
        <P>A Hamiltonian path visits every vertex exactly once; unlike Euler paths, it covers vertices rather than edges. Deciding whether one exists is NP-complete, so general instances have no known polynomial-time algorithm.</P>
        <P>For small <C>n</C>, bitmask DP uses <C>dp[mask][v]</C> to mean that a path visits exactly the vertices in <C>mask</C> and ends at <C>v</C>. Transition from any adjacent endpoint in the smaller mask.</P>
        <CodeBlock title="hamiltonian_path_dp.py" code={`def has_hamiltonian_path(graph: list[list[int]]) -> bool:
    n = len(graph)
    if n == 0:
        return True
    full = (1 << n) - 1
    dp = [0] * (1 << n)
    for node in range(n):
        dp[1 << node] |= 1 << node
    for mask in range(1 << n):
        for end in range(n):
            if not (dp[mask] & (1 << end)):
                continue
            for neighbor in graph[end]:
                bit = 1 << neighbor
                if not (mask & bit):
                    dp[mask | bit] |= bit
    return dp[full] != 0`} />
      </Section>
      <Section title="Maximum Flow and Minimum Cut">
        <P>Flow assigns nonnegative amounts to directed edges, respecting capacities and flow conservation at intermediate vertices. Ford-Fulkerson repeatedly augments along a residual source-to-sink path. Edmonds-Karp chooses such paths with BFS, giving a polynomial bound.</P>
        <CodeBlock title="edmonds_karp.py" code={`from collections import deque

def edmonds_karp(capacity: list[list[int]], source: int, sink: int) -> int:
    n = len(capacity)
    residual = [row[:] for row in capacity]
    max_flow = 0
    while True:
        parent = [-1] * n
        parent[source] = source
        queue = deque([source])
        while queue and parent[sink] == -1:
            node = queue.popleft()
            for neighbor, remaining in enumerate(residual[node]):
                if remaining > 0 and parent[neighbor] == -1:
                    parent[neighbor] = node
                    queue.append(neighbor)
                    if neighbor == sink:
                        break
        if parent[sink] == -1:
            break
        amount = float("inf")
        node = sink
        while node != source:
            prev = parent[node]
            amount = min(amount, residual[prev][node])
            node = prev
        node = sink
        while node != source:
            prev = parent[node]
            residual[prev][node] -= amount
            residual[node][prev] += amount
            node = prev
        max_flow += amount
    return max_flow`} />
        <P>The <Strong>max-flow min-cut theorem</Strong> says maximum flow value equals the capacity of a minimum source-sink cut. After the algorithm stops, vertices reachable from the source in the residual graph define the source side of a minimum cut.</P>
        <Callout type="note">This matrix implementation is clear for teaching but stores O(V^2) capacity. Adjacency lists of residual edges are preferable for sparse networks and need explicit reverse-edge indices.</Callout>
      </Section>
      <Section title="Bipartite Matching and LCA">
        <SubSection title="Bipartite matching">
          <P>A matching chooses edges with no shared endpoints. The augmenting-path method searches for an alternating path that ends at an unmatched right vertex, flipping matched and unmatched edges along the way. Repeating until no augmenting path remains yields a maximum matching.</P>
          <CodeBlock title="augmenting_path_matching.py" code={`def maximum_matching(adj: list[list[int]], right_count: int) -> int:
    match_right = [-1] * right_count
    def augment(left: int, seen: list[bool]) -> bool:
        for right in adj[left]:
            if seen[right]:
                continue
            seen[right] = True
            if match_right[right] == -1 or augment(match_right[right], seen):
                match_right[right] = left
                return True
        return False
    result = 0
    for left in range(len(adj)):
        if augment(left, [False] * right_count):
            result += 1
    return result`} />
          <P>Simple augmenting paths take <C>O(VE)</C> in the worst case. Hopcroft-Karp batches shortest augmenting paths and runs in <C>O(E sqrt(V))</C> for bipartite graphs.</P>
        </SubSection>
        <SubSection title="Lowest common ancestor with binary lifting">
          <P>For a rooted tree, precompute <C>up[v][j]</C>, the ancestor <C>2^j</C> steps above <C>v</C>. Lift the deeper node to equal depth, then lift both from high powers down until their parents coincide.</P>
          <CodeBlock title="lca_query.py" code={`def lca(a: int, b: int, depth: list[int], up: list[list[int]]) -> int:
    if depth[a] < depth[b]:
        a, b = b, a
    difference = depth[a] - depth[b]
    bit = 0
    while difference:
        if difference & 1:
            a = up[a][bit]
        difference >>= 1
        bit += 1
    if a == b:
        return a
    for bit in range(len(up[0]) - 1, -1, -1):
        if up[a][bit] != up[b][bit]:
            a, b = up[a][bit], up[b][bit]
    return up[a][0]`} />
          <P>Preprocessing takes <C>O(N log N)</C> time and memory; each query takes <C>O(log N)</C>. Root ancestors should point to the root (or a sentinel handled consistently).</P>
        </SubSection>
      </Section>
      <Section title="Graph Coloring and Complexity">
        <P>Graph coloring assigns colors to vertices so adjacent vertices differ. Two-colorability is exactly bipartiteness and is testable in linear time. For general graphs, finding the chromatic number is NP-hard; backtracking and DSATUR heuristics are practical on selected small instances.</P>
        <ProsCons pros={["Low-link and residual-graph invariants expose powerful structure beyond traversal.", "Linear-time SCC and bridge algorithms scale to large sparse graphs.", "Flow and matching reduce many allocation problems to a standard model."]} cons={["Several algorithms are easy to misapply when directed and undirected cases differ.", "Recursive DFS can exceed interpreter depth on very large graphs.", "Advanced exact methods can require exponential time or substantial memory."]} />
        <Table headers={["Problem / algorithm", "Time", "Space", "Key use"]} rows={[["Kosaraju SCC", "O(V + E)", "O(V + E)", "Two DFS passes"], ["Tarjan SCC", "O(V + E)", "O(V)", "One DFS and active stack"], ["Bridges / articulation", "O(V + E)", "O(V)", "Low-link in undirected graph"], ["Hierholzer Euler tour", "O(E log E) sorted", "O(V + E)", "Use every edge once"], ["Hamiltonian bitmask DP", "O(2^V V + 2^V E)", "O(2^V V)", "Exact small graph"], ["Edmonds-Karp", "O(V E^2)", "O(V^2)", "Maximum flow, matrix form"], ["Augmenting-path matching", "O(VE)", "O(V + E)", "Small bipartite matching"], ["Hopcroft-Karp", "O(E sqrt(V))", "O(V + E)", "Large bipartite matching"], ["LCA binary lifting", "O(N log N) preprocess", "O(N log N)", "O(log N) per query"]]} />
      </Section>
      <Section title="Pitfalls and Practice">
        <Callout type="warning" title="Mind the graph model"><List items={[<>Low-link bridge tests are for undirected graphs; SCC algorithms are for directed graphs.</>, <>Parallel edges require edge IDs when skipping a DFS parent edge.</>, <>Flow residual reverse edges represent the ability to undo previous choices; update both directions.</>, <>Eulerian path conditions depend on degree balance and connectivity among nonzero-degree vertices.</>]} /></Callout>
        <Practice problems={[
          { name: "Critical Connections in a Network", difficulty: "Hard", hint: "Use discovery times and low links." },
          { name: "Reconstruct Itinerary", difficulty: "Hard", hint: "Hierholzer with lexical edge selection." },
          { name: "Max Flow / Min Cut", difficulty: "Hard", hint: "Build residual capacities and BFS augmenting paths." },
          { name: "Maximum Bipartite Matching", difficulty: "Hard", hint: "Search alternating augmenting paths." },
          { name: "Number of Strongly Connected Components", difficulty: "Hard", hint: "Use Kosaraju or Tarjan." },
          { name: "Lowest Common Ancestor Queries", difficulty: "Medium", hint: "Lift depth difference, then lift both nodes." },
        ]} />
        <KeyTakeaways items={["Use SCCs to group mutual reachability and condense a directed graph to a DAG.", "Low-link values identify bridges, articulation points, and SCC roots under different conditions.", "Hierholzer uses edges once; Hamiltonian search uses vertices once and is much harder.", "Residual paths and cuts are dual views of maximum flow.", "Binary lifting makes repeated ancestor queries logarithmic after preprocessing."]} />
      </Section>
    </article>
  );
}
