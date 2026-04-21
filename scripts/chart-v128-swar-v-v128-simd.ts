import fs from "node:fs";
import path from "node:path";
import { chartSubtitle } from "./chart-meta";

type BenchResult = { elapsed: number; operations: number };

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const LOGS_DIR = path.join(ROOT, "build", "logs", "as");
const CHARTS_DIR = path.join(ROOT, "charts");
const SUITES = ["i8x16", "i16x8", "i32x4", "i64x2"] as const;
const TITLE = (suite: string): string => `${suite} SWAR vs SIMD`;
const SUBTITLE = chartSubtitle(ROOT);

const ORDERS: Record<string, string[]> = {
  i8x16: ["splat", "load", "store", "load-partial", "store-partial", "extract-lane-s", "extract-lane-u", "replace-lane", "add", "sub", "mul", "min-s", "min-u", "max-s", "max-u", "avgr-u", "abs", "neg", "add-sat-s", "add-sat-u", "sub-sat-s", "sub-sat-u", "shl", "shr-s", "shr-u", "all-true", "bitmask", "popcnt", "eq", "ne", "lt-s", "lt-u", "le-s", "le-u", "gt-s", "gt-u", "ge-s", "ge-u"],
  i16x8: ["splat", "load", "store", "load-partial", "store-partial", "extract-lane-s", "extract-lane-u", "replace-lane", "add", "sub", "mul", "min-s", "min-u", "max-s", "max-u", "avgr-u", "abs", "neg", "add-sat-s", "add-sat-u", "sub-sat-s", "sub-sat-u", "shl", "shr-s", "shr-u", "all-true", "bitmask", "eq", "ne", "lt-s", "lt-u", "le-s", "le-u", "gt-s", "gt-u", "ge-s", "ge-u"],
  i32x4: ["splat", "load", "store", "load-partial", "store-partial", "extract-lane", "replace-lane", "add", "sub", "mul", "min-s", "min-u", "max-s", "max-u", "dot-i16x8-s", "abs", "neg", "shl", "shr-s", "shr-u", "all-true", "bitmask", "eq", "ne", "lt-s", "lt-u", "le-s", "le-u", "gt-s", "gt-u", "ge-s", "ge-u"],
  i64x2: ["splat", "load", "store", "load-partial", "store-partial", "extract-lane", "replace-lane", "add", "sub", "mul", "abs", "neg", "shl", "shr-s", "shr-u", "all-true", "bitmask", "eq", "ne", "lt-s", "le-s", "gt-s", "ge-s", "extend-low-i32x4-s", "extend-low-i32x4-u", "extend-high-i32x4-s", "extend-high-i32x4-u", "extmul-low-i32x4-s", "extmul-low-i32x4-u", "extmul-high-i32x4-s", "extmul-high-i32x4-u", "shuffle", "relaxed-laneselect"],
};

type Variant = { key: string; color: string; runtime: "v8" | "llvm"; mode: "swar" | "simd" };
const VARIANTS: Variant[] = [
  { key: "swar-v8", color: "rgb(99,102,241)", runtime: "v8", mode: "swar" },
  { key: "swar-llvm", color: "rgb(34,197,94)", runtime: "llvm", mode: "swar" },
  { key: "simd-v8", color: "rgb(234,220,90)", runtime: "v8", mode: "simd" },
  { key: "simd-llvm", color: "rgb(239,68,68)", runtime: "llvm", mode: "simd" },
];

function loadSuite(mode: string, suite: string, runtime: "v8" | "llvm"): Record<string, BenchResult> {
  const dir = path.join(LOGS_DIR, mode);
  if (!fs.existsSync(dir)) return {};
  const out: Record<string, BenchResult> = {};
  const suiteName = mode === "simd" && suite.endsWith("-swar") ? suite : suite;
  for (const file of fs.readdirSync(dir)) {
    if (!file.startsWith(`${suiteName}.`) || !file.endsWith(`.${runtime}.as.json`)) continue;
    const op = file.slice(suiteName.length + 1, -(`.${runtime}.as.json`.length));
    out[op] = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  }
  if (runtime === "v8") {
    for (const file of fs.readdirSync(dir)) {
      if (!file.startsWith(`${suiteName}.`) || !file.endsWith(".as.json")) continue;
      if (file.endsWith(".v8.as.json") || file.endsWith(".llvm.as.json")) continue;
      const op = file.slice(suiteName.length + 1, -".as.json".length);
      if (!(op in out)) out[op] = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    }
  }
  return out;
}

