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

export default function Intervals() {
  return (
    <article>
      <PageHeader
        eyebrow="Core Algorithms"
        title="Intervals & Sweep Line"
        description="Sort and reason about ranges to merge schedules, choose non-overlapping activities, count concurrent events, and solve geometric overlap problems."
        tags={["Sorting", "Greedy", "Events", "Scheduling"]}
      />

      <Section title="Interval Models & Overlap">
        <P>
          An interval stores a start and end, often as <C>[start, end]</C>. For two closed intervals
          <C>a = [a.start, a.end]</C> and <C>b = [b.start, b.end]</C>, they overlap when
          <C>a.start &lt;= b.end</C> and <C>b.start &lt;= a.end</C>. For half-open ranges <C>[start, end)</C>,
          touching at one endpoint is not overlap: use strict inequalities instead.
        </P>
        <Diagram caption="Closed ranges overlap at the shared endpoint; half-open ranges do not.">{`
          closed:    [------] [------]       shared endpoint is included
          half-open: [------) [------)       adjacent ranges are disjoint
        `}</Diagram>
        <CodeBlock
          title="overlap.py"
          code={`
            def overlaps_closed(a: tuple[int, int], b: tuple[int, int]) -> bool:
                return a[0] <= b[1] and b[0] <= a[1]

            def overlaps_half_open(a: tuple[int, int], b: tuple[int, int]) -> bool:
                return a[0] < b[1] and b[0] < a[1]

            print(overlaps_closed((1, 3), (3, 5)), overlaps_half_open((1, 3), (3, 5)))
          `}
          output="True False"
        />
        <Callout type="warning" title="State the endpoint convention">
          “Touching intervals overlap” is not universal. Calendar reservations often use half-open intervals, so one
          meeting may end exactly when another begins. Merge and event tie rules must match the convention.
        </Callout>
      </Section>

      <Section title="Sort by Start or End">
        <P>
          Sort by <Strong>start</Strong> when the next interval's position relative to the current merged range
          matters: this makes merging and insertion a single forward scan. Sort by <Strong>end</Strong> for activity
          selection: choosing the interval that finishes earliest leaves as much room as possible for later choices.
          Sorting is usually <C>O(n log n)</C>; subsequent scans are linear.
        </P>
        <Table
          headers={["Sort key", "Typical use", "Why it helps"]}
          rows={[
            ["Start ascending", "Merge, insert, intersections", "Candidate intervals arrive from left to right"],
            ["End ascending", "Erase overlaps, minimum arrows", "Earliest finishing choice preserves future capacity"],
            ["Event coordinate", "Concurrent counts, sweep line", "Maintains state as a boundary moves across the line"],
          ]}
        />
      </Section>

      <Section title="Merge, Insert & Intersect">
        <SubSection title="Merge overlapping intervals">
          <P>
            After sorting by start, append a new range if it is strictly separated; otherwise extend the last end to
            the larger endpoint. For closed intervals that touch, compare <C>start &gt; previous_end</C> to detect a
            gap. For half-open intervals, adjacency can be treated separately according to whether coalescing is
            desired.
          </P>
          <CodeBlock
            title="merge_intervals.py"
            code={`
              def merge(intervals: list[list[int]]) -> list[list[int]]:
                  result = []
                  for start, end in sorted(intervals):
                      if not result or start > result[-1][1]:
                          result.append([start, end])
                      else:
                          result[-1][1] = max(result[-1][1], end)
                  return result

              print(merge([[1, 3], [2, 6], [8, 10], [10, 12]]))
            `}
            output="[[1, 6], [8, 12]]"
          />
        </SubSection>
        <SubSection title="Insert into sorted disjoint intervals">
          <P>
            Copy intervals entirely before the new one, merge every interval that overlaps it, then append the
            remaining suffix. If the existing input is sorted and non-overlapping, this needs only one pass.
          </P>
          <CodeBlock
            title="insert_interval.py"
            code={`
              def insert_interval(intervals: list[list[int]], new: list[int]) -> list[list[int]]:
                  result = []
                  i = 0
                  while i < len(intervals) and intervals[i][1] < new[0]:
                      result.append(intervals[i])
                      i += 1
                  start, end = new
                  while i < len(intervals) and intervals[i][0] <= end:
                      start = min(start, intervals[i][0])
                      end = max(end, intervals[i][1])
                      i += 1
                  result.append([start, end])
                  result.extend(intervals[i:])
                  return result

              print(insert_interval([[1, 2], [5, 7], [9, 12]], [6, 10]))
            `}
            output="[[1, 2], [5, 12]]"
          />
        </SubSection>
        <SubSection title="Intersection of two interval lists">
          <P>
            For two sorted, internally disjoint lists, compare their current pair and emit their intersection if the
            start does not exceed the end. Advance the interval that ends first; it cannot intersect any later
            interval from the other list.
          </P>
          <CodeBlock
            title="interval_intersection.py"
            code={`
              def intersect(a: list[list[int]], b: list[list[int]]) -> list[list[int]]:
                  i = j = 0
                  result = []
                  while i < len(a) and j < len(b):
                      start = max(a[i][0], b[j][0])
                      end = min(a[i][1], b[j][1])
                      if start <= end:
                          result.append([start, end])
                      if a[i][1] < b[j][1]:
                          i += 1
                      else:
                          j += 1
                  return result

              print(intersect([[0, 2], [5, 10]], [[1, 5], [8, 12]]))
            `}
            output="[[1, 2], [5, 5], [8, 10]]"
          />
        </SubSection>
      </Section>

      <Section title="Greedy Scheduling & Arrows">
        <P>
          To keep the maximum number of mutually non-overlapping intervals, sort by end and accept an interval when
          its start is compatible with the end of the last chosen one. The minimum number to remove is total minus
          the maximum kept. A minimum set of arrows that bursts all closed balloons uses the same earliest-end greedy:
          place an arrow at the current intersection's right edge.
        </P>
        <CodeBlock
          title="non_overlapping_and_arrows.py"
          code={`
            def max_non_overlapping(intervals: list[list[int]]) -> int:
                kept = 0
                last_end = float("-inf")
                for start, end in sorted(intervals, key=lambda item: item[1]):
                    if start >= last_end:
                        kept += 1
                        last_end = end
                return kept

            def minimum_arrows(points: list[list[int]]) -> int:
                if not points:
                    return 0
                points.sort(key=lambda point: point[1])
                arrows = 0
                arrow_at = float("-inf")
                for start, end in points:
                    if start > arrow_at:
                        arrows += 1
                        arrow_at = end
                return arrows

            meetings = [[1, 2], [2, 3], [3, 4], [1, 3]]
            print(max_non_overlapping(meetings), minimum_arrows([[10, 16], [2, 8], [1, 6], [7, 12]]))
          `}
          output="3 2"
        />
        <Callout type="note">
          For half-open meeting ranges, touching is compatible and <C>start &gt;= last_end</C> is right. For closed
          ranges, touching intersects, so the compatibility test becomes <C>start &gt; last_end</C>. Greedy validity
          depends on this detail.
        </Callout>
      </Section>

      <Section title="Meeting Rooms & Event Sweeps">
        <SubSection title="Meeting Rooms I and II">
          <P>
            Meeting Rooms I asks whether any overlap exists; sorting by start and comparing adjacent ranges is enough.
            Meeting Rooms II asks for the maximum simultaneous room count. A min-heap tracks current meeting end
            times, or two sorted start/end arrays count active meetings with two pointers.
          </P>
          <CodeBlock
            title="meeting_rooms.py"
            code={`
              import heapq

              def minimum_rooms(intervals: list[list[int]]) -> int:
                  ends = []
                  for start, end in sorted(intervals):
                      if ends and ends[0] <= start:
                          heapq.heappop(ends)
                      heapq.heappush(ends, end)
                  return len(ends)

              def rooms_two_pointers(intervals: list[list[int]]) -> int:
                  starts = sorted(item[0] for item in intervals)
                  ends = sorted(item[1] for item in intervals)
                  active = best = end_index = 0
                  for start in starts:
                      while end_index < len(ends) and ends[end_index] <= start:
                          active -= 1
                          end_index += 1
                      active += 1
                      best = max(best, active)
                  return best

              meetings = [[0, 30], [5, 10], [15, 20]]
              print(minimum_rooms(meetings), rooms_two_pointers(meetings))
            `}
            output="2 2"
          />
        </SubSection>
        <SubSection title="Sweep-line events and tie breaking">
          <P>
            Turn each interval into a start and end event, sort coordinates, and maintain an active count or set while
            sweeping left to right. For half-open intervals, process ends before starts at the same coordinate; for
            closed intervals, starts before ends preserves endpoint overlap. An explicit event priority avoids
            accidental dependence on tuple sort order.
          </P>
          <CodeBlock
            title="maximum_overlap.py"
            code={`
              def maximum_overlap(intervals: list[tuple[int, int]]) -> int:
                  events = []
                  for start, end in intervals:
                      events.append((start, 1))
                      events.append((end, -1))
                  active = best = 0
                  for _, delta in sorted(events, key=lambda event: (event[0], event[1])):
                      active += delta
                      best = max(best, active)
                  return best

              print(maximum_overlap([(1, 4), (2, 5), (4, 6)]))
            `}
            output="2"
          />
          <P>
            In this example end events sort before starts, so the code follows the half-open convention. For
            car-pooling capacity, sort passenger drop-offs before pickups at a shared location; track a running sum
            of passenger changes and fail once it exceeds capacity.
          </P>          <CodeBlock
            title="car_pooling.py"
            code={`
              def can_carry(trips: list[tuple[int, int, int]], capacity: int) -> bool:
                  events = []
                  for passengers, start, end in trips:
                      events.append((start, passengers))
                      events.append((end, -passengers))
                  active = 0
                  for _, delta in sorted(events, key=lambda event: (event[0], event[1])):
                      active += delta
                      if active > capacity:
                          return False
                  return True

              print(can_carry([(2, 1, 5), (3, 3, 7)], 4), can_carry([(2, 1, 5), (3, 3, 7)], 5))
            `}
            output="False True"
          />
        </SubSection>
      </Section>

      <Section title="Advanced Interval Patterns">
        <SubSection title="Employee free time">
          <P>
            Flatten all employees' busy intervals, merge them, and take the gaps between consecutive merged ranges.
            For inputs already sorted by employee, a heap-based k-way merge avoids sorting all <C>N</C> intervals.
          </P>
          <CodeBlock
            title="employee_free_time.py"
            code={`
              def free_time(schedule: list[list[list[int]]]) -> list[list[int]]:
                  busy = sorted(interval for employee in schedule for interval in employee)
                  merged = []
                  for start, end in busy:
                      if not merged or start > merged[-1][1]:
                          merged.append([start, end])
                      else:
                          merged[-1][1] = max(merged[-1][1], end)
                  return [[merged[i - 1][1], merged[i][0]]
                          for i in range(1, len(merged))
                          if merged[i - 1][1] < merged[i][0]]

              work = [[[1, 3], [6, 7]], [[2, 4]], [[2, 5], [9, 12]]]
              print(free_time(work))
            `}
            output="[[5, 6], [7, 9]]"
          />
        </SubSection>
        <SubSection title="My Calendar I and II">
          <P>
            A sorted list with binary search insertion handles Calendar I: a new half-open booking is valid when it
            does not overlap its immediate neighbors. Calendar II must reject triple bookings; check the candidate
            against existing double-booked segments, then record its overlaps with accepted bookings. A balanced
            interval tree improves updates when the schedule is large.
          </P>
          <CodeBlock
            title="calendar_booking.py"
            code={`
              from bisect import bisect_left

              class MyCalendar:
                  def __init__(self):
                      self.bookings = []

                  def book(self, start: int, end: int) -> bool:
                      i = bisect_left(self.bookings, (start, end))
                      if i > 0 and self.bookings[i - 1][1] > start:
                          return False
                      if i < len(self.bookings) and end > self.bookings[i][0]:
                          return False
                      self.bookings.insert(i, (start, end))
                      return True

              calendar = MyCalendar()
              print(calendar.book(10, 20), calendar.book(15, 25), calendar.book(20, 30))
            `}
            output="True False True"
          />
          <CodeBlock
            title="calendar_two.py"
            code={`
              class MyCalendarTwo:
                  def __init__(self):
                      self.bookings = []
                      self.overlaps = []

                  def book(self, start: int, end: int) -> bool:
                      if any(start < right and left < end for left, right in self.overlaps):
                          return False
                      for left, right in self.bookings:
                          lo, hi = max(start, left), min(end, right)
                          if lo < hi:
                              self.overlaps.append((lo, hi))
                      self.bookings.append((start, end))
                      return True

              cal = MyCalendarTwo()
              print(cal.book(10, 20), cal.book(50, 60), cal.book(10, 40), cal.book(5, 15))
            `}
            output="True True True False"
          />
        </SubSection>
        <SubSection title="Difference arrays, rectangles, and skyline">
          <P>
            A difference array records a range update with two boundary changes, then a prefix scan reconstructs
            values. For half-open <C>[l, r)</C>, add at <C>l</C> and subtract at <C>r</C>. Rectangle union area
            sweeps vertical edges; between adjacent x-coordinates, multiply the width by the covered y-length. A
            segment tree over compressed y-coordinates maintains that covered length.
          </P>
          <P>
            Skyline uses the same sweep idea, but the active state is building heights. Add buildings at their left
            edge, lazily remove expired heights from a max-heap, and emit a key point whenever the visible maximum
            changes. Event ordering at shared x coordinates must account for all starts and ends before emitting one
            point.
          </P>          <CodeBlock
            title="skyline.py"
            code={`
              import heapq

              def skyline(buildings: list[list[int]]) -> list[list[int]]:
                  buildings.sort()
                  heap = []
                  points = []
                  i = 0
                  edges = sorted({edge for left, right, _ in buildings for edge in (left, right)})
                  for x in edges:
                      while i < len(buildings) and buildings[i][0] <= x:
                          _, right, height = buildings[i]
                          heapq.heappush(heap, (-height, right))
                          i += 1
                      while heap and heap[0][1] <= x:
                          heapq.heappop(heap)
                      height = -heap[0][0] if heap else 0
                      if not points or points[-1][1] != height:
                          points.append([x, height])
                  return points

              skyline_points = skyline([[2, 9, 10], [3, 7, 15], [5, 12, 12],
                                        [15, 20, 10], [19, 24, 8]])
              print(skyline_points)
            `}
            output="[[2, 10], [3, 15], [7, 12], [12, 0], [15, 10], [20, 8], [24, 0]]"
          />
          <CodeBlock
            title="difference_array.py"
            code={`
              def apply_range_updates(size: int, updates: list[tuple[int, int, int]]) -> list[int]:
                  diff = [0] * (size + 1)
                  for left, right, amount in updates:
                      diff[left] += amount
                      diff[right] -= amount
                  result = []
                  running = 0
                  for value in diff[:-1]:
                      running += value
                      result.append(running)
                  return result

              print(apply_range_updates(5, [(1, 4, 2), (2, 5, 3)]))
            `}
            output="[0, 2, 5, 5, 3]"
          />
        </SubSection>
      </Section>

      <Section title="Patterns & Complexity">
        <Table
          headers={["Problem shape", "Pattern", "Key invariant"]}
          rows={[
            ["Combine overlapping ranges", "Sort by start, merge scan", "Output ranges are ordered and disjoint"],
            ["Keep most compatible activities", "Sort by end, greedy", "Chosen interval ends as early as possible"],
            ["Intersect two ordered lists", "Two pointers", "Advance the interval ending first"],
            ["Count active resources", "Heap or event sweep", "Active events correspond to simultaneous use"],
            ["Range increments", "Difference array", "Prefix sum restores each point's total change"],
            ["2D geometric union", "Sweep line + segment tree", "Maintain covered measure on the orthogonal axis"],
          ]}
        />
        <ComplexityTable
          rows={[
            { operation: "Merge / sort intervals", time: "O(n log n)", space: "O(n)" },
            { operation: "Insert into sorted list", time: "O(n)", space: "O(n)", note: "List insertion/copy" },
            { operation: "Intersect two lists", time: "O(n + m)", space: "O(k)", note: "k output intersections" },
            { operation: "Greedy scheduling after sort", time: "O(n log n)", space: "O(1)" },
            { operation: "Meeting rooms with heap", time: "O(n log n)", space: "O(n)" },
            { operation: "Sweep-line maximum overlap", time: "O(n log n)", space: "O(n)" },
            { operation: "Calendar I sorted list", time: "O(log n) search, O(n) insert", space: "O(n)", note: "Array insertion shifts values" },
            { operation: "Rectangle union area", time: "O(n log n)", space: "O(n)", note: "With coordinate compression and segment tree" },
          ]}
        />
        <ProsCons
          pros={["Sorting turns many global range relationships into local scans", "Greedy proofs are short once the invariant is clear", "Event sweeps generalize from schedules to geometry"]}
          cons={["Endpoint conventions change overlap and tie behavior", "Sorted arrays have linear-time insertion", "Geometric sweeps need careful event and data-structure invariants"]}
        />
      </Section>

      <Section title="Pitfalls & Practice">
        <Callout type="warning" title="Interval bug checklist">
          Confirm closed versus half-open endpoints; decide whether touching ranges merge; sort by the field your proof
          requires; handle equal-coordinate events explicitly; avoid mutating caller-owned arrays unexpectedly; and use
          a min-heap for earliest finish rather than assuming insertion order.
        </Callout>
        <Practice
          problems={[
            { name: "Merge Intervals", difficulty: "Medium", hint: "Sort by start and grow the current end" },
            { name: "Insert Interval", difficulty: "Medium", hint: "Copy left, merge overlaps, append right" },
            { name: "Non-overlapping Intervals", difficulty: "Medium", hint: "Greedy by earliest finish" },
            { name: "Minimum Number of Arrows to Burst Balloons", difficulty: "Medium", hint: "Intersect ranges by end" },
            { name: "Meeting Rooms II", difficulty: "Medium", hint: "Heap of active meeting end times" },
            { name: "Employee Free Time", difficulty: "Hard", hint: "Flatten and merge, or k-way merge sorted schedules" },
            { name: "My Calendar II", difficulty: "Medium", hint: "Track pairwise overlap segments; reject triple overlap" },
            { name: "The Skyline Problem", difficulty: "Hard", hint: "Sweep x positions while maintaining active heights" },
          ]}
        />
      </Section>

      <KeyTakeaways
        items={[
          <>Choose endpoint overlap conditions before coding; closed and half-open intervals differ at ties.</>,
          <>Sort by start to merge; sort by end to greedily maximize non-overlapping intervals.</>,
          <>Heaps and sweep-line events count concurrent intervals; tie ordering encodes endpoint semantics.</>,
          <>Difference arrays turn range updates into two point changes followed by a prefix scan.</>,
          <>Skyline and rectangle union are sweeps whose active state needs a heap or segment tree.</>,
        ]}
      />
    </article>
  );
}