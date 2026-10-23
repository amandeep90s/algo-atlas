import {
  ArrayViz,
  Callout,
  CodeBlock,
  ComplexityTable,
  C,
  KeyTakeaways,
  P,
  PageHeader,
  Practice,
  ProsCons,
  Section,
  Strong,
  SubSection,
} from "../../components/doc";

export default function Arrays() {
  return (
    <article>
      <PageHeader
        eyebrow="Linear Data Structures"
        title="Arrays"
        description="The most fundamental data structure: a sequence of elements stored in contiguous memory, giving instant access to any element by its index."
        tags={["Random access", "Dynamic arrays", "Python list", "2D arrays"]}
      />

      <Section title="What is an Array?">
        <P>
          An <Strong>array</Strong> stores elements one after another in a single, contiguous block of memory. Because
          every slot has the same size, the address of element <C>i</C> is simply{" "}
          <C>base_address + i × element_size</C>. That arithmetic is why reading or writing any index takes{" "}
          <Strong>constant time</Strong>.
        </P>
        <ArrayViz
          values={[7, 2, 9, 4, 1, 8]}
          highlight={[3]}
          pointers={{ 3: "nums[3]" }}
          caption="Accessing nums[3] jumps directly to the 4th slot — no scanning required."
        />
        <P>
          Python does not have a raw fixed-size array in everyday code. Instead, its built-in <C>list</C> is a{" "}
          <Strong>dynamic array</Strong>: an array of references to objects that automatically grows when it runs out of
          room.
        </P>
      </Section>

      <Section title="Static vs Dynamic Arrays">
        <P>
          A <Strong>static array</Strong> has a fixed capacity chosen at creation. A <Strong>dynamic array</Strong>{" "}
          over-allocates space; when it fills up, it allocates a larger block (typically ~1.125× – 2× bigger), copies
          the elements over, and frees the old block.
        </P>
        <Callout type="insight" title="Amortized O(1) append">
          Resizing costs <C>O(n)</C>, but it happens so rarely (geometrically growing capacity) that the{" "}
          <Strong>average</Strong> cost per <C>append</C> over many operations is <C>O(1)</C>. This is called{" "}
          <Strong>amortized</Strong> constant time.
        </Callout>
        <CodeBlock
          title="dynamic_array.py"
          code={`
            import ctypes

            class DynamicArray:
                """A minimal dynamic array, similar to Python's list."""

                def __init__(self):
                    self._size = 0
                    self._capacity = 1
                    self._data = self._make_array(self._capacity)

                def __len__(self):
                    return self._size

                def __getitem__(self, index):
                    if not 0 <= index < self._size:
                        raise IndexError("index out of range")
                    return self._data[index]

                def append(self, value):
                    if self._size == self._capacity:
                        self._resize(2 * self._capacity)   # double when full
                    self._data[self._size] = value
                    self._size += 1

                def _resize(self, new_capacity):
                    new_data = self._make_array(new_capacity)
                    for i in range(self._size):           # O(n) copy
                        new_data[i] = self._data[i]
                    self._data = new_data
                    self._capacity = new_capacity

                @staticmethod
                def _make_array(capacity):
                    return (capacity * ctypes.py_object)()

            arr = DynamicArray()
            for x in range(5):
                arr.append(x * 10)
            print(len(arr), arr[4], arr._capacity)
          `}
          output="5 40 8"
        />
      </Section>

      <Section title="Core Operations">
        <SubSection title="Access and update">
          <CodeBlock
            code={`
              nums = [10, 20, 30, 40, 50]
              print(nums[0], nums[-1])   # first and last -> O(1)
              nums[2] = 99               # update in place -> O(1)
              print(nums)
            `}
            output={`
              10 50
              [10, 20, 99, 40, 50]
            `}
          />
        </SubSection>
        <SubSection title="Insertion and deletion">
          <P>
            Adding or removing at the <Strong>end</Strong> is cheap. Doing it anywhere else forces every element after
            the position to shift by one slot, which costs <C>O(n)</C>.
          </P>
          <ArrayViz
            values={[1, 2, "→", 3, 4, 5]}
            highlight={[2]}
            dim={[3, 4, 5]}
            showIndices={false}
            caption="Inserting at index 2 shifts every later element one position to the right."
          />
          <CodeBlock
            code={`
              nums = [1, 2, 3, 4, 5]
              nums.append(6)        # O(1) amortized
              nums.insert(0, 0)     # O(n) - shifts everything right
              nums.pop()            # O(1) - remove last
              nums.pop(0)           # O(n) - shifts everything left
              nums.remove(3)        # O(n) - search + shift
              print(nums)
            `}
            output="[1, 2, 4, 5]"
          />
        </SubSection>
        <SubSection title="Searching, slicing and iteration">
          <CodeBlock
            code={`
              nums = [4, 8, 15, 16, 23, 42]

              print(15 in nums)           # linear search -> O(n)
              print(nums.index(23))       # O(n)
              print(nums[1:4])            # slicing copies k elements -> O(k)
              print(nums[::-1])           # reversed copy -> O(n)

              for i, value in enumerate(nums):
                  if value % 2:
                      print(f"odd value {value} at index {i}")
            `}
            output={`
              True
              4
              [8, 15, 16]
              [42, 23, 16, 15, 8, 4]
              odd value 15 at index 2
              odd value 23 at index 4
            `}
          />
        </SubSection>
      </Section>

      <Section title="Complexity">
        <ComplexityTable
          rows={[
            { operation: <C>a[i]</C>, time: "O(1)", note: "Direct address computation" },
            { operation: <C>a[i] = x</C>, time: "O(1)" },
            { operation: <C>a.append(x)</C>, time: "O(1)*", note: "Amortized; occasional O(n) resize" },
            { operation: <C>a.pop()</C>, time: "O(1)" },
            { operation: <C>a.insert(i, x)</C>, time: "O(n)", note: "Shifts n − i elements" },
            { operation: <C>a.pop(i)</C>, time: "O(n)", note: "Shifts elements left" },
            { operation: <C>x in a</C>, time: "O(n)", note: "Linear scan" },
            { operation: <C>a[i:j]</C>, time: "O(k)", note: "k = j − i, creates a copy" },
            { operation: <C>a.sort()</C>, time: "O(n log n)", note: "Timsort, stable" },
            { operation: <C>min(a)</C>, time: "O(n)" },
          ]}
        />
      </Section>

      <Section title="Multi-dimensional Arrays">
        <P>
          A 2D grid is represented as a list of lists. Be careful with initialization — multiplying a list of lists
          copies <Strong>references</Strong>, not rows.
        </P>
        <CodeBlock
          code={`
            rows, cols = 3, 4

            wrong = [[0] * cols] * rows          # every row is the SAME list!
            wrong[0][0] = 1
            print(wrong)

            grid = [[0] * cols for _ in range(rows)]   # independent rows
            grid[0][0] = 1
            print(grid)

            # Traverse in row-major order
            for r in range(rows):
                for c in range(cols):
                    grid[r][c] = r * cols + c

            # Transpose with zip
            transposed = [list(col) for col in zip(*grid)]
            print(transposed)
          `}
          output={`
            [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]]
            [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
            [[0, 4, 8], [1, 5, 9], [2, 6, 10], [3, 7, 11]]
          `}
        />
        <Callout type="warning">
          <C>[[0] * cols] * rows</C> is one of the most common Python bugs in grid problems. Always use a list
          comprehension to build 2D arrays.
        </Callout>
      </Section>

      <Section title="Classic Array Techniques">
        <SubSection title="In-place reversal">
          <CodeBlock
            code={`
              def reverse(nums: list[int]) -> None:
                  left, right = 0, len(nums) - 1
                  while left < right:
                      nums[left], nums[right] = nums[right], nums[left]
                      left += 1
                      right -= 1
            `}
          />
        </SubSection>
        <SubSection title="Kadane's algorithm — maximum subarray sum">
          <P>
            At each index decide: extend the previous subarray, or start fresh here. This turns an <C>O(n²)</C>{" "}
            brute force into a single <C>O(n)</C> pass.
          </P>
          <CodeBlock
            code={`
              def max_subarray(nums: list[int]) -> int:
                  best = current = nums[0]
                  for x in nums[1:]:
                      current = max(x, current + x)
                      best = max(best, current)
                  return best

              print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))
            `}
            output="6"
          />
        </SubSection>
        <SubSection title="Rotate an array by k steps">
          <CodeBlock
            code={`
              def rotate(nums: list[int], k: int) -> None:
                  """Rotate right by k using three reversals: O(n) time, O(1) space."""
                  n = len(nums)
                  k %= n

                  def rev(lo: int, hi: int) -> None:
                      while lo < hi:
                          nums[lo], nums[hi] = nums[hi], nums[lo]
                          lo, hi = lo + 1, hi - 1

                  rev(0, n - 1)
                  rev(0, k - 1)
                  rev(k, n - 1)

              data = [1, 2, 3, 4, 5, 6, 7]
              rotate(data, 3)
              print(data)
            `}
            output="[5, 6, 7, 1, 2, 3, 4]"
          />
        </SubSection>
      </Section>

      <Section title="When to Use Arrays">
        <ProsCons
          pros={[
            "O(1) random access by index",
            "Excellent cache locality — fast iteration in practice",
            "Compact memory with minimal per-element overhead",
            "Amortized O(1) append and pop at the end",
          ]}
          cons={[
            "O(n) insertion and deletion in the middle or front",
            "O(n) search unless sorted",
            "Resizing occasionally copies the entire array",
            "Fixed-size arrays waste or run out of space",
          ]}
        />
        <Callout type="tip">
          Need fast inserts/removals at <Strong>both</Strong> ends? Use <C>collections.deque</C>. Storing millions of
          numbers? Consider the <C>array</C> module or NumPy for compact, typed storage.
        </Callout>
      </Section>

      <Section title="Practice Problems">
        <Practice
          problems={[
            { name: "Two Sum", difficulty: "Easy", hint: "Hash map of value → index" },
            { name: "Best Time to Buy and Sell Stock", difficulty: "Easy", hint: "Track the running minimum" },
            { name: "Product of Array Except Self", difficulty: "Medium", hint: "Prefix and suffix products" },
            { name: "Maximum Subarray", difficulty: "Medium", hint: "Kadane's algorithm" },
            { name: "Rotate Image", difficulty: "Medium", hint: "Transpose then reverse rows" },
            { name: "First Missing Positive", difficulty: "Hard", hint: "Use the array itself as a hash table" },
          ]}
        />
      </Section>

      <KeyTakeaways
        items={[
          <>Arrays give <C>O(1)</C> indexed access thanks to contiguous memory.</>,
          <>Python's <C>list</C> is a dynamic array with amortized <C>O(1)</C> append.</>,
          <>Inserting or deleting anywhere but the end costs <C>O(n)</C>.</>,
          <>Build 2D grids with a comprehension, never <C>[[0] * c] * r</C>.</>,
          <>Many array problems reduce to two pointers, prefix sums, sliding windows or hashing.</>,
        ]}
      />
    </article>
  );
}
