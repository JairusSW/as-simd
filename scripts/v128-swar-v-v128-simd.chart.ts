import { chartSubtitle } from "./chart-meta";
import { createComparisonChart, projectRootFrom, type ChartVariant } from "./chart-lib";

const ROOT = projectRootFrom(import.meta.url);

const ORDER = [
  "splat",
  "extract-lane",
  "replace-lane",
  "shuffle-i8",
  "shuffle-i16",
  "shuffle-i32",
  "shuffle-i64",
  "swizzle",
  "load",
  "store",
  "add-i8",
  "sub-i8",
  "mul-i8",
  "min-i16",
  "max-i16",
  "eq-i8",
  "bitmask-i8",
  "popcnt-i8",
];

const VARIANTS: [ChartVariant, ChartVariant, ChartVariant, ChartVariant] = [
  { key: "v128-swar-v8", color: "rgb(99,102,241)", runtime: "v8", mode: "swar", suite: "v128" },
  { key: "v128-swar-wavm", color: "rgb(34,197,94)", runtime: "wavm", mode: "swar", suite: "v128" },
  { key: "v128-simd-v8", color: "rgb(234,220,90)", runtime: "v8", mode: "simd", suite: "v128" },
  { key: "v128-simd-wavm", color: "rgb(239,68,68)", runtime: "wavm", mode: "simd", suite: "v128" },
];

createComparisonChart({
  root: ROOT,
  id: "v128-swar-v-v128-simd",
  title: "v128 SWAR vs SIMD",
  subtitle: chartSubtitle(ROOT),
  order: ORDER,
  variants: VARIANTS,
  layout: { leftW: 150, rightW: 560 },
  missingRowsMessage: "No benchmark JSONs found for v128/v128 in build/logs/as",
});
