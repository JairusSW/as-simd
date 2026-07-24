import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";

const ROUNDS = 7,
  ITERS = 100_000;
const { instance } = await WebAssembly.instantiate(
  fs.readFileSync("bench/wide-values/bench.wasm"),
  {
    env: {
      abort() {
        throw new Error("benchmark aborted");
      },
    },
  },
);

function measure(fn) {
  let sink = 0;
  for (let i = 0; i < 20_000; i++) sink ^= fn(i, i + 1);
  const samples = [];
  for (let round = 0; round < ROUNDS; round++) {
    const start = performance.now();
    for (let i = 0; i < ITERS; i++) sink ^= fn(i, i + 1);
    samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  return { rate: ITERS / (samples[Math.floor(ROUNDS / 2)] / 1000) / 1e6, sink };
}

const rows = [];
for (const [width, legacyName, dedicatedName] of [
  [256, "legacyV256", "dedicatedV256"],
  [512, "legacyV512", "dedicatedV512"],
]) {
  const legacy = measure(instance.exports[legacyName]);
  const dedicated = measure(instance.exports[dedicatedName]);
  if (legacy.sink !== dedicated.sink)
    throw new Error(`v${width} result mismatch`);
  rows.push({
    width,
    legacy: legacy.rate,
    dedicated: dedicated.rate,
    speedup: dedicated.rate / legacy.rate,
  });
  console.log(
    `v${width}: ${legacy.rate.toFixed(2)} -> ${dedicated.rate.toFixed(2)} Mops/s (${(dedicated.rate / legacy.rate).toFixed(2)}x)`,
  );
}

const output = "build/bench/wide-values-v8.json";
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(
  output,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      runtime: `Node ${process.version} / V8 ${process.versions.v8}`,
      cpu: os.cpus()[0]?.model ?? "unknown CPU",
      rounds: ROUNDS,
      iterations: ITERS,
      results: rows,
    },
    null,
    2,
  ) + "\n",
);
console.log(`wrote ${output}`);
