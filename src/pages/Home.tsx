import { Link } from "react-router";
import { CodeBlock } from "../components/CodeBlock";
import { flatNavigation, navigation } from "../data/navigation";
import { useProgress } from "../lib/progress";

const highlights = [
  { icon: "🐍", title: "Python-first", text: "Every concept comes with clean, idiomatic, runnable Python 3 code." },
  { icon: "⏱️", title: "Complexity everywhere", text: "Time and space costs for every operation, color-coded at a glance." },
  { icon: "🧭", title: "Pattern-driven", text: "Learn the reusable patterns behind hundreds of interview problems." },
  { icon: "🎨", title: "Visual intuition", text: "Diagrams and step-by-step walkthroughs build a mental model." },
];

const learningPath = [
  "Complexity Analysis",
  "Arrays",
  "Hash Tables",
  "Two Pointers",
  "Stacks",
  "Linked Lists",
  "Trees",
  "Graphs",
  "BFS & DFS",
  "Dynamic Programming",
];

function ProgressCard() {
  const { isComplete, reset } = useProgress();
  const done = flatNavigation.filter((item) => isComplete(item.path)).length;
  if (done === 0) return null;
  const total = flatNavigation.length;
  const nextUp = flatNavigation.find((item) => !isComplete(item.path));

  return (
    <section className="mb-16 flex flex-wrap items-center gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="min-w-[200px] flex-1">
        <div className="text-sm text-slate-400">Your progress</div>
        <div className="mt-1 text-2xl font-bold text-white">
          {done} <span className="text-base font-medium text-slate-400">of {total} topics complete</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400"
            style={{ width: `${Math.round((done / total) * 100)}%` }}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {nextUp && (
          <Link
            to={nextUp.path}
            className="rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-on-accent"
          >
            Continue: {nextUp.title} →
          </Link>
        )}
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Reset all progress?")) reset();
          }}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 transition hover:border-rose-400/40 hover:text-rose-300"
        >
          Reset
        </button>
      </div>
    </section>
  );
}

export default function Home() {
  const { isComplete } = useProgress();
  return (
    <div>
      <section className="relative pb-16 pt-6 text-center sm:pt-12">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-200">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          {flatNavigation.length} in-depth topics · Python 3
        </div>
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Master{" "}
          <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
            Data Structures
          </span>{" "}
          &amp; Algorithms
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          An elegant, practical guide from Big-O fundamentals to advanced graph algorithms — explained clearly and
          implemented in Python.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/getting-started/introduction"
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3 font-semibold text-on-accent shadow-lg shadow-indigo-500/30 transition hover:shadow-fuchsia-500/40 hover:brightness-110"
          >
            Start learning →
          </Link>
          <Link
            to="/reference/cheat-sheet"
            className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/10"
          >
            Complexity cheat sheet
          </Link>
        </div>

        <div className="mx-auto mt-14 max-w-2xl text-left">
          <CodeBlock
            title="binary_search.py"
            code={`
              def binary_search(nums: list[int], target: int) -> int:
                  lo, hi = 0, len(nums) - 1
                  while lo <= hi:
                      mid = (lo + hi) // 2      # O(log n) — halve the search space
                      if nums[mid] == target:
                          return mid
                      if nums[mid] < target:
                          lo = mid + 1
                      else:
                          hi = mid - 1
                  return -1

              print(binary_search([1, 3, 5, 7, 9, 11], 7))
            `}
            output="3"
          />
        </div>
      </section>

      <ProgressCard />

      <section className="grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item) => (
          <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-3 text-2xl">{item.icon}</div>
            <div className="font-semibold text-white">{item.title}</div>
            <p className="mt-1 text-sm leading-6 text-slate-400">{item.text}</p>
          </div>
        ))}
      </section>

      <section className="pb-16">
        <h2 className="mb-2 text-2xl font-bold text-white">Suggested learning path</h2>
        <p className="mb-6 text-slate-400">New to DSA? Follow this order to build each idea on top of the last.</p>
        <div className="flex flex-wrap items-center gap-2">
          {learningPath.map((title, index) => {
            const item = flatNavigation.find((nav) => nav.title === title);
            if (!item) return null;
            return (
              <div key={title} className="flex items-center gap-2">
                <Link
                  to={item.path}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-200 transition hover:border-fuchsia-400/40 hover:text-white"
                >
                  <span className="mr-1.5 font-mono text-xs text-fuchsia-300">{index + 1}</span>
                  {title}
                </Link>
                {index < learningPath.length - 1 && <span className="text-slate-600">→</span>}
              </div>
            );
          })}
        </div>
      </section>

      {navigation.map((group) => (
        <section key={group.title} className="pb-14">
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
            <span>{group.icon}</span>
            {group.title}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-5 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-fuchsia-500/0 blur-2xl transition group-hover:bg-fuchsia-500/20" />
                {isComplete(item.path) && (
                  <span className="absolute top-4 right-4 text-sm text-emerald-400" title="Completed">
                    ✓
                  </span>
                )}
                <div className="font-semibold text-white">{item.title}</div>
                <p className="mt-1.5 text-sm leading-6 text-slate-400">{item.description}</p>
                <div className="mt-4 text-sm font-medium text-indigo-300 opacity-0 transition group-hover:opacity-100">
                  Read →
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
