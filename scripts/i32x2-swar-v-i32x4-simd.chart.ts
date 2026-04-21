import { chartSubtitle } from "./chart-meta";
import { createComparisonChart, projectRootFrom, type ChartVariant } from "./chart-lib";

const ROOT = projectRootFrom(import.meta.url);

const ORDER: string[] = ["splat", "load", "store", "load-partial", "store-partial", "extract-lane", "replace-lane", "add", "sub", "mul", "min-s", "min-u", "max-s", "max-u", "dot-i16x8-s", "abs", "neg", "shl", "shr-s", "shr-u", "all-true", "bitmask", "eq", "ne", "lt-s", "lt-u", "le-s", "le-u", "gt-s", "gt-u", "ge-s", "ge-u", "extend-low-i16x8-s", "extend-low-i16x8-u", "extend-high-i16x8-s", "extend-high-i16x8-u", "extadd-pairwise-i16x8-s", "extadd-pairwise-i16x8-u", "extmul-low-i16x8-s", "extmul-low-i16x8-u", "extmul-high-i16x8-s", "extmul-high-i16x8-u", "shuffle", "relaxed-laneselect"];

const VARIANTS: [ChartVariant, ChartVariant, ChartVariant, ChartVariant] = [
  { key: "i32x2-swar-v8", color: "rgb(99,102,241)", runtime: "v8", mode: "swar", suite: "i32x2" },
  { key: "i32x2-swar-llvm", color: "rgb(34,197,94)", runtime: "wavm", mode: "swar", suite: "i32x2" },
  { key: "i32x4-simd-v8", color: "rgb(234,220,90)", runtime: "v8", mode: "simd", suite: "i32x4" },
  { key: "i32x4-simd-llvm", color: "rgb(239,68,68)", runtime: "wavm", mode: "simd", suite: "i32x4" },
];

const aliasesByVariantKey = {
  "i32x2-swar-v8": {
    "dot-i16x8-s": "dot-i16x4-s",
    "extend-low-i16x8-s": "extend-low-i16x4-s",
    "extend-low-i16x8-u": "extend-low-i16x4-u",
    "extend-high-i16x8-s": "extend-high-i16x4-s",
    "extend-high-i16x8-u": "extend-high-i16x4-u",
    "extadd-pairwise-i16x8-s": "extadd-pairwise-i16x4-s",
    "extadd-pairwise-i16x8-u": "extadd-pairwise-i16x4-u",
    "extmul-low-i16x8-s": "extmul-low-i16x4-s",
    "extmul-low-i16x8-u": "extmul-low-i16x4-u",
    "extmul-high-i16x8-s": "extmul-high-i16x4-s",
    "extmul-high-i16x8-u": "extmul-high-i16x4-u",
  },
  "i32x2-swar-llvm": {
    "dot-i16x8-s": "dot-i16x4-s",
    "extend-low-i16x8-s": "extend-low-i16x4-s",
    "extend-low-i16x8-u": "extend-low-i16x4-u",
    "extend-high-i16x8-s": "extend-high-i16x4-s",
    "extend-high-i16x8-u": "extend-high-i16x4-u",
    "extadd-pairwise-i16x8-s": "extadd-pairwise-i16x4-s",
    "extadd-pairwise-i16x8-u": "extadd-pairwise-i16x4-u",
    "extmul-low-i16x8-s": "extmul-low-i16x4-s",
    "extmul-low-i16x8-u": "extmul-low-i16x4-u",
    "extmul-high-i16x8-s": "extmul-high-i16x4-s",
    "extmul-high-i16x8-u": "extmul-high-i16x4-u",
  },
};

createComparisonChart({
  root: ROOT,
  id: "i32x2-swar-v-i32x4-simd",
  title: "i32x2 SWAR vs i32x4 SIMD",
  subtitle: chartSubtitle(ROOT),
  order: ORDER,
  variants: VARIANTS,
  aliasesByVariantKey,
  layout: { leftW: 220, rightW: 540 },
  missingRowsMessage: "No benchmark JSONs found for i32x2/i32x4 in build/logs/as",
});
