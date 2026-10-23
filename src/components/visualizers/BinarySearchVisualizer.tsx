import { useId, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { binarySearchFrames, searchValues } from "./algorithms";
import { buttonClass, inputClass, panelClass, PlayerControls } from "./PlayerControls";
import { usePlayer } from "./usePlayer";

function SearchPlayback({ target }: { target: number }) {
  const steps = useMemo(() => binarySearchFrames(searchValues, target), [target]);
  const player = usePlayer(steps);
  const { frame } = player;
  return (
    <>
      <p className="mb-3 text-sm text-slate-300">Target: <strong className="font-mono text-indigo-200">{target}</strong></p>
      <div role="list" aria-label="Sorted search array" className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5 xl:grid-cols-8">
        {searchValues.map((value, i) => {
          const eliminated = i < frame.lo || i > frame.hi;
          const pointers = [i === frame.lo ? "lo" : "", i === frame.mid ? "mid" : "", i === frame.hi ? "hi" : ""].filter(Boolean).join(" / ");
          const state = frame.found === i ? "found" : eliminated ? "eliminated" : frame.mid === i ? "comparing" : "candidate";
          return (
            <div key={i} role="listitem" aria-label={`Index ${i}: ${value}, ${state}${pointers ? ", " + pointers : ""}`}
              className={`rounded-lg border p-1 text-center motion-safe:transition-opacity ${frame.found === i ? "border-emerald-400 bg-emerald-500/20" : frame.mid === i ? "border-amber-300 bg-amber-500/20" : "border-slate-600 bg-slate-800"} ${eliminated ? "opacity-30" : ""}`}>
              <div aria-hidden="true" className="text-[10px] text-slate-400">[{i}]</div>
              <div className="font-mono text-sm font-semibold text-slate-100">{value}</div>
              <div className="min-h-7 text-[9px] leading-3 text-indigo-200">{pointers || "·"}</div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 break-words font-mono text-xs text-slate-300">lo = {frame.lo}, mid = {frame.mid ?? "—"}, hi = {frame.hi}{frame.lo > frame.hi ? " · empty interval" : ""}</p>
      <p className="mt-2 text-xs leading-5 text-slate-400">Indices wrap across rows on small screens. Amber = comparison; green = found; dimmed = eliminated.</p>
      <PlayerControls {...player} caption={frame.caption} />
    </>
  );
}

export function BinarySearchVisualizer() {
  const id = useId();
  const [input, setInput] = useState("29");
  const [search, setSearch] = useState({ target: 29, run: 0 });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = Number(input);
    if (input.trim() && Number.isSafeInteger(target)) setSearch(previous => ({ target, run: previous.run + 1 }));
  };
  return (
    <div className={panelClass} role="group" aria-label="Binary search visualizer">
      <form onSubmit={submit} className="mb-5 flex flex-wrap items-end gap-3">
        <label htmlFor={id} className="flex min-w-0 flex-col gap-1.5 text-xs text-slate-300">
          Target integer
          <input id={id} className={`${inputClass} w-32`} type="number" step="1" required
            min={Number.MIN_SAFE_INTEGER} max={Number.MAX_SAFE_INTEGER} value={input} onChange={event => setInput(event.target.value)} />
        </label>
        <button type="submit" className={buttonClass} aria-label="Search target">Search</button>
      </form>
      <SearchPlayback key={search.run} target={search.target} />
    </div>
  );
}
