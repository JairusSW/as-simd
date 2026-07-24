import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const wago = path.resolve(root, process.env.WAGO_DIR || "../../Wago/wago");
const rounds = Number(process.env.AS_SIMD_BENCH_ROUNDS || 10);
const output = execFileSync(
  "go",
  [
    "test",
    "./src/core/compiler/backend/railshot",
    "-run",
    "^$",
    "-bench",
    "BenchmarkV256ByteAdd",
    "-benchmem",
    `-count=${rounds}`,
  ],
  { cwd: wago, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
);

const samples = { avx2_ymm: [], paired_v128: [], swar_i64: [] };
for (const line of output.split("\n")) {
  const match = line.match(
    /BenchmarkV256ByteAdd\/(avx2_ymm|paired_v128|swar_i64)-\d+.*?([0-9.]+) ns\/32B-op/,
  );
  if (match) samples[match[1]].push(Number(match[2]));
}
for (const [name, values] of Object.entries(samples)) {
  if (values.length !== rounds)
    throw new Error(
      `Expected ${rounds} ${name} samples, found ${values.length}`,
    );
}

const dir = path.join(root, "build", "bench");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(
  path.join(dir, "wago-v256.json"),
  JSON.stringify(
    {
      runtime: "Wago Railshot",
      cpu: os.cpus()[0]?.model || "unknown CPU",
      rounds,
      benchmark: "128 dependent i8x32.add operations per invocation",
      unit: "ns/32B-op",
      samples,
    },
    null,
    2,
  ) + "\n",
);
console.log("Wrote build/bench/wago-v256.json");
