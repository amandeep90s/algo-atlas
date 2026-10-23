import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

const VIRTUAL_ID = "virtual:search-index";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

export type SearchEntry = {
  path: string;
  page: string;
  section: string;
  anchor: string;
  sub?: string;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function decodeEntities(text: string): string {
  return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}

const TITLE_ATTR = String.raw`title=(?:"([^"]*)"|\{"([^"]*)"\}|\{\x60([^\x60$]*)\x60\})`;

function buildIndex(root: string): SearchEntry[] {
  const srcDir = path.join(root, "src");
  const app = fs.readFileSync(path.join(srcDir, "App.tsx"), "utf8");

  const modules = new Map<string, string>();
  for (const match of app.matchAll(/const (\w+) = lazy\(\(\) => import\("(\.\/pages\/[^"]+)"\)\)/g)) {
    modules.set(match[1], match[2]);
  }

  const entries: SearchEntry[] = [];
  for (const match of app.matchAll(/<Route path="([^"*]+)" element=\{<(\w+) \/>\}/g)) {
    const [, routePath, component] = match;
    const modulePath = modules.get(component);
    if (!modulePath) continue;
    const file = path.join(srcDir, `${modulePath}.tsx`);
    if (!fs.existsSync(file)) continue;
    const source = fs.readFileSync(file, "utf8");

    const pageTitle = new RegExp(`<PageHeader[\\s\\S]*?${TITLE_ATTR}`).exec(source);
    const page = decodeEntities(pageTitle?.[1] ?? pageTitle?.[2] ?? pageTitle?.[3] ?? component);

    const tagPattern = new RegExp(`<(Section|SubSection)\\s+[^>]*?${TITLE_ATTR}(?:[^>]*?\\sid="([^"]+)")?`, "g");
    let currentSection: { title: string; anchor: string } | null = null;
    for (const tag of source.matchAll(tagPattern)) {
      const title = decodeEntities(tag[2] ?? tag[3] ?? tag[4] ?? "");
      if (!title) continue;
      if (tag[1] === "Section") {
        currentSection = { title, anchor: tag[5] ?? slugify(title) };
        entries.push({ path: `/${routePath}`, page, section: title, anchor: currentSection.anchor });
      } else if (currentSection) {
        entries.push({
          path: `/${routePath}`,
          page,
          section: currentSection.title,
          anchor: currentSection.anchor,
          sub: title,
        });
      }
    }
  }
  return entries;
}

export function searchIndexPlugin(): Plugin {
  let root = process.cwd();
  return {
    name: "algoatlas-search-index",
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      return `export default ${JSON.stringify(buildIndex(root))};`;
    },
    hotUpdate({ file }) {
      const normalized = file.replace(/\\/g, "/");
      if (!/\/src\/(pages\/|App\.tsx)/.test(normalized)) return;
      const module = this.environment.moduleGraph.getModuleById(RESOLVED_ID);
      if (module) this.environment.moduleGraph.invalidateModule(module);
    },
  };
}
