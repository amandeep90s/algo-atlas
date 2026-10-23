# AlgoAtlas — Data Structures & Algorithms in Python

An elegant, interactive documentation site that teaches data structures and algorithms from Big-O fundamentals to advanced graph theory and computational geometry. Every example is written in Python.

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4** and **React Router**.

## Features

- **45 in-depth topic pages.** Each topic has its own page and its own explicitly declared route in [`src/App.tsx`](src/App.tsx).
- **Lazy-loaded pages.** Pages load with `React.lazy` and `Suspense` and show a skeleton loader. An error boundary retries when a chunk fails to load.
- **Python examples.** Code is syntax-highlighted, has a copy button and shows expected output. Snippets are verified with `npm run verify:python`.
- **Interactive visualizers.** Step-through animations for sorting, binary search, BFS/DFS and Dijkstra.
- **Search.** `Ctrl` + `K` (or `Cmd` + `K` on macOS) finds pages and individual sections. The index is generated from page headings.
- **Progress tracking.** Mark topics complete. Progress is stored in `localStorage` and shown in the sidebar and on the home page.
- **Light and dark themes.** Uses the system preference on first visit and remembers your selected theme.
- **Accessibility.** Skip link, visible focus rings, keyboard navigation, focus containment and restoration for dialogs, `Esc` to close overlays, and support for reduced motion.
- **Navigation.** "On this page" table of contents and previous/next links on every topic.

## Getting started

### Requirements

- Node.js **20.19+** on the 20.x release line, or **22.12+** on newer release lines, as required by Vite.
- npm (included with Node.js).
- No local Python installation is required for snippet verification; the verifier uses Pyodide.

### Run locally

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. If the default port is occupied, choose another port:

```bash
npm run dev -- --port 5199
```

## Topics covered

| Area | Topics |
| ---- | ------ |
| Getting started | Introduction, complexity analysis, Python essentials, recursion |
| Linear data structures | Arrays, strings, linked lists, stacks, queues and deques, hash tables |
| Non-linear and advanced structures | Trees, binary search trees, balanced trees, heaps, tries, graphs, union-find, segment and Fenwick trees, LRU/LFU caches, sparse tables and treaps |
| Core algorithms | Searching, sorting, two pointers, sliding windows, prefix sums, matrices and grids, intervals and sweep line, divide and conquer, greedy algorithms, backtracking, dynamic programming, bit manipulation, string algorithms, number theory, randomized algorithms and computational geometry |
| Graph algorithms | BFS/DFS, shortest paths, minimum spanning trees, topological sorting, strongly connected components, bridges, articulation points and maximum flow |
| Reference | Interactive visualizers, complexity cheat sheet, problem-solving patterns, complexity classes (P/NP) and a searchable glossary |

## Scripts

| Script                  | Description                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `npm run dev`           | Start the Vite dev server                                       |
| `npm run build`         | Type-check and create a production build in `dist/`             |
| `npm run preview`       | Preview the production build                                    |
| `npm run lint`          | Run ESLint                                                      |
| `npm run verify:python` | Execute non-skipped Python snippets with Pyodide and compare declared output |

### Python snippet verification

The verifier extracts static `CodeBlock` snippets from the pages, executes each with fresh Python globals, and compares standard output when an `output` prop is provided. Each snippet has a 10-second execution timeout.

To check one page, pass a filename filter:

```bash
npm run verify:python -- ComplexityClasses.tsx
```

Keep examples self-contained, including imports, helper functions and sample data. Use `skipVerify` only for intentionally incomplete templates, not to hide a failing example. Verification runs through a development script; the app does not provide an in-browser Python editor or execution environment.

## Build and deployment

```bash
npm run lint
npm run verify:python
node --test src/components/visualizers/algorithms.test.mjs
npm run build
npm run preview
```

Deploy the generated `dist/` directory to a static host. Because the app uses `BrowserRouter`, configure the host to serve `index.html` for unknown application paths. This allows direct visits and refreshes on nested routes such as `/algorithms/sorting`.

Progress and theme preferences are stored locally in the browser, not in an account or backend. Clearing site storage removes these preferences.

## Project structure

```
src/
├── App.tsx                # Every route, declared explicitly, with lazy imports
├── data/navigation.ts     # Sidebar / search / prev-next ordering
├── components/
│   ├── Layout.tsx         # App shell: header, sidebar, Suspense outlet, TOC
│   ├── doc.tsx            # Documentation building blocks (Section, Callout, Table…)
│   ├── CodeBlock.tsx      # Python code block with highlighting + output
│   ├── SearchDialog.tsx   # Ctrl+K page & section search
│   ├── ErrorBoundary.tsx  # Recovers from failed lazy chunk loads
│   └── visualizers/       # Interactive algorithm animations
├── lib/                   # Highlighter, theme store, progress store
└── pages/
    ├── getting-started/
    ├── data-structures/
    ├── algorithms/
    ├── graph-algorithms/
    └── reference/
search-index-plugin.ts     # Vite plugin that builds the section search index
scripts/verify-python.mjs  # Runs Python snippets through Pyodide
```

## Adding a new page

1. Create the page component, for example `src/pages/algorithms/MyTopic.tsx`, using the components in `src/components/doc.tsx`.
2. Add a lazy import and an explicit route in `src/App.tsx`:
   ```tsx
   const MyTopic = lazy(() => import("./pages/algorithms/MyTopic"));
   // …
   <Route path="algorithms/my-topic" element={<MyTopic />} />
   ```
3. Add an entry to the right group in `src/data/navigation.ts`. This entry drives the sidebar, search, home cards and prev/next links.
4. Give the page a `PageHeader` and use `Section` / `SubSection` headings with descriptive static titles. These headings power the table of contents and section search; heading-derived anchors should be unique within the page.
5. Run `npm run verify:python`, `npm run lint` and `npm run build` before submitting the change.
