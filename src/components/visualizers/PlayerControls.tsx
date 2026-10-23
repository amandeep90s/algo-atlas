import { useId } from "react";

export const buttonClass = "rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 hover:border-indigo-400 hover:bg-indigo-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-40";
export const inputClass = "min-w-0 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400";
export const panelClass = "min-w-0 rounded-2xl border border-slate-700 bg-slate-900/60 p-3 sm:p-5";

type Props = {
  index: number; total: number; isPlaying: boolean; speed: number; caption: string;
  toggle: () => void; back: () => void; forward: () => void; reset: () => void;
  setSpeed: (speed: number) => void;
};

export function PlayerControls({ index, total, isPlaying, speed, caption, toggle, back, forward, reset, setSpeed }: Props) {
  const speedId = useId();
  return (
    <div className="mt-5 space-y-4 border-t border-slate-700 pt-4">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Playback controls">
        <button type="button" className={buttonClass} onClick={back} disabled={index === 0} aria-label="Step back">← Back</button>
        <button type="button" className={buttonClass} onClick={toggle} aria-label={isPlaying ? "Pause playback" : "Play playback"}>
          {isPlaying ? "Pause" : index === total - 1 ? "Replay" : "Play"}
        </button>
        <button type="button" className={buttonClass} onClick={forward} disabled={index === total - 1} aria-label="Step forward">Next →</button>
        <button type="button" className={buttonClass} onClick={reset} aria-label="Reset playback">Reset</button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <label htmlFor={speedId} className="flex items-center gap-2">
          Speed
          <input id={speedId} aria-label="Playback speed" type="range" min="0.25" max="3" step="0.25" value={speed}
            onChange={event => setSpeed(Number(event.target.value))}
            className="w-24 accent-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400" />
          <span className="w-8 font-mono">{speed}×</span>
        </label>
        <span className="font-mono tabular-nums">Step {index + 1} / {total}</span>
      </div>
      <p role="status" aria-live="polite" aria-atomic="true" className="min-h-12 text-sm leading-6 text-indigo-200">{caption}</p>
    </div>
  );
}
