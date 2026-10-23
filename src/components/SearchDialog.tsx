import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { flatNavigation } from "../data/navigation";
import { useModalFocus } from "../lib/useModalFocus";

type SectionEntry = { path: string; page: string; section: string; anchor: string; sub?: string };

type Result = {
  key: string;
  to: string;
  title: string;
  context: string;
  kind: "page" | "section";
  score: number;
};

const MAX_RESULTS = 40;

let sectionIndexPromise: Promise<SectionEntry[]> | null = null;
function loadSectionIndex() {
  sectionIndexPromise ??= import("virtual:search-index").then((module) => module.default);
  return sectionIndexPromise;
}

function score(haystack: string, title: string, tokens: string[]): number {
  if (!tokens.every((token) => haystack.includes(token))) return 0;
  const lowerTitle = title.toLowerCase();
  const query = tokens.join(" ");
  if (lowerTitle === query) return 100;
  if (lowerTitle.startsWith(query)) return 80;
  if (lowerTitle.includes(query)) return 60;
  return tokens.every((token) => lowerTitle.includes(token)) ? 40 : 20;
}

function search(query: string, sections: SectionEntry[]): Result[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return flatNavigation.map((item) => ({
      key: item.path,
      to: item.path,
      title: item.title,
      context: item.description,
      kind: "page",
      score: 0,
    }));
  }

  const pages: Result[] = flatNavigation
    .map((item) => ({
      key: item.path,
      to: item.path,
      title: item.title,
      context: item.description,
      kind: "page" as const,
      score: score(`${item.title} ${item.description} ${item.group}`.toLowerCase(), item.title, tokens) + 10,
    }))
    .filter((result) => result.score > 10);

  const sectionResults: Result[] = sections
    .map((entry) => {
      const title = entry.sub ?? entry.section;
      return {
        key: `${entry.path}#${entry.anchor}#${title}`,
        to: `${entry.path}#${entry.anchor}`,
        title,
        context: entry.sub ? `${entry.page} › ${entry.section}` : entry.page,
        kind: "section" as const,
        score: score(`${title} ${entry.section} ${entry.page}`.toLowerCase(), title, tokens),
      };
    })
    .filter((result) => result.score > 0);

  return [...pages, ...sectionResults].sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS);
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [sections, setSections] = useState<SectionEntry[]>([]);
  const [loadError, setLoadError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();
  const close = () => {
    setQuery("");
    setActiveIndex(0);
    onClose();
  };
  const dialogRef = useModalFocus(open, close);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    let cancelled = false;
    loadSectionIndex()
      .then((entries) => {
        if (!cancelled) {
          setSections(entries);
          setLoadError(false);
        }
      })
      .catch((error: unknown) => {
        console.error("Could not load section search index", error);
        sectionIndexPromise = null;
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  const results = search(query.trim(), sections);

  const go = (to: string) => {
    navigate(to);
    close();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, Math.min(index + 1, results.length - 1)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[activeIndex]) {
      go(results[activeIndex].to);
    } else if (event.key === "Escape") {
      close();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={close}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search documentation"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-2xl shadow-indigo-950/50"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <span aria-hidden className="text-slate-500">
            ⌕
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={results[activeIndex] ? `search-result-${activeIndex}` : undefined}
            aria-label="Search topics and sections"
            placeholder="Search topics and sections… (e.g. kadane, dijkstra, lru)"
            className="h-14 flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-500">ESC</kbd>
        </div>
        {loadError && (
          <div role="status" className="px-4 py-2 text-sm text-amber-300">
            <p>Section search could not load. Page search is still available.</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-2 underline">
              Reload page to retry
            </button>
          </div>
        )}
        <ul ref={listRef} tabIndex={-1} id="search-results" role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-slate-500">No topics or sections found.</li>
          )}
          {results.map((result, index) => (
            <li
              key={result.key}
              id={`search-result-${index}`}
              data-index={index}
              role="option"
              aria-selected={index === activeIndex}
            >
              <button
                type="button"
                tabIndex={-1}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => go(result.to)}
                className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                  index === activeIndex ? "bg-indigo-500/15" : ""
                }`}
              >
                <span
                  aria-hidden
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs ${
                    result.kind === "page" ? "bg-indigo-500/15 text-indigo-300" : "bg-fuchsia-500/10 text-fuchsia-300"
                  }`}
                >
                  {result.kind === "page" ? "▤" : "#"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-slate-100">{result.title}</span>
                  <span className="block truncate text-xs text-slate-400">{result.context}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4 border-t border-white/10 px-4 py-2 text-[11px] text-slate-500">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
