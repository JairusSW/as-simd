import { chartSubtitle } from "./chart-meta";
import { createComparisonChart, projectRootFrom, type ChartVariant } from "./chart-lib";

const ROOT = projectRootFrom(import.meta.url);

const ORDER = [
  "splat", "load", "store", "load-partial", "store-partial", "extract-lane-s", "extract-lane-u",
  "replace-lane", "add", "sub", "mul", "min-s", "min-u", "max-s", "max-u", "avgr-u", "abs", "neg",
  "add-sat-s", "add-sat-u", "sub-sat-s", "sub-sat-u", "shl", "shr-s", "shr-u", "all-true", "bitmask",
  "popcnt", "eq", "ne", "lt-s", "lt-u", "le-s", "le-u", "gt-s", "gt-u", "ge-s", "ge-u",
  "narrow-i16x8-s", "narrow-i16x8-u", "shuffle", "swizzle", "relaxed-swizzle", "relaxed-laneselect",
];

const VARIANTS: [ChartVariant, ChartVariant, ChartVariant, ChartVariant] = [
  { key: "i8x16-swar-v8", color: "rgb(99,102,241)", runtime: "v8", mode: "swar", suite: "i8x16" },
  { key: "i8x16-swar-wavm", color: "rgb(34,197,94)", runtime: "wavm", mode: "swar", suite: "i8x16" },
  { key: "i8x16-simd-v8", color: "rgb(234,220,90)", runtime: "v8", mode: "simd", suite: "i8x16" },
  { key: "i8x16-simd-wavm", color: "rgb(239,68,68)", runtime: "wavm", mode: "simd", suite: "i8x16" },
];

createComparisonChart({
  root: ROOT,
  id: "i8x16-swar-v-i8x16-simd",
  title: "i8x16 SWAR vs SIMD",
  subtitle: chartSubtitle(ROOT),
  order: ORDER,
  variants: VARIANTS,
  layout: { leftW: 220, rightW: 560 },
  missingRowsMessage: "No benchmark JSONs found for i8x16/i8x16 in build/logs/as",
});
