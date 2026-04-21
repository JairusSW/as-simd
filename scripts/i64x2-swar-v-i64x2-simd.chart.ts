import { chartSubtitle } from "./chart-meta";
import { createComparisonChart, projectRootFrom, type ChartVariant } from "./chart-lib";

const ROOT = projectRootFrom(import.meta.url);

const ORDER = [
  "splat", "load", "store", "load-partial", "store-partial", "extract-lane", "replace-lane",
  "add", "sub", "mul", "abs", "neg", "shl", "shr-s", "shr-u", "all-true", "bitmask",
  "eq", "ne", "lt-s", "le-s", "gt-s", "ge-s",
  "extend-low-i32x4-s", "extend-low-i32x4-u", "extend-high-i32x4-s", "extend-high-i32x4-u",
  "extmul-low-i32x4-s", "extmul-low-i32x4-u", "extmul-high-i32x4-s", "extmul-high-i32x4-u",
  "shuffle", "relaxed-laneselect",
];

const VARIANTS: [ChartVariant, ChartVariant, ChartVariant, ChartVariant] = [
  { key: "i64x2-swar-v8", color: "rgb(99,102,241)", runtime: "v8", mode: "swar", suite: "i64x2" },
  { key: "i64x2-swar-wavm", color: "rgb(34,197,94)", runtime: "wavm", mode: "swar", suite: "i64x2" },
  { key: "i64x2-simd-v8", color: "rgb(234,220,90)", runtime: "v8", mode: "simd", suite: "i64x2" },
  { key: "i64x2-simd-wavm", color: "rgb(239,68,68)", runtime: "wavm", mode: "simd", suite: "i64x2" },
];

createComparisonChart({
  root: ROOT,
  id: "i64x2-swar-v-i64x2-simd",
  title: "i64x2 SWAR vs SIMD",
  subtitle: chartSubtitle(ROOT),
  order: ORDER,
  variants: VARIANTS,
  layout: { leftW: 220, rightW: 560 },
  missingRowsMessage: "No benchmark JSONs found for i64x2/i64x2 in build/logs/as",
});
