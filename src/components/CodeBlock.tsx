import { useState } from "react";
import { tokenClass, tokenizePython } from "../lib/highlight";

function dedent(source: string): string {
  const lines = source.replace(/^\n+|\s+$/g, "").split("\n");
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^ */)?.[0].length ?? 0);
  const minIndent = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(minIndent)).join("\n");
}

type CodeBlockProps = {
  code: string;
  title?: string;
  output?: string;
  showLineNumbers?: boolean;
  /** Excludes intentionally partial snippets from `npm run verify:python`. */
  skipVerify?: boolean;
};

export function CodeBlock({ code, title = "python", output, showLineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const source = dedent(code);
  const lines = source.split("\n");
  const tokens = tokenizePython(source);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="theme-dark group my-6 overflow-hidden rounded-xl border border-white/10 bg-code shadow-xl shadow-black/30 ring-1 ring-inset ring-white/5">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-400/80" />
            <span className="h-3 w-3 rounded-full bg-amber-300/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          </div>
          <span className="font-mono text-xs text-slate-400">{title}</span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-white/10 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-white"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <div className="flex overflow-x-auto py-4 text-[13.5px] leading-6">
        {showLineNumbers && (
          <div aria-hidden className="select-none border-r border-white/5 pl-4 pr-3 text-right font-mono text-slate-600">
            {lines.map((_, index) => (
              <div key={index}>{index + 1}</div>
            ))}
          </div>
        )}
        <pre className="flex-1 px-4 font-mono">
          <code>
            {tokens.map((token, index) => (
              <span key={index} className={tokenClass[token.type]}>
                {token.value}
              </span>
            ))}
          </code>
        </pre>
      </div>
      {output !== undefined && (
        <div className="border-t border-white/10 bg-black/30 px-4 py-3">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Output</div>
          <pre className="overflow-x-auto font-mono text-[13px] leading-6 text-emerald-200/90">{dedent(output)}</pre>
        </div>
      )}
    </div>
  );
}
