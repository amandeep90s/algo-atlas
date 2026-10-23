import { Callout, CodeBlock, KeyTakeaways, P, PageHeader, Practice, Section, Steps, SubSection, Table } from "../../components/doc";

export default function DivideAndConquer() {
  return (
    <article>
      <PageHeader eyebrow="Core Algorithms" title="Divide and Conquer" description="Solve a problem by splitting it into smaller instances, solving those recursively, and combining their results—with recurrences that reveal the total cost." tags={["Recurrences", "Master Theorem", "Sorting", "Geometric algorithms"]} />
      <Section title="The Paradigm"><P>Divide and conquer (D&C) applies when a problem can be reduced to smaller subproblems, often of the same type. A typical algorithm divides input, solves each piece, then combines results. Unlike dynamic programming, its recursive subproblems are often independent.</P><Steps steps={[{title:"Divide",body:"Split the input or search space into smaller instances."},{title:"Conquer",body:"Solve the base case directly; recursively solve smaller cases otherwise."},{title:"Combine",body:"Merge subanswers or use them to construct the complete result."}]} /><Callout type="insight"><P>Ask two questions before using D&C: do the subproblem answers contain enough information to build the whole answer, and do the subproblems overlap enough that memoization would avoid repeated work?</P></Callout></Section>
      <Section title="Recurrences and the Master Theorem"><P>A common recurrence is T(n) = aT(n/b) + f(n): a subproblems, each of size n/b, plus the work f(n) to split and combine. Compare f(n) with n<sup>log_b a</sup>, the work represented by the leaves of the recursion tree.</P><Table headers={["Case", "Comparison", "Asymptotic result", "Example"]} rows={[["1: leaves dominate","f(n) = O(n^(log_b a − ε))","Θ(n^log_b(a))","T(n)=2T(n/2)+1 → Θ(n)"],["2: balanced","f(n) = Θ(n^log_b(a) log^k n), k ≥ 0","Θ(n^log_b(a) log^(k+1) n)","T(n)=2T(n/2)+n → Θ(n log n)"],["3: combine dominates","f(n) = Ω(n^(log_b a + ε)) plus regularity","Θ(f(n))","T(n)=2T(n/2)+n² → Θ(n²)"]]}/><P>Master Theorem does not directly handle every recurrence—unequal splits, non-polynomial gaps, or irregular subproblems may need a recursion tree, substitution, or Akra–Bazzi analysis. State the regularity condition for Case 3 rather than applying it blindly.</P></Section>
      <Section title="Classic Search and Sort"><SubSection title="Merge sort"><P>Two half-size recursive calls are combined by a linear merge: T(n)=2T(n/2)+Θ(n)=Θ(n log n). The merge step, not the recursive calls, is the key combination.</P><CodeBlock code={`def merge_sort(values: list[int]) -> list[int]:
    if len(values) <= 1:
        return values[:]
    middle = len(values) // 2
    left = merge_sort(values[:middle])
    right = merge_sort(values[middle:])
    merged: list[int] = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
    return merged + left[i:] + right[j:]`} /></SubSection><SubSection title="Binary search"><P>Binary search repeatedly discards half the remaining sorted range. The loop invariant is that, if the target exists, it lies within the current inclusive interval.</P><CodeBlock code={`def binary_search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        middle = left + (right - left) // 2
        if nums[middle] == target:
            return middle
        if nums[middle] < target:
            left = middle + 1
        else:
            right = middle - 1
    return -1`} /><P>Its recurrence is T(n)=T(n/2)+Θ(1)=Θ(log n), with O(1) space in the iterative form.</P></SubSection><SubSection title="Quick sort reference"><P>Quicksort partitions the range, then sorts each side. Balanced partitions give O(n log n); repeatedly poor partitions give O(n²). Random pivots give expected O(n log n), but not a worst-case guarantee.</P><CodeBlock code={`import random

def quick_sort(a: list[int]) -> None:
    def sort(lo: int, hi: int) -> None:
        if lo >= hi:
            return
        pivot = a[random.randrange(lo, hi + 1)]
        lt, i, gt = lo, lo, hi
        while i <= gt:
            if a[i] < pivot:
                a[lt], a[i] = a[i], a[lt]; lt += 1; i += 1
            elif a[i] > pivot:
                a[i], a[gt] = a[gt], a[i]; gt -= 1
            else:
                i += 1
        sort(lo, lt - 1)
        sort(gt + 1, hi)
    sort(0, len(a) - 1)`} /></SubSection><SubSection title="Fast exponentiation"><P>Use exponentiation by squaring: xⁿ = (x²)ⁿ/² for even n; for odd n, multiply by x once. The recurrence has logarithmic depth.</P><CodeBlock code={`def power(base: float, exponent: int) -> float:
    if exponent < 0:
        return 1 / power(base, -exponent)
    if exponent == 0:
        return 1.0
    half = power(base, exponent // 2)
    result = half * half
    return result if exponent % 2 == 0 else result * base`} /></SubSection></Section>
      <Section title="Counting Inversions and Maximum Subarray"><SubSection title="Inversions by merge sort"><P>An inversion is a pair i &lt; j where a[i] &gt; a[j]. While merging sorted halves, when a right value precedes the next left value, it forms an inversion with every remaining left value.</P><CodeBlock code={`def count_inversions(nums: list[int]) -> int:
    def sort_count(a: list[int]) -> tuple[list[int], int]:
        if len(a) <= 1:
            return a, 0
        mid = len(a) // 2
        left, count_left = sort_count(a[:mid])
        right, count_right = sort_count(a[mid:])
        merged: list[int] = []
        i = j = cross = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                merged.append(left[i]); i += 1
            else:
                merged.append(right[j]); j += 1
                cross += len(left) - i
        return merged + left[i:] + right[j:], count_left + count_right + cross
    return sort_count(nums)[1]`} /></SubSection><SubSection title="Maximum subarray by divide and conquer"><P>The best subarray is entirely left, entirely right, or crosses the midpoint. The crossing case is the best suffix of the left half plus best prefix of the right. This classic form is Θ(n log n); Kadane’s dynamic program is Θ(n).</P><CodeBlock code={`def max_subarray_dc(nums: list[int]) -> int:
    def solve(lo: int, hi: int) -> int:
        if lo == hi:
            return nums[lo]
        mid = (lo + hi) // 2
        best_left = solve(lo, mid)
        best_right = solve(mid + 1, hi)
        total = 0
        left_suffix = float("-inf")
        for i in range(mid, lo - 1, -1):
            total += nums[i]
            left_suffix = max(left_suffix, total)
        total = 0
        right_prefix = float("-inf")
        for i in range(mid + 1, hi + 1):
            total += nums[i]
            right_prefix = max(right_prefix, total)
        return max(best_left, best_right, int(left_suffix + right_prefix))
    if not nums:
        raise ValueError("nums must not be empty")
    return solve(0, len(nums) - 1)`} /></SubSection></Section>
      <Section title="Closest Pair of Points"><P>Sort points by x, divide at the median, and find the best pair recursively in each half. Any cross-half closer pair lies within distance δ of the dividing line; inspect points in that strip in y-order. At most a constant number of following points need comparison under the packing argument.</P><P>This readable version re-sorts each strip by y and is O(n log² n); maintaining y-sorted lists across recursion reduces it to O(n log n).</P><CodeBlock code={`from math import hypot

def closest_pair(points: list[tuple[float, float]]) -> float:
    if len(points) < 2:
        raise ValueError("need at least two points")
    ordered = sorted(points)
    def solve(part: list[tuple[float, float]]) -> float:
        n = len(part)
        if n <= 3:
            return min(hypot(part[i][0] - part[j][0], part[i][1] - part[j][1])
                       for i in range(n) for j in range(i + 1, n)) if n > 1 else float("inf")
        mid = n // 2
        split_x = part[mid][0]
        best = min(solve(part[:mid]), solve(part[mid:]))
        strip = sorted((p for p in part if abs(p[0] - split_x) < best), key=lambda p: p[1])
        for i, point in enumerate(strip):
            for other in strip[i + 1:i + 8]:
                best = min(best, hypot(point[0] - other[0], point[1] - other[1]))
        return best
    return solve(ordered)`} /><Callout type="note"><P>The seven-neighbor strip bound is geometric, not a heuristic: each half has minimum separation at least δ, limiting the number of points that fit into the comparison rectangle.</P></Callout></Section>
      <Section title="Other D&C Examples"><SubSection title="Karatsuba multiplication"><P>For large integers split x and y into high/low halves. Instead of four half-size products, compute three: ac, bd, and (a+b)(c+d); then cross = (a+b)(c+d) − ac − bd. This gives T(n)=3T(n/2)+O(n)=O(n^log₂3), about O(n^1.585).</P><CodeBlock code={`def karatsuba(x: int, y: int) -> int:
    if x < 0 or y < 0:
        sign = -1 if (x < 0) != (y < 0) else 1
        return sign * karatsuba(abs(x), abs(y))
    if x < 10 or y < 10:
        return x * y
    size = max(len(str(x)), len(str(y)))
    half = size // 2
    power10 = 10 ** half
    a, b = divmod(x, power10)
    c, d = divmod(y, power10)
    ac = karatsuba(a, c)
    bd = karatsuba(b, d)
    cross = karatsuba(a + b, c + d) - ac - bd
    return ac * power10 * power10 + cross * power10 + bd`} /></SubSection><SubSection title="Strassen matrix multiplication"><P>Strassen reduces the eight half-size matrix multiplications of the standard divide-and-conquer algorithm to seven, combining extra additions/subtractions. Its recurrence is T(n)=7T(n/2)+O(n²)=O(n^log₂7) ≈ O(n^2.807). In practice, memory use, numerical stability, and crossover thresholds matter; optimized libraries switch methods based on matrix size.</P></SubSection><SubSection title="Majority element"><P>A divide-and-conquer majority algorithm finds a candidate in each half; if they agree, it is the parent candidate. Otherwise count both candidates in the full segment and keep a true majority if one exists. This yields O(n log n); Boyer–Moore gives O(n) time and O(1) space.</P><CodeBlock code={`def majority_element(nums: list[int]) -> int | None:
    def solve(lo: int, hi: int) -> int | None:
        if lo == hi:
            return nums[lo]
        mid = (lo + hi) // 2
        left = solve(lo, mid)
        right = solve(mid + 1, hi)
        if left == right:
            return left
        left_count = sum(nums[i] == left for i in range(lo, hi + 1)) if left is not None else 0
        right_count = sum(nums[i] == right for i in range(lo, hi + 1)) if right is not None else 0
        return left if left_count > (hi - lo + 1) // 2 else right if right_count > (hi - lo + 1) // 2 else None
    return solve(0, len(nums) - 1) if nums else None`} /></SubSection><SubSection title="Quickselect"><P>Partition and recurse only into the side containing the desired rank. Expected O(n) time with randomized pivots; worst-case O(n²). It is a selection algorithm derived from quicksort, but it does not fully sort either side.</P></SubSection></Section>
      <Section title="D&C versus Dynamic Programming"><P>Dynamic programming is often recursion plus memoization or tabulation when subproblems overlap. D&C is most effective when subproblems are independent or their results can be reused without repeated recomputation.</P><Table headers={["Property", "Divide and conquer", "Dynamic programming"]} rows={[["Subproblem relationship","Often independent","Overlapping states"],["Typical method","Recursive split and combine","Memoize or tabulate each state once"],["Examples","Merge sort, closest pair, Karatsuba","Fibonacci, knapsack, edit distance"],["Main performance risk","Unbalanced recursion / expensive combine","Too many states or transitions"],["Optimization","Better split, combine, parallelism","State compression, transition optimization"]]} /><Callout type="tip"><P>If recursive branches repeatedly solve the same state (such as Fibonacci’s repeated F(n−2)), caching turns the recursion tree into a state graph and is a sign to consider DP.</P></Callout></Section>
      <Section title="Practice Problems"><Practice problems={[{name:"Search in Rotated Sorted Array",difficulty:"Medium",hint:"Binary search while identifying the sorted half"},{name:"Count of Smaller Numbers After Self",difficulty:"Hard",hint:"Count cross inversions during merge"},{name:"The Skyline Problem",difficulty:"Hard",hint:"Divide, merge skyline breakpoints"},{name:"Maximum Subarray",difficulty:"Medium",hint:"Crossing suffix + prefix, or Kadane’s DP"},{name:"Kth Largest Element",difficulty:"Medium",hint:"Quickselect only the needed partition"},{name:"Closest Pair of Points",difficulty:"Hard",hint:"Divide by x; inspect a narrow y-sorted strip"}]} /></Section>
      <KeyTakeaways items={[<>D&C has divide, conquer, and combine phases; the combine cost determines many recurrences.</>,<>For T(n)=aT(n/b)+f(n), compare f(n) with n^log_b(a), observing Master Theorem conditions.</>,<>Merge sort, inversion counting, and closest pair exploit information across recursive halves.</>,<>Quickselect follows one partition branch; Karatsuba reduces recursive multiplication count.</>,<>Use DP when recursive subproblems overlap and would otherwise be solved repeatedly.</>]} />
    </article>
  );
}