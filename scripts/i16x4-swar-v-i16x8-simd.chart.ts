import { chartSubtitle } from "./chart-meta";
import { createComparisonChart, projectRootFrom, type ChartVariant } from "./chart-lib";

const ROOT = projectRootFrom(import.meta.url);

const ORDER: string[] = ["splat", "load", "store", "load-partial", "store-partial", "extract-lane-s", "extract-lane-u", "replace-lane", "add", "sub", "mul", "min-s", "min-u", "max-s", "max-u", "avgr-u", "abs", "neg", "add-sat-s", "add-sat-u", "sub-sat-s", "sub-sat-u", "shl", "shr-s", "shr-u", "all-true", "bitmask", "eq", "ne", "lt-s", "lt-u", "le-s", "le-u", "gt-s", "gt-u", "ge-s", "ge-u", "narrow-i32x4-s", "narrow-i32x4-u", "extend-low-i8x16-s", "extend-low-i8x16-u", "extend-high-i8x16-s", "extend-high-i8x16-u", "extadd-pairwise-i8x16-s", "extadd-pairwise-i8x16-u", "q15mulr-sat-s", "extmul-low-i8x16-s", "extmul-low-i8x16-u", "extmul-high-i8x16-s", "extmul-high-i8x16-u", "shuffle", "relaxed-laneselect", "relaxed-q15mulr-s", "relaxed-dot-i8x16-i7x16-s"];

const VARIANTS: [ChartVariant, ChartVariant, ChartVariant, ChartVariant] = [
  { key: "i16x4-swar-v8", color: "rgb(99,102,241)", runtime: "v8", mode: "swar", suite: "i16x4" },
  { key: "i16x4-swar-llvm", color: "rgb(34,197,94)", runtime: "wavm", mode: "swar", suite: "i16x4" },
  { key: "i16x8-simd-v8", color: "rgb(234,220,90)", runtime: "v8", mode: "simd", suite: "i16x8" },
  { key: "i16x8-simd-llvm", color: "rgb(239,68,68)", runtime: "wavm", mode: "simd", suite: "i16x8" },
];

createComparisonChart({
  root: ROOT,
  id: "i16x4-swar-v-i16x8-simd",
  title: "i16x4 SWAR vs i16x8 SIMD",
  subtitle: chartSubtitle(ROOT),
  order: ORDER,
  variants: VARIANTS,
  layout: { leftW: 220, rightW: 540 },
  missingRowsMessage: "No benchmark JSONs found for i16x4/i16x8 in build/logs/as",
});
