import {
  Callout,
  CodeBlock,
  ComplexityTable,
  C,
  Diagram,
  KeyTakeaways,
  P,
  PageHeader,
  Practice,
  ProsCons,
  Section,
  Strong,
  SubSection,
  Table,
} from "../../components/doc";

export default function SegmentTrees() {
  return (
    <article>
      <PageHeader
        eyebrow="Non-Linear Data Structures"
        title="Segment Trees"
        description="Segment trees support fast range queries while values change. They bridge the gap between cheap static prefix sums and slow repeated scans."
        tags={["Range queries", "Point updates", "Lazy propagation", "Fenwick tree"]}
      />

      <Section title="The Range Query Problem">
        <P>
          Given an array, we may need to answer queries such as sum, minimum, maximum, or gcd over an interval
          <C>[left, right)</C>, and perhaps update values between queries. The best solution depends on whether the
          data is static, what operations are required, and how many queries arrive.
        </P>
        <Table headers={["Approach", "Range query", "Point update", "Best when"]} rows={[
          ["Scan each range", <C>O(n)</C>, <C>O(1)</C>, "Few queries or tiny arrays"],
          ["Prefix sums", <C>O(1)</C>, <C>O(n)</C>, "Static sums; rebuild after edits"],
          ["Fenwick / BIT", <C>O(log n)</C>, <C>O(log n)</C>, "Sums with point increments or assignments"],
          ["Segment tree", <C>O(log n)</C>, <C>O(log n)</C>, "Flexible associative range queries and updates"],
          ["Sparse table", <><C>O(1)</C> for idempotent RMQ</>, <><C>O(n log n)</C> rebuild</>, "Static minimum, maximum, or gcd"],
        ]} />
        <Callout type="tip">
          Pick the simplest structure that fits all operations. If the array never changes and the query is a sum,
          prefix sums are usually enough; segment trees pay off when queries and updates interleave.
        </Callout>
      </Section>

      <Section title="Segment Tree Structure">
        <P>
          Each node summarizes a contiguous interval. Leaves represent array elements; internal nodes combine their
          children's summaries. A query decomposes its interval into a small number of fully covered tree nodes, while
          an update refreshes summaries along a root-to-leaf path.
        </P>
        <Diagram caption="A sum tree over [2, 1, 5, 3]; parent sums are the combination of child ranges.">{`
                          [0,4): 11
                       /             \\
                [0,2): 3             [2,4): 8
                 /    \\              /    \\
             [0,1):2 [1,2):1     [2,3):5 [3,4):3
        `}</Diagram>
        <P>
          The tree has <C>O(n)</C> nodes and height <C>O(log n)</C>. A recursive implementation often allocates
          <C>4 * n</C> slots to leave room for uneven interval splits. This page uses half-open intervals
          <C>[left, right)</C>, which make empty ranges and split boundaries easier to reason about.
        </P>
      </Section>

      <Section title="Recursive Range-Sum Tree">
        <P>
          Build each parent as the sum of its children. A query returns a node's stored sum for full coverage, zero for
          no overlap, and combines the partial results otherwise. A point update descends to its leaf and recomputes
          summaries while returning.
        </P>
        <CodeBlock title="recursive_segment_tree.py" code={`
          class SegmentTree:
              def __init__(self, values: list[int]) -> None:
                  self.n = len(values)
                  self.tree = [0] * (4 * self.n) if self.n else []
                  if self.n:
                      self._build(1, 0, self.n, values)

              def _build(self, node: int, left: int, right: int, values: list[int]) -> None:
                  if right - left == 1:
                      self.tree[node] = values[left]
                      return
                  mid = (left + right) // 2
                  self._build(node * 2, left, mid, values)
                  self._build(node * 2 + 1, mid, right, values)
                  self.tree[node] = self.tree[node * 2] + self.tree[node * 2 + 1]

              def update(self, index: int, value: int) -> None:
                  if not 0 <= index < self.n:
                      raise IndexError("index out of range")
                  def change(node: int, left: int, right: int) -> None:
                      if right - left == 1:
                          self.tree[node] = value
                          return
                      mid = (left + right) // 2
                      if index < mid:
                          change(node * 2, left, mid)
                      else:
                          change(node * 2 + 1, mid, right)
                      self.tree[node] = self.tree[node * 2] + self.tree[node * 2 + 1]
                  change(1, 0, self.n)

              def query(self, query_left: int, query_right: int) -> int:
                  if not 0 <= query_left <= query_right <= self.n:
                      raise IndexError("invalid query range")
                  def visit(node: int, left: int, right: int) -> int:
                      if query_right <= left or right <= query_left:
                          return 0
                      if query_left <= left and right <= query_right:
                          return self.tree[node]
                      mid = (left + right) // 2
                      return visit(node * 2, left, mid) + visit(node * 2 + 1, mid, right)
                  return visit(1, 0, self.n) if query_left < query_right else 0

          tree = SegmentTree([2, 1, 5, 3])
          print(tree.query(1, 4))
          tree.update(2, 4)
          print(tree.query(0, 3))
        `} output={`
          9
          7
        `} />
        <Callout type="warning" title="Keep interval conventions consistent">
          This implementation uses <C>[left, right)</C>. If a problem gives inclusive endpoints, convert the right
          endpoint to <C>right + 1</C> at the boundary rather than mixing conventions inside the tree.
        </Callout>
      </Section>

      <Section title="Iterative Bottom-Up Tree">
        <P>
          Store leaves at indices <C>n</C> through <C>2n - 1</C>. Build parents upward; a range query moves two
          pointers inward, consuming a right child from the left boundary and a left child from the right boundary.
          This compact version handles point assignment and range sum without recursion.
        </P>
        <CodeBlock title="iterative_segment_tree.py" code={`
          class IterativeSumTree:
              def __init__(self, values: list[int]) -> None:
                  self.n = len(values)
                  self.tree = [0] * (2 * self.n)
                  self.tree[self.n:] = values
                  for i in range(self.n - 1, 0, -1):
                      self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]

              def update(self, index: int, value: int) -> None:
                  if not 0 <= index < self.n:
                      raise IndexError("index out of range")
                  pos = index + self.n
                  self.tree[pos] = value
                  pos //= 2
                  while pos:
                      self.tree[pos] = self.tree[2 * pos] + self.tree[2 * pos + 1]
                      pos //= 2

              def query(self, left: int, right: int) -> int:
                  if not 0 <= left <= right <= self.n:
                      raise IndexError("invalid query range")
                  left += self.n
                  right += self.n
                  total = 0
                  while left < right:
                      if left & 1:
                          total += self.tree[left]
                          left += 1
                      if right & 1:
                          right -= 1
                          total += self.tree[right]
                      left //= 2
                      right //= 2
                  return total
        `} />
        <SubSection title="Range minimum or maximum">
          <P>
            Replace sum with <C>min</C> and use positive infinity as the no-overlap identity; for maximum use negative
            infinity. The same tree shape works for any associative operation with an identity, such as gcd, xor, or
            concatenation. For non-commutative operations, preserve the order in which partial results are combined.
          </P>
        </SubSection>
      </Section>

      <Section title="Lazy Propagation: Range Add and Range Sum">
        <P>
          If one update adds a value to every item in an interval, visiting every leaf is too slow. Store a pending
          <Strong>lazy tag</Strong> at a node. When an interval is fully covered, update its sum by
          <C>delta × segment_length</C> and record the tag; push the tag to children only when a later operation needs
          to descend.
        </P>
        <CodeBlock title="lazy_range_add_sum.py" code={`
          class LazySumTree:
              def __init__(self, values: list[int]) -> None:
                  self.n = len(values)
                  size = 4 * self.n if self.n else 0
                  self.total = [0] * size
                  self.lazy = [0] * size
                  if self.n:
                      self._build(1, 0, self.n, values)

              def _build(self, node: int, left: int, right: int, values: list[int]) -> None:
                  if right - left == 1:
                      self.total[node] = values[left]
                      return
                  mid = (left + right) // 2
                  self._build(node * 2, left, mid, values)
                  self._build(node * 2 + 1, mid, right, values)
                  self.total[node] = self.total[node * 2] + self.total[node * 2 + 1]

              def _apply(self, node: int, left: int, right: int, delta: int) -> None:
                  self.total[node] += delta * (right - left)
                  self.lazy[node] += delta

              def _push(self, node: int, left: int, right: int) -> None:
                  if self.lazy[node] == 0 or right - left == 1:
                      return
                  mid = (left + right) // 2
                  delta = self.lazy[node]
                  self._apply(node * 2, left, mid, delta)
                  self._apply(node * 2 + 1, mid, right, delta)
                  self.lazy[node] = 0

              def range_add(self, ql: int, qr: int, delta: int) -> None:
                  if not 0 <= ql <= qr <= self.n:
                      raise IndexError("invalid update range")
                  def add(node: int, left: int, right: int) -> None:
                      if qr <= left or right <= ql:
                          return
                      if ql <= left and right <= qr:
                          self._apply(node, left, right, delta)
                          return
                      self._push(node, left, right)
                      mid = (left + right) // 2
                      add(node * 2, left, mid)
                      add(node * 2 + 1, mid, right)
                      self.total[node] = self.total[node * 2] + self.total[node * 2 + 1]
                  if ql < qr:
                      add(1, 0, self.n)

              def range_sum(self, ql: int, qr: int) -> int:
                  if not 0 <= ql <= qr <= self.n:
                      raise IndexError("invalid query range")
                  def query(node: int, left: int, right: int) -> int:
                      if qr <= left or right <= ql:
                          return 0
                      if ql <= left and right <= qr:
                          return self.total[node]
                      self._push(node, left, right)
                      mid = (left + right) // 2
                      return query(node * 2, left, mid) + query(node * 2 + 1, mid, right)
                  return query(1, 0, self.n) if ql < qr else 0
        `} />
        <Callout type="note">
          Lazy propagation depends on the update and aggregate having a compatible rule. For range add + range sum,
          adding <C>d</C> to a segment changes its sum by <C>d × length</C>. More complex operations may need multiple
          tags or a different data structure.
        </Callout>
      </Section>

      <Section title="Fenwick Tree (Binary Indexed Tree)">
        <P>
          A Fenwick tree stores partial sums in a compact one-indexed array. The least significant set bit,
          <C>lowbit(i) = i &amp; -i</C>, determines the covered range of entry <C>i</C>. In an update, adding
          <C>lowbit(i)</C> moves to the next responsible bucket; in a prefix query, subtracting it visits the buckets
          that partition the prefix.
        </P>
        <CodeBlock title="fenwick.py" code={`
          class Fenwick:
              def __init__(self, values: list[int]) -> None:
                  self.n = len(values)
                  self.bit = [0] * (self.n + 1)
                  # O(n) construction: propagate each partial sum once.
                  for i, value in enumerate(values, start=1):
                      self.bit[i] += value
                      parent = i + (i & -i)
                      if parent <= self.n:
                          self.bit[parent] += self.bit[i]

              def add(self, index: int, delta: int) -> None:
                  if not 0 <= index < self.n:
                      raise IndexError("index out of range")
                  i = index + 1
                  while i <= self.n:
                      self.bit[i] += delta
                      i += i & -i

              def prefix_sum(self, end: int) -> int:
                  """Sum values[0:end]."""
                  if not 0 <= end <= self.n:
                      raise IndexError("prefix endpoint out of range")
                  total = 0
                  i = end
                  while i > 0:
                      total += self.bit[i]
                      i -= i & -i
                  return total

              def range_sum(self, left: int, right: int) -> int:
                  if not 0 <= left <= right <= self.n:
                      raise IndexError("invalid query range")
                  return self.prefix_sum(right) - self.prefix_sum(left)

          bit = Fenwick([3, 1, 4, 1, 5])
          bit.add(2, 2)  # increase index 2 by 2
          print(bit.range_sum(1, 4))
        `} output="8" />
        <P>
          <C>add(index, delta)</C> is a point increment. For point assignment, remember the old value and add the
          difference. Prefix subtraction supports range sums because addition has an inverse; not every range operation
          (for example, minimum) can use this trick.
        </P>
      </Section>

      <Section title="More Range-Query Tools">
        <SubSection title="2D segment trees and 2D BITs">
          <P>
            For a matrix, a 2D structure can answer rectangle queries and point updates in <C>O(log rows × log cols)</C>
            with corresponding storage overhead. They are useful when both dimensions are large and updates are online;
            for static grids, 2D prefix sums are often simpler.
          </P>
        </SubSection>
        <SubSection title="Counting inversions with a BIT">
          <P>
            Coordinate-compress values to ranks, scan from right to left, and query how many smaller ranks have already
            appeared. Then add the current rank. This counts inversions in <C>O(n log n)</C> time, including duplicates
            correctly when the query uses strictly smaller ranks.
          </P>
        </SubSection>
        <SubSection title="Sparse table for static RMQ">
          <P>
            Precompute answers for intervals of length <C>2^k</C>. A range minimum over length <C>L</C> uses two
            overlapping blocks of length <C>2^floor(log2 L)</C>. This is <C>O(1)</C> because minimum is idempotent:
            <C>min(x, x) = x</C>. Sparse tables use <C>O(n log n)</C> space and do not support efficient updates.
          </P>
        </SubSection>
      </Section>

      <Section title="Comparison, Complexity, and Practice">
        <Table headers={["Structure", "Build", "Range query", "Point update", "Range update", "Notes"]} rows={[
          ["Naive scan", <C>O(n)</C>, <C>O(n)</C>, <C>O(1)</C>, <C>O(n)</C>, "Minimal setup"],
          ["Prefix sums", <C>O(n)</C>, <C>O(1)</C>, <C>O(n)</C>, <C>O(n)</C>, "Static sums"],
          ["Fenwick tree", <C>O(n)</C>, <C>O(log n)</C>, <C>O(log n)</C>, "Special variants", "Compact; sums and invertible prefix operations"],
          ["Segment tree", <C>O(n)</C>, <C>O(log n)</C>, <C>O(log n)</C>, <><C>O(log n)</C> with lazy tags</>, "Flexible associative aggregates"],
          ["Sparse table", <C>O(n log n)</C>, <><C>O(1)</C> idempotent RMQ</>, "No efficient update", "No efficient update", "Static range min/max/gcd"],
        ]} />
        <ComplexityTable rows={[
          { operation: <C>segment tree build</C>, time: "O(n)", space: "O(n)" },
          { operation: <C>point update / range query</C>, time: "O(log n)", space: "O(log n)", note: "Recursive stack; storage remains O(n)" },
          { operation: <C>lazy range update / query</C>, time: "O(log n)", space: "O(n)" },
          { operation: <C>Fenwick build</C>, time: "O(n)", space: "O(n)" },
          { operation: <C>Fenwick add / prefix query</C>, time: "O(log n)", space: "O(1)" },
          { operation: <C>sparse table build / query</C>, time: "O(n log n) / O(1)", space: "O(n log n)" },
        ]} />
        <ProsCons pros={["Fast range queries and updates", "Segment-tree aggregate can be changed to fit many problems", "Lazy tags support whole-range updates without touching every element"]} cons={["More implementation detail and edge cases than prefix sums", "Recursive and lazy variants are easy to get wrong at boundaries", "Often unnecessary when the data is static or the operation is simple"]} />
        <Practice problems={[
          { name: "Range Sum Query - Mutable", difficulty: "Medium", hint: "Use a Fenwick tree or a segment tree." },
          { name: "Count of Smaller Numbers After Self", difficulty: "Hard", hint: "Scan right-to-left and query compressed ranks." },
          { name: "Range Minimum Query", difficulty: "Medium", hint: "Choose a segment tree for updates or sparse table for static data." },
          { name: "My Calendar III", difficulty: "Hard", hint: "A dynamic segment tree or sweep-line map can track coverage." },
          { name: "Range Addition", difficulty: "Medium", hint: "Use a difference array for offline updates, a lazy tree online." },
          { name: "Reverse Pairs", difficulty: "Hard", hint: "Combine coordinate compression and a BIT, or use merge sort." },
        ]} />
      </Section>

      <KeyTakeaways items={[
        <>Segment trees split intervals and store associative summaries for <C>O(log n)</C> queries and point updates.</>,
        <>Lazy propagation postpones range updates, applying tags when a subtree is next visited.</>,
        <>Fenwick trees are compact and ideal for prefix/range sums with point increments; use one-indexed lowbit jumps.</>,
        <>Sparse tables answer static idempotent range queries such as minimum in <C>O(1)</C> after preprocessing.</>,
        <>Prefer prefix sums or a scan when their simpler trade-offs already meet the workload.</>,
      ]} />
    </article>
  );
}