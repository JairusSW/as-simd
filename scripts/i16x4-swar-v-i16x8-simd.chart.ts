import fs from "node:fs";
import path from "node:path";
import { chartSubtitle } from "./chart-meta";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const LOGS_DIR = path.join(ROOT, "build", "logs", "as");
const CHARTS_DIR = path.join(ROOT, "charts");

const SUITE_A = "i16x4";
const SUITE_B = "i16x8";
const MD_OUT = path.join(CHARTS_DIR, "chart-i16x4-swar-v-i16x8-simd.md");
const SVG_OUT = path.join(CHARTS_DIR, "chart-i16x4-swar-v-i16x8-simd.svg");
const TITLE = "i16x4 SWAR vs i16x8 SIMD";
const SUBTITLE = chartSubtitle(ROOT);

const DECL_ORDER: string[] = ["splat", "load", "store", "load-partial", "store-partial", "extract-lane-s", "extract-lane-u", "replace-lane", "add", "sub", "mul", "min-s", "min-u", "max-s", "max-u", "avgr-u", "abs", "neg", "add-sat-s", "add-sat-u", "sub-sat-s", "sub-sat-u", "shl", "shr-s", "shr-u", "all-true", "bitmask", "eq", "ne", "lt-s", "lt-u", "le-s", "le-u", "gt-s", "gt-u", "ge-s", "ge-u", "narrow-i32x4-s", "narrow-i32x4-u", "extend-low-i8x16-s", "extend-low-i8x16-u", "extend-high-i8x16-s", "extend-high-i8x16-u", "extadd-pairwise-i8x16-s", "extadd-pairwise-i8x16-u", "q15mulr-sat-s", "extmul-low-i8x16-s", "extmul-low-i8x16-u", "extmul-high-i8x16-s", "extmul-high-i8x16-u", "shuffle", "relaxed-laneselect", "relaxed-q15mulr-s", "relaxed-dot-i8x16-i7x16-s"];

type BenchResult = { elapsed: number; operations: number };
type Variant = { key: string; color: string; runtime: "v8" | "wavm"; mode: "swar" | "simd"; suite: string };

const VARIANTS: Variant[] = [
  { key: "i16x4-swar-v8", color: "rgb(99,102,241)", runtime: "v8", mode: "swar", suite: SUITE_A },
  { key: "i16x4-swar-llvm", color: "rgb(34,197,94)", runtime: "wavm", mode: "swar", suite: SUITE_A },
  { key: "i16x8-simd-v8", color: "rgb(234,220,90)", runtime: "v8", mode: "simd", suite: SUITE_B },
  { key: "i16x8-simd-llvm", color: "rgb(239,68,68)", runtime: "wavm", mode: "simd", suite: SUITE_B },
];

const leftAliases: Record<string, string> = {
  "narrow-i32x4-s": "narrow-i32x2-s",
  "narrow-i32x4-u": "narrow-i32x2-u",
  "extend-low-i8x16-s": "extend-low-i8x8-s",
  "extend-low-i8x16-u": "extend-low-i8x8-u",
  "extend-high-i8x16-s": "extend-high-i8x8-s",
  "extend-high-i8x16-u": "extend-high-i8x8-u",
  "extadd-pairwise-i8x16-s": "extadd-pairwise-i8x8-s",
  "extadd-pairwise-i8x16-u": "extadd-pairwise-i8x8-u",
  "extmul-low-i8x16-s": "extmul-low-i8x8-s",
  "extmul-low-i8x16-u": "extmul-low-i8x8-u",
  "extmul-high-i8x16-s": "extmul-high-i8x8-s",
  "extmul-high-i8x16-u": "extmul-high-i8x8-u",
  "relaxed-dot-i8x16-i7x16-s": "relaxed-dot-i8x8-i7x8-s",
};

function loadSuite(mode: string, suite: string, runtime: "v8" | "wavm"): Record<string, BenchResult> {
  const dir = path.join(LOGS_DIR, mode);
  if (!fs.existsSync(dir)) return {};
  const out: Record<string, BenchResult> = {};
  for (const file of fs.readdirSync(dir)) {
    if (!file.startsWith(`${suite}.`) || !file.endsWith(`.${runtime}.json`)) continue;
    const op = file.slice(suite.length + 1, -(`.${runtime}.json`.length));
    out[op] = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  }
  return out;
}

function opsPerSec(r: BenchResult): number { return (r.operations * 1000) / r.elapsed; }
function pctDelta(base: number, candidate: number): number { return ((candidate - base) / base) * 100; }
function fmtFloat(n: number, digits = 1): string { return Number.isFinite(n) ? n.toFixed(digits) : "n/a"; }
function fmtMops(n: number): string { return `${fmtFloat(n, 1)}M`; }
function esc(s: string): string { return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }

