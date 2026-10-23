import { useMemo, useState } from "react";
import { Link } from "react-router";
import { PageHeader, P, Section } from "../../components/doc";

type GlossaryEntry = { term: string; definition: string; link?: string };

const glossary: GlossaryEntry[] = [
  { term: "Adjacency list", definition: "A graph representation that stores, for each vertex, the vertices connected to it.", link: "/data-structures/graphs" },
  { term: "Adjacency matrix", definition: "A V × V table whose entry indicates whether a pair of vertices has an edge.", link: "/data-structures/graphs" },
  { term: "Amortized analysis", definition: "Analysis of the average cost per operation over a worst-case sequence of operations." },
  { term: "Ancestor", definition: "A node on the path from a tree node up to the root, including the root." },
  { term: "Array", definition: "An indexed sequence whose elements occupy contiguous storage or a contiguous logical layout.", link: "/data-structures/arrays" },
  { term: "Articulation point", definition: "A vertex whose removal increases the number of connected components in an undirected graph.", link: "/graph-algorithms/advanced" },
  { term: "Asymptotic analysis", definition: "The study of how resource use grows as input size approaches infinity.", link: "/getting-started/complexity" },
  { term: "AVL tree", definition: "A self-balancing binary search tree that keeps each node's subtree heights within one." , link: "/data-structures/balanced-trees" },
  { term: "Backtracking", definition: "A search method that builds partial candidates and abandons a branch when it cannot lead to a valid answer.", link: "/algorithms/backtracking" },
  { term: "Balanced tree", definition: "A search tree that controls its height to keep operations logarithmic.", link: "/data-structures/balanced-trees" },
  { term: "Base case", definition: "A stopping condition in a recursive definition or algorithm.", link: "/getting-started/recursion" },
  { term: "BFS", definition: "Breadth-first search: graph traversal by increasing distance in edges from a start vertex.", link: "/graph-algorithms/traversal" },
  { term: "Big-O", definition: "An asymptotic upper bound on growth, commonly used to express an algorithm's worst-case scale.", link: "/getting-started/complexity" },
  { term: "Big-Theta", definition: "A tight asymptotic bound: the function is bounded both above and below up to constant factors.", link: "/getting-started/complexity" },
  { term: "Big-Omega", definition: "An asymptotic lower bound on a function's growth.", link: "/getting-started/complexity" },
  { term: "Binary heap", definition: "A complete binary tree commonly stored in an array and ordered by a heap property.", link: "/data-structures/heaps" },
  { term: "Binary search", definition: "A search on sorted or monotone data that repeatedly halves the remaining candidate range.", link: "/algorithms/searching" },
  { term: "Binary search tree", definition: "A binary tree ordered so keys in each node's left subtree are smaller and keys in its right subtree larger.", link: "/data-structures/binary-search-trees" },
  { term: "Bipartite graph", definition: "A graph whose vertices can be split into two sets so every edge crosses between the sets.", link: "/data-structures/graphs" },
  { term: "Bit mask", definition: "An integer whose binary digits encode a set of Boolean flags or selected elements.", link: "/algorithms/bit-manipulation" },
  { term: "Bitwise operation", definition: "An operation such as AND, OR, XOR, or shift applied to the binary digits of integers.", link: "/algorithms/bit-manipulation" },
  { term: "Bloom filter", definition: "A compact probabilistic structure for set membership that can have false positives but no false negatives.", link: "/algorithms/randomized" },
  { term: "Breadth-first search", definition: "See BFS; it finds shortest paths by edge count in unweighted graphs.", link: "/graph-algorithms/traversal" },
  { term: "Brute force", definition: "A direct search over all candidates, often useful as a baseline or for small inputs." },
  { term: "Bucket sort", definition: "A distribution sort that places values into buckets, sorts the buckets, and concatenates them.", link: "/algorithms/sorting" },
  { term: "Cache locality", definition: "The tendency to access nearby memory locations close together in time, improving cache efficiency." },
  { term: "Call stack", definition: "Runtime storage of active function calls, including each call's local state and return location.", link: "/getting-started/recursion" },
  { term: "Capacity", definition: "A structure's current limit or a resource bound, such as a knapsack's maximum weight." },
  { term: "Certificate", definition: "A proposed witness for a decision problem's yes-instance that a verifier can check efficiently." , link: "/reference/complexity-classes" },
  { term: "Child", definition: "A node directly below another node in a rooted tree." },
  { term: "Circular buffer", definition: "A fixed-capacity array treated as circular by wrapping its read and write indices.", link: "/data-structures/queues" },
  { term: "Clique", definition: "A subset of graph vertices in which every pair is adjacent.", link: "/data-structures/graphs" },
  { term: "Collision", definition: "An event where distinct keys map to the same hash-table index.", link: "/data-structures/hash-tables" },
  { term: "Complete binary tree", definition: "A binary tree with every level full except possibly the last, which is filled from left to right.", link: "/data-structures/heaps" },
  { term: "Connected component", definition: "A maximal set of vertices in which every pair is connected by a path.", link: "/graph-algorithms/traversal" },
  { term: "Cycle", definition: "A path that starts and ends at the same vertex without repeating other vertices (under the usual simple-cycle definition).", link: "/data-structures/graphs" },
  { term: "DAG", definition: "A directed acyclic graph: a directed graph with no directed cycle.", link: "/data-structures/graphs" },
  { term: "Degree", definition: "The number of incident edges at a vertex in an undirected graph; directed graphs distinguish in-degree and out-degree.", link: "/data-structures/graphs" },
  { term: "Deque", definition: "A double-ended queue supporting insertion and removal at both ends.", link: "/data-structures/queues" },
  { term: "DFS", definition: "Depth-first search: graph traversal that explores a path as far as possible before backtracking.", link: "/graph-algorithms/traversal" },
  { term: "Dijkstra's algorithm", definition: "A greedy shortest-path algorithm for graphs with nonnegative edge weights.", link: "/graph-algorithms/shortest-paths" },
  { term: "Disjoint set", definition: "A collection of non-overlapping sets, often maintained with union-find operations.", link: "/data-structures/union-find" },
  { term: "Divide and conquer", definition: "An approach that divides a problem into smaller subproblems, solves them, and combines their results.", link: "/algorithms/divide-and-conquer" },
  { term: "Dynamic array", definition: "An array-backed sequence that grows its allocated storage when needed.", link: "/data-structures/arrays" },
  { term: "Dynamic programming", definition: "A method that reuses solutions to overlapping subproblems, by memoization or tabulation.", link: "/algorithms/dynamic-programming" },
  { term: "Edge", definition: "A connection between two vertices; it may be directed or weighted.", link: "/data-structures/graphs" },
  { term: "Edge relaxation", definition: "An update that improves a known distance when a shorter route through an edge is found.", link: "/graph-algorithms/shortest-paths" },
  { term: "Euler path", definition: "A walk that traverses every edge exactly once; its start and end may differ.", link: "/data-structures/graphs" },
  { term: "Fibonacci heap", definition: "A meldable priority-queue structure with amortized bounds useful in some graph algorithms.", link: "/data-structures/advanced" },
  { term: "Fenwick tree", definition: "A binary indexed tree supporting prefix aggregates and point updates in logarithmic time.", link: "/data-structures/segment-trees" },
  { term: "FIFO", definition: "First in, first out: the item added earliest is removed earliest; the queue discipline.", link: "/data-structures/queues" },
  { term: "Fixed-parameter tractable", definition: "A parameterized problem solvable in f(k) · n^c time, with constant c independent of parameter k.", link: "/reference/complexity-classes" },
  { term: "Forest", definition: "An undirected acyclic graph; each connected component is a tree." },
  { term: "Graph", definition: "A set of vertices together with edges connecting pairs of vertices.", link: "/data-structures/graphs" },
  { term: "Greedy algorithm", definition: "An algorithm that repeatedly makes a locally best choice; correctness requires a suitable proof.", link: "/algorithms/greedy" },
  { term: "Hash function", definition: "A function mapping a key to a fixed-size hash value used to locate data in a hash table.", link: "/data-structures/hash-tables" },
  { term: "Hash table", definition: "A key-value structure that uses hashing to support expected constant-time lookup, insertion, and deletion.", link: "/data-structures/hash-tables" },
  { term: "Heap property", definition: "An ordering condition in a heap: each parent is no greater than its children in a min-heap, or no smaller in a max-heap.", link: "/data-structures/heaps" },
  { term: "Height", definition: "The length in edges of a longest downward path from a node to a leaf; convention may vary for empty trees." },
  { term: "Heuristic", definition: "A practical rule that seeks a good solution quickly but may lack an optimality guarantee." },
  { term: "In-degree", definition: "The number of directed edges entering a vertex.", link: "/data-structures/graphs" },
  { term: "Inorder traversal", definition: "A binary-tree traversal that visits left subtree, node, then right subtree.", link: "/data-structures/trees" },
  { term: "Invariant", definition: "A property that remains true at a defined point throughout an algorithm or data structure's operations." },
  { term: "Isomorphic graphs", definition: "Graphs with the same connectivity structure under a one-to-one relabeling of vertices." },
  { term: "KMP", definition: "Knuth–Morris–Pratt string matching, which uses prefix information to avoid rechecking text characters.", link: "/algorithms/string-algorithms" },
  { term: "Knapsack problem", definition: "A family of selection problems optimizing value subject to a capacity constraint.", link: "/algorithms/dynamic-programming" },
  { term: "Kruskal's algorithm", definition: "A minimum-spanning-tree algorithm that adds edges in increasing weight while avoiding cycles.", link: "/graph-algorithms/minimum-spanning-tree" },
  { term: "Leaf", definition: "A tree node with no children." },
  { term: "LIFO", definition: "Last in, first out: the most recently added item is removed first; the stack discipline.", link: "/data-structures/stacks" },
  { term: "Linked list", definition: "A sequence of nodes connected by references rather than stored in one contiguous array.", link: "/data-structures/linked-lists" },
  { term: "Load factor", definition: "The ratio of stored entries to bucket capacity in a hash table.", link: "/data-structures/hash-tables" },
  { term: "Local search", definition: "An optimization method that repeatedly replaces a candidate with a nearby, better candidate." },
  { term: "Lowest common ancestor", definition: "The deepest node that is an ancestor of two given nodes in a rooted tree.", link: "/data-structures/trees" },
  { term: "LRU cache", definition: "A cache that evicts the least recently used entry when space is needed.", link: "/data-structures/advanced" },
  { term: "Memoization", definition: "Top-down dynamic programming that caches results of previously solved subproblems.", link: "/algorithms/dynamic-programming" },
  { term: "Minimum spanning tree", definition: "A minimum-weight set of edges connecting every vertex of a connected, weighted, undirected graph.", link: "/graph-algorithms/minimum-spanning-tree" },
  { term: "Min-heap", definition: "A heap in which each parent key is no greater than its children's keys.", link: "/data-structures/heaps" },
  { term: "Monotonic stack", definition: "A stack kept in increasing or decreasing order to answer nearest-greater or nearest-smaller queries.", link: "/data-structures/stacks" },
  { term: "N-ary tree", definition: "A rooted tree in which a node may have up to N children." },
  { term: "Neighbor", definition: "A vertex directly connected to another vertex by an edge." },
  { term: "NP", definition: "The class of decision problems whose yes-instances have certificates verifiable in polynomial time.", link: "/reference/complexity-classes" },
  { term: "NP-complete", definition: "A problem in NP to which every problem in NP reduces in polynomial time.", link: "/reference/complexity-classes" },
  { term: "NP-hard", definition: "A problem at least as hard as every problem in NP under polynomial-time reductions; it need not be in NP.", link: "/reference/complexity-classes" },
  { term: "Null", definition: "A value representing the absence of a node, object, or result; language conventions vary." },
  { term: "Open addressing", definition: "A hash-table collision strategy that stores entries directly in the table and probes for another slot.", link: "/data-structures/hash-tables" },
  { term: "Out-degree", definition: "The number of directed edges leaving a vertex.", link: "/data-structures/graphs" },
  { term: "Parent", definition: "The node directly above a node in a rooted tree." },
  { term: "Path", definition: "A sequence of vertices joined by edges; a simple path does not repeat vertices." },
  { term: "Path compression", definition: "A union-find optimization that makes visited nodes point closer to the representative.", link: "/data-structures/union-find" },
  { term: "Permutation", definition: "An ordering of all elements in a collection." },
  { term: "Pivot", definition: "A chosen value used to partition data, such as in quicksort or quickselect.", link: "/algorithms/sorting" },
  { term: "Polynomial time", definition: "Running time bounded by a polynomial in the input length; the standard theoretical notion of efficient computation.", link: "/getting-started/complexity" },
  { term: "Postorder traversal", definition: "A tree traversal that visits children before their parent.", link: "/data-structures/trees" },
  { term: "Prefix sum", definition: "A cumulative sum that allows range sums to be computed from two prefix values.", link: "/algorithms/prefix-sums" },
  { term: "Priority queue", definition: "An abstract data type that removes an item with highest or lowest priority, often implemented with a heap.", link: "/data-structures/heaps" },
  { term: "Queue", definition: "A FIFO collection that adds at one end and removes from the other.", link: "/data-structures/queues" },
  { term: "Quickselect", definition: "A partition-based selection algorithm that finds an order statistic in expected linear time.", link: "/algorithms/sorting" },
  { term: "Quicksort", definition: "A divide-and-conquer comparison sort that partitions around a pivot; average time is O(n log n).", link: "/algorithms/sorting" },
  { term: "Radix sort", definition: "A non-comparison sort that processes keys digit by digit using a stable intermediate sort.", link: "/algorithms/sorting" },
  { term: "Recursion", definition: "A technique where a function solves a problem by calling itself on smaller instances.", link: "/getting-started/recursion" },
  { term: "Red-black tree", definition: "A self-balancing binary search tree whose coloring invariants bound its height.", link: "/data-structures/balanced-trees" },
  { term: "Reduction", definition: "A transformation from instances of one problem to another that preserves the answer.", link: "/reference/complexity-classes" },
  { term: "Relaxation", definition: "An update that lowers a tentative shortest-path distance if a better route is found.", link: "/graph-algorithms/shortest-paths" },
  { term: "Root", definition: "The distinguished top node of a rooted tree; it has no parent." },
  { term: "Rolling hash", definition: "A hash that can be updated efficiently as a window moves across a sequence.", link: "/algorithms/string-algorithms" },
  { term: "Running time", definition: "The number of computational steps an algorithm uses as a function of input size.", link: "/getting-started/complexity" },
  { term: "SCC", definition: "A strongly connected component: a maximal directed subgraph where every vertex can reach every other.", link: "/graph-algorithms/advanced" },
  { term: "Segment tree", definition: "A tree structure for range queries and updates, commonly in O(log n) time.", link: "/data-structures/segment-trees" },
  { term: "Selection sort", definition: "An in-place comparison sort that repeatedly selects the smallest remaining element.", link: "/algorithms/sorting" },
  { term: "Sentinel", definition: "A special marker value or node used to simplify boundary handling in an algorithm or structure." },
  { term: "Shortest path", definition: "A path minimizing total edge weight (or edge count in an unweighted graph).", link: "/graph-algorithms/shortest-paths" },
  { term: "Sieve of Eratosthenes", definition: "An algorithm that marks multiples to enumerate primes up to a bound.", link: "/algorithms/math" },
  { term: "Singly linked list", definition: "A linked list where each node points only to its next node.", link: "/data-structures/linked-lists" },
  { term: "Sliding window", definition: "A technique that maintains information about a contiguous range as its endpoints move.", link: "/algorithms/sliding-window" },
  { term: "Space complexity", definition: "The amount of memory an algorithm uses as a function of input size.", link: "/getting-started/complexity" },
  { term: "Stable sort", definition: "A sort that preserves the relative order of equal-key elements.", link: "/algorithms/sorting" },
  { term: "Stack", definition: "A LIFO collection that adds and removes elements at one end.", link: "/data-structures/stacks" },
  { term: "Stable matching", definition: "A matching with no pair that would both prefer each other over their assigned partners." },
  { term: "Strongly connected", definition: "In a directed graph, two vertices are strongly connected if each can reach the other." },
  { term: "Subarray", definition: "A contiguous range of elements within an array." },
  { term: "Subsequence", definition: "A sequence formed by deleting zero or more elements without changing the order of those kept." },
  { term: "Subset", definition: "A selection of zero or more elements from a set, without regard to order." },
  { term: "Tabulation", definition: "Bottom-up dynamic programming that fills a table of subproblem answers in dependency order.", link: "/algorithms/dynamic-programming" },
  { term: "Topological sort", definition: "A linear ordering of a DAG's vertices in which every directed edge points forward.", link: "/graph-algorithms/topological-sort" },
  { term: "Trie", definition: "A prefix tree that stores strings by shared character paths.", link: "/data-structures/tries" },
  { term: "Two pointers", definition: "A technique using two indices or references that move through data to find or maintain a relation.", link: "/algorithms/two-pointers" },
  { term: "Undirected graph", definition: "A graph whose edges have no orientation; each connection is symmetric.", link: "/data-structures/graphs" },
  { term: "Union by rank", definition: "A union-find optimization that attaches the shallower tree below the deeper one.", link: "/data-structures/union-find" },
  { term: "Union-find", definition: "A disjoint-set data structure supporting set union and representative lookup.", link: "/data-structures/union-find" },
  { term: "Vertex", definition: "A node in a graph; plural: vertices.", link: "/data-structures/graphs" },
  { term: "Vertex cover", definition: "A set of vertices incident to every edge in a graph.", link: "/data-structures/graphs" },
  { term: "Visit", definition: "To process a node or element during traversal; implementations often mark it to avoid repeated work." },
  { term: "Weighted graph", definition: "A graph whose edges carry numeric costs, lengths, or other weights.", link: "/data-structures/graphs" },
  { term: "Worst case", definition: "The maximum resource use over all inputs of a specified size." },
  { term: "XOR", definition: "Exclusive OR: a bitwise operation that is 1 exactly when the input bits differ.", link: "/algorithms/bit-manipulation" },
  { term: "Y-combinator", definition: "A fixed-point combinator that expresses recursion in a lambda calculus without named self-reference." },
  { term: "Z-algorithm", definition: "A linear-time string algorithm computing, at each position, the longest prefix match starting there.", link: "/algorithms/string-algorithms" },
];

