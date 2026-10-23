import { Callout, C, CodeBlock, ComplexityTable, Diagram, KeyTakeaways, List, P, PageHeader, Practice, Section, Strong, SubSection, Table } from "../../components/doc";

export default function LinkedLists() {
  return (
    <article>
      <PageHeader eyebrow="Linear Data Structures" title="Linked Lists" description="Connect nodes with references to support local updates, and learn how traversal patterns solve classic pointer problems." tags={["Singly linked", "Doubly linked", "Fast and slow pointers"]} />
      <Section title="Nodes and linked structure">
        <P>A linked list stores values in separate <Strong>nodes</Strong>. Each node references the next node rather than occupying a contiguous indexed block. The head reference starts traversal; a singly linked node cannot move backward without additional bookkeeping.</P>
        <Diagram caption="Each node links forward; the tail points to None.">{`
          head
           │
           ▼
          [7 | •] ──▶ [12 | •] ──▶ [19 | None]
        `}</Diagram>
        <P>Finding a node by position takes a traversal, but inserting after a node already in hand only changes a constant number of links. This contrasts with arrays, which offer direct indexing but shift values for middle insertion.</P>
      </Section>
      <Section title="Singly linked list implementation">
        <P>This implementation tracks both head, tail, and size so appending remains constant-time. Insert positions are zero-based; inserting at length appends, while invalid positions raise <C>IndexError</C>.</P>
        <CodeBlock title="Singly linked list" code={`
            from __future__ import annotations

            class Node:
                def __init__(self, value: int, next_node: Node | None = None):
                    self.value = value
                    self.next = next_node

            class SinglyLinkedList:
                def __init__(self):
                    self.head: Node | None = None
                    self.tail: Node | None = None
                    self.size = 0

                def __len__(self) -> int:
                    return self.size

                def append(self, value: int) -> None:
                    node = Node(value)
                    if self.tail is None:
                        self.head = self.tail = node
                    else:
                        self.tail.next = node
                        self.tail = node
                    self.size += 1

                def prepend(self, value: int) -> None:
                    self.head = Node(value, self.head)
                    if self.tail is None:
                        self.tail = self.head
                    self.size += 1

                def insert_at(self, index: int, value: int) -> None:
                    if not 0 <= index <= self.size:
                        raise IndexError("index out of range")
                    if index == 0:
                        self.prepend(value)
                        return
                    if index == self.size:
                        self.append(value)
                        return
                    previous = self.head
                    for _ in range(index - 1):
                        assert previous is not None
                        previous = previous.next
                    assert previous is not None
                    previous.next = Node(value, previous.next)
                    self.size += 1

                def delete_value(self, value: int) -> bool:
                    previous: Node | None = None
                    current = self.head
                    while current is not None:
                        if current.value == value:
                            if previous is None:
                                self.head = current.next
                            else:
                                previous.next = current.next
                            if current is self.tail:
                                self.tail = previous
                            self.size -= 1
                            if self.head is None:
                                self.tail = None
                            return True
                        previous, current = current, current.next
                    return False

                def search(self, value: int) -> Node | None:
                    current = self.head
                    while current is not None:
                        if current.value == value:
                            return current
                        current = current.next
                    return None

                def reverse(self) -> None:
                    old_head = self.head
                    previous: Node | None = None
                    current = self.head
                    while current is not None:
                        following = current.next
                        current.next = previous
                        previous, current = current, following
                    self.head = previous
                    self.tail = old_head

                def __iter__(self):
                    current = self.head
                    while current is not None:
                        yield current.value
                        current = current.next

                def __repr__(self) -> str:
                    return "SinglyLinkedList([" + ", ".join(map(str, self)) + "])"

            linked = SinglyLinkedList()
            linked.append(2)
            linked.prepend(1)
            linked.insert_at(2, 3)
            print(linked)
            linked.reverse()
            print(list(linked), linked.delete_value(2), len(linked))
          `} output={`SinglyLinkedList([1, 2, 3])
[3, 2, 1] True 2`} />
        <Callout type="note">The type annotation <C>Node | None</C> requires Python 3.10+. The forward reference import keeps self-referential annotations valid during class creation.</Callout>
      </Section>
      <Section title="Doubly linked list and sentinels">
        <P>A doubly linked node has both next and previous references, making deletion and movement backward easier when a node is known. Dummy head and tail sentinels eliminate many empty-list and endpoint branches.</P>
        <CodeBlock title="Doubly linked list with sentinels" code={`
            class DNode:
                def __init__(self, value: int = 0):
                    self.value = value
                    self.prev: DNode | None = None
                    self.next: DNode | None = None

            class DoublyLinkedList:
                def __init__(self):
                    self.head = DNode()  # sentinel, not a data item
                    self.tail = DNode()
                    self.head.next = self.tail
                    self.tail.prev = self.head
                    self.size = 0

                def _insert_between(self, node: DNode, left: DNode, right: DNode) -> None:
                    node.prev, node.next = left, right
                    left.next = right.prev = node
                    self.size += 1

                def append(self, value: int) -> DNode:
                    last = self.tail.prev
                    assert last is not None
                    node = DNode(value)
                    self._insert_between(node, last, self.tail)
                    return node

                def remove(self, node: DNode) -> None:
                    left, right = node.prev, node.next
                    if left is None or right is None:
                        raise ValueError("node is not linked")
                    left.next, right.prev = right, left
                    node.prev = node.next = None
                    self.size -= 1

                def values(self) -> list[int]:
                    result = []
                    current = self.head.next
                    while current is not self.tail:
                        assert current is not None
                        result.append(current.value)
                        current = current.next
                    return result
          `} />
        <P>The list itself can insert or remove a known node in O(1), but locating a value remains O(n). A dictionary of node references paired with this structure powers an LRU cache.</P>
      </Section>
      <Section title="Circular linked lists">
        <P>In a circular list, the tail points back to the head (and a doubly circular list also links the head back to the tail). There is no natural <C>None</C> terminator, so traversal must stop when it returns to its starting node.</P>
        <Diagram caption="A circular list loops back to its head.">{`
          head ─▶ [A] ─▶ [B] ─▶ [C]
                   ▲             │
                   └─────────────┘
        `}</Diagram>
        <CodeBlock title="Circular list with a tail pointer" code={`
            class CircularNode:
                def __init__(self, value: int):
                    self.value = value
                    self.next: CircularNode = self

            class CircularLinkedList:
                def __init__(self):
                    self.tail: CircularNode | None = None
                    self.size = 0

                def append(self, value: int) -> None:
                    node = CircularNode(value)
                    if self.tail is None:
                        self.tail = node
                    else:
                        node.next = self.tail.next
                        self.tail.next = node
                        self.tail = node
                    self.size += 1

                def __iter__(self):
                    if self.tail is None:
                        return
                    current = self.tail.next
                    for _ in range(self.size):
                        yield current.value
                        current = current.next
          `} />
        <P>Circular lists are useful for round-robin scheduling and cyclic buffers. This implementation traverses exactly size nodes to terminate safely; incorrect termination conditions can create infinite loops.</P>
      </Section>
      <Section title="Pointer patterns">
        <SubSection title="Middle node and Floyd cycle detection"><P>Move a slow pointer one step and a fast pointer two steps. If they meet, a cycle exists. If the fast pointer reaches None, the list is acyclic. To find a cycle's entry, reset one pointer to the head; advance both one step until they meet.</P><CodeBlock code={`
def has_cycle(head: Node | None) -> bool:
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next if slow is not None else None
        fast = fast.next.next
        if slow is fast:
            return True
    return False


def cycle_start(head: Node | None) -> Node | None:
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next if slow is not None else None
        fast = fast.next.next
        if slow is fast:
            entry = head
            while entry is not slow:
                assert entry is not None and slow is not None
                entry = entry.next
                slow = slow.next
            return entry
    return None


def middle_node(head: Node | None) -> Node | None:
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next if slow is not None else None
        fast = fast.next.next
    return slow  # for even length, returns the second middle
`} /></SubSection>
        <SubSection title="Reverse a list"><P>Iterative reversal rewires each next pointer while retaining the unprocessed suffix. The recursive form reverses the suffix, then points the former next node back at the current node.</P><CodeBlock code={`
def reverse_iterative(head: Node | None) -> Node | None:
    previous = None
    current = head
    while current is not None:
        following = current.next
        current.next = previous
        previous, current = current, following
    return previous


def reverse_recursive(head: Node | None) -> Node | None:
    if head is None or head.next is None:
        return head
    new_head = reverse_recursive(head.next)
    head.next.next = head
    head.next = None
    return new_head
`} /></SubSection>
        <SubSection title="Merge sorted lists"><CodeBlock code={`
def merge_sorted(first: Node | None, second: Node | None) -> Node | None:
    sentinel = Node(0)
    tail = sentinel
    while first is not None and second is not None:
        if first.value <= second.value:
            tail.next, first = first, first.next
        else:
            tail.next, second = second, second.next
        tail = tail.next
    tail.next = first if first is not None else second
    return sentinel.next
`} /><P>The sentinel is a dummy head that avoids a special case for selecting the first output node. This reuses nodes and runs in O(n + m) time.</P></SubSection>
      </Section>
      <Section title="Remove nth from end and palindrome">
        <SubSection title="Remove nth node from the end"><P>Advance fast n steps, then move fast and slow together. A dummy node handles removal of the original head uniformly.</P><CodeBlock code={`
def remove_nth_from_end(head: Node | None, n: int) -> Node | None:
    if n <= 0:
        raise ValueError("n must be positive")
    dummy = Node(0, head)
    fast: Node | None = dummy
    slow = dummy
    for _ in range(n):
        if fast.next is None:
            raise ValueError("n exceeds list length")
        fast = fast.next
    while fast.next is not None:
        fast = fast.next
        assert slow.next is not None
        slow = slow.next
    assert slow.next is not None
    slow.next = slow.next.next
    return dummy.next
`} /></SubSection>
        <SubSection title="Palindrome linked list"><P>Find the midpoint, reverse the second half, compare corresponding values, then restore links if callers expect the input list unchanged.</P><CodeBlock code={`
def is_list_palindrome(head: Node | None) -> bool:
    if head is None or head.next is None:
        return True
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next if slow is not None else None
        fast = fast.next.next
    if fast is not None:          # odd length: skip the middle node
        assert slow is not None
        slow = slow.next
    second = reverse_iterative(slow)
    left, right = head, second
    matched = True
    while right is not None:
        if left.value != right.value:
            matched = False
            break
        left, right = left.next, right.next
    reverse_iterative(second)  # restore the original links
    return matched
`} /></SubSection>
      </Section>
      <Section title="LRU cache sketch">
        <P>Least-recently-used caches combine a dictionary for O(1) average key lookup with a doubly linked list for O(1) movement/removal of known nodes. A sentinel-based list keeps most-recently-used items near the front and evicts from the tail.</P>
        <CodeBlock code={`
            class LRUCache:
                def __init__(self, capacity: int):
                    self.capacity = capacity
                    self.items: dict[int, tuple[int, DNode]] = {}
                    self.order = DoublyLinkedList()

                def get(self, key: int) -> int:
                    if key not in self.items:
                        return -1
                    value, node = self.items[key]
                    self.order.remove(node)
                    node = self.order.append(key)  # move to most-recent end
                    self.items[key] = (value, node)
                    return value

                def put(self, key: int, value: int) -> None:
                    if self.capacity <= 0:
                        return
                    if key in self.items:
                        _, old_node = self.items[key]
                        self.order.remove(old_node)
                    node = self.order.append(key)
                    self.items[key] = (value, node)
                    if len(self.items) > self.capacity:
                        least_recent_key = self.order.head.next.value
                        self.order.remove(self.order.head.next)
                        del self.items[least_recent_key]
          `} />
        <Callout type="note">This sketch communicates the pairing and eviction policy; a complete implementation should handle sentinel types carefully and expose a clear front/back API. Each cache operation is O(1) average.</Callout>
      </Section>
      <Section title="Complexity and trade-offs">
        <ComplexityTable rows={[
          { operation: <C>prepend / insert after known node</C>, time: "O(1)", note: "Relink a constant number of pointers" },
          { operation: <C>append</C>, time: "O(1)", note: "With a maintained tail pointer" },
          { operation: <C>search / access by index</C>, time: "O(n)", note: "Sequential traversal" },
          { operation: <C>delete by value</C>, time: "O(n)", note: "Find first, then unlink" },
          { operation: <C>reverse</C>, time: "O(n)", space: "O(1)", note: "Iterative variant" },
          { operation: <C>cycle detection</C>, time: "O(n)", space: "O(1)", note: "Floyd's pointers" },
          { operation: <C>merge sorted lists</C>, time: "O(n + m)", space: "O(1)", note: "Reuses nodes" },
        ]} />
        <Table headers={["Operation", "Dynamic array", "Linked list"]} rows={[
          ["Index i", "O(1)", "O(n)"], ["Insert at front", "O(n) shifts", "O(1) with head reference"],
          ["Append", "O(1) amortized", "O(1) with tail reference"], ["Search by value", "O(n)", "O(n)"],
          ["Memory locality", "Excellent", "Extra pointers; scattered nodes"], ["Middle insertion", "O(n) to shift", "O(1) after locating node"],
        ]} />
        <P>Linked lists are useful when nodes are already located and frequent local relinking is needed. They are usually not a drop-in speed upgrade: pointer overhead and poor cache locality can make array-backed lists faster in practice.</P>
      </Section>
      <Section title="Common pitfalls and practice">
        <List items={[
          <>Update both head and tail on empty-list insertion, deleting the tail, and removing the final node.</>,
          <>Save <C>current.next</C> before overwriting a pointer during reversal or relinking.</>,
          <>A node reference is not an index; finding the node may still cost O(n).</>,
          <>Do not traverse a circular list looking only for <C>None</C>; stop on a repeated starting node.</>,
          <>Recursive reversal is elegant but consumes O(n) stack space and can exceed Python's recursion limit.</>,
        ]} />
        <Practice problems={[
          { name: "Reverse Linked List", difficulty: "Easy", hint: "Rewire links iteratively, then recursively." },
          { name: "Linked List Cycle", difficulty: "Easy", hint: "Floyd's slow and fast pointers." },
          { name: "Merge Two Sorted Lists", difficulty: "Easy", hint: "Use a dummy head and a moving tail." },
          { name: "Remove Nth Node From End", difficulty: "Medium", hint: "Keep two pointers n nodes apart." },
          { name: "Reorder List", difficulty: "Medium", hint: "Find middle, reverse half, and interleave." },
          { name: "LRU Cache", difficulty: "Medium", hint: "Pair a hash map with a doubly linked list." },
        ]} />
        <KeyTakeaways items={[
          <>Linked lists trade random access for efficient local relinking.</>, <>A tail pointer makes append O(1); a dummy head simplifies boundary cases.</>,
          <>Fast/slow pointers reveal midpoints and cycles in linear time and constant space.</>, <>Doubly linked nodes plus a map support LRU cache operations in O(1) average.</>,
          <>Trace pointer changes carefully and include empty, single-node, and tail cases.</>,
        ]} />
      </Section>
    </article>
  );
}