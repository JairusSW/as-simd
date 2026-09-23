import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";

const output = "build/transform-tests";
mkdirSync(output, { recursive: true });
for (const mode of ["swar", "simd", "native"]) {
  const path = `${output}/utf-wide-${mode}.wasm`;
  const args = [
    "transform/__tests__/utf-wide-fixture.ts",
    "--runtime",
    "stub",
    "--transform",
    "./transform",
    "-O3",
    "--converge",
    "-o",
    path,
  ];
  if (mode !== "swar") args.push("--enable", "simd");
  const env = { ...process.env };
  delete env.WAGO_PLUGINS;
  if (mode === "native") env.WAGO_PLUGINS = "wide";
  execFileSync("node_modules/.bin/asc", args, { env, stdio: "inherit" });
  const module = new WebAssembly.Module(readFileSync(path));
  const imports = WebAssembly.Module.imports(module).map(
    ({ module, name }) => `${module}/${name}`,
  );
  if (mode === "native") {
    assert.deepEqual(
      imports.filter((name) => name.includes("length_")).sort(),
      [
        "as-simd/utf16.length_utf8_block_256",
        "as-simd/utf16.length_utf8_block_512",
        "as-simd/utf8.length_utf16_block_256",
        "as-simd/utf8.length_utf16_block_512",
      ],
    );
    assert(imports.includes("as-simd/i16x16.eq"));
    assert(imports.includes("as-simd/i8x32.le_u"));
    assert(!imports.some((name) => name.includes("validate_block_")));
  } else {
    assert.deepEqual(imports, []);
    assert.equal(new WebAssembly.Instance(module).exports.check(), 144);
  }
}
console.log("Wide UTF block fallbacks and native imports passed");
