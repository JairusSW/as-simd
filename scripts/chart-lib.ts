import fs from "node:fs";
import path from "node:path";

export type Runtime = "v8" | "wavm";
export type Mode = "swar" | "simd";

export type BenchResult = {
  elapsed: number;
  operations: number;
};

export type ChartVariant = {
  key: string;
  color: string;
  runtime: Runtime;
  mode: Mode;
  suite: string;
  label?: string;
};

export type ChartLayout = {
  rowH: number;
  headerH: number;
  leftW: number;
  barW: number;
  rightW: number;
  barMargin: number;
  colGap: number;
};

export type ComparisonChartConfig = {
  root: string;
  id: string;
  title: string;
  subtitle: string;
  order: string[];
  variants: [ChartVariant, ChartVariant, ChartVariant, ChartVariant];
  aliasesByVariantKey?: Record<string, Record<string, string>>;
  overlapGroups?: [number[], number[]];
  deltaLabel?: string;
  missingRowsMessage?: string;
  layout?: Partial<ChartLayout>;
};

type RowValue = { ok: boolean; ops: number };
type Row = { op: string; values: [RowValue, RowValue, RowValue, RowValue]; dV8: number | null };

const DEFAULT_LAYOUT: ChartLayout = {
  rowH: 40,
  headerH: 86,
  leftW: 220,
  barW: 560,
  rightW: 560,
  barMargin: 48,
  colGap: 84,
};

function opsPerSec(r: BenchResult): number {
  return (r.operations * 1000) / r.elapsed;
}

function pctDelta(base: number, candidate: number): number {
  return ((candidate - base) / base) * 100;
}

function fmt(n: number, digits = 1): string {
  return Number.isFinite(n) ? n.toFixed(digits) : "n/a";
}

function fmtMops(n: number): string {
  return `${fmt(n)}M`;
}

