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

export default function Randomized() {
  return (
    <article>
      <PageHeader
        eyebrow="Core Algorithms"
        title="Randomized Algorithms"
        description="Use controlled randomness to simplify algorithms, avoid adversarial inputs, sample streams, and estimate properties when exact computation is costly."
        tags={["Probability", "Sampling", "Expected time", "Sketches"]}
      />

      <Section title="Why Randomize?">
        <P>
          A randomized algorithm makes random choices as part of its execution. A <Strong>Las Vegas</Strong> algorithm
          always returns the correct answer, while its running time is random (randomized quicksort is a classic
          example). A <Strong>Monte Carlo</Strong> algorithm has a predictable resource bound but may return an
          incorrect answer with a bounded probability (Miller–Rabin is a familiar example).
        </P>
        <Table
          headers={["Type", "Correctness", "Resource usage", "Example"]}
          rows={[
            ["Las Vegas", "Always correct", "Random runtime", "Randomized quicksort / quickselect"],
            ["Monte Carlo", "Small error probability", "Usually bounded runtime", "Primality testing, estimating π"],
          ]}
        />
        <Callout type="insight" title="Reproducibility">
          Set <C>random.seed(value)</C> before randomized examples and tests to make a run repeatable. A fixed seed
          is useful for debugging, but production code should not use predictable randomness for security-sensitive
          tasks; use <C>secrets</C> or an operating-system cryptographic source instead.
        </Callout>
      </Section>

      <Section title="Python Randomness & Shuffling">
        <P>
          The <C>random</C> module uses a deterministic pseudorandom generator. <C>randint(a, b)</C> includes both
          endpoints; <C>random()</C> returns a float in <C>[0, 1)</C>; <C>choice</C> picks one element;
          <C>sample</C> selects without replacement; and <C>shuffle</C> permutes a list in place.
        </P>
        <SubSection title="Fisher–Yates shuffle">
          <P>
            Iterate backward and swap each position with a uniformly selected position at or before it. Every
            permutation has the same probability, and the algorithm uses constant extra space.
          </P>
          <Diagram caption="At step i, choose j uniformly from 0 through i, then freeze position i.">{`
            [a, b, c, d, e]
                      ^ i=4: swap with random j in [0,4]
                ^ i=2: swap with random j in [0,2]
          `}</Diagram>
          <CodeBlock
            title="random_and_shuffle.py"
            code={`
              import random

              random.seed(7)
              values = [1, 2, 3, 4, 5]
              random.shuffle(values)
              print(random.randint(1, 6), round(random.random(), 3))
              print(random.choice(values), random.sample(values, 2))
              print(values)
            `}
          />
          <CodeBlock
            title="fisher_yates.py"
            code={`
              import random

              def fisher_yates(items: list[int]) -> None:
                  for i in range(len(items) - 1, 0, -1):
                      j = random.randrange(i + 1)
                      items[i], items[j] = items[j], items[i]

              random.seed(10)
              data = [1, 2, 3, 4, 5]
              fisher_yates(data)
              print(data)
            `}
          />
        </SubSection>
      </Section>

      <Section title="Reservoir Sampling">
        <P>
          Reservoir sampling selects <C>k</C> items uniformly from a stream of unknown length using only
          <C>O(k)</C> storage. Keep the first <C>k</C>; for the item at zero-based position <C>i ≥ k</C>, choose a
          random integer from <C>0</C> through <C>i</C> and replace a reservoir slot only if the draw is below
          <C>k</C>. Each seen item then has probability <C>k / n</C> of surviving in the final sample.
        </P>
        <CodeBlock
          title="reservoir_sample.py"
          code={`
            import random

            def reservoir_sample(stream: list[int], k: int) -> list[int]:
                if k < 0:
                    raise ValueError("k must be nonnegative")
                reservoir = []
                for i, item in enumerate(stream):
                    if i < k:
                        reservoir.append(item)
                    else:
                        j = random.randrange(i + 1)
                        if j < k:
                            reservoir[j] = item
                if len(reservoir) < k:
                    raise ValueError("stream shorter than k")
                return reservoir

            random.seed(23)
            print(len(reservoir_sample(list(range(100)), 5)))
          `}
          output="5"
        />
        <Callout type="note">
          The stream must be processed once; the algorithm does not need to know its final length. For a single
          uniformly random item, this is <C>k = 1</C>.
        </Callout>
      </Section>

      <Section title="Randomized Quicksort & Quickselect">
        <P>
          Pick a pivot uniformly at random, partition around it, and recurse. Quicksort has expected
          <C>O(n log n)</C> time because random pivots tend to split the data reasonably; its worst case remains
          <C>O(n²)</C>, but a fixed adversarial input is much less likely to trigger it. Randomized quickselect follows
          only the side containing the requested rank, giving expected <C>O(n)</C> selection time and worst-case
          <C>O(n²)</C>.
        </P>
        <CodeBlock
          title="randomized_quickselect.py"
          code={`
            import random

            def quickselect(values: list[int], k: int) -> int:
                if not 0 <= k < len(values):
                    raise IndexError("rank out of range")
                left, right = 0, len(values) - 1
                while left <= right:
                    pivot = values[random.randint(left, right)]
                    lo, i, hi = left, left, right
                    while i <= hi:
                        if values[i] < pivot:
                            values[lo], values[i] = values[i], values[lo]
                            lo += 1
                            i += 1
                        elif values[i] > pivot:
                            values[i], values[hi] = values[hi], values[i]
                            hi -= 1
                        else:
                            i += 1
                    if k < lo:
                        right = lo - 1
                    elif k > hi:
                        left = hi + 1
                    else:
                        return pivot
                raise RuntimeError("unreachable")

            random.seed(5)
            nums = [7, 2, 9, 4, 1, 8, 3]
            print(quickselect(nums, 3))
          `}
          output="4"
        />
                  <CodeBlock
            title="randomized_quicksort.py"
            code={`
              import random

              def randomized_quicksort(values: list[int]) -> list[int]:
                  result = values[:]

                  def sort(left: int, right: int) -> None:
                      if left >= right:
                          return
                      pivot = result[random.randrange(left, right + 1)]
                      low, current, high = left, left, right
                      while current <= high:
                          if result[current] < pivot:
                              result[low], result[current] = result[current], result[low]
                              low += 1
                              current += 1
                          elif result[current] > pivot:
                              result[current], result[high] = result[high], result[current]
                              high -= 1
                          else:
                              current += 1
                      sort(left, low - 1)
                      sort(high + 1, right)

                  sort(0, len(result) - 1)
                  return result

              random.seed(8)
              print(randomized_quicksort([5, 1, 4, 2, 3, 2]))
            `}
            output="[1, 2, 2, 3, 4, 5]"
          /><P>
          Randomized quicksort uses the same random pivot plus recursive sorts of the lower and upper partitions.
          Duplicate-heavy data benefits from three-way partitioning. Randomization improves expected behavior, but
          iterative partitioning, a depth limit, or introsort can provide stronger worst-case guarantees.
        </P>
        <Callout type="warning" title="Do not confuse average and worst case">
          “Expected <C>O(n log n)</C>” is an expectation over the algorithm's random choices. It is not a promise that
          every execution takes that long, and quicksort still has quadratic worst-case behavior.
        </Callout>
      </Section>

      <Section title="Miller–Rabin Primality Testing">
        <P>
          Miller–Rabin tests whether an odd number is a strong probable prime. Write <C>n - 1 = d × 2ˢ</C> with
          <C>d</C> odd; each witness base can prove compositeness. Passing a random base means “probably prime,” and
          independent rounds reduce the error probability exponentially. For unsigned 64-bit integers, the fixed
          bases below make the test deterministic.
        </P>
        <CodeBlock
          title="miller_rabin_64.py"
          code={`
            def is_prime_64(n: int) -> bool:
                if n < 2:
                    return False
                small = (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37)
                if n in small:
                    return True
                if any(n % p == 0 for p in small):
                    return False
                d, s = n - 1, 0
                while d % 2 == 0:
                    d //= 2
                    s += 1
                for base in (2, 325, 9375, 28178, 450775, 9780504, 1795265022):
                    a = base % n
                    if a == 0:
                        continue
                    x = pow(a, d, n)
                    if x in (1, n - 1):
                        continue
                    for _ in range(s - 1):
                        x = x * x % n
                        if x == n - 1:
                            break
                    else:
                        return False
                return True

            print(is_prime_64(97), is_prime_64(91))
          `}
          output="True False"
        />
        <Callout type="note">
          The listed deterministic bases are valid for the 64-bit range. For arbitrary-size integers, use a
          well-tested library or randomized bases with a stated error bound.
        </Callout>
      </Section>

      <Section title="Monte Carlo Estimation of π">
        <P>
          Sample points uniformly from the unit square <C>[0, 1) × [0, 1)</C>. A point lies inside the quarter-circle
          when <C>x² + y² ≤ 1</C>. The fraction inside approaches <C>π / 4</C>, so four times that fraction estimates
          π. Sampling error shrinks roughly as <C>1 / √N</C>, making each extra decimal digit increasingly expensive.
        </P>
        <CodeBlock
          title="estimate_pi.py"
          code={`
            import random

            def estimate_pi(samples: int) -> float:
                inside = 0
                for _ in range(samples):
                    x, y = random.random(), random.random()
                    inside += x * x + y * y <= 1
                return 4 * inside / samples

            random.seed(19)
            print(estimate_pi(10000))
          `}
        />
      </Section>

      <Section title="Randomized Hashing & Bloom Filters">
        <SubSection title="Universal hashing and hash flooding">
          <P>
            A universal family chooses a hash function randomly so that any fixed pair of distinct keys collides
            with low probability, often at most <C>1 / m</C> for <C>m</C> buckets. Randomizing the function makes it
            harder for an attacker to prepare many colliding keys (hash flooding). Hashes for passwords or security
            tokens are a different problem: use a cryptographic password-hashing function or cryptographically secure
            randomness, not Python's <C>random</C> module.
          </P>
          <CodeBlock
            title="universal_hash.py"
            code={`
              import random

              class UniversalHash:
                  def __init__(self, buckets: int, prime: int = 101):
                      self.buckets = buckets
                      self.prime = prime
                      self.a = random.randrange(1, prime)
                      self.b = random.randrange(prime)

                  def __call__(self, key: int) -> int:
                      return ((self.a * key + self.b) % self.prime) % self.buckets

              random.seed(4)
              h = UniversalHash(10)
              print([h(key) for key in (1, 2, 3)])
            `}
          />
        </SubSection>
        <SubSection title="Bloom filter">
          <P>
            A Bloom filter is a bit array plus <C>k</C> hash functions. Insert sets those bits; query returns
            “definitely absent” if any bit is zero, otherwise “possibly present.” False positives are possible;
            false negatives are not (unless the structure is modified incorrectly). With <C>m</C> bits and
            <C>n</C> inserted keys, the approximate false-positive rate is <C>(1 - e^(-kn/m))^k</C>. The optimal
            number of hashes is approximately <C>(m/n) ln 2</C>.
          </P>
          <CodeBlock
            title="bloom_filter.py"
            code={`
              import hashlib
              import math

              class BloomFilter:
                  def __init__(self, bit_count: int, hashes: int):
                      self.bit_count = bit_count
                      self.hashes = hashes
                      self.bits = bytearray((bit_count + 7) // 8)

                  def positions(self, item: str):
                      digest = hashlib.sha256(item.encode()).digest()
                      first = int.from_bytes(digest[:16], "big")
                      second = int.from_bytes(digest[16:], "big") | 1
                      for i in range(self.hashes):
                          yield (first + i * second) % self.bit_count

                  def add(self, item: str) -> None:
                      for position in self.positions(item):
                          self.bits[position // 8] |= 1 << (position % 8)

                  def might_contain(self, item: str) -> bool:
                      return all(self.bits[p // 8] & (1 << (p % 8))
                                 for p in self.positions(item))

              def false_positive_rate(bits: int, items: int, hashes: int) -> float:
                  return (1 - math.exp(-hashes * items / bits)) ** hashes

              bloom = BloomFilter(1000, 4)
              bloom.add("pear")
              print(bloom.might_contain("pear"), bloom.might_contain("plum"))
            `}
            output="True False"
          />
        </SubSection>
      </Section>

      <Section title="Streaming Sketches">
        <SubSection title="Count-Min Sketch">
          <P>
            Count-Min Sketch estimates item frequencies with a <C>d × w</C> counter table and one hash per row.
            Updates increment one counter in each row; a query returns the minimum of those counters. It never
            underestimates (for nonnegative updates), but collisions can overestimate. Typical parameters use
            width about <C>e / ε</C> and depth about <C>ln(1 / δ)</C> for additive error <C>εN</C> with probability
            at least <C>1 - δ</C>.
          </P>
          <CodeBlock
            title="count_min_sketch.py"
            code={`
              import hashlib

              class CountMinSketch:
                  def __init__(self, width: int, depth: int):
                      self.width = width
                      self.table = [[0] * width for _ in range(depth)]

                  def index(self, item: str, row: int) -> int:
                      data = f"{row}:{item}".encode()
                      return int.from_bytes(hashlib.sha256(data).digest()[:8], "big") % self.width

                  def add(self, item: str, count: int = 1) -> None:
                      for row in range(len(self.table)):
                          self.table[row][self.index(item, row)] += count

                  def estimate(self, item: str) -> int:
                      return min(self.table[row][self.index(item, row)]
                                 for row in range(len(self.table)))

              sketch = CountMinSketch(width=100, depth=5)
              for word in ["cat", "dog", "cat", "bird", "cat"]:
                  sketch.add(word)
              print(sketch.estimate("cat"))
            `}
            output="3"
          />
        </SubSection>
        <SubSection title="HyperLogLog intuition">
          <P>
            HyperLogLog estimates distinct-item cardinality by hashing items into registers and recording the longest
            leading-zero pattern in each register's remaining hash bits. Rare long runs indicate a large universe of
            observed hashes. With <C>m</C> registers, relative standard error is approximately
            <C>1.04 / √m</C>; practical implementations include small-cardinality corrections and careful hashing.
          </P>
          <CodeBlock
            title="small_hyperloglog.py"
            code={`
              import hashlib
              import math

              class TinyHyperLogLog:
                  def __init__(self, precision: int = 4):
                      self.p = precision
                      self.m = 1 << precision
                      self.registers = [0] * self.m

                  def add(self, item: str) -> None:
                      value = int.from_bytes(hashlib.sha256(item.encode()).digest()[:8], "big")
                      index = value >> (64 - self.p)
                      remainder = value & ((1 << (64 - self.p)) - 1)
                      width = 64 - self.p
                      rank = width + 1 if remainder == 0 else width - remainder.bit_length() + 1
                      self.registers[index] = max(self.registers[index], rank)

                  def estimate(self) -> float:
                      alpha = 0.7213 / (1 + 1.079 / self.m)
                      raw = alpha * self.m * self.m / sum(2.0 ** -r for r in self.registers)
                      zeros = self.registers.count(0)
                      if raw <= 2.5 * self.m and zeros:
                          return self.m * math.log(self.m / zeros)
                      return raw

              counter = TinyHyperLogLog(precision=4)
              for value in range(100):
                  counter.add(str(value))
              print(len(counter.registers), round(counter.estimate()))
            `}
          />
        </SubSection>
        <SubSection title="MinHash intuition">
          <P>
            MinHash summarizes a set of shingles by taking the minimum hash value under each of several independent
            hash functions. The fraction of corresponding signature positions that agree estimates Jaccard
            similarity <C>|A ∩ B| / |A ∪ B|</C>. It is useful for near-duplicate detection and approximate nearest
            neighbors; more signature rows improve accuracy at additional storage cost.
          </P>
          <CodeBlock
            title="minhash_similarity.py"
            code={`
              import hashlib

              def signature(tokens: set[str], count: int) -> list[int]:
                  result = []
                  for seed in range(count):
                      hashes = [int.from_bytes(hashlib.sha256(
                          f"{seed}:{token}".encode()).digest()[:8], "big")
                                for token in tokens]
                      result.append(min(hashes) if hashes else 0)
                  return result

              left = signature({"red", "blue", "green"}, 64)
              right = signature({"red", "blue", "yellow"}, 64)
              agreement = sum(a == b for a, b in zip(left, right)) / len(left)
              print(round(agreement, 2))
            `}
          />
        </SubSection>
      </Section>

      <Section title="Skip Lists">
        <P>
          A skip list layers linked lists: each higher level skips over more nodes. Search moves right while the next
          key is smaller, then descends a level. Random tower heights make expected search, insertion, and deletion
          <C>O(log n)</C>, while worst-case performance is <C>O(n)</C>. The random height distribution is commonly
          geometric, promoting each node with probability one half.
        </P>
        <CodeBlock
          title="skip_list.py"
          code={`
            import random

            class Node:
                def __init__(self, key: int, level: int):
                    self.key = key
                    self.forward = [None] * (level + 1)

            class SkipList:
                def __init__(self, max_level: int = 8, probability: float = 0.5):
                    self.max_level = max_level
                    self.probability = probability
                    self.head = Node(float("-inf"), max_level)
                    self.level = 0

                def random_level(self) -> int:
                    level = 0
                    while level < self.max_level and random.random() < self.probability:
                        level += 1
                    return level

                def search(self, key: int) -> bool:
                    current = self.head
                    for level in range(self.level, -1, -1):
                        while current.forward[level] and current.forward[level].key < key:
                            current = current.forward[level]
                    current = current.forward[0]
                    return current is not None and current.key == key

                def insert(self, key: int) -> None:
                    update = [None] * (self.max_level + 1)
                    current = self.head
                    for level in range(self.level, -1, -1):
                        while current.forward[level] and current.forward[level].key < key:
                            current = current.forward[level]
                        update[level] = current
                    current = current.forward[0]
                    if current and current.key == key:
                        return
                    new_level = self.random_level()
                    if new_level > self.level:
                        for level in range(self.level + 1, new_level + 1):
                            update[level] = self.head
                        self.level = new_level
                    node = Node(key, new_level)
                    for level in range(new_level + 1):
                        node.forward[level] = update[level].forward[level]
                        update[level].forward[level] = node

            random.seed(12)
            skip = SkipList()
            for value in [3, 1, 4, 2]:
                skip.insert(value)
            print(skip.search(3), skip.search(5))
          `}
          output="True False"
        />
      </Section>

      <Section title="Probabilistic Structures & Complexity">
        <Table
          headers={["Structure", "Space", "Answer / error type", "Typical use"]}
          rows={[
            ["Bloom filter", "m bits", "May say present for absent key; no false negatives", "Membership pre-checks"],
            ["Count-Min Sketch", "d × w counters", "Frequency never underestimated; may overestimate", "Heavy hitters / stream counts"],
            ["HyperLogLog", "m small registers", "Approximate cardinality; relative error ≈ 1.04 / √m", "Distinct counts at scale"],
            ["MinHash", "k hash values per set", "Approximate Jaccard similarity", "Near-duplicate detection"],
            ["Skip list", "O(n) nodes, expected levels", "Exact ordered-set operations; runtime is randomized", "Sorted maps and sets"],
          ]}
        />
        <ComplexityTable
          rows={[
            { operation: "Fisher–Yates shuffle", time: "O(n)", space: "O(1)" },
            { operation: "Reservoir sample", time: "O(n)", space: "O(k)" },
            { operation: "Randomized quicksort", time: "O(n log n) expected", space: "O(log n) expected", note: "O(n²) worst case" },
            { operation: "Randomized quickselect", time: "O(n) expected", space: "O(1) auxiliary", note: "O(n²) worst case" },
            { operation: "Bloom filter add / query", time: "O(k)", space: "O(m) bits" },
            { operation: "Count-Min update / query", time: "O(d)", space: "O(d × w)" },
            { operation: "HyperLogLog update / estimate", time: "O(1) / O(m)", space: "O(m)" },
            { operation: "Skip list search / insert", time: "O(log n) expected", space: "O(n) expected" },
          ]}
        />
        <ProsCons
          pros={["Random pivots resist fixed adversarial input orders", "Sampling handles streams without storing every item", "Sketches trade exactness for compact memory and fast updates"]}
          cons={["Expected performance is not a worst-case guarantee", "Probabilistic structures require explicit error budgets", "Unseeded randomness complicates reproducibility and testing"]}
        />
      </Section>

      <Section title="Pitfalls & Practice">
        <Callout type="warning" title="Randomness checklist">
          Seed non-security examples when displaying random output; never use <C>random</C> for secrets; distinguish
          expected from worst-case complexity; state the error guarantee of approximate structures; ensure a sample
          handles streams shorter than <C>k</C>; and do not claim a Bloom filter can prove membership.
        </Callout>
        <Practice
          problems={[
            { name: "Shuffle an Array", difficulty: "Medium", hint: "Use Fisher–Yates with a uniform index" },
            { name: "Linked List Random Node", difficulty: "Medium", hint: "Reservoir sampling with k = 1" },
            { name: "Kth Largest Element in an Array", difficulty: "Medium", hint: "Randomized quickselect" },
            { name: "Find a Prime", difficulty: "Medium", hint: "Use Miller–Rabin witnesses and state the range" },
            { name: "Estimate π", difficulty: "Easy", hint: "Compare random points to the unit quarter-circle" },
            { name: "Design a Bloom Filter", difficulty: "Medium", hint: "Choose m and k from n and a target false-positive rate" },
            { name: "Count Frequent Stream Items", difficulty: "Hard", hint: "Use Count-Min Sketch and interpret overestimation" },
            { name: "Approximate Distinct Count", difficulty: "Hard", hint: "Hash items into HyperLogLog registers" },
          ]}
        />
      </Section>

      <KeyTakeaways
        items={[
          <>Las Vegas algorithms are always correct; Monte Carlo algorithms trade a bounded error chance for speed.</>,
          <>Fisher–Yates gives a uniform permutation; reservoir sampling gives a uniform sample from an unknown stream.</>,
          <>Random pivots yield expected linear quickselect and expected <C>O(n log n)</C> quicksort behavior.</>,
          <>Bloom filters, Count-Min Sketch, HyperLogLog, and MinHash answer different approximate questions.</>,
          <>Use deterministic seeds for reproducible demos and cryptographic randomness for security-sensitive work.</>,
        ]}
      />
    </article>
  );
}