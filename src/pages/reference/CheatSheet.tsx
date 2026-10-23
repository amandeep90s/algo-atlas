import { Callout, CodeBlock, ComplexityTable, C, Diagram, KeyTakeaways, List, Practice, ProsCons, P, PageHeader, Section, SubSection, Table } from "../../components/doc";

export default function CheatSheet() {
  return (
    <article>
      <PageHeader eyebrow="Reference" title="Data Structures & Algorithms Cheat Sheet" description="A quick, practical reference for asymptotic growth, common structure operations, sorting and graph algorithms, Python built-ins, and interview-scale input constraints." tags={["Big-O", "Complexities", "Python", "Interview reference"]} />
      <Section title="Big-O Growth at a Glance">
        <P>Big-O describes how work scales as input grows; it hides constants and lower-order terms. The table gives rough operation counts for a single basic step per unit of work.</P>
        <Diagram caption="Growth rates diverge quickly: linear work doubles when n doubles, while quadratic work quadruples.">{`
work
 ^                         n^2
 |                    ____/
 |             n log n
 |       _____/  n
 |  O(log n)
 +--------------------------> input size n
        `}</Diagram>
        <Table headers={["Growth", "n = 10", "n = 100", "n = 1,000", "n = 1,000,000", "Typical example"]} rows={[
          ["O(1)", "1", "1", "1", "1", "Array index, hash lookup average"],
          ["O(log n)", "3", "7", "10", "20", "Binary search, balanced-tree operation"],
          ["O(n)", "10", "100", "1,000", "1,000,000", "Linear scan"],
          ["O(n log n)", "33", "664", "9,966", "19,931,569", "Efficient comparison sort"],
          ["O(n^2)", "100", "10,000", "1,000,000", "10^12", "All pairs / simple nested loops"],
          ["O(n^3)", "1,000", "1,000,000", "10^9", "10^18", "Three nested loops, Floyd-Warshall"],
          ["O(2^n)", "1,024", "~10^30", "~10^301", "~10^301030", "Subset enumeration"],
          ["O(n!)", "3,628,800", "~10^158", "~10^2567", "~10^5565708", "All permutations"],
        ]} />
        <Callout type="note" title="Counts are illustrative">For O(n log n), the table uses n times log2(n). Real runtimes depend on constants, memory, implementation, and input distribution; exponential entries are approximate order-of-magnitude values.</Callout>
        <ProsCons pros={["Read growth rates as a planning tool, not a runtime promise.", "Separate average, amortized, and worst-case claims.", "Use the variable definitions and input constraints to compare algorithms."]} cons={["Big-O hides constants and memory behavior.", "Python overhead can make borderline estimates misleading.", "A strong asymptotic bound does not excuse an incorrect model or repeated hidden work."]} />
        <ComplexityTable rows={[
          { operation: "Constant-time operation", time: "O(1)", space: "O(1)" },
          { operation: "Binary search", time: "O(log n)", space: "O(1)" },
          { operation: "Linear scan", time: "O(n)", space: "O(1)" },
          { operation: "Comparison sort", time: "O(n log n)", space: "O(n)" },
          { operation: "All pairs", time: "O(n^2)", space: "O(1)", note: "Nested loops over two dimensions" },
        ]} />
      </Section>
      <Section title="Data Structure Operations">
        <P>Average means expected performance under common assumptions; worst case is a guaranteed upper bound. Dynamic-array append is amortized O(1), while a resize operation itself is O(n).</P>
        <Table headers={["Structure", "Access avg / worst", "Search avg / worst", "Insert avg / worst", "Delete avg / worst", "Notes"]} rows={[
          ["Array (fixed)", "O(1) / O(1)", "O(n) / O(n)", "O(n) / O(n)", "O(n) / O(n)", "Middle insertion and deletion shift elements"],
          ["Dynamic array / list", "O(1) / O(1)", "O(n) / O(n)", "O(1) amortized append / O(n)", "O(1) end pop / O(n)", "Arbitrary position shifts; a resize append is O(n)"],
          ["Linked list", "O(n) / O(n)", "O(n) / O(n)", "O(1) with node / O(1)", "O(1) with node / O(1)", "Finding the position first costs O(n)"],
          ["Stack", "Top O(1) / O(1)", "O(n) / O(n)", "Push O(1) / O(1)", "Pop O(1) / O(1)", "LIFO; access is to the top"],
          ["Queue", "Front O(1) / O(1)", "O(n) / O(n)", "Enqueue O(1) / O(1)", "Dequeue O(1) / O(1)", "FIFO; deque-backed implementation"],
          ["Deque", "Ends O(1) / O(1)", "O(n) / O(n)", "O(1) ends / O(1)", "O(1) ends / O(1)", "Middle indexing is O(n)"],
          ["Hash table", "N/A", "O(1) / O(n)", "O(1) / O(n)", "O(1) / O(n)", "Average expected; worst case from collisions"],
          ["Unbalanced BST", "O(log n) / O(n)", "O(log n) / O(n)", "O(log n) / O(n)", "O(log n) / O(n)", "Average assumes reasonably balanced insertion order"],
          ["AVL / red-black tree", "O(log n) / O(log n)", "O(log n) / O(log n)", "O(log n) / O(log n)", "O(log n) / O(log n)", "Height is maintained logarithmic"],
          ["Binary heap", "Root O(1) / O(1)", "O(n) / O(n)", "O(log n) / O(log n)", "Root O(log n) / O(log n)", "Arbitrary-item deletion needs search first"],
          ["Trie", "O(L) / O(L)", "O(L) / O(L)", "O(L) / O(L)", "O(L) / O(L)", "Assumes constant-time child lookup; L = key length"],
          ["Union-Find", "N/A", "Find O(alpha(n)) amortized / O(log n)", "Union O(alpha(n)) amortized / O(log n)", "N/A", "With union by size; deletes are unsupported"],
          ["Segment tree", "Point O(log n) / O(log n)", "Range O(log n) / O(log n)", "Update O(log n) / O(log n)", "Update O(log n) / O(log n)", "Range aggregate query and point update"],
          ["Fenwick / BIT", "Prefix O(log n) / O(log n)", "Range sum O(log n) / O(log n)", "Point update O(log n) / O(log n)", "Point update O(log n) / O(log n)", "Supports prefix sums and point updates"],
        ]} />
        <Callout type="warning" title="Operation context matters">A linked-list insert is O(1) only after reaching the insertion node. A heap can access its root in O(1) but cannot search for an arbitrary value in O(log n).</Callout>
      </Section>
      <Section title="Sorting and Searching">
        <SubSection title="Sorting algorithms">
          <Table headers={["Algorithm", "Best", "Average", "Worst", "Extra space", "Stable?"]} rows={[
            ["Timsort (Python list.sort)", "O(n)", "O(n log n)", "O(n log n)", "O(n)", "Yes"],
            ["Merge sort", "O(n log n)", "O(n log n)", "O(n log n)", "O(n)", "Yes"],
            ["Quicksort", "O(n log n)", "O(n log n)", "O(n^2)", "O(log n) avg stack", "Usually no"],
            ["Heapsort", "O(n log n)", "O(n log n)", "O(n log n)", "O(1) in-place", "No"],
            ["Insertion sort", "O(n)", "O(n^2)", "O(n^2)", "O(1)", "Yes"],
            ["Counting sort", "O(n + k)", "O(n + k)", "O(n + k)", "O(k)", "Can be"],
            ["Radix sort", "O(d(n + k))", "O(d(n + k))", "O(d(n + k))", "O(n + k)", "Can be"],
          ]} />
          <P>Here <C>k</C> is the value range/base and <C>d</C> is the number of digits. Non-comparison sorting relies on constraints such as bounded integer keys.</P>
        </SubSection>
        <SubSection title="Searching algorithms">
          <Table headers={["Method", "Time", "Space", "Requirement / use"]} rows={[
            ["Linear scan", "O(n)", "O(1)", "Works on any sequence"],
            ["Binary search", "O(log n)", "O(1) iterative", "Sorted data or monotone predicate"],
            ["Hash lookup", "O(1) average; O(n) worst", "O(n)", "Hashable keys; no ordering"],
            ["BST lookup", "O(log n) balanced", "O(n)", "Ordered keys"],
            ["BFS shortest path", "O(V + E)", "O(V)", "Unweighted graph"],
          ]} />
        </SubSection>
      </Section>
      <Section title="Graph Algorithms">
        <Table headers={["Algorithm", "Time", "Space", "Conditions / purpose"]} rows={[
          ["BFS / DFS", "O(V + E)", "O(V)", "Traversal, components, reachability"],
          ["Topological sort", "O(V + E)", "O(V)", "Directed acyclic graph"],
          ["Dijkstra with heap", "O((V + E) log V)", "O(V + E)", "Nonnegative edge weights"],
          ["Bellman-Ford", "O(VE)", "O(V)", "Negative edges; reachable negative cycle detection"],
          ["Floyd-Warshall", "O(V^3)", "O(V^2)", "All-pairs shortest paths"],
          ["Kruskal MST", "O(E log E)", "O(V + E)", "Sort edges + Union-Find"],
          ["Prim MST", "O(E log V)", "O(V + E)", "Heap and adjacency list"],
          ["Tarjan / Kosaraju SCC", "O(V + E)", "O(V + E)", "Directed strongly connected components"],
          ["Bridges / articulation points", "O(V + E)", "O(V)", "Undirected low-link DFS"],
          ["Edmonds-Karp max flow", "O(VE^2)", "O(V^2)", "BFS augmenting paths, matrix form"],
          ["Union-Find operations", "O(alpha(V)) amortized", "O(V)", "Near constant with path compression"],
        ]} />
        <P><C>V</C> is the number of vertices and <C>E</C> the number of edges. For dense graphs, E may be O(V^2); for a sparse adjacency list it is commonly O(V).</P>
      </Section>
      <Section title="Python Built-in Complexities">
        <Table headers={["Container / operation", "Average", "Worst / detail"]} rows={[
          ["list[i] / list[i] = x", "O(1)", "O(1)"],
          ["list.append(x)", "O(1) amortized", "O(n) resize"],
          ["list.pop()", "O(1)", "O(1)"],
          ["list.insert(i, x) / pop(i)", "O(n)", "O(n) shifts"],
          ["x in list", "O(n)", "O(n)"],
          ["dict / set lookup, insert, delete", "O(1)", "O(n) pathological hash collisions"],
          ["deque append/pop at either end", "O(1)", "O(1)"],
          ["deque indexing", "O(1) near ends", "O(n) in middle"],
          ["heapq.heappush / heappop", "O(log n)", "O(log n)"],
          ["heapq.heapify", "O(n)", "O(n)"],
          ["bisect search", "O(log n)", "O(log n); insertion into list still O(n)"],
          ["str find / in", "O(n + m)", "O(nm) theoretical substring bound"],
          ["str slicing", "O(k)", "Copies k characters"],
          ["sorted / list.sort", "O(n log n)", "Timsort; best O(n) on ordered input"],
        ]} />
        <Callout type="tip" title="Use the right container">Use <C>deque</C> for queues, a set for membership checks, <C>heapq</C> for repeated minimum extraction, and <C>bisect</C> to locate insertion points in sorted lists.</Callout>
      </Section>
      <Section title="Input Size to Complexity">
        <P>These are rough interview heuristics for a typical 1-2 second limit in a compiled language. Python may need a more conservative choice; optimize based on actual constraints and constant factors.</P>
        <Table headers={["Input size n", "Often acceptable", "Likely too slow"]} rows={[
          ["n <= 10", "O(n!), O(2^n), exhaustive search", "Usually none by size alone"],
          ["n <= 20", "O(2^n), bitmask DP", "O(n!) in many cases"],
          ["n <= 100", "O(n^3), O(n^2)", "High-constant exponential"],
          ["n <= 1,000", "O(n^2) sometimes, O(n log n)", "O(n^3)"],
          ["n <= 100,000", "O(n log n), O(n)", "O(n^2)"],
          ["n <= 1,000,000", "O(n), O(n log n) with care", "O(n^2)"],
          ["Huge / streaming", "O(log n), O(1) or O(n) passes", "Repeated scans or full materialization"],
        ]} />
        <Callout type="note">Always inspect total work: O(nm) with n = m = 1,000 is about one million pairs, while n = m = 100,000 is not. For graph problems, use both V and E constraints.</Callout>
      </Section>
      <Section title="Python Interview Snippets">
        <SubSection title="Heap, deque, Counter, and defaultdict">
          <CodeBlock title="common_containers.py" code={`import heapq
from collections import Counter, defaultdict, deque

priority, item = 2, "task"
max_heap = [(-7, 7)]
start, next_node = "A", "B"
words = ["to", "be", "or", "not", "to", "be"]
key, value = "vowels", "aeiou"

# Min-heap; negate priority to emulate a max-heap for numeric values.
heap = []
heapq.heappush(heap, (priority, item))
smallest = heapq.heappop(heap)
largest = heapq.heappop(max_heap)  # store (-value, value)

# FIFO queue and BFS.
queue = deque([start])
node = queue.popleft()
queue.append(next_node)

counts = Counter(words)
groups = defaultdict(list)
groups[key].append(value)`} />
        </SubSection>
        <SubSection title="Bisect, caching, sorting, and grids">
          <CodeBlock title="common_idioms.py" code={`from bisect import bisect_left, bisect_right
from functools import lru_cache

sorted_values = [1, 3, 5, 7]
target = 5
records = [{"score": 2, "name": "Ada"}, {"score": 1, "name": "Lin"}]
r, c = 0, 0
rows, cols = 2, 2

def process(row: int, col: int) -> None:
    pass

index = bisect_left(sorted_values, target)
count_equal = bisect_right(sorted_values, target) - index

@lru_cache(maxsize=None)
def solve(state: int) -> int:
    if state == 0:
        return 0
    return 1 + solve(state - 1)

records.sort(key=lambda record: (record["score"], record["name"]))

# Four-direction grid neighbors.
directions = ((1, 0), (-1, 0), (0, 1), (0, -1))
for dr, dc in directions:
    nr, nc = r + dr, c + dc
    if 0 <= nr < rows and 0 <= nc < cols:
        process(nr, nc)`} />
        </SubSection>
      </Section>
      <Section title="How to Use This Reference">
        <List items={["State whether an operation is average, amortized, or worst case.", "Name the variables: n for items, V and E for graphs, k for ranges, and L for key length.", "Include auxiliary and output space when the problem asks for it.", "Check mutation and copying costs for Python slices, sorting, and list insertion.", "For constrained input, estimate operation counts before choosing brute force."]} />
        <Practice problems={[
          { name: "Two Sum", difficulty: "Easy", hint: "Compare nested search with a hash-table solution." },
          { name: "Merge Sort", difficulty: "Medium", hint: "Track recursion depth and merge-array storage." },
          { name: "Kth Largest Element in an Array", difficulty: "Medium", hint: "Compare sorting, heap, and selection approaches." },
          { name: "Network Delay Time", difficulty: "Medium", hint: "Use the edge-weight constraints to select a shortest-path algorithm." },
          { name: "Number of Islands", difficulty: "Medium", hint: "Analyze visited cells and auxiliary stack or queue space." },
        ]} />
        <KeyTakeaways items={["Big-O is about growth, not exact wall-clock time.", "Choose structures based on the operation you need most often.", "Python built-in average-case costs are powerful, but never assume every operation is constant time.", "Graph bounds depend on both vertices and edges.", "Use constraints to rule out algorithms before writing code."]} />
      </Section>
    </article>
  );
}
