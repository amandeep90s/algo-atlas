import { C, Callout, CodeBlock, KeyTakeaways, P, PageHeader, Practice, Section, Steps, Strong, SubSection, Table } from "../../components/doc";

export default function Greedy() {
  return (
    <article>
      <PageHeader eyebrow="Core Algorithms" title="Greedy Algorithms" description="Build a solution one locally optimal choice at a time—and learn how to prove that each choice preserves a globally optimal solution." tags={["Greedy choice", "Exchange arguments", "Intervals", "Heap scheduling"]} />
      <Section title="Greedy Choice and Optimal Substructure"><P>A greedy algorithm commits to a choice that looks best now, then solves the remaining problem. It is correct only when a sequence of locally optimal choices can form a global optimum. Two useful properties are the <Strong>greedy-choice property</Strong> (some optimal solution begins with the greedy choice) and <Strong>optimal substructure</Strong> (after that choice, the remaining problem is itself optimally solvable).</P><Steps steps={[{title:"Define the choice",body:"Specify exactly which candidate is selected at each step (earliest finish, cheapest edge, largest frequency, etc.)."},{title:"Prove it is safe",body:"Show that some optimal solution can be transformed to include this choice without getting worse."},{title:"Reduce the problem",body:"After committing, identify the remaining subproblem and show its optimal solution completes the answer."},{title:"Check implementation invariants",body:"Make sure sorting, ties, endpoint conventions, and resource constraints match the proof."}]} /><P>Two common proof styles are the <Strong>exchange argument</Strong>—replace an optimal solution’s first choice with the greedy one—and <Strong>stays-ahead</Strong>—show the greedy partial solution is at least as good as every competitor at each step.</P></Section>
      <Section title="When Greedy Fails"><P>Locally best does not always imply globally best. In coin change with denominations [1, 3, 4] and amount 6, taking the largest coin first gives 4 + 1 + 1 (three coins), but the optimum is 3 + 3 (two coins).</P><CodeBlock code={`def greedy_change(coins: list[int], amount: int) -> list[int]:
    result: list[int] = []
    for coin in sorted(coins, reverse=True):
        while amount >= coin:
            amount -= coin
            result.append(coin)
    return result

print(greedy_change([1, 3, 4], 6))  # [4, 1, 1]`} output="[4, 1, 1]" /><Callout type="warning"><P>For arbitrary coin systems, greedy change can be suboptimal. A dynamic program over amounts (or another proof suited to the coin system) is needed. Always search for a counterexample before trusting a local rule.</P></Callout></Section>
      <Section title="Intervals: Sort by End or Start"><SubSection title="Activity selection / non-overlapping intervals"><P>To select the maximum number of compatible intervals, sort by finish time and repeatedly choose the next interval that starts at or after the last chosen finish. Choosing the earliest finish leaves the most room for all remaining activities; an exchange argument proves this choice is safe.</P><CodeBlock code={`def max_non_overlapping(intervals: list[tuple[int, int]]) -> list[tuple[int, int]]:
    chosen: list[tuple[int, int]] = []
    last_end = float("-inf")
    for start, end in sorted(intervals, key=lambda item: item[1]):
        if start >= last_end:
            chosen.append((start, end))
            last_end = end
    return chosen`} /><P>This assumes half-open or touching intervals are compatible. If endpoints are closed and touching counts as overlap, use <C>start &gt; last_end</C> instead of <C>start &gt;= last_end</C>.</P></SubSection><SubSection title="Merge intervals"><P>For merging, sort by start time. Then each new interval either overlaps the current merged interval—extend its end—or begins a new component.</P><CodeBlock code={`def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:
    merged: list[list[int]] = []
    for start, end in sorted(intervals):
        if not merged or start > merged[-1][1]:
            merged.append([start, end])
        else:
            merged[-1][1] = max(merged[-1][1], end)
    return merged`} /></SubSection><SubSection title="Meeting rooms II: heap of active end times"><P>Sort by start and keep the end time of each occupied room in a min-heap. Reuse the room that frees earliest when its meeting has ended; otherwise allocate another room. Heap size is the number of rooms currently needed.</P><CodeBlock code={`import heapq

def min_meeting_rooms(intervals: list[tuple[int, int]]) -> int:
    active: list[int] = []
    for start, end in sorted(intervals):
        if active and active[0] <= start:
            heapq.heappop(active)
        heapq.heappush(active, end)
    return len(active)`} /><P>When multiple meetings can finish before the next start, one freed room is enough: every start adds exactly one active meeting, and a min-heap still holds the other rooms’ end times. Repeatedly popping all ended times is another valid implementation if tracking currently occupied rooms explicitly.</P></SubSection><Table headers={["Interval goal", "Sort by", "Greedy reason"]} rows={[["Maximum compatible activities","End time ascending","Earliest finish leaves maximum future space"],["Merge overlaps","Start time ascending","Overlapping intervals become adjacent"],["Minimum rooms / resource reuse","Start time ascending","Process arrivals; reuse earliest freed resource"],["Minimum arrows for interval targets","End time ascending","One arrow at earliest end covers the most compatible balloons"]]} /></Section>
      <Section title="Jump Games and Gas Station"><SubSection title="Jump Game I and II"><P>For reachability, maintain the farthest index reachable so far; if the scan passes it, a gap is unreachable. For the minimum jumps, scan the current BFS-like layer and extend the farthest boundary; each boundary crossing increments the jump count.</P><CodeBlock code={`def can_jump(nums: list[int]) -> bool:
    farthest = 0
    for i, jump in enumerate(nums):
        if i > farthest:
            return False
        farthest = max(farthest, i + jump)
    return True

def min_jumps(nums: list[int]) -> int:
    if len(nums) <= 1:
        return 0
    jumps = layer_end = farthest = 0
    for i in range(len(nums) - 1):
        if i > farthest:
            return -1  # unreachable input
        farthest = max(farthest, i + nums[i])
        if i == layer_end:
            jumps += 1
            layer_end = farthest
            if layer_end >= len(nums) - 1:
                return jumps
    return -1`} /></SubSection><SubSection title="Gas station"><P>If total gas is below total cost, no start can complete the circuit. Otherwise, scan once: when the current tank becomes negative, none of the starts since the last reset can work, so begin at the next station and reset the tank.</P><CodeBlock code={`def gas_station(gas: list[int], cost: list[int]) -> int:
    if sum(gas) < sum(cost):
        return -1
    start = tank = 0
    for i, (fuel, expense) in enumerate(zip(gas, cost)):
        tank += fuel - expense
        if tank < 0:
            start = i + 1
            tank = 0
    return start if gas else -1`} /></SubSection></Section>
      <Section title="Greedy by Value and Frequency"><SubSection title="Fractional knapsack"><P>When fractions of items are allowed, sort by value-to-weight ratio and take as much as possible from the best ratio first. The fractional choice has the greedy-choice property; the 0/1 version does not generally.</P><CodeBlock code={`def fractional_knapsack(items: list[tuple[float, float]], capacity: float) -> float:
    """Each item is (value, weight); fractions are allowed."""
    total = 0.0
    for value, weight in sorted(items, key=lambda item: item[0] / item[1], reverse=True):
        take = min(capacity, weight)
        total += take * value / weight
        capacity -= take
        if capacity == 0:
            break
    return total`} /></SubSection><SubSection title="Huffman coding"><P>Repeatedly merge the two lowest-frequency nodes. A min-heap makes each merge efficient; the resulting prefix-code tree minimizes weighted path length. A single-symbol alphabet needs a special one-bit code.</P><CodeBlock code={`import heapq
from itertools import count

def huffman_codes(frequencies: dict[str, int]) -> dict[str, str]:
    if not frequencies:
        return {}
    serial = count()
    heap: list[tuple[int, int, object]] = [
        (freq, next(serial), symbol) for symbol, freq in frequencies.items()
    ]
    heapq.heapify(heap)
    while len(heap) > 1:
        f1, _, left = heapq.heappop(heap)
        f2, _, right = heapq.heappop(heap)
        heapq.heappush(heap, (f1 + f2, next(serial), (left, right)))
    root = heap[0][2]
    codes: dict[str, str] = {}
    def visit(node: object, prefix: str) -> None:
        if isinstance(node, str):
            codes[node] = prefix or "0"
            return
        left, right = node  # type: ignore[misc]
        visit(left, prefix + "0")
        visit(right, prefix + "1")
    visit(root, "")
    return codes`} /></SubSection><SubSection title="Assign cookies"><P>Sort children by greed and cookies by size. Give the smallest remaining cookie that satisfies the least-greedy unsatisfied child. If a cookie is too small, discard that cookie—it cannot satisfy any later child.</P><CodeBlock code={`def assign_cookies(greed: list[int], cookies: list[int]) -> int:
    greed.sort(); cookies.sort()
    child = cookie = 0
    while child < len(greed) and cookie < len(cookies):
        if cookies[cookie] >= greed[child]:
            child += 1
        cookie += 1
    return child`} /></SubSection><SubSection title="Minimum arrows to burst balloons"><P>Sort balloon intervals by end. Place an arrow at the earliest end; every balloon containing that point is covered. When an interval begins after the arrow, a new arrow is needed.</P><CodeBlock code={`def min_arrows(points: list[list[int]]) -> int:
    if not points:
        return 0
    points.sort(key=lambda interval: interval[1])
    arrows = 1
    position = points[0][1]
    for start, end in points[1:]:
        if start > position:
            arrows += 1
            position = end
    return arrows`} /></SubSection><SubSection title="Task scheduler"><P>For tasks with a uniform cooldown n, the most frequent task determines a lower bound: arrange its fmax copies with n idle slots between, then fill gaps with other tasks. The optimum is the greater of total tasks and (fmax − 1)(n + 1) + count of tasks tied at fmax.</P><CodeBlock code={`from collections import Counter

def least_task_intervals(tasks: list[str], cooldown: int) -> int:
    if not tasks:
        return 0
    counts = Counter(tasks)
    maximum = max(counts.values())
    tied = sum(count == maximum for count in counts.values())
    frame = (maximum - 1) * (cooldown + 1) + tied
    return max(len(tasks), frame)`} /></SubSection><SubSection title="Partition labels"><P>Each partition must contain every occurrence of each character it includes. Precompute the last index of every character; extend the current segment end to include the last occurrence of each scanned character, and close a segment when the scan reaches that end.</P><CodeBlock code={`def partition_labels(text: str) -> list[int]:
    last = {char: i for i, char in enumerate(text)}
    result: list[int] = []
    start = end = 0
    for i, char in enumerate(text):
        end = max(end, last[char])
        if i == end:
            result.append(end - start + 1)
            start = i + 1
    return result`} /></SubSection></Section>
      <Section title="Candy: Two Directional Passes"><P>Each child gets at least one candy; a child with a higher rating than an adjacent child must get more candy. A left-to-right pass enforces the left neighbor rule; a right-to-left pass enforces the right rule, taking the maximum of both requirements.</P><CodeBlock code={`def candy(ratings: list[int]) -> int:
    n = len(ratings)
    if n == 0:
        return 0
    candies = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            candies[i] = candies[i - 1] + 1
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]:
            candies[i] = max(candies[i], candies[i + 1] + 1)
    return sum(candies)`} /></Section>
      <Section title="Greedy versus Dynamic Programming"><P>Greedy fixes a choice and never revisits it. DP compares multiple possibilities through states and can solve problems where a local choice sacrifices a better future.</P><Table headers={["Question", "Greedy", "Dynamic programming"]} rows={[["Choice","One locally best action","Compare transitions / alternatives"],["Proof burden","Show a safe first choice","Show recurrence covers optimal solutions"],["Typical example","Activity selection, Huffman","0/1 knapsack, arbitrary coin change"],["Time / space","Often small and fast","May require many states"],["Failure mode","Early commitment blocks optimum","State or transition definition is wrong / too costly"]]} /><Callout type="tip"><P>To test a proposed greedy rule, write down its exact choice, then try the smallest counterexample where that choice uses a resource needed later. If no counterexample appears, prove safety with an exchange or stays-ahead argument.</P></Callout></Section>
      <Section title="Complexity and Practice"><Table headers={["Algorithm", "Time", "Extra space"]} rows={[["Activity selection","O(n log n)","O(n) output"],["Merge intervals","O(n log n)","O(n) output"],["Meeting rooms II","O(n log n)","O(n) heap"],["Jump Game I / II","O(n)","O(1)"],["Gas station","O(n)","O(1)"],["Fractional knapsack","O(n log n)","O(n) sorting"],["Huffman coding","O(n log n)","O(n)"],["Partition labels / candy","O(n)","O(n)"]]} /><Practice problems={[{name:"Non-overlapping Intervals",difficulty:"Medium",hint:"Sort by end and retain earliest finishes"},{name:"Meeting Rooms II",difficulty:"Medium",hint:"Min-heap of active end times"},{name:"Jump Game II",difficulty:"Medium",hint:"Grow the farthest reach of each jump layer"},{name:"Gas Station",difficulty:"Medium",hint:"Reset the start whenever running fuel dips below zero"},{name:"Task Scheduler",difficulty:"Medium",hint:"Derive the most-frequent-task frame lower bound"},{name:"Candy",difficulty:"Hard",hint:"Satisfy adjacent constraints in both directions"},{name:"Huffman Coding",difficulty:"Medium",hint:"Repeatedly combine two minimum frequencies"}]} /></Section>
      <KeyTakeaways items={[<>A greedy rule needs a proof: local choices alone do not guarantee a global optimum.</>,<>Exchange arguments and stays-ahead reasoning establish that a greedy choice is safe.</>,<>Interval problems often sort by end for selection and by start for merging or resource allocation.</>,<>[1, 3, 4] coin change for amount 6 is a counterexample to largest-coin-first.</>,<>When greedy fails, dynamic programming may preserve alternatives until the global optimum is known.</>]} />
    </article>
  );
}