import { Callout, CodeBlock, C, Diagram, KeyTakeaways, ProsCons, List, P, PageHeader, Practice, Section, Steps, Strong, SubSection, Table } from "../../components/doc";

export default function ProblemSolving() {
  return (
    <article>
      <PageHeader eyebrow="Reference" title="Problem-Solving Framework" description="A repeatable method for turning an unfamiliar prompt into a correct, efficient solution. Recognize the structure, explain your trade-offs, and validate the code before submitting." tags={["Interview process", "Patterns", "Testing", "Study plan"]} />
      <Section title="A Repeatable Problem-Solving Process">
        <Diagram caption="A useful loop: clarify, model, optimize, implement, verify, and explain.">{`
Prompt -> constraints -> invariant -> algorithm -> code -> tests
                  ^                         |
                  +------ revise if needed -+
        `}</Diagram>
        <Steps steps={[
          { title: "Understand the prompt", body: <>Restate the input, output, objective, and constraints. Ask what is guaranteed: sorted input, duplicates, connectivity, value ranges, mutability, and whether one or many answers are required.</> },
          { title: "Work examples and edge cases", body: <>Trace the sample by hand. Make a tiny example, a boundary example, and an adversarial example before committing to a design.</> },
          { title: "Describe brute force", body: <>Write the simplest correct approach first. Estimate its time and space; this gives a correctness baseline and reveals the repeated work to remove.</> },
          { title: "Find the optimization", body: <>Look for a useful invariant, ordering, state compression, reusable lookup, or graph structure. Choose a known pattern only when its assumptions match.</> },
          { title: "Explain before coding", body: <>State the data structures, invariant, and why each operation preserves it. Agree on the complexity in terms of the input sizes.</> },
          { title: "Implement clearly", body: <>Use descriptive names and small helpers where they clarify logic. Keep index boundaries and state transitions explicit.</> },
          { title: "Test, then analyze", body: <>Dry-run the code on normal and edge inputs. Revisit complexity, mutation, overflow assumptions, and unhandled cases after the implementation.</> },
        ]} />
      </Section>
      <Section title="Pattern Recognition Guide">
        <P>These cues are hypotheses, not automatic recipes. Confirm each pattern's preconditions before applying it.</P>
        <Table headers={["If you see...", "Think about...", "Key question"]} rows={[
          ["Sorted array; find a boundary", "Binary search", "Is the predicate monotone?"],
          ["Sorted sequence; pair or triplet", "Two pointers", "Can one pointer move safely by comparison?"],
          ["Contiguous subarray / substring", "Sliding window or prefix sums", "Are values nonnegative, or can sums decrease?"],
          ["Top K, kth largest, repeated min/max", "Heap", "Can the heap stay bounded to K?"],
          ["All combinations / arrangements", "Backtracking", "What choices are legal and how do I undo them?"],
          ["Optimal answer with overlapping subproblems", "Dynamic programming", "What state summarizes the future?"],
          ["Tree, hierarchy, or nested structure", "DFS or BFS", "Do I need depth, levels, or a path?"],
          ["Shortest path with equal edge cost", "BFS", "Can I model each move as one edge?"],
          ["Dependencies or prerequisites", "Topological sort", "Can a cycle make the schedule impossible?"],
          ["Connectivity under unions", "Union-Find", "Are edges only being added?"],
          ["Prefix lookup or shared word prefixes", "Trie", "Can queries share traversed prefixes?"],
          ["Intervals overlap / schedule", "Sort + merge or sweep line", "Which endpoint ordering simplifies the invariant?"],
          ["Next greater / smaller element", "Monotonic stack", "When does a new value resolve older candidates?"],
          ["Range sum or count queries", "Prefix sums / Fenwick / segment tree", "Are there point updates between queries?"],
          ["Cycle in linked list / repeated state", "Fast and slow pointers", "Is there a deterministic next transition?"],
          ["Small n and subset choices", "Bitmask DP or enumeration", "Can each subset be represented by bits?"],
          ["Grid regions, islands, spread", "BFS / DFS on implicit graph", "Which moves are legal, and can cells be marked?"],
          ["Maximize minimum or minimize maximum", "Binary search on answer", "Is feasibility monotone as the answer changes?"],
          ["Many queries on a static tree", "LCA / binary lifting / Euler tour", "Can preprocessing amortize repeated queries?"],
          ["Need global connectivity at minimum cost", "MST: Kruskal or Prim", "Is the graph undirected and weighted?"],
        ]} />
      </Section>
      <Section title="Core Templates: Arrays and Search">
        <SubSection title="Two pointers and sliding window">
          <CodeBlock title="two_pointers_and_window.py" code={`def pair_sum_sorted(nums: list[int], target: int) -> tuple[int, int] | None:
    left, right = 0, len(nums) - 1
    while left < right:
        total = nums[left] + nums[right]
        if total == target:
            return left, right
        if total < target:
            left += 1
        else:
            right -= 1
    return None


def longest_unique_substring(text: str) -> int:
    last_seen: dict[str, int] = {}
    left = best = 0
    for right, char in enumerate(text):
        if char in last_seen and last_seen[char] >= left:
            left = last_seen[char] + 1
        last_seen[char] = right
        best = max(best, right - left + 1)
    return best`} />
        </SubSection>
        <SubSection title="Binary search on an answer">
          <P>Use this when feasible answers form a monotone range. Find the first true value with a half-open interval; prove that the chosen predicate stays true after its first true point.</P>
          <CodeBlock title="first_feasible.py" code={`def first_true(low: int, high: int) -> int:
    # Invariant: answer is in [low, high); high is known feasible.
    while low < high:
        mid = low + (high - low) // 2
        if feasible(mid):
            high = mid
        else:
            low = mid + 1
    return low`} />
        </SubSection>
        <SubSection title="Prefix sum with hashmap">
          <CodeBlock title="count_subarrays_sum_k.py" code={`def count_subarrays(nums: list[int], target: int) -> int:
    frequency = {0: 1}
    prefix = answer = 0
    for value in nums:
        prefix += value
        answer += frequency.get(prefix - target, 0)
        frequency[prefix] = frequency.get(prefix, 0) + 1
    return answer`} />
        </SubSection>
      </Section>
      <Section title="Core Templates: Graphs and Trees">
        <SubSection title="BFS and DFS">
          <CodeBlock title="graph_traversal.py" code={`from collections import deque

def bfs(graph: dict[int, list[int]], start: int) -> list[int]:
    queue = deque([start])
    seen = {start}
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph.get(node, []):
            if neighbor not in seen:
                seen.add(neighbor)
                queue.append(neighbor)
    return order


def dfs(graph: dict[int, list[int]], start: int) -> list[int]:
    seen = set()
    order = []
    def visit(node: int) -> None:
        seen.add(node)
        order.append(node)
        for neighbor in graph.get(node, []):
            if neighbor not in seen:
                visit(neighbor)
    visit(start)
    return order`} />
        </SubSection>
        <SubSection title="Backtracking and memoized DP">
          <CodeBlock title="backtracking_and_dp.py" code={`def subsets(nums: list[int]) -> list[list[int]]:
    result = []
    path = []
    def search(index: int) -> None:
        if index == len(nums):
            result.append(path.copy())
            return
        search(index + 1)
        path.append(nums[index])
        search(index + 1)
        path.pop()
    search(0)
    return result

from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)`} />
        </SubSection>
        <SubSection title="Topological sort and Union-Find">
          <CodeBlock title="topological_and_union_find.py" code={`from collections import deque

def topo_order(graph: dict[int, list[int]]) -> list[int] | None:
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
    return order if len(order) == len(indegree) else None


class UnionFind:
    def __init__(self, n: int):
        self.parent = list(range(n))
        self.size = [1] * n
    def find(self, x: int) -> int:
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    def union(self, a: int, b: int) -> bool:
        a, b = self.find(a), self.find(b)
        if a == b:
            return False
        if self.size[a] < self.size[b]:
            a, b = b, a
        self.parent[b] = a
        self.size[a] += self.size[b]
        return True`} />
        </SubSection>
      </Section>
      <Section title="Core Templates: Heaps and Stacks">
        <SubSection title="Top K with a bounded heap">
          <CodeBlock title="top_k.py" code={`import heapq

def k_largest(values: list[int], k: int) -> list[int]:
    if k <= 0:
        return []
    heap = []
    for value in values:
        heapq.heappush(heap, value)
        if len(heap) > k:
            heapq.heappop(heap)
    return sorted(heap, reverse=True)`} />
        </SubSection>
        <SubSection title="Monotonic stack and intervals">
          <CodeBlock title="monotonic_and_intervals.py" code={`def next_greater(values: list[int]) -> list[int]:
    answer = [-1] * len(values)
    stack = []  # indices with decreasing values
    for i, value in enumerate(values):
        while stack and values[stack[-1]] < value:
            answer[stack.pop()] = value
        stack.append(i)
    return answer


def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    merged = []
    for start, end in sorted(intervals):
        if not merged or start > merged[-1][1]:
            merged.append([start, end])
        else:
            merged[-1][1] = max(merged[-1][1], end)
    return merged`} />
        </SubSection>
        <SubSection title="Fast and slow pointers">
          <CodeBlock title="linked_list_cycle.py" code={`def has_cycle(head) -> bool:
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`} />
        </SubSection>
      </Section>
      <Section title="Bitmask Patterns">
        <P>Bitmasks compactly represent a subset of up to a few dozen items. Use them when membership checks and subset transitions dominate; exponential state counts still limit feasible n.</P>
        <CodeBlock title="bitmask_idioms.py" code={`mask = 0b10101
i = 2
n = 5
visited_bits = []
subsets = []

def process(index: int) -> None:
    visited_bits.append(index)

def process_subset(subset: int) -> None:
    subsets.append(subset)

# Is bit i included?
included = bool(mask & (1 << i))

# Add or remove an item.
with_item = mask | (1 << i)
without_item = mask & ~(1 << i)

# Iterate set bits.
remaining = mask
while remaining:
    bit = remaining & -remaining
    index = bit.bit_length() - 1
    process(index)
    remaining ^= bit

# All subsets of a set of n items.
for subset in range(1 << n):
    process_subset(subset)`} />
      </Section>
      <Section title="Edge-Case Checklist">
        <List items={[
          "Empty input, one item, and the smallest legal size.",
          "All values equal; duplicates at the ends or around a boundary.",
          "Already sorted, reverse sorted, or alternating large and small values.",
          "Negative, zero, and maximum-magnitude values; sums may overflow in fixed-width languages.",
          "No solution, one solution, and multiple valid solutions.",
          "Disconnected graphs, isolated vertices, self-loops, and cycles.",
          "Tree with one node, skewed tree, and missing children.",
          "Intervals touching exactly at an endpoint; confirm closed vs half-open convention.",
          "Grid with one row/column, blocked start/goal, and unreachable target.",
          "Whether the implementation mutates input or relies on sorted input.",
        ]} />
        <Callout type="tip" title="Build tests from the invariant">If the algorithm depends on a monotone predicate, test values on both sides of the boundary. If it depends on a visited set, include a cycle. If it uses a window, test when the valid window shrinks to one element.</Callout>
      </Section>
      <Section title="Interview Communication">
        <List items={[
          <><Strong>Clarify early:</Strong> state assumptions and ask targeted questions instead of silently guessing.</>,
          <><Strong>Think aloud:</Strong> explain what you are considering and why, without narrating every keystroke.</>,
          <><Strong>Compare options:</Strong> present a correct baseline, then describe the optimization and its trade-off.</>,
          <><Strong>State the invariant:</Strong> explain what remains true after every iteration or recursive call.</>,
          <><Strong>Own uncertainty:</Strong> identify the uncertain case, construct a small example, and test the hypothesis.</>,
          <><Strong>Close the loop:</Strong> give time and space complexity and mention assumptions that affect them.</>,
        ]} />
        <ProsCons pros={["A clear process prevents premature coding and makes assumptions visible.", "A brute-force baseline helps validate an optimized design.", "Testing the invariant makes debugging systematic."]} cons={["A rigid checklist should not replace adapting to the prompt.", "Talking through every thought can obscure the core reasoning.", "A memorized template can fail when its preconditions do not hold."]} />
        <Callout type="note">A concise explanation of why the algorithm is correct is more useful than naming a pattern without its preconditions.</Callout>
      </Section>
      <Section title="Testing, Debugging, and Python Pitfalls">
        <SubSection title="Test and debug systematically">
          <List items={["Trace indices and state on a three-element example.", "Check loop boundaries: inclusive vs exclusive endpoints and empty ranges.", "For recursion, verify base cases and that each call makes progress.", "For DP, define the state in words, then verify its transition and initialization.", "For graphs, mark on discovery and decide whether traversal must restart per component.", "If wrong, inspect the smallest failing case and compare expected vs actual intermediate state."]} />
        </SubSection>
        <SubSection title="Frequent Python interview pitfalls">
          <List items={[
            <>Use <C>deque.popleft()</C> instead of <C>list.pop(0)</C> for queues.</>,
            <>Avoid <C>[[0] * cols] * rows</C>; it aliases the same row. Use a comprehension for independent rows.</>,
            <>Know that list slicing copies. Repeated slicing inside recursion can increase both time and memory.</>,
            <>Do not use a mutable list or set as a dictionary key; use a tuple or frozen representation.</>,
            <>Use <C>is</C> for object identity (such as linked-list cycle pointers), and <C>==</C> for value equality.</>,
            <>A default argument like <C>def f(items=[])</C> is shared across calls; use <C>None</C> and create a new list inside.</>,
            <>For a max-heap of numbers, negate keys in <C>heapq</C>; tie-break tuples carefully when payloads are not comparable.</>,
            <>Use <C>nonlocal</C> for rebinding an enclosing variable inside a nested helper.</>,
          ]} />
        </SubSection>
      </Section>
      <Section title="A Practical Study Roadmap">
        <Table headers={["Week", "Focus", "Practice goal"]} rows={[
          ["1", "Arrays, strings, hash maps, sets", "Build fluency with scans, counts, prefix sums, and two pointers."],
          ["2", "Stacks, queues, linked lists, binary search", "Practice invariants, boundaries, and fast/slow pointers."],
          ["3", "Trees and recursion", "Implement traversals, BST operations, depth, and LCA."],
          ["4", "Graphs", "BFS/DFS, components, cycle checks, topological order, shortest paths."],
          ["5", "Dynamic programming", "Start with memoization, define state, then optimize space."],
          ["6", "Heaps, intervals, greedy, union-find", "Recognize ordering and connectivity arguments."],
          ["7", "Backtracking, tries, bit manipulation", "Prune search and reason about exponential state sizes."],
          ["8", "Mixed review and mock interviews", "Re-solve missed problems, communicate clearly, and track recurring errors."],
        ]} />
        <P>Adjust the pace to your starting point. A useful weekly loop is learn one pattern, solve a few guided problems, solve several independently, then revisit missed problems without looking at the solution.</P>
        <Practice problems={[
          { name: "Two Sum", difficulty: "Easy", hint: "Hash map of values seen so far." },
          { name: "Longest Substring Without Repeating Characters", difficulty: "Medium", hint: "Sliding window with last-seen positions." },
          { name: "Binary Tree Level Order Traversal", difficulty: "Medium", hint: "BFS one level at a time." },
          { name: "Course Schedule", difficulty: "Medium", hint: "Topological sort and cycle detection." },
          { name: "Coin Change", difficulty: "Medium", hint: "DP over amount with a clear impossible state." },
          { name: "Merge Intervals", difficulty: "Medium", hint: "Sort by start and maintain the current merged range." },
        ]} />
        <KeyTakeaways items={["Understand the constraints before selecting a pattern.", "Use brute force as a correctness baseline, then remove repeated work.", "Explain the invariant and prove that each transition preserves it.", "Test edge cases that directly challenge the algorithm's assumptions.", "Practice communication and review mistakes, not just problem volume."]} />
      </Section>
    </article>
  );
}
