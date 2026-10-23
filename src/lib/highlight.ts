export type Token = { type: TokenType; value: string };

export type TokenType =
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "builtin"
  | "constant"
  | "decorator"
  | "function"
  | "class"
  | "self"
  | "operator"
  | "punctuation"
  | "text";

const KEYWORDS = new Set([
  "and", "as", "assert", "async", "await", "break", "class", "continue", "def", "del",
  "elif", "else", "except", "finally", "for", "from", "global", "if", "import", "in",
  "is", "lambda", "nonlocal", "not", "or", "pass", "raise", "return", "try", "while",
  "with", "yield",
]);

const CONSTANTS = new Set(["True", "False", "None"]);

const BUILTINS = new Set([
  "abs", "all", "any", "bin", "bool", "bytes", "chr", "dict", "divmod", "enumerate",
  "filter", "float", "frozenset", "hash", "hex", "id", "input", "int", "isinstance",
  "iter", "len", "list", "map", "max", "min", "next", "object", "ord", "pow", "print",
  "range", "reversed", "round", "set", "slice", "sorted", "str", "sum", "super", "tuple",
  "type", "zip", "Exception", "ValueError", "IndexError", "KeyError", "StopIteration",
  "RecursionError", "TypeError",
]);

const PATTERNS: [TokenType, RegExp][] = [
  ["comment", /^#[^\n]*/],
  ["string", /^[rbfuRBFU]{0,2}("""[\s\S]*?"""|'''[\s\S]*?''')/],
  ["string", /^[rbfuRBFU]{0,2}("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/],
  ["decorator", /^@[A-Za-z_][\w.]*/],
  ["number", /^(0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*\.?\d*(?:[eE][+-]?\d+)?j?|\.\d+)/],
  ["text", /^[A-Za-z_]\w*/],
  ["operator", /^(\*\*=?|\/\/=?|<<=?|>>=?|->|:=|[+\-*/%&|^~<>!=@]=?)/],
  ["punctuation", /^[()[\]{}.,:;]/],
  ["text", /^\s+/],
  ["text", /^./],
];

export function tokenizePython(source: string): Token[] {
  const tokens: Token[] = [];
  let rest = source;
  let previousWord = "";

  while (rest.length > 0) {
    for (const [type, pattern] of PATTERNS) {
      const match = pattern.exec(rest);
      if (!match) continue;
      const value = match[0];
      let resolved: TokenType = type;

      if (type === "text" && /^[A-Za-z_]/.test(value)) {
        if (previousWord === "def") resolved = "function";
        else if (previousWord === "class") resolved = "class";
        else if (KEYWORDS.has(value)) resolved = "keyword";
        else if (CONSTANTS.has(value)) resolved = "constant";
        else if (value === "self" || value === "cls") resolved = "self";
        else if (BUILTINS.has(value)) resolved = "builtin";
        else if (/^\s*\(/.test(rest.slice(value.length))) resolved = "function";
        else if (/^[A-Z]/.test(value) && /[a-z]/.test(value)) resolved = "class";
        previousWord = value;
      } else if (!/^\s+$/.test(value)) {
        previousWord = "";
      }

      tokens.push({ type: resolved, value });
      rest = rest.slice(value.length);
      break;
    }
  }
  return tokens;
}

export const tokenClass: Record<TokenType, string> = {
  comment: "text-slate-500 italic",
  string: "text-emerald-300",
  number: "text-orange-300",
  keyword: "text-fuchsia-400",
  builtin: "text-cyan-300",
  constant: "text-orange-300",
  decorator: "text-amber-300",
  function: "text-sky-300",
  class: "text-yellow-200",
  self: "text-rose-300 italic",
  operator: "text-fuchsia-300",
  punctuation: "text-slate-400",
  text: "text-slate-200",
};
