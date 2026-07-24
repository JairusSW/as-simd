import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chartSubtitle } from "./chart-meta";

type Row = {
  width: number;
  legacy: number;
  dedicated: number;
  speedup: number;
};
type Input = { runtime: string; cpu: string; rounds: number; results: Row[] };
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = JSON.parse(
  fs.readFileSync(path.join(root, "build/bench/wide-values-v8.json"), "utf8"),
) as Input;
const output = path.join(root, "charts");
fs.mkdirSync(output, { recursive: true });
const C = {
  old: "#6b7280",
  now: "#2B9EB3",
  ink: "#374151",
  muted: "#6b7280",
  grid: "#d1d5db",
} as const;
const esc = (s: string): string =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const width = 1100,
  height = 330,
  left = 180,
  right = 135,
  top = 145,
  rowH = 72,
  plotW = width - left - right;
const max = Math.ceil(
    Math.max(...input.results.flatMap((r) => [r.legacy, r.dedicated])) * 1.15,
  ),
  x = (n: number): number => left + (n / max) * plotW;
const out: string[] = [];
out.push(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
  `<rect width="${width}" height="${height}" fill="transparent"/>`,
);
out.push(
  `<text x="${width / 2}" y="40" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="25" font-weight="700" fill="${C.ink}">Dedicated Wide-Value Throughput on V8</text>`,
);
out.push(
  `<text x="${width / 2}" y="66" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="600" fill="${C.muted}">${esc(chartSubtitle(root))}</text>`,
);
out.push(
  `<text x="${width / 2}" y="90" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" fill="${C.muted}">${esc(input.runtime)} · ${esc(input.cpu)} · median of ${input.rounds} rounds</text>`,
);
out.push(
  `<rect x="${width / 2 - 155}" y="108" width="13" height="13" rx="2" fill="${C.old}"/><text x="${width / 2 - 135}" y="119" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="600" fill="${C.ink}">nested compatibility</text>`,
);
out.push(
  `<rect x="${width / 2 + 45}" y="108" width="13" height="13" rx="2" fill="${C.now}"/><text x="${width / 2 + 65}" y="119" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="600" fill="${C.ink}">dedicated raw-width</text>`,
);
for (let tick = 0; tick <= 4; tick++) {
  const value = (max * tick) / 4,
    tx = x(value);
  out.push(
    `<line x1="${tx}" y1="${top - 8}" x2="${tx}" y2="${top + input.results.length * rowH}" stroke="${C.grid}" opacity="0.65"/>`,
    `<text x="${tx}" y="${top - 15}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" fill="${C.muted}">${value.toFixed(1)}</text>`,
  );
}
input.results.forEach((r, i) => {
  const y = top + i * rowH;
  out.push(
    `<text x="${left - 18}" y="${y + 35}" text-anchor="end" font-family="Inter,Arial,sans-serif" font-size="16" font-weight="700" fill="${C.ink}">v${r.width}</text>`,
    `<rect x="${left}" y="${y + 8}" width="${x(r.legacy) - left}" height="18" rx="2" fill="${C.old}"/>`,
    `<rect x="${left}" y="${y + 31}" width="${x(r.dedicated) - left}" height="18" rx="2" fill="${C.now}"/>`,
    `<text x="${width - right + 15}" y="${y + 37}" font-family="Inter,Arial,sans-serif" font-size="15" font-weight="700" fill="${C.ink}">${r.speedup.toFixed(2)}×</text>`,
  );
});
out.push(
  `<text x="${left + plotW / 2}" y="${height - 18}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="700" fill="${C.ink}">Million immutable expression chains/s — higher is better</text>`,
  `</svg>`,
);
fs.writeFileSync(
  path.join(output, "chart-wide-values-v8.svg"),
  out.join("\n") + "\n",
);
const md = [
  "# Dedicated wide-value throughput on V8",
  "",
  `Runtime: ${input.runtime}; ${input.cpu}; median of ${input.rounds} rounds.`,
  "",
  "| width | nested Mops/s | dedicated Mops/s | speedup |",
  "|---|---:|---:|---:|",
  ...input.results.map(
    (r) =>
      `| v${r.width} | ${r.legacy.toFixed(2)} | ${r.dedicated.toFixed(2)} | ${r.speedup.toFixed(2)}× |`,
  ),
  "",
];
fs.writeFileSync(path.join(output, "chart-wide-values-v8.md"), md.join("\n"));
console.log("Wrote charts/chart-wide-values-v8.{svg,md}");
