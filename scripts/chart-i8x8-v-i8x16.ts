import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const LOGS_DIR = path.join(ROOT, "build", "logs", "as");
const CHARTS_DIR = path.join(ROOT, "charts");

// Hard-coded source suites and modes.
const SUITE_A = "i8x8";
const SUITE_B = "i8x16";
const MODE_A = "swar";
const MODE_B = "simd";

const MD_OUT = path.join(CHARTS_DIR, "chart-i8x8-v-i8x16.md");
const SVG_OUT = path.join(CHARTS_DIR, "chart-i8x8-v-i8x16.svg");

// i8x16 API declaration order (kebab-case bench op names)
const DECL_ORDER: string[] = ["splat", "extract-lane-s", "extract-lane-u", "replace-lane", "add", "sub", "min-s", "min-u", "max-s", "max-u", "avgr-u", "abs", "neg", "add-sat-s", "add-sat-u", "sub-sat-s", "sub-sat-u", "shl", "shr-s", "shr-u", "all-true", "bitmask", "popcnt", "eq", "ne", "lt-s", "lt-u", "le-s", "le-u", "gt-s", "gt-u", "ge-s", "ge-u", "narrow-i16x8-s", "narrow-i16x8-u", "shuffle", "swizzle", "relaxed-swizzle", "relaxed-laneselect"];

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

const left = loadSuite(MODE_A, SUITE_A);
const right = loadSuite(MODE_B, SUITE_B);

const leftAliases: Record<string, string> = {
  "narrow-i16x8-s": "narrow-i16x4-s",
  "narrow-i16x8-u": "narrow-i16x4-u",
};

const orderedOps = DECL_ORDER.slice();
const seen = new Set(orderedOps);
for (const op of [...Object.keys(left), ...Object.keys(right)]) {
  if (!seen.has(op)) {
    seen.add(op);
    orderedOps.push(op);
  }
}

if (!orderedOps.length) {
  console.error(`No benchmark JSONs found for ${SUITE_A} (${MODE_A}) / ${SUITE_B} (${MODE_B}) under build/logs/as`);
  process.exit(1);
}

const rows = orderedOps
  .map((op) => {
    const l = left[op] || left[leftAliases[op] ?? ""] || null;
    const r = right[op] || null;
    const lOps = l ? opsPerSec(l) : 0;
    const rOps = r ? opsPerSec(r) : 0;
    const speedSamples = [lOps, rOps].filter((n) => n > 0);
    const avgOps = speedSamples.length ? speedSamples.reduce((a, b) => a + b, 0) / speedSamples.length : 0;
    return {
      op,
      l,
      r,
      lOps,
      rOps,
      avgOps,
      dOps: l && r ? pctDelta(lOps, rOps) : null,
    };
  })
  .sort((a, b) => b.avgOps - a.avgOps);

fs.mkdirSync(CHARTS_DIR, { recursive: true });

const md: string[] = [];
md.push(`# ${SUITE_A} (${MODE_A.toUpperCase()}) vs ${SUITE_B} (${MODE_B.toUpperCase()}) Benchmark Comparison`);
md.push("");
md.push(`Sources: \`build/logs/as/${MODE_A}/${SUITE_A}.*.as.json\` and \`build/logs/as/${MODE_B}/${SUITE_B}.*.as.json\``);
md.push(`Sort: highest to lowest average ops/s between these two selected datasets`);
md.push("");
md.push(`| op | ${SUITE_A} Mops/s | ${SUITE_B} Mops/s | delta |`);
md.push("|---|---:|---:|---:|");
for (const r of rows) {
  md.push(`| \`${r.op}\` | ${r.l ? fmtFloat(r.lOps / 1_000_000, 1) : "—"} | ${r.r ? fmtFloat(r.rOps / 1_000_000, 1) : "—"} | ${r.dOps == null ? "—" : `${fmtFloat(r.dOps, 1)}%`} |`);
}
fs.writeFileSync(MD_OUT, `${md.join("\n")}\n`);

const both = rows.filter((r) => r.l && r.r);
const chartRows = both.slice();
const maxOps = Math.max(1, ...chartRows.map((r) => Math.max(r.lOps, r.rOps)));

const rowH = 20;
const headerH = 56;
const leftW = 170;
const barW = 560;
const rightW = 360;
const height = headerH + chartRows.length * rowH + 20;
const width = leftW + barW + rightW;

const svg: string[] = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
svg.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>`);
svg.push(`<text x="16" y="24" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="700" fill="#111827">${esc(SUITE_A)} (${MODE_A.toUpperCase()}) vs ${esc(SUITE_B)} (${MODE_B.toUpperCase()})</text>`);
svg.push(`<text x="16" y="42" font-family="Inter, Arial, sans-serif" font-size="12" fill="#4b5563">Blue: ${esc(SUITE_A)} (${MODE_A}), Green: ${esc(SUITE_B)} (${MODE_B})</text>`);

for (let i = 0; i < chartRows.length; i++) {
  const r = chartRows[i];
  const y = headerH + i * rowH;
  const lw = Math.max(1, Math.round((r.lOps / maxOps) * barW));
  const rw = Math.max(1, Math.round((r.rOps / maxOps) * barW));
  const ty = y + 14;
  svg.push(`<text x="8" y="${ty}" font-family="Inter, Arial, sans-serif" font-size="11" fill="#111827">${esc(r.op)}</text>`);
  svg.push(`<rect x="${leftW}" y="${y + 3}" width="${lw}" height="6" fill="#3b82f6" opacity="0.9"/>`);
  svg.push(`<rect x="${leftW}" y="${y + 11}" width="${rw}" height="6" fill="#10b981" opacity="0.9"/>`);
  svg.push(`<text x="${leftW + barW + 8}" y="${ty}" font-family="Inter, Arial, sans-serif" font-size="11" fill="#374151">${fmtMops(r.lOps)} -> ${fmtMops(r.rOps)} (${fmtFloat(r.dOps ?? 0, 1)}%)</text>`);
}
svg.push(`</svg>`);
fs.writeFileSync(SVG_OUT, `${svg.join("\n")}\n`);

console.log(`Wrote markdown table: ${path.relative(ROOT, MD_OUT)}`);
console.log(`Wrote svg chart:      ${path.relative(ROOT, SVG_OUT)}`);
