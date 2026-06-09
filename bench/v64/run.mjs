import fs from "node:fs";
import { performance } from "node:perf_hooks";

const ITERS = 20_000_000, ROUNDS = 9;
const a = 0xfedcba9876543210n, b = 0x8899aabbccddeeffn;

function load(p) {
  const { instance } = WebAssembly_instantiateSync(fs.readFileSync(p));
  if (instance.exports._start) instance.exports._start();
  return instance.exports;
}
function WebAssembly_instantiateSync(bytes) {
  const m = new WebAssembly.Module(bytes);
  return { instance: new WebAssembly.Instance(m, {}) };
}
function bench(fn) {
  let sink = 0n;
  for (let i = 0; i < 3; i++) sink ^= fn();
  const s = [];
  for (let i = 0; i < ROUNDS; i++) { const t = performance.now(); sink ^= fn(); s.push(performance.now() - t); }
  s.sort((x, y) => x - y);
  return ITERS / (s[0] / 1000) / 1e6;
}

const swar = load("bench/v64/swar.wasm");
const simd = load("bench/v64/simd.wasm");
const ops = ["addLoop", "mulLoop", "minSLoop", "ltSLoop", "addSatSLoop"];
console.log(`iters=${ITERS.toLocaleString()} rounds=${ROUNDS} best-of (Mops/s)\n`);
console.log("op".padEnd(13), "SWAR".padStart(8), "SIMD".padStart(8), "  winner");
for (const op of ops) {
  const sw = bench(() => swar[op](ITERS, a, b));
  const si = bench(() => simd[op](ITERS, a, b));
  const win = si > sw ? `SIMD +${((si / sw - 1) * 100).toFixed(0)}%` : `SWAR +${((sw / si - 1) * 100).toFixed(0)}%`;
  console.log(op.padEnd(13), sw.toFixed(0).padStart(8), si.toFixed(0).padStart(8), "  " + win);
}