const loaded = Object.fromEntries(VARIANTS.map((v) => [v.key, loadSuite(v.mode, v.suite, v.runtime)])) as Record<string, Record<string, BenchResult>>;

const seen = new Set(DECL_ORDER);
const extras = new Set<string>();
for (const v of VARIANTS) {
  for (const op of Object.keys(loaded[v.key])) {
    if (!seen.has(op)) extras.add(op);
  }
}
const orderedOps = DECL_ORDER.concat([...extras].sort((a, b) => a.localeCompare(b)));

const rows = orderedOps.map((op) => {
  const values = VARIANTS.map((v) => {
    const set = loaded[v.key];
    const raw = set[op] || (v.suite === SUITE_A ? set[leftAliases[op] ?? ""] : undefined) || null;
    return { ops: raw ? opsPerSec(raw) / 1_000_000 : 0, ok: !!raw };
  });
  const hasSwar = values[0].ok || values[1].ok;
  const hasSimd = values[2].ok || values[3].ok;
  if (!hasSwar || !hasSimd) return null;
  const count = values.filter((x) => x.ok).length;
  const avg = count ? values.reduce((s, x) => s + x.ops, 0) / count : 0;
  const dV8 = values[0].ok && values[2].ok ? pctDelta(values[0].ops, values[2].ops) : null;
  return { op, values, avg, dV8 };
}).filter((x): x is NonNullable<typeof x> => x != null);

if (!rows.length) {
  console.error(`No benchmark JSONs found for ${SUITE_A}/${SUITE_B} in build/logs/as`);
  process.exit(1);
}

fs.mkdirSync(CHARTS_DIR, { recursive: true });
const md: string[] = [];
md.push(`# ${TITLE}`);
md.push("");
md.push("| op | v8 swar | wavm swar | v8 simd | wavm simd | simd-v8 vs swar-v8 |");
md.push("|---|---:|---:|---:|---:|---:|");
for (const r of rows) {
  md.push(`| \`${r.op}\` | ${r.values[0].ok ? fmtFloat(r.values[0].ops) : "—"} | ${r.values[1].ok ? fmtFloat(r.values[1].ops) : "—"} | ${r.values[2].ok ? fmtFloat(r.values[2].ops) : "—"} | ${r.values[3].ok ? fmtFloat(r.values[3].ops) : "—"} | ${r.dV8 == null ? "—" : `${fmtFloat(r.dV8)}%`} |`);
}
fs.writeFileSync(MD_OUT, `${md.join("\n")}\n`);

const maxVal = Math.max(1, ...rows.flatMap((r) => r.values.map((v) => v.ops)));
const rowH = 40;
const headerH = 86;
const leftW = 220;
const barW = 560;
const rightW = 540;
const width = leftW + barW + rightW;
const height = headerH + rows.length * rowH + 20;
const svg: string[] = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
svg.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="transparent"/>`);
svg.push(`<text x="${Math.round(width / 2)}" y="44" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="600" fill="#111827">${esc(TITLE)}</text>`);
svg.push(`<text x="${Math.round(width / 2)}" y="64" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="500" fill="#666666">${esc(SUBTITLE)}</text>`);
const BAR_MARGIN = 48;
const summaryX = leftW + barW + BAR_MARGIN;
const summaryHeaderY = headerH + 3;
const colGap = 84;
const summaryHeader = ["v8 swar", "wavm swar", "v8 simd", "wavm simd"]
  .map((label, j) => `<tspan x="${summaryX + j * colGap}" fill="#374151">${label}</tspan>`)
  .join("");
svg.push(`<text y="${summaryHeaderY}" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600">${summaryHeader}</text>`);
for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  const y = headerH + i * rowH;
  svg.push(`<text x="${leftW - BAR_MARGIN}" y="${y + 21}" text-anchor="end" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600" fill="#111827">${esc(r.op)}</text>`);
  for (let j = 0; j < VARIANTS.length; j++) {
    if (!r.values[j].ok) continue;
    const w = Math.max(1, Math.round((r.values[j].ops / maxVal) * barW));
    svg.push(`<rect x="${leftW}" y="${y + 2 + j * 7}" width="${w}" height="6" fill="${VARIANTS[j].color}" opacity="0.95" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1"/>`);
  }
  const summary = VARIANTS.map((v, j) => {
    const x = summaryX + j * colGap;
    return `<tspan x="${x}" fill="${v.color}">■</tspan><tspan x="${x + 14}" fill="#374151">${fmtMops(r.values[j].ops)}</tspan>`;
  }).join("");
  svg.push(`<text y="${y + 21}" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600">${summary}</text>`);
}
svg.push("</svg>");
fs.writeFileSync(SVG_OUT, `${svg.join("\n")}\n`);

console.log(`Wrote markdown table: ${path.relative(ROOT, MD_OUT)}`);
console.log(`Wrote svg chart:      ${path.relative(ROOT, SVG_OUT)}`);
