import { Suspense, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { flatNavigation } from "../data/navigation";
import { useProgress } from "../lib/progress";
import { useTheme } from "../lib/theme";
import { useModalFocus } from "../lib/useModalFocus";
import { ErrorBoundary } from "./ErrorBoundary";
import { PageLoader } from "./PageLoader";
import { SearchDialog } from "./SearchDialog";
import { Sidebar } from "./Sidebar";
import { TableOfContents } from "./TableOfContents";

function PrevNext() {
  const { pathname } = useLocation();
  const index = flatNavigation.findIndex((item) => item.path === pathname);
  if (index === -1) return null;
  const prev = flatNavigation[index - 1];
  const next = flatNavigation[index + 1];

  return (
    <div className="mt-16 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          to={prev.path}
          className="group rounded-xl border border-white/10 p-5 transition hover:border-indigo-400/40 hover:bg-indigo-500/5"
        >
          <div className="text-xs text-slate-500">← Previous</div>
          <div className="mt-1 font-semibold text-slate-200 group-hover:text-white">{prev.title}</div>
        </Link>
      ) : (
        <div />
      )}
      {next && (
        <Link
          to={next.path}
          className="group rounded-xl border border-white/10 p-5 text-right transition hover:border-indigo-400/40 hover:bg-indigo-500/5"
        >
          <div className="text-xs text-slate-500">Next →</div>
          <div className="mt-1 font-semibold text-slate-200 group-hover:text-white">{next.title}</div>
        </Link>
      )}
    </div>
  );
}

function MarkComplete() {
  const { pathname } = useLocation();
  const { isComplete, toggle } = useProgress();
  if (!flatNavigation.some((item) => item.path === pathname)) return null;
  const done = isComplete(pathname);

  return (
    <div className="mt-16 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4">
      <span className="text-sm text-slate-400">
        {done ? "Nice work — this topic is marked as complete." : "Finished reading this topic?"}
      </span>
      <button
        type="button"
        aria-pressed={done}
        onClick={() => toggle(pathname)}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
          done
            ? "border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
            : "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-on-accent hover:opacity-90"
        }`}
      >
        {done ? "✓ Completed" : "Mark as complete"}
      </button>
    </div>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      onClick={() => setTheme(next)}
      className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-indigo-400/40 hover:text-slate-100"
    >
      {theme === "dark" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function useDocumentTitle(pathname: string) {
  useEffect(() => {
    const item = flatNavigation.find((entry) => entry.path === pathname);
    document.title =
      pathname === "/"
        ? "AlgoAtlas — Data Structures & Algorithms in Python"
        : item
          ? `${item.title} · AlgoAtlas`
          : "Page not found · AlgoAtlas";
  }, [pathname]);
}

// Lazy pages render after navigation, so the hash target may not exist yet.
function useScrollToHash(pathname: string, hash: string) {
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    const tryScroll = () => {
      const target = document.getElementById(id);
      if (!target) return false;
      target.scrollIntoView({ block: "start" });
      return true;
    };
    if (tryScroll()) return;
    const observer = new MutationObserver(() => {
      if (tryScroll()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timeout = window.setTimeout(() => observer.disconnect(), 5000);
    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, [pathname, hash]);
}

export function Layout() {
  const { pathname, hash } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useModalFocus(menuOpen, () => setMenuOpen(false));
  const isHome = pathname === "/";

  useDocumentTitle(pathname);
  useScrollToHash(pathname, hash);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMenuOpen(false);
        setSearchOpen(true);
      } else if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-slate-200">
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[700px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[500px] rounded-full bg-fuchsia-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/5 bg-canvas/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 font-mono text-sm font-bold text-on-accent shadow-lg shadow-indigo-500/30">
              {"{}"}
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">
              Algo<span className="bg-gradient-to-r from-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">Atlas</span>
            </span>
          </Link>
          <span className="hidden rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-slate-400 sm:inline">
            🐍 Python Edition
          </span>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-400 transition hover:border-indigo-400/40 hover:text-slate-200 sm:w-64"
          >
            <span>⌕</span>
            <span className="hidden flex-1 text-left sm:inline">Search topics…</span>
            <kbd className="hidden rounded border border-white/10 px-1.5 text-[10px] sm:inline">Ctrl K</kbd>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Table of contents"
            className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto border-r border-white/10 bg-sidebar p-5">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-semibold text-white">Contents</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                ✕
              </button>
            </div>
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className="relative mx-auto flex max-w-[1600px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-82 shrink-0 overflow-y-auto border-r border-white/5 px-4 py-8 lg:block">
          <Sidebar />
        </aside>
        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 px-5 py-10 focus:outline-none sm:px-10 lg:px-14">
          <div className={isHome ? "mx-auto max-w-6xl" : "mx-auto max-w-3xl xl:max-w-4xl"}>
            <ErrorBoundary key={pathname}>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
                <MarkComplete />
                <PrevNext />
              </Suspense>
            </ErrorBoundary>
          </div>
          <footer className="mx-auto mt-20 max-w-4xl border-t border-white/5 pt-6 pb-4 text-center text-xs text-slate-600">
            AlgoAtlas — a visual guide to data structures &amp; algorithms in Python.
          </footer>
        </main>
        {!isHome && (
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto py-10 pr-6 xl:block">
            <TableOfContents />
          </aside>
        )}
      </div>
    </div>
  );
}
