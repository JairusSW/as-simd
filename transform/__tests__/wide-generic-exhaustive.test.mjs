import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const output = "build/transform-tests";
mkdirSync(output, { recursive: true });

const unaryI16 = new Set(["neg", "abs"]);
const unaryF32 = new Set(["sqrt", "ceil", "floor", "trunc", "nearest"]);
const binaryI16 = new Set([
  "add",
  "sub",
  "mul",
  "min",
  "max",
  "add_sat",
  "sub_sat",
  "eq",
  "ne",
  "lt",
  "le",
  "gt",
  "ge",
]);
const binaryF32 = new Set([
  "div",
  "pmin",
  "pmax",
  "relaxed_min",
  "relaxed_max",
]);
const bitBinary = new Set(["and", "or", "xor", "andnot"]);
const laneLoads = new Set([
  "load8_lane",
  "load16_lane",
  "load32_lane",
  "load64_lane",
]);
const laneStores = new Set([
  "store8_lane",
  "store16_lane",
  "store32_lane",
  "store64_lane",
]);
const plainLoads = new Set([
  "load8_splat",
  "load16_splat",
  "load32_splat",
  "load64_splat",
  "load8x8_s",
  "load8x8_u",
  "load16x4_s",
  "load16x4_u",
  "load32x2_s",
  "load32x2_u",
  "load32_zero",
  "load64_zero",
]);

