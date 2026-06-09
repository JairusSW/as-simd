import fs from "node:fs";
import { performance } from "node:perf_hooks";

const bytes = fs.readFileSync("bench/regfile/rc.wasm");
const { instance } = await WebAssembly.instantiate(bytes, {});
const e = instance.exports;
if (e._start) e._start();

const ITERS = 20_000_000;
const ROUNDS = 9;
const aLo = 0xfedcba9876543210n, aHi = 0x0123456789abcdefn;
const bLo = 0x8899aabbccddeeffn, bHi = 0x1020304050607080n;

function bench(name, fn) {
  let sink = 0n;
  for (let i = 0; i < 3; i++) sink ^= fn(); // warmup
  const s = [];
  for (let i = 0; i < ROUNDS; i++) {
    const t0 = performance.now();
    sink ^= fn();
    s.push(performance.now() - t0);
  }
  s.sort((a, b) => a - b);
  const best = s[0];
  const med = s[(s.length - 1) >> 1];
  return { name, bestMs: best, medMs: med, mops: ITERS / (best / 1000) / 1e6, sink };
}

const groups = {
  add: [
    ["heap.const", () => e.addHeapConst(ITERS, aLo, aHi, bLo, bHi)],
    ["heap.dyn",   () => e.addHeapDyn(ITERS, aLo, aHi, bLo, bHi)],
    ["global",     () => e.addGlobalLoop(ITERS, aLo, aHi, bLo, bHi)],
  ],
  lt_s: [
    ["heap.const", () => e.ltSHeapConst(ITERS, aLo, aHi, bLo, bHi)],
    ["global",     () => e.ltSGlobalLoop(ITERS, aLo, aHi, bLo, bHi)],
  ],
  madd: [
    ["heap.const", () => e.maddHeapConst(ITERS, aLo, aHi, bLo, bHi)],
    ["global",     () => e.maddGlobalLoop(ITERS, aLo, aHi, bLo, bHi)],
  ],
};

console.log(`iters=${ITERS.toLocaleString()} rounds=${ROUNDS} (best-of)\n`);
for (const [g, variants] of Object.entries(groups)) {
  console.log(`# ${g}`);
  const res = variants.map(([n, f]) => bench(n, f));
  const fastest = Math.max(...res.map((r) => r.mops));
  for (const r of res) {
    const rel = ((r.mops / fastest) * 100).toFixed(0);
    console.log(`  ${r.name.padEnd(11)} best=${r.bestMs.toFixed(1)}ms med=${r.medMs.toFixed(1)}ms  ${r.mops.toFixed(0).padStart(5)} Mops/s  (${rel}% of fastest)`);
  }
  console.log("");
}
