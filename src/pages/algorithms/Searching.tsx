import { BinarySearchVisualizer } from "../../components/visualizers";
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
  Section,
  Strong,
  SubSection,
  Table,
} from "../../components/doc";

export default function Searching() {
  return (
    <article>
      <PageHeader
        eyebrow="Core Algorithms"
        title="Searching"
        description="Searching ranges from a straightforward scan to logarithmic binary search and decision problems that hide a monotone boundary."
        tags={["Linear search", "Binary search", "Bounds", "Search on answer"]}
      />

      <Section title="Linear and Sentinel Search">
        <P>
          <Strong>Linear search</Strong> checks candidates one by one and works on any iterable, sorted or not. It
          takes <C>O(n)</C> time and <C>O(1)</C> extra space. A <Strong>sentinel search</Strong> temporarily places
          the target at the end so the loop can omit its bounds test; in high-level Python, the added mutation and
          restoration make it rarely worthwhile.
        </P>
        <ArrayViz values={[12, 5, 18, 7, 21, 4]} highlight={[3]} pointers={{ 3: "match" }} caption="A scan stops as soon as it reaches the target 7." />
        <CodeBlock title="linear_search.py" code={`
          def linear_search(values: list[int], target: int) -> int:
              for index, value in enumerate(values):
                  if value == target:
                      return index
              return -1

          def sentinel_search(values: list[int], target: int) -> int:
              """Return an index, preserving the input even if target is absent."""
              n = len(values)
              if n == 0:
                  return -1
              last = values[-1]
              values[-1] = target
              index = 0
              while values[index] != target:
                  index += 1
              values[-1] = last
              if index < n - 1 or last == target:
                  return index
              return -1
        `} />
        <Callout type="warning">
          Sentinel techniques that mutate the input need exception-safe restoration in production code. Prefer the
          simple bounded loop unless profiling shows the bounds check is a real bottleneck.
        </Callout>
      </Section>
      <Section title="Interactive Visualizer">
        <BinarySearchVisualizer />
      </Section>

      <Section title="Binary Search and Its Invariant">
        <P>
          Binary search applies to a <Strong>sorted range</Strong> or, more generally, a monotone yes/no predicate. At
          each step, compare the midpoint and discard the half that cannot contain the answer. The key is to write the
          invariant and interval convention before coding.
        </P>
        <ArrayViz values={[2, 5, 8, 12, 16, 23, 38]} highlight={[3]} dim={[0, 1, 2]} pointers={{ 3: "mid = 3", 6: "hi" }} caption="Search for 12: sorted order lets us discard everything left of the midpoint after a comparison." />
        <SubSection title="Exact match: closed interval [lo, hi]">
          <P>
            Maintain that if the target exists, it lies in <C>[lo, hi]</C>. When <C>lo &gt; hi</C>, the interval is
            empty and the target is absent. Use <C>mid = lo + (hi - lo) // 2</C>; on a mismatch, remove the midpoint
            with <C>mid - 1</C> or <C>mid + 1</C>.
          </P>
          <CodeBlock code={`
            def binary_search(values: list[int], target: int) -> int:
                lo, hi = 0, len(values) - 1
                while lo <= hi:
                    mid = lo + (hi - lo) // 2
                    if values[mid] == target:
                        return mid
                    if values[mid] < target:
                        lo = mid + 1
                    else:
                        hi = mid - 1
                return -1

            def binary_search_recursive(values: list[int], target: int) -> int:
                def search(lo: int, hi: int) -> int:
                    if lo > hi:
                        return -1
                    mid = lo + (hi - lo) // 2
                    if values[mid] == target:
                        return mid
                    if values[mid] < target:
                        return search(mid + 1, hi)
                    return search(lo, mid - 1)
                return search(0, len(values) - 1)
          `} />
        </SubSection>
        <Callout type="warning" title="Common off-by-one mistakes">
          <List items={[
            <>For a closed interval, loop on <C>lo &lt;= hi</C> and exclude the checked midpoint with <C>mid ± 1</C>.</>,
            <>For a half-open interval <C>[lo, hi)</C>, loop on <C>lo &lt; hi</C>; the initial right boundary is <C>len(values)</C>.</>,
            <>Do not mix the closed and half-open updates. A loop can stall if a boundary fails to move.</>,
            <>Duplicates mean an arbitrary exact match is not necessarily the first or last occurrence.</>,
          ]} />
        </Callout>
      </Section>

      <Section title="Lower Bound, Upper Bound, and bisect">
        <P>
          Many problems want a boundary, not an arbitrary match. <C>lower_bound</C> returns the first index whose
          value is at least the target; <C>upper_bound</C> returns the first index whose value is greater. Each is a
          binary search for the first true value of a monotone predicate.
        </P>
        <Diagram caption="For [1, 2, 2, 2, 5], lower_bound(2) points to the first 2; upper_bound(2) points after the last 2.">{`
             index:        0  1  2  3  4
             values:      [1, 2, 2, 2, 5]
                             ^        ^
                         lower_bound upper_bound
        `}</Diagram>
        <CodeBlock code={`
          def lower_bound(values: list[int], target: int) -> int:
              lo, hi = 0, len(values)
              while lo < hi:
                  mid = (lo + hi) // 2
                  if values[mid] < target:
                      lo = mid + 1
                  else:
                      hi = mid
              return lo

          def upper_bound(values: list[int], target: int) -> int:
              lo, hi = 0, len(values)
              while lo < hi:
                  mid = (lo + hi) // 2
                  if values[mid] <= target:
                      lo = mid + 1
                  else:
                      hi = mid
              return lo

          from bisect import bisect_left, bisect_right, insort
          values = [1, 2, 2, 2, 5]
          left = bisect_left(values, 2)      # 1
          right = bisect_right(values, 2)    # 4
          count = right - left               # 3 matches
          insort(values, 3)                  # keeps the list sorted; insertion itself is O(n)
        `} />
        <P>
          Python's <C>bisect_left</C> and <C>bisect_right</C> implement these boundaries. <C>insort</C> locates a
          position in <C>O(log n)</C>, but inserting into a list still shifts items and costs <C>O(n)</C>.
        </P>
      </Section>

      <Section title="Boundary Applications">
        <SubSection title="First / last occurrence and insertion position">
          <P>
            In a sorted list, the first occurrence is <C>lower_bound(target)</C>. If it is in range and equals target,
            the last occurrence is <C>upper_bound(target) - 1</C>. The search-insert position is simply the lower bound,
            whether or not the target is already present.
          </P>
        </SubSection>
        <SubSection title="First true in a monotone predicate">
          <P>
            If a predicate is false before a boundary and true afterward, use half-open binary search: test the midpoint,
            move <C>hi</C> left on true, otherwise move <C>lo</C> right. The result may be <C>n</C> when no value is
            true, so callers should define that sentinel case.
          </P>
        </SubSection>
      </Section>

      <Section title="Search in Rotated Arrays and Peaks">
        <SubSection title="Search in a rotated sorted array">
          <P>
            With distinct values, at least one side of the midpoint is sorted. Identify that side and decide whether the
            target lies inside its value range; otherwise search the other side. Duplicates can hide which side is
            strictly sorted and may degrade the worst case to <C>O(n)</C>.
          </P>
          <CodeBlock code={`
            def search_rotated(nums: list[int], target: int) -> int:
                lo, hi = 0, len(nums) - 1
                while lo <= hi:
                    mid = (lo + hi) // 2
                    if nums[mid] == target:
                        return mid
                    if nums[lo] <= nums[mid]:  # left half sorted
                        if nums[lo] <= target < nums[mid]:
                            hi = mid - 1
                        else:
                            lo = mid + 1
                    else:  # right half sorted
                        if nums[mid] < target <= nums[hi]:
                            lo = mid + 1
                        else:
                            hi = mid - 1
                return -1

            def minimum_rotated(nums: list[int]) -> int:
                lo, hi = 0, len(nums) - 1
                while lo < hi:
                    mid = (lo + hi) // 2
                    if nums[mid] > nums[hi]:
                        lo = mid + 1
                    else:
                        hi = mid
                return nums[lo]
          `} />
        </SubSection>
        <SubSection title="Peak element">
          <P>
            For an array with virtual boundaries lower than every value, compare <C>nums[mid]</C> with its right
            neighbor. If it rises, a peak exists to the right; otherwise a peak exists at or to the left. This finds
            one peak in <C>O(log n)</C> without requiring the array to be sorted.
          </P>
          <CodeBlock code={`
            def find_peak(nums: list[int]) -> int:
                lo, hi = 0, len(nums) - 1
                while lo < hi:
                    mid = (lo + hi) // 2
                    if nums[mid] < nums[mid + 1]:
                        lo = mid + 1
                    else:
                        hi = mid
                return lo
          `} />
        </SubSection>
      </Section>

      <Section title="Matrix and Answer-Space Search">
        <SubSection title="Search a sorted 2D matrix">
          <P>
            If each row is sorted and the first element of each row exceeds the prior row's last element, flatten the
            matrix conceptually into length <C>rows × cols</C>; index <C>i</C> maps to <C>(i // cols, i % cols)</C>.
            If only rows and columns are individually sorted, start at the top-right corner and eliminate one row or
            column per step instead.
          </P>
        </SubSection>
          <CodeBlock title="search_matrix.py" code={`
            def search_matrix(matrix: list[list[int]], target: int) -> bool:
                if not matrix or not matrix[0]:
                    return False
                rows, cols = len(matrix), len(matrix[0])
                lo, hi = 0, rows * cols
                while lo < hi:
                    mid = (lo + hi) // 2
                    value = matrix[mid // cols][mid % cols]
                    if value < target:
                        lo = mid + 1
                    else:
                        hi = mid
                return lo < rows * cols and matrix[lo // cols][lo % cols] == target
          `} />        <SubSection title="Binary search on the answer">
          <P>
            A feasibility test often changes monotonically as a candidate answer increases. Find the smallest feasible
            value (or largest feasible value) by binary search, even when the answer is not an array index.
          </P>
          <CodeBlock title="answer_search.py" code={`
            def min_eating_speed(piles: list[int], hours: int) -> int:
                lo, hi = 1, max(piles)
                while lo < hi:
                    speed = (lo + hi) // 2
                    needed = sum((pile + speed - 1) // speed for pile in piles)
                    if needed <= hours:
                        hi = speed
                    else:
                        lo = speed + 1
                return lo

            def min_ship_capacity(weights: list[int], days: int) -> int:
                def can_ship(capacity: int) -> bool:
                    used_days, load = 1, 0
                    for weight in weights:
                        if load + weight > capacity:
                            used_days += 1
                            load = 0
                        load += weight
                    return used_days <= days

                lo, hi = max(weights), sum(weights)
                while lo < hi:
                    mid = (lo + hi) // 2
                    if can_ship(mid):
                        hi = mid
                    else:
                        lo = mid + 1
                return lo

            def integer_sqrt(x: int) -> int:
                if x < 2:
                    return x
                lo, hi = 1, x // 2 + 1
                while lo < hi:
                    mid = (lo + hi + 1) // 2
                    if mid * mid <= x:
                        lo = mid
                    else:
                        hi = mid - 1
                return lo
          `} />
          <Callout type="insight" title="Design the predicate first">
            Write down what “feasible(answer)” means and prove monotonicity before searching. Then choose whether to
            find the first feasible or last feasible boundary and ensure the interval includes the true answer.
          </Callout>
        </SubSection>
        <SubSection title="Floating-point binary search">
          <P>
            For a real-valued answer, stop after a fixed number of iterations or when the interval width is below
            <C>epsilon</C>. Floating-point rounding makes exact equality tests unreliable; prefer a tolerance-based
            condition. A fixed iteration count gives a predictable precision improvement per step.
          </P>
        </SubSection>
      </Section>

      <Section title="Other Search Strategies">
        <List items={[
          <><Strong>Ternary search:</Strong> for a unimodal function, compare two interior points and discard one third. It is useful for optimizing a convex/concave objective but requires the unimodality assumption.</>,
          <><Strong>Exponential search:</Strong> double a bound until it brackets the target, then binary-search that interval. Useful for unbounded or very large sorted ranges; takes <C>O(log p)</C> for answer position p.</>,
          <><Strong>Interpolation search:</Strong> estimate a position from target values, working well on uniformly distributed sorted numeric data. Its expected time can be <C>O(log log n)</C>, but worst case is <C>O(n)</C>.</>,
          <><Strong>Jump search:</Strong> scan sorted blocks of size about <C>√n</C>, then linearly search the candidate block; time is <C>O(√n)</C> and it can be useful when jumps are costly.</>,
        ]} />
        <CodeBlock title="exponential_search.py" code={`
          def exponential_search(values: list[int], target: int) -> int:
              if not values:
                  return -1
              if values[0] == target:
                  return 0
              bound = 1
              while bound < len(values) and values[bound] < target:
                  bound *= 2
              lo, hi = bound // 2, min(bound, len(values) - 1)
              while lo <= hi:
                  mid = (lo + hi) // 2
                  if values[mid] == target:
                      return mid
                  if values[mid] < target:
                      lo = mid + 1
                  else:
                      hi = mid - 1
              return -1
        `} />
      </Section>

      <Section title="Complexity and Practice">
        <Table headers={["Method", "Precondition", "Time", "Extra space"]} rows={[
          ["Linear", "Any sequence", <C>O(n)</C>, <C>O(1)</C>],
          ["Binary exact match", "Sorted / monotone", <C>O(log n)</C>, <><C>O(1)</C> iterative</>],
          ["Lower / upper bound", "Sorted sequence", <C>O(log n)</C>, <C>O(1)</C>],
          ["Rotated sorted search", "One rotation; distinct values", <C>O(log n)</C>, <C>O(1)</C>],
          ["Search answer", "Monotone feasibility", <C>O(log range × check)</C>, <><C>O(1)</C> excluding check</>],
          ["Ternary", "Unimodal objective", <C>O(log range)</C>, <C>O(1)</C>],
          ["Exponential", "Sorted, target position p", <C>O(log p)</C>, <C>O(1)</C>],
          ["Interpolation", "Sorted, near-uniform numeric values", <><C>O(log log n)</C> expected; O(n) worst</>, <C>O(1)</C>],
          ["Jump", "Sorted sequence", <C>O(√n)</C>, <C>O(1)</C>],
        ]} />
        <ComplexityTable rows={[
          { operation: <C>linear search</C>, time: "O(n)", space: "O(1)" },
          { operation: <C>binary search</C>, time: "O(log n)", space: "O(1)", note: "Iterative" },
          { operation: <C>recursive binary search</C>, time: "O(log n)", space: "O(log n)", note: "Call stack" },
        ]} />
        <Practice problems={[
          { name: "Binary Search", difficulty: "Easy", hint: "Choose and maintain a consistent interval invariant." },
          { name: "Find First and Last Position", difficulty: "Medium", hint: "Use lower_bound and upper_bound boundaries." },
          { name: "Search in Rotated Sorted Array", difficulty: "Medium", hint: "At least one side of the midpoint is sorted." },
          { name: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", hint: "Compare the midpoint against the right endpoint." },
          { name: "Koko Eating Bananas", difficulty: "Medium", hint: "Binary search the speed using hours as a feasibility test." },
          { name: "Capacity to Ship Packages", difficulty: "Medium", hint: "Greedy-check whether a capacity fits within the day limit." },
          { name: "Median of Two Sorted Arrays", difficulty: "Hard", hint: "Binary-search a partition in the shorter input." },
        ]} />
      </Section>

      <KeyTakeaways items={[
        <>Binary search requires sorted order or a monotone predicate—not merely a desire for <C>O(log n)</C>.</>,
        <>State the invariant and whether the interval is closed or half-open before choosing updates.</>,
        <>Lower and upper bounds solve duplicate ranges and insertion positions cleanly.</>,
        <>Search-on-answer turns optimization into feasibility plus a monotone boundary search.</>,
        <>Linear, jump, interpolation, exponential, and ternary search each have specific assumptions and use cases.</>,
      ]} />
    </article>
  );
}