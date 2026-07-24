import { Transform } from "assemblyscript/dist/transform.js";
import { Feature, Parser } from "assemblyscript/dist/assemblyscript.js";
import binaryen from "binaryen";
import { optimizeSwarExpressions } from "./swar.js";
import { injectPortableVectors } from "./v128.js";
import {
  insertJSONEscapeCopyIntrinsic,
  insertWideIntrinsicKernels,
} from "./wide-intrinsics.js";

const CLEANUP_PASSES = [
  "precompute",
  "optimize-instructions",
  "local-cse",
  "code-folding",
  "dce",
  "vacuum",
];

const EXPOSE_PASSES = [
  "inlining",
  "remove-unused-brs",
  "merge-blocks",
  "simplify-locals",
  "vacuum",
];

function wideIntrinsicsEnabled(): boolean {
  return (process.env["WAGO_PLUGINS"] ?? "")
    .toLowerCase()
    .split(/[\s,;]+/)
    .includes("wide");
}

export default class AsSimdTransform extends Transform {
  private fallbackSources = 0;

  afterParse(parser: Parser): void {
    if (process.env["AS_SIMD_AUTO_INJECT"] === "0") return;
    const injectV128 =
      process.env["AS_SIMD_V128_FALLBACK"] !== "0" &&
      !this.program.options.hasFeature(Feature.Simd);
    this.fallbackSources = injectPortableVectors(
      parser,
      injectV128,
      this.baseDir,
    );
  }

  afterCompile(module: binaryen.Module): void {
    if (process.env["AS_SIMD_OPTIMIZE"] === "0") return;

    const useWideIntrinsics =
      wideIntrinsicsEnabled() &&
      this.fallbackSources === 0 &&
      !!(module.getFeatures() & binaryen.Features.SIMD128);
    let wideKernels = 0;
    // Preserve domain-specific calls with dynamic loop bounds before the
    // generic inliner expands their portable fallback bodies.
    if (useWideIntrinsics) {
      wideKernels += insertJSONEscapeCopyIntrinsic(module);
    }

    // Valent-block style rewriting needs the whole pure expression island.
    // Expose it first by inlining AssemblyScript's tiny SWAR helpers and
    // forwarding locals, then run the domain-specific rules bottom-up.
    module.runPasses(EXPOSE_PASSES);
    (module as binaryen.Module & { updateMaps(): void }).updateMaps();
    const stats = optimizeSwarExpressions(module);
    module.runPasses(CLEANUP_PASSES);
    if (useWideIntrinsics) {
      // Catch fixed-size helpers revealed by the generic inliner as well.
      wideKernels += insertJSONEscapeCopyIntrinsic(module);
      // AssemblyScript's afterCompile hook precedes its final emission cleanup.
      // Run Binaryen's configured pipeline here so adjacent v128 halves have the
      // same canonical store/load shape the emitted module would otherwise gain
      // only after this transform returns. Scalar-only SWAR builds deliberately
      // retain their requested optimization level and skip this SIMD pipeline.
      for (let i = 0; i < 4; i++) module.optimize();
      (module as binaryen.Module & { updateMaps(): void }).updateMaps();
      wideKernels += insertWideIntrinsicKernels(module);
    }
    if (wideKernels) {
      module.optimize();
      (module as binaryen.Module & { updateMaps(): void }).updateMaps();
    }
    if (process.env["AS_SIMD_OPTIMIZE_DEBUG"] === "1") {
      console.error(
        `[as-simd] auto-injected vectors in ${this.fallbackSources} source(s); ` +
          `visited ${stats.expressions} expressions; fused ${stats.rewrites} SWAR patterns; emitted ${wideKernels} wide custom-instruction call(s)`,
      );
    }
  }
}
