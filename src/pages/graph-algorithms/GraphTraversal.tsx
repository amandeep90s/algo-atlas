import { GraphTraversalVisualizer } from "../../components/visualizers";
import {
  Callout, CodeBlock, ComplexityTable, C, Diagram, KeyTakeaways, List, P,
  PageHeader, Practice, ProsCons, Section, Strong, SubSection, Table,
} from "../../components/doc";

export default function GraphTraversal() {
  return (
    <article>
      <PageHeader eyebrow="Graph Algorithms" title="Graph Traversal" description="Explore vertices systematically with breadth-first or depth-first search. These patterns power shortest paths, components, cycle checks, grid problems, and more." tags={["BFS", "DFS", "O(V + E)", "Connectivity"]} />
      <Section title="Traversal Basics">
        <P>A traversal visits vertices reachable from a starting point while avoiding repeated work. Store a graph as an adjacency list, where each vertex maps to its neighbors; this uses <C>O(V + E)</C> space and makes neighbor scans efficient for sparse graphs.</P>
        <CodeBlock title="Adjacency list" code={`graph = {
    "A": ["B", "C"],
    "B": ["A", "D", "E"],
    "C": ["A", "F"],
    "D": ["B"],
    "E": ["B", "F"],
    "F": ["C", "E"],
}`} />
        <Diagram caption="Starting at A, BFS visits one distance layer at a time; DFS follows one branch before backtracking.">{`
             A
           /   \\
          B     C
         / \\     \\
        D   E --- F

BFS from A: A, B, C, D, E, F
DFS from A: A, B, D, E, F, C (one valid order)
        `}</Diagram>
        <Callout type="warning" title="Mark vertices when discovered">Mark a vertex visited as soon as it is enqueued or pushed. Marking only when removed can place duplicates in the worklist and break parent or distance assumptions.</Callout>
      </Section>
      <Section title="Interactive Visualizer">
        <GraphTraversalVisualizer />
      </Section>
      <Section title="Breadth-First Search">
        <P><Strong>BFS</Strong> uses a FIFO queue. Its frontier expands in increasing distance from the source, so the first discovered route has the fewest edges in an unweighted graph.</P>
        <SubSection title="Distances and shortest-path reconstruction">
          <P>Record a parent when a vertex is first discovered. Walk backward from the target and reverse the chain to recover the path. If the target is unreachable, its distance remains absent.</P>
          <CodeBlock title="bfs_path.py" code={`from collections import deque

def shortest_path(graph: dict[str, list[str]], start: str, target: str) -> list[str] | None:
    queue = deque([start])
    parent: dict[str, str | None] = {start: None}
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
    node: str | None = target
    while node is not None:
        path.append(node)
        node = parent[node]
    return path[::-1]

graph = {
    "A": ["B", "C"],
    "B": ["A", "D", "E"],
    "C": ["A", "F"],
    "D": ["B"],
    "E": ["B", "F"],
    "F": ["C", "E"],
}
path = shortest_path(graph, "A", "F")
print(path)`} output="['A', 'C', 'F']" />
        </SubSection>
        <SubSection title="Level-by-level traversal">
          <CodeBlock title="bfs_levels.py" code={`from collections import deque

def bfs_levels(graph: dict[int, list[int]], start: int) -> list[list[int]]:
    queue = deque([start])
    distance = {start: 0}
    levels: list[list[int]] = []
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node)
            for neighbor in graph.get(node, []):
                if neighbor not in distance:
                    distance[neighbor] = distance[node] + 1
                    queue.append(neighbor)
        levels.append(level)
    return levels`} />
        </SubSection>
      </Section>
      <Section title="Depth-First Search">
        <P><Strong>DFS</Strong> explores deeply before backtracking. Recursive DFS mirrors the definition; iterative DFS uses an explicit stack and avoids Python recursion-depth limits on long paths.</P>
        <CodeBlock title="Recursive and iterative DFS" code={`def dfs_recursive(graph: dict[int, list[int]], start: int) -> list[int]:
    visited: set[int] = set()
    order: list[int] = []
    def visit(node: int) -> None:
        visited.add(node)
        order.append(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visit(neighbor)
    visit(start)
    return order


def dfs_iterative(graph: dict[int, list[int]], start: int) -> list[int]:
    visited = {start}
    order: list[int] = []
    stack = [start]
    while stack:
        node = stack.pop()
        order.append(node)
        for neighbor in reversed(graph.get(node, [])):
            if neighbor not in visited:
                visited.add(neighbor)
                stack.append(neighbor)
    return order`} />
        <Callout type="note" title="Traversal order depends on neighbor order">A graph can have many valid BFS or DFS visit orders. Sorting neighbors makes the result deterministic, at an additional sorting cost.</Callout>
      </Section>
      <Section title="Grid Traversal Patterns">
        <P>A grid is an implicit graph: each cell is a vertex, and legal moves define its edges. Check bounds and whether a cell is traversable before adding it to the queue.</P>
        <SubSection title="Number of islands (DFS)">
          <CodeBlock title="islands.py" code={`def count_islands(grid: list[list[str]]) -> int:
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    count = 0
    def sink(r: int, c: int) -> None:
        if not (0 <= r < rows and 0 <= c < cols) or grid[r][c] != "1":
            return
        grid[r][c] = "0"
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            sink(r + dr, c + dc)
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                count += 1
                sink(r, c)
    return count`} />
          <Callout type="warning">This implementation mutates the grid. Copy it first if callers need the original data preserved.</Callout>
        </SubSection>
        <SubSection title="Flood fill and multi-source BFS">
          <P>Flood fill is a component traversal from one seed. Rotting Oranges starts a single BFS from all rotten cells simultaneously; queue layers represent elapsed minutes.</P>
          <CodeBlock title="flood_fill_and_rotting.py" code={`from collections import deque

def flood_fill(image: list[list[int]], sr: int, sc: int, color: int) -> list[list[int]]:
    old = image[sr][sc]
    if old == color:
        return image
    queue = deque([(sr, sc)])
    image[sr][sc] = color
    while queue:
        r, c = queue.popleft()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < len(image) and 0 <= nc < len(image[0]) and image[nr][nc] == old:
                image[nr][nc] = color
                queue.append((nr, nc))
    return image


def oranges_minutes(grid: list[list[int]]) -> int:
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while queue and fresh:
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc))
        minutes += 1
    return minutes if fresh == 0 else -1`} />
        </SubSection>
      </Section>
      <Section title="Components and Cycle Detection">
        <P>For an undirected graph, start a traversal from every unvisited vertex; each start identifies one connected component. In an undirected cycle check, ignore the edge back to the current node's parent.</P>
        <CodeBlock title="Components and undirected cycle" code={`def connected_components(graph: dict[int, list[int]]) -> list[list[int]]:
    seen: set[int] = set()
    components = []
    for start in graph:
        if start in seen:
            continue
        component = []
        stack = [start]
        seen.add(start)
        while stack:
            node = stack.pop()
            component.append(node)
            for neighbor in graph[node]:
                if neighbor not in seen:
                    seen.add(neighbor)
                    stack.append(neighbor)
        components.append(component)
    return components


def has_undirected_cycle(graph: dict[int, list[int]]) -> bool:
    seen: set[int] = set()
    def visit(node: int, parent: int | None) -> bool:
        seen.add(node)
        for neighbor in graph[node]:
            if neighbor not in seen:
                if visit(neighbor, node):
                    return True
            elif neighbor != parent:
                return True
        return False
    return any(node not in seen and visit(node, None) for node in graph)`} />
        <SubSection title="Directed cycles: three colors">
          <P>White means unvisited, gray means on the active recursion path, and black means fully processed. An edge to gray is a back edge and proves a directed cycle exists.</P>
          <CodeBlock title="directed_cycle.py" code={`def has_directed_cycle(graph: dict[int, list[int]]) -> bool:
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {node: WHITE for node in graph}
    def visit(node: int) -> bool:
        color[node] = GRAY
        for neighbor in graph.get(node, []):
            if color.get(neighbor, WHITE) == GRAY:
                return True
            if color.get(neighbor, WHITE) == WHITE and visit(neighbor):
                return True
        color[node] = BLACK
        return False
    return any(color[node] == WHITE and visit(node) for node in graph)`} />
        </SubSection>
      </Section>
      <Section title="Bipartite Graphs and Cloning">
        <SubSection title="Bipartite check by two-coloring">
          <P>A graph is bipartite when every edge crosses between two color groups. BFS each component, assigning every neighbor the opposite color; equal colors across an edge mean failure.</P>
          <CodeBlock title="bipartite.py" code={`from collections import deque

def is_bipartite(graph: dict[int, list[int]]) -> bool:
    color: dict[int, int] = {}
    for start in graph:
        if start in color:
            continue
        color[start] = 0
        queue = deque([start])
        while queue:
            node = queue.popleft()
            for neighbor in graph[node]:
                if neighbor not in color:
                    color[neighbor] = 1 - color[node]
                    queue.append(neighbor)
                elif color[neighbor] == color[node]:
                    return False
    return True`} />
        </SubSection>
        <SubSection title="Clone graph with a map">
          <P>Create one copy per original node and keep a mapping; the mapping both prevents repeated copies and preserves cycles and shared neighbors.</P>
          <CodeBlock title="clone_graph.py" code={`class Node:
    def __init__(self, value: int, neighbors: list["Node"] | None = None):
        self.value = value
        self.neighbors = neighbors or []


def clone_graph(start: Node | None) -> Node | None:
    if start is None:
        return None
    copies = {start: Node(start.value)}
    stack = [start]
    while stack:
        node = stack.pop()
        for neighbor in node.neighbors:
            if neighbor not in copies:
                copies[neighbor] = Node(neighbor.value)
                stack.append(neighbor)
            copies[node].neighbors.append(copies[neighbor])
    return copies[start]`} />
        </SubSection>
      </Section>
      <Section title="Bidirectional BFS and Trade-offs">
        <P>When both endpoints are known and the graph is undirected, expand frontiers from both ends and stop when they meet. If branching factor is <C>b</C> and path length is <C>d</C>, balanced search can reduce work from roughly <C>O(b^d)</C> to <C>O(b^(d/2))</C>. Track each side's visited set and parent links to reconstruct the combined path.</P>
        <ProsCons pros={["BFS gives shortest paths by edge count in unweighted graphs.", "DFS is simple for reachability, components, and structural checks.", "Both run in O(V + E) with adjacency lists."]} cons={["BFS may store a wide frontier; memory can grow with a whole layer.", "Recursive DFS can exceed recursion limits on deep graphs.", "Neither traversal alone finds minimum weighted distance."]} />
        <Table headers={["Property", "BFS", "DFS"]} rows={[["Worklist", "Queue (FIFO)", "Stack or recursion"], ["Order", "By distance layers", "Depth first, then backtrack"], ["Unweighted shortest path", "Yes; parent links recover path", "No guarantee"], ["Auxiliary memory", "O(V), often frontier-heavy", "O(V), recursion/stack depth"], ["Typical uses", "Levels, shortest hops, multi-source spread", "Components, cycle checks, backtracking"]]} />
      </Section>
      <Section title="Complexity, Pitfalls, and Practice">
        <ComplexityTable rows={[
          { operation: "BFS / DFS on adjacency list", time: "O(V + E)", space: "O(V)", note: "Across one component; all components still O(V + E)" },
          { operation: "Grid traversal", time: "O(R * C)", space: "O(R * C)", note: "Each cell is visited at most once" },
          { operation: "Bidirectional BFS", time: "O(b^(d/2))", space: "O(b^(d/2))", note: "Typical search-tree estimate, not worst-case graph bound" },
        ]} />
        <Callout type="warning" title="Frequent mistakes"><List items={[<>Use <C>collections.deque</C>, not <C>list.pop(0)</C>, for BFS queues.</>, <>Restart DFS/BFS for every component when the graph may be disconnected.</>, <>For undirected cycle detection, parent tracking is essential; for directed cycles, use recursion-stack state rather than a single visited set.</>, <>BFS minimizes edges, not total weight, unless all edges have equal cost.</>]} /></Callout>
        <Practice problems={[
          { name: "Binary Tree Level Order Traversal", difficulty: "Medium", hint: "Process the queue's current width per level." },
          { name: "Number of Islands", difficulty: "Medium", hint: "Start a traversal at each unseen land cell." },
          { name: "Rotting Oranges", difficulty: "Medium", hint: "Initialize the queue with every rotten cell." },
          { name: "Clone Graph", difficulty: "Medium", hint: "Map original nodes to copies before exploring neighbors." },
          { name: "Is Graph Bipartite?", difficulty: "Medium", hint: "Color every disconnected component." },
          { name: "Word Ladder", difficulty: "Hard", hint: "Treat words as vertices and use BFS from both ends." },
        ]} />
        <KeyTakeaways items={[<>Use BFS for shortest paths in unweighted graphs and level-based spread.</>, <>Use DFS for reachability, components, and recursive graph structure.</>, <>A visited set prevents repeated work; parent pointers reconstruct paths.</>, <>Always consider disconnected graphs, mutation, and cycles in graph-shaped input.</>]} />
      </Section>
    </article>
  );
}
