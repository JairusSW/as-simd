import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chartSubtitle } from "./chart-meta";

type Key = "avx2_ymm" | "paired_v128" | "swar_i64";
type Input = {
  runtime: string;
  cpu: string;
  rounds: number;
  benchmark: string;
  unit: string;
  samples: Record<Key, number[]>;
};
type Row = {
  key: Key;
  label: string;
  detail: string;
  color: string;
  mean: number;
  min: number;
  max: number;
  throughput: number;
  speedup: number;
};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = path.join(root, "build/bench/wago-v256.json");
if (!fs.existsSync(inputPath))
  throw new Error("No Wago v256 benchmark JSON; run `npm run bench:wago-v256`");
const input = JSON.parse(fs.readFileSync(inputPath, "utf8")) as Input;
const definitions: Array<[Key, string, string, string]> = [
  ["avx2_ymm", "AVX2 / YMM", "plugin native lowering", "#2B9EB3"],
  ["paired_v128", "paired v128", "SIMD-backed fallback", "#6B7FD7"],
  ["swar_i64", "SWAR / i64", "portable scalar fallback", "#44AF69"],
];
const average = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const nativeMean = average(input.samples.avx2_ymm);
const rows: Row[] = definitions.map(([key, label, detail, color]) => {
  const samples = input.samples[key],
    mean = average(samples);
  return {
    key,
    label,
    detail,
    color,
    mean,
    min: Math.min(...samples),
    max: Math.max(...samples),
    throughput: 1000 / mean,
    speedup: mean / nativeMean,
  };
});

const outDir = path.join(root, "charts");
fs.mkdirSync(outDir, { recursive: true });
const esc = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const width = 1180,
  height = 470,
  left = 245,
  right = 180,
  top = 170,
  rowH = 78,
  plotW = width - left - right;
const maxThroughput =
  Math.ceil(Math.max(...rows.map((r) => r.throughput)) / 1000) * 1000;
const x = (value: number) => left + (value / maxThroughput) * plotW;
const svg: string[] = [];
svg.push(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
);
svg.push(`<rect width="${width}" height="${height}" fill="transparent"/>`);
svg.push(
  `<text x="${width / 2}" y="42" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="25" font-weight="700" fill="#374151">Native v256 byte-add throughput</text>`,
);
svg.push(
  `<text x="${width / 2}" y="70" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="600" fill="#6b7280">${esc(chartSubtitle(root))}</text>`,
);
svg.push(
  `<text x="${width / 2}" y="96" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="13" fill="#6b7280">${esc(input.runtime)} · ${esc(input.cpu)} · ${input.rounds} rounds · ${esc(input.benchmark)}</text>`,
);
svg.push(
  `<text x="${left}" y="126" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="600" fill="#374151">Million 32-byte operations/s — higher is better</text>`,
);
for (let tick = 0; tick <= 5; tick++) {
  const value = (maxThroughput * tick) / 5,
    tx = x(value);
  svg.push(
    `<line x1="${tx}" y1="${top - 20}" x2="${tx}" y2="${top + rows.length * rowH - 20}" stroke="#d1d5db" opacity="0.7"/>`,
  );
  svg.push(
    `<text x="${tx}" y="${top - 28}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" fill="#6b7280">${Math.round(value).toLocaleString()}</text>`,
  );
}
rows.forEach((row, i) => {
  const y = top + i * rowH;
  svg.push(
    `<text x="${left - 18}" y="${y + 9}" text-anchor="end" font-family="Inter,Arial,sans-serif" font-size="15" font-weight="700" fill="#374151">${row.label}</text>`,
  );
  svg.push(
    `<text x="${left - 18}" y="${y + 29}" text-anchor="end" font-family="Inter,Arial,sans-serif" font-size="12" fill="#6b7280">${row.detail}</text>`,
  );
  svg.push(
    `<rect x="${left}" y="${y - 8}" width="${Math.max(1, x(row.throughput) - left)}" height="30" rx="3" fill="${row.color}"/>`,
  );
  svg.push(
    `<text x="${Math.min(x(row.throughput) + 10, width - right + 10)}" y="${y + 12}" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="700" fill="#374151">${row.throughput.toFixed(0)} M/s</text>`,
  );
  svg.push(
    `<text x="${width - 22}" y="${y + 9}" text-anchor="end" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="700" fill="${row.color}">${row.speedup.toFixed(2)}× native time</text>`,
  );
  svg.push(
    `<text x="${width - 22}" y="${y + 29}" text-anchor="end" font-family="Inter,Arial,sans-serif" font-size="12" fill="#6b7280">${row.mean.toFixed(3)} ns/op · ${row.min.toFixed(3)}–${row.max.toFixed(3)}</text>`,
  );
});
svg.push(
  `<text x="${left}" y="${height - 22}" font-family="Inter,Arial,sans-serif" font-size="12" fill="#6b7280">Bars show mean throughput; labels include min–max timing across measured rounds. Zero allocations in every mode.</text>`,
);
svg.push(`</svg>`);
fs.writeFileSync(
  path.join(outDir, "chart-wago-v256.svg"),
  svg.join("\n") + "\n",
);

const md = [
  "# Native v256 byte-add throughput",
  "",
  `${input.runtime}; ${input.cpu}; ${input.rounds} rounds; ${input.benchmark}.`,
  "",
  "| implementation | mean ns/32B-op | min–max | million ops/s | relative native time |",
  "|---|---:|---:|---:|---:|",
  ...rows.map(
    (r) =>
      `| ${r.label} | ${r.mean.toFixed(3)} | ${r.min.toFixed(3)}–${r.max.toFixed(3)} | ${r.throughput.toFixed(0)} | ${r.speedup.toFixed(2)}× |`,
  ),
  "",
];
fs.writeFileSync(path.join(outDir, "chart-wago-v256.md"), md.join("\n"));
console.log("Wrote charts/chart-wago-v256.{svg,md}");
