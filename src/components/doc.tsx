import type { ReactNode } from "react";

export { CodeBlock } from "./CodeBlock";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  tags?: string[];
};

export function PageHeader({ eyebrow, title, description, tags }: PageHeaderProps) {
  return (
    <header className="relative mb-12 border-b border-white/10 pb-10">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">{eyebrow}</p>
      <h1 className="bg-gradient-to-br from-white via-indigo-100 to-indigo-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{description}</p>
      {tags && tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}

export function Section({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  const anchor = id ?? slugify(title);
  return (
    <section className="mb-14 scroll-mt-24" id={anchor}>
      <h2 data-toc className="group mb-5 flex items-center gap-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        <span className="h-7 w-1 rounded-full bg-gradient-to-b from-indigo-400 to-fuchsia-500" />
        <a href={`#${anchor}`} className="hover:text-indigo-200">
          {title}
        </a>
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-8">
      <h3 className="mb-3 text-xl font-semibold text-indigo-100">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="leading-7 text-slate-300">{children}</p>;
}

export function C({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[0.85em] text-pink-200">
      {children}
    </code>
  );
}

export function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-white">{children}</strong>;
}

export function List({ items, ordered = false }: { items: ReactNode[]; ordered?: boolean }) {
  if (ordered) {
    return (
      <ol className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3 leading-7 text-slate-300">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-200">
              {index + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 leading-7 text-slate-300">
          <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const calloutStyles = {
  note: { icon: "📝", label: "Note", className: "border-sky-400/30 bg-sky-500/[0.07]", title: "text-sky-200" },
  tip: { icon: "💡", label: "Tip", className: "border-emerald-400/30 bg-emerald-500/[0.07]", title: "text-emerald-200" },
  warning: { icon: "⚠️", label: "Watch out", className: "border-amber-400/30 bg-amber-500/[0.07]", title: "text-amber-200" },
  insight: { icon: "✨", label: "Key insight", className: "border-fuchsia-400/30 bg-fuchsia-500/[0.07]", title: "text-fuchsia-200" },
} as const;

export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: keyof typeof calloutStyles;
  title?: string;
  children: ReactNode;
}) {
  const style = calloutStyles[type];
  return (
    <div className={`my-6 rounded-xl border p-5 ${style.className}`}>
      <div className={`mb-2 flex items-center gap-2 font-semibold ${style.title}`}>
        <span>{style.icon}</span>
        <span>{title ?? style.label}</span>
      </div>
      <div className="space-y-3 leading-7 text-slate-300">{children}</div>
    </div>
  );
}

export function Table({ headers, rows }: { headers: ReactNode[]; rows: ReactNode[][] }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.04]">
            {headers.map((header, index) => (
              <th key={index} className="whitespace-nowrap px-4 py-3 font-semibold text-slate-200">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="transition hover:bg-white/[0.03]">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={`px-4 py-3 align-top text-slate-300 ${cellIndex === 0 ? "font-medium text-slate-100" : ""}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function complexityColor(value: string): string {
  const v = value.replace(/\s/g, "");
  if (/^O\(1\)|^Θ\(1\)/.test(v)) return "text-emerald-300 bg-emerald-500/10 border-emerald-400/20";
  if (/^O\(α|^O\(log/.test(v)) return "text-teal-300 bg-teal-500/10 border-teal-400/20";
  if (/^O\((n|m|k|V\+E|E|L|h|√n)\)/.test(v)) return "text-sky-300 bg-sky-500/10 border-sky-400/20";
  if (/log/.test(v)) return "text-indigo-300 bg-indigo-500/10 border-indigo-400/20";
  if (/\^2|²|\^3|³|2\^|n!|\*m|·m|nm/.test(v)) return "text-rose-300 bg-rose-500/10 border-rose-400/20";
  return "text-amber-200 bg-amber-500/10 border-amber-400/20";
}

export function Complexity({ value }: { value: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${complexityColor(value)}`}>
      {value}
    </span>
  );
}

export type ComplexityRow = { operation: ReactNode; time: string; space?: string; note?: ReactNode };

export function ComplexityTable({ rows, title }: { rows: ComplexityRow[]; title?: string }) {
  const hasSpace = rows.some((row) => row.space);
  const hasNote = rows.some((row) => row.note);
  const headers: ReactNode[] = [title ?? "Operation", "Time"];
  if (hasSpace) headers.push("Space");
  if (hasNote) headers.push("Notes");
  return (
    <Table
      headers={headers}
      rows={rows.map((row) => {
        const cells: ReactNode[] = [row.operation, <Complexity value={row.time} />];
        if (hasSpace) cells.push(row.space ? <Complexity value={row.space} /> : "—");
        if (hasNote) cells.push(row.note ?? "");
        return cells;
      })}
    />
  );
}

export function CardGrid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return (
    <div className={`my-6 grid gap-4 sm:grid-cols-2 ${cols === 3 ? "lg:grid-cols-3" : ""}`}>{children}</div>
  );
}

export function Card({ title, icon, children }: { title: string; icon?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-5 transition hover:border-indigo-400/30">
      <div className="mb-2 flex items-center gap-2 font-semibold text-white">
        {icon && <span className="text-lg">{icon}</span>}
        <span>{title}</span>
      </div>
      <div className="space-y-2 text-sm leading-6 text-slate-400">{children}</div>
    </div>
  );
}

export function ProsCons({ pros, cons }: { pros: ReactNode[]; cons: ReactNode[] }) {
  return (
    <div className="my-6 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.05] p-5">
        <div className="mb-3 font-semibold text-emerald-200">✅ Strengths</div>
        <ul className="space-y-2 text-sm leading-6 text-slate-300">
          {pros.map((item, index) => (
            <li key={index} className="flex gap-2">
              <span className="text-emerald-400">+</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-rose-400/20 bg-rose-500/[0.05] p-5">
        <div className="mb-3 font-semibold text-rose-200">⛔ Weaknesses</div>
        <ul className="space-y-2 text-sm leading-6 text-slate-300">
          {cons.map((item, index) => (
            <li key={index} className="flex gap-2">
              <span className="text-rose-400">−</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Steps({ steps }: { steps: { title: string; body: ReactNode }[] }) {
  return (
    <ol className="relative my-6 space-y-6 border-l border-indigo-400/20 pl-8">
      {steps.map((step, index) => (
        <li key={index} className="relative">
          <span className="absolute -left-[45px] flex h-7 w-7 items-center justify-center rounded-full border border-indigo-400/40 bg-panel text-xs font-bold text-indigo-200">
            {index + 1}
          </span>
          <div className="font-semibold text-white">{step.title}</div>
          <div className="mt-1 leading-7 text-slate-300">{step.body}</div>
        </li>
      ))}
    </ol>
  );
}

type ArrayVizProps = {
  values: (string | number)[];
  highlight?: number[];
  dim?: number[];
  pointers?: Record<number, string>;
  caption?: string;
  showIndices?: boolean;
};

export function ArrayViz({ values, highlight = [], dim = [], pointers = {}, caption, showIndices = true }: ArrayVizProps) {
  return (
    <figure className="my-6 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex w-max gap-1.5">
        {values.map((value, index) => {
          const isHighlighted = highlight.includes(index);
          const isDim = dim.includes(index);
          return (
            <div key={index} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-12 min-w-12 items-center justify-center rounded-lg border px-2 font-mono text-sm font-semibold transition ${
                  isHighlighted
                    ? "border-fuchsia-400/60 bg-gradient-to-br from-indigo-500/40 to-fuchsia-500/40 text-white shadow-lg shadow-fuchsia-500/20"
                    : isDim
                      ? "border-white/5 bg-white/[0.02] text-slate-600"
                      : "border-white/15 bg-white/[0.06] text-slate-100"
                }`}
              >
                {value}
              </div>
              {showIndices && <span className="font-mono text-[11px] text-slate-500">{index}</span>}
              {pointers[index] && (
                <span className="font-mono text-[11px] font-semibold text-amber-300">↑ {pointers[index]}</span>
              )}
            </div>
          );
        })}
      </div>
      {caption && <figcaption className="mt-4 text-sm text-slate-400">{caption}</figcaption>}
    </figure>
  );
}

export function Diagram({ children, caption }: { children: string; caption?: string }) {
  return (
    <figure className="my-6 overflow-x-auto rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/[0.06] to-fuchsia-500/[0.04] p-5">
      <pre className="w-max font-mono text-sm leading-6 text-indigo-100">{children.replace(/^\n+|\s+$/g, "")}</pre>
      {caption && <figcaption className="mt-4 text-sm text-slate-400">{caption}</figcaption>}
    </figure>
  );
}

export function KeyTakeaways({ items }: { items: ReactNode[] }) {
  return (
    <div className="my-10 rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 via-transparent to-fuchsia-500/10 p-6">
      <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
        <span>🎯</span> Key Takeaways
      </div>
      <List items={items} />
    </div>
  );
}

export function Practice({ problems }: { problems: { name: string; difficulty: "Easy" | "Medium" | "Hard"; hint?: ReactNode }[] }) {
  const color = {
    Easy: "text-emerald-300 bg-emerald-500/10 border-emerald-400/20",
    Medium: "text-amber-300 bg-amber-500/10 border-amber-400/20",
    Hard: "text-rose-300 bg-rose-500/10 border-rose-400/20",
  };
  return (
    <div className="my-6 divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      {problems.map((problem) => (
        <div key={problem.name} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-medium text-slate-100">{problem.name}</div>
            {problem.hint && <div className="text-sm text-slate-400">{problem.hint}</div>}
          </div>
          <span className={`w-fit shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
        </div>
      ))}
    </div>
  );
}
