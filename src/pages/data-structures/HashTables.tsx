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

export default function HashTables() {
  return (
    <article>
      <PageHeader eyebrow="Linear Data Structures" title="Hash Tables" description="Hash tables map keys to values using a hash function, making membership tests and lookups average constant time. Python's dict and set are highly optimized hash-table-based collections." tags={["Hashing", "dict", "set", "Average O(1)"]} />

      <Section title="Hashing and the Core Idea">
        <P>A <Strong>hash table</Strong> transforms a key into an integer hash, then uses that hash to select a storage location (often an array index). To find a value, it hashes the same key again and checks the corresponding slot or bucket instead of scanning every item.</P>
        <Diagram caption="A hash function maps keys to buckets; different keys can map to one bucket.">{`
          key "pear" ──hash──▶  17 ──index──▶ bucket 1 ──▶ ("pear", 4)
          key "plum" ──hash──▶  24 ──index──▶ bucket 1 ──▶ ("plum", 9)
                                                collision chain
        `}</Diagram>
        <P>A good hash function is deterministic for a key during its lifetime, spreads keys broadly, and is efficient to compute. Hash tables must also resolve collisions: distinct keys can map to the same bucket even with a good hash function.</P>
        <Callout type="note" title="Python hash()">Python's <C>hash(x)</C> returns an integer compatible with hash-based collections. Hashes for strings and bytes are randomized between interpreter processes by default; do not persist hash values or treat them as stable IDs.</Callout>
      </Section>

      <Section title="Hashable Keys and Equality">
        <P>A key must be <Strong>hashable</Strong>: its hash stays stable while it is in a set or dictionary, and equality is consistent with hashing (<C>a == b</C> implies <C>hash(a) == hash(b)</C>). Immutable values such as integers, strings and tuples of hashable values are generally hashable.</P>
        <List items={[
          <>Lists and dictionaries are mutable, so their content may change after insertion; Python therefore rejects them as keys.</>,
          <>A tuple can be a key only if all its elements are hashable. A tuple containing a list is not hashable.</>,
          <><C>frozenset</C> is an immutable, hashable counterpart to <C>set</C>, suitable as a key.</>,
          <>Custom objects should implement <C>__eq__</C> and <C>__hash__</C> consistently. Mutable equality-relevant fields should not determine a key's hash.</>,
        ]} />
        <CodeBlock code={`
          print(hash(("user", 42)))
          print(hash(frozenset({"red", "blue"})))
          # hash([1, 2]) raises TypeError: unhashable type: 'list'
        `} />
      </Section>

      <Section title="Collision Strategies">
        <SubSection title="Separate chaining">
          <P>Each table index stores a bucket of entries (often a linked list or dynamic array). A collision adds another entry to that bucket. Lookup hashes to the bucket, then compares keys within it. This is straightforward and can tolerate load factors above one, though long buckets slow operations.</P>
        </SubSection>
        <SubSection title="Open addressing">
          <P>All entries live directly in the table array. On collision, probe other indices until finding the key or an empty slot. Deletion needs a tombstone marker so searches can pass through the removed entry.</P>
          <List items={[
            <><Strong>Linear probing:</Strong> check consecutive slots. Cache-friendly, but clusters can grow.</>,
            <><Strong>Quadratic probing:</Strong> use increasingly spaced offsets to reduce primary clustering.</>,
            <><Strong>Double hashing:</Strong> use a second hash to determine the probe step; the step must be relatively prime to capacity to visit every slot.</>,
          ]} />
        </SubSection>
        <SubSection title="Load factor and rehashing">
          <P>The <Strong>load factor</Strong> is <C>number_of_entries / number_of_buckets</C>. As it rises, collisions become more common. A table typically resizes past a threshold, allocates a larger bucket array, and redistributes entries using their hashes. Rehashing costs <C>O(n)</C> once, but geometric growth makes insertion amortized <C>O(1)</C>.</P>
        </SubSection>
      </Section>

      <Section title="A Chaining HashMap">
        <P>This educational map uses Python's built-in hash and separate chaining. It resizes when the load factor exceeds its threshold. Production code should normally use <C>dict</C>.</P>
        <CodeBlock title="hash_map.py" code={`
          class HashMap:
              def __init__(self, capacity: int = 8):
                  if capacity <= 0:
                      raise ValueError("capacity must be positive")
                  self._buckets: list[list[tuple[object, object]]] = [
                      [] for _ in range(capacity)
                  ]
                  self._size = 0

              def __len__(self) -> int:
                  return self._size

              def _index(self, key: object) -> int:
                  return hash(key) % len(self._buckets)

              def _find(self, key: object) -> tuple[list, int]:
                  bucket = self._buckets[self._index(key)]
                  for i, (existing, _) in enumerate(bucket):
                      if existing == key:
                          return bucket, i
                  return bucket, -1

              def put(self, key: object, value: object) -> None:
                  bucket, position = self._find(key)
                  if position >= 0:
                      bucket[position] = (key, value)
                      return
                  bucket.append((key, value))
                  self._size += 1
                  if self._size / len(self._buckets) > 0.75:
                      self._resize(2 * len(self._buckets))

              def get(self, key: object, default: object = None) -> object:
                  bucket, position = self._find(key)
                  return bucket[position][1] if position >= 0 else default

              def remove(self, key: object) -> object:
                  bucket, position = self._find(key)
                  if position < 0:
                      raise KeyError(key)
                  _, value = bucket.pop(position)
                  self._size -= 1
                  return value

              def _resize(self, capacity: int) -> None:
                  old_entries = [entry for bucket in self._buckets for entry in bucket]
                  self._buckets = [[] for _ in range(capacity)]
                  for key, value in old_entries:
                      self._buckets[self._index(key)].append((key, value))
        `} />
        <Callout type="warning">This teaching implementation assumes a positive initial capacity, uses broad <C>object</C> types, and does not implement iteration or shrinking. A collision chain can still make an operation linear.</Callout>
      </Section>

      <Section title="Python Dictionaries, Sets and Helpers">
        <SubSection title="dict internals">
          <P>CPython dictionaries use a compact, insertion-ordered representation and preserve insertion order as a language guarantee since Python 3.7. Implementations use a sparse index table to locate entries efficiently. Updating a key keeps its position; deleting and reinserting it places it at the end.</P>
        </SubSection>
        <SubSection title="Sets, Counter and defaultdict">
          <CodeBlock code={`
            from collections import Counter, defaultdict

            left = {1, 2, 3}
            right = {3, 4}
            print(left | right)  # union
            print(left & right)  # intersection
            print(left - right)  # difference

            counts = Counter("mississippi")
            groups: defaultdict[str, list[str]] = defaultdict(list)
            for word in ["tea", "eat", "tan"]:
                groups["".join(sorted(word))].append(word)
          `} />
        </SubSection>
      </Section>

      <Section title="Common Hashing Patterns">
        <SubSection title="Two sum and frequency counting">
          <P>For each value, look up its needed complement before recording the current index. This makes the expected runtime linear.</P>
          <CodeBlock code={`
            def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
                seen: dict[int, int] = {}
                for i, value in enumerate(nums):
                    complement = target - value
                    if complement in seen:
                        return seen[complement], i
                    seen[value] = i
                return None

            def frequencies(items: list[str]) -> dict[str, int]:
                counts: dict[str, int] = {}
                for item in items:
                    counts[item] = counts.get(item, 0) + 1
                return counts
          `} />
        </SubSection>
        <SubSection title="Group anagrams and first unique character">
          <P>Canonicalize each word by sorting its letters to form a group key. For a first unique character, count once, then scan in original order.</P>
          <CodeBlock code={`
            from collections import Counter, defaultdict

            def group_anagrams(words: list[str]) -> list[list[str]]:
                groups: defaultdict[str, list[str]] = defaultdict(list)
                for word in words:
                    groups["".join(sorted(word))].append(word)
                return list(groups.values())

            def first_unique(text: str) -> int:
                counts = Counter(text)
                for index, char in enumerate(text):
                    if counts[char] == 1:
                        return index
                return -1
          `} />
        </SubSection>
        <SubSection title="Longest consecutive sequence">
          <P>Put values in a set; only expand from a value that has no predecessor. Each run is visited once overall.</P>
          <CodeBlock code={`
            def longest_consecutive(nums: list[int]) -> int:
                values = set(nums)
                best = 0
                for value in values:
                    if value - 1 not in values:
                        length = 1
                        while value + length in values:
                            length += 1
                        best = max(best, length)
                return best
          `} />
        </SubSection>
        <SubSection title="Subarray sum equals k">
          <P>Let <C>prefix</C> be the sum through the current position. A prior prefix of <C>prefix - k</C> identifies a subarray ending here with sum <C>k</C>. Store prefix-sum frequencies, beginning with the empty prefix.</P>
          <CodeBlock code={`
            def count_subarrays(nums: list[int], k: int) -> int:
                seen = {0: 1}
                prefix = answer = 0
                for value in nums:
                    prefix += value
                    answer += seen.get(prefix - k, 0)
                    seen[prefix] = seen.get(prefix, 0) + 1
                return answer
          `} />
        </SubSection>
      </Section>

      <Section title="Complexity and Pitfalls">
        <ComplexityTable rows={[
          { operation: <C>dict / set lookup, insert, delete</C>, time: "O(1)", note: "Average; worst-case O(n)" },
          { operation: <C>iterate all entries</C>, time: "O(n)", space: "O(1)" },
          { operation: <C>rehash / resize</C>, time: "O(n)", note: "Occasional; amortized insertion remains O(1)" },
          { operation: <C>group anagrams</C>, time: "O(w · m log m)", note: "w words, max length m" },
          { operation: <C>longest consecutive sequence</C>, time: "O(n)", note: "Expected with hashing" },
          { operation: <C>subarray sum count</C>, time: "O(n)", space: "O(n)" },
        ]} />
        <Callout type="warning" title="Do not mutate during iteration">Adding or removing keys from a dictionary while iterating over it raises <C>RuntimeError</C> or leads to incorrect logic. Iterate over a snapshot such as <C>list(d)</C> if mutation is required. Avoid defining custom equality without a compatible stable hash: equal objects must have equal hashes.</Callout>
        <ProsCons pros={["Fast expected lookup by key", "Expressive dict/set APIs in Python", "Excellent for counting, grouping and membership"]} cons={["Worst-case operations can degrade to O(n)", "Extra memory is used for sparse buckets and entries", "Keys must be immutable in hash-relevant ways"]} />
      </Section>

      <Section title="Practice Problems">
        <Practice problems={[
          { name: "Two Sum", difficulty: "Easy", hint: "Store previously seen values and indices." },
          { name: "Valid Anagram", difficulty: "Easy", hint: "Compare character-frequency maps." },
          { name: "Group Anagrams", difficulty: "Medium", hint: "Use a canonical signature as the key." },
          { name: "First Unique Character", difficulty: "Easy", hint: "Count first, then scan in original order." },
          { name: "Longest Consecutive Sequence", difficulty: "Medium", hint: "Start only at values without a predecessor." },
          { name: "Subarray Sum Equals K", difficulty: "Medium", hint: "Count prefix sums of current_sum - k." },
        ]} />
      </Section>
      <KeyTakeaways items={[
        <>Hashing maps a key to a bucket; collisions are expected and need resolution.</>,
        <>Dictionary and set operations are average <C>O(1)</C>, not guaranteed worst-case <C>O(1)</C>.</>,
        <>Hashable keys must keep equality and hash behavior stable while stored.</>,
        <>Prefix sums plus a frequency map solve many counting and subarray problems.</>,
      ]} />
    </article>
  );
}