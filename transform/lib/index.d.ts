import { Transform } from "assemblyscript/dist/transform.js";
import { Parser } from "assemblyscript/dist/assemblyscript.js";
import binaryen from "binaryen";
export default class AsSimdTransform extends Transform {
    private fallbackSources;
    afterParse(parser: Parser): void;
    afterCompile(module: binaryen.Module): void;
}