function publicMethods(path) {
  const source = readFileSync(path, "utf8");
  const methods = [
    ...source.matchAll(
      /static\s+(?:get\s+|set\s+)?([A-Za-z_]\w*)\s*(?:<[^\n{(]*>)?\s*\(([^)]*)\)\s*:\s*([^\s{;]+)/g,
    ),
  ]
    .map((match) => ({ name: match[1], result: match[3] }))
    .filter(
      (method) => method.name !== "chunk" && method.name !== "fromChunks",
    );
  assert.equal(methods.length, 95, `${path} public method inventory changed`);
  return methods;
}

function expression(name, vector, bits) {
  if (binaryI16.has(name)) return `${vector}.${name}<i16>(a, b)`;
  if (binaryF32.has(name)) return `${vector}.${name}<f32>(a, b)`;
  if (bitBinary.has(name)) return `${vector}.${name}(a, b)`;
  if (unaryI16.has(name)) return `${vector}.${name}<i16>(a)`;
  if (unaryF32.has(name)) return `${vector}.${name}<f32>(a)`;
  if (plainLoads.has(name)) return `${vector}.${name}(ptr, 3, 1)`;
  if (laneLoads.has(name)) return `${vector}.${name}(ptr, a, 1, 3, 1)`;
  if (laneStores.has(name)) return `${vector}.${name}(ptr, a, 1, 3, 1)`;
  switch (name) {
    case "load":
      return `${vector}.load(ptr, 3, 1)`;
    case "store":
      return `${vector}.store(ptr, a, 5, 1)`;
    case "splat":
      return `${vector}.splat<i16>(3)`;
    case "avgr":
      return `${vector}.avgr<u16>(a, b)`;
    case "shl":
    case "shr":
      return `${vector}.${name}<i16>(a, 3)`;
    case "not":
    case "any_true":
      return `${vector}.${name}(a)`;
    case "bitselect":
      return `${vector}.bitselect(a, b, c)`;
    case "all_true":
    case "bitmask":
      return `${vector}.${name}<i16>(a)`;
    case "extract_lane":
      return `${vector}.extract_lane<i16>(a, 1)`;
    case "replace_lane":
      return `${vector}.replace_lane<i16>(a, 1, -7)`;
    case "loadPartial":
      return `${vector}.loadPartial(ptr, ${bits / 8 - 3}, 2, 1, -5)`;
    case "storePartial":
      return `${vector}.storePartial(ptr, a, ${bits / 8 - 3}, 2, 1)`;
    case "load_ext":
      return `${vector}.load_ext<i8>(ptr, 3, 1)`;
    case "load_zero":
      return `${vector}.load_zero<i32>(ptr, 3, 1)`;
    case "load_splat":
      return `${vector}.load_splat<i16>(ptr, 3, 1)`;
    case "load_lane":
      return `${vector}.load_lane<i16>(ptr, a, 1, 3, 1)`;
    case "store_lane":
      return `${vector}.store_lane<i16>(ptr, a, 1, 3, 1)`;
    case "shuffle": {
      const lanes = Array.from({ length: bits / 16 }, (_, i) => i).join(", ");
      return `${vector}.shuffle<i16>(a, b, ${lanes})`;
    }
    case "swizzle":
    case "relaxed_swizzle":
      return `${vector}.${name}(a, b)`;
    case "popcnt":
      return `${vector}.popcnt<i8>(a)`;
    case "convert":
    case "convert_low":
      return `${vector}.${name}<i32>(a)`;
    case "trunc_sat":
    case "trunc_sat_zero":
      return `${vector}.${name}<i32>(a)`;
    case "narrow":
      return `${vector}.narrow<i16>(a, b)`;
    case "extend_low":
    case "extend_high":
    case "extadd_pairwise":
      return `${vector}.${name}<i8>(a)`;
    case "demote_zero":
      return `${vector}.demote_zero(a)`;
    case "promote_low":
      return `${vector}.promote_low(a)`;
    case "relaxed_trunc":
    case "relaxed_trunc_zero":
      return `${vector}.${name}<i32>(a)`;
    case "dot":
      return `${vector}.dot<i16>(a, b)`;
    case "extmul_low":
    case "extmul_high":
      return `${vector}.${name}<i8>(a, b)`;
    case "q15mulr_sat":
    case "relaxed_q15mulr":
      return `${vector}.${name}<i16>(a, b)`;
    case "relaxed_dot":
      return `${vector}.relaxed_dot<i16>(a, b)`;
    case "relaxed_madd":
    case "relaxed_nmadd":
      return `${vector}.${name}<f32>(a, b, c)`;
    case "relaxed_laneselect":
      return `${vector}.relaxed_laneselect<i16>(a, b, c)`;
    case "relaxed_dot_add":
      return `${vector}.relaxed_dot_add<i8>(a, b, c)`;
    default:
      throw new Error(`no generated execution case for ${vector}.${name}`);
  }
}

const lines = [
  'import {v256, v512} from "../../assembly";',
  "@inline function mix(h: u64, value: u64): u64 { return (h ^ value) * 0x9e3779b185ebca87; }",
  "@inline function hashWords(h: u64, ptr: usize, count: i32): u64 { for (let i=0;i<count;i++) h=mix(h,load<u64>(ptr+((i as usize)<<3))); return h; }",
];
const inventories = [];
for (const [bits, vector, path] of [
  [256, "v256", "assembly/v256/value.ts"],
  [512, "v512", "assembly/v512/value.ts"],
]) {
  const methods = publicMethods(path);
  inventories.push({ vector, methods });
  lines.push(`export function run_${vector}(stop: i32): u64 {`);
  lines.push(
    "  const memory = new StaticArray<u64>(16); const ptr=changetype<usize>(memory);",
  );
  lines.push(
    "  for (let i=0;i<128;i++) store<u8>(ptr+(i as usize),(i*37+11) as u8);",
  );
  lines.push(
    `  const a=${vector}.splat<i16>(3), b=${vector}.splat<i16>(5), c=${vector}.splat<i16>(7);`,
  );
  lines.push("  let h:u64=0xcbf29ce484222325;");
  methods.forEach((method, index) => {
    const call = expression(method.name, vector, bits);
    lines.push("  {");
    if (method.result === vector) {
      lines.push(
        `    const result=${call}; ${vector}.store(ptr,result); h=hashWords(h,ptr,${bits / 64});`,
      );
    } else if (method.result === "void") {
      lines.push(`    ${call}; h=hashWords(h,ptr,${bits / 64});`);
    } else if (method.result === "bool") {
      lines.push(`    h=mix(h,(${call}?1:0) as u64);`);
    } else {
      lines.push(`    h=mix(h,${call} as u64);`);
    }
    lines.push("  }");
    lines.push(`  if (stop==${index + 1}) return h;`);
  });
  lines.push(`  return mix(h,${methods.length});`);
  lines.push("}");
}

const fixture = `${output}/wide-generic-exhaustive-fixture.ts`;
writeFileSync(fixture, lines.join("\n") + "\n");

function compile(mode) {
  const wasm = `${output}/wide-generic-exhaustive-${mode}.wasm`;
  const args = [
    fixture,
    "--config",
    "none",
    "--runtime",
    "stub",
    "--noAssert",
    "-O0",
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
    inventories.map(({ vector, methods }) => [
      vector,
      methods.map((_, i) => instance.exports[`run_${vector}`](i + 1)),
    ]),
  );
}

const swar = await execute(compile("swar"));
const simd = await execute(compile("simd"));
for (const { vector, methods } of inventories)
  for (let i = 0; i < methods.length; i++) {
    assert.equal(
      simd.get(vector)[i],
      swar.get(vector)[i],
      `${vector}.${methods[i].name} SIMD/SWAR checksum differs`,
    );
  }
console.log("exhaustive v256/v512 generic API parity passed (190 operations)");
