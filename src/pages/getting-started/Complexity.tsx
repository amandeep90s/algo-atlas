import { Callout, C, CodeBlock, ComplexityTable, Diagram, KeyTakeaways, List, P, PageHeader, Practice, Section, Strong, SubSection, Table } from "../../components/doc";

export default function Complexity() {
  return (
    <article>
      <PageHeader eyebrow="Getting Started" title="Complexity Analysis" description="Describe how an algorithm's time and memory grow with input size, compare alternatives, and decide whether an approach can fit the constraints." tags={["Big-O", "Time and space", "Amortized analysis"]} />
      <Section title="Why analyze complexity?"><P>Complexity models how resource use grows as input size n grows. It helps compare algorithms independently of machine speed and implementation details. Big-O is an asymptotic description, not a stopwatch prediction: constants, memory locality, and language overhead still matter for real workloads.</P><Callout type="tip">Name the input size and the operation being counted. For a graph, V and E may both matter; for strings, account for total character length.</Callout></Section>
      <Section title="Asymptotic notation">
        <SubSection title="O, Ω, and Θ">
          <P>For nonnegative functions f and g, <C>f(n) = O(g(n))</C> when there are constants c &gt; 0 and n₀ such that <C>f(n) ≤ c·g(n)</C> for every n ≥ n₀. It is an asymptotic upper bound.</P>
          <P><C>f(n) = Ω(g(n))</C> means some c &gt; 0 and n₀ satisfy <C>f(n) ≥ c·g(n)</C> for all n ≥ n₀, a lower bound. <C>f(n) = Θ(g(n))</C> means both bounds hold, so f and g grow at the same asymptotic rate up to constant factors.</P>
          <P>These symbols describe functions, not inherently best or worst inputs. In everyday algorithm discussions, O often names a worst-case bound, but the case must be stated separately.</P>
        </SubSection>
        <Diagram caption="For sufficiently large n, constants and lower-order terms do not change the growth class.">{`
          cost
           │                            2ⁿ
           │                       n²  /
           │                    n log n
           │                n  /
           │       log n __/
           │  1 ___/
           └──────────────────────────── n
        `}</Diagram>
        <Table headers={["Growth", "n = 10", "n = 20", "n = 50", "Typical example"]} rows={[
          [<C>O(1)</C>, "1", "1", "1", "Array index access"], [<C>O(log n)</C>, "~3", "~4", "~6", "Binary search"],
          [<C>O(n)</C>, "10", "20", "50", "One scan"], [<C>O(n log n)</C>, "~33", "~86", "~282", "Comparison sort"],
          [<C>O(n²)</C>, "100", "400", "2,500", "All pairs"], [<C>O(2ⁿ)</C>, "1,024", "1,048,576", "~1.1e15", "All subsets"],
          [<C>O(n!)</C>, "3.6M", "2.4e18", "~3e64", "All permutations"],
        ]} />
      </Section>
      <Section title="Simplifying and combining costs">
        <List items={[
          <>Drop constant factors: <C>7n</C> is <C>O(n)</C>.</>, <>Keep the dominant term: <C>n² + 3n + 8</C> is <C>O(n²)</C>.</>,
          <>Sequential independent work adds: <C>O(n) + O(n²) = O(n²)</C>.</>, <>Nested work multiplies: scanning n items inside n iterations gives <C>O(n²)</C>.</>,
          <>Distinct input dimensions stay visible: processing n items and m queries can be <C>O(n + m)</C>.</>,
        ]} />
        <Callout type="warning" title="Do not erase meaningful variables">An algorithm over two arrays is not always best described by a single n. State the combined input size or retain both variables when their relationship is unknown.</Callout>
      </Section>
      <Section title="Analyzing loops">
        <SubSection title="Linear and nested loops"><CodeBlock code={`
def linear(values: list[int]) -> int:
    total = 0
    for value in values:       # n iterations
        total += value
    return total               # O(n) time, O(1) extra space


def all_pairs(values: list[int]) -> bool:
    for i in range(len(values)):
        for j in range(i + 1, len(values)):
            if values[i] == values[j]:
                return True
    return False               # O(n²) worst-case time
`} /><P>The triangular loop has n(n − 1)/2 comparisons, still quadratic. Early return can improve best-case work but not its worst-case bound.</P></SubSection>
        <SubSection title="Halving and logarithmic loops"><CodeBlock code={`
def halve_until_one(n: int) -> int:
    steps = 0
    while n > 1:
        n //= 2
        steps += 1
    return steps               # Θ(log n)


def binary_search(values: list[int], target: int) -> int:
    low, high = 0, len(values) - 1
    while low <= high:
        mid = (low + high) // 2
        if values[mid] == target:
            return mid
        if values[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
`} /><P>Repeatedly multiplying or dividing a variable by a constant yields logarithmically many iterations. A loop whose counter increases by one remains linear.</P></SubSection>
        <ComplexityTable rows={[
          { operation: <C>for x in values</C>, time: "O(n)", space: "O(1)", note: "One pass" },
          { operation: <C>for each pair (i, j)</C>, time: "O(n²)", space: "O(1)", note: "Nested scan" },
          { operation: <C>n //= 2</C>, time: "O(log n)", space: "O(1)", note: "Halving each iteration" },
          { operation: <C>sort then scan</C>, time: "O(n log n)", space: "O(n)", note: "Depends on sort and copy choice" },
        ]} />
      </Section>
      <Section title="Recursion and recurrence relations">
        <P>A recurrence expresses work in terms of smaller inputs. For example, merge sort does two half-size sorts and a linear merge: <C>T(n) = 2T(n/2) + Θ(n)</C>, which solves to <C>Θ(n log n)</C>.</P>
        <Diagram caption="At each merge-sort level, total merge work is Θ(n); there are Θ(log n) levels.">{`
          level 0:             n               work n
                          /       +
          level 1:         n/2   n/2           work n
                      +---+       +---+
          ...             ...                 ...
          level log n:    n leaves             work n
        `}</Diagram>
        <P>Use a recursion tree to sum work at each level. The Master theorem is a shortcut for <C>T(n) = aT(n/b) + f(n)</C>: compare f(n) with <C>n^(log_b a)</C>. If f is polynomially smaller, larger, or the same order (with regularity conditions in the larger case), the solution follows the recursive term, f, or that term times log n respectively.</P>
        <Callout type="note">The Master theorem does not apply to every recurrence. Uneven subproblems, non-polynomial terms, or unusual base cases may need substitution or a recursion-tree argument.</Callout>
      </Section>
      <Section title="Best, average, worst, and amortized">
        <P><Strong>Best case</Strong> is the least work on an input of size n; <Strong>worst case</Strong> is the greatest; <Strong>average case</Strong> averages over an explicitly assumed distribution. Say which one you report. A linear search is best-case O(1), worst-case O(n), and average O(n) under common assumptions.</P>
        <SubSection title="Amortized cost: dynamic array append"><P>Most list appends are constant-time; an occasional resize copies existing elements. Over m appends with capacity doubling, copied counts form a geometric sum: 1 + 2 + 4 + … &lt; 2m. The aggregate cost is O(m), or O(1) amortized per append, even though a single append can cost O(n).</P>
          <CodeBlock code={`
            values: [a, b, c, _]  -- full
            append d: allocate [a, b, c, d, _, _, _, _]
            copy each existing reference once, then append
          `} skipVerify />
          <P>The <Strong>aggregate method</Strong> sums total cost over a sequence and divides by the number of operations. This is not probabilistic average-case analysis; the bound holds for every operation sequence.</P>
        </SubSection>
      </Section>
      <Section title="Space complexity">
        <P><Strong>Auxiliary space</Strong> counts extra storage used by the algorithm, while total space may include the input and output too. Be explicit about the convention. A recursive algorithm also uses a call stack, which can be O(depth).</P>
        <CodeBlock code={`
def copy_sorted(values: list[int]) -> list[int]:
    result = sorted(values)      # O(n) output / auxiliary storage
    return result


def iterative_sum(values: list[int]) -> int:
    total = 0                    # O(1) auxiliary space
    for value in values:
        total += value
    return total
`} />
        <Callout type="insight">An in-place algorithm may use O(1) auxiliary storage while still needing O(n) memory if you count its input representation.</Callout>
      </Section>
      <Section title="Practical limits and Python costs">
        <Table headers={["Input scale (rough guide)", "Often feasible target", "Caution"]} rows={[
          ["n ≤ 10", <C>O(n!)</C>, "Enumeration may be possible; measure actual branching."], ["n ≤ 20", <C>O(2ⁿ)</C>, "Subsets are about one million at n=20."],
          ["n ≤ 500", <C>O(n³)</C>, "125 million primitive operations may already be slow in Python."], ["n ≤ 5,000", <C>O(n²)</C>, "25 million iterations can be borderline."],
          ["n ≤ 10⁶", <C>O(n log n)</C>, "Sorting or near-linear algorithms are typical."], ["n ≥ 10⁷", "O(n) or better", "I/O and memory become important."],
        ]} />
        <P>These are rough estimates, not promises: time limit, implementation, input distribution, and constant factors matter. Translate constraints into likely operation counts and benchmark when appropriate.</P>
        <SubSection title="Common Python operations"><ComplexityTable rows={[
          { operation: <C>list[i]</C>, time: "O(1)", note: "Index access" },
          { operation: <C>x in values</C>, time: "O(n)", note: "List membership scans" },
          { operation: <C>x in seen</C>, time: "O(1)", note: "Set/dict average; worst case can degrade" },
          { operation: <C>values[a:b]</C>, time: "O(k)", space: "O(k)", note: "Copies k elements" },
          { operation: <C>sorted(values)</C>, time: "O(n log n)", space: "O(n)", note: "Returns a new list" },
          { operation: <C>sum(values)</C>, time: "O(n)", space: "O(1)", note: "One pass" },
          { operation: <C>text += part</C>, time: "O(n²)", note: "Repeated immutable concatenation may recopy prefixes" },
        ]} /></SubSection>
        <Callout type="warning" title="Hidden costs">Repeated string concatenation can be quadratic; prefer collecting pieces then <C>''.join(parts)</C>. <C>in</C> on a list is linear, slicing copies, and apparently convenient built-ins can allocate or scan. Know the data type and output size.</Callout>
      </Section>
      <Section title="Practice and takeaways">
        <Practice problems={[
          { name: "Binary Search", difficulty: "Easy", hint: "Write the halving recurrence and loop invariant." },
          { name: "Climbing Stairs", difficulty: "Easy", hint: "Compare plain recursion with memoization." },
          { name: "Merge Sort", difficulty: "Medium", hint: "Count work across recursion-tree levels." },
          { name: "Product of Array Except Self", difficulty: "Medium", hint: "Track time and auxiliary space separately." },
          { name: "Subsets", difficulty: "Medium", hint: "Explain why there are 2ⁿ outputs." },
        ]} />
        <KeyTakeaways items={[
          <>O is an upper bound, Ω a lower bound, and Θ a tight asymptotic bound.</>, <>Count dominant work and account for copies, recursion, and output storage.</>,
          <>Loop structure reveals cost: nested work multiplies; halving is logarithmic.</>, <>Amortized bounds summarize a sequence and differ from average-case bounds.</>,
          <>Practical limits are estimates; constraints and Python's real operation costs matter.</>,
        ]} />
      </Section>
    </article>
  );
}