import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <div className="bg-gradient-to-r from-indigo-300 to-fuchsia-300 bg-clip-text font-mono text-8xl font-bold text-transparent">404</div>
      <h1 className="mt-6 text-2xl font-semibold text-white">Page not found</h1>
      <p className="mt-3 text-slate-400">This node isn't reachable from the root. Let's traverse back home.</p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3 font-semibold text-on-accent"
      >
        Back to home
      </Link>
    </div>
  );
}
