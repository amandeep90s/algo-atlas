import {
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

export default function Queues() {
  return (
    <article>
      <PageHeader eyebrow="Linear Data Structures" title="Queues" description="A queue processes items in first-in, first-out order. It models lines, work pipelines, breadth-first search and systems where arrival order matters." tags={["FIFO", "deque", "Ring buffer", "BFS"]} />

      <Section title="The FIFO Idea">
        <P>A <Strong>queue</Strong> adds new items at the rear and removes the oldest item from the front. This first-in, first-out (FIFO) order makes queues useful whenever work should be served in arrival order.</P>
        <Diagram caption="Enqueue at the rear; dequeue from the front.">{`
            dequeue ← FRONT                    REAR ← enqueue
                      ┌─────┬─────┬─────┐
                      │  A  │  B  │  C  │
                      └─────┴─────┴─────┘
                      oldest         newest
        `}</Diagram>
        <P>A queue ADT typically offers <C>enqueue(x)</C>, <C>dequeue()</C>, <C>front()</C>, <C>is_empty()</C>, and <C>size()</C>. Dequeue removes and returns the front item; implementations should explicitly define what happens when empty.</P>
      </Section>

      <Section title="Python Queue Choices">
        <SubSection title="Why not list.pop(0)?">
          <P>A Python list is a dynamic array. Removing index zero shifts every remaining reference one place, so a front removal costs <C>O(n)</C>. Repeating that in a large workload can turn an otherwise linear algorithm into quadratic time.</P>
          <CodeBlock code={`
            # Avoid for a high-volume FIFO queue:
            items = ["a", "b", "c"]
            first = items.pop(0)  # O(n) shifting
          `} />
        </SubSection>
        <SubSection title="collections.deque">
          <P><C>collections.deque</C> is a double-ended queue implemented for fast operations at both ends. Use <C>append</C> / <C>popleft</C> for FIFO; it is the usual Python queue for single-threaded algorithms.</P>
          <CodeBlock code={`
            from collections import deque

            queue = deque(["first", "second"])
            queue.append("third")
            print(queue.popleft())
            print(queue[0])
          `} output={`first
second`} />
        </SubSection>
        <SubSection title="queue.Queue for threads">
          <P><C>queue.Queue</C> provides locking and coordination for producer-consumer programs with multiple threads. Its <C>put</C> and <C>get</C> operations can block, and it supports task tracking; a deque alone does not provide those higher-level coordination semantics.</P>
          <CodeBlock code={`
            from queue import Queue

            jobs: Queue[str] = Queue(maxsize=100)
            jobs.put("resize image")
            job = jobs.get()
            try:
                print(job)
            finally:
                jobs.task_done()
          `} />
        </SubSection>
      </Section>

      <Section title="Circular Queues and Ring Buffers">
        <P>A fixed-capacity circular queue reuses an array by wrapping indices around with modulo arithmetic. Track the number of stored items separately so full and empty are unambiguous, including when front and rear indices coincide.</P>
        <Diagram caption="After reaching the final slot, the rear wraps to index zero.">{`
          index:  0     1     2     3     4
                ┌─────┬─────┬─────┬─────┬─────┐
                │  E  │  F  │     │  C  │  D  │
                └─────┴─────┴─────┴─────┴─────┘
                  ↑                 ↑     ↑
                rear              front  items wrap
        `}</Diagram>
        <CodeBlock title="circular_queue.py" code={`
          class CircularQueue:
              def __init__(self, capacity: int):
                  if capacity <= 0:
                      raise ValueError("capacity must be positive")
                  self._data: list[int | None] = [None] * capacity
                  self._front = 0
                  self._size = 0

              def enqueue(self, value: int) -> None:
                  if self._size == len(self._data):
                      raise OverflowError("queue is full")
                  rear = (self._front + self._size) % len(self._data)
                  self._data[rear] = value
                  self._size += 1

              def dequeue(self) -> int:
                  if self._size == 0:
                      raise IndexError("dequeue from empty queue")
                  value = self._data[self._front]
                  self._data[self._front] = None
                  self._front = (self._front + 1) % len(self._data)
                  self._size -= 1
                  assert value is not None
                  return value

              def peek(self) -> int:
                  if self._size == 0:
                      raise IndexError("peek from empty queue")
                  value = self._data[self._front]
                  assert value is not None
                  return value

              def __len__(self) -> int:
                  return self._size

              def is_empty(self) -> bool:
                  return self._size == 0
        `} />
        <Callout type="note">This implementation rejects enqueue on a full buffer. Some ring buffers intentionally overwrite old data instead; choose a policy based on whether data loss is acceptable.</Callout>
      </Section>

      <Section title="Queue Variants and Patterns">
        <SubSection title="Queue using two stacks">
          <P>Use one stack for incoming elements and one for outgoing elements. Transfer only when the outgoing stack is empty. Each item moves at most once in each direction, so operations are <Strong>amortized</Strong> <C>O(1)</C>, although a single dequeue can cost <C>O(n)</C>.</P>
          <CodeBlock code={`
            class TwoStackQueue:
                def __init__(self):
                    self._incoming: list[int] = []
                    self._outgoing: list[int] = []

                def enqueue(self, value: int) -> None:
                    self._incoming.append(value)

                def _prepare_front(self) -> None:
                    if not self._outgoing:
                        while self._incoming:
                            self._outgoing.append(self._incoming.pop())

                def dequeue(self) -> int:
                    self._prepare_front()
                    if not self._outgoing:
                        raise IndexError("dequeue from empty queue")
                    return self._outgoing.pop()

                def peek(self) -> int:
                    self._prepare_front()
                    if not self._outgoing:
                        raise IndexError("peek from empty queue")
                    return self._outgoing[-1]
          `} />
        </SubSection>
        <SubSection title="Deque as a double-ended queue">
          <P>A deque supports insertion and removal at both ends: <C>append</C>, <C>appendleft</C>, <C>pop</C>, and <C>popleft</C>. This flexibility powers sliding windows and can serve as either a stack or queue.</P>
        </SubSection>
        <SubSection title="Monotonic deque: sliding window maximum">
          <P>Store indices in decreasing value order. Remove expired indices from the front and dominated values from the back. The front index is the maximum for each complete window.</P>
          <CodeBlock code={`
            from collections import deque

            def sliding_window_max(nums: list[int], k: int) -> list[int]:
                if not 1 <= k <= len(nums):
                    raise ValueError("k must be between 1 and len(nums)")
                candidates: deque[int] = deque()
                result: list[int] = []
                for i, value in enumerate(nums):
                    while candidates and candidates[0] <= i - k:
                        candidates.popleft()
                    while candidates and nums[candidates[-1]] <= value:
                        candidates.pop()
                    candidates.append(i)
                    if i >= k - 1:
                        result.append(nums[candidates[0]])
                return result
          `} />
        </SubSection>
        <SubSection title="Priority queues, BFS and scheduling">
          <List items={[
            <>A <Strong>priority queue</Strong> removes by priority rather than arrival time. Python's <C>heapq</C> implements a min-heap; see <a href="/data-structures/heaps" className="text-indigo-300 underline underline-offset-4">Heaps</a> for details.</>,
            <><Strong>Breadth-first search</Strong> uses a FIFO queue to visit vertices by increasing distance from a start node. Mark nodes visited when enqueuing to avoid duplicates.</>,
            <>Task schedulers and network services queue work so producers and consumers can operate at different rates. Bounded queues provide backpressure when producers outrun consumers.</>,
          ]} />
        </SubSection>
      </Section>

      <Section title="Complexity and When to Use">
        <ComplexityTable rows={[
          { operation: <C>deque.append / appendleft</C>, time: "O(1)" },
          { operation: <C>deque.pop / popleft</C>, time: "O(1)" },
          { operation: <C>list.pop(0)</C>, time: "O(n)", note: "Shifts remaining elements" },
          { operation: <C>circular enqueue/dequeue</C>, time: "O(1)", space: "O(capacity)" },
          { operation: <C>two-stack queue</C>, time: "O(1)*", note: "Amortized; occasional O(n) transfer" },
          { operation: <C>sliding window maximum</C>, time: "O(n)", space: "O(k)" },
          { operation: <C>BFS</C>, time: "O(V + E)", space: "O(V)" },
        ]} />
        <ProsCons pros={["Preserves arrival order", "Efficient end operations with deque", "Enables level-order and breadth-first processing"]} cons={["Ordinary queues do not offer fast arbitrary lookup", "An unbounded queue can grow without limit", "Thread-safe coordination has extra overhead"]} />
        <Callout type="warning" title="Empty and full states">Before dequeuing, consider whether the queue may be empty. A ring buffer must also distinguish full from empty; tracking size is one straightforward solution.</Callout>
      </Section>

      <Section title="Practice Problems">
        <Practice problems={[
          { name: "Implement Queue using Stacks", difficulty: "Easy", hint: "Transfer only when the output stack is empty." },
          { name: "Number of Recent Calls", difficulty: "Easy", hint: "Keep only timestamps in the active range." },
          { name: "Binary Tree Level Order Traversal", difficulty: "Medium", hint: "Process one queue-length-sized level at a time." },
          { name: "Rotting Oranges", difficulty: "Medium", hint: "Multi-source BFS gives minute-by-minute spread." },
          { name: "Sliding Window Maximum", difficulty: "Hard", hint: "Maintain decreasing candidate indices in a deque." },
        ]} />
      </Section>
      <KeyTakeaways items={[
        <>FIFO means enqueue at the rear and dequeue from the front.</>,
        <>Use <C>collections.deque</C>, not <C>list.pop(0)</C>, for efficient single-threaded queues.</>,
        <>Use <C>queue.Queue</C> when threads need safe blocking coordination.</>,
        <>Circular buffers reuse fixed storage; monotonic deques support linear-time window extrema.</>,
      ]} />
    </article>
  );
}