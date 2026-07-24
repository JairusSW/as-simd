import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chartSubtitle } from "./chart-meta";

type Row = { operation: string; swar: number; simd: number; speedup: number };
type Input = { runtime: string; cpu: string; rounds: number; results: Row[] };
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = path.join(root, "build/bench/wide-v8.json");
if (!fs.existsSync(inputPath))
  throw new Error(
    "Run `npm run bench:wide` before building the register chart",
  );
const input = JSON.parse(fs.readFileSync(inputPath, "utf8")) as Input;
const rows = input.results.filter((r) => r.operation.startsWith("v128r."));
if (!rows.length) throw new Error("No v128r benchmark rows found");
const output = path.join(root, "charts");
fs.mkdirSync(output, { recursive: true });
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
  left = 245,
  right = 125,
  top = 145,
  rowH = 43,
  height = top + rows.length * rowH + 75,
  plotW = width - left - right;
const max = niceMax(Math.max(...rows.flatMap((r) => [r.swar, r.simd])) * 1.08),
  x = (n: number): number => left + (n / max) * plotW;
const out: string[] = [];
out.push(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">`,
);
out.push(
  `<title id="title">Register-backed v128 throughput on V8</title><desc id="desc">Strict SWAR and native SIMD throughput for each v128 register operation in millions of operations per second.</desc>`,
);
out.push(`<rect width="${width}" height="${height}" fill="transparent"/>`);
out.push(
  `<text x="${width / 2}" y="40" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="25" font-weight="700" fill="${C.ink}">Register-backed v128 Throughput on V8</text>`,
);
out.push(
  `<text x="${width / 2}" y="66" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="600" fill="${C.muted}">${esc(chartSubtitle(root))}</text>`,
);
out.push(
  `<text x="${width / 2}" y="90" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" fill="${C.muted}">${esc(input.runtime)} · ${esc(input.cpu)} · best of ${input.rounds} measured rounds</text>`,
);
out.push(
  `<rect x="520" y="108" width="13" height="13" rx="2" fill="${C.swar}"/><text x="540" y="119" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="600" fill="${C.ink}">strict SWAR</text>`,
);
out.push(
  `<rect x="665" y="108" width="13" height="13" rx="2" fill="${C.simd}"/><text x="685" y="119" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="600" fill="${C.ink}">native SIMD</text>`,
);
for (let i = 0; i <= 5; i++) {
  const value = (max * i) / 5,
    tx = x(value);
  out.push(
    `<line x1="${tx}" y1="137" x2="${tx}" y2="${height - 75}" stroke="${C.grid}" opacity="0.65"/><text x="${tx}" y="130" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" fill="${C.muted}">${Math.round(value)}</text>`,
  );
}
rows.forEach((r, i) => {
  const y = top + i * rowH,
    ratio = r.simd / r.swar,
    color = ratio >= 1 ? C.simd : C.swar;
  out.push(
    `<text x="${left - 16}" y="${y + 25}" text-anchor="end" font-family="Inter,Arial,sans-serif" font-size="14" font-weight="700" fill="${C.ink}">${esc(r.operation)}</text>`,
  );
  out.push(
    `<rect x="${left}" y="${y + 5}" width="${Math.max(1, x(r.swar) - left)}" height="12" rx="2" fill="${C.swar}"/><rect x="${left}" y="${y + 20}" width="${Math.max(1, x(r.simd) - left)}" height="12" rx="2" fill="${C.simd}"/>`,
  );
  out.push(
    `<text x="${width - right + 16}" y="${y + 25}" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="700" fill="${color}">${ratio.toFixed(2)}×</text>`,
  );
});
out.push(
  `<text x="${width / 2}" y="${height - 24}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="12" fill="${C.muted}">Million operations/s · higher is better · scalar dispatch is retained when vector-domain transitions lose</text></svg>`,
);
fs.writeFileSync(
  path.join(output, "chart-register-v8.svg"),
  out.join("\n") + "\n",
);
const md = [
  "# Register-backed v128 throughput on V8",
  "",
  `Runtime: ${input.runtime}; ${input.cpu}; best of ${input.rounds} measured rounds.`,
  "",
  "| operation | SWAR Mops/s | SIMD Mops/s | SIMD / SWAR |",
  "|---|---:|---:|---:|",
  ...rows.map(
    (r) =>
      `| \`${r.operation}\` | ${r.swar.toFixed(1)} | ${r.simd.toFixed(1)} | ${(r.simd / r.swar).toFixed(2)}× |`,
  ),
  "",
];
fs.writeFileSync(path.join(output, "chart-register-v8.md"), md.join("\n"));
console.log("Wrote charts/chart-register-v8.{svg,md}");
