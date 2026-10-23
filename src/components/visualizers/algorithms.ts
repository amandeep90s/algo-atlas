export const sortingAlgorithms = ["Bubble", "Selection", "Insertion", "Merge", "Quick", "Heap"] as const;
export type SortingAlgorithm = (typeof sortingAlgorithms)[number];
export type SortFrame = {
  values: number[]; comparing: number[]; writing: number[]; pivot: number | null;
  sorted: number[]; comparisons: number; writes: number; caption: string;
};

export function sortingFrames(input: readonly number[], algorithm: SortingAlgorithm): SortFrame[] {
  const a = [...input];
  const frames: SortFrame[] = [];
  const sorted = new Set<number>();
  let comparisons = 0, writes = 0;
  const emit = (caption: string, comparing: number[] = [], writing: number[] = [], pivot: number | null = null) => {
    frames.push({ values: [...a], comparing: [...comparing], writing: [...writing], pivot,
      sorted: [...sorted], comparisons, writes, caption });
  };
  const compare = (i: number, j: number, pivot: number | null = null) => {
    comparisons++;
    emit(`Compare ${a[i]} and ${a[j]} at indices ${i} and ${j}.`, [i, j], [], pivot);
    return a[i] - a[j];
  };
  const swap = (i: number, j: number, pivot: number | null = null) => {
    if (i === j) return;
    [a[i], a[j]] = [a[j], a[i]];
    writes += 2;
    emit(`Swap indices ${i} and ${j} (two array writes).`, [], [i, j], pivot);
  };
  emit("Ready. Play or step forward to begin sorting.");
  if (algorithm === "Bubble") {
    for (let end = a.length - 1; end > 0; end--) {
      let changed = false;
      for (let j = 0; j < end; j++) {
        if (compare(j, j + 1) > 0) { swap(j, j + 1); changed = true; }
      }
      sorted.add(end);
      emit(`Index ${end} is in its final position.`);
      if (!changed) break;
    }
  } else if (algorithm === "Selection") {
    for (let i = 0; i < a.length - 1; i++) {
      let min = i;
      for (let j = i + 1; j < a.length; j++) if (compare(j, min) < 0) min = j;
      swap(i, min);
      sorted.add(i);
      emit(`Place the minimum remaining value at index ${i}.`);
    }
  } else if (algorithm === "Insertion") {
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      emit(`Hold ${key}; insert it into the ordered prefix [0, ${i - 1}].`, [], [], i);
      let j = i - 1;
      while (j >= 0) {
        comparisons++;
        emit(`Compare ${a[j]} with held value ${key}.`, [j]);
        if (a[j] <= key) break;
        a[j + 1] = a[j]; writes++;
        emit(`Shift ${a[j]} right to index ${j + 1}.`, [], [j + 1]);
        j--;
      }
      a[j + 1] = key; writes++;
      emit(`Insert held value ${key} at index ${j + 1}. The prefix is ordered, not yet final.`, [], [j + 1]);
    }
  } else if (algorithm === "Merge") {
    const merge = (lo: number, hi: number): void => {
      if (hi - lo <= 1) return;
      const mid = Math.floor((lo + hi) / 2);
      merge(lo, mid); merge(mid, hi);
      const left = a.slice(lo, mid), right = a.slice(mid, hi);
      let i = 0, j = 0, k = lo;
      emit(`Merge ordered ranges [${lo}, ${mid}) and [${mid}, ${hi}).`);
      while (i < left.length || j < right.length) {
        let takeLeft = j === right.length;
        if (i < left.length && j < right.length) {
          comparisons++;
          emit(`Compare buffered values ${left[i]} and ${right[j]} (source slots highlighted).`, [lo + i, mid + j]);
          takeLeft = left[i] <= right[j];
        }
        a[k] = takeLeft ? left[i++] : right[j++];
        writes++;
        emit(`Write ${a[k]} to index ${k} from the merge buffer.`, [], [k]);
        k++;
      }
    };
    merge(0, a.length);
  } else if (algorithm === "Quick") {
    const quick = (lo: number, hi: number): void => {
      if (lo > hi) return;
      if (lo === hi) { sorted.add(lo); emit(`Single value at index ${lo} is final.`); return; }
      emit(`Lomuto partition [${lo}, ${hi}]: choose ${a[hi]} as pivot.`, [], [], hi);
      let boundary = lo;
      for (let j = lo; j < hi; j++) {
        if (compare(j, hi, hi) <= 0) { swap(boundary, j, hi); boundary++; }
      }
      swap(boundary, hi, boundary);
      sorted.add(boundary);
      emit(`Pivot ${a[boundary]} is final at index ${boundary}.`, [], [], boundary);
      quick(lo, boundary - 1); quick(boundary + 1, hi);
    };
    quick(0, a.length - 1);
  } else {
    const sift = (root: number, size: number): void => {
      while (2 * root + 1 < size) {
        let child = 2 * root + 1;
        if (child + 1 < size && compare(child, child + 1) < 0) child++;
        if (compare(root, child) >= 0) return;
        swap(root, child); root = child;
      }
    };
    for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) sift(i, a.length);
    emit("Max-heap built. Repeatedly move the largest value to the end.");
    for (let end = a.length - 1; end > 0; end--) {
      swap(0, end); sorted.add(end);
      emit(`Maximum at index ${end} is final; restore the remaining heap.`);
      sift(0, end);
    }
  }
  a.forEach((_, i) => sorted.add(i));
  emit("Complete. Every value is in nondecreasing order.");
  return frames;
}

export const searchValues = [3, 7, 12, 18, 23, 29, 34, 41, 47, 53, 61, 68, 74, 82, 95];
export type SearchFrame = { lo: number; hi: number; mid: number | null; found: number | null; caption: string };
export function binarySearchFrames(values: readonly number[], target: number): SearchFrame[] {
  let lo = 0, hi = values.length - 1;
  const frames: SearchFrame[] = [{ lo, hi, mid: null, found: null, caption: `Search for ${target} inside the inclusive range [${lo}, ${hi}].` }];
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    frames.push({ lo, hi, mid, found: null, caption: `mid = ${mid}; compare ${values[mid]} with target ${target}.` });
    if (values[mid] === target) {
      frames.push({ lo, hi, mid, found: mid, caption: `Found ${target} at index ${mid}.` });
      return frames;
    }
    const caption = values[mid] < target
      ? `${values[mid]} < ${target}: discard indices ${lo} through ${mid}; set lo = ${mid + 1}.`
      : `${values[mid]} > ${target}: discard indices ${mid} through ${hi}; set hi = ${mid - 1}.`;
    if (values[mid] < target) lo = mid + 1; else hi = mid - 1;
    frames.push({ lo, hi, mid: null, found: null, caption });
  }
  frames.push({ lo, hi, mid: null, found: null, caption: `Not found: lo (${lo}) > hi (${hi}). The search interval is empty.` });
  return frames;
}

export type GraphNode = { id: string; x: number; y: number };
export type GraphEdge = { from: string; to: string; weight?: number };
export const traversalNodes: GraphNode[] = [
  { id: "A", x: 50, y: 130 }, { id: "B", x: 145, y: 50 }, { id: "C", x: 145, y: 210 },
  { id: "D", x: 255, y: 45 }, { id: "E", x: 255, y: 130 }, { id: "F", x: 255, y: 220 },
  { id: "G", x: 370, y: 80 }, { id: "H", x: 370, y: 200 },
];
export const traversalEdges: GraphEdge[] = [
  { from: "A", to: "B" }, { from: "A", to: "C" }, { from: "B", to: "D" },
  { from: "B", to: "E" }, { from: "C", to: "E" }, { from: "C", to: "F" },
  { from: "D", to: "G" }, { from: "E", to: "G" }, { from: "E", to: "H" }, { from: "F", to: "H" },
];
export const edgeKey = (from: string, to: string) => [from, to].sort().join("-");
export type TraversalFrame = {
  frontier: string[]; current: string | null; visited: string[]; order: string[]; tree: string[]; caption: string;
};
export function traversalFrames(start: string, mode: "BFS" | "DFS"): TraversalFrame[] {
  const frontier = [start], discovered = new Set([start]);
  const visited: string[] = [], order: string[] = [], tree: string[] = [];
  const frames: TraversalFrame[] = [];
  const emit = (caption: string, current: string | null = null) => frames.push({
    frontier: [...frontier], current, visited: [...visited], order: [...order], tree: [...tree], caption,
  });
  emit(`Start at ${start}. Put it in the ${mode === "BFS" ? "queue" : "stack"} and mark it discovered.`);
  while (frontier.length) {
    const current = frontier.shift()!;
    order.push(current);
    emit(`Remove ${current} from the ${mode === "BFS" ? "front of the queue" : "top of the stack"}; visit it.`, current);
    const neighbors = traversalEdges.flatMap(e => e.from === current ? [e.to] : e.to === current ? [e.from] : []).sort();
    if (mode === "DFS") neighbors.reverse();
    for (const next of neighbors) {
      if (discovered.has(next)) continue;
      discovered.add(next); tree.push(edgeKey(current, next));
      if (mode === "BFS") frontier.push(next); else frontier.unshift(next);
      emit(`Discover ${next} via ${current}; ${mode === "BFS" ? "enqueue" : "push"} it once.`, current);
    }
    visited.push(current);
    emit(`Finished scanning ${current}'s neighbors.`);
  }
  emit(`${mode} complete: all ${visited.length} reachable vertices visited.`);
  return frames;
}

export const dijkstraNodes: GraphNode[] = [
  { id: "A", x: 40, y: 130 }, { id: "B", x: 145, y: 45 }, { id: "C", x: 145, y: 215 },
  { id: "D", x: 255, y: 45 }, { id: "E", x: 255, y: 215 }, { id: "F", x: 370, y: 130 },
  { id: "G", x: 370, y: 235 },
];
export const dijkstraEdges: GraphEdge[] = [
  { from: "A", to: "B", weight: 4 }, { from: "A", to: "C", weight: 2 },
  { from: "B", to: "C", weight: 1 }, { from: "B", to: "D", weight: 5 },
  { from: "C", to: "E", weight: 8 }, { from: "D", to: "E", weight: 2 },
  { from: "D", to: "F", weight: 6 }, { from: "E", to: "F", weight: 3 }, { from: "E", to: "G", weight: 1 },
  { from: "F", to: "G", weight: 2 },
];
export type QueueEntry = { node: string; distance: number };
export type DijkstraFrame = {
  distances: Record<string, number>; parents: Record<string, string>; settled: string[];
  current: string | null; activeEdge: string | null; queue: QueueEntry[]; caption: string;
};
export function dijkstraFrames(start: string): DijkstraFrame[] {
  const distances: Record<string, number> = Object.fromEntries(dijkstraNodes.map(n => [n.id, Infinity]));
  const parents: Record<string, string> = {}, settled = new Set<string>();
  const queue: QueueEntry[] = [{ node: start, distance: 0 }], frames: DijkstraFrame[] = [];
  distances[start] = 0;
  const emit = (caption: string, current: string | null = null, activeEdge: string | null = null) => {
    frames.push({ distances: { ...distances }, parents: { ...parents }, settled: [...settled],
      current, activeEdge, queue: queue.map(entry => ({ ...entry })), caption });
  };
  emit(`Set distance[${start}] = 0. All other distances start at infinity.`);
  while (queue.length) {
    const { node, distance } = queue.shift()!;
    if (distance !== distances[node] || settled.has(node)) {
      emit(`Skip stale entry (${node}, ${distance}); a shorter distance is already known.`);
      continue;
    }
    settled.add(node);
    emit(`Extract ${node} with minimum distance ${distance}; its distance is now final.`, node);
    for (const edge of dijkstraEdges) {
      const neighbor = edge.from === node ? edge.to : edge.to === node ? edge.from : null;
      if (!neighbor || settled.has(neighbor)) continue;
      const candidate = distance + edge.weight!;
      const key = edgeKey(node, neighbor);
      const old = distances[neighbor];
      emit(`Check ${node} → ${neighbor}: ${distance} + ${edge.weight} = ${candidate}, versus ${old === Infinity ? "∞" : old}.`, node, key);
      if (candidate < old) {
        distances[neighbor] = candidate; parents[neighbor] = node;
        queue.push({ node: neighbor, distance: candidate });
        queue.sort((a, b) => a.distance - b.distance || a.node.localeCompare(b.node));
        emit(`Relax ${node} → ${neighbor}: distance becomes ${candidate}. Push the improved entry.`, node, key);
      } else {
        emit(`No improvement for ${neighbor}; keep its existing distance and parent.`, node, key);
      }
    }
  }
  emit("Complete. Highlighted parent edges form the final shortest-path tree.");
  return frames;
}