function esc(s: string): string {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function loadSuite(logsDir: string, mode: Mode, suite: string, runtime: Runtime): Record<string, BenchResult> {
  const dir = path.join(logsDir, mode);
  if (!fs.existsSync(dir)) return {};

  const out: Record<string, BenchResult> = {};
  for (const file of fs.readdirSync(dir)) {
    if (!file.startsWith(`${suite}.`) || !file.endsWith(`.${runtime}.json`)) continue;
    const key = file.slice(suite.length + 1, -(`.${runtime}.json`.length));
    out[key] = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  }
  return out;
}

function variantLabel(v: ChartVariant): string {
  return v.label ?? `${v.runtime} ${v.mode}`;
}

function hasAny(values: RowValue[], indices: number[]): boolean {
  return indices.some((i) => values[i]?.ok);
}

export function projectRootFrom(importMetaUrl: string): string {
  return path.resolve(path.dirname(new URL(importMetaUrl).pathname), "..");
}

export function createComparisonChart(config: ComparisonChartConfig): void {
  const logsDir = path.join(config.root, "build", "logs", "as");
  const chartsDir = path.join(config.root, "charts");
  const mdOut = path.join(chartsDir, `chart-${config.id}.md`);
  const svgOut = path.join(chartsDir, `chart-${config.id}.svg`);
  const layout = { ...DEFAULT_LAYOUT, ...config.layout };

  const loaded = Object.fromEntries(
    config.variants.map((v) => [v.key, loadSuite(logsDir, v.mode, v.suite, v.runtime)]),
  ) as Record<string, Record<string, BenchResult>>;

  const seen = new Set(config.order);
  const extras = new Set<string>();
  for (const v of config.variants) {
    for (const op of Object.keys(loaded[v.key])) {
      if (!seen.has(op)) extras.add(op);
    }
  }

  const orderedOps = config.order.concat([...extras].sort((a, b) => a.localeCompare(b)));
  const rank = new Map<string, number>();
  config.order.forEach((name, i) => rank.set(name, i));

  const overlapGroups = config.overlapGroups ?? [[0, 1], [2, 3]];
  const rows = orderedOps
    .map((op) => {
      const values = config.variants.map((v) => {
        const set = loaded[v.key];
        const aliases = config.aliasesByVariantKey?.[v.key] ?? null;
        const aliasOp = aliases ? aliases[op] : undefined;
        const raw = set[op] || (aliasOp ? set[aliasOp] : undefined) || null;
        return { ok: !!raw, ops: raw ? opsPerSec(raw) / 1_000_000 : 0 };
      }) as [RowValue, RowValue, RowValue, RowValue];

      const leftPresent = hasAny(values, overlapGroups[0]);
      const rightPresent = hasAny(values, overlapGroups[1]);
      if (!leftPresent || !rightPresent) return null;

      const dV8 = values[0].ok && values[2].ok ? pctDelta(values[0].ops, values[2].ops) : null;
      return { op, values, dV8 } satisfies Row;
    })
    .filter((x): x is Row => x != null)
    .sort((a, b) => {
      const ra = rank.get(a.op);
      const rb = rank.get(b.op);
      if (ra != null && rb != null) return ra - rb;
      if (ra != null) return -1;
      if (rb != null) return 1;
      return a.op.localeCompare(b.op);
    });

  if (!rows.length) {
    console.error(config.missingRowsMessage ?? `No overlapping benchmark methods found for ${config.id} in build/logs/as`);
    process.exit(1);
  }

  fs.mkdirSync(chartsDir, { recursive: true });

  const md: string[] = [];
  md.push(`# ${config.title}`);
  md.push("");
  md.push(`| op | ${variantLabel(config.variants[0])} | ${variantLabel(config.variants[1])} | ${variantLabel(config.variants[2])} | ${variantLabel(config.variants[3])} | ${config.deltaLabel ?? "simd-v8 vs swar-v8"} |`);
  md.push("|---|---:|---:|---:|---:|---:|");
  for (const r of rows) {
    const delta = r.dV8 == null ? "—" : `${fmt(r.dV8)}%`;
    md.push(`| \`${r.op}\` | ${r.values[0].ok ? fmt(r.values[0].ops) : "—"} | ${r.values[1].ok ? fmt(r.values[1].ops) : "—"} | ${r.values[2].ok ? fmt(r.values[2].ops) : "—"} | ${r.values[3].ok ? fmt(r.values[3].ops) : "—"} | ${delta} |`);
  }
  fs.writeFileSync(mdOut, `${md.join("\n")}\n`);

  const maxVal = Math.max(1, ...rows.flatMap((r) => r.values.map((v) => v.ops)));
  const width = layout.leftW + layout.barW + layout.rightW;
  const height = layout.headerH + rows.length * layout.rowH + 20;

  const svg: string[] = [];
  svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
  svg.push(`<rect x="0" y="0" width="${width}" height="${height}" fill="transparent"/>`);
  svg.push(`<text x="${Math.round(width / 2)}" y="44" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="600" fill="#111827">${esc(config.title)}</text>`);
  svg.push(`<text x="${Math.round(width / 2)}" y="64" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="500" fill="#666666">${esc(config.subtitle)}</text>`);

  const summaryX = layout.leftW + layout.barW + layout.barMargin;
  const summaryHeaderY = layout.headerH + 3;
  const summaryHeader = config.variants
    .map((v, j) => `<tspan x="${summaryX + j * layout.colGap}" fill="#374151">${esc(variantLabel(v))}</tspan>`)
    .join("");
  svg.push(`<text y="${summaryHeaderY}" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600">${summaryHeader}</text>`);

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const y = layout.headerH + i * layout.rowH;
    svg.push(`<text x="${layout.leftW - layout.barMargin}" y="${y + 21}" text-anchor="end" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600" fill="#111827">${esc(r.op)}</text>`);

    for (let j = 0; j < config.variants.length; j++) {
      if (!r.values[j].ok) continue;
      const w = Math.max(1, Math.round((r.values[j].ops / maxVal) * layout.barW));
      svg.push(`<rect x="${layout.leftW}" y="${y + 2 + j * 7}" width="${w}" height="6" fill="${config.variants[j].color}" opacity="0.95" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1"/>`);
    }

    const summary = config.variants
      .map((v, j) => {
        const x = summaryX + j * layout.colGap;
        return `<tspan x="${x}" fill="${v.color}">■</tspan><tspan x="${x + 14}" fill="#374151">${fmtMops(r.values[j].ops)}</tspan>`;
      })
      .join("");
    svg.push(`<text y="${y + 21}" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600">${summary}</text>`);
  }

  svg.push("</svg>");
  fs.writeFileSync(svgOut, `${svg.join("\n")}\n`);

  console.log(`Wrote markdown table: ${path.relative(config.root, mdOut)}`);
  console.log(`Wrote svg chart:      ${path.relative(config.root, svgOut)}`);
}
