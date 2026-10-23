import { SortingVisualizer } from "../../components/visualizers";
import { ArrayViz, Callout, C, CodeBlock, KeyTakeaways, P, PageHeader, Practice, ProsCons, Section, Strong, SubSection, Table } from "../../components/doc";

export default function Sorting() {
  return (
    <article>
      <PageHeader eyebrow="Core Algorithms" title="Sorting" description="Choose, analyze, and implement sorting algorithms—from simple quadratic passes to Python’s stable Timsort—and recognize the right tool for selection and ordering problems." tags={["Comparison sorts", "Stability", "Python sort", "Quickselect"]} />
      <Section title="Sorting Fundamentals">
        <P>Sorting rearranges records by a key into a consistent order. A <Strong>stable</Strong> algorithm keeps equal-key elements in their original relative order; <Strong>in-place</Strong> generally means O(1) auxiliary storage (recursion stack is often reported separately). Comparison sorts learn order only through comparisons, while counting, radix, and bucket sorts exploit key structure. An <Strong>adaptive</Strong> sort uses existing order to reduce work.</P>
        <ArrayViz values={["A:2", "B:1", "C:2", "D:3"]} highlight={[0, 2]} caption="Stable sorting by the number yields B:1, A:2, C:2, D:3: A remains before C." />
        <Callout type="insight" title="Comparison-sort lower bound"><P>There are n! possible input permutations. A comparison decision tree needs at least n! leaves, hence height at least log₂(n!) = Ω(n log n). This is a worst-case lower bound for general comparison sorting—not for algorithms that use extra assumptions about keys.</P></Callout>
      </Section>
      <Section title="Interactive Visualizer">
        <SortingVisualizer />
      </Section>
      <Section title="Elementary Comparison Sorts">
        <SubSection title="Bubble sort — stable, adaptive with early exit"><P>Repeatedly compare adjacent items and swap an inverted pair. After each pass, the largest unsorted value has bubbled to the end; a pass with no swaps proves the sequence is sorted.</P><ArrayViz values={[5, 1, 4, 2, 8]} highlight={[0, 1]} pointers={{0:"compare",1:"compare"}} caption="Compare neighbors; after a full pass, the largest remaining item is fixed." /><CodeBlock code={`def bubble_sort(a: list[int]) -> None:
    n = len(a)
    for end in range(n - 1, 0, -1):
        swapped = False
        for i in range(end):
            if a[i] > a[i + 1]:
                a[i], a[i + 1] = a[i + 1], a[i]
                swapped = True
        if not swapped:
            break`} /></SubSection>
        <SubSection title="Selection sort — few writes, not stable by default"><P>Find the minimum in the unsorted suffix and swap it into the next output position. It always scans the suffix, so already-sorted input does not improve its Θ(n²) comparison count. The distant swap can reverse equal items.</P><CodeBlock code={`def selection_sort(a: list[int]) -> None:
    for start in range(len(a)):
        smallest = min(range(start, len(a)), key=a.__getitem__)
        a[start], a[smallest] = a[smallest], a[start]`} /></SubSection>
        <SubSection title="Insertion sort — stable and adaptive"><P>Maintain a sorted prefix; take the next value and shift larger prefix entries right until its insertion point. It is excellent for tiny arrays and nearly-sorted data, and is often used inside hybrid sorts.</P><CodeBlock code={`def insertion_sort(a: list[int]) -> None:
    for i in range(1, len(a)):
        value = a[i]
        j = i
        while j > 0 and a[j - 1] > value:
            a[j] = a[j - 1]
            j -= 1
        a[j] = value`} /></SubSection>
      </Section>
      <Section title="Divide-and-Conquer Sorts">
        <SubSection title="Merge sort — top-down, stable"><P>Recursively split into halves, sort them, then merge two sorted runs with a linear scan. This implementation is top-down; bottom-up merge sort iteratively combines runs of width 1, 2, 4, … and avoids recursion.</P><ArrayViz values={[1, 4, 7, 2, 5, 8]} highlight={[0, 1, 2]} caption="Merge two sorted runs [1, 4, 7] and [2, 5, 8] by repeatedly taking the smaller head." /><CodeBlock code={`def merge_sort(a: list[int]) -> list[int]:
    if len(a) <= 1:
        return a[:]
    mid = len(a) // 2
    left = merge_sort(a[:mid])
    right = merge_sort(a[mid:])
    merged: list[int] = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:  # left first preserves stability
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
    return merged + left[i:] + right[j:]`} /></SubSection>
        <SubSection title="Quick sort — randomized pivot and partitions"><P>Partition around a pivot, then recursively sort the two sides. Lomuto places the pivot at its final index using a boundary scan; Hoare moves two scans inward and returns a split boundary (not necessarily the pivot’s final index). Randomizing the pivot makes consistently bad partitions unlikely. Three-way partitioning groups values below, equal to, and above the pivot (Dutch national flag), avoiding repeated work on duplicates.</P><CodeBlock code={`import random

def quick_sort(a: list[int]) -> None:
    def sort(lo: int, hi: int) -> None:
        if lo >= hi:
            return
        pivot = a[random.randrange(lo, hi + 1)]
        lt, i, gt = lo, lo, hi
        while i <= gt:  # three-way partition
            if a[i] < pivot:
                a[lt], a[i] = a[i], a[lt]
                lt += 1; i += 1
            elif a[i] > pivot:
                a[i], a[gt] = a[gt], a[i]
                gt -= 1
            else:
                i += 1
        sort(lo, lt - 1)
        sort(gt + 1, hi)
    sort(0, len(a) - 1)`} /><CodeBlock title="Lomuto and Hoare partition schemes" code={`def lomuto_partition(a: list[int], lo: int, hi: int) -> int:\n    pivot = a[hi]\n    boundary = lo\n    for scan in range(lo, hi):\n        if a[scan] <= pivot:\n            a[boundary], a[scan] = a[scan], a[boundary]\n            boundary += 1\n    a[boundary], a[hi] = a[hi], a[boundary]\n    return boundary  # pivot final index\n\ndef hoare_partition(a: list[int], lo: int, hi: int) -> int:\n    pivot = a[(lo + hi) // 2]\n    left, right = lo - 1, hi + 1\n    while True:\n        left += 1\n        while a[left] < pivot:\n            left += 1\n        right -= 1\n        while a[right] > pivot:\n            right -= 1\n        if left >= right:\n            return right  # split boundary, not pivot index\n        a[left], a[right] = a[right], a[left]`} /><Callout type="warning"><P>Do not recurse on the returned Hoare split as if it were a Lomuto pivot index. Hoare partition returns a boundary; its recursion ranges must shrink on both sides.</P></Callout></SubSection>
        <SubSection title="Heap sort — guaranteed bound, in-place"><P>Build a max-heap, then repeatedly move the maximum root to the end and restore the heap. Heap construction is O(n); the removals cost O(n log n). It is not stable and typically has weaker cache locality than quicksort.</P><CodeBlock code={`def heap_sort(a: list[int]) -> None:
    n = len(a)
    def sift(root: int, size: int) -> None:
        while 2 * root + 1 < size:
            child = 2 * root + 1
            if child + 1 < size and a[child + 1] > a[child]:
                child += 1
            if a[root] >= a[child]:
                return
            a[root], a[child] = a[child], a[root]
            root = child
    for i in range(n // 2 - 1, -1, -1):
        sift(i, n)
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]
        sift(0, end)`} /></SubSection>
      </Section>
      <Section title="Non-Comparison and Hybrid Sorts">
        <SubSection title="Counting and radix sort"><P><Strong>Counting sort</Strong> counts occurrences in a bounded integer range, then emits values in order. It is stable when implemented with cumulative counts and reverse placement. <Strong>LSD radix sort</Strong> stably sorts by each digit from least to most significant; stability of every digit pass is essential.</P><CodeBlock code={`def counting_sort(a: list[int]) -> list[int]:
    if not a:
        return []
    lo, hi = min(a), max(a)
    counts = [0] * (hi - lo + 1)
    for x in a:
        counts[x - lo] += 1
    return [value for offset, count in enumerate(counts)
            for value in [offset + lo] * count]

def radix_sort_nonnegative(a: list[int]) -> list[int]:
    out = a[:]
    if not out:
        return out
    exp = 1
    while max(out) // exp > 0:
        counts = [0] * 10
        for x in out:
            counts[(x // exp) % 10] += 1
        for i in range(1, 10):
            counts[i] += counts[i - 1]
        ordered = [0] * len(out)
        for x in reversed(out):
            digit = (x // exp) % 10
            counts[digit] -= 1
            ordered[counts[digit]] = x
        out = ordered
        exp *= 10
    return out`} /><P>Counting sort takes O(n + k), where k is key-range width. LSD radix takes O(d(n + b)) for d digits in base b. These bounds depend on bounded, representable keys; adapt the method for signed values or strings.</P></SubSection>
        <SubSection title="Bucket sort, Shell sort, and Timsort"><P><Strong>Bucket sort</Strong> distributes values across buckets, sorts each bucket, then concatenates. With roughly uniform distribution it is expected O(n + k); skew can make a bucket quadratic. <Strong>Shell sort</Strong> performs insertion-sort passes over decreasing gaps; it is in-place, but complexity depends on the gap sequence and it is not stable.</P><P><Strong>Timsort</Strong>, used by Python, is a stable adaptive natural mergesort. It detects monotone runs, extends short runs with binary insertion sort, merges runs according to stack invariants, and can use <Strong>galloping</Strong> searches when one run wins repeatedly. Nearly sorted data may be processed close to O(n).</P><CodeBlock title="Python’s sorting API" code={`records = [("Mina", 91), ("Ari", 84), ("Lee", 91)]
by_score = sorted(records, key=lambda row: row[1], reverse=True)  # new list
records.sort(key=lambda row: row[1])  # mutates list; returns None

# Stable multi-key sorting: sort least-significant key first.
rows = [("blue", 2), ("red", 1), ("blue", 1)]
rows.sort(key=lambda row: row[1])
rows.sort(key=lambda row: row[0])

from functools import cmp_to_key
def compare(a: int, b: int) -> int:
    return (a > b) - (a < b)
values = sorted([4, 1, 3], key=cmp_to_key(compare))`} /><P>Prefer a <C>key</C> function over a comparator: compute the ordering key once per item. <C>reverse=True</C> reverses ordering while retaining stability. Stable sorting also enables decorate/sort/undecorate and successive least-to-most-significant key sorts.</P>
          <CodeBlock title="Bucket sort for values in [0, 1)" code={`def bucket_sort(values: list[float]) -> list[float]:
    if any(not 0 <= value < 1 for value in values):
        raise ValueError("values must be in [0, 1)")
    buckets: list[list[float]] = [[] for _ in values]
    for value in values:
        buckets[int(value * len(values))].append(value)
    return [value for bucket in buckets for value in sorted(bucket)]`} />
          <CodeBlock title="Shell sort with halving gaps" code={`def shell_sort(a: list[int]) -> None:
    gap = len(a) // 2
    while gap:
        for i in range(gap, len(a)):
            value = a[i]
            j = i
            while j >= gap and a[j - gap] > value:
                a[j] = a[j - gap]
                j -= gap
            a[j] = value
        gap //= 2`} />
          <P>The common halving-gap Shell sort is in-place and not stable; its precise average-case bound depends on the chosen gap sequence.</P>
        </SubSection>
      </Section>
      <Section title="Algorithm Comparison"><Table headers={["Algorithm", "Best", "Average", "Worst", "Extra space", "Stable", "In-place"]} rows={[
        ["Bubble (early exit)", "O(n)", "O(n²)", "O(n²)", "O(1)", "Yes", "Yes"], ["Selection", "O(n²)", "O(n²)", "O(n²)", "O(1)", "No", "Yes"], ["Insertion", "O(n)", "O(n²)", "O(n²)", "O(1)", "Yes", "Yes"], ["Merge", "O(n log n)", "O(n log n)", "O(n log n)", "O(n)", "Yes", "No"], ["Quick (randomized)", "O(n log n)", "O(n log n)", "O(n²)", "O(log n) avg stack", "No", "Mostly"], ["Heap", "O(n log n)", "O(n log n)", "O(n log n)", "O(1)", "No", "Yes"], ["Counting", "O(n + k)", "O(n + k)", "O(n + k)", "O(n + k)", "Yes*", "No"], ["Radix (LSD)", "O(d(n + b))", "O(d(n + b))", "O(d(n + b))", "O(n + b)", "Yes", "No"], ["Bucket", "O(n + k)", "O(n + k) expected", "O(n²)", "O(n + k)", "Depends", "No"], ["Shell (halving gaps)", "O(n log n) best", "Gap-dependent", "O(n²)", "O(1)", "No", "Yes"], ["Timsort", "O(n)", "O(n log n)", "O(n log n)", "O(n)", "Yes", "No"]
      ]} /><P>*Counting sort is stable with cumulative counts and reverse placement. Complexity uses k for range/bucket count, b for radix base, and d for digit count.</P></Section>
      <Section title="Quickselect and Choosing a Sort">
        <SubSection title="Quickselect: kth smallest without full sorting"><P>Partition around a pivot and recurse only into the side containing the target index. Expected time is O(n), worst case O(n²); randomized pivots improve expected behavior. This version uses three-way partitioning for duplicates.</P><CodeBlock code={`import random

def kth_smallest(a: list[int], k: int) -> int:
    """Return 0-indexed kth smallest, rearranging a in place."""
    if not 0 <= k < len(a):
        raise IndexError("k out of range")
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        pivot = a[random.randrange(lo, hi + 1)]
        lt, i, gt = lo, lo, hi
        while i <= gt:
            if a[i] < pivot:
                a[lt], a[i] = a[i], a[lt]; lt += 1; i += 1
            elif a[i] > pivot:
                a[i], a[gt] = a[gt], a[i]; gt -= 1
            else:
                i += 1
        if k < lt: hi = lt - 1
        elif k > gt: lo = gt + 1
        else: return pivot
    raise AssertionError("unreachable")`} /></SubSection>
        <ProsCons pros={["Use Python sorted()/list.sort() for general application data; stable and highly optimized.", "Choose merge sort when stable O(n log n) is required and extra memory is acceptable.", "Choose heap sort for deterministic O(n log n) with O(1) auxiliary space.", "Use counting/radix for suitable bounded integer keys; use quickselect when only one rank is needed."]} cons={["Avoid quadratic elementary sorts for large arbitrary inputs.", "Do not assume quicksort has guaranteed O(n log n) worst case.", "Non-comparison sorts are not general-purpose: range, digit, or distribution assumptions matter.", "Choose a stable sort when equal keys carry meaningful original order."]} />
        <Callout type="tip"><P>In ordinary Python code, use the built-in sort. Hand-written sorting is valuable for learning, specialized constraints, or when the algorithm’s partitioning behavior itself solves the problem.</P></Callout>
      </Section>
      <Section title="Practice Problems"><Practice problems={[
        {name:"Sort Colors", difficulty:"Medium", hint:"Three-way Dutch national flag partition"}, {name:"Kth Largest Element in an Array", difficulty:"Medium", hint:"Quickselect or a size-k heap"}, {name:"Merge k Sorted Lists", difficulty:"Hard", hint:"Heap or divide-and-conquer merging"}, {name:"Sort List", difficulty:"Medium", hint:"Linked-list merge sort"}, {name:"Largest Number", difficulty:"Medium", hint:"Custom ordering; use cmp_to_key"}, {name:"Count of Smaller Numbers After Self", difficulty:"Hard", hint:"Merge-sort counting or indexed tree"}
      ]} /></Section>
      <KeyTakeaways items={[<>Stable sorting preserves the order of equal-key records; Python’s built-in sort is stable and adaptive.</>, <>General comparison sorts need Ω(n log n) comparisons in the worst case.</>, <>Merge sort guarantees O(n log n); randomized quicksort is fast on average but can degrade to O(n²).</>, <>Counting and radix sorting beat the comparison bound only by exploiting key structure.</>, <>Use quickselect for one order statistic instead of sorting the whole collection.</>]} />
    </article>
  );
}