# Internal register-file design notes

> This document describes internal benchmarking machinery. The package root
> exports the value-shaped `v128`, `v256`, and `v512` APIs; register-indexed
> `*r` namespaces are not a separate public API.

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

2. **Internal register-file API** — `rf` (statically reserved, 64 × 16-byte slots) plus
   `v128r`, a register-indexed VM used by benchmarks and width-tuning work. Vectors live in numbered registers; every op
   names operands and destination by index:

   ```ts
   rf.set(0, aLo, aHi);
   rf.set(1, bLo, bHi);
   v128r.add<i8>(2, 0, 1);     // reg2 = reg0 + reg1
   const lo = rf.lo(2), hi = rf.hi(2);
   ```

   WebAssembly globals cannot be indexed by a runtime value, so the file is in
   linear memory (`memory.data(64*16, 16)`); that is what makes 64 dynamically
   indexable registers possible. The base is resolved eagerly to a fixed data
   address, eliminating lazy-initialization branches from hot operations.
   Aliasing (`dst == src`) is safe: every operand is loaded before the
   destination is written.

   SIMD builds use direct `v128.load → operation → v128.store` kernels where
   measurement shows a win (lane arithmetic, saturation, comparisons,
   narrowing, conversions, and relaxed SIMD). Simple word operations retain
   their faster scalar path. Lane extraction is one typed load; replacement is
   a fixed-width copy plus one typed store.

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

These historical results predate eager bases and direct native register
kernels. Current per-operation measurements are maintained in
[`charts/chart-register-v8.md`](../charts/chart-register-v8.md); scalar hot
paths can still win for simple operations, while lane-heavy native operations
are substantially faster. (The multi-value variant is not benchmarkable — it
does not compile on the released compiler.)

## Decision

Expose one value-oriented contract: `v128`, `v256`, and `v512` use matching
signatures and return vector values. Keep the register file internal for
benchmarking and implementation experiments, and retain `v128_swar` as the
explicit allocation-free low-level primitive.
