import { Transform } from "assemblyscript/dist/transform.js";
import { Feature, Parser } from "assemblyscript/dist/assemblyscript.js";
import binaryen from "binaryen";
import { optimizeSwarExpressions } from "./swar.js";
import { injectPortableVectors } from "./v128.js";

const CLEANUP_PASSES = ["precompute", "optimize-instructions", "local-cse", "code-folding", "dce", "vacuum"];

const EXPOSE_PASSES = ["inlining", "remove-unused-brs", "merge-blocks", "simplify-locals", "vacuum"];

export default class AsSimdTransform extends Transform {
  private fallbackSources = 0;

  afterParse(parser: Parser): void {
    if (process.env["AS_SIMD_AUTO_INJECT"] === "0") return;
    const injectV128 = process.env["AS_SIMD_V128_FALLBACK"] !== "0" && !this.program.options.hasFeature(Feature.Simd);
    this.fallbackSources = injectPortableVectors(parser, injectV128, this.baseDir);
  }

  afterCompile(module: binaryen.Module): void {
    if (process.env["AS_SIMD_OPTIMIZE"] === "0") return;

    // Valent-block style rewriting needs the whole pure expression island.
    // Expose it first by inlining AssemblyScript's tiny SWAR helpers and
    // forwarding locals, then run the domain-specific rules bottom-up.
    module.runPasses(EXPOSE_PASSES);
    (module as binaryen.Module & { updateMaps(): void }).updateMaps();
    const stats = optimizeSwarExpressions(module);
    module.runPasses(CLEANUP_PASSES);

    if (process.env["AS_SIMD_OPTIMIZE_DEBUG"] === "1") {
      console.error(`[as-simd] auto-injected vectors in ${this.fallbackSources} source(s); ` + `visited ${stats.expressions} expressions; fused ${stats.rewrites} SWAR patterns`);
    }
  }
}
