import { chartSubtitle } from "./chart-meta";
import { createComparisonChart, projectRootFrom, type ChartVariant } from "./chart-lib";

const ROOT = projectRootFrom(import.meta.url);

const ORDER = ["add-i8", "add-i16", "add-i32", "sub-i8", "sub-i16", "sub-i32", "mul-i8", "mul-i16", "mul-i32", "min-i16", "max-i16", "eq-i8", "bitmask-i8", "popcnt-i8"];

const VARIANTS: [ChartVariant, ChartVariant, ChartVariant, ChartVariant] = [
  { key: "v64-swar-v8", color: "rgb(99,102,241)", runtime: "v8", mode: "swar", suite: "v64" },
  { key: "v64-swar-llvm", color: "rgb(34,197,94)", runtime: "wavm", mode: "swar", suite: "v64" },
  { key: "v64-simd-v8", color: "rgb(234,220,90)", runtime: "v8", mode: "simd", suite: "v64" },
  { key: "v64-simd-llvm", color: "rgb(239,68,68)", runtime: "wavm", mode: "simd", suite: "v64" },
];

createComparisonChart({
  root: ROOT,
  id: "v64-swar-v-v64-simd",
  title: "v64 SWAR vs SIMD",
  subtitle: chartSubtitle(ROOT),
  order: ORDER,
  variants: VARIANTS,
  layout: { leftW: 150, rightW: 560 },
  missingRowsMessage: "No overlapping benchmark methods found for v64 (swar) and v64 (simd) in build/logs/as",
});
