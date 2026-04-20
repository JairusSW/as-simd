import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const LOGS_DIR = path.join(ROOT, "build", "logs", "as");
const CHARTS_DIR = path.join(ROOT, "charts");

const SUITE = "i16x4";
const MODE_A = "simd";
const MODE_B = "swar";

const MD_OUT = path.join(CHARTS_DIR, "chart-i16x4-simd-v-swar.md");
const SVG_OUT = path.join(CHARTS_DIR, "chart-i16x4-simd-v-swar.svg");

const DECL_ORDER: string[] = [
  "ctor", "splat", "extract-lane-s", "extract-lane-u", "replace-lane",
  "add", "sub", "mul", "min-s", "min-u", "max-s", "max-u", "avgr-u", "abs", "neg",
  "add-sat-s", "add-sat-u", "sub-sat-s", "sub-sat-u",
  "shl", "shr-s", "shr-u", "all-true", "bitmask",
  "eq", "ne", "lt-s", "lt-u", "le-s", "le-u", "gt-s", "gt-u", "ge-s", "ge-u",
  "narrow-i32x2-s", "narrow-i32x2-u",
  "extend-low-i8x8-s", "extend-low-i8x8-u", "extend-high-i8x8-s", "extend-high-i8x8-u",
  "extadd-pairwise-i8x8-s", "extadd-pairwise-i8x8-u",
  "q15mulr-sat-s", "extmul-low-i8x8-s", "extmul-low-i8x8-u", "extmul-high-i8x8-s", "extmul-high-i8x8-u",
  "shuffle", "relaxed-laneselect", "relaxed-q15mulr-s", "relaxed-dot-i8x8-i7x8-s",
];

type BenchResult = {
  description: string;
  elapsed: number;
  operations: number;
};

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

function opsPerSec(r: BenchResult): number {
  return (r.operations * 1000) / r.elapsed;
}

function pctDelta(a: number, b: number): number {
  return ((b - a) / a) * 100;
}

function fmtFloat(n: number, digits = 2): string {
  return Number.isFinite(n) ? n.toFixed(digits) : "n/a";
}

function fmtMops(n: number): string {
  return `${fmtFloat(n / 1_000_000, 1)}M`;
}

function esc(s: string): string {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

const simd = loadSuite(MODE_A, SUITE);
const swar = loadSuite(MODE_B, SUITE);

const orderedOps = DECL_ORDER.slice();
const seen = new Set(orderedOps);
for (const op of [...Object.keys(simd), ...Object.keys(swar)]) {
  if (!seen.has(op)) {
    seen.add(op);
    orderedOps.push(op);
  }
}

if (!orderedOps.length) {
  console.error(`No benchmark JSONs found in build/logs/as/{${MODE_A},${MODE_B}} for ${SUITE}`);
  process.exit(1);
}

const rows = orderedOps
  .map((op) => {
    const a = simd[op] || null;
    const b = swar[op] || null;
    const aOps = a ? opsPerSec(a) : 0;
    const bOps = b ? opsPerSec(b) : 0;
    const avgOps = aOps > 0 && bOps > 0 ? (aOps + bOps) / 2 : aOps || bOps || 0;
    return { op, a, b, aOps, bOps, avgOps, dOps: a && b ? pctDelta(aOps, bOps) : null };
  })
  .sort((x, y) => y.avgOps - x.avgOps);

fs.mkdirSync(CHARTS_DIR, { recursive: true });

const md: string[] = [];
md.push(`# ${SUITE} ${MODE_A.toUpperCase()} vs ${MODE_B.toUpperCase()}`);
md.push("");
md.push(`Source: \`build/logs/as/${MODE_A}\` and \`build/logs/as/${MODE_B}\``);
md.push("Sort: highest to lowest average ops/s between SIMD and SWAR");
md.push("");
md.push(`| op | ${MODE_A.toUpperCase()} Mops/s | ${MODE_B.toUpperCase()} Mops/s | delta (${MODE_B.toUpperCase()} vs ${MODE_A.toUpperCase()}) |`);
md.push("|---|---:|---:|---:|");
for (const r of rows) {
  md.push(`| \`${r.op}\` | ${r.a ? fmtFloat(r.aOps / 1_000_000, 1) : "—"} | ${r.b ? fmtFloat(r.bOps / 1_000_000, 1) : "—"} | ${r.dOps == null ? "—" : `${fmtFloat(r.dOps, 1)}%`} |`);
}
fs.writeFileSync(MD_OUT, `${md.join("\n")}\n`);

const chartRows = rows.filter((r) => r.a && r.b);
const maxOps = Math.max(1, ...chartRows.map((r) => Math.max(r.aOps, r.bOps)));

const rowH = 20;
const headerH = 56;
const leftW = 230;
const barW = 560;
const rightW = 300;
const height = headerH + chartRows.length * rowH + 20;
const width = leftW + barW + rightW;

const svg: string[] = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
svg.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>`);
svg.push(`<text x="16" y="24" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="700" fill="#111827">${esc(SUITE)} ${MODE_A.toUpperCase()} vs ${MODE_B.toUpperCase()}</text>`);
svg.push(`<text x="16" y="42" font-family="Inter, Arial, sans-serif" font-size="12" fill="#4b5563">Blue: ${MODE_A.toUpperCase()}, Green: ${MODE_B.toUpperCase()}</text>`);

for (let i = 0; i < chartRows.length; i++) {
  const r = chartRows[i];
  const y = headerH + i * rowH;
  const aw = Math.max(1, Math.round((r.aOps / maxOps) * barW));
  const bw = Math.max(1, Math.round((r.bOps / maxOps) * barW));
  const ty = y + 14;
  svg.push(`<text x="8" y="${ty}" font-family="Inter, Arial, sans-serif" font-size="11" fill="#111827">${esc(r.op)}</text>`);
  svg.push(`<rect x="${leftW}" y="${y + 3}" width="${aw}" height="6" fill="#3b82f6" opacity="0.9"/>`);
  svg.push(`<rect x="${leftW}" y="${y + 11}" width="${bw}" height="6" fill="#10b981" opacity="0.9"/>`);
  svg.push(`<text x="${leftW + barW + 8}" y="${ty}" font-family="Inter, Arial, sans-serif" font-size="11" fill="#374151">${fmtMops(r.aOps)} -> ${fmtMops(r.bOps)} (${fmtFloat(r.dOps ?? 0, 1)}%)</text>`);
}
svg.push("</svg>");
fs.writeFileSync(SVG_OUT, `${svg.join("\n")}\n`);

console.log(`Wrote markdown table: ${path.relative(ROOT, MD_OUT)}`);
console.log(`Wrote svg chart:      ${path.relative(ROOT, SVG_OUT)}`);
