import {
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
  SubSection,
  Table,
} from "../../components/doc";

export default function BitManipulation() {
  return (
    <article>
      <PageHeader
        eyebrow="Core Algorithms"
        title="Bit Manipulation"
        description="Treat integers as collections of binary flags. A few compact operators make it possible to test, combine, count, and enumerate those flags efficiently."
        tags={["Binary", "Bitwise operators", "Bitmask", "XOR"]}
      />

      <Section title="Binary Representation and Two’s Complement">
        <P>
          Binary uses powers of two: <C>13 = 8 + 4 + 1 = 1101₂</C>. In a fixed-width machine word, negative integers are usually stored in two’s complement: invert the bits of the positive magnitude and add one. For example, in 8 bits, <C>-5</C> is <C>11111011</C>.
        </P>
        <Diagram caption="Bit positions carry weights 1, 2, 4, 8, ... from right to left.">{`
              bit position:  3   2   1   0
              bit value:     8   4   2   1
              binary 1101:   1   1   0   1
              contribution:  8 + 4 + 0 + 1 = 13
`}</Diagram>
        <P>Python integers have arbitrary precision and conceptually use an unbounded sign extension for negative values. Thus <C>~x == -x - 1</C>, and right shift of a negative value is arithmetic (sign-extending), not a logical zero-fill.</P>
        <Callout type="warning" title="Simulating 32-bit values">
          To constrain operations to 32 bits, mask with <C>0xFFFFFFFF</C>. Convert the high-bit result back to signed form only when required by the problem.
        </Callout>
        <CodeBlock title="Python binary utilities" code={`
          value = 13
          print(bin(value))          # '0b1101'
          print(int("1101", 2))      # 13
          print(value.bit_count())   # 3 (Python 3.10+)
          print(bin(value).count("1"))

          mask32 = 0xFFFFFFFF
          negative_five_as_32_bits = (-5) & mask32
          print(f"{negative_five_as_32_bits:032b}")

          def to_signed_32(value: int) -> int:
              value &= 0xFFFFFFFF
              return value if value < 0x80000000 else value - 0x100000000
        `} />
      </Section>

      <Section title="Bitwise Operators">
        <Table headers={["Operator", "Meaning", "Example"]} rows={[
          [<C>a &amp; b</C>, "AND: one only when both bits are 1", <C>1100 &amp; 1010 = 1000</C>],
          [<C>a | b</C>, "OR: one when either bit is 1", <C>1100 | 1010 = 1110</C>],
          [<C>a ^ b</C>, "XOR: one when bits differ", <C>1100 ^ 1010 = 0110</C>],
          [<C>~a</C>, "NOT: invert every conceptual bit", <><C>~5 = -6</C> in Python</>],
          [<C>a &lt;&lt; k</C>, "Shift left k places; multiply by 2ᵏ for nonnegative a", <C>3 &lt;&lt; 2 = 12</C>],
          [<C>a &gt;&gt; k</C>, "Arithmetic right shift in Python", <C>12 &gt;&gt; 2 = 3</C>],
        ]} />
        <SubSection title="Truth tables">
          <Table headers={["A", "B", "A AND B", "A OR B", "A XOR B"]} rows={[
            ["0", "0", "0", "0", "0"],
            ["0", "1", "0", "1", "1"],
            ["1", "0", "0", "1", "1"],
            ["1", "1", "1", "1", "0"],
          ]} />
        </SubSection>
        <Callout type="note">Python precedence can surprise: parenthesize bitwise comparisons, e.g. <C>(mask &amp; bit) != 0</C>. Shifts and bitwise operators act on integers, not booleans alone.</Callout>
      </Section>

      <Section title="Essential Bit Tricks">
        <P>Number bits from zero at the least-significant (rightmost) position. To build bit <C>i</C>, use <C>1 &lt;&lt; i</C>.</P>
        <CodeBlock code={`
          def has_bit(mask: int, i: int) -> bool:
              return (mask & (1 << i)) != 0

          def set_bit(mask: int, i: int) -> int:
              return mask | (1 << i)

          def clear_bit(mask: int, i: int) -> int:
              return mask & ~(1 << i)

          def toggle_bit(mask: int, i: int) -> int:
              return mask ^ (1 << i)

          x = 40  # binary 101000
          lowest = x & -x            # isolates the lowest set bit: 8
          without_lowest = x & (x - 1)  # clears it: 32
          is_power_of_two = x > 0 and (x & (x - 1)) == 0
        `} />
        <P><C>x &amp; -x</C> isolates the lowest set bit because two’s-complement negation preserves that bit and flips the bits above it. <C>x &amp; (x - 1)</C> clears precisely that bit.</P>
        <SubSection title="XOR properties and swapping">
          <List items={[
            <>Identity: <C>x ^ 0 == x</C>; self-cancel: <C>x ^ x == 0</C>.</>,
            <>XOR is commutative and associative, so paired values cancel regardless of order.</>,
            <>XOR-swap exists but is less readable and fails if both names alias the same storage; use Python tuple assignment instead.</>,
          ]} />
          <CodeBlock code={`
            # XOR swap demonstration (not recommended in normal Python)
            a, b = 7, 12
            a ^= b
            b ^= a
            a ^= b

            # Prefer this:
            a, b = b, a
          `} />
        </SubSection>
      </Section>

      <Section title="Counting Set Bits and Classic Problems">
        <SubSection title="Brian Kernighan’s algorithm">
          <P>Repeatedly clear the lowest set bit; the loop runs exactly once per set bit.</P>
          <CodeBlock code={`
            def count_bits(n: int) -> int:
                count = 0
                while n:
                    n &= n - 1
                    count += 1
                return count

            def count_bits_u32(n: int) -> int:
                n &= 0xFFFFFFFF
                count = 0
                while n:
                    n &= n - 1
                    count += 1
                return count
          `} />
        </SubSection>
        <SubSection title="Single Number, II, and III">
          <CodeBlock title="XOR pair and bit-state counters" code={`
            def single_number(nums: list[int]) -> int:
                answer = 0
                for value in nums:
                    answer ^= value
                return answer

            def single_number_thrice(nums: list[int]) -> int:
                ones = twos = 0
                for value in nums:
                    ones = (ones ^ value) & ~twos
                    twos = (twos ^ value) & ~ones
                return ones

            def two_single_numbers(nums: list[int]) -> tuple[int, int]:
                xor_all = 0
                for value in nums:
                    xor_all ^= value
                distinguishing_bit = xor_all & -xor_all
                first = second = 0
                for value in nums:
                    if value & distinguishing_bit:
                        first ^= value
                    else:
                        second ^= value
                return first, second
          `} />
          <P>For arbitrary-size Python negative values, constrain each update with a width mask and convert the final unsigned pattern back to signed if the required contract is fixed-width.</P>
        </SubSection>
        <SubSection title="Missing Number, counting bits, and reverse bits">
          <CodeBlock code={`
            def missing_number(nums: list[int]) -> int:
                answer = len(nums)
                for i, value in enumerate(nums):
                    answer ^= i ^ value
                return answer

            def count_bits_up_to(n: int) -> list[int]:
                dp = [0] * (n + 1)
                for value in range(1, n + 1):
                    dp[value] = dp[value >> 1] + (value & 1)
                return dp

            def reverse_bits_32(value: int) -> int:
                value &= 0xFFFFFFFF
                result = 0
                for _ in range(32):
                    result = (result << 1) | (value & 1)
                    value >>= 1
                return result
          `} />
        </SubSection>
      </Section>

      <Section title="Arithmetic with Bits">
        <SubSection title="Add two integers without plus">
          <P>XOR adds each bit without carry; AND shifted left identifies carry bits. Repeat until no carry remains, masking to simulate 32-bit arithmetic.</P>
          <CodeBlock code={`
            def add_32(a: int, b: int) -> int:
                mask = 0xFFFFFFFF
                sign_bit = 0x80000000
                a &= mask
                b &= mask
                while b:
                    carry = (a & b) << 1
                    a = (a ^ b) & mask
                    b = carry & mask
                return a if a < sign_bit else a - 0x100000000
          `} />
          <Callout type="warning">In Python, omitting the mask makes negative values conceptually extend forever and this carry loop may not terminate. The fixed-width mask is essential.</Callout>
        </SubSection>
      </Section>

      <Section title="Bitmask Enumeration, Submasks, and Gray Code">
        <SubSection title="Enumerate subsets with a mask">
          <P>A mask from <C>0</C> through <C>(1 &lt;&lt; n) - 1</C> encodes every subset of <C>n</C> items.</P>
          <CodeBlock code={`
            def all_subsets(items: list[str]) -> list[list[str]]:
                result = []
                for mask in range(1 << len(items)):
                    subset = [items[i] for i in range(len(items)) if mask & (1 << i)]
                    result.append(subset)
                return result

            def submasks(mask: int):
                submask = mask
                while submask:
                    yield submask
                    submask = (submask - 1) & mask
                yield 0
          `} />
          <P>The submask recurrence visits every subset of <C>mask</C> in descending order. Iterating all masks and all their submasks costs <C>O(3ⁿ)</C> overall.</P>
        </SubSection>
        <SubSection title="Gray code">
          <P>Gray code orders masks so adjacent values differ in exactly one bit. The formula <C>i ^ (i &gt;&gt; 1)</C> maps an integer index to its Gray code.</P>
          <CodeBlock code={`
            def gray_code(n: int) -> list[int]:
                return [i ^ (i >> 1) for i in range(1 << n)]
          `} />
          <Diagram caption="Three-bit Gray code: one bit changes at each step.">{`
             000 -> 001 -> 011 -> 010
              ^                   |
              |                   v
             100 <- 101 <- 111 <- 110
`}</Diagram>
        </SubSection>
      </Section>

      <Section title="Complexity and Good Use Cases">
        <ComplexityTable rows={[
          { operation: <C>Bitwise operation</C>, time: "O(1)", note: "For fixed-width machine integers" },
          { operation: <C>bit_count()</C>, time: "O(number of bits)" },
          { operation: <C>Kernighan count</C>, time: "O(set bits)" },
          { operation: <C>All subsets</C>, time: "O(n · 2ⁿ)", space: "O(n · 2ⁿ)", note: "Including materialized output" },
          { operation: <C>All submasks of one mask</C>, time: "O(2ᵏ)", space: "O(1)", note: "k set bits" },
          { operation: <C>Submask loops over all masks</C>, time: "O(3ⁿ)", space: "O(1)" },
          { operation: <C>Reverse 32 bits</C>, time: "O(1)", note: "Exactly 32 iterations" },
        ]} />
        <P>Python integers grow with the number of bits, so bit operations on very large integers are not strictly constant time. For typical fixed-width interview constraints, treating each operation as constant time is a useful model.</P>
        <Callout type="tip">Bitmasks are especially effective for a small universe: permissions, visited-node sets, subset DP, and compact state keys. They are not a substitute for readable sets when the domain is large or unbounded.</Callout>
      </Section>

      <Section title="Practice Problems">
        <Practice problems={[
          { name: "Single Number", difficulty: "Easy", hint: "XOR cancels pairs" },
          { name: "Number of 1 Bits", difficulty: "Easy", hint: "Clear the lowest set bit repeatedly" },
          { name: "Counting Bits", difficulty: "Easy", hint: "Use dp[i >> 1] plus the low bit" },
          { name: "Missing Number", difficulty: "Easy", hint: "XOR indices, values, and n" },
          { name: "Single Number II", difficulty: "Medium", hint: "Track counts modulo three" },
          { name: "Reverse Bits", difficulty: "Easy", hint: "Shift one low bit into the result" },
          { name: "Subsets", difficulty: "Medium", hint: "One bitmask represents one subset" },
          { name: "Gray Code", difficulty: "Medium", hint: "Map i to i XOR (i shifted right)" },
        ]} />
      </Section>

      <KeyTakeaways items={[
        <>Use <C>&amp;</C>, <C>|</C>, and <C>^</C> to combine bit flags; parentheses make intent and precedence clear.</>,
        <>Python negative integers are unbounded; use <C>0xFFFFFFFF</C> when emulating 32-bit algorithms.</>,
        <><C>x &amp; -x</C> isolates and <C>x &amp; (x - 1)</C> clears the lowest set bit.</>,
        <>XOR solves pair-cancellation problems; bitmasks compactly encode small subsets.</>,
        <>Enumerating every subset is exponential by necessity when every answer must be considered.</>,
      ]} />
    </article>
  );
}