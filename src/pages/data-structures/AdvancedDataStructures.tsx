import {
  Callout,
  CodeBlock,
  ComplexityTable,
  C,
  KeyTakeaways,
  List,
  P,
  PageHeader,
  Practice,
  Section,
  Strong,
  SubSection,
  Table,
} from "../../components/doc";

export default function AdvancedDataStructures() {
  return (
    <article>
      <PageHeader
        eyebrow="Non-Linear Data Structures"
        title="Advanced Data Structures"
        description="Choose structures that encode the work your operations need: constant-time cache updates, static range queries, persistence, ordered access, or spatial search."
        tags={["Caches", "Range queries", "Randomized trees", "Persistence", "Spatial"]}
      />

      <Section title="Choosing a specialized structure">
        <P>
          Advanced structures are not automatically faster than lists and dictionaries. Their advantage comes from
          matching a workload: an <Strong>LRU cache</Strong> combines recency order with keyed lookup, while a sparse
          table spends preprocessing and memory to make static range-minimum queries constant time. State the allowed
          operations and whether updates occur before choosing a representation.
        </P>
        <Table
          headers={["Question", "Why it matters"]}
          rows={[
            ["Are updates frequent?", "Static indexes can preprocess once; dynamic workloads need update support."],
            ["Is order part of the API?", "A hash map alone does not represent recency, sorted order, or priority."],
            ["Are old versions needed?", "Persistence preserves previous roots instead of copying the whole structure."],
            ["What is the memory budget?", "Indexes and pointers trade additional space for faster operations."],
          ]}
        />
        <Callout type="tip" title="Start from operations">
          Write the expected operations and their frequency first. A theoretically elegant structure can be a poor fit
          when a built-in <C>dict</C>, <C>deque</C>, or sorted list is simpler and fast enough.
        </Callout>
      </Section>

      <Section title="LRU and LFU caches">
        <SubSection title="LRU with OrderedDict">
          <P>
            Least-recently-used eviction removes the key whose last access is oldest. Python's <C>OrderedDict</C>
            supports moving an accessed entry to the newest end and evicting from the oldest end in constant time.
          </P>
          <CodeBlock
            title="lru_ordered_dict.py"
            code={`
              from collections import OrderedDict

              class LRUCache:
                  def __init__(self, capacity: int):
                      if capacity < 0:
                          raise ValueError("capacity must be non-negative")
                      self.capacity = capacity
                      self.items: OrderedDict[int, int] = OrderedDict()

                  def get(self, key: int) -> int:
                      if key not in self.items:
                          return -1
                      self.items.move_to_end(key)
                      return self.items[key]

                  def put(self, key: int, value: int) -> None:
                      if self.capacity == 0:
                          return
                      if key in self.items:
                          self.items.move_to_end(key)
                      self.items[key] = value
                      if len(self.items) > self.capacity:
                          self.items.popitem(last=False)

              cache = LRUCache(2)
              cache.put(1, 10)
              cache.put(2, 20)
              cache.get(1)
              cache.put(3, 30)
              print(cache.get(2), cache.get(1), cache.get(3))
            `}
          />
        </SubSection>
        <SubSection title="LRU with a doubly linked list and dictionary">
          <P>
            The dictionary maps each key to its node; a sentinel-headed doubly linked list stores least-to-most recent
            order. Unlinking and relinking a known node are O(1), including eviction at the head.
          </P>
          <CodeBlock
            title="lru_linked_list.py"
            code={`
              class Node:
                  def __init__(self, key=0, value=0):
                      self.key, self.value = key, value
                      self.prev = self.next = None

              class LRUCache:
                  def __init__(self, capacity: int):
                      self.capacity = capacity
                      self.nodes = {}
                      self.left, self.right = Node(), Node()
                      self.left.next, self.right.prev = self.right, self.left

                  def _remove(self, node):
                      node.prev.next = node.next
                      node.next.prev = node.prev

                  def _newest(self, node):
                      node.prev, node.next = self.right.prev, self.right
                      self.right.prev.next = node
                      self.right.prev = node

                  def get(self, key: int) -> int:
                      node = self.nodes.get(key)
                      if node is None:
                          return -1
                      self._remove(node)
                      self._newest(node)
                      return node.value

                  def put(self, key: int, value: int) -> None:
                      if self.capacity == 0:
                          return
                      if key in self.nodes:
                          node = self.nodes[key]
                          node.value = value
                          self._remove(node)
                      else:
                          node = Node(key, value)
                          self.nodes[key] = node
                      self._newest(node)
                      if len(self.nodes) > self.capacity:
                          oldest = self.left.next
                          self._remove(oldest)
                          del self.nodes[oldest.key]

              cache = LRUCache(1)
              cache.put(7, 70)
              cache.put(8, 80)
              print(cache.get(7), cache.get(8))
            `}
          />
        </SubSection>
        <SubSection title="LFU with frequency buckets">
          <P>
            Least-frequently-used eviction tracks a frequency per key and an insertion-ordered bucket for each
            frequency. When frequencies tie, evict the least-recently-used key in that bucket. <C>min_freq</C> points
            to the smallest currently occupied frequency.
          </P>
          <CodeBlock
            title="lfu_cache.py"
            code={`
              from collections import defaultdict, OrderedDict

              class LFUCache:
                  def __init__(self, capacity: int):
                      self.capacity = capacity
                      self.values = {}
                      self.freq = {}
                      self.groups = defaultdict(OrderedDict)
                      self.min_freq = 0

                  def _touch(self, key: int) -> None:
                      old = self.freq[key]
                      del self.groups[old][key]
                      if not self.groups[old]:
                          del self.groups[old]
                          if self.min_freq == old:
                              self.min_freq += 1
                      self.freq[key] = old + 1
                      self.groups[old + 1][key] = None

                  def get(self, key: int) -> int:
                      if key not in self.values:
                          return -1
                      self._touch(key)
                      return self.values[key]

                  def put(self, key: int, value: int) -> None:
                      if self.capacity == 0:
                          return
                      if key in self.values:
                          self.values[key] = value
                          self._touch(key)
                          return
                      if len(self.values) == self.capacity:
                          victim, _ = self.groups[self.min_freq].popitem(last=False)
                          del self.values[victim]
                          del self.freq[victim]
                      self.values[key] = value
                      self.freq[key] = 1
                      self.groups[1][key] = None
                      self.min_freq = 1

              cache = LFUCache(2)
              cache.put(1, 11)
              cache.put(2, 22)
              cache.get(1)
              cache.put(3, 33)
              print(cache.get(2), cache.get(1), cache.get(3))
            `}
          />
          <Callout type="warning" title="State invariants">
            Remove empty frequency buckets and update <C>min_freq</C> only when its bucket becomes empty. The cache
            shown uses integer return values and <C>-1</C> for a miss; production APIs should use a distinct miss
            sentinel if stored values may themselves be <C>-1</C>.
          </Callout>
        </SubSection>
      </Section>

      <Section title="Static range queries: sparse tables">
        <P>
          For an immutable array, a sparse table precomputes answers for every power-of-two interval. For an
          idempotent operation such as min, max, or gcd, two possibly overlapping intervals of length
          <C>2^k</C> cover any query range; overlap is harmless because repeating an operand does not change the answer.
        </P>
        <CodeBlock
          title="sparse_table_min.py"
          code={`
            class SparseTableMin:
                def __init__(self, values: list[int]):
                    if not values:
                        raise ValueError("values must not be empty")
                    self.n = len(values)
                    self.logs = [0] * (self.n + 1)
                    for length in range(2, self.n + 1):
                        self.logs[length] = self.logs[length // 2] + 1
                    self.table = [values[:]]
                    power = 1
                    while 2 * power <= self.n:
                        prev = self.table[-1]
                        self.table.append([
                            min(prev[i], prev[i + power])
                            for i in range(self.n - 2 * power + 1)
                        ])
                        power *= 2

                def query(self, left: int, right: int) -> int:
                    if not (0 <= left <= right < self.n):
                        raise IndexError("invalid inclusive range")
                    level = self.logs[right - left + 1]
                    width = 1 << level
                    return min(self.table[level][left], self.table[level][right - width + 1])

            values = [7, 2, 9, 1, 5, 3]
            rmq = SparseTableMin(values)
            print(rmq.query(1, 4), rmq.query(2, 5))
          `}
          output="1 1"
        />
        <Callout type="insight" title="Idempotence is the trick">
          The two selected blocks overlap when the range is not a power of two. This query recipe works for min,
          max, and gcd, but not sum: overlapping elements would be counted twice. Static range sums instead use a
          prefix sum for O(1) queries, or a segment tree when updates are needed.
        </Callout>
      </Section>

      <Section title="Treaps: randomized balanced search trees">
        <P>
          A treap is a binary search tree by key and a heap by random priority. Random priorities make its expected
          height O(log n). Split partitions keys at a boundary; merge joins two treaps whose key ranges are ordered.
          Insert and delete can therefore be expressed using these two primitives.
        </P>
        <CodeBlock
          title="treap.py"
          code={`
            import random

            class Node:
                def __init__(self, key: int):
                    self.key = key
                    self.priority = random.random()
                    self.left = self.right = None

            def split(root, key):
                """Return (< key, >= key)."""
                if root is None:
                    return None, None
                if root.key < key:
                    root.right, right = split(root.right, key)
                    return root, right
                left, root.left = split(root.left, key)
                return left, root

            def merge(left, right):
                if left is None:
                    return right
                if right is None:
                    return left
                if left.priority > right.priority:
                    left.right = merge(left.right, right)
                    return left
                right.left = merge(left, right.left)
                return right

            def insert(root, key):
                left, right = split(root, key)
                middle = Node(key)
                return merge(merge(left, middle), right)

            def delete(root, key):
                if root is None:
                    return None
                if root.key == key:
                    return merge(root.left, root.right)
                if key < root.key:
                    root.left = delete(root.left, key)
                else:
                    root.right = delete(root.right, key)
                return root

            def inorder(root):
                return inorder(root.left) + [root.key] + inorder(root.right) if root else []

            root = None
            for value in [8, 3, 10, 1, 6]:
                root = insert(root, value)
            root = delete(root, 3)
            print(inorder(root))
          `}
          output="[1, 6, 8, 10]"
        />
        <Callout type="warning" title="Duplicates and randomized bounds">
          This implementation treats equal keys as distinct nodes on the right side of split. If your application
          needs set semantics, check for an existing key before inserting. Expected logarithmic height is probabilistic,
          not a worst-case guarantee; choose a robust priority source for adversarial inputs.
        </Callout>
      </Section>

      <Section title="Persistence and immutable versions">
        <P>
          A persistent structure keeps prior versions available after an update. <Strong>Path copying</Strong> builds
          new nodes only along the changed root-to-leaf path and shares untouched subtrees. This turns a linked-list
          or tree update into a new root without cloning all historical data.
        </P>
        <SubSection title="A persistent stack">
          <CodeBlock
            title="persistent_stack.py"
            code={`
              from dataclasses import dataclass
              from typing import Generic, TypeVar

              T = TypeVar("T")

              @dataclass(frozen=True)
              class Node(Generic[T]):
                  value: T
                  next: "Node[T] | None" = None

              @dataclass(frozen=True)
              class Stack(Generic[T]):
                  head: Node[T] | None = None

                  def push(self, value: T) -> "Stack[T]":
                      return Stack(Node(value, self.head))

                  def pop(self) -> tuple[T, "Stack[T]"]:
                      if self.head is None:
                          raise IndexError("pop from empty stack")
                      return self.head.value, Stack(self.head.next)

              original = Stack[int]().push(4).push(9)
              top, shortened = original.pop()
              print(top, original.head.value, shortened.head.value)
            `}
            output="9 9 4"
          />
        </SubSection>
        <SubSection title="Persistent arrays and segment trees">
          <P>
            An array can be represented by a balanced tree over index ranges. Updating one position copies O(log n)
            nodes and returns a new root; each root identifies a complete version. A persistent segment tree adds
            aggregate values to those nodes, supporting historical range queries. Keep roots in a list when versions
            are addressed by number.
          </P>
          <Callout type="note" title="Sharing is safe only with immutability">
            If shared nodes are mutated in place, older versions silently change too. Persistent implementations make
            nodes immutable or carefully copy every node on an updated path.
          </Callout>
        </SubSection>
      </Section>

      <Section title="Monotonic queues, ordered sets, and buffers">
        <SubSection title="Deque-based monotonic queue">
          <P>
            A monotonic deque discards dominated candidates from its back and expired indices from its front. Every
            element enters and leaves at most once, so a sliding-window maximum takes O(n) total time.
          </P>
          <CodeBlock
            title="sliding_maximum.py"
            code={`
              from collections import deque

              def sliding_maximum(values: list[int], width: int) -> list[int]:
                  if width <= 0 or width > len(values):
                      raise ValueError("width must be between 1 and len(values)")
                  candidates = deque()
                  result = []
                  for index, value in enumerate(values):
                      while candidates and candidates[0] <= index - width:
                          candidates.popleft()
                      while candidates and values[candidates[-1]] <= value:
                          candidates.pop()
                      candidates.append(index)
                      if index >= width - 1:
                          result.append(values[candidates[0]])
                  return result

              print(sliding_maximum([1, 3, -1, -3, 5, 3, 6, 7], 3))
            `}
            output="[3, 3, 5, 5, 6, 7]"
          />
        </SubSection>
        <SubSection title="Ordered sets and sequence buffers">
          <List
            items={[
              <>A sorted Python <C>list</C> plus <C>bisect</C> gives O(log n) search position, but insertion and removal still shift O(n) elements.</>,
              <><C>sortedcontainers.SortedList</C> offers a practical sorted multiset, and <C>SortedDict</C> offers ordered key/value mapping; both are third-party options, not imported in runnable examples.</>,
              <>A <Strong>gap buffer</Strong> keeps an empty region at the edit cursor; local typing is cheap, while moving the gap costs time proportional to the distance.</>,
              <>A <Strong>rope</Strong> stores text in a balanced tree of chunks, making concatenation and edits on large text more scalable than repeatedly copying one flat string.</>,
            ]}
          />
        </SubSection>
      </Section>

      <Section title="Range decomposition and geometric indexes">
        <SubSection title="Square-root decomposition">
          <P>
            Partition an array into blocks of about √n elements. A range query scans at most two partial blocks and
            uses stored sums for the full blocks, giving O(√n) query time. Point updates adjust one block sum in O(1).
          </P>
          <CodeBlock
            title="sqrt_decomposition.py"
            code={`
              from math import isqrt

              class BlockSums:
                  def __init__(self, values: list[int]):
                      self.values = values[:]
                      self.width = max(1, isqrt(len(values)))
                      self.sums = [0] * ((len(values) + self.width - 1) // self.width)
                      for i, value in enumerate(values):
                          self.sums[i // self.width] += value

                  def update(self, index: int, value: int) -> None:
                      block = index // self.width
                      self.sums[block] += value - self.values[index]
                      self.values[index] = value

                  def query(self, left: int, right: int) -> int:
                      total = 0
                      while left <= right and left % self.width:
                          total += self.values[left]
                          left += 1
                      while left + self.width - 1 <= right:
                          total += self.sums[left // self.width]
                          left += self.width
                      while left <= right:
                          total += self.values[left]
                          left += 1
                      return total

              blocks = BlockSums([2, 4, 1, 7, 3, 6, 5])
              blocks.update(3, 10)
              print(blocks.query(1, 5))
            `}
            output="24"
          />
        </SubSection>
        <SubSection title="Mo's algorithm">
          <P>
            Mo's algorithm answers offline range queries by sorting them into blocks of left endpoint, with the right
            endpoint ordered alternately to reduce pointer travel. Maintain a current range and add/remove one element
            as endpoints move. It is useful when a query can be updated cheaply but no compact online structure is
            obvious; a common bound is O((n + q)√n) state transitions for n values and q queries.
          </P>
        </SubSection>
        <SubSection title="Interval trees and k-d trees">
          <P>
            An <Strong>interval tree</Strong> indexes intervals so that overlapping intervals can be reported without
            checking every interval. A <Strong>k-d tree</Strong> recursively partitions points by alternating coordinate
            axes, supporting spatial range and nearest-neighbor searches; balanced construction is useful in low
            dimensions, while performance can degrade as dimensionality rises.
          </P>
        </SubSection>
      </Section>

      <Section title="Comparison and complexity">
        <Table
          headers={["Structure", "Typical operation", "Time", "Space", "Use it when"]}
          rows={[
            ["LRU (OrderedDict / DLL + dict)", "get / put", "O(1)", "O(capacity)", "Evict least recently accessed item."],
            ["LFU frequency buckets", "get / put", "O(1)", "O(capacity)", "Evict least frequent, LRU tie-break."],
            ["Sparse table", "static idempotent range query", "O(1)", "O(n log n)", "Many queries, no updates."],
            ["Treap", "search / insert / delete", "O(log n) expected", "O(n)", "Ordered dynamic keys, split/merge."],
            ["Persistent stack", "push / pop", "O(1)", "O(1) new nodes/op", "Retain previous versions."],
            ["Monotonic deque", "sliding window min/max", "O(n) total", "O(window)", "Moving fixed-size windows."],
            ["Sorted list + bisect", "search / insert", "O(log n) / O(n)", "O(n)", "Small ordered collections."],
            ["Sqrt decomposition", "range sum / point update", "O(√n) / O(1)", "O(n)", "Simple block-based dynamic queries."],
            ["Mo's algorithm", "offline range queries", "O((n+q)√n)*", "O(n+q)", "Cheap add/remove, no online requirement."],
            ["Interval tree", "report overlaps", "O(log n + k)**", "O(n)", "Interval overlap search."],
            ["k-d tree", "spatial / nearest query", "O(log n) average***", "O(n)", "Low-dimensional point data."],
            ["Rope / gap buffer", "text edit", "varies", "O(n)", "Large text editing patterns."],
          ]}
        />
        <P>
          * Bound depends on the chosen block ordering and operation cost. ** For common balanced interval-tree
          variants and output size k. *** Typical balanced low-dimensional data; worst cases can approach O(n).
        </P>
        <ComplexityTable
          rows={[
            { operation: "Sparse-table build", time: "O(n log n)", space: "O(n log n)" },
            { operation: "Sparse-table range minimum", time: "O(1)", space: "O(1)" },
            { operation: "Treap operation", time: "O(log n)", space: "O(n)", note: "Expected; O(n) worst case." },
            { operation: "Square-root range query", time: "O(√n)", space: "O(1) extra" },
          ]}
        />
        <Callout type="warning" title="Complexities depend on assumptions">
          Expected treap and spatial-index bounds are not worst-case guarantees. Also include preprocessing, update
          frequency, and memory in comparisons rather than reporting query time alone.
        </Callout>
      </Section>

      <Section title="Practice and takeaways">
        <Practice
          problems={[
            { name: "LRU Cache", difficulty: "Medium", hint: "Combine a key-to-node map with a recency list." },
            { name: "LFU Cache", difficulty: "Hard", hint: "Track key frequencies, ordered buckets, and the minimum frequency." },
            { name: "Range Minimum Query", difficulty: "Medium", hint: "Compare sparse tables with segment trees when updates appear." },
            { name: "Sliding Window Maximum", difficulty: "Hard", hint: "Keep candidate indices in decreasing-value order." },
            { name: "Count of Range Sum", difficulty: "Hard", hint: "Consider an ordered structure or offline divide-and-conquer." },
            { name: "Design a Persistent Stack", difficulty: "Medium", hint: "Return a new head while reusing the old tail." },
          ]}
        />
        <KeyTakeaways
          items={[
            "Use an LRU list or OrderedDict to make recency updates and eviction constant-time.",
            "LFU caches need frequency buckets, a tie-breaking order, and a correct min_freq invariant.",
            "Sparse tables answer static idempotent range queries in O(1) after O(n log n) preprocessing.",
            "Treaps use randomized priorities with split and merge for expected-logarithmic ordered operations.",
            "Persistence preserves history through immutable nodes and path copying; deques and block decomposition simplify common range workloads.",
          ]}
        />
      </Section>
    </article>
  );
}