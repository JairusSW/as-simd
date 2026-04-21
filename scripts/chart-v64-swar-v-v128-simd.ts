import fs from "node:fs";
import path from "node:path";
import { chartSubtitle } from "./chart-meta";

type BenchResult = { elapsed: number; operations: number };

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const LOGS_DIR = path.join(ROOT, "build", "logs", "as");
const CHARTS_DIR = path.join(ROOT, "charts");
const MD_OUT = path.join(CHARTS_DIR, "chart-v64-swar-v-v128-simd.md");
const SVG_OUT = path.join(CHARTS_DIR, "chart-v64-swar-v-v128-simd.svg");
const TITLE = "v64 SWAR vs v128 SIMD";
const SUBTITLE = chartSubtitle(ROOT);

const SUITE_SWAR = "v64";
const SUITE_SIMD = "v128";
const ORDER = ["add-i8", "add-i16", "add-i32", "sub-i8", "sub-i16", "sub-i32", "mul-i8", "mul-i16", "mul-i32", "min-i16", "max-i16", "eq-i8", "bitmask-i8", "popcnt-i8"];

type Variant = { key: string; color: string; runtime: "v8" | "llvm"; mode: "swar" | "simd"; suite: string };
const VARIANTS: Variant[] = [
  { key: "v64-swar-v8", color: "rgb(99,102,241)", runtime: "v8", mode: "swar", suite: SUITE_SWAR },
  { key: "v64-swar-llvm", color: "rgb(34,197,94)", runtime: "llvm", mode: "swar", suite: SUITE_SWAR },
  { key: "v128-simd-v8", color: "rgb(234,220,90)", runtime: "v8", mode: "simd", suite: SUITE_SIMD },
  { key: "v128-simd-llvm", color: "rgb(239,68,68)", runtime: "llvm", mode: "simd", suite: SUITE_SIMD },
];

function loadSuite(mode: string, suite: string, runtime: "v8" | "llvm"): Record<string, BenchResult> {
  const dir = path.join(LOGS_DIR, mode);
  if (!fs.existsSync(dir)) return {};
  const out: Record<string, BenchResult> = {};
  for (const file of fs.readdirSync(dir)) {
    if (!file.startsWith(`${suite}.`) || !file.endsWith(`.${runtime}.as.json`)) continue;
    const key = file.slice(suite.length + 1, -(`.${runtime}.as.json`.length));
    out[key] = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  }
  if (runtime === "v8") {
    for (const file of fs.readdirSync(dir)) {
      if (!file.startsWith(`${suite}.`) || !file.endsWith(".as.json")) continue;
      if (file.endsWith(".v8.as.json") || file.endsWith(".llvm.as.json")) continue;
      const key = file.slice(suite.length + 1, -".as.json".length);
      if (!(key in out)) out[key] = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    }
  }
  return out;
}

function opsPerSec(r: BenchResult): number { return (r.operations * 1000) / r.elapsed; }
function pctDelta(base: number, candidate: number): number { return ((candidate - base) / base) * 100; }
function fmt(n: number, digits = 1): string { return Number.isFinite(n) ? n.toFixed(digits) : "n/a"; }
function fmtMops(n: number): string { return `${fmt(n)}M`; }
function esc(s: string): string { return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }

const loaded = Object.fromEntries(VARIANTS.map((v) => [v.key, loadSuite(v.mode, v.suite, v.runtime)])) as Record<string, Record<string, BenchResult>>;
const suffixes = new Set<string>(ORDER);
for (const v of VARIANTS) {
  for (const k of Object.keys(loaded[v.key])) {
    suffixes.add(k);
  }
}

const rows = [...suffixes].map((suffix) => {
  const values = VARIANTS.map((v) => {
    const raw = loaded[v.key][suffix] || null;
    return { ok: !!raw, ops: raw ? opsPerSec(raw) / 1_000_000 : 0 };
  });
  const count = values.filter((x) => x.ok).length;
  const avg = count ? values.reduce((s, x) => s + x.ops, 0) / count : 0;
  const dV8 = values[0].ok && values[2].ok ? pctDelta(values[0].ops, values[2].ops) : null;
  return { suffix, values, avg, dV8 };
});

const rank = new Map<string, number>();
ORDER.forEach((name, i) => rank.set(name, i));
rows.sort((a, b) => {
  const ra = rank.get(a.suffix);
  const rb = rank.get(b.suffix);
  if (ra != null && rb != null) return ra - rb;
  if (ra != null) return -1;
  if (rb != null) return 1;
  return b.avg - a.avg;
});

if (!rows.length) {
  console.error(`No benchmark JSONs found for ${SUITE_SWAR}/${SUITE_SIMD} in build/logs/as`);
  process.exit(1);
}

fs.mkdirSync(CHARTS_DIR, { recursive: true });
const md: string[] = [];
md.push(`# ${TITLE}`);
md.push("");
md.push("| op | v8 swar | llvm swar | v8 simd | llvm simd | v64-v8 vs v128-v8 |");
md.push("|---|---:|---:|---:|---:|---:|");
for (const r of rows) {
  md.push(`| \`${r.suffix}\` | ${r.values[0].ok ? fmt(r.values[0].ops) : "—"} | ${r.values[1].ok ? fmt(r.values[1].ops) : "—"} | ${r.values[2].ok ? fmt(r.values[2].ops) : "—"} | ${r.values[3].ok ? fmt(r.values[3].ops) : "—"} | ${r.dV8 == null ? "—" : `${fmt(r.dV8)}%`} |`);
}
fs.writeFileSync(MD_OUT, `${md.join("\n")}\n`);

const maxVal = Math.max(1, ...rows.flatMap((r) => r.values.map((v) => v.ops)));
const rowH = 32;
const headerH = 86;
const leftW = 160;
const barW = 560;
const rightW = 560;
const width = leftW + barW + rightW;
const height = headerH + rows.length * rowH + 20;
const svg: string[] = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
svg.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="transparent"/>`);
svg.push(`<text x="${Math.round(width / 2)}" y="44" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="600" fill="#111827">${esc(TITLE)}</text>`);
svg.push(`<text x="${Math.round(width / 2)}" y="64" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="500" fill="#666666">${esc(SUBTITLE)}</text>`);
const summaryX = leftW + barW + 8;
const summaryHeaderY = headerH + 3;
const colGap = 84;
const summaryHeader = ["v8 swar", "llvm swar", "v8 simd", "llvm simd"]
  .map((label, j) => `<tspan x="${summaryX + j * colGap}" fill="#374151">${label}</tspan>`)
  .join("");
svg.push(`<text y="${summaryHeaderY}" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600">${summaryHeader}</text>`);
for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  const y = headerH + i * rowH;
  svg.push(`<text x="8" y="${y + 21}" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600" fill="#111827">${esc(r.suffix)}</text>`);
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
