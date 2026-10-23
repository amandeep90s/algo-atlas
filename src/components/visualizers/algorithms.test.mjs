import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("./algorithms.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 } });
const {
  sortingAlgorithms, sortingFrames, binarySearchFrames, searchValues,
  traversalFrames, traversalNodes, traversalEdges, dijkstraFrames, dijkstraNodes, dijkstraEdges, edgeKey,
} = await import("data:text/javascript;base64," + Buffer.from(outputText).toString("base64"));

let seed = 1729;
const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
const inputs = [[], [1], [2, 1], [3, 2, 1], [1, 2, 3], [2, 2, 2], [4, -1, 4, 0, -7],
  ...Array.from({ length: 25 }, () => Array.from({ length: 16 }, () => Math.floor(random() * 21) - 10))];

for (const algorithm of sortingAlgorithms) {
  test(algorithm + " sort: correct result, immutable input, stable history, final-position invariant", () => {
    for (const input of inputs) {
      const original = [...input];
      const expected = [...input].sort((a, b) => a - b);
      const frames = sortingFrames(input, algorithm);
      assert.deepEqual(input, original);
      assert.deepEqual(frames[0].values, original);
      assert.deepEqual(frames.at(-1).values, expected);
      assert.equal(frames.at(-1).sorted.length, input.length);
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        assert.ok(frame.caption.length > 0);
        for (const index of frame.sorted) assert.equal(frame.values[index], expected[index]);
        for (const index of [...frame.comparing, ...frame.writing]) assert.ok(index >= 0 && index < input.length);
        if (i) {
          assert.ok(frame.comparisons >= frames[i - 1].comparisons);
          assert.ok(frame.writes >= frames[i - 1].writes);
          assert.notEqual(frame.values, frames[i - 1].values);
        }
      }
    }
  });
}

test("Sorting counters count value comparisons and destination-array writes", () => {
  const counts = { Bubble: [3, 6], Selection: [3, 2], Insertion: [3, 5], Merge: [3, 5], Quick: [3, 2], Heap: [3, 6] };
  for (const algorithm of sortingAlgorithms) {
    const last = sortingFrames([3, 2, 1], algorithm).at(-1);
    assert.deepEqual([last.comparisons, last.writes], counts[algorithm], algorithm);
  }
});

test("Binary search finds every present target and exhausts absent intervals", () => {
  for (const target of [...searchValues, -10, 0, 30, 42, 100]) {
    const frames = binarySearchFrames(searchValues, target);
    const expected = searchValues.indexOf(target);
    assert.equal(frames.at(-1).found, expected < 0 ? null : expected);
    if (expected < 0) assert.ok(frames.at(-1).lo > frames.at(-1).hi);
    for (const frame of frames) {
      if (expected >= 0) assert.ok(frame.lo <= expected && expected <= frame.hi);
      if (frame.mid !== null) assert.ok(frame.mid >= frame.lo && frame.mid <= frame.hi);
    }
  }
  assert.match(binarySearchFrames([], 1).at(-1).caption, /Not found/);
});

for (const mode of ["BFS", "DFS"]) {
  test(mode + " visits each vertex once from every start and creates a spanning tree", () => {
    for (const { id: start } of traversalNodes) {
      const frames = traversalFrames(start, mode);
      const last = frames.at(-1);
      assert.equal(last.order[0], start);
      assert.equal(new Set(last.order).size, traversalNodes.length);
      assert.equal(last.visited.length, traversalNodes.length);
      assert.equal(last.tree.length, traversalNodes.length - 1);
      assert.deepEqual(last.frontier, []);
      for (const key of last.tree) assert.ok(traversalEdges.some(e => edgeKey(e.from, e.to) === key));
      for (const frame of frames) {
        assert.equal(new Set(frame.frontier).size, frame.frontier.length);
        assert.ok(!frame.frontier.some(node => frame.visited.includes(node)));
      }
      assert.deepEqual(frames[0].order, []);
      assert.deepEqual(frames[0].tree, []);
    }
    assert.deepEqual(traversalFrames("A", mode).at(-1).order,
      mode === "BFS" ? ["A", "B", "C", "D", "E", "F", "G", "H"] : ["A", "B", "D", "G", "E", "H", "F", "C"]);
  });
}

test("BFS order has nondecreasing hop distance", () => {
  for (const { id: start } of traversalNodes) {
    const levels = { [start]: 0 };
    for (let pass = 0; pass < traversalNodes.length; pass++) {
      for (const { from, to } of traversalEdges) {
        levels[to] = Math.min(levels[to] ?? Infinity, (levels[from] ?? Infinity) + 1);
        levels[from] = Math.min(levels[from] ?? Infinity, (levels[to] ?? Infinity) + 1);
      }
    }
    const order = traversalFrames(start, "BFS").at(-1).order;
    for (let i = 1; i < order.length; i++) assert.ok(levels[order[i - 1]] <= levels[order[i]]);
  }
});

test("Dijkstra agrees with Bellman–Ford from every source and records consistent parents", () => {
  for (const { id: start } of dijkstraNodes) {
    const expected = Object.fromEntries(dijkstraNodes.map(n => [n.id, n.id === start ? 0 : Infinity]));
    for (let pass = 0; pass < dijkstraNodes.length - 1; pass++) {
      for (const { from, to, weight } of dijkstraEdges) {
        expected[to] = Math.min(expected[to], expected[from] + weight);
        expected[from] = Math.min(expected[from], expected[to] + weight);
      }
    }
    const frames = dijkstraFrames(start);
    const last = frames.at(-1);
    assert.deepEqual(last.distances, expected);
    assert.equal(last.settled.length, dijkstraNodes.length);
    assert.equal(Object.keys(last.parents).length, dijkstraNodes.length - 1);
    assert.deepEqual(last.queue, []);
    assert.deepEqual(frames[0].parents, {});
    assert.deepEqual(frames[0].settled, []);
    for (const [child, parent] of Object.entries(last.parents)) {
      const edge = dijkstraEdges.find(e => edgeKey(e.from, e.to) === edgeKey(child, parent));
      assert.equal(last.distances[child], last.distances[parent] + edge.weight);
      const path = new Set([child]);
      for (let current = parent; current; current = last.parents[current]) {
        assert.ok(!path.has(current)); path.add(current);
      }
      assert.ok(path.has(start));
    }
    for (const frame of frames) {
      for (const node of frame.settled) assert.equal(frame.distances[node], expected[node]);
      for (let i = 1; i < frame.queue.length; i++) assert.ok(frame.queue[i - 1].distance <= frame.queue[i].distance);
    }
  }
  assert.deepEqual(dijkstraFrames("A").at(-1).distances, { A: 0, B: 3, C: 2, D: 8, E: 10, F: 13, G: 11 });
  assert.ok(dijkstraFrames("A").some(frame => frame.caption.includes("Skip stale")));
});
