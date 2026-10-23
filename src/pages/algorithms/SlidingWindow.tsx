import { ArrayViz, Callout, CodeBlock, KeyTakeaways, P, PageHeader, Practice, Section, Steps, Strong, SubSection, Table } from "../../components/doc";

export default function SlidingWindow() {
  return (
    <article>
      <PageHeader eyebrow="Core Algorithms" title="Sliding Window" description="Maintain a summary of a contiguous range as its boundaries move, replacing repeated subarray work with an efficient scan." tags={["Fixed window", "Variable window", "Frequency maps", "Monotonic deque"]} />
      <Section title="Window Fundamentals"><P>A <Strong>sliding window</Strong> is a contiguous interval [left, right] whose state is updated when its edges move. Instead of recomputing a sum, count, or frequency table for every range, add the new right element and remove values that leave on the left. Use this when the desired ranges are contiguous and the constraint can be maintained incrementally.</P><ArrayViz values={[4, 1, 3, 2, 6, 1]} highlight={[1, 2, 3]} pointers={{1:"left",3:"right"}} caption="Current window [left, right] = [1, 3] contains 1, 3, 2. Expand right to include; shrink left to restore validity." /><Steps steps={[{title:"Choose the state",body:"Sum, counts, distinct-key count, or another compact summary of the active range."},{title:"Expand",body:"Advance right and add the entering element to the state."},{title:"Restore validity",body:"For variable windows, advance left while the constraint is violated."},{title:"Record answer",body:"Update the best length, count, or range at the exact point justified by the invariant."}]} /></Section>
      <Section title="Fixed-Size Windows"><P>For fixed length k, first build the initial window, then add the next item and subtract the item leaving. Every element is added and removed at most once.</P><ArrayViz values={[2, 1, 5, 1, 3, 2]} highlight={[1, 2, 3]} caption="For k = 3, the sum of [1, 5, 1] is updated to the next window by subtracting 1 and adding 3." /><CodeBlock code={`def max_sum_size_k(nums: list[int], k: int) -> int:
    if not 1 <= k <= len(nums):
        raise ValueError("k must fit the input")
    window = sum(nums[:k])
    best = window
    for right in range(k, len(nums)):
        window += nums[right] - nums[right - k]
        best = max(best, window)
    return best

def averages_size_k(nums: list[int], k: int) -> list[float]:
    if not 1 <= k <= len(nums):
        return []
    window = sum(nums[:k])
    result = [window / k]
    for right in range(k, len(nums)):
        window += nums[right] - nums[right - k]
        result.append(window / k)
    return result`} /><P>Other fixed-window examples include maximum/minimum in every window, moving averages, and checking whether a window’s frequency counts equal a target signature.</P></Section>
      <Section title="Anagrams and Permutations"><P>For a target of length m, every candidate window also has length m. Maintain character counts and compare against the required counts. For a small fixed alphabet, a count array is faster than rebuilding dictionaries; track how many counts currently match to avoid comparing the whole alphabet each step.</P><CodeBlock code={`from collections import Counter

def find_anagrams(text: str, pattern: str) -> list[int]:
    m = len(pattern)
    if m == 0 or m > len(text):
        return []
    need = Counter(pattern)
    window: Counter[str] = Counter()
    answer: list[int] = []
    for right, char in enumerate(text):
        window[char] += 1
        if right >= m:
            leaving = text[right - m]
            window[leaving] -= 1
            if window[leaving] == 0:
                del window[leaving]
        if right >= m - 1 and window == need:
            answer.append(right - m + 1)
    return answer

def contains_permutation(pattern: str, text: str) -> bool:
    return bool(find_anagrams(text, pattern))`} /><Callout type="note"><P>When the alphabet is fixed (for example lowercase English letters), use a 26-entry vector and a matched-count invariant. For arbitrary Unicode text, a dictionary/Counter is safer.</P></Callout></Section>
      <Section title="Variable-Size Windows: Shrink While Invalid"><P>For many problems with nonnegative values or a monotone constraint, expand right to include new elements, then shrink left while the window is invalid. Each pointer only moves forward, so a nested-looking while loop is still linear overall.</P><SubSection title="Longest substring without repeating characters"><P>Maintain each character’s last index. On a duplicate inside the current range, jump left just past its prior occurrence; never move left backward.</P><CodeBlock code={`def longest_unique(text: str) -> int:
    last_seen: dict[str, int] = {}
    left = best = 0
    for right, char in enumerate(text):
        if char in last_seen:
            left = max(left, last_seen[char] + 1)
        last_seen[char] = right
        best = max(best, right - left + 1)
    return best`} /></SubSection><SubSection title="Minimum size subarray sum"><P>For positive numbers, once a window reaches target, shrinking can only improve or preserve the candidate length; with negative values this monotonicity fails.</P><CodeBlock code={`def min_subarray_len(target: int, nums: list[int]) -> int:
    left = total = 0
    best = len(nums) + 1
    for right, value in enumerate(nums):
        total += value
        while total >= target:
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == len(nums) + 1 else best`} /></SubSection><SubSection title="At most k distinct and character replacement"><CodeBlock code={`from collections import defaultdict

def longest_at_most_k_distinct(text: str, k: int) -> int:
    if k < 0:
        return 0
    counts: dict[str, int] = defaultdict(int)
    left = best = 0
    for right, char in enumerate(text):
        counts[char] += 1
        while len(counts) > k:
            old = text[left]
            counts[old] -= 1
            if counts[old] == 0:
                del counts[old]
            left += 1
        best = max(best, right - left + 1)
    return best

def character_replacement(text: str, k: int) -> int:
    counts: dict[str, int] = defaultdict(int)
    left = best = max_frequency = 0
    for right, char in enumerate(text):
        counts[char] += 1
        max_frequency = max(max_frequency, counts[char])
        while right - left + 1 - max_frequency > k:
            counts[text[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`} /><P>For character replacement, the window needs length − most-frequent-count replacements. Keeping a historical maximum frequency (which may exceed the current window’s frequency) is safe for finding the maximum valid length: it can delay shrinking, but cannot produce an invalid larger answer.</P></SubSection></Section>
      <Section title="Minimum Window Substring"><P>Track how many required character occurrences remain unsatisfied. Expand until all requirements are met; then shrink from the left while still valid, recording the shortest valid range.</P><CodeBlock code={`from collections import Counter

def min_window(text: str, pattern: str) -> str:
    if not text or not pattern:
        return ""
    need = Counter(pattern)
    missing = len(pattern)
    left = start = 0
    best_length = len(text) + 1
    for right, char in enumerate(text):
        if need[char] > 0:
            missing -= 1
        need[char] -= 1
        while missing == 0:
            length = right - left + 1
            if length < best_length:
                start, best_length = left, length
            leaving = text[left]
            need[leaving] += 1
            if need[leaving] > 0:
                missing += 1
            left += 1
    return "" if best_length > len(text) else text[start:start + best_length]`} /><Callout type="warning"><P>“Longest valid” and “shortest valid” differ in when the answer is recorded. For a minimum-cover window, record while valid and shrink; for longest-under-limit, restore validity first and then measure.</P></Callout></Section>
      <Section title="Counting Exactly k and Monotonic Deques"><SubSection title="Exactly k = at most k − at most k−1"><P>For nonnegative counts, the number of subarrays with exactly k distinct values equals the number with at most k minus the number with at most k−1. Each right endpoint contributes the number of valid starts.</P><CodeBlock code={`from collections import defaultdict

def subarrays_with_k_distinct(nums: list[int], k: int) -> int:
    def at_most(limit: int) -> int:
        if limit < 0:
            return 0
        counts: dict[int, int] = defaultdict(int)
        left = total = 0
        for right, value in enumerate(nums):
            counts[value] += 1
            while len(counts) > limit:
                old = nums[left]
                counts[old] -= 1
                if counts[old] == 0:
                    del counts[old]
                left += 1
            total += right - left + 1
        return total
    return at_most(k) - at_most(k - 1)`} /></SubSection><SubSection title="Sliding window maximum with a monotonic deque"><P>Keep indices in decreasing value order. Remove expired indices from the front and dominated smaller values from the back; the front is the current maximum. Each index enters and leaves once.</P><CodeBlock code={`from collections import deque

def sliding_maximum(nums: list[int], k: int) -> list[int]:
    if not 1 <= k <= len(nums):
        return []
    candidates: deque[int] = deque()
    answer: list[int] = []
    for right, value in enumerate(nums):
        while candidates and candidates[0] <= right - k:
            candidates.popleft()
        while candidates and nums[candidates[-1]] <= value:
            candidates.pop()
        candidates.append(right)
        if right >= k - 1:
            answer.append(nums[candidates[0]])
    return answer`} /></SubSection></Section>
      <Section title="When Sliding Windows Fail"><P>Classic expand/shrink windows depend on monotonicity: extending or shrinking must change validity in a predictable direction. Negative numbers break this for sum thresholds—a longer range can have a smaller sum and shrinking can increase or decrease it unpredictably.</P><Callout type="warning"><P>For subarray-sum-equals-k with arbitrary positive and negative values, use prefix sums plus a frequency map. For shortest subarray with sum at least k when negatives are allowed, a monotonic deque of prefix sums is a common approach.</P></Callout><Table headers={["Problem shape", "Useful technique", "Reason"]} rows={[["Fixed-size range statistic","Fixed sliding window","Outgoing and incoming items are known"],["Longest range satisfying monotone constraint","Expand then shrink","Each endpoint moves at most n times"],["Minimum covering range","Expand, record, shrink","Validity persists as a window is reduced until it fails"],["Sum threshold with negative values","Prefix sums / monotonic deque","Window validity is not monotone"],["Arbitrary range query, many queries","Prefix sums or range structure","Avoid rescanning each window"]]} /></Section>
      <Section title="Complexity and Practice"><P>Most sliding-window algorithms run in O(n) time because each boundary advances at most n times. State maintenance is O(1) for sums or fixed alphabets and O(distinct values) for a dictionary; the monotonic deque stores at most k indices. Returning all matching ranges adds output-size cost.</P><Table headers={["Pattern", "Time", "Extra space"]} rows={[["Fixed-size sum/average","O(n)","O(1)"],["Distinct/frequency window","O(n) expected","O(σ) up to distinct keys"],["Minimum window substring","O(n + σ) expected","O(σ)"],["Exactly k via atMost","O(n) expected","O(σ)"],["Window maximum deque","O(n)","O(k)"]]} /><Practice problems={[{name:"Maximum Average Subarray I",difficulty:"Easy",hint:"Maintain a fixed window sum"},{name:"Find All Anagrams in a String",difficulty:"Medium",hint:"Fixed length and character counts"},{name:"Longest Substring Without Repeating Characters",difficulty:"Medium",hint:"Last-seen index jumps"},{name:"Minimum Window Substring",difficulty:"Hard",hint:"Count required occurrences and shrink while covered"},{name:"Subarrays with K Different Integers",difficulty:"Hard",hint:"Subtract two at-most counts"},{name:"Sliding Window Maximum",difficulty:"Hard",hint:"Decreasing deque of indices"}]} /></Section>
      <KeyTakeaways items={[<>A sliding window works on contiguous ranges when its summary can be updated incrementally.</>,<>Fixed-size windows replace a leaving value with an entering value; variable windows move both boundaries monotonically.</>,<>Every element enters and leaves at most once, so nested while loops are often O(n).</>,<>For exactly k distinct values, subtract atMost(k−1) from atMost(k).</>,<>Negative numbers often destroy window monotonicity; use prefix sums or a monotonic deque instead.</>]} />
    </article>
  );
}