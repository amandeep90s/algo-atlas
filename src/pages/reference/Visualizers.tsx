import {
  Callout, ComplexityTable, KeyTakeaways, List, P, PageHeader, Section, Strong,
} from "../../components/doc";
import {
  BinarySearchVisualizer, DijkstraVisualizer, GraphTraversalVisualizer, SortingVisualizer,
} from "../../components/visualizers";

export default function Visualizers() {
  return (
    <article>
      <PageHeader
        eyebrow="Reference"
        title="Algorithm Visualizers"
        description="Turn an algorithm into a sequence of small, observable decisions. Play, pause, and rewind sorting, binary search, graph traversal, and shortest-path discovery—then connect each frame to its invariant."
        tags={["Interactive", "Step by step", "Sorting", "Search", "Graphs"]}
      />

      <Section title="Learn One Decision at a Time">
        <P>Before pressing Play, predict the next comparison, the next vertex, or the next distance update.
          Then use <Strong>Next</Strong> to check your reasoning. Back restores the complete previous snapshot,
          including counters, pointers, and frontier contents—not just its colors.</P>
        <List items={[
          "Play and Pause control automatic playback; Back and Next pause so you can inspect a single frame.",
          "Reset returns to the initial snapshot without changing your input. Replay starts again after completion.",
          "The speed slider ranges from 0.25× to 3×. Changing the algorithm, input, or start vertex resets that visualizer.",
          "All controls support keyboard navigation. Captions and state labels explain the same information as the colors.",
        ]} />
        <Callout type="note" title="Count operations, not animation frames">
          Frames include explanations as well as mutations. Their count is not an algorithm's running time.
          Complexity reminders describe the conventional implementation, excluding snapshot storage and rendering.
          Reduced-motion preferences disable decorative transitions; playback only starts when you request it.
        </Callout>
      </Section>

      <Section title="Sorting: Build Order from Local Decisions">
        <P>Compare six sorting strategies on the same array. Use <Strong>Shuffle</Strong> for a new input;
          selecting another algorithm preserves that input so the comparison stays fair. Expand the Python
          reference below the player to follow the corresponding implementation.</P>
        <SortingVisualizer />
        <Callout type="tip" title="What to watch">
          Bubble sort fixes the rightmost suffix; selection sort fixes the leftmost prefix. Insertion sort's ordered
          prefix is not yet in its final positions. Merge sort writes from temporary buffers, quicksort fixes a pivot,
          and heap sort extracts the maximum. Compare array-write counts as well as comparison counts.
        </Callout>
        <ComplexityTable rows={[
          { operation: "Bubble / Insertion", time: "O(n²)", space: "O(1)", note: "Worst case; O(n) best case on ordered input." },
          { operation: "Selection", time: "O(n²)", space: "O(1)", note: "Quadratic comparisons even on ordered input; few swaps." },
          { operation: "Merge", time: "O(n log n)", space: "O(n)", note: "Stable when equal elements come from the left run first." },
          { operation: "Quick (Lomuto)", time: "O(n log n)", space: "O(log n)", note: "Average; worst O(n²) time and O(n) recursion with unlucky pivots." },
          { operation: "Heap", time: "O(n log n)", space: "O(1)", note: "Worst-case guarantee; this version uses iterative sifting." },
        ]} />
      </Section>

      <Section title="Binary Search: Shrink the Candidate Interval">
        <P>The array is sorted and the candidate interval is inclusive. Each comparison either finds the target
          or eliminates the midpoint and one entire side. Try <Strong>29</Strong>, then a missing value such as
          <Strong>30</Strong>, and finally values outside the array's range.</P>
        <BinarySearchVisualizer />
        <Callout type="tip" title="What to watch">
          Track lo and hi after each comparison. When they cross, the interval is empty—not a reason to read
          another midpoint. A target smaller than every value can leave hi = −1; a larger target can leave lo = n.
        </Callout>
        <ComplexityTable rows={[
          { operation: "Iterative binary search", time: "O(log n)", space: "O(1)", note: "Requires sorted input and constant-time indexed access." },
        ]} />
      </Section>

      <Section title="Graph Traversal: Queue versus Stack">
        <P>Explore the same undirected graph using a FIFO queue for breadth-first search or a LIFO stack for
          iterative depth-first search. Change the starting vertex and compare the discovery tree and visit order.</P>
        <GraphTraversalVisualizer />
        <Callout type="tip" title="What to watch">
          BFS expands in hop-distance layers; DFS follows the most recently scheduled branch. Vertices are marked
          discovered when added to the frontier, preventing duplicates. A green edge means first discovery, not
          every edge that the algorithm examines. Iterative mark-on-push DFS need not produce the recursive DFS tree.
        </Callout>
        <ComplexityTable rows={[
          { operation: "BFS / DFS with adjacency lists", time: "O(V + E)", space: "O(V)", note: "Traversal auxiliary space; storing the graph itself costs O(V + E)." },
        ]} />
      </Section>

      <Section title="Dijkstra: Finalize the Cheapest Frontier">
        <P>Edge labels are nonnegative weights. Tentative distances improve when an edge offers a cheaper route;
          extracting the minimum valid queue entry makes that vertex's distance final. The table records each
          vertex's best known distance and parent.</P>
        <DijkstraVisualizer />
        <Callout type="tip" title="What to watch">
          From A, C improves B from 4 to 3. The old (B, 4) entry remains in the lazy priority queue and is skipped
          later. Watch parent edges change on improvement; only the completed green tree represents all final
          shortest paths. Equal-cost alternatives keep the existing parent.
        </Callout>
        <ComplexityTable rows={[
          { operation: "Dijkstra with a lazy binary heap", time: "O((V + E) log V)", space: "O(V + E)", note: "For simple graphs; stale heap entries can use O(E) space. Queue shown in sorted priority order." },
        ]} />
        <Callout type="warning" title="Nonnegative weights are essential">
          Do not use this greedy finalization rule with negative edges. Use Bellman–Ford when negative weights
          are allowed, and account for reachable negative cycles.
        </Callout>
      </Section>

      <Section title="Turn a Trace into an Invariant">
        <List items={[
          "Sorting: which positions are final, and which ranges are merely internally ordered?",
          "Binary search: if the target exists, can it still be inside the remaining interval?",
          "Traversal: has every discovered vertex been scheduled at most once?",
          "Dijkstra: is the next valid extracted distance the smallest tentative distance?",
        ]} />
        <P>The examples are deliberately small. For real inputs, write down the invariant, prove that one step
          preserves it, and test boundary cases instead of relying on an animation alone.</P>
      </Section>

      <KeyTakeaways items={[
        "Snapshots make every transition reversible: inspect state changes rather than guessing from motion.",
        "A comparison, write, discovery, or relaxation is a different event from an explanatory animation frame.",
        "Binary search discards impossible regions; graph traversal schedules reachable vertices; Dijkstra prioritizes their costs.",
        "The right invariant explains both correctness and when an algorithm's assumptions stop being valid.",
      ]} />
    </article>
  );
}
