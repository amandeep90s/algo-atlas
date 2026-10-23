import { Callout, C, CodeBlock, Diagram, KeyTakeaways, List, P, PageHeader, Practice, Section, Strong, SubSection, Table } from "../../components/doc";

export default function ComplexityClasses() {
  return (
    <article>
      <PageHeader eyebrow="Reference" title="Complexity Classes" description="Understand polynomial time, why NP-completeness matters, and practical strategies for problems whose exact solutions may be expensive." tags={["P vs NP", "Reductions", "NP-completeness", "Hard problems"]} />

      <Section title="Decision and Optimization Problems">
        <P>A <Strong>decision problem</Strong> asks a yes-or-no question, such as “does this graph have a vertex cover of size at most k?” An <Strong>optimization problem</Strong> asks for the best feasible solution, such as the smallest vertex cover. Decision formulations are central to complexity theory because their answers compose cleanly in proofs. For many optimization tasks, asking whether the optimum is at most a bound gives a related decision problem.</P>
        <P>Complexity is measured against the complete input encoding. A number written in binary takes logarithmically many bits in its value, so its magnitude can be exponentially larger than its representation.</P>
        <Diagram caption="The class diagram depends on the unresolved P vs NP question.">{`
          If P = NP                         If P ≠ NP (the prevailing conjecture)
          ┌──────────────────────┐          ┌────────────────────────────┐
          │          P = NP      │          │            NP              │
          │  polynomial-time     │          │  ┌──────────────┐          │
          │  decision problems   │          │  │ NP-complete  │          │
          └──────────────────────┘          │  └──────────────┘          │
                                            │  P ────────────┘           │
                                            └────────────────────────────┘
          NP-hard problems can also lie outside NP (for example, optimization problems).
        `}</Diagram>
        <Callout type="note" title="How to read the picture"><P><C>P</C> is contained in <C>NP</C>: a polynomial-time solver can verify a proposed answer. Whether the containment is strict is unknown; the diagram is conceptual, not to scale.</P></Callout>
      </Section>

      <Section title="P, NP, and Verifiers">
        <SubSection title="Solving versus checking">
          <P><Strong>P</Strong> contains decision problems solvable by a deterministic algorithm in polynomial time. <Strong>NP</Strong> contains decision problems whose yes-instances have certificates verifiable in polynomial time. Equivalently, a nondeterministic machine can guess a certificate and verify it in polynomial time. A certificate is a witness, not necessarily something we can find efficiently.</P>
          <CodeBlock title="verifying_subset_sum.py" code={`
            def verify_subset_sum(values: list[int], target: int, indices: list[int]) -> bool:
                """Check a proposed subset-sum witness in polynomial time."""
                if len(set(indices)) != len(indices):
                    return False
                if any(index < 0 or index >= len(values) for index in indices):
                    return False
                return sum(values[index] for index in indices) == target

            numbers = [3, 7, 10, 14]
            print(verify_subset_sum(numbers, 17, [1, 2]))
            print(verify_subset_sum(numbers, 18, [1, 2]))
          `} output={`
            True
            False
          `} />
          <P>The proposed index list is at most as long as the input. Checking range, distinctness, and the sum takes polynomial time (with standard bit-cost arithmetic), although searching all possible subsets may take exponential time.</P>
        </SubSection>
        <SubSection title="NP-hard and NP-complete">
          <P>A problem is <Strong>NP-hard</Strong> if every problem in NP reduces to it in polynomial time. It need not be a decision problem or belong to NP. A problem is <Strong>NP-complete</Strong> when it is both in NP and NP-hard: it is among the hardest problems in NP under these reductions.</P>
          <Callout type="insight" title="The consequence of one fast solver"><P>If any NP-complete problem has a polynomial-time algorithm, every problem in NP does, so <C>P = NP</C>. Whether such an algorithm exists is open.</P></Callout>
        </SubSection>
      </Section>

      <Section title="Polynomial-Time Reductions">
        <P>A polynomial-time many-one reduction from A to B converts each instance x of A into an instance f(x) of B in polynomial time, preserving the answer: x is yes exactly when f(x) is yes. If A reduces to B, a fast solver for B would give a fast solver for A. To prove B is hard, reduce a problem already known to be hard <Strong>to B</Strong>.</P>
        <SubSection title="Independent Set, Vertex Cover, and Clique">
          <P>For G = (V, E), S is independent exactly when V minus S is a vertex cover. Also, S is a clique in G exactly when it is independent in the complement graph. Thus Independent Set(G, k) ↔ Vertex Cover(G, |V| − k), and Independent Set(G, k) ↔ Clique(complement(G), k).</P>
          <CodeBlock title="graph_reductions.py" code={`
            def independent_set_to_vertex_cover(vertex_count: int, edges: list[tuple[int, int]], k: int):
                return vertex_count, edges, vertex_count - k

            def independent_set_to_clique(vertex_count: int, edges: list[tuple[int, int]], k: int):
                edge_set = {tuple(sorted(edge)) for edge in edges}
                complement_edges = [
                    (u, v)
                    for u in range(vertex_count)
                    for v in range(u + 1, vertex_count)
                    if (u, v) not in edge_set
                ]
                return vertex_count, complement_edges, k

            graph = (4, [(0, 1), (1, 2)], 2)
            print(independent_set_to_vertex_cover(*graph))
            print(independent_set_to_clique(*graph))
          `} output={`
            (4, [(0, 1), (1, 2)], 2)
            (4, [(0, 2), (0, 3), (1, 3), (2, 3)], 2)
          `} />
          <P>The complement graph has at most |V|(|V| − 1)/2 edges, so the conversion is polynomial. Reductions are proof tools and instance transformations, not necessarily a way to solve the original problem.</P>
        </SubSection>
        <Callout type="warning" title="Reduction direction matters"><P>Showing X reduces to a known hard problem A says X is no harder than A; it does not prove X-hardness. Show A ≤p X instead.</P></Callout>
      </Section>

      <Section title="SAT and Famous NP-Complete Problems">
        <P>Boolean satisfiability (SAT) asks whether a Boolean formula has an assignment making it true. The <Strong>Cook–Levin theorem</Strong> established SAT as NP-complete: a polynomial-time-verifiable computation can be encoded as a formula whose satisfying assignment represents an accepting computation. 3-SAT limits each clause to at most three literals and remains NP-complete. SAT is in NP because an assignment is a polynomial-size certificate that can be checked by evaluating the formula.</P>
        <Table headers={["Problem", "Decision question (informal)"]} rows={[
          ["SAT", "Is there a truth assignment satisfying the Boolean formula?"],
          ["3-SAT", "Can each clause of width at most three be satisfied?"],
          ["Clique", "Does the graph contain a clique of size at least k?"],
          ["Vertex Cover", "Can at most k vertices touch every edge?"],
          ["Independent Set", "Are there at least k pairwise non-adjacent vertices?"],
          ["Hamiltonian Cycle", "Is there a cycle visiting every vertex exactly once?"],
          ["TSP (decision)", "Is there a tour of total cost at most B?"],
          ["Subset Sum", "Does some subset of integers sum to target T?"],
          ["Knapsack (decision)", "Can value at least V fit within capacity W?"],
          ["Graph Coloring", "Can adjacent vertices receive different colors from a palette of k?"],
          ["Set Cover", "Can at most k given sets cover the universe?"],
          ["Partition", "Can the numbers be split into two equal-sum groups?"],
        ]} />
        <P>These are decision formulations. Their optimization counterparts (minimum tour, minimum cover, maximum clique) are commonly NP-hard. Restrictions on a problem can change its complexity.</P>
      </Section>

      <Section title="Pseudo-Polynomial Time and Beyond NP">
        <SubSection title="The O(nW) knapsack dynamic program">
          <P>The 0/1 knapsack DP runs in O(nW) time and O(W) space, where W is capacity. This is <Strong>pseudo-polynomial</Strong>: polynomial in numeric W, but W may be exponential in its binary encoding length log W. If W = 2ⁿ, O(nW) is exponential in n, not polynomial in input length.</P>
          <CodeBlock title="knapsack_value_dp.py" code={`
            def max_value(weights: list[int], values: list[int], capacity: int) -> int:
                dp = [0] * (capacity + 1)
                for weight, value in zip(weights, values):
                    for room in range(capacity, weight - 1, -1):
                        dp[room] = max(dp[room], dp[room - weight] + value)
                return dp[capacity]

            print(max_value([2, 3, 4], [4, 5, 7], 5))
          `} output="9" />
          <P>Iterating capacity downward prevents reusing the same item more than once. The numeric capacity determines memory and time requirements.</P>
        </SubSection>
        <SubSection title="PSPACE, EXPTIME, and undecidability">
          <P><Strong>PSPACE</Strong> contains problems solvable with polynomial memory, even if they require much longer than polynomial time. <Strong>EXPTIME</Strong> permits time exponential in a polynomial of input length; P is known to be strictly contained in EXPTIME. The <Strong>halting problem</Strong> is undecidable: no algorithm always determines whether an arbitrary program on an arbitrary input stops. Undecidability means no always-correct terminating decision algorithm at all.</P>
          <P>Known containments include P ⊆ NP ⊆ PSPACE ⊆ EXPTIME. Several equalities remain open; do not confuse the unknown P-versus-NP equality with the proven strict containment P ⊊ EXPTIME.</P>
        </SubSection>
      </Section>

      <Section title="Coping with Hardness">
        <SubSection title="Backtracking, pruning, and approximation">
          <P>Backtracking explores choices and abandons a partial branch once it cannot yield a feasible or competitive solution. Bounds and constraint propagation help, though worst-case time may remain exponential. For unweighted Vertex Cover, repeatedly taking an uncovered edge and adding both endpoints gives a 2-approximation.</P>
          <CodeBlock title="two_approx_vertex_cover.py" code={`
            def vertex_cover_2_approx(edges: list[tuple[int, int]]) -> set[int]:
                uncovered = list(edges)
                cover: set[int] = set()
                while uncovered:
                    u, v = uncovered.pop(0)
                    cover.update((u, v))
                    uncovered = [edge for edge in uncovered if u not in edge and v not in edge]
                return cover

            result = vertex_cover_2_approx([(0, 1), (1, 2), (2, 3)])
            print(sorted(result), len(result))
          `} output="[0, 1, 2, 3] 4" />
          <P>Every selected edge requires at least one endpoint in any cover; selecting both costs at most twice the optimum. Greedy Set Cover selects the set covering most uncovered elements per unit cost. For unit costs, its guarantee is Hₙ ≤ 1 + ln n (often stated as O(ln n)), for universe size n.</P>
        </SubSection>
        <SubSection title="Bitmask DP: Held–Karp TSP">
          <P>For a small number of cities, Held–Karp records the cheapest route from city 0 that visits a bitmask subset and ends at a given city. It uses O(n² 2ⁿ) time and O(n 2ⁿ) space—better than n! tour enumeration but still exponential.</P>
          <CodeBlock title="held_karp.py" code={`
            def tsp_held_karp(cost: list[list[int]]) -> int:
                n = len(cost)
                if n <= 1:
                    return 0
                dp: dict[tuple[int, int], int] = {(1, 0): 0}
                for mask in range(1 << n):
                    if not mask & 1:
                        continue
                    for end in range(n):
                        state = (mask, end)
                        if state not in dp:
                            continue
                        for nxt in range(1, n):
                            if mask & (1 << nxt):
                                continue
                            next_mask = mask | (1 << nxt)
                            key = (next_mask, nxt)
                            candidate = dp[state] + cost[end][nxt]
                            dp[key] = min(dp.get(key, float("inf")), candidate)
                full = (1 << n) - 1
                return min(dp[(full, end)] + cost[end][0] for end in range(1, n))

            distances = [[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]]
            print(tsp_held_karp(distances))
          `} output="80" />
        </SubSection>
        <SubSection title="FPT, heuristics, and tractable special cases">
          <P>A problem with parameter k is <Strong>fixed-parameter tractable</Strong> (FPT) if solvable in f(k) · nᶜ time, for a function f and constant c independent of k. Branching on an uncovered edge gives a simple O(2ᵏ · n) search for Vertex Cover with target k. Heuristics and local search—such as improving a TSP tour with 2-opt swaps—often find strong solutions without an optimality guarantee.</P>
          <P>Restrictions can make hard problems tractable: 2-SAT is solvable in linear time using strongly connected components of its implication graph, and bipartite matching has polynomial algorithms. Look for exploitable structure first.</P>
        </SubSection>
      </Section>

      <Section title="Recognizing Hard Problems in Interviews">
        <List items={[
          <>Look for a yes/no question with a bound, then identify a short certificate that can be checked quickly.</>,
          <>Notice combinatorial choices: arbitrary subsets, permutations, partitions, or assignments with global constraints.</>,
          <>Use constraints: small n may allow bitmask DP or backtracking; small capacity may allow pseudo-polynomial DP.</>,
          <>Check for tractable structure such as trees, DAGs, bipartite graphs, or 2-SAT.</>,
          <>A resemblance to a classic NP-complete problem suggests a reduction, but resemblance alone is not a proof.</>,
          <>Clarify whether the goal is exact optimization, a guaranteed approximation, or a practical heuristic.</>,
        ]} />
        <Callout type="tip" title="A useful interview explanation"><P>Give a brute-force baseline and its bound, then use input limits and structure to choose a strategy. State whether the result is exact, approximation-bounded, or heuristic.</P></Callout>
      </Section>

      <Section title="Key Takeaways and Practice">
        <KeyTakeaways items={[
          <>P means polynomial-time solvable; NP means yes-certificates are polynomial-time verifiable.</>,
          <>NP-complete means both in NP and NP-hard; a polynomial solver for one implies P = NP.</>,
          <>To prove hardness, reduce a known hard problem to the target, preserving yes/no answers.</>,
          <>Pseudo-polynomial algorithms depend on numeric values, which may be exponential in encoding length.</>,
          <>Use small parameters, pruning, approximation, heuristics, and special structure when exact worst-case efficiency is unlikely.</>,
        ]} />
        <Practice problems={[
          { name: "Subset Sum", difficulty: "Medium", hint: "Compare O(nW) with the binary encoding length of W." },
          { name: "Word Ladder", difficulty: "Hard", hint: "Model words as vertices and investigate shortest paths in an implicit graph." },
          { name: "N-Queens", difficulty: "Hard", hint: "Backtrack while pruning columns and diagonals." },
          { name: "Traveling Salesperson", difficulty: "Hard", hint: "Compare permutations, bitmask DP, and approximation for metric costs." },
          { name: "Course Schedule", difficulty: "Medium", hint: "Use topological sorting on the DAG of prerequisites." },
          { name: "Matchsticks to Square", difficulty: "Medium", hint: "Partition into equal-sum groups and prune symmetric branches." },
        ]} />
      </Section>
    </article>
  );
}