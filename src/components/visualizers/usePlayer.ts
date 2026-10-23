import { useEffect, useState } from "react";

export function usePlayer<T extends { caption: string }>(steps: readonly [T, ...T[]] | readonly T[]) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const last = steps.length - 1;
  const isPlaying = playing && index < last;

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setTimeout(() => setIndex(i => Math.min(i + 1, last)), 700 / speed);
    return () => window.clearTimeout(timer);
  }, [index, isPlaying, last, speed]);

  const pauseAndMove = (next: number) => {
    setPlaying(false);
    setIndex(Math.max(0, Math.min(last, next)));
  };
  return {
    frame: steps[index], index, total: steps.length, isPlaying, speed, setSpeed,
    toggle: () => {
      if (index === last) { setIndex(0); setPlaying(true); }
      else setPlaying(value => !value);
    },
    back: () => pauseAndMove(index - 1),
    forward: () => pauseAndMove(index + 1),
    reset: () => pauseAndMove(0),
  };
}
