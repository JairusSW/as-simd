import { chartSubtitle } from "./chart-meta";
import { createComparisonChart, projectRootFrom, type ChartVariant } from "./chart-lib";

const ROOT = projectRootFrom(import.meta.url);

const ORDER: string[] = ["splat", "load", "store", "load-partial", "store-partial", "extract-lane-s", "extract-lane-u", "replace-lane", "add", "sub", "min-s", "min-u", "max-s", "max-u", "avgr-u", "abs", "neg", "add-sat-s", "add-sat-u", "sub-sat-s", "sub-sat-u", "shl", "shr-s", "shr-u", "all-true", "bitmask", "popcnt", "eq", "ne", "lt-s", "lt-u", "le-s", "le-u", "gt-s", "gt-u", "ge-s", "ge-u", "narrow-i16x4-s", "narrow-i16x4-u", "shuffle", "swizzle", "relaxed-swizzle", "relaxed-laneselect", "mul"];

const VARIANTS: [ChartVariant, ChartVariant, ChartVariant, ChartVariant] = [
  { key: "swar-v8", label: "v8 swar", color: "rgb(99,102,241)", mode: "swar", runtime: "v8", suite: "i8x8" },
  { key: "swar-wavm", label: "wavm swar", color: "rgb(34,197,94)", mode: "swar", runtime: "wavm", suite: "i8x8" },
  { key: "simd-v8", label: "v8 simd", color: "rgb(234,220,90)", mode: "simd", runtime: "v8", suite: "i8x8" },
  { key: "simd-wavm", label: "wavm simd", color: "rgb(239,68,68)", mode: "simd", runtime: "wavm", suite: "i8x8" },
];

createComparisonChart({
  root: ROOT,
  id: "i8x8-swar-v-i8x8-simd",
  title: "i8x8 SWAR vs SIMD",
  subtitle: chartSubtitle(ROOT),
  order: ORDER,
  variants: VARIANTS,
  layout: { headerH: 94, leftW: 150, rightW: 380 },
  missingRowsMessage: "No benchmark JSONs found for i8x8 in build/logs/as/{swar,simd}",
});
