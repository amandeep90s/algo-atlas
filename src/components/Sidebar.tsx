import { NavLink } from "react-router";
import { flatNavigation, navigation } from "../data/navigation";
import { useProgress } from "../lib/progress";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { isComplete } = useProgress();
  const total = flatNavigation.length;
  const done = flatNavigation.filter((item) => isComplete(item.path)).length;
  const percent = Math.round((done / total) * 100);

  return (
    <nav aria-label="Documentation" className="space-y-8 pb-10">
      <div className="mx-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Your progress</span>
          <span className="font-medium text-slate-200">
            {done}/{total}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Topics completed"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      {navigation.map((group) => (
        <div key={group.title}>
          <div className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            <span className="text-sm">{group.icon}</span>
            {group.title}
          </div>
          <ul className="ml-3 space-y-0.5 border-l border-white/5">
            {group.items.map((item) => {
              const complete = isComplete(item.path);
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `-ml-px flex items-center gap-2 border-l py-1.5 pr-3 pl-4 text-sm transition ${
                        isActive
                          ? "border-indigo-400 bg-gradient-to-r from-indigo-500/15 to-transparent font-medium text-white"
                          : "border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-200"
                      }`
                    }
                  >
                    <span className="flex-1">{item.title}</span>
                    {complete && (
                      <span className="text-xs text-emerald-400" aria-label="completed" title="Completed">
                        ✓
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
