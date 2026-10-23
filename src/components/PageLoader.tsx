export function PageLoader() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse">
      <span className="sr-only">Loading page…</span>
      <div className="mb-12 border-b border-white/10 pb-10">
        <div className="mb-4 h-4 w-40 rounded bg-indigo-400/20" />
        <div className="h-12 w-2/3 rounded-lg bg-white/10" />
        <div className="mt-6 h-4 w-full max-w-2xl rounded bg-white/5" />
        <div className="mt-3 h-4 w-5/6 max-w-xl rounded bg-white/5" />
        <div className="mt-6 flex gap-2">
          {[0, 1, 2].map((key) => (
            <div key={key} className="h-6 w-24 rounded-full bg-indigo-500/10" />
          ))}
        </div>
      </div>
      {[0, 1].map((key) => (
        <div key={key} className="mb-12">
          <div className="mb-5 h-8 w-64 rounded-lg bg-white/10" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-white/5" />
            <div className="h-4 w-11/12 rounded bg-white/5" />
            <div className="h-4 w-4/5 rounded bg-white/5" />
          </div>
          <div className="mt-6 h-48 rounded-xl border border-white/5 bg-white/3" />
        </div>
      ))}
    </div>
  );
}
