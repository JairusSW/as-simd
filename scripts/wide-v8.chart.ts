import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chartSubtitle } from "./chart-meta";

type Row = { operation: string; swar: number; simd: number; speedup: number };
type Input = { runtime: string; cpu: string; rounds: number; results: Row[] };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = path.join(ROOT, "build/bench/wide-v8.json");
if (!fs.existsSync(inputPath))
  throw new Error("Run `npm run bench:wide` before building the wide chart");
const input = JSON.parse(fs.readFileSync(inputPath, "utf8")) as Input;
const rows = input.results.filter(
  (row) =>
    row.operation.startsWith("v256.") || row.operation.startsWith("v512."),
);
if (!rows.length)
  throw new Error("No dedicated v256/v512 benchmark rows found");
const outputDir = path.join(ROOT, "charts");
fs.mkdirSync(outputDir, { recursive: true });

const C = {
  swar: "#44AF69",
  simd: "#2B9EB3",
  ink: "#374151",
  muted: "#6b7280",
  grid: "#d1d5db",
} as const;
const esc = (s: string): string =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const niceMax = (n: number): number => {
  const m = 10 ** Math.floor(Math.log10(n));
  return Math.ceil(n / m) * m;
};

const width = 1280,
  left = 230,
  right = 125,
  top = 145,
  rowH = 43;
const height = top + rows.length * rowH + 75;
const plotW = width - left - right;
const max = niceMax(Math.max(...rows.flatMap((r) => [r.swar, r.simd])) * 1.08);
const x = (n: number): number => left + (n / max) * plotW;
const out: string[] = [];
out.push(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
);
out.push(`<rect width="${width}" height="${height}" fill="transparent"/>`);
out.push(
  `<text x="${width / 2}" y="40" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="25" font-weight="700" fill="${C.ink}">Dedicated Wide-Kernel Throughput on V8</text>`,
);
out.push(
  `<text x="${width / 2}" y="66" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="600" fill="${C.muted}">${esc(chartSubtitle(ROOT))}</text>`,
);
out.push(
  `<text x="${width / 2}" y="90" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" fill="${C.muted}">${esc(input.runtime)} · ${esc(input.cpu)} · best of ${input.rounds} measured rounds</text>`,
);
out.push(
  `<rect x="${width / 2 - 120}" y="108" width="13" height="13" rx="2" fill="${C.swar}"/><text x="${width / 2 - 100}" y="119" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="600" fill="${C.ink}">strict SWAR</text>`,
);
out.push(
  `<rect x="${width / 2 + 25}" y="108" width="13" height="13" rx="2" fill="${C.simd}"/><text x="${width / 2 + 45}" y="119" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="600" fill="${C.ink}">native SIMD</text>`,
);
for (let tick = 0; tick <= 5; tick++) {
  const value = (max * tick) / 5,
    tx = x(value);
  out.push(
    `<line x1="${tx}" y1="${top - 8}" x2="${tx}" y2="${top + rows.length * rowH}" stroke="${C.grid}" opacity="0.65"/>`,
  );
  out.push(
    `<text x="${tx}" y="${top - 15}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" fill="${C.muted}">${Math.round(value)}</text>`,
  );
}
rows.forEach((row, i) => {
  const y = top + i * rowH;
  out.push(
    `<text x="${left - 16}" y="${y + 25}" text-anchor="end" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="700" fill="${C.ink}">${esc(row.operation)}</text>`,
  );
  out.push(
    `<rect x="${left}" y="${y + 5}" width="${Math.max(1, x(row.swar) - left)}" height="12" rx="2" fill="${C.swar}"/>`,
  );
  out.push(
    `<rect x="${left}" y="${y + 20}" width="${Math.max(1, x(row.simd) - left)}" height="12" rx="2" fill="${C.simd}"/>`,
  );
  out.push(
    `<text x="${width - right + 16}" y="${y + 25}" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="700" fill="${row.speedup >= 1 ? C.simd : C.swar}">${row.speedup.toFixed(2)}×</text>`,
  );
});
out.push(
  `<text x="${left + plotW / 2}" y="${height - 25}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="700" fill="${C.ink}">Million vector operations/s — higher is better</text>`,
);
out.push("</svg>");
fs.writeFileSync(
  path.join(outputDir, "chart-wide-v8.svg"),
  out.join("\n") + "\n",
);

const md = [
  "# Dedicated wide-kernel throughput on V8",
  "",
  `Runtime: ${input.runtime}; ${input.cpu}; best of ${input.rounds} measured rounds.`,
  "",
  "| operation | SWAR Mvec/s | SIMD Mvec/s | SIMD / SWAR |",
  "|---|---:|---:|---:|",
  ...rows.map(
    (r) =>
      `| \`${r.operation}\` | ${r.swar.toFixed(1)} | ${r.simd.toFixed(1)} | ${r.speedup.toFixed(2)}× |`,
  ),
  "",
];
fs.writeFileSync(path.join(outputDir, "chart-wide-v8.md"), md.join("\n"));
console.log("Wrote charts/chart-wide-v8.{svg,md}");
