import { chartSubtitle } from "./chart-meta";
import { createComparisonChart, projectRootFrom, type ChartVariant } from "./chart-lib";

const ROOT = projectRootFrom(import.meta.url);

const ORDER = [
  "splat", "load", "store", "load-partial", "store-partial", "extract-lane", "replace-lane",
  "add", "sub", "mul", "min-s", "min-u", "max-s", "max-u", "dot-i16x8-s", "abs", "neg",
  "shl", "shr-s", "shr-u", "all-true", "bitmask", "eq", "ne", "lt-s", "lt-u", "le-s", "le-u",
  "gt-s", "gt-u", "ge-s", "ge-u", "extend-low-i16x8-s", "extend-low-i16x8-u",
  "extend-high-i16x8-s", "extend-high-i16x8-u", "extadd-pairwise-i16x8-s",
  "extadd-pairwise-i16x8-u", "extmul-low-i16x8-s", "extmul-low-i16x8-u",
  "extmul-high-i16x8-s", "extmul-high-i16x8-u", "shuffle", "relaxed-trunc-f32x4-s",
  "relaxed-trunc-f32x4-u", "relaxed-laneselect",
];

const VARIANTS: [ChartVariant, ChartVariant, ChartVariant, ChartVariant] = [
  { key: "i32x4-swar-v8", color: "rgb(99,102,241)", runtime: "v8", mode: "swar", suite: "i32x4" },
  { key: "i32x4-swar-wavm", color: "rgb(34,197,94)", runtime: "wavm", mode: "swar", suite: "i32x4" },
  { key: "i32x4-simd-v8", color: "rgb(234,220,90)", runtime: "v8", mode: "simd", suite: "i32x4" },
  { key: "i32x4-simd-wavm", color: "rgb(239,68,68)", runtime: "wavm", mode: "simd", suite: "i32x4" },
];

createComparisonChart({
  root: ROOT,
  id: "i32x4-swar-v-i32x4-simd",
  title: "i32x4 SWAR vs SIMD",
  subtitle: chartSubtitle(ROOT),
  order: ORDER,
  variants: VARIANTS,
  layout: { leftW: 220, rightW: 560 },
  missingRowsMessage: "No benchmark JSONs found for i32x4/i32x4 in build/logs/as",
});
