import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chartSubtitle } from "./chart-meta";

// Adapted from json-as's overview chart template: the same SWAR/SIMD palette,
// grouped throughput bars, restrained neutral ink, metadata subtitle, and
// labels placed directly on the data instead of requiring tooltip discovery.
const COLORS = {
  swar: "#44AF69",
  simd: "#2B9EB3",
  positive: "#2B9EB3",
  negative: "#F8333C",
  ink: "#374151",
  muted: "#6b7280",
  grid: "#d1d5db",
} as const;

type BenchRow = { op: string; swar: number; simd: number };
type Family = {
  label: string;
  file: string;
  rows: BenchRow[];
  swar: number;
  simd: number;
  speedup: number;
  median: number;
  wins: number;
  best: BenchRow;
  worst: BenchRow;
};

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHARTS = path.join(ROOT, "charts");
const INPUTS = [
  ["v64", "chart-v64-swar-v-v64-simd.md"],
  ["v128", "chart-v128-swar-v-v128-simd.md"],
  ["8 × i8", "chart-i8x8-swar-v-i8x8-simd.md"],
  ["16 × i8", "chart-i8x16-swar-v-i8x16-simd.md"],
  ["4 × i16", "chart-i16x4-swar-v-i16x4-simd.md"],
  ["8 × i16", "chart-i16x8-swar-v-i16x8-simd.md"],
  ["2 × i32", "chart-i32x2-swar-v-i32x2-simd.md"],
  ["4 × i32", "chart-i32x4-swar-v-i32x4-simd.md"],
  ["2 × i64", "chart-i64x2-swar-v-i64x2-simd.md"],
] as const;

