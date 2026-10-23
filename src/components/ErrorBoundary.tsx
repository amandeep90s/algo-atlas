import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

const RELOAD_FLAG = "algoatlas-chunk-reload";

function isChunkLoadError(error: Error): boolean {
  return /dynamically imported module|Importing a module script failed|Failed to fetch|error loading dynamically/i.test(
    error.message,
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Page failed to render", error, info.componentStack);
    // A stale deployment can reference chunks that no longer exist; one automatic reload usually fixes it.
    const lastReload = Number(sessionStorage.getItem(RELOAD_FLAG) ?? 0);
    if (isChunkLoadError(error) && Date.now() - lastReload > 10_000) {
      sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
      window.location.reload();
    }
  }

  retry = () => {
    if (this.state.error && isChunkLoadError(this.state.error)) {
      window.location.reload();
      return;
    }
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const chunkError = isChunkLoadError(error);
    return (
      <div role="alert" className="my-16 rounded-2xl border border-rose-400/30 bg-rose-500/[0.07] p-8 text-center">
        <div className="text-4xl">{chunkError ? "📡" : "🧩"}</div>
        <h1 className="mt-4 text-2xl font-semibold text-white">
          {chunkError ? "This page couldn't be loaded" : "Something went wrong on this page"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-400">
          {chunkError
            ? "Check your connection, or the site may have just been updated. Retrying usually fixes it."
            : "An unexpected error occurred while rendering this page."}
        </p>
        <pre className="mx-auto mt-4 max-w-lg overflow-x-auto rounded-lg bg-white/5 p-3 text-left font-mono text-xs text-rose-200">
          {error.message}
        </pre>
        <button
          type="button"
          onClick={this.retry}
          className="mt-6 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-2.5 font-semibold text-on-accent"
        >
          Try again
        </button>
      </div>
    );
  }
}
