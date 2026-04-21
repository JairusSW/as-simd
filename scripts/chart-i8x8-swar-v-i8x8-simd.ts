import fs from "node:fs";
import path from "node:path";
import { chartSubtitle } from "./chart-meta";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const LOGS_DIR = path.join(ROOT, "build", "logs", "as");
const CHARTS_DIR = path.join(ROOT, "charts");

const SUITE = "i8x8";
const MD_OUT = path.join(CHARTS_DIR, "chart-i8x8-swar-v-i8x8-simd.md");
const SVG_OUT = path.join(CHARTS_DIR, "chart-i8x8-swar-v-i8x8-simd.svg");
const TITLE = "i8x8 SWAR vs SIMD";
const SUBTITLE = chartSubtitle(ROOT);

const DECL_ORDER: string[] = ["splat", "load", "store", "load-partial", "store-partial", "extract-lane-s", "extract-lane-u", "replace-lane", "add", "sub", "min-s", "min-u", "max-s", "max-u", "avgr-u", "abs", "neg", "add-sat-s", "add-sat-u", "sub-sat-s", "sub-sat-u", "shl", "shr-s", "shr-u", "all-true", "bitmask", "popcnt", "eq", "ne", "lt-s", "lt-u", "le-s", "le-u", "gt-s", "gt-u", "ge-s", "ge-u", "narrow-i16x4-s", "narrow-i16x4-u", "shuffle", "swizzle", "relaxed-swizzle", "relaxed-laneselect", "mul"];

type BenchResult = { elapsed: number; operations: number };
type Variant = { key: string; label: string; color: string; mode: "swar" | "simd"; runtime: "v8" | "llvm" };

const VARIANTS: Variant[] = [
  { key: "swar-v8", label: "swar v8", color: "rgb(99,102,241)", mode: "swar", runtime: "v8" },
  { key: "swar-llvm", label: "swar llvm", color: "rgb(34,197,94)", mode: "swar", runtime: "llvm" },
  { key: "simd-v8", label: "simd v8", color: "rgb(234,220,90)", mode: "simd", runtime: "v8" },
  { key: "simd-llvm", label: "simd llvm", color: "rgb(239,68,68)", mode: "simd", runtime: "llvm" },
];

function loadSuite(mode: string, suite: string, runtime: "v8" | "llvm"): Record<string, BenchResult> {
  const dir = path.join(LOGS_DIR, mode);
  if (!fs.existsSync(dir)) return {};
  const out: Record<string, BenchResult> = {};
  for (const file of fs.readdirSync(dir)) {
    const withRuntime = `${suite}.`;
    if (!file.startsWith(withRuntime) || !file.endsWith(`.${runtime}.as.json`)) continue;
    const op = file.slice(suite.length + 1, -(`.${runtime}.as.json`.length));
    out[op] = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  }
  if (runtime === "v8") {
    for (const file of fs.readdirSync(dir)) {
      if (!file.startsWith(`${suite}.`) || !file.endsWith(".as.json")) continue;
      if (file.endsWith(".v8.as.json") || file.endsWith(".llvm.as.json")) continue;
      const op = file.slice(suite.length + 1, -".as.json".length);
      if (!(op in out)) out[op] = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    }
  }
  return out;
}

function opsPerSec(r: BenchResult): number {
  return (r.operations * 1000) / r.elapsed;
}

function pctDelta(base: number, candidate: number): number {
  return ((candidate - base) / base) * 100;
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

const data = Object.fromEntries(VARIANTS.map((v) => [v.key, loadSuite(v.mode, SUITE, v.runtime)])) as Record<string, Record<string, BenchResult>>;

const orderedOps = DECL_ORDER.slice();
const seen = new Set(orderedOps);
for (const v of VARIANTS) {
  for (const op of Object.keys(data[v.key])) {
    if (!seen.has(op)) {
      seen.add(op);
      orderedOps.push(op);
    }
  }
}

if (!orderedOps.length) {
  console.error(`No benchmark JSONs found for ${SUITE} in build/logs/as/{swar,simd}`);
  process.exit(1);
}

const rows = orderedOps
  .map((op) => {
    const values = VARIANTS.map((v) => {
      const r = data[v.key][op] || null;
      const ops = r ? opsPerSec(r) : 0;
      return { v, r, ops };
    });
    const present = values.filter((x) => x.r);
    const avgOps = present.length ? values.reduce((s, x) => s + x.ops, 0) / present.length : 0;
    const baseSwarV8 = values[0].ops;
    const baseSimdV8 = values[2].ops;
    const dV8 = baseSwarV8 > 0 && baseSimdV8 > 0 ? pctDelta(baseSwarV8, baseSimdV8) : null;
    return { op, values, avgOps, dV8 };
  })
  .sort((a, b) => b.avgOps - a.avgOps);

fs.mkdirSync(CHARTS_DIR, { recursive: true });

const md: string[] = [];
md.push(`# ${TITLE}`);
md.push("");
md.push("Sources:");
md.push("- `build/logs/as/swar/" + SUITE + ".*.v8.as.json`");
md.push("- `build/logs/as/simd/" + SUITE + ".*.v8.as.json`");
md.push("- `build/logs/as/swar/" + SUITE + ".*.llvm.as.json`");
md.push("- `build/logs/as/simd/" + SUITE + ".*.llvm.as.json`");
md.push("");
md.push("| op | v8 swar | llvm swar | v8 simd | llvm simd | simd-v8 vs swar-v8 |");
md.push("|---|---:|---:|---:|---:|---:|");
for (const r of rows) {
  const vals = r.values.map((x) => x.r ? fmtFloat(x.ops / 1_000_000, 1) : "—");
  md.push(`| \`${r.op}\` | ${vals[0]} | ${vals[1]} | ${vals[2]} | ${vals[3]} | ${r.dV8 == null ? "—" : `${fmtFloat(r.dV8, 1)}%`} |`);
}
fs.writeFileSync(MD_OUT, `${md.join("\n")}\n`);

const chartRows = rows.filter((r) => r.values.some((x) => x.r));
const maxOps = Math.max(1, ...chartRows.flatMap((r) => r.values.map((x) => x.ops)));

const rowH = 32;
const headerH = 94;
const leftW = 170;
const barW = 560;
const rightW = 380;
const height = headerH + chartRows.length * rowH + 20;
const width = leftW + barW + rightW;

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

for (let i = 0; i < chartRows.length; i++) {
  const r = chartRows[i];
  const y = headerH + i * rowH;
  svg.push(`<text x="8" y="${y + 21}" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600" fill="#111827">${esc(r.op)}</text>`);
  for (let j = 0; j < VARIANTS.length; j++) {
    const ops = r.values[j].ops;
    if (ops <= 0) continue;
    const w = Math.max(1, Math.round((ops / maxOps) * barW));
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
