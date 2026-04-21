import { chartSubtitle } from "./chart-meta";
import { createComparisonChart, projectRootFrom, type ChartVariant } from "./chart-lib";

const ROOT = projectRootFrom(import.meta.url);

const ORDER: string[] = ["ctor", "splat", "load", "store", "load-partial", "store-partial", "extract-lane-s", "extract-lane-u", "replace-lane", "add", "sub", "mul", "min-s", "min-u", "max-s", "max-u", "avgr-u", "abs", "neg", "add-sat-s", "add-sat-u", "sub-sat-s", "sub-sat-u", "shl", "shr-s", "shr-u", "all-true", "bitmask", "eq", "ne", "lt-s", "lt-u", "le-s", "le-u", "gt-s", "gt-u", "ge-s", "ge-u", "narrow-i32x2-s", "narrow-i32x2-u", "extend-low-i8x8-s", "extend-low-i8x8-u", "extend-high-i8x8-s", "extend-high-i8x8-u", "extadd-pairwise-i8x8-s", "extadd-pairwise-i8x8-u", "q15mulr-sat-s", "extmul-low-i8x8-s", "extmul-low-i8x8-u", "extmul-high-i8x8-s", "extmul-high-i8x8-u", "shuffle", "relaxed-laneselect", "relaxed-q15mulr-s", "relaxed-dot-i8x8-i7x8-s"];

const VARIANTS: [ChartVariant, ChartVariant, ChartVariant, ChartVariant] = [
  { key: "swar-v8", color: "rgb(99,102,241)", mode: "swar", runtime: "v8", suite: "i16x4" },
  { key: "swar-wavm", color: "rgb(34,197,94)", mode: "swar", runtime: "wavm", suite: "i16x4" },
  { key: "simd-v8", color: "rgb(234,220,90)", mode: "simd", runtime: "v8", suite: "i16x4" },
  { key: "simd-wavm", color: "rgb(239,68,68)", mode: "simd", runtime: "wavm", suite: "i16x4" },
];

createComparisonChart({
  root: ROOT,
  id: "i16x4-swar-v-i16x4-simd",
  title: "i16x4 SWAR vs SIMD",
  subtitle: chartSubtitle(ROOT),
  order: ORDER,
  variants: VARIANTS,
  layout: { leftW: 230, rightW: 430 },
  missingRowsMessage: "No benchmark JSONs found for i16x4 in build/logs/as/{swar,simd}",
});
