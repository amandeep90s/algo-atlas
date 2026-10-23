import { useId, useMemo, useState } from "react";
import { traversalEdges, traversalFrames, traversalNodes } from "./algorithms";
import { GraphCanvas } from "./GraphCanvas";
import { buttonClass, inputClass, panelClass, PlayerControls } from "./PlayerControls";
import { usePlayer } from "./usePlayer";

function TraversalPlayback({ start, mode }: { start: string; mode: "BFS" | "DFS" }) {
  const steps = useMemo(() => traversalFrames(start, mode), [start, mode]);
  const player = usePlayer(steps);
  const { frame } = player;
  return (
    <>
      <GraphCanvas label={mode + " traversal"} nodes={traversalNodes} edges={traversalEdges}
        current={frame.current} frontier={frame.frontier} visited={frame.visited} tree={frame.tree} />
      <dl className="mt-5 space-y-3 rounded-xl bg-slate-950/50 p-3 text-sm">
        <div><dt className="text-xs text-slate-400">{mode === "BFS" ? "Queue (front → back)" : "Stack (top → bottom)"}</dt>
          <dd className="mt-1 break-words font-mono text-indigo-200">{frame.frontier.join(" → ") || "Empty"}</dd></div>
        <div><dt className="text-xs text-slate-400">Visit order</dt>
          <dd className="mt-1 break-words font-mono text-emerald-200">{frame.order.join(" → ") || "No vertices visited yet"}</dd></div>
        <div><dt className="text-xs text-slate-400">Current vertex</dt><dd className="mt-1 font-mono text-amber-200">{frame.current ?? "None"}</dd></div>
      </dl>
      <p className="mt-3 text-xs leading-5 text-slate-400">{mode === "BFS"
        ? "Neighbors are enqueued alphabetically. Mark on enqueue to avoid duplicate work."
        : "Iterative DFS: push neighbors in reverse alphabetical order so the alphabetically first is on top. Mark on push; its tree may differ from recursive DFS."}</p>
      <PlayerControls {...player} caption={frame.caption} />
    </>
  );
}

export function GraphTraversalVisualizer() {
  const id = useId();
  const [mode, setMode] = useState<"BFS" | "DFS">("BFS");
  const [start, setStart] = useState("A");
  return (
    <div className={panelClass} role="group" aria-label="Graph traversal visualizer">
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div role="group" aria-label="Traversal algorithm" className="flex gap-2">
          {(["BFS", "DFS"] as const).map(name => (
            <button key={name} type="button" className={buttonClass} aria-label={"Use " + name} aria-pressed={mode === name} onClick={() => setMode(name)}>
              {name}{mode === name ? " ✓" : ""}
            </button>
          ))}
        </div>
        <label htmlFor={id} className="flex flex-col gap-1.5 text-xs text-slate-300">Start vertex
          <select id={id} className={inputClass} value={start} onChange={event => setStart(event.target.value)}>
            {traversalNodes.map(node => <option key={node.id}>{node.id}</option>)}
          </select>
        </label>
      </div>
      <TraversalPlayback key={mode + start} mode={mode} start={start} />
    </div>
  );
}