export default function Glossary() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = useMemo(
    () => glossary.filter(({ term, definition }) => `${term} ${definition}`.toLocaleLowerCase().includes(normalizedQuery)),
    [normalizedQuery],
  );
  const groups = useMemo(() => {
    const grouped = new Map<string, GlossaryEntry[]>();
    for (const entry of filtered) {
      const letter = entry.term[0].toLocaleUpperCase();
      const entries = grouped.get(letter) ?? [];
      entries.push(entry);
      grouped.set(letter, entries);
    }
    return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);
  const letters = groups.map(([letter]) => letter);

  return (
    <article>
      <PageHeader
        eyebrow="Reference"
        title="Glossary"
        description="A quick, searchable guide to the vocabulary used across data structures, algorithms, graphs, and complexity theory."
        tags={["A–Z", "DSA terminology", "Quick reference"]}
      />
      <Section title="Find a Term" id="find-a-term">
        <label htmlFor="glossary-filter" className="block text-sm font-medium text-slate-200">
          Filter glossary terms
        </label>
        <input
          id="glossary-filter"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search terms and definitions…"
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
        />
        <P>{filtered.length} {filtered.length === 1 ? "term" : "terms"} match your search.</P>
        {letters.length > 0 && (
          <nav aria-label="Jump to glossary letter" className="flex flex-wrap gap-2">
            {letters.map((letter) => (
              <a key={letter} href={`#letter-${letter}`} className="rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-sm font-semibold text-indigo-200 transition hover:border-indigo-300/50 hover:bg-indigo-500/20">
                {letter}
              </a>
            ))}
          </nav>
        )}
      </Section>
      {groups.length === 0 ? (
        <p role="status" className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-slate-300">No glossary terms match that filter.</p>
      ) : groups.map(([letter, entries]) => (
        <Section key={letter} title={letter} id={`letter-${letter}`}>
          <dl className="grid gap-3">
            {entries.map(({ term, definition, link }) => (
              <div key={term} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-indigo-400/30 hover:bg-white/[0.05] sm:flex sm:gap-5">
                <dt className="min-w-44 font-semibold text-indigo-100">
                  {link ? <Link to={link} className="decoration-indigo-400/50 underline-offset-4 hover:text-white hover:underline">{term}</Link> : term}
                </dt>
                <dd className="mt-1 leading-7 text-slate-300 sm:mt-0">{definition}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ))}
    </article>
  );
}