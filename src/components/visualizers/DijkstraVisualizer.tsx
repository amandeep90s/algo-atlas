import { useId, useMemo, useState } from "react";
import { dijkstraEdges, dijkstraFrames, dijkstraNodes, edgeKey } from "./algorithms";
import { GraphCanvas } from "./GraphCanvas";
import { inputClass, panelClass, PlayerControls } from "./PlayerControls";
import { usePlayer } from "./usePlayer";

function DijkstraPlayback({ start }: { start: string }) {
  const steps = useMemo(() => dijkstraFrames(start), [start]);
  const player = usePlayer(steps);
  const { frame } = player;
  const tree = Object.entries(frame.parents).map(([to, from]) => edgeKey(from, to));
  return (
    <>
      <GraphCanvas label="Dijkstra weighted graph" nodes={dijkstraNodes} edges={dijkstraEdges}
        current={frame.current} frontier={frame.queue.map(entry => entry.node)} visited={frame.settled}
        tree={tree} activeEdge={frame.activeEdge} />
      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-left text-xs text-slate-300">
          <caption className="bg-slate-800 p-2 text-left font-medium text-slate-100">Distances from {start} · current: {frame.current ?? "none"}</caption>
          <thead className="bg-slate-800/50"><tr>
            <th scope="col" className="px-2 py-2">Vertex</th><th scope="col" className="px-2 py-2">Distance</th>
            <th scope="col" className="px-2 py-2">Parent</th><th scope="col" className="px-2 py-2">State</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-700">
            {dijkstraNodes.map(({ id }) => (
              <tr key={id} className={id === frame.current ? "bg-amber-500/10 text-amber-200" : frame.settled.includes(id) ? "text-emerald-200" : ""}>
                <th scope="row" className="px-2 py-1.5 font-mono">{id}</th>
                <td className="px-2 py-1.5 font-mono">{frame.distances[id] === Infinity ? "∞" : frame.distances[id]}</td>
                <td className="px-2 py-1.5 font-mono">{frame.parents[id] ?? "—"}</td>
                <td className="px-2 py-1.5">{frame.settled.includes(id) ? "Final" : frame.distances[id] === Infinity ? "Unknown" : "Tentative"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 rounded-xl bg-slate-950/50 p-3">
        <p className="text-xs text-slate-400">Priority queue (minimum first): (vertex, distance)</p>
        <p className="mt-2 break-words font-mono text-sm text-indigo-200">
          {frame.queue.map(entry => `(${entry.node}, ${entry.distance})`).join(" · ") || "Empty"}
        </p>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-400">The queue is displayed in priority order, not heap-array order. Improved entries are inserted without removing stale ones. Green edges show current parents; they become the final shortest-path tree at completion.</p>
      <PlayerControls {...player} caption={frame.caption} />
    </>
  );
}

export function DijkstraVisualizer() {
  const id = useId();
  const [start, setStart] = useState("A");
  return (
    <div className={panelClass} role="group" aria-label="Dijkstra visualizer">
      <label htmlFor={id} className="mb-4 flex w-fit flex-col gap-1.5 text-xs text-slate-300">Start vertex
        <select id={id} className={inputClass} value={start} onChange={event => setStart(event.target.value)}>
          {dijkstraNodes.map(node => <option key={node.id}>{node.id}</option>)}
        </select>
      </label>
      <DijkstraPlayback key={start} start={start} />
    </div>
  );
}
