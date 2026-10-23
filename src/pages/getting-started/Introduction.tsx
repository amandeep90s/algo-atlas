import { Card, CardGrid, Callout, CodeBlock, C, Diagram, KeyTakeaways, List, P, PageHeader, Practice, Section, Steps, Strong, SubSection, Table } from "../../components/doc";

export default function Introduction() {
  return (
    <article>
      <PageHeader eyebrow="Getting Started" title="Introduction to DSA" description="Learn to model problems with data structures, choose algorithms that scale, and build a repeatable path from fundamentals to confident solutions." tags={["Foundations", "Problem solving", "Roadmap"]} />
      <Section title="What are data structures and algorithms?">
        <P><Strong>Data structures</Strong> organize information so it can be stored, accessed, and changed effectively. An <Strong>algorithm</Strong> is a finite, precise sequence of steps that transforms input into a desired result. Together, they let us express a solution and reason about whether it works and how it scales.</P>
        <Diagram caption="A solution is a partnership between representation and procedure.">{`
          Input + constraints
                 │
                 ▼
          Choose a representation ── Data structure
                 │
                 ▼
          Choose a procedure ─────── Algorithm
                 │
                 ▼
          Correct result, within time and space limits
        `}</Diagram>
        <P>The same task can become easy or difficult depending on representation. Searching membership in a list takes a scan; storing values in a set usually makes membership constant-time on average. The set uses extra memory to buy faster queries.</P>
      </Section>
      <Section title="Why DSA matters">
        <CardGrid cols={3}>
          <Card title="Performance" icon="⚡"><P>Growth rates predict whether a solution remains practical as input grows, often before benchmarking is possible.</P></Card>
          <Card title="Interviews" icon="🎯"><P>DSA questions test modeling, trade-offs, correctness arguments, and clear communication under constraints.</P></Card>
          <Card title="Problem solving" icon="🧩"><P>Patterns such as two pointers, graph search, and dynamic programming make unfamiliar tasks more tractable.</P></Card>
        </CardGrid>
        <P>These ideas also appear in databases, compilers, networking, graphics, scheduling, and everyday application code. The goal is not to optimize every line: it is to recognize when the cost or representation matters.</P>
      </Section>
      <Section title="Data structure taxonomy">
        <Table headers={["Viewpoint", "Categories", "Examples"]} rows={[
          [<Strong>Shape</Strong>, "Linear: elements have a sequence (array, linked list, stack, queue). Non-linear: relationships branch or network (tree, heap, graph).", "List vs graph"],
          [<Strong>Abstraction</Strong>, "Primitive types are language-level building blocks; composite structures combine values.", "int, bool vs list, tree"],
          [<Strong>Interface</Strong>, "An abstract data type (ADT) defines behavior; an implementation chooses how to realize it.", "Queue ADT via deque or linked list"],
        ]} />
        <SubSection title="ADT versus implementation"><P>A <Strong>stack ADT</Strong> promises last-in, first-out operations such as push and pop; it does not require a particular storage layout. Python lists can implement a stack efficiently at the end, while a linked structure is another possible implementation. Keep the contract separate from the mechanism.</P><Callout type="insight" title="Choose for operations">Ask which operations are frequent and what constraints matter. A structure that is excellent for indexed access may be poor for inserting at the front.</Callout></SubSection>
      </Section>
      <Section title="What makes an algorithm?">
        <List items={[
          <><Strong>Correctness:</Strong> it returns the specified answer for every valid input. State the invariant or proof idea, not just successful examples.</>,
          <><Strong>Finiteness:</Strong> it terminates after a finite number of steps; each repetition must make progress toward a stopping condition.</>,
          <><Strong>Efficiency:</Strong> its time and memory use should fit the expected input and resource budget.</>,
          <><Strong>Precision:</Strong> every step is unambiguous and can be carried out mechanically.</>,
        ]} />
        <P>Testing catches many mistakes, but tests alone do not prove correctness. A useful proof often identifies an invariant that is true initially, preserved by each step, and strong enough to establish the result at termination.</P>
      </Section>
      <Section title="Algorithm design paradigms">
        <Table headers={["Paradigm", "Core idea", "Typical use"]} rows={[
          [<Strong>Brute force</Strong>, "Enumerate candidates and verify them; a reliable baseline.", "Small input, simple search"],
          [<Strong>Divide and conquer</Strong>, "Split into smaller independent subproblems, solve, combine.", "Merge sort, binary search"],
          [<Strong>Greedy</Strong>, "Choose the best-looking local move; prove it can be part of an optimum.", "Interval scheduling, spanning trees"],
          [<Strong>Dynamic programming</Strong>, "Reuse answers to overlapping subproblems with optimal substructure.", "Knapsack, edit distance"],
          [<Strong>Backtracking</Strong>, "Build a partial candidate, explore choices, undo, prune impossible branches.", "Permutations, constraint puzzles"],
        ]} />
        <Callout type="note">These are tools, not labels to force onto every problem. Start with a clear baseline, then use constraints and structure to justify a better approach.</Callout>
      </Section>
      <Section title="A study roadmap">
        <Steps steps={[
          { title: "Build Python fluency", body: <>Practice lists, dictionaries, sets, loops, functions, and reading inputs. Learn the costs of the operations you use.</> },
          { title: "Learn complexity", body: <>Count work and memory, compare growth rates, and analyze loops and recursion.</> },
          { title: "Master core structures", body: <>Arrays and strings, linked lists, stacks and queues, hash maps, trees, heaps, and graphs.</> },
          { title: "Practice reusable patterns", body: <>Two pointers, sliding windows, binary search, traversal, prefix sums, and monotonic structures.</> },
          { title: "Study paradigms", body: <>Recursion, divide and conquer, greedy proofs, dynamic programming, and backtracking.</> },
          { title: "Review deliberately", body: <>Re-solve missed problems, explain correctness aloud, and record the insight that unlocks each one.</> },
        ]} />
        <P>Progress comes from active recall and spaced practice, not from collecting solutions. When stuck, take a hint, close it, and finish the reasoning yourself.</P>
      </Section>
      <Section title="A repeatable problem-solving framework">
        <Steps steps={[
          { title: "Understand", body: <>Restate the task. Clarify input shape, output, duplicates, ordering, and edge cases.</> },
          { title: "Map constraints", body: <>Estimate n, value ranges, and memory. Infer which time complexities might fit.</> },
          { title: "Plan", body: <>Write a small example, consider a brute-force baseline, then select a data structure or pattern.</> },
          { title: "Implement", body: <>Use clear names and small helpers. Preserve an invariant and handle empty or boundary inputs.</> },
          { title: "Review and evaluate", body: <>Trace a normal and edge case; prove correctness; state time and auxiliary-space complexity.</> },
        ]} />
        <P>This Understand, Map, Plan, Implement, Review flow is a practical UMPIRE-like checklist. In an interview, communicate each decision instead of silently jumping to code.</P>
      </Section>
      <Section title="First example: sum from 1 to n">
        <P>A direct loop mirrors the definition and needs constant extra memory. The arithmetic-series identity gives the same answer in constant time. Use integer arithmetic to avoid floating-point rounding.</P>
        <CodeBlock title="Two correct approaches" code={`
def sum_loop(n: int) -> int:
    total = 0
    for value in range(1, n + 1):
        total += value
    return total


def sum_formula(n: int) -> int:
    return n * (n + 1) // 2

print(sum_loop(5), sum_formula(5))
`} output="15 15" />
        <Table headers={["Approach", "Time", "Extra space", "Trade-off"]} rows={[
          [<C>loop</C>, <C>O(n)</C>, <C>O(1)</C>, "Straightforward; generalizes when each term must be processed."],
          [<C>formula</C>, <C>O(1)</C>, <C>O(1)</C>, "Fast, but depends on a proven identity and valid domain."],
        ]} />
        <SubSection title="A classic trade-off: duplicate detection"><P>Comparing every pair uses no auxiliary collection but may compare roughly n² pairs. A set trades O(n) extra space for expected O(n) total time:</P>
          <CodeBlock code={`
def has_duplicate_slow(values: list[int]) -> bool:
    for i in range(len(values)):
        for j in range(i + 1, len(values)):
            if values[i] == values[j]:
                return True
    return False


def has_duplicate(values: list[int]) -> bool:
    seen: set[int] = set()
    for value in values:
        if value in seen:
            return True
        seen.add(value)
    return False
`} />
        </SubSection>
      </Section>
      <Section title="What this site covers">
        <CardGrid cols={3}>
          <Card title="Data structures" icon="📦"><P>Arrays, strings, lists, stacks, queues, hash tables, trees, heaps, graphs, and more.</P></Card>
          <Card title="Algorithms" icon="🧠"><P>Searching, sorting, traversal, recursion, greedy methods, and dynamic programming.</P></Card>
          <Card title="Tools and analysis" icon="🛠️"><P>Python idioms, complexity analysis, worked examples, patterns, and practice prompts.</P></Card>
        </CardGrid>
        <Practice problems={[
          { name: "Contains Duplicate", difficulty: "Easy", hint: "Compare nested scans with a set." },
          { name: "Running Sum of 1D Array", difficulty: "Easy", hint: "Maintain a running total." },
          { name: "Two Sum", difficulty: "Easy", hint: "Trade extra storage for fast lookup." },
          { name: "Valid Parentheses", difficulty: "Easy", hint: "Recognize last-opened, first-closed behavior." },
          { name: "Binary Search", difficulty: "Medium", hint: "Use sorted order to discard half the range." },
        ]} />
      </Section>
      <KeyTakeaways items={[
        <>Data structures shape operations; algorithms describe the steps that produce results.</>,
        <>Correctness comes first. Analyze time and memory against actual constraints.</>,
        <>An ADT specifies behavior; implementations make different trade-offs.</>,
        <>Learn patterns by solving, explaining, and revisiting problems.</>,
        <>A simple solution is a valuable baseline before optimizing.</>,
      ]} />
    </article>
  );
}