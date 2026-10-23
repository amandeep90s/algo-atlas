import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Worker } from "node:worker_threads";
import ts from "typescript";

const root = process.cwd();
const pagesRoot = path.join(root, "src", "pages");
const filter = process.argv[2];
const timeoutMs = 10_000;
const pyodideIndexUrl = `${path.join(root, "node_modules", "pyodide")}${path.sep}`;
const workerSource = `
  const { parentPort } = require("node:worker_threads");
  (async () => {
    const { loadPyodide } = await import("pyodide");
    const pyodide = await loadPyodide({ indexURL: ${JSON.stringify(pyodideIndexUrl)} });
    parentPort.postMessage({ type: "ready" });
    parentPort.on("message", async ({ id, code }) => {
      try {
        const snippetGlobals = pyodide.globals.get("dict")();
        pyodide.globals.set("_verify_code", code);
        pyodide.globals.set("_verify_globals", snippetGlobals);
        const result = await pyodide.runPythonAsync(
          "import io as _io, contextlib as _contextlib, traceback as _traceback\\n" +
          "_verify_stdout = _io.StringIO()\\n" +
          "_verify_stderr = _io.StringIO()\\n" +
          "_verify_error = None\\n" +
          "try:\\n" +
          "    with _contextlib.redirect_stdout(_verify_stdout), _contextlib.redirect_stderr(_verify_stderr):\\n" +
          "        exec(compile(_verify_code, '<snippet>', 'exec'), _verify_globals)\\n" +
          "except BaseException:\\n" +
          "    _verify_error = _traceback.format_exc()\\n" +
          "(_verify_stdout.getvalue(), _verify_stderr.getvalue(), _verify_error)"
        );
        const values = result.toJs();
        result.destroy();
        snippetGlobals.destroy();
        pyodide.globals.set("_verify_code", undefined);
        pyodide.globals.set("_verify_globals", undefined);
        parentPort.postMessage({ id, stdout: values[0], stderr: values[1], error: values[2] });
      } catch (error) {
        parentPort.postMessage({ id, workerError: error?.stack ?? String(error) });
      }
    });
  })().catch((error) => parentPort.postMessage({ type: "startupError", error: error?.stack ?? String(error) }));
`;

async function listTsx(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listTsx(fullPath));
    else if (entry.isFile() && entry.name.endsWith(".tsx")) files.push(fullPath);
  }
  return files;
}

function getStaticAttribute(attributes, name) {
  for (const attribute of attributes.properties) {
    if (!ts.isJsxAttribute(attribute) || attribute.name.getText() !== name) continue;
    const initializer = attribute.initializer;
    if (initializer && ts.isStringLiteral(initializer)) return { present: true, value: initializer.text };
    if (initializer && ts.isJsxExpression(initializer) && initializer.expression) {
      const expression = initializer.expression;
      if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
        return { present: true, value: expression.text };
      }
    }
    return { present: true, value: undefined };
  }
  return { present: false, value: undefined };
}

function hasBooleanAttribute(attributes, name) {
  return attributes.properties.some((attribute) =>
    ts.isJsxAttribute(attribute) && attribute.name.getText() === name && attribute.initializer === undefined
  );
}

function dedent(source) {
  const lines = source.replace(/^\n+|\s+$/g, "").split("\n");
  const indents = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => line.match(/^ */)?.[0].length ?? 0);
  const minIndent = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(minIndent)).join("\n");
}

function normalizeOutput(value) {
  const lines = value.replace(/\r\n?/g, "\n").split("\n").map((line) => line.replace(/\s+$/g, ""));
  while (lines.length && lines.at(-1) === "") lines.pop();
  return lines.join("\n");
}

function formatDiff(expected, actual) {
  return `Expected stdout:\n${expected || "(empty)"}\nActual stdout:\n${actual || "(empty)"}`;
}

let worker;
let nextId = 1;
let pending = new Map();
let readyPromise;

function startWorker() {
  worker = new Worker(workerSource, { eval: true });
  readyPromise = new Promise((resolve, reject) => {
    const onMessage = (message) => {
      if (message.type === "ready") {
        worker.off("message", onMessage);
        resolve();
      } else if (message.type === "startupError") {
        worker.off("message", onMessage);
        reject(new Error(message.error));
      }
    };
    worker.on("message", onMessage);
    worker.once("error", reject);
    worker.once("exit", (code) => {
      if (code !== 0) reject(new Error(`Pyodide worker exited with code ${code}`));
    });
  });
  worker.on("message", (message) => {
    if (message.type) return;
    const resolve = pending.get(message.id);
    if (resolve) {
      pending.delete(message.id);
      resolve(message);
    }
  });
  return readyPromise;
}

async function runSnippet(code) {
  if (!worker) await startWorker();
  await readyPromise;
  const id = nextId++;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(async () => {
      pending.delete(id);
      await worker.terminate();
      worker = undefined;
      resolve({ timeout: true });
    }, timeoutMs);
    pending.set(id, (result) => {
      clearTimeout(timer);
      resolve(result);
    });
    worker.postMessage({ id, code });
  });
}

const files = (await listTsx(pagesRoot))
  .filter((file) => !filter || file.includes(filter) || path.relative(root, file).includes(filter))
  .sort();
const records = [];

for (const file of files) {
  const sourceText = await readFile(file, "utf8");
  const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  function visit(node) {
    const opening = ts.isJsxSelfClosingElement(node) ? node : ts.isJsxElement(node) ? node.openingElement : undefined;
    if (opening && ts.isIdentifier(opening.tagName) && opening.tagName.text === "CodeBlock") {
      const attributes = opening.attributes;
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
      const title = getStaticAttribute(attributes, "title");
      if (hasBooleanAttribute(attributes, "skipVerify")) {
        records.push({ file, line, title: title.value ?? "(untitled)", status: "SKIP" });
      } else {
        const code = getStaticAttribute(attributes, "code");
        const output = getStaticAttribute(attributes, "output");
        records.push({
          file,
          line,
          title: title.value ?? "(untitled)",
          status: "PENDING",
          code: code.value,
          codePresent: code.present,
          output: output.value,
          outputPresent: output.present,
        });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
}

let failures = 0;
let passes = 0;
let skips = 0;
for (const record of records) {
  const location = `${path.relative(root, record.file)}:${record.line}`;
  if (record.status === "SKIP") {
    skips++;
    console.log(`${location} | ${record.title} | SKIP`);
    continue;
  }
  let failure;
  if (!record.codePresent || record.code === undefined) failure = "CodeBlock code is not a statically extractable string.";
  else if (record.outputPresent && record.output === undefined) failure = "CodeBlock output is not a statically extractable string.";

  if (!failure) {
    try {
      const result = await runSnippet(dedent(record.code));
      if (result.timeout) failure = `Timed out after ${timeoutMs / 1000}s.`;
      else if (result.workerError) failure = `Pyodide execution failed:\n${result.workerError}`;
      else if (result.error) failure = `Python exception:\n${result.error}${result.stderr ? `\nstderr:\n${result.stderr}` : ""}`;
      else if (record.outputPresent) {
        const expected = normalizeOutput(dedent(record.output));
        const actual = normalizeOutput(result.stdout);
        if (expected !== actual) failure = formatDiff(expected, actual);
      }
    } catch (error) {
      failure = `Verifier error:\n${error?.stack ?? String(error)}`;
    }
  }
  if (failure) {
    failures++;
    console.error(`${location} | ${record.title} | FAIL\n${failure}`);
  } else {
    passes++;
    console.log(`${location} | ${record.title} | PASS`);
  }
}

if (worker) await worker.terminate();
console.log(`\nSummary: ${passes} passed, ${failures} failed, ${skips} skipped (${records.length} total).`);
if (failures) process.exitCode = 1;




