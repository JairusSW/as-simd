import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const rootApi = readFileSync("assembly/index.ts", "utf8");
assert.doesNotMatch(
  rootApi,
  /export\s*\{[^}]*\bv(?:128|256|512)r\b/,
  "register-indexed aliases must not leak through the public root",
);

function splitParams(params) {
  return params
    .split(",")
    .map((param) => param.trim())
    .filter(Boolean);
}

function methods(path) {
  const source = readFileSync(path, "utf8");
  const result = new Map();
  const pattern =
    /static\s+(?:get\s+|set\s+)?([A-Za-z_]\w*)\s*(<[^\n{(]*>)?\s*\(([^)]*)\)\s*:\s*([^\s{;]+)/g;
  for (const match of source.matchAll(pattern)) {
    const params = match[3].trim();
    result.set(match[1], {
      generics: (match[2] ?? "").replaceAll(/\s+/g, ""),
      params,
      genericArity: (match[2]?.match(/\b(?:T|TFrom|TTo)\b/g) ?? []).length,
      arity: splitParams(params).length,
      returns: match[4],
    });
  }
  return result;
}

const v128 = methods("assembly/v128/value.ts");
v128.delete("pair");

for (const [width, path, maskType] of [
  ["v256", "assembly/v256/value.ts", "u32"],
  ["v512", "assembly/v512/value.ts", "u64"],
]) {
  const wide = methods(path);
  wide.delete("chunk");
  wide.delete("fromChunks");
  assert.deepEqual(
    [...wide.keys()].sort(),
    [...v128.keys()].sort(),
    `${width} method names diverge from v128`,
  );
  for (const [name, base] of v128) {
    const actual = wide.get(name);
    assert.equal(
      actual.arity,
      base.arity,
      `${width}.${name} parameter count diverges from v128`,
    );
    assert.equal(
      actual.genericArity,
      base.genericArity,
      `${width}.${name} generic arity diverges from v128`,
    );
    assert.equal(
      actual.generics,
      base.generics,
      `${width}.${name} generic constraints diverge from v128`,
    );
    const normalizeParams = (params) =>
      splitParams(params)
        .join(",")
        .replaceAll("V128Fallback", "$vector")
        .replaceAll(width, "$vector")
        .replaceAll(/\s+/g, "")
        .replaceAll(/=[^,]+/g, "")
        .replaceAll(/\b\w+\??:/g, ":");
    assert.equal(
      normalizeParams(actual.params),
      normalizeParams(base.params),
      `${width}.${name} parameter types diverge from v128`,
    );
    const expectedReturn =
      base.returns === "V128Fallback" ? width : base.returns;
    assert.equal(
      actual.returns,
      name === "bitmask" ? maskType : expectedReturn,
      `${width}.${name} return type diverges from v128`,
    );
  }
}

function namespaceMethods(source, declaration, name) {
  const marker = `${declaration} namespace ${name} {`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `missing ${name} namespace`);
  const body = source.slice(
    start + marker.length,
    source.indexOf("\n}", start),
  );
  const result = new Map();
  const pattern =
    /export function\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:\s*([^\s{;]+)/g;
  for (const match of body.matchAll(pattern)) {
    const params = match[2].trim();
    result.set(match[1], {
      params,
      arity: splitParams(params).length,
      returns: match[3],
    });
  }
  return result;
}

const builtinSource = readFileSync(
  "node_modules/assemblyscript/std/assembly/index.d.ts",
  "utf8",
);
for (const [factor, width, path, maskType, pairs] of [
  [
    2,
    "v256",
    "assembly/v256/lanes.ts",
    "u32",
    [
      ["i8x16", "i8x32"],
      ["i16x8", "i16x16"],
      ["i32x4", "i32x8"],
      ["i64x2", "i64x4"],
      ["f32x4", "f32x8"],
      ["f64x2", "f64x4"],
    ],
  ],
  [
    4,
    "v512",
    "assembly/v512/lanes.ts",
    "u64",
    [
      ["i8x16", "i8x64"],
      ["i16x8", "i16x32"],
      ["i32x4", "i32x16"],
      ["i64x2", "i64x8"],
      ["f32x4", "f32x16"],
      ["f64x2", "f64x8"],
    ],
  ],
]) {
  const wideSource = readFileSync(path, "utf8");
  const replacements = [...pairs, ["i7x16", `i7x${16 * factor}`]].sort(
    (a, b) => b[1].length - a[1].length,
  );
  const normalizeName = (name) =>
    replacements.reduce(
      (value, [base, wide]) => value.replaceAll(wide, base),
      name,
    );
  for (const [baseName, wideName] of pairs) {
    const base = namespaceMethods(builtinSource, "declare", baseName);
    const rawWide = namespaceMethods(wideSource, "export", wideName);
    const wide = new Map(
      [...rawWide].map(([name, signature]) => [normalizeName(name), signature]),
    );
    assert.deepEqual(
      [...wide.keys()].sort(),
      [...base.keys()].sort(),
      `${wideName} method names diverge from ${baseName}`,
    );
    for (const [name, expected] of base) {
      const actual = wide.get(name);
      assert.equal(
        actual.arity,
        name === "shuffle"
          ? expected.arity * factor - 2 * (factor - 1)
          : expected.arity,
        `${wideName}.${name} parameter count diverges`,
      );
      const normalizeParams = (params, vector) =>
        splitParams(params)
          .join(",")
          .replaceAll(vector, "$vector")
          .replaceAll(/\s+/g, "")
          .replaceAll(/\b\w+:/g, ":");
      if (name !== "shuffle")
        assert.equal(
          normalizeParams(actual.params, width),
          normalizeParams(expected.params, "v128"),
          `${wideName}.${name} parameter types diverge`,
        );
      const expectedReturn =
        expected.returns === "v128" ? width : expected.returns;
      assert.equal(
        actual.returns,
        name === "bitmask" ? maskType : expectedReturn,
        `${wideName}.${name} return type diverges`,
      );
    }
  }
}

for (const simd of [false, true]) {
  const args = [
    "transform/__tests__/api-parity-fixture.ts",
    "--config",
    "none",
    "--noAssert",
    "-O0",
    "-o",
    `build/transform-tests/api-parity-${simd ? "simd" : "swar"}.wasm`,
  ];
  if (simd) args.push("--enable", "simd", "--enable", "relaxed-simd");
  execFileSync("node_modules/.bin/asc", args, { stdio: "inherit" });
}

console.log(
  "v128/v256/v512 generic and lane namespace API parity tests passed",
);
