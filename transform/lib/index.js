import { Transform } from "assemblyscript/dist/transform.js";
import binaryen from "binaryen";
import { optimizeSwarExpressions } from "./swar.js";
import { injectPortableVectors } from "./v128.js";
import { insertWideIntrinsicKernels } from "./wide-intrinsics.js";
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
function wideIntrinsicsEnabled() {
    return (process.env["WAGO_PLUGINS"] ?? "")
        .toLowerCase()
        .split(/[\s,;]+/)
        .includes("wide");
}
export default class AsSimdTransform extends Transform {
    fallbackSources = 0;
    afterParse(parser) {
        if (process.env["AS_SIMD_AUTO_INJECT"] === "0")
            return;
        const injectV128 = process.env["AS_SIMD_V128_FALLBACK"] !== "0" &&
            !this.program.options.hasFeature(16);
        this.fallbackSources = injectPortableVectors(parser, injectV128, this.baseDir);
    }
    afterCompile(module) {
        if (process.env["AS_SIMD_OPTIMIZE"] === "0")
            return;
        module.runPasses(EXPOSE_PASSES);
        module.updateMaps();
        const stats = optimizeSwarExpressions(module);
        module.runPasses(CLEANUP_PASSES);
        let wideKernels = 0;
        if (wideIntrinsicsEnabled() &&
            this.fallbackSources === 0 &&
            module.getFeatures() & binaryen.Features.SIMD128) {
            for (let i = 0; i < 4; i++)
                module.optimize();
            module.updateMaps();
            wideKernels = insertWideIntrinsicKernels(module);
        }
        if (wideKernels) {
            module.optimize();
            module.updateMaps();
        }
        if (process.env["AS_SIMD_OPTIMIZE_DEBUG"] === "1") {
            console.error(`[as-simd] auto-injected vectors in ${this.fallbackSources} source(s); ` +
                `visited ${stats.expressions} expressions; fused ${stats.rewrites} SWAR patterns; emitted ${wideKernels} wide custom-instruction call(s)`);
        }
    }
}
