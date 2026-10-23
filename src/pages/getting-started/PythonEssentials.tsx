import { Callout, C, CodeBlock, ComplexityTable, KeyTakeaways, List, P, PageHeader, Practice, Section, SubSection, Table } from "../../components/doc";

export default function PythonEssentials() {
  return (
    <article>
      <PageHeader eyebrow="Getting Started" title="Python Essentials for DSA" description="Use Python's built-in collections and standard-library tools confidently, while understanding their costs and common traps." tags={["Python 3", "Built-ins", "Complexity"]} />
      <Section title="Core built-in types">
        <P>Choose a container based on the operations you need. Average-case hash-table costs assume ordinary hashing behavior; they are not absolute worst-case guarantees.</P>
        <ComplexityTable title="Operation" rows={[
          { operation: <C>list[i], append(x), pop()</C>, time: "O(1)", note: "Index and end operations; append amortized" },
          { operation: <C>list.insert(0, x), pop(0), x in list</C>, time: "O(n)", note: "Shifts or scans" },
          { operation: <C>tuple[i]</C>, time: "O(1)", note: "Immutable sequence, index access" },
          { operation: <C>dict[key], set, delete</C>, time: "O(1)", note: "Average case; keys must be hashable" },
          { operation: <C>x in set</C>, time: "O(1)", note: "Average case" },
          { operation: <C>str[i]</C>, time: "O(1)", note: "Unicode code-point indexing" },
          { operation: <C>str[a:b], x in str</C>, time: "O(k) / O(n·m)", note: "Slice copies; substring search depends on algorithm/input" },
        ]} />
        <SubSection title="Container patterns"><CodeBlock code={`
            values = [4, 1, 9]                 # mutable, ordered
            point = (3, 5)                     # immutable, hashable if elements are
            counts = {"red": 2, "blue": 1}    # key-to-value lookup
            unique = {4, 1, 9}                 # membership and uniqueness
            text = "hello"                     # immutable Unicode text

            values.append(7)
            counts["green"] = 0
            unique.add(7)
          `} /></SubSection>
      </Section>
      <Section title="Collections module">
        <P>The <C>collections</C> module provides purpose-built containers that often simplify common DSA patterns.</P>
        <Table headers={["Tool", "Best fit", "Example"]} rows={[
          [<C>deque</C>, "Efficient append and pop at either end; queue / BFS.", "deque([start]); popleft()"],
          [<C>Counter</C>, "Frequencies and multiset arithmetic.", "Counter(text).most_common()"],
          [<C>defaultdict</C>, "Create a missing value on first access.", "defaultdict(list) for adjacency"],
          [<C>OrderedDict</C>, "Order-sensitive dictionary operations such as move_to_end.", "LRU cache ordering"],
          [<C>namedtuple</C>, "Small immutable tuple record with named fields.", "Point = namedtuple('Point', 'x y')"],
        ]} />
        <CodeBlock title="Frequency and graph adjacency" code={`
            from collections import Counter, defaultdict, deque

            frequencies = Counter("banana")
            graph: dict[int, list[int]] = defaultdict(list)
            graph[1].append(2)
            queue = deque([1])
            first = queue.popleft()      # O(1), unlike list.pop(0)
            print(frequencies["a"], first)
          `} output="3 1" />
        <Callout type="warning">A defaultdict creates a value when a missing key is read through indexing. Use <C>.get()</C> or membership testing when you do not want that side effect.</Callout>
      </Section>
      <Section title="Heaps and binary search helpers">
        <SubSection title="heapq: priority queues"><P><C>heapq</C> is a min-heap: the smallest element is at index zero. Push and pop take O(log n); peek is O(1). For a max-heap, negate numeric priorities or store a reversed-order key.</P><CodeBlock code={`
            import heapq

            tasks = [(4, "later"), (1, "urgent"), (3, "soon")]
            heapq.heapify(tasks)          # O(n)
            priority, name = heapq.heappop(tasks)
            heapq.heappush(tasks, (2, "next"))
            smallest_three = heapq.nsmallest(3, [8, 2, 5, 1, 9])
          `} /></SubSection>
        <SubSection title="bisect: find insertion points"><P><C>bisect_left</C> and <C>bisect_right</C> find boundaries in a sorted list in O(log n), but inserting into a Python list still shifts elements and costs O(n).</P><CodeBlock code={`
            from bisect import bisect_left, insort

            scores = [10, 20, 20, 40]
            position = bisect_left(scores, 20)  # first valid insertion index
            insort(scores, 30)                  # search O(log n), shift O(n)
          `} /></SubSection>
      </Section>
      <Section title="Itertools for combinatorial work">
        <P>These functions produce iterators, so they avoid materializing all results at once. The number of results may still be enormous.</P>
        <CodeBlock code={`
            from itertools import accumulate, combinations, groupby, permutations, product

            pairs = list(combinations([1, 2, 3], 2))
            arrangements = list(permutations("ab"))
            cartesian = list(product([0, 1], repeat=2))
            prefix_sums = list(accumulate([2, 5, 1]))

            words = sorted(["ant", "apple", "bat"])
            grouped = {key: list(group) for key, group in groupby(words, key=lambda w: w[0])}
          `} />
        <Callout type="note"><C>groupby</C> groups only adjacent equal keys. Sort by the same key first when values are not already grouped.</Callout>
      </Section>
      <Section title="Functools and useful helpers">
        <Table headers={["Helper", "Purpose", "Important detail"]} rows={[
          [<C>lru_cache</C>, "Memoize calls with a bounded or unbounded cache.", "Arguments must be hashable."],
          [<C>cache</C>, "Unbounded memoization shorthand.", "Can use substantial memory."],
          [<C>reduce</C>, "Fold an iterable into one result.", "A loop is often clearer."],
          [<C>cmp_to_key</C>, "Adapt a two-argument comparator for sorting.", "Prefer a key function where possible."],
        ]} />
        <CodeBlock code={`
            from functools import cache, cmp_to_key, reduce

            @cache
            def ways(n: int) -> int:
                if n < 2:
                    return 1
                return ways(n - 1) + ways(n - 2)

            total = reduce(lambda acc, value: acc + value, [1, 2, 3], 0)
            words = ["pear", "fig", "apple"]
            words.sort(key=lambda word: (len(word), word))
          `} />
      </Section>
      <Section title="Sorting, comprehensions, and generators">
        <P>Python's sort is stable: elements with equal keys retain their original relative order. Sort tuples lexicographically by default; pass <C>key</C> to make the intended priority explicit. <C>list.sort()</C> mutates and returns None; <C>sorted()</C> returns a new list.</P>
        <CodeBlock code={`
            records = [("Mina", 88), ("Ari", 88), ("Bo", 91)]
            by_score = sorted(records, key=lambda row: (-row[1], row[0]))
            values = [n * n for n in range(6) if n % 2 == 0]

            def squares(limit: int):
                for number in range(limit):
                    yield number * number

            first_three = list(squares(3))
          `} />
        <P>A generator computes values lazily and is often memory-efficient for one-pass processing. A comprehension materializes its result, so account for its output size.</P>
      </Section>
      <Section title="Numbers, math, and input/output">
        <List items={[
          <>Use <C>float('inf')</C> and <C>float('-inf')</C> for sentinel bounds; compare them deliberately with integer values.</>,
          <>The <C>math</C> module includes <C>gcd</C>, <C>isqrt</C>, <C>ceil</C>, and trigonometric helpers. <C>math.isqrt(n)</C> gives exact floor square root for nonnegative integers.</>,
          <>Python integers have arbitrary precision, so integer arithmetic does not overflow at a fixed machine width, but very large arithmetic costs more time and memory.</>,
          <>For large input, <C>sys.stdin.buffer.readline</C> is often faster than repeated interactive-style input calls.</>,
        ]} />
        <CodeBlock title="Fast input and exact integer tools" code={`
            import io
            import math
            import sys

            original_stdin = sys.stdin
            sys.stdin = io.TextIOWrapper(io.BytesIO(b"81\\n"))
            data = list(map(int, sys.stdin.buffer.read().split()))
            sys.stdin = original_stdin
            limit = data[0] if data else 0
            root = math.isqrt(limit)
            best = float("inf")
            output = [str(root)]
            sys.stdout.write("\\n".join(output))
          `} />
      </Section>
      <Section title="Recursion, copying, and safe defaults">
        <SubSection title="Recursion limits"><P>Python has a recursion limit to protect the interpreter stack. <C>sys.setrecursionlimit</C> can raise it, but very deep recursion may still exhaust the native stack; iterative algorithms are safer for unbounded depth.</P></SubSection>
        <SubSection title="Shallow copy versus deep copy"><P>A shallow copy duplicates the outer container but keeps references to nested objects. <C>deepcopy</C> recursively copies nested values, which can be expensive and may not suit every object graph.</P><CodeBlock code={`
            import copy

            original = [[1], [2]]
            shallow = original.copy()
            deep = copy.deepcopy(original)
            original[0].append(9)
            print(shallow[0], deep[0])
          `} output="[1, 9] [1]" /></SubSection>
        <SubSection title="Mutable default arguments"><P>Default values are created once when the function is defined, not once per call. Use <C>None</C> as a sentinel and create a fresh container inside.</P><CodeBlock code={`
def append_item(item: int, items: list[int] | None = None) -> list[int]:
    if items is None:
        items = []
    items.append(item)
    return items
`} /></SubSection>
        <SubSection title="Dataclasses for nodes"><CodeBlock code={`
            from dataclasses import dataclass

            @dataclass
            class TreeNode:
                value: int
                left: "TreeNode | None" = None
                right: "TreeNode | None" = None
          `} /><P>Dataclasses generate useful initialization and representation methods. For recursive node types, a forward reference keeps annotations clear.</P></SubSection>
      </Section>
      <Section title="Practice and takeaways">
        <Practice problems={[
          { name: "Top K Frequent Elements", difficulty: "Medium", hint: "Combine Counter with a heap or bucket array." },
          { name: "Group Anagrams", difficulty: "Medium", hint: "Build a stable hashable frequency signature." },
          { name: "Merge Intervals", difficulty: "Medium", hint: "Sort using a key, then sweep." },
          { name: "Kth Largest Element", difficulty: "Medium", hint: "Use a heap of bounded size." },
          { name: "Subsets", difficulty: "Medium", hint: "Generate combinations or use backtracking." },
        ]} />
        <KeyTakeaways items={[
          <>Pick a container based on its operation costs and mutability.</>, <>Use deque for both-end queue operations and heapq for priority queues.</>,
          <>Itertools is lazy, but combinatorial output can still grow factorially.</>, <>Stable sorting and a clear key simplify ordering logic.</>,
          <>Watch for recursion depth, accidental shared defaults, and shallow-copy aliasing.</>,
        ]} />
      </Section>
    </article>
  );
}