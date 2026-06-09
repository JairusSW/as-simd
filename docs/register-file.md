# 128-bit register file & calling convention

`as-simd` represents a 128-bit SWAR vector as two `u64` halves (`lo`, `hi`).
Functions can only return one value, so the high half has to travel some other
way. This document records the design we ship and why.

## Two layers

1. **Value / "hot-path" API** — `v128_swar`, `i8x16_swar`, `i16x8_swar`,
   `i32x4_swar`, `i64x2_swar`. Each op takes the operand halves by value, returns
   `lo`, and stashes `hi` in a per-namespace module global retrieved with
   `take_hi()`:

   ```ts
   const lo = i8x16_swar.add(aLo, aHi, bLo, bHi);
   const hi = i8x16_swar.take_hi();
   ```

   This is the fastest convention in tight loops (the optimizer keeps everything
   in wasm locals) and is what the higher layer is built on.

2. **Register file / primary API** — `rf` (heap-backed, 64 × 16-byte slots) plus
   `v128r`, a register-indexed VM. Vectors live in numbered registers; every op
   names operands and destination by index:

   ```ts
   rf.set(0, aLo, aHi);
   rf.set(1, bLo, bHi);
   v128r.add<i8>(2, 0, 1);     // reg2 = reg0 + reg1
   const lo = rf.lo(2), hi = rf.hi(2);
   ```

   WebAssembly globals cannot be indexed by a runtime value, so the file is in
   linear memory (`memory.data(64*16)`); that is what makes 64 dynamically
   indexable registers possible. Aliasing (`dst == src`) is safe: every operand
   half is loaded before the destination is written.

## Why not multi-value?

The original `i8x16_swar` returned `readonly [u64, u64]` tuples behind
`--enable multi-value`. The released AssemblyScript compiler (0.28.x) does **not**
implement tuple types once they are actually used — it raises
`AS100: Not implemented: Tuple types` (it only "compiled" before because the
tuple calls sat in dead `ASC_FEATURE_SIMD` branches). Multi-value was removed
entirely; all v128 types now use the single-global convention above.

## Heap vs global benchmark

`bench/regfile/` compares threading the pair through a dependency chain via the
heap register file (constant and dynamic indices) vs the global hot-path. Run:

```
node node_modules/assemblyscript/bin/asc.js bench/regfile/regfile-compare.ts \
  --enable sign-extension -O3 --converge --runtime stub --exportStart _start \
  -o bench/regfile/rc.wasm
node bench/regfile/run.mjs
```

Representative result (V8 / Node, 20M iters, best-of-9):

| workload | heap (const idx) | heap (dyn idx) | global hot-path |
|----------|-----------------:|---------------:|----------------:|
| add      | 75%              | 70%            | **100%**        |
| lt_s     | 80%              | —              | **100%**        |
| madd     | 83%              | —              | **100%**        |

The global/value path is ~20–30% faster in tight loops; constant-index heap
forwarding closes much of the gap but does not beat it. (The multi-value variant
is not benchmarkable — it does not compile on the released compiler.)

## Decision

Ship **both**: the register file (`rf` + `v128r`) is the primary, ergonomic
64-register interface; the value API (`*_swar`) is retained and documented as the
hot-path for inner loops where it measurably wins.