function esc(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function readRows(file: string): BenchRow[] {
  const rows: BenchRow[] = [];
  for (const line of fs.readFileSync(path.join(CHARTS, file), "utf8").split("\n")) {
    const match = line.match(/^\| `([^`]+)` \| ([\d.]+) \| [^|]+ \| ([\d.]+) \|/);
    if (match) rows.push({ op: match[1], swar: Number(match[2]), simd: Number(match[3]) });
  }
  if (!rows.length) throw new Error(`No V8 benchmark rows found in charts/${file}`);
  return rows;
}

function geometricMean(values: number[]): number {
  return Math.exp(values.reduce((sum, value) => sum + Math.log(value), 0) / values.length);
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function pct(row: BenchRow): number {
  return (row.simd / row.swar - 1) * 100;
}

const families: Family[] = INPUTS.map(([label, file]) => {
  const rows = readRows(file);
  const ranked = [...rows].sort((a, b) => pct(b) - pct(a));
  const ratios = rows.map((row) => row.simd / row.swar);
  return {
    label,
    file,
    rows,
    swar: geometricMean(rows.map((row) => row.swar)),
    simd: geometricMean(rows.map((row) => row.simd)),
    speedup: (geometricMean(ratios) - 1) * 100,
    median: median(ratios.map((ratio) => (ratio - 1) * 100)),
    wins: ratios.filter((ratio) => ratio > 1).length,
    best: ranked[0],
    worst: ranked.at(-1)!,
  };
});

function niceMax(value: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

function writeThroughputChart(): void {
  const width = 1280;
  const height = 720;
  const left = 95;
  const right = 35;
  const top = 150;
  const bottom = 125;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const max = niceMax(Math.max(...families.flatMap((family) => [family.swar, family.simd])) * 1.12);
  const groupW = plotW / families.length;
  const barW = Math.min(38, groupW * 0.3);
  const out: string[] = [];

  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
  out.push(`<rect width="${width}" height="${height}" fill="transparent"/>`);
  out.push(`<text x="${width / 2}" y="42" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="25" font-weight="700" fill="${COLORS.ink}">V8 Vector Throughput Overview</text>`);
  out.push(`<text x="${width / 2}" y="68" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="600" fill="${COLORS.muted}">${esc(chartSubtitle(ROOT))}</text>`);
  out.push(`<text x="${width / 2}" y="94" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="13" fill="${COLORS.muted}">Geometric mean across every operation shared by each same-width SWAR/SIMD suite</text>`);
  out.push(`<rect x="${width / 2 - 118}" y="112" width="13" height="13" rx="2" fill="${COLORS.swar}"/><text x="${width / 2 - 98}" y="123" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="600" fill="${COLORS.ink}">SWAR</text>`);
  out.push(`<rect x="${width / 2 + 20}" y="112" width="13" height="13" rx="2" fill="${COLORS.simd}"/><text x="${width / 2 + 40}" y="123" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="600" fill="${COLORS.ink}">SIMD</text>`);

  for (let tick = 0; tick <= 5; tick++) {
    const value = (max * tick) / 5;
    const y = top + plotH - (value / max) * plotH;
    out.push(`<line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="${COLORS.grid}" stroke-width="1" opacity="0.65"/>`);
    out.push(`<text x="${left - 12}" y="${y + 5}" text-anchor="end" font-family="Inter,Arial,sans-serif" font-size="13" fill="${COLORS.muted}">${Math.round(value)}</text>`);
  }
  out.push(`<text x="25" y="${top + plotH / 2}" transform="rotate(-90 25 ${top + plotH / 2})" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="15" font-weight="700" fill="${COLORS.ink}">Throughput (million operations/s)</text>`);

  families.forEach((family, index) => {
    const center = left + groupW * (index + 0.5);
    const values = [[family.swar, COLORS.swar], [family.simd, COLORS.simd]] as const;
    values.forEach(([value, color], series) => {
      const h = (value / max) * plotH;
      const x = center + (series === 0 ? -barW - 2 : 2);
      const y = top + plotH - h;
      out.push(`<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="${color}" fill-opacity="0.9"/>`);
      out.push(`<text x="${x + barW / 2}" y="${y - 7}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" font-weight="700" fill="${COLORS.ink}">${value.toFixed(0)}</text>`);
    });
    out.push(`<text x="${center}" y="${top + plotH + 25}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="700" fill="${COLORS.ink}">${esc(family.label)}</text>`);
    out.push(`<text x="${center}" y="${top + plotH + 44}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="11" fill="${COLORS.muted}">n=${family.rows.length}</text>`);
  });
  out.push(`<text x="${width / 2}" y="${height - 24}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" fill="${COLORS.muted}">Higher is better · See the per-family chart tables for individual operations and WAVM results</text>`);
  out.push("</svg>");
  fs.writeFileSync(path.join(CHARTS, "chart-overview-v8.svg"), `${out.join("\n")}\n`);
}

