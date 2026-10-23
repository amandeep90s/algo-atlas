import {
  ArrayViz,
  Callout,
  CodeBlock,
  ComplexityTable,
  C,
  Diagram,
  KeyTakeaways,
  List,
  P,
  PageHeader,
  Practice,
  ProsCons,
  Section,
  Strong,
  SubSection,
} from "../../components/doc";

export default function Heaps() {
  return (
    <article>
      <PageHeader
        eyebrow="Non-Linear Data Structures"
        title="Heaps"
        description="A heap keeps the smallest or largest item at the root, making it the go-to structure for priority queues, top-k queries, and streaming order statistics."
        tags={["Complete binary tree", "Priority queue", "heapq", "O(log n) push/pop"]}
      />

      <Section title="Heap Property and Shape">
        <P>
          A <Strong>binary heap</Strong> is a complete binary tree with an ordering rule. In a <Strong>min-heap</Strong>,
          each parent is no greater than either child, so the minimum is at the root. In a <Strong>max-heap</Strong>,
          each parent is no smaller than its children. The property applies only between parent and child—siblings and
          separate subtrees are not globally sorted.
        </P>
        <Diagram caption="A min-heap: every parent is no greater than its children; the last level fills left to right.">{`
                         2
                      /     \\
                     5       3
                   /  \\    / \\
                  9    7  6    8

             array: [2, 5, 3, 9, 7, 6, 8]
        `}</Diagram>
        <P>
          Completeness keeps height logarithmic. Store nodes in an array in level order; for index <C>i</C>, the
          parent is <C>(i - 1) // 2</C>, left child is <C>2 * i + 1</C>, and right child is <C>2 * i + 2</C>.
          There are no explicit pointers, and the final level has no gaps.
        </P>
        <ArrayViz values={[2, 5, 3, 9, 7, 6, 8]} highlight={[0]} pointers={{ 0: "root", 1: "children of 0" }} caption="Array positions encode the tree shape; index arithmetic finds relatives in O(1)." />
      </Section>

      <Section title="Implementing a Min-Heap">
        <P>
          On insertion, append at the next open leaf and <Strong>sift up</Strong> while the parent is too large.
          For removal, save the root, move the final item to index zero, then <Strong>sift down</Strong> by swapping
          with the smaller child until the invariant is restored.
        </P>
        <CodeBlock title="min_heap.py" code={`
          class MinHeap:
              def __init__(self, values: list[int] | None = None) -> None:
                  self.data = list(values or [])
                  self._heapify()

              def __len__(self) -> int:
                  return len(self.data)

              def peek(self) -> int:
                  if not self.data:
                      raise IndexError("peek from empty heap")
                  return self.data[0]

              def push(self, value: int) -> None:
                  self.data.append(value)
                  child = len(self.data) - 1
                  while child > 0:
                      parent = (child - 1) // 2
                      if self.data[parent] <= self.data[child]:
                          break
                      self.data[parent], self.data[child] = self.data[child], self.data[parent]
                      child = parent

              def pop(self) -> int:
                  if not self.data:
                      raise IndexError("pop from empty heap")
                  minimum = self.data[0]
                  last = self.data.pop()
                  if self.data:
                      self.data[0] = last
                      self._sift_down(0)
                  return minimum

              def _sift_down(self, parent: int) -> None:
                  n = len(self.data)
                  while True:
                      left = 2 * parent + 1
                      right = left + 1
                      smallest = parent
                      if left < n and self.data[left] < self.data[smallest]:
                          smallest = left
                      if right < n and self.data[right] < self.data[smallest]:
                          smallest = right
                      if smallest == parent:
                          return
                      self.data[parent], self.data[smallest] = self.data[smallest], self.data[parent]
                      parent = smallest

              def _heapify(self) -> None:
                  for parent in range(len(self.data) // 2 - 1, -1, -1):
                      self._sift_down(parent)

          heap = MinHeap([8, 3, 5, 1])
          heap.push(2)
          print(heap.peek(), heap.pop(), heap.pop())
        `} output="1 1 2" />
        <Callout type="insight" title="Why bottom-up heapify is O(n)">
          Although one sift-down can take <C>O(log n)</C>, most nodes are near the leaves and move only a few levels.
          At most about <C>n / 2^(h+1)</C> nodes have height <C>h</C>; summing the work across all heights gives
          <C>n × Σ(h / 2^h) = O(n)</C>. Repeatedly inserting all values would instead cost <C>O(n log n)</C>.
        </Callout>
      </Section>

      <Section title="Python's heapq Module">
        <P>
          <C>heapq</C> is a min-heap API over an ordinary list. It is usually preferable to writing a heap by hand;
          the custom implementation above is useful for learning and for variants with specialized invariants.
        </P>
        <CodeBlock title="heapq_api.py" code={`
          import heapq

          values = [7, 2, 9, 1]
          heapq.heapify(values)                 # in-place, O(n)
          heapq.heappush(values, 4)             # O(log n)
          smallest = heapq.heappop(values)      # O(log n)
          next_smallest = heapq.heappushpop(values, 3)
          replaced = heapq.heapreplace(values, 6)  # requires non-empty heap
          top_three = heapq.nsmallest(3, values)
          largest_two = heapq.nlargest(2, values)
          merged = list(heapq.merge([1, 4, 8], [2, 3, 9]))  # inputs sorted
        `} />
        <List items={[
          <><C>heappush</C> and <C>heappop</C> insert and remove the root in <C>O(log n)</C>.</>,
          <><C>heapify</C> transforms a list in place in <C>O(n)</C>.</>,
          <><C>heappushpop</C> pushes then returns the smallest efficiently; <C>heapreplace</C> pops then pushes and requires a non-empty heap.</>,
          <><C>nlargest</C> / <C>nsmallest</C> are handy for top-k; <C>merge</C> lazily combines already-sorted iterables.</>,
        ]} />
        <SubSection title="Max-heaps, tuples, and stable priorities">
          <P>
            Before Python 3.14's max-heap helpers, the standard idiom is to push negated numeric priorities and negate
            popped values. For records, use a tuple such as <C>(priority, sequence, payload)</C>: the monotonically
            increasing sequence breaks ties without comparing payload objects.
          </P>
          <CodeBlock code={`
            import heapq
            import itertools

            max_heap = []
            heapq.heappush(max_heap, -12)
            largest = -heapq.heappop(max_heap)

            counter = itertools.count()
            jobs = []
            heapq.heappush(jobs, (2, next(counter), {"task": "email"}))
            heapq.heappush(jobs, (2, next(counter), {"task": "backup"}))
            priority, _, job = heapq.heappop(jobs)
          `} />
        </SubSection>
        <SubSection title="Priority queue with lazy deletion">
          <P>
            <C>heapq</C> has no decrease-key or arbitrary removal. Keep the current entry for each task in a map;
            when priorities change, push a replacement and mark the old entry removed. Skip stale entries when popping.
          </P>
          <CodeBlock code={`
            import heapq
            import itertools

            REMOVED = object()
            queue = []
            current = {}
            sequence = itertools.count()

            def add(task: str, priority: int) -> None:
                if task in current:
                    current[task][2] = REMOVED
                entry = [priority, next(sequence), task]
                current[task] = entry
                heapq.heappush(queue, entry)

            def pop_task() -> str:
                while queue:
                    _, _, task = heapq.heappop(queue)
                    if task is not REMOVED:
                        del current[task]
                        return task
                raise KeyError("priority queue is empty")
          `} />
        </SubSection>
      </Section>

      <Section title="Heap Patterns">
        <SubSection title="Kth largest and top k frequent">
          <P>
            Keep a min-heap of size <C>k</C>; its root is the kth-largest threshold. For top frequent values, heapify
            <C>(count, value)</C> pairs or use <C>Counter.most_common(k)</C>. A bounded heap gives <C>O(n log k)</C>
            time and <C>O(k)</C> extra space.
          </P>
          <CodeBlock code={`
            import heapq
            from collections import Counter

            def kth_largest(values: list[int], k: int) -> int:
                heap: list[int] = []
                for value in values:
                    heapq.heappush(heap, value)
                    if len(heap) > k:
                        heapq.heappop(heap)
                return heap[0]

            def top_k_frequent(values: list[int], k: int) -> list[int]:
                counts = Counter(values)
                return heapq.nlargest(k, counts, key=counts.get)
          `} />
        </SubSection>
        <SubSection title="Merge k sorted lists">
          <P>Seed the heap with the first value from each list and repeatedly add the next value from the list just removed.</P>
          <CodeBlock code={`
            import heapq
            from itertools import count

            def merge_sorted(lists: list[list[int]]) -> list[int]:
                order = count()
                heap = [(row[0], next(order), i, 0) for i, row in enumerate(lists) if row]
                heapq.heapify(heap)
                result = []
                while heap:
                    value, _, list_id, index = heapq.heappop(heap)
                    result.append(value)
                    index += 1
                    if index < len(lists[list_id]):
                        heapq.heappush(heap, (lists[list_id][index], next(order), list_id, index))
                return result
          `} />
        </SubSection>
        <SubSection title="Two heaps for a running median">
          <P>
            Keep a max-heap (negated values) for the lower half and a min-heap for the upper half. Balance their sizes
            so the lower half has at most one extra item; the median is then available at the roots in constant time.
          </P>
          <SubSection title="Other useful heap applications">
            <List items={[
              <>A task scheduler repeatedly takes the task with the earliest deadline or highest priority.</>,
              <>For <C>k</C> closest points, keep a bounded max-heap keyed by squared distance, avoiding square roots.</>,
              <>Heap sort repeatedly removes the root; see the <C>Sorting</C> page for the in-place algorithm and its trade-offs.</>,
            ]} />
          </SubSection>
        </SubSection>
      </Section>

      <Section title="Complexity and Trade-offs">
        <ComplexityTable rows={[
          { operation: <C>peek</C>, time: "O(1)", space: "O(1)" },
          { operation: <C>push</C>, time: "O(log n)", space: "O(1)" },
          { operation: <C>pop</C>, time: "O(log n)", space: "O(1)" },
          { operation: <C>heapify</C>, time: "O(n)", space: "O(1)", note: "In place" },
          { operation: <C>find arbitrary value</C>, time: "O(n)", space: "O(1)" },
          { operation: <C>heap sort</C>, time: "O(n log n)", space: "O(1)", note: "Not stable" },
        ]} />
        <ProsCons pros={["Fast access to the current minimum or maximum", "Priority updates and removals are logarithmic", "Compact array representation; no per-node pointers"]} cons={["Not sorted: searching an arbitrary item is linear", "No direct efficient decrease-key in heapq", "Repeated top-k extraction can cost more than sorting when k is large"]} />
        <Callout type="warning" title="Don't mistake a heap for a sorted list">
          Only the root is guaranteed to be extremal. Iterating the underlying list does not produce sorted order; pop
          repeatedly or call <C>sorted</C> when the full ordering is needed.
        </Callout>
      </Section>

      <Section title="Practice Problems">
        <Practice problems={[
          { name: "Kth Largest Element in an Array", difficulty: "Medium", hint: "Maintain a size-k min-heap or use quickselect." },
          { name: "Top K Frequent Elements", difficulty: "Medium", hint: "Count first, then select the k largest frequencies." },
          { name: "Merge k Sorted Lists", difficulty: "Hard", hint: "Track one candidate from every non-empty list." },
          { name: "Find Median from Data Stream", difficulty: "Hard", hint: "Balance a lower max-heap and upper min-heap." },
          { name: "Task Scheduler", difficulty: "Medium", hint: "Use remaining counts and a cooldown queue." },
          { name: "K Closest Points to Origin", difficulty: "Medium", hint: "Compare squared distances in a bounded max-heap." },
        ]} />
      </Section>

      <KeyTakeaways items={[
        <>A heap is a complete binary tree whose root is always the minimum or maximum.</>,
        <>Array indices encode tree relatives: parent <C>(i - 1) // 2</C>; children <C>2i + 1</C> and <C>2i + 2</C>.</>,
        <>Push and pop take <C>O(log n)</C>; bottom-up heapify takes <C>O(n)</C>.</>,
        <><C>heapq</C> is a min-heap; negate numbers for max-priority behavior and add a tie-breaker for records.</>,
        <>Use bounded heaps for top-k work and two heaps for streaming medians.</>,
      ]} />
    </article>
  );
}