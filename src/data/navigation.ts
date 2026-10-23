export type NavItem = {
  title: string;
  path: string;
  description: string;
};

export type NavGroup = {
  title: string;
  icon: string;
  items: NavItem[];
};

export const navigation: NavGroup[] = [
  {
    title: "Getting Started",
    icon: "🚀",
    items: [
      {
        title: "Introduction",
        path: "/getting-started/introduction",
        description: "What DSA is, why it matters and how to study it effectively.",
      },
      {
        title: "Complexity Analysis",
        path: "/getting-started/complexity",
        description: "Big-O, Big-Θ, Big-Ω, amortized analysis and space complexity.",
      },
      {
        title: "Python Essentials",
        path: "/getting-started/python-essentials",
        description: "Built-in types, collections, heapq, bisect and their costs.",
      },
      {
        title: "Recursion",
        path: "/getting-started/recursion",
        description: "Base cases, call stacks, recursion trees and memoization.",
      },
    ],
  },
  {
    title: "Linear Data Structures",
    icon: "📦",
    items: [
      {
        title: "Arrays",
        path: "/data-structures/arrays",
        description: "Contiguous memory, dynamic arrays and Python lists.",
      },
      {
        title: "Strings",
        path: "/data-structures/strings",
        description: "Immutable sequences, building strings and common techniques.",
      },
      {
        title: "Linked Lists",
        path: "/data-structures/linked-lists",
        description: "Singly, doubly and circular lists with pointer techniques.",
      },
      {
        title: "Stacks",
        path: "/data-structures/stacks",
        description: "LIFO structures, monotonic stacks and expression parsing.",
      },
      {
        title: "Queues & Deques",
        path: "/data-structures/queues",
        description: "FIFO queues, circular buffers, deques and monotonic queues.",
      },
      {
        title: "Hash Tables",
        path: "/data-structures/hash-tables",
        description: "Hashing, collision resolution, dicts, sets and Counter.",
      },
    ],
  },
  {
    title: "Non-Linear Data Structures",
    icon: "🌳",
    items: [
      {
        title: "Trees",
        path: "/data-structures/trees",
        description: "Terminology, binary trees and all traversal orders.",
      },
      {
        title: "Binary Search Trees",
        path: "/data-structures/binary-search-trees",
        description: "Ordered trees: search, insert, delete and validation.",
      },
      {
        title: "Balanced Trees",
        path: "/data-structures/balanced-trees",
        description: "AVL rotations, red-black trees and B-trees.",
      },
      {
        title: "Heaps",
        path: "/data-structures/heaps",
        description: "Binary heaps, priority queues and heapq patterns.",
      },
      {
        title: "Tries",
        path: "/data-structures/tries",
        description: "Prefix trees for fast word and prefix lookups.",
      },
      {
        title: "Graphs",
        path: "/data-structures/graphs",
        description: "Graph terminology and representations.",
      },
      {
        title: "Union-Find",
        path: "/data-structures/union-find",
        description: "Disjoint sets with path compression and union by rank.",
      },
      {
        title: "Segment & Fenwick Trees",
        path: "/data-structures/segment-trees",
        description: "Range queries and point updates in logarithmic time.",
      },
      {
        title: "Advanced Data Structures",
        path: "/data-structures/advanced",
        description: "LRU/LFU caches, sparse tables, treaps, skip lists and persistence.",
      },
    ],
  },
  {
    title: "Core Algorithms",
    icon: "⚙️",
    items: [
      {
        title: "Searching",
        path: "/algorithms/searching",
        description: "Linear search, binary search and binary search on answers.",
      },
      {
        title: "Sorting",
        path: "/algorithms/sorting",
        description: "Comparison and non-comparison sorts with trade-offs.",
      },
      {
        title: "Two Pointers",
        path: "/algorithms/two-pointers",
        description: "Opposite-end and fast/slow pointer techniques.",
      },
      {
        title: "Sliding Window",
        path: "/algorithms/sliding-window",
        description: "Fixed and variable windows over sequences.",
      },
      {
        title: "Prefix Sums",
        path: "/algorithms/prefix-sums",
        description: "Constant-time range sums, 2D prefix sums and difference arrays.",
      },
      {
        title: "Matrix & Grid Problems",
        path: "/algorithms/matrix",
        description: "Traversal orders, rotation, spiral, grid BFS/DFS and matrix search.",
      },
      {
        title: "Intervals & Sweep Line",
        path: "/algorithms/intervals",
        description: "Merging, inserting and scheduling intervals with sweep-line events.",
      },
      {
        title: "Divide & Conquer",
        path: "/algorithms/divide-and-conquer",
        description: "Split, solve and combine; the Master Theorem.",
      },
      {
        title: "Greedy Algorithms",
        path: "/algorithms/greedy",
        description: "Locally optimal choices, intervals and exchange arguments.",
      },
      {
        title: "Backtracking",
        path: "/algorithms/backtracking",
        description: "Subsets, permutations, N-Queens and pruning.",
      },
      {
        title: "Dynamic Programming",
        path: "/algorithms/dynamic-programming",
        description: "Memoization, tabulation and classic DP patterns.",
      },
      {
        title: "Bit Manipulation",
        path: "/algorithms/bit-manipulation",
        description: "Bitwise operators, masks and clever tricks.",
      },
      {
        title: "String Algorithms",
        path: "/algorithms/string-algorithms",
        description: "KMP, Rabin-Karp, Z-algorithm and palindromes.",
      },
      {
        title: "Math & Number Theory",
        path: "/algorithms/math",
        description: "GCD, primes, sieve, modular arithmetic and combinatorics.",
      },
      {
        title: "Randomized Algorithms",
        path: "/algorithms/randomized",
        description: "Randomization, sampling, Bloom filters, HyperLogLog and Count-Min Sketch.",
      },
      {
        title: "Computational Geometry",
        path: "/algorithms/geometry",
        description: "Orientation, segment intersection, convex hull and polygon area.",
      },
    ],
  },
  {
    title: "Graph Algorithms",
    icon: "🕸️",
    items: [
      {
        title: "BFS & DFS",
        path: "/graph-algorithms/traversal",
        description: "Breadth-first and depth-first traversal, cycles and components.",
      },
      {
        title: "Shortest Paths",
        path: "/graph-algorithms/shortest-paths",
        description: "Dijkstra, Bellman-Ford, Floyd-Warshall and 0-1 BFS.",
      },
      {
        title: "Minimum Spanning Trees",
        path: "/graph-algorithms/minimum-spanning-tree",
        description: "Kruskal's and Prim's algorithms.",
      },
      {
        title: "Topological Sort",
        path: "/graph-algorithms/topological-sort",
        description: "Ordering DAGs with Kahn's algorithm and DFS.",
      },
      {
        title: "Advanced Graphs",
        path: "/graph-algorithms/advanced",
        description: "SCCs, bridges, articulation points and max flow.",
      },
    ],
  },
  {
    title: "Reference",
    icon: "📚",
    items: [
      {
        title: "Algorithm Visualizers",
        path: "/reference/visualizers",
        description: "Step through sorting, binary search, BFS/DFS and Dijkstra interactively.",
      },
      {
        title: "Complexity Cheat Sheet",
        path: "/reference/cheat-sheet",
        description: "Every operation and algorithm complexity at a glance.",
      },
      {
        title: "Problem-Solving Patterns",
        path: "/reference/problem-solving",
        description: "Recognize patterns and approach interview problems.",
      },
      {
        title: "Complexity Classes",
        path: "/reference/complexity-classes",
        description: "P, NP, NP-complete, NP-hard, reductions and coping with hardness.",
      },
      {
        title: "Glossary",
        path: "/reference/glossary",
        description: "Concise definitions of essential DSA terms from A to Z.",
      },
    ],
  },
];

export const flatNavigation: (NavItem & { group: string })[] = navigation.flatMap(
  (group) => group.items.map((item) => ({ ...item, group: group.title })),
);