function opsPerSec(r: BenchResult): number { return (r.operations * 1000) / r.elapsed; }
function pctDelta(base: number, candidate: number): number { return ((candidate - base) / base) * 100; }
function fmt(n: number, digits = 1): string { return Number.isFinite(n) ? n.toFixed(digits) : "n/a"; }
function fmtMops(n: number): string { return `${fmt(n)}M`; }
function esc(s: string): string { return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }

fs.mkdirSync(CHARTS_DIR, { recursive: true });

for (const suite of SUITES) {
  const loaded: Record<string, Record<string, BenchResult>> = {
    "swar-v8": loadSuite("swar", suite, "v8"),
    "simd-v8": loadSuite("simd", suite, "v8"),
    "swar-llvm": loadSuite("swar", suite, "llvm"),
    "simd-llvm": loadSuite("simd", suite, "llvm"),
  };

  const ordered = ORDERS[suite].slice();
  const seen = new Set(ordered);
  for (const v of VARIANTS) for (const op of Object.keys(loaded[v.key])) if (!seen.has(op)) { seen.add(op); ordered.push(op); }

  const rows = ordered.map((op) => {
    const values = VARIANTS.map((v) => {
      const r = loaded[v.key][op] || null;
      return { ok: !!r, ops: r ? opsPerSec(r) / 1_000_000 : 0 };
    });
    const count = values.filter((x) => x.ok).length;
    const avg = count ? values.reduce((s, x) => s + x.ops, 0) / count : 0;
    const dV8 = values[0].ok && values[2].ok ? pctDelta(values[0].ops, values[2].ops) : null;
    return { op, values, avg, dV8 };
  }).sort((a, b) => b.avg - a.avg);

  const mdOut = path.join(CHARTS_DIR, `chart-${suite}-swar-v-${suite}-simd.md`);
  const svgOut = path.join(CHARTS_DIR, `chart-${suite}-swar-v-${suite}-simd.svg`);

  const md: string[] = [];
  md.push(`# ${TITLE(suite)}`);
  md.push("");
  md.push("| op | v8 swar | llvm swar | v8 simd | llvm simd | simd-v8 vs swar-v8 |");
  md.push("|---|---:|---:|---:|---:|---:|");
  for (const r of rows) {
    md.push(`| \`${r.op}\` | ${r.values[0].ok ? fmt(r.values[0].ops) : "—"} | ${r.values[1].ok ? fmt(r.values[1].ops) : "—"} | ${r.values[2].ok ? fmt(r.values[2].ops) : "—"} | ${r.values[3].ok ? fmt(r.values[3].ops) : "—"} | ${r.dV8 == null ? "—" : `${fmt(r.dV8)}%`} |`);
  }
  fs.writeFileSync(mdOut, `${md.join("\n")}\n`);

  const maxVal = Math.max(1, ...rows.flatMap((r) => r.values.map((v) => v.ops)));
  const rowH = 32;
  const headerH = 86;
  const leftW = 180;
  const barW = 560;
  const rightW = 540;
  const width = leftW + barW + rightW;
  const height = headerH + rows.length * rowH + 20;
  const svg: string[] = [];
  svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
  svg.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="transparent"/>`);
  svg.push(`<text x="${Math.round(width / 2)}" y="44" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="600" fill="#111827">${esc(TITLE(suite))}</text>`);
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
    svg.push(`<text x="8" y="${y + 21}" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600" fill="#111827">${esc(r.op)}</text>`);
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
  fs.writeFileSync(svgOut, `${svg.join("\n")}\n`);

  console.log(`Wrote markdown table: ${path.relative(ROOT, mdOut)}`);
  console.log(`Wrote svg chart:      ${path.relative(ROOT, svgOut)}`);
}
