import { Transform } from "assemblyscript/dist/transform.js";
import * as asc from "assemblyscript/dist/assemblyscript.js";

const SIMD_FEATURE = 16;
const FORCE_SWAR_ENV = "AS_SIMD_FORCE_SWAR_V128";
const V128_FAMILY_PATTERN = /\b(v128|i8x16|i16x8|i32x4|i64x2)\b/g;
const STRICT_DIAGNOSTIC_PREFIX = "[as-simd/transform]";

function findFirstV128FamilyUse(text) {
  V128_FAMILY_PATTERN.lastIndex = 0;
  const match = V128_FAMILY_PATTERN.exec(text);
  return match ? { symbol: match[1], index: match.index } : null;
}

export default class SwarV128AliasesTransform extends Transform {
  afterParse(parser) {
    const options = this.program.options;
    const hasSimd = (options.features & SIMD_FEATURE) !== 0;
    if (hasSimd) return;

    for (const source of parser.sources) {
      if (source.sourceKind !== asc.SourceKind.UserEntry) continue;
      const hit = findFirstV128FamilyUse(source.text);
      if (!hit) continue;
      const line = source.lineAt(hit.index);
      const column = source.columnAt();
      throw new Error(
        `${STRICT_DIAGNOSTIC_PREFIX} strict mode does not support '${hit.symbol}' without SIMD feature support (${source.normalizedPath}:${line}:${column}). ` +
          "This fails because `v128`-family globals are unavailable when SIMD is disabled. " +
          "Fix by switching to `as-simd/preset/full`, or keep `as-simd/preset/strict` and use an explicit non-`v128` path (for example `i8x8`, `i16x4`, `i32x2`)."
      );
    }
  }

  afterInitialize(program) {
    const options = program.options;
    const forceSwar = process.env[FORCE_SWAR_ENV] === "1";
    const hasSimd = (options.features & SIMD_FEATURE) !== 0;

    if (hasSimd && !forceSwar) {
      asc.addGlobalAlias(options, "v128_swar", "v128");
      return;
    }

    asc.addGlobalAlias(options, "i8x16", "i8x16_swar");
    asc.addGlobalAlias(options, "i16x8", "i16x8_swar");
    asc.addGlobalAlias(options, "i32x4", "i32x4_swar");
    asc.addGlobalAlias(options, "i64x2", "i64x2_swar");
  }
}
