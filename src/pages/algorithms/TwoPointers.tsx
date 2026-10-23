import { ArrayViz, Callout, CodeBlock, KeyTakeaways, P, PageHeader, Practice, Section, Steps, Strong, SubSection, Table } from "../../components/doc";

export default function TwoPointers() {
  return (
    <article>
      <PageHeader eyebrow="Core Algorithms" title="Two Pointers" description="Use coordinated indices to turn repeated searching into a linear scan—especially when data is sorted, partitioned, or linked by a simple invariant." tags={["Opposite ends", "Read/write", "Fast/slow", "In-place"]} />
      <Section title="The Two-Pointer Idea"><P>Two pointers are indices or references that move through a sequence in a coordinated way. The key is a <Strong>discard rule</Strong>: after examining the pointed-to values, prove that one or more candidates can no longer be part of the answer. This proof often reduces O(n²) enumeration to O(n).</P><ArrayViz values={[1, 2, 4, 6, 9, 12]} highlight={[1, 4]} pointers={{1:"left",4:"right"}} caption="For a target sum on sorted values, move left upward when the sum is small; move right downward when it is large." /><Steps steps={[{title:"State the invariant",body:"Describe what the remaining interval or processed prefix represents."},{title:"Inspect the pointers",body:"Use the input structure (often sorted order) to decide which candidate range is impossible."},{title:"Move monotonically",body:"Advance one or both pointers so the scan never revisits a position."},{title:"Prove termination",body:"Each step shrinks a range or advances a pointer; handle duplicates and boundaries explicitly."}]} /></Section>
      <Section title="Opposite-Ends Pointers">
        <SubSection title="Two sum II on a sorted array"><P>Start at both ends. If the sum is too small, the left value must increase; if too large, decrease the right value. Sorted order makes the discarded row of candidate pairs impossible.</P><CodeBlock code={`def two_sum_sorted(nums: list[int], target: int) -> tuple[int, int] | None:
    left, right = 0, len(nums) - 1
    while left < right:
        total = nums[left] + nums[right]
        if total == target:
            return left, right
        if total < target:
            left += 1
        else:
            right -= 1
    return None`} /></SubSection>
        <SubSection title="Palindrome, container, 3Sum, and rain water"><P>For a palindrome, compare matching ends and move inward (skip non-alphanumeric characters if required). For container-with-most-water, move the shorter wall: the current area is limited by it, and moving only the taller wall cannot improve that bound. In 3Sum, sort, fix one value, then run two sum; skip equal fixed and pointer values to deduplicate. For trapping rain water, move the side with the smaller known boundary while maintaining left_max and right_max.</P><CodeBlock code={`def three_sum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    answer: list[list[int]] = []
    for i in range(len(nums) - 2):
        if i and nums[i] == nums[i - 1]:
            continue
        left, right = i + 1, len(nums) - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total == 0:
                answer.append([nums[i], nums[left], nums[right]])
                left += 1; right -= 1
                while left < right and nums[left] == nums[left - 1]: left += 1
                while left < right and nums[right] == nums[right + 1]: right -= 1
            elif total < 0: left += 1
            else: right -= 1
    return answer

def trap(height: list[int]) -> int:
    left, right = 0, len(height) - 1
    left_max = right_max = water = 0
    while left < right:
        if height[left] <= height[right]:
            left_max = max(left_max, height[left])
            water += left_max - height[left]
            left += 1
        else:
            right_max = max(right_max, height[right])
            water += right_max - height[right]
            right -= 1
    return water`} />
          <CodeBlock title="Palindrome and maximum area" code={`def is_palindrome(text: str) -> bool:
    left, right = 0, len(text) - 1
    while left < right:
        while left < right and not text[left].isalnum():
            left += 1
        while left < right and not text[right].isalnum():
            right -= 1
        if text[left].lower() != text[right].lower():
            return False
        left += 1; right -= 1
    return True

def max_container_area(height: list[int]) -> int:
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        best = max(best, (right - left) * min(height[left], height[right]))
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return best`} />
        </SubSection>
      </Section>
      <Section title="Same-Direction Read/Write Pointers"><P>Use a read pointer to inspect every element and a write pointer to mark the next position to keep. The prefix before write contains the compacted answer. This pattern avoids allocating a second array.</P><ArrayViz values={[1, 1, 2, 2, 3, 4]} highlight={[0, 1]} pointers={{0:"write",3:"read"}} caption="After processing, the prefix up to write contains the retained unique values; the suffix need not be cleared." /><CodeBlock code={`def remove_duplicates(nums: list[int]) -> int:
    if not nums:
        return 0
    write = 1
    for read in range(1, len(nums)):
        if nums[read] != nums[write - 1]:
            nums[write] = nums[read]
            write += 1
    return write

def move_zeroes(nums: list[int]) -> None:
    write = 0
    for read, value in enumerate(nums):
        if value != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1

def remove_element(nums: list[int], value: int) -> int:
    write = 0
    for read in range(len(nums)):
        if nums[read] != value:
            nums[write] = nums[read]
            write += 1
    return write`} /><Callout type="note"><P>Most in-place array problems specify that only the returned prefix matters. Do not spend time deleting or zeroing the unused suffix unless required.</P></Callout></Section>
      <Section title="Fast and Slow Pointers"><P>Two pointers can move at different speeds through a linked structure or deterministic sequence. A fast pointer moving two steps for every one step of slow can detect a cycle; in an acyclic list it reaches the end. To find the middle, the slow pointer advances one step while fast advances two.</P><CodeBlock code={`class ListNode:
    def __init__(self, value: int, next: "ListNode | None" = None):
        self.value = value
        self.next = next

def has_cycle(head: ListNode | None) -> bool:
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False

def middle_node(head: ListNode | None) -> ListNode | None:
    slow = fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
    return slow

def is_happy(n: int) -> bool:
    def next_number(x: int) -> int:
        total = 0
        while x:
            x, digit = divmod(x, 10)
            total += digit * digit
        return total
    slow, fast = n, next_number(n)
    while fast != 1 and slow != fast:
        slow = next_number(slow)
        fast = next_number(next_number(fast))
    return fast == 1`} /></Section>
      <Section title="Merging, Partitioning, and Subsequences">
        <SubSection title="Merge sorted arrays from the end"><P>When the first array has enough trailing capacity, fill from the back. Taking the larger of the two remaining values avoids overwriting unread values in the first array.</P><CodeBlock code={`def merge_into(nums1: list[int], m: int, nums2: list[int], n: int) -> None:
    i, j, write = m - 1, n - 1, m + n - 1
    while j >= 0:
        if i >= 0 and nums1[i] > nums2[j]:
            nums1[write] = nums1[i]; i -= 1
        else:
            nums1[write] = nums2[j]; j -= 1
        write -= 1`} /></SubSection>
        <SubSection title="Dutch national flag: three-way partition"><P>Maintain regions [0, low) of 0s, [low, mid) of 1s, [mid, high] unknown, and (high, end) of 2s. Do not advance mid when swapping a 2 from high: the swapped-in value has not been examined.</P><CodeBlock code={`def sort_colors(nums: list[int]) -> None:
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1; mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1`} /></SubSection>
        <SubSection title="Subsequence check"><P>Scan the candidate sequence once and advance its pointer only on a match. This is O(n + m) time and O(1) space, unlike comparing every possible substring.</P><CodeBlock code={`def is_subsequence(candidate: str, text: str) -> bool:
    i = 0
    for char in text:
        if i < len(candidate) and candidate[i] == char:
            i += 1
    return i == len(candidate)`} /></SubSection>
      </Section>
      <Section title="Recognizing and Applying the Pattern"><Table headers={["Clue", "Likely pattern", "Invariant to articulate"]} rows={[["Sorted input; pair or target condition","Opposite ends","Every discarded pair is impossible"],["Compact, filter, or overwrite in place","Read/write","Processed prefix is exactly the answer so far"],["Cycle, middle, or repeated state","Fast/slow","Relative speed guarantees collision or midpoint"],["Two sorted collections","Two advancing cursors","Each consumed item is finalized"],["Small fixed categories / pivot","Three-way partition","Each region has its promised category"]]} /><Callout type="warning"><P>Two pointers do not magically make an unsorted pair-sum problem linear. Sorting first costs O(n log n) and may change original indices; use a hash map when original positions matter.</P></Callout></Section>
      <Section title="Templates and Complexity"><CodeBlock title="Reusable scan shapes" code={`# Opposite ends
left, right = 0, len(items) - 1
while left < right:
    # inspect items[left], items[right]
    if should_advance_left:
        left += 1
    else:
        right -= 1

# Read / write
write = 0
for read, value in enumerate(items):
    if keep(value):
        items[write] = value
        write += 1
# answer is items[:write]`} skipVerify /><Table headers={["Pattern", "Time", "Auxiliary space", "Typical caveat"]} rows={[["Opposite ends","O(n)","O(1)","Often needs sorted input"],["Read/write","O(n)","O(1)","Suffix may contain stale values"],["Fast/slow","O(n)","O(1)","Pointer identity matters for linked lists"],["Merge two sorted arrays","O(m + n)","O(1) with spare capacity","Write from the end to avoid overwrite"],["Three-way partition","O(n)","O(1)","Reinspect item swapped from high end"]]} /></Section>
      <Section title="Practice Problems"><Practice problems={[{name:"Valid Palindrome",difficulty:"Easy",hint:"Normalize or skip unwanted characters while moving inward"},{name:"Container With Most Water",difficulty:"Medium",hint:"Move the shorter boundary"},{name:"3Sum",difficulty:"Medium",hint:"Sort, fix one value, skip duplicates"},{name:"Linked List Cycle II",difficulty:"Medium",hint:"Floyd collision, then reset one pointer"},{name:"Sort Colors",difficulty:"Medium",hint:"Maintain three known regions"},{name:"Trapping Rain Water",difficulty:"Hard",hint:"Track maxima as boundaries close"}]} /></Section>
      <KeyTakeaways items={[<>A valid two-pointer solution relies on a clear rule for eliminating candidates.</>,<>Sorted order enables opposite-end scans; read/write pointers compact data in-place.</>,<>Fast/slow pointers detect cycles and locate midpoints without extra memory.</>,<>Monotone pointer movement gives linear time, usually with O(1) auxiliary space.</>]} />
    </article>
  );
}