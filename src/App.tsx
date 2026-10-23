import { lazy } from "react";
import { Route, Routes } from "react-router";
import { Layout } from "./components/Layout";

const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));

const Introduction = lazy(() => import("./pages/getting-started/Introduction"));
const Complexity = lazy(() => import("./pages/getting-started/Complexity"));
const PythonEssentials = lazy(() => import("./pages/getting-started/PythonEssentials"));
const Recursion = lazy(() => import("./pages/getting-started/Recursion"));

const Arrays = lazy(() => import("./pages/data-structures/Arrays"));
const Strings = lazy(() => import("./pages/data-structures/Strings"));
const LinkedLists = lazy(() => import("./pages/data-structures/LinkedLists"));
const Stacks = lazy(() => import("./pages/data-structures/Stacks"));
const Queues = lazy(() => import("./pages/data-structures/Queues"));
const HashTables = lazy(() => import("./pages/data-structures/HashTables"));
const Trees = lazy(() => import("./pages/data-structures/Trees"));
const BinarySearchTrees = lazy(() => import("./pages/data-structures/BinarySearchTrees"));
const BalancedTrees = lazy(() => import("./pages/data-structures/BalancedTrees"));
const Heaps = lazy(() => import("./pages/data-structures/Heaps"));
const Tries = lazy(() => import("./pages/data-structures/Tries"));
const Graphs = lazy(() => import("./pages/data-structures/Graphs"));
const UnionFind = lazy(() => import("./pages/data-structures/UnionFind"));
const SegmentTrees = lazy(() => import("./pages/data-structures/SegmentTrees"));
const AdvancedDataStructures = lazy(() => import("./pages/data-structures/AdvancedDataStructures"));

const Searching = lazy(() => import("./pages/algorithms/Searching"));
const Sorting = lazy(() => import("./pages/algorithms/Sorting"));
const TwoPointers = lazy(() => import("./pages/algorithms/TwoPointers"));
const SlidingWindow = lazy(() => import("./pages/algorithms/SlidingWindow"));
const PrefixSums = lazy(() => import("./pages/algorithms/PrefixSums"));
const MatrixGrid = lazy(() => import("./pages/algorithms/MatrixGrid"));
const Intervals = lazy(() => import("./pages/algorithms/Intervals"));
const DivideAndConquer = lazy(() => import("./pages/algorithms/DivideAndConquer"));
const Greedy = lazy(() => import("./pages/algorithms/Greedy"));
const Backtracking = lazy(() => import("./pages/algorithms/Backtracking"));
const DynamicProgramming = lazy(() => import("./pages/algorithms/DynamicProgramming"));
const BitManipulation = lazy(() => import("./pages/algorithms/BitManipulation"));
const StringAlgorithms = lazy(() => import("./pages/algorithms/StringAlgorithms"));
const MathNumberTheory = lazy(() => import("./pages/algorithms/MathNumberTheory"));
const Randomized = lazy(() => import("./pages/algorithms/Randomized"));
const Geometry = lazy(() => import("./pages/algorithms/Geometry"));

const GraphTraversal = lazy(() => import("./pages/graph-algorithms/GraphTraversal"));
const ShortestPaths = lazy(() => import("./pages/graph-algorithms/ShortestPaths"));
const MinimumSpanningTree = lazy(() => import("./pages/graph-algorithms/MinimumSpanningTree"));
const TopologicalSort = lazy(() => import("./pages/graph-algorithms/TopologicalSort"));
const AdvancedGraphs = lazy(() => import("./pages/graph-algorithms/AdvancedGraphs"));

const CheatSheet = lazy(() => import("./pages/reference/CheatSheet"));
const ProblemSolving = lazy(() => import("./pages/reference/ProblemSolving"));
const Visualizers = lazy(() => import("./pages/reference/Visualizers"));
const ComplexityClasses = lazy(() => import("./pages/reference/ComplexityClasses"));
const Glossary = lazy(() => import("./pages/reference/Glossary"));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />

        <Route path="getting-started/introduction" element={<Introduction />} />
        <Route path="getting-started/complexity" element={<Complexity />} />
        <Route path="getting-started/python-essentials" element={<PythonEssentials />} />
        <Route path="getting-started/recursion" element={<Recursion />} />

        <Route path="data-structures/arrays" element={<Arrays />} />
        <Route path="data-structures/strings" element={<Strings />} />
        <Route path="data-structures/linked-lists" element={<LinkedLists />} />
        <Route path="data-structures/stacks" element={<Stacks />} />
        <Route path="data-structures/queues" element={<Queues />} />
        <Route path="data-structures/hash-tables" element={<HashTables />} />
        <Route path="data-structures/trees" element={<Trees />} />
        <Route path="data-structures/binary-search-trees" element={<BinarySearchTrees />} />
        <Route path="data-structures/balanced-trees" element={<BalancedTrees />} />
        <Route path="data-structures/heaps" element={<Heaps />} />
        <Route path="data-structures/tries" element={<Tries />} />
        <Route path="data-structures/graphs" element={<Graphs />} />
        <Route path="data-structures/union-find" element={<UnionFind />} />
        <Route path="data-structures/segment-trees" element={<SegmentTrees />} />
        <Route path="data-structures/advanced" element={<AdvancedDataStructures />} />

        <Route path="algorithms/searching" element={<Searching />} />
        <Route path="algorithms/sorting" element={<Sorting />} />
        <Route path="algorithms/two-pointers" element={<TwoPointers />} />
        <Route path="algorithms/sliding-window" element={<SlidingWindow />} />
        <Route path="algorithms/prefix-sums" element={<PrefixSums />} />
        <Route path="algorithms/matrix" element={<MatrixGrid />} />
        <Route path="algorithms/intervals" element={<Intervals />} />
        <Route path="algorithms/divide-and-conquer" element={<DivideAndConquer />} />
        <Route path="algorithms/greedy" element={<Greedy />} />
        <Route path="algorithms/backtracking" element={<Backtracking />} />
        <Route path="algorithms/dynamic-programming" element={<DynamicProgramming />} />
        <Route path="algorithms/bit-manipulation" element={<BitManipulation />} />
        <Route path="algorithms/string-algorithms" element={<StringAlgorithms />} />
        <Route path="algorithms/math" element={<MathNumberTheory />} />
        <Route path="algorithms/randomized" element={<Randomized />} />
        <Route path="algorithms/geometry" element={<Geometry />} />

        <Route path="graph-algorithms/traversal" element={<GraphTraversal />} />
        <Route path="graph-algorithms/shortest-paths" element={<ShortestPaths />} />
        <Route path="graph-algorithms/minimum-spanning-tree" element={<MinimumSpanningTree />} />
        <Route path="graph-algorithms/topological-sort" element={<TopologicalSort />} />
        <Route path="graph-algorithms/advanced" element={<AdvancedGraphs />} />

        <Route path="reference/visualizers" element={<Visualizers />} />
        <Route path="reference/cheat-sheet" element={<CheatSheet />} />
        <Route path="reference/problem-solving" element={<ProblemSolving />} />
        <Route path="reference/complexity-classes" element={<ComplexityClasses />} />
        <Route path="reference/glossary" element={<Glossary />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
