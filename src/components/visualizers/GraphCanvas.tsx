import { useId } from "react";
import { edgeKey } from "./algorithms";
import type { GraphEdge, GraphNode } from "./algorithms";

type Props = {
  nodes: GraphNode[]; edges: GraphEdge[]; current: string | null; frontier: string[];
  visited: string[]; tree: string[]; activeEdge?: string | null; label: string;
};

export function GraphCanvas({ nodes, edges, current, frontier, visited, tree, activeEdge, label }: Props) {
  const id = useId();
  const state = (node: string) => node === current ? "current" : visited.includes(node) ? "visited"
    : frontier.includes(node) ? "frontier" : "unvisited";
  return (
    <div>
      <svg viewBox="0 0 420 275" className="mx-auto block w-full max-w-xl" role="img" aria-labelledby={id + "-title " + id + "-description"}>
        <title id={id + "-title"}>{label}</title>
        <desc id={id + "-description"}>
          Undirected graph. {nodes.map(node => node.id + ": " + state(node.id)).join("; ")}.
          {" Tree edges: " + (tree.join(", ") || "none") + "."}
          {activeEdge ? " Edge being checked: " + activeEdge + "." : ""}
        </desc>
        {edges.map(edge => {
          const from = nodes.find(node => node.id === edge.from)!;
          const to = nodes.find(node => node.id === edge.to)!;
          const key = edgeKey(edge.from, edge.to);
          const active = key === activeEdge;
          const inTree = tree.includes(key);
          const x = (from.x + to.x) / 2, y = (from.y + to.y) / 2;
          return (
            <g key={key}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} strokeWidth={active || inTree ? 4 : 2}
                className={`motion-safe:transition-colors ${active ? "stroke-amber-300" : inTree ? "stroke-emerald-400" : "stroke-slate-600"}`} />
              {edge.weight !== undefined && (
                <g>
                  <rect x={x - 10} y={y - 10} width="20" height="20" rx="5" className="fill-slate-900" />
                  <text x={x} y={y + 4} textAnchor="middle" className="fill-slate-200 font-mono text-xs">{edge.weight}</text>
                </g>
              )}
            </g>
          );
        })}
        {nodes.map(node => {
          const status = state(node.id);
          const color = status === "current" ? "fill-amber-400 stroke-amber-200" : status === "visited" ? "fill-emerald-500 stroke-emerald-300"
            : status === "frontier" ? "fill-indigo-500 stroke-indigo-300" : "fill-slate-800 stroke-slate-500";
          return (
            <g key={node.id}>
              <title>{node.id}: {status}</title>
              <circle cx={node.x} cy={node.y} r="18" strokeWidth="2" className={`motion-safe:transition-colors ${color}`} />
              <text x={node.x} y={node.y + 5} textAnchor="middle"
                className={`font-mono text-sm font-bold ${status === "current" ? "fill-slate-950" : "fill-white"}`}>{node.id}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs">
        <span className="text-slate-400">○ Unvisited</span><span className="text-indigo-300">● Frontier</span>
        <span className="text-amber-300">● Current / checking edge</span><span className="text-emerald-300">● Visited / tree edge</span>
      </div>
    </div>
  );
}
