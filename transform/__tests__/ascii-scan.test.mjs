import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";

const output = "build/transform-tests";
mkdirSync(output, { recursive: true });

for (const mode of ["swar", "simd", "native"]) {
  const native = mode === "native";
  const name = `ascii-${mode}`;
  const args = [
    "transform/__tests__/ascii-scan-fixture.ts",
    "--runtime",
    "stub",
    "--transform",
    "./transform",
    "-O3",
    "--converge",
    "-o",
    `${output}/${name}.wasm`,
  ];
  if (mode !== "swar") args.push("--enable", "simd");
  const env = { ...process.env };
  delete env.WAGO_PLUGINS;
  if (native) env.WAGO_PLUGINS = "wide";
  execFileSync("node_modules/.bin/asc", args, { env, stdio: "inherit" });
  const bytes = readFileSync(`${output}/${name}.wasm`);
  const module = new WebAssembly.Module(bytes);
  const imports = WebAssembly.Module.imports(module).map(
    ({ module, name }) => `${module}/${name}`,
  );
  if (native) {
    assert.deepEqual(imports.sort(), [
      "as-simd/ascii.scan_256",
      "as-simd/ascii.scan_512",
    ]);
  } else {
    assert.deepEqual(imports, []);
    const instance = new WebAssembly.Instance(module);
    instance.exports.init();
    assert.equal(instance.exports.scan256(10), 10);
    assert.equal(instance.exports.scan512(10), 10);
    assert.equal(instance.exports.check(), -1);
  }
}

console.log(
  "ASCII scan transform: portable parity and both Wide imports passed",
);
