import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const LOGS_DIR = path.join(ROOT, "build", "logs", "as");
const CHARTS_DIR = path.join(ROOT, "charts");

const SUITE_A = "i32x2";
const SUITE_B = "i32x4";
const MODE_A = "swar";
const MODE_B = "simd";

const MD_OUT = path.join(CHARTS_DIR, "chart-i32x2-v-i32x4.md");
const SVG_OUT = path.join(CHARTS_DIR, "chart-i32x2-v-i32x4.svg");

const DECL_ORDER: string[] = [
  "splat", "load", "store", "load-partial", "store-partial", "extract-lane", "replace-lane", "add", "sub", "mul",
  "min-s", "min-u", "max-s", "max-u", "dot-i16x8-s", "abs", "neg",
  "shl", "shr-s", "shr-u", "all-true", "bitmask",
  "eq", "ne", "lt-s", "lt-u", "le-s", "le-u", "gt-s", "gt-u", "ge-s", "ge-u",
  "extend-low-i16x8-s", "extend-low-i16x8-u", "extend-high-i16x8-s", "extend-high-i16x8-u",
  "extadd-pairwise-i16x8-s", "extadd-pairwise-i16x8-u",
  "extmul-low-i16x8-s", "extmul-low-i16x8-u", "extmul-high-i16x8-s", "extmul-high-i16x8-u",
  "shuffle", "relaxed-laneselect",
];

type BenchResult = { description: string; elapsed: number; operations: number };

function loadSuite(mode: string, suite: string): Record<string, BenchResult> {
  const dir = path.join(LOGS_DIR, mode);
  if (!fs.existsSync(dir)) return {};
  const out: Record<string, BenchResult> = {};
  for (const file of fs.readdirSync(dir)) {
    if (!file.startsWith(`${suite}.`) || !file.endsWith(".as.json")) continue;
    const op = file.slice(suite.length + 1, -".as.json".length);
    out[op] = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  }
  return out;
}
function opsPerSec(r: BenchResult): number { return (r.operations * 1000) / r.elapsed; }
function pctDelta(a: number, b: number): number { return ((b - a) / a) * 100; }
function fmtFloat(n: number, digits = 2): string { return Number.isFinite(n) ? n.toFixed(digits) : "n/a"; }
function fmtMops(n: number): string { return `${fmtFloat(n / 1_000_000, 1)}M`; }
function esc(s: string): string { return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }

const left = loadSuite(MODE_A, SUITE_A);
const right = loadSuite(MODE_B, SUITE_B);

const leftAliases: Record<string, string> = {
  "dot-i16x8-s": "dot-i16x4-s",
  "extend-low-i16x8-s": "extend-low-i16x4-s",
  "extend-low-i16x8-u": "extend-low-i16x4-u",
  "extend-high-i16x8-s": "extend-high-i16x4-s",
  "extend-high-i16x8-u": "extend-high-i16x4-u",
  "extadd-pairwise-i16x8-s": "extadd-pairwise-i16x4-s",
  "extadd-pairwise-i16x8-u": "extadd-pairwise-i16x4-u",
  "extmul-low-i16x8-s": "extmul-low-i16x4-s",
  "extmul-low-i16x8-u": "extmul-low-i16x4-u",
  "extmul-high-i16x8-s": "extmul-high-i16x4-s",
  "extmul-high-i16x8-u": "extmul-high-i16x4-u",
};

const rows = DECL_ORDER
  .map((op) => {
    const l = left[op] || left[leftAliases[op] ?? ""] || null;
    const r = right[op] || null;
    if (!l || !r) return null;
    const lOps = opsPerSec(l);
    const rOps = opsPerSec(r);
    return { op, lOps, rOps, avgOps: (lOps + rOps) / 2, dOps: pctDelta(lOps, rOps) };
  })
  .filter((x): x is NonNullable<typeof x> => x != null)
  .sort((a, b) => b.avgOps - a.avgOps);

if (!rows.length) {
  console.error(`No overlapping benchmark JSONs found for ${SUITE_A} (${MODE_A}) vs ${SUITE_B} (${MODE_B})`);
  process.exit(1);
}

fs.mkdirSync(CHARTS_DIR, { recursive: true });

const md: string[] = [];
md.push(`# ${SUITE_A} (${MODE_A.toUpperCase()}) vs ${SUITE_B} (${MODE_B.toUpperCase()})`);
md.push("");
md.push(`Sources: \`build/logs/as/${MODE_A}/${SUITE_A}.*.as.json\` and \`build/logs/as/${MODE_B}/${SUITE_B}.*.as.json\``);
md.push("Sort: highest to lowest average ops/s");
md.push("");
md.push(`| op | ${SUITE_A} Mops/s | ${SUITE_B} Mops/s | delta (${SUITE_B} vs ${SUITE_A}) |`);
md.push("|---|---:|---:|---:|");
for (const r of rows) md.push(`| \`${r.op}\` | ${fmtFloat(r.lOps / 1_000_000, 1)} | ${fmtFloat(r.rOps / 1_000_000, 1)} | ${fmtFloat(r.dOps, 1)}% |`);
fs.writeFileSync(MD_OUT, `${md.join("\n")}\n`);

const maxOps = Math.max(1, ...rows.map((r) => Math.max(r.lOps, r.rOps)));
const rowH = 20, headerH = 56, leftW = 230, barW = 560, rightW = 360;
const height = headerH + rows.length * rowH + 20, width = leftW + barW + rightW;

const svg: string[] = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
svg.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>`);
svg.push(`<text x="16" y="24" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="700" fill="#111827">${esc(SUITE_A)} (${MODE_A.toUpperCase()}) vs ${esc(SUITE_B)} (${MODE_B.toUpperCase()})</text>`);
svg.push(`<text x="16" y="42" font-family="Inter, Arial, sans-serif" font-size="12" fill="#4b5563">Blue: ${esc(SUITE_A)} (${MODE_A}), Green: ${esc(SUITE_B)} (${MODE_B})</text>`);
for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  const y = headerH + i * rowH;
  const lw = Math.max(1, Math.round((r.lOps / maxOps) * barW));
  const rw = Math.max(1, Math.round((r.rOps / maxOps) * barW));
  const ty = y + 14;
  svg.push(`<text x="8" y="${ty}" font-family="Inter, Arial, sans-serif" font-size="11" fill="#111827">${esc(r.op)}</text>`);
  svg.push(`<rect x="${leftW}" y="${y + 3}" width="${lw}" height="6" fill="#3b82f6" opacity="0.9"/>`);
  svg.push(`<rect x="${leftW}" y="${y + 11}" width="${rw}" height="6" fill="#10b981" opacity="0.9"/>`);
  svg.push(`<text x="${leftW + barW + 8}" y="${ty}" font-family="Inter, Arial, sans-serif" font-size="11" fill="#374151">${fmtMops(r.lOps)} -> ${fmtMops(r.rOps)} (${fmtFloat(r.dOps, 1)}%)</text>`);
}
svg.push("</svg>");
fs.writeFileSync(SVG_OUT, `${svg.join("\n")}\n`);

console.log(`Wrote markdown table: ${path.relative(ROOT, MD_OUT)}`);
console.log(`Wrote svg chart:      ${path.relative(ROOT, SVG_OUT)}`);
