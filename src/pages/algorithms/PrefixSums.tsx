import { ArrayViz, Callout, CodeBlock, Diagram, KeyTakeaways, P, PageHeader, Practice, Section, Strong, SubSection, Table } from "../../components/doc";

export default function PrefixSums() {
  return (
    <article>
      <PageHeader eyebrow="Core Algorithms" title="Prefix Sums" description="Precompute cumulative information so range queries and subarray conditions can be answered with constant-time arithmetic or a single pass." tags={["Range queries", "Hash maps", "2D inclusion-exclusion", "Difference arrays"]} />
      <Section title="One-Dimensional Prefix Sums"><P>Define prefix[i] as the sum of the first i values: prefix[0] = 0 and prefix[i + 1] = prefix[i] + nums[i]. Then the inclusive sum from left through right is prefix[right + 1] − prefix[left]. The zero sentinel removes special cases at index 0.</P><ArrayViz values={[3, -1, 4, 2, 5]} highlight={[1, 2, 3]} caption="For nums[1:4] = [−1, 4, 2], range sum is prefix[4] − prefix[1] = 5." /><CodeBlock code={`from itertools import accumulate

def build_prefix(nums: list[int]) -> list[int]:
    return [0, *accumulate(nums)]

nums = [3, -1, 4, 2, 5]
prefix = build_prefix(nums)
range_sum = prefix[4] - prefix[1]  # nums[1] through nums[3]`} /><P>Building the prefix array costs O(n); each subsequent range sum costs O(1). For static data and many queries, this is often the simplest range-query structure.</P></Section>
      <Section title="Subarray Sum Equals k"><P>A subarray from i through j sums to k when prefix[j + 1] − prefix[i] = k. At each prefix value, count earlier prefixes equal to current − k. Seed the map with 0:1 to count subarrays beginning at index 0.</P><CodeBlock code={`from collections import defaultdict

def subarray_sum(nums: list[int], k: int) -> int:
    seen: dict[int, int] = defaultdict(int)
    seen[0] = 1
    running = answer = 0
    for value in nums:
        running += value
        answer += seen[running - k]
        seen[running] += 1
    return answer`} /><Callout type="insight"><P>This hashmap method works with negative values as well as positives: unlike a sliding window, prefix differences do not require the sum to be monotone.</P></Callout></Section>
      <Section title="Prefix Counts and Divisibility"><SubSection title="Equal number of 0s and 1s"><P>Map 0 to −1 and 1 to +1. A contiguous range with equal numbers has sum zero, so repeated prefix balances delimit balanced subarrays. Store the earliest index to maximize length.</P><CodeBlock code={`def longest_balanced_binary(nums: list[int]) -> int:
    first = {0: -1}
    balance = best = 0
    for i, value in enumerate(nums):
        balance += 1 if value == 1 else -1
        if balance in first:
            best = max(best, i - first[balance])
        else:
            first[balance] = i
    return best`} /></SubSection><SubSection title="Subarray sums divisible by k"><P>Two prefix sums have equal remainder modulo k exactly when their difference is divisible by k. Count prior remainders, normalizing with Python’s modulo behavior for negative sums.</P><CodeBlock code={`from collections import defaultdict

def subarrays_div_by_k(nums: list[int], k: int) -> int:
    counts: dict[int, int] = defaultdict(int)
    counts[0] = 1
    running = answer = 0
    for value in nums:
        running += value
        remainder = running % k
        answer += counts[remainder]
        counts[remainder] += 1
    return answer`} /></SubSection><Callout type="warning"><P>When a problem asks for the longest range, store the first occurrence of a prefix state. When counting all ranges, store its frequency. These are different hashmap invariants.</P></Callout></Section>
      <Section title="Two-Dimensional Prefix Sums"><P>For a matrix, define prefix[r + 1][c + 1] as the sum of the rectangle from the origin through cell (r, c). Build with inclusion-exclusion: current cell + top + left − top-left. A rectangle [r1..r2] × [c1..c2] then needs four lookups.</P><Diagram caption="Subtract the strips above and left; add back their overlap, which was subtracted twice.">{`
+-----------------------+
|       A       |   B   |
|               |       |
|---------------+-------|  ← r1
|       C       |   X   |
|               | query |
+-----------------------+
                ↑ c1
X = prefix[r2+1][c2+1] - prefix[r1][c2+1]
    - prefix[r2+1][c1] + prefix[r1][c1]
`}</Diagram><CodeBlock code={`def build_2d_prefix(matrix: list[list[int]]) -> list[list[int]]:
    rows = len(matrix)
    cols = len(matrix[0]) if rows else 0
    prefix = [[0] * (cols + 1) for _ in range(rows + 1)]
    for r in range(rows):
        for c in range(cols):
            prefix[r + 1][c + 1] = (
                matrix[r][c] + prefix[r][c + 1] + prefix[r + 1][c]
                - prefix[r][c]
            )
    return prefix

def range_sum_2d(prefix: list[list[int]], r1: int, c1: int,
                 r2: int, c2: int) -> int:
    return (prefix[r2 + 1][c2 + 1] - prefix[r1][c2 + 1]
            - prefix[r2 + 1][c1] + prefix[r1][c1])`} /><P>Construction uses O(RC) time and memory; each rectangle query is O(1). The same idea works for summed weights, binary occupancy, and other additive cell values.</P></Section>
      <Section title="Difference Arrays for Range Updates"><P>If many operations add a value to every position in [left, right], update only the boundaries: diff[left] += value and diff[right + 1] −= value. A prefix scan reconstructs final values. This reverses the prefix-sum relationship: differences make range updates cheap.</P><CodeBlock code={`def apply_range_updates(n: int, updates: list[tuple[int, int, int]]) -> list[int]:
    diff = [0] * (n + 1)
    for left, right, value in updates:
        diff[left] += value
        diff[right + 1] -= value
    result: list[int] = []
    running = 0
    for change in diff[:n]:
        running += change
        result.append(running)
    return result

# Corporate flight bookings: [first, last, seats] uses 1-based inclusive input.
def booking_seats(n: int, bookings: list[tuple[int, int, int]]) -> list[int]:
    diff = [0] * (n + 1)
    for first, last, seats in bookings:
        diff[first - 1] += seats
        diff[last] -= seats
    for i in range(1, n):
        diff[i] += diff[i - 1]
    return diff[:n]`} /><P><Strong>Car pooling</Strong> is another difference-array sweep: add passenger count at pickup, subtract at drop-off, then scan occupancy and compare with capacity. If locations are sparse/large, sort events or coordinate-compress instead of allocating an enormous array.</P><CodeBlock code={`def car_pooling(trips: list[tuple[int, int, int]], capacity: int) -> bool:
    events: dict[int, int] = {}
    for passengers, start, end in trips:
        events[start] = events.get(start, 0) + passengers
        events[end] = events.get(end, 0) - passengers
    occupied = 0
    for location in sorted(events):
        occupied += events[location]
        if occupied > capacity:
            return False
    return True`} /><SubSection title="Two-dimensional difference array"><P>To add v to every cell in [r1..r2] × [c1..c2], mark four corners of a padded difference grid. A 2D prefix pass reconstructs all cell values.</P><CodeBlock code={`def add_rectangle(diff: list[list[int]], r1: int, c1: int,
                  r2: int, c2: int, value: int) -> None:
    diff[r1][c1] += value
    diff[r2 + 1][c1] -= value
    diff[r1][c2 + 1] -= value
    diff[r2 + 1][c2 + 1] += value

# Allocate (rows + 1) by (cols + 1), apply updates, then prefix-scan:
# for r: diff[r][c] += diff[r-1][c]
# for c: diff[r][c] += diff[r][c-1]
# for r,c > 0: diff[r][c] -= diff[r-1][c-1]`} /></SubSection></Section>
      <Section title="Prefix XOR and Products"><SubSection title="Prefix XOR"><P>XOR is its own inverse: xor(l..r) = prefix[r + 1] XOR prefix[l]. The same zero-sentinel convention applies because XOR with zero changes nothing.</P><CodeBlock code={`def xor_queries(nums: list[int], queries: list[tuple[int, int]]) -> list[int]:
    prefix = [0]
    for value in nums:
        prefix.append(prefix[-1] ^ value)
    return [prefix[right + 1] ^ prefix[left] for left, right in queries]`} /></SubSection><SubSection title="Product except self"><P>Products use prefix and suffix products rather than division, so zeros are handled naturally. Store the product to the left of each position, then multiply by a running product from the right.</P><CodeBlock code={`def product_except_self(nums: list[int]) -> list[int]:
    answer = [1] * len(nums)
    prefix = 1
    for i, value in enumerate(nums):
        answer[i] = prefix
        prefix *= value
    suffix = 1
    for i in range(len(nums) - 1, -1, -1):
        answer[i] *= suffix
        suffix *= nums[i]
    return answer`} /><P>The output array does not count as auxiliary space when the problem permits it; beyond output, this uses O(1) extra storage.</P></SubSection></Section>
      <Section title="Complexity Reference"><Table headers={["Technique", "Preprocessing / update", "Query / reconstruction", "Extra space"]} rows={[["1D prefix sum","O(n)","O(1) per range","O(n)"],["Prefix + hashmap count","O(n) expected","All counts in one pass","O(n)"],["2D prefix sum","O(RC)","O(1) per rectangle","O(RC)"],["1D difference array","O(u) updates","O(n) rebuild","O(n)"],["2D difference array","O(u) updates","O(RC) rebuild","O(RC)"],["Prefix XOR","O(n)","O(1) per query","O(n)"],["Prefix/suffix products","O(n)","One output pass","O(1) beyond output"]]} /><Callout type="tip"><P>For mutable data with interleaved updates and queries, a static prefix array becomes stale. Consider a Fenwick tree for point updates and range sums, or a segment tree for richer operations.</P></Callout></Section>
      <Section title="Practice Problems"><Practice problems={[{name:"Range Sum Query - Immutable",difficulty:"Easy",hint:"Use a zero-sentinel prefix array"},{name:"Subarray Sum Equals K",difficulty:"Medium",hint:"Count prior prefixes equal to current minus k"},{name:"Contiguous Array",difficulty:"Medium",hint:"Treat 0 as −1 and keep earliest balance"},{name:"Subarray Sums Divisible by K",difficulty:"Medium",hint:"Count matching prefix remainders"},{name:"Range Sum Query 2D - Immutable",difficulty:"Medium",hint:"Four-corner inclusion-exclusion"},{name:"Corporate Flight Bookings",difficulty:"Medium",hint:"Boundary changes then prefix accumulate"},{name:"Product of Array Except Self",difficulty:"Medium",hint:"Prefix and suffix products; no division"}]} /></Section>
      <KeyTakeaways items={[<>Prefix sums turn inclusive range sums into prefix[r + 1] − prefix[l].</>,<>Hash maps of previous prefix states count or maximize subarrays, even with negative values.</>,<>2D rectangle sums use inclusion-exclusion over four prefix corners.</>,<>Difference arrays make many range additions O(1) each, followed by one reconstruction scan.</>,<>The same cumulative idea works for XOR and products, with operation-specific inverses or directional passes.</>]} />
    </article>
  );
}