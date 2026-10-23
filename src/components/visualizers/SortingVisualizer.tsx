import { useId, useMemo, useState } from "react";
import { CodeBlock } from "../CodeBlock";
import { sortingAlgorithms, sortingFrames } from "./algorithms";
import type { SortingAlgorithm } from "./algorithms";
import { buttonClass, inputClass, panelClass, PlayerControls } from "./PlayerControls";
import { sortingSnippets } from "./sortingSnippets";
import { usePlayer } from "./usePlayer";

const initialValues = [42, 18, 73, 31, 59, 12, 88, 24, 65, 47, 95, 36, 81, 15, 54, 68];

function SortPlayback({ values, algorithm }: { values: number[]; algorithm: SortingAlgorithm }) {
  const steps = useMemo(() => sortingFrames(values, algorithm), [values, algorithm]);
  const player = usePlayer(steps);
  const { frame } = player;
  const max = Math.max(...values, 1);
  return (
    <>
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
        <span>Comparisons: <strong className="font-mono text-amber-300">{frame.comparisons}</strong></span>
        <span>Array writes: <strong className="font-mono text-rose-300">{frame.writes}</strong></span>
      </div>
      <div role="list" aria-label="Array bars" className="flex h-56 items-end gap-1 rounded-xl border-b border-slate-600 bg-slate-950/50 px-1 pt-6 sm:gap-2 sm:px-3">
        {frame.values.map((value, i) => {
          const state = frame.writing.includes(i) ? "writing" : frame.pivot === i ? "pivot / held key"
            : frame.comparing.includes(i) ? "comparing" : frame.sorted.includes(i) ? "sorted" : "unsorted";
          const color = frame.writing.includes(i) ? "bg-rose-400" : frame.pivot === i ? "bg-fuchsia-400"
            : frame.comparing.includes(i) ? "bg-amber-300" : frame.sorted.includes(i) ? "bg-emerald-400" : "bg-indigo-400";
          return (
            <div key={i} role="listitem" aria-label={`Index ${i}: ${value}, ${state}`}
              title={`Index ${i}: ${value} — ${state}`}
              className={`relative min-w-0 flex-1 rounded-t-sm motion-safe:transition-all motion-safe:duration-200 ${color}`}
              style={{ height: `${(value / max) * 100}%` }}>
              <span aria-hidden="true" className="absolute -top-5 inset-x-0 text-center font-mono text-[9px] text-slate-300 sm:text-xs">{value}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
        <span className="text-indigo-300">● Unsorted</span><span className="text-amber-300">● Comparing</span>
        <span className="text-rose-300">● Swap / write</span><span className="text-fuchsia-300">● Pivot / held key</span>
        <span className="text-emerald-300">● Final position</span>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-400">A swap counts as two array writes; self-swaps are skipped. Buffer copies are excluded. Ordered prefixes and merged runs are not necessarily final positions.</p>
      <PlayerControls {...player} caption={frame.caption} />
    </>
  );
}

export function SortingVisualizer() {
  const id = useId();
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>("Bubble");
  const [values, setValues] = useState(initialValues);
  const shuffle = () => {
    const next = Array.from({ length: 16 }, (_, i) => 10 + i * 5);
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setValues(next);
  };
  return (
    <div className={panelClass} role="group" aria-label="Sorting visualizer">
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label htmlFor={id} className="flex flex-col gap-1.5 text-xs text-slate-300">
          Sorting algorithm
          <select id={id} className={inputClass} value={algorithm} onChange={event => setAlgorithm(event.target.value as SortingAlgorithm)}>
            {sortingAlgorithms.map(name => <option key={name} value={name}>{name === "Quick" ? "Quick (Lomuto)" : name} sort</option>)}
          </select>
        </label>
        <button type="button" className={buttonClass} onClick={shuffle} aria-label="Shuffle array">Shuffle</button>
      </div>
      <SortPlayback key={algorithm + values.join(",")} values={values} algorithm={algorithm} />
      <details className="mt-4 border-t border-slate-700 pt-4">
        <summary className="cursor-pointer rounded text-sm text-indigo-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400">Python reference: {algorithm} sort</summary>
        <CodeBlock skipVerify title={`${algorithm.toLowerCase()}_sort.py`} code={sortingSnippets[algorithm]} />
      </details>
    </div>
  );
}