function writeSpeedupChart(): void {
  const width = 1280;
  const height = 680;
  const left = 180;
  const right = 170;
  const top = 125;
  const rowH = 53;
  const plotW = width - left - right;
  const min = Math.min(-5, ...families.map((family) => family.speedup));
  const max = Math.max(10, ...families.map((family) => family.speedup));
  const lo = Math.floor(min / 10) * 10;
  // Keep the value label clear of the right-hand win-count summary.
  const hi = Math.ceil((max + 10) / 10) * 10;
  const x = (value: number): number => left + ((value - lo) / (hi - lo)) * plotW;
  const zero = x(0);
  const out: string[] = [];

  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
  out.push(`<rect width="${width}" height="${height}" fill="transparent"/>`);
  out.push(`<text x="${width / 2}" y="42" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="25" font-weight="700" fill="${COLORS.ink}">Native SIMD Speedup over SWAR on V8</text>`);
  out.push(`<text x="${width / 2}" y="68" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="600" fill="${COLORS.muted}">${esc(chartSubtitle(ROOT))}</text>`);
  out.push(`<text x="${width / 2}" y="94" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="13" fill="${COLORS.muted}">Geometric mean of per-operation SIMD/SWAR throughput ratios; equal weight per operation</text>`);

  for (let tick = lo; tick <= hi; tick += 10) {
    const tx = x(tick);
    out.push(`<line x1="${tx}" y1="${top - 10}" x2="${tx}" y2="${top + families.length * rowH}" stroke="${tick === 0 ? COLORS.ink : COLORS.grid}" stroke-width="${tick === 0 ? 2 : 1}" opacity="${tick === 0 ? 0.7 : 0.6}"/>`);
    out.push(`<text x="${tx}" y="${top - 18}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" fill="${COLORS.muted}">${tick > 0 ? "+" : ""}${tick}%</text>`);
  }

  families.forEach((family, index) => {
    const y = top + index * rowH;
    const end = x(family.speedup);
    const barX = Math.min(zero, end);
    const color = family.speedup >= 0 ? COLORS.positive : COLORS.negative;
    out.push(`<text x="${left - 18}" y="${y + 22}" text-anchor="end" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="700" fill="${COLORS.ink}">${esc(family.label)}</text>`);
    out.push(`<rect x="${barX}" y="${y + 5}" width="${Math.max(2, Math.abs(end - zero))}" height="24" rx="3" fill="${color}" fill-opacity="0.9"/>`);
    out.push(`<text x="${family.speedup >= 0 ? end + 9 : end - 9}" y="${y + 22}" text-anchor="${family.speedup >= 0 ? "start" : "end"}" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="700" fill="${color}">${family.speedup >= 0 ? "+" : ""}${family.speedup.toFixed(1)}%</text>`);
    out.push(`<text x="${width - right + 25}" y="${y + 22}" font-family="Inter,Arial,sans-serif" font-size="12" fill="${COLORS.muted}">${family.wins}/${family.rows.length} ops faster</text>`);
  });
  out.push(`<text x="${width / 2}" y="${height - 25}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" fill="${COLORS.muted}">Right of zero favors SIMD · A geometric mean prevents a few very fast operations from dominating the summary</text>`);
  out.push("</svg>");
  fs.writeFileSync(path.join(CHARTS, "chart-speedup-v8.svg"), `${out.join("\n")}\n`);
}

function writeTable(): void {
  const out = [
    "# V8 SIMD/SWAR overview",
    "",
    "Geometric means summarize each checked-in same-width benchmark table. Each operation receives equal weight; absolute throughput is not compared across families with different operation sets.",
    "",
    "| family | operations | SWAR Mops/s | SIMD Mops/s | geo-mean speedup | median speedup | SIMD wins | best SIMD delta | worst SIMD delta |",
    "|---|---:|---:|---:|---:|---:|---:|---:|---:|",
  ];
  for (const family of families) {
    out.push(`| ${family.label} | ${family.rows.length} | ${family.swar.toFixed(1)} | ${family.simd.toFixed(1)} | ${family.speedup >= 0 ? "+" : ""}${family.speedup.toFixed(1)}% | ${family.median >= 0 ? "+" : ""}${family.median.toFixed(1)}% | ${family.wins}/${family.rows.length} | \`${family.best.op}\` (${pct(family.best) >= 0 ? "+" : ""}${pct(family.best).toFixed(1)}%) | \`${family.worst.op}\` (${pct(family.worst) >= 0 ? "+" : ""}${pct(family.worst).toFixed(1)}%) |`);
  }
  out.push("", "Sources: the corresponding `charts/chart-*-swar-v-*-simd.md` tables. Regenerate those benchmarks before publishing a new overview.", "");
  fs.writeFileSync(path.join(CHARTS, "chart-overview-v8.md"), out.join("\n"));
}

fs.mkdirSync(CHARTS, { recursive: true });
writeThroughputChart();
writeSpeedupChart();
writeTable();
console.log("Wrote charts/chart-overview-v8.{svg,md}");
console.log("Wrote charts/chart-speedup-v8.svg");
