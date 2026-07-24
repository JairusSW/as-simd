import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const output = "build/transform-tests";
mkdirSync(output, { recursive: true });

const widths = [
  {
    bits: 256,
    vector: "v256",
    path: "assembly/v256/lanes.ts",
    namespaces: ["i8x32", "i16x16", "i32x8", "i64x4", "f32x8", "f64x4"],
  },
  {
    bits: 512,
    vector: "v512",
    path: "assembly/v512/lanes.ts",
    namespaces: ["i8x64", "i16x32", "i32x16", "i64x8", "f32x16", "f64x8"],
  },
];

function namespaceFunctions(source, namespace) {
  const marker = `export namespace ${namespace} {`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `missing ${namespace}`);
  const end = source.indexOf("\n}", start);
  const body = source.slice(start + marker.length, end);
  return [
    ...body.matchAll(/export function\s+(\w+)\s*\(([^)]*)\)\s*:\s*([^\s{]+)/g),
  ].map((match) => ({
    name: match[1],
    params: match[2]
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => {
        const split = value.indexOf(":");
        return {
          name: value.slice(0, split).trim(),
          type: value.slice(split + 1).trim(),
        };
      }),
    result: match[3],
  }));
}

function scalarLiteral(type, salt) {
  if (type === "f32") return `${1.25 + salt} as f32`;
  if (type === "f64") return `${1.25 + salt}`;
  if (type === "i64" || type === "u64") return `${3 + salt} as ${type}`;
  if (/^[iu](?:8|16|32)$/.test(type)) return `${3 + salt} as ${type}`;
  if (type === "bool") return "true";
  throw new Error(`no scalar literal for ${type}`);
}

function scalarHash(expression, type) {
  if (type === "bool") return `(${expression} ? 1 : 0) as u64`;
  if (type === "f32") return `reinterpret<u32>(${expression}) as u64`;
  if (type === "f64") return `reinterpret<u64>(${expression})`;
  return `${expression} as u64`;
}

const imports = new Set(["v256", "v512"]);
const lines = [
  'import { v256, v512 } from "../../assembly";',
  "",
  "@inline function mix(h: u64, value: u64): u64 { return (h ^ value) * 0x9e3779b185ebca87; }",
  "@inline function hashWords(h: u64, ptr: usize, count: i32): u64 { for (let i = 0; i < count; i++) h = mix(h, load<u64>(ptr + ((i as usize) << 3))); return h; }",
  "",
];

let calls = 0;
const cases = [];
for (const width of widths) {
  const source = readFileSync(width.path, "utf8");
  for (const namespace of width.namespaces) {
    imports.add(namespace);
    const functions = namespaceFunctions(source, namespace);
    assert.ok(functions.length, `${namespace} has no functions`);
    cases.push({ name: namespace, functions: functions.map((fn) => fn.name) });
    const laneType = namespace.match(/^[if]\d+/)[0];
    lines.push(`export function run_${namespace}(stop: i32): u64 {`);
    lines.push("  const storage = new StaticArray<u64>(8);");
    lines.push("  const ptr = changetype<usize>(storage);");
    lines.push("  let h: u64 = 0xcbf29ce484222325;");
    lines.push(
      `  const ${namespace}a = ${namespace}.splat(${scalarLiteral(laneType, 0)});`,
    );
    lines.push(
      `  const ${namespace}b = ${namespace}.splat(${scalarLiteral(laneType, 1)});`,
    );
    lines.push(
      `  const ${namespace}m = ${namespace}.splat(${scalarLiteral(laneType, 2)});`,
    );
    let namespaceCall = 0;
    for (const fn of functions) {
      const vectorArgs = [];
      const args = fn.params.map((param, index) => {
        if (param.type === width.vector) {
          const values = [`${namespace}a`, `${namespace}b`, `${namespace}m`];
          return values[vectorArgs.push(index) - 1] ?? `${namespace}a`;
        }
        if (/^l\d+$/.test(param.name)) {
          const lane = Number(param.name.slice(1));
          return `${lane} as ${param.type}`;
        }
        if (param.name === "idx") return `1 as ${param.type}`;
        return scalarLiteral(param.type, index);
      });
      const call = `${namespace}.${fn.name}(${args.join(", ")})`;
      lines.push("  {");
      if (fn.result === width.vector) {
        lines.push(`    const result = ${call};`);
        lines.push(`    ${width.vector}.store(ptr, result);`);
        lines.push(`    h = hashWords(h, ptr, ${width.bits / 64});`);
      } else {
        lines.push(`    h = mix(h, ${scalarHash(call, fn.result)});`);
      }
      lines.push("  }");
      lines.push(`  if (stop == ${++namespaceCall}) return h;`);
      calls++;
    }
    lines.push(`  return mix(h, ${functions.length});`);
    lines.push("}");
    lines.push("");
  }
}

const imported = [...imports].filter(
  (name) => name !== "v256" && name !== "v512",
);
lines[0] = `import { v256, v512, ${imported.join(", ")} } from "../../assembly";`;
assert.equal(
  calls,
  462,
  "every current lane-namespace function must have one generated execution case",
);

const fixture = `${output}/wide-lane-exhaustive-fixture.ts`;
writeFileSync(fixture, lines.join("\n") + "\n");

function compile(mode) {
  const wasm = `${output}/wide-lane-exhaustive-${mode}.wasm`;
  const args = [
    fixture,
    "--config",
    "none",
    "--runtime",
    "stub",
    "--noAssert",
    "-O0",
    "--exportRuntime",
    "-o",
    wasm,
  ];
  if (mode === "simd")
    args.push("--enable", "simd", "--enable", "relaxed-simd");
  execFileSync("node_modules/.bin/asc", args, { stdio: "inherit" });
  return readFileSync(wasm);
}

async function execute(bytes) {
  const { instance } = await WebAssembly.instantiate(bytes, {
    env: {
      abort() {
        throw new Error("AssemblyScript abort");
      },
    },
  });
  return new Map(
    cases.map(({ name, functions }) => [
      name,
      functions.map((_, index) => instance.exports[`run_${name}`](index + 1)),
    ]),
  );
}

const swar = await execute(compile("swar"));
const simd = await execute(compile("simd"));
for (const { name, functions } of cases) {
  for (let i = 0; i < functions.length; i++) {
    const actual = simd.get(name)[i],
      expected = swar.get(name)[i];
    assert.equal(
      actual,
      expected,
      `${name}.${functions[i]} SIMD/SWAR checksum differs: simd=${actual.toString(16)} swar=${expected.toString(16)}`,
    );
  }
}
console.log(
  `exhaustive v256/v512 lane namespace parity passed (${calls} operations)`,
);
