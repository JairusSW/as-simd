import { Transform } from "assemblyscript/dist/transform.js";
import * as asc from "assemblyscript/dist/assemblyscript.js";

const SIMD_FEATURE = 16;
const FORCE_SWAR_ENV = "AS_SIMD_FORCE_SWAR_V128";

export default class SwarV128AliasesTransform extends Transform {
  afterInitialize(program) {
    const options = program.options;
    const forceSwar = process.env[FORCE_SWAR_ENV] === "1";
    if ((options.features & SIMD_FEATURE) !== 0 && !forceSwar) return;

    asc.addGlobalAlias(options, "i8x16", "i8x16_swar");
    asc.addGlobalAlias(options, "i16x8", "i16x8_swar");
    asc.addGlobalAlias(options, "i32x4", "i32x4_swar");
    asc.addGlobalAlias(options, "i64x2", "i64x2_swar");
  }
}
