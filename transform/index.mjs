import { Transform } from "assemblyscript/dist/transform.js";
import * as asc from "assemblyscript/dist/assemblyscript.js";

const SIMD_FEATURE = 16;

export default class SwarV128AliasesTransform extends Transform {
  afterInitialize(program) {
    const options = program.options;
    if ((options.features & SIMD_FEATURE) !== 0) return;

    asc.addGlobalAlias(options, "i8x16", "i8x16_swar");
    asc.addGlobalAlias(options, "i16x8", "i16x8_swar");
    asc.addGlobalAlias(options, "i32x4", "i32x4_swar");
    asc.addGlobalAlias(options, "i64x2", "i64x2_swar");
  }
}
