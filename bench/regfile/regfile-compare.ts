// Standalone benchmark comparing four ways to thread the 128-bit (lo, hi) pair
// through a SWAR op chain, to decide the v128 calling convention:
//   (a1) heap register file, COMPILE-TIME-CONSTANT register indices
//   (a2) heap register file, RUNTIME (dynamic) register indices
//   (b)  global hot-path: lo returned, hi via a single module global
//   (c)  multi-value: readonly [u64, u64] tuple return
// All four are pure integer SWAR (no native SIMD needed).

const M: u64 = 0x8080808080808080;

// ---- (a) heap register file ------------------------------------------------
const RF: usize = memory.data(64 * 16);
// @ts-expect-error: decorator
@inline function rfLo(r: u32): u64 {
  return load<u64>(RF + ((r as usize) << 4));
}
// @ts-expect-error: decorator
@inline function rfHi(r: u32): u64 {
  return load<u64>(RF + ((r as usize) << 4), 8);
}
// @ts-expect-error: decorator
@inline function rfSet(r: u32, lo: u64, hi: u64): void {
  const p = RF + ((r as usize) << 4);
  store<u64>(p, lo);
  store<u64>(p, hi, 8);
}
// @ts-expect-error: decorator
@inline function addHeap(dst: u32, a: u32, b: u32): void {
  const aLo = rfLo(a),
    aHi = rfHi(a),
    bLo = rfLo(b),
    bHi = rfHi(b);
  rfSet(
    dst,
    ((aLo & ~M) + (bLo & ~M)) ^ ((aLo ^ bLo) & M),
    ((aHi & ~M) + (bHi & ~M)) ^ ((aHi ^ bHi) & M),
  );
}
// @ts-expect-error: decorator
@inline function ltSHeap(dst: u32, a: u32, b: u32): void {
  const aLo = rfLo(a),
    aHi = rfHi(a),
    bLo = rfLo(b),
    bHi = rfHi(b);
  const axLo = aLo ^ M,
    bxLo = bLo ^ M;
  const dLo = ((axLo | M) - (bxLo & ~M)) ^ ((axLo ^ ~bxLo) & M);
  const axHi = aHi ^ M,
    bxHi = bHi ^ M;
  const dHi = ((axHi | M) - (bxHi & ~M)) ^ ((axHi ^ ~bxHi) & M);
  rfSet(
    dst,
    ((((~axLo & bxLo) | (~(axLo ^ bxLo) & dLo)) & M) >> 7) * 0xff,
    ((((~axHi & bxHi) | (~(axHi ^ bxHi) & dHi)) & M) >> 7) * 0xff,
  );
}

// ---- (b) global hot-path ---------------------------------------------------
let gHi: u64 = 0;
// @ts-expect-error: decorator
@inline function addGlobal(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  gHi = ((aHi & ~M) + (bHi & ~M)) ^ ((aHi ^ bHi) & M);
  return ((aLo & ~M) + (bLo & ~M)) ^ ((aLo ^ bLo) & M);
}
// @ts-expect-error: decorator
@inline function ltSGlobal(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const axLo = aLo ^ M,
    bxLo = bLo ^ M;
  const dLo = ((axLo | M) - (bxLo & ~M)) ^ ((axLo ^ ~bxLo) & M);
  const axHi = aHi ^ M,
    bxHi = bHi ^ M;
  const dHi = ((axHi | M) - (bxHi & ~M)) ^ ((axHi ^ ~bxHi) & M);
  gHi = ((((~axHi & bxHi) | (~(axHi ^ bxHi) & dHi)) & M) >> 7) * 0xff;
  return ((((~axLo & bxLo) | (~(axLo ^ bxLo) & dLo)) & M) >> 7) * 0xff;
}

// @ts-expect-error: decorator
@inline function mixStep(x: u64): u64 {
  let z = x + 0x9e3779b97f4a7c15;
  z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9;
  z = (z ^ (z >> 27)) * 0x94d049bb133111eb;
  return z ^ (z >> 31);
}

// ===== add loops ============================================================
export function addHeapConst(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  rfSet(0, aLo, aHi);
  rfSet(1, bLo, bHi);
  for (let i: u32 = 0; i < iters; ++i) {
    addHeap(0, 0, 1); // constant register indices
    rfSet(1, mixStep(rfLo(1) ^ rfLo(0)), mixStep(rfHi(1) ^ rfHi(0)));
  }
  return rfLo(0) ^ rfHi(0) ^ rfLo(1) ^ rfHi(1);
}
export function addHeapDyn(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  rfSet(0, aLo, aHi);
  rfSet(1, bLo, bHi);
  for (let i: u32 = 0; i < iters; ++i) {
    const d = i & 7; // runtime-varying indices the optimizer can't fold
    const s = 8 + (i & 7);
    rfSet(s, rfLo(0), rfHi(0));
    addHeap(d, s, 1);
    rfSet(0, rfLo(d), rfHi(d));
    rfSet(1, mixStep(rfLo(1) ^ rfLo(0)), mixStep(rfHi(1) ^ rfHi(0)));
  }
  return rfLo(0) ^ rfHi(0) ^ rfLo(1) ^ rfHi(1);
}
export function addGlobalLoop(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi,
    xLo = bLo,
    xHi = bHi;
  for (let i: u32 = 0; i < iters; ++i) {
    lo = addGlobal(lo, hi, xLo, xHi);
    hi = gHi;
    xLo = mixStep(xLo ^ lo);
    xHi = mixStep(xHi ^ hi);
  }
  return lo ^ hi ^ xLo ^ xHi;
}

// ===== lt_s loops ===========================================================
export function ltSHeapConst(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  rfSet(0, aLo, aHi);
  rfSet(1, bLo, bHi);
  for (let i: u32 = 0; i < iters; ++i) {
    ltSHeap(0, 0, 1);
    rfSet(1, mixStep(rfLo(1) ^ rfLo(0)), mixStep(rfHi(1) ^ rfHi(0)));
  }
  return rfLo(0) ^ rfHi(0) ^ rfLo(1) ^ rfHi(1);
}
export function ltSGlobalLoop(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi,
    xLo = bLo,
    xHi = bHi;
  for (let i: u32 = 0; i < iters; ++i) {
    lo = ltSGlobal(lo, hi, xLo, xHi);
    hi = gHi;
    xLo = mixStep(xLo ^ lo);
    xHi = mixStep(xHi ^ hi);
  }
  return lo ^ hi ^ xLo ^ xHi;
}

// ===== chained madd: t = (a+b) ; t = (t<x) ; mixes multiple live values =====
export function maddHeapConst(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  rfSet(0, aLo, aHi);
  rfSet(1, bLo, bHi);
  rfSet(2, aHi, bLo);
  for (let i: u32 = 0; i < iters; ++i) {
    addHeap(3, 0, 1);
    ltSHeap(0, 3, 2);
    rfSet(2, mixStep(rfLo(2) ^ rfLo(0)), mixStep(rfHi(2) ^ rfHi(3)));
  }
  return rfLo(0) ^ rfHi(0) ^ rfLo(2) ^ rfHi(2);
}
export function maddGlobalLoop(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi,
    xLo = bLo,
    xHi = bHi,
    cLo = aHi,
    cHi = bLo;
  for (let i: u32 = 0; i < iters; ++i) {
    let tLo = addGlobal(lo, hi, xLo, xHi);
    let tHi = gHi;
    lo = ltSGlobal(tLo, tHi, cLo, cHi);
    hi = gHi;
    cLo = mixStep(cLo ^ lo);
    cHi = mixStep(cHi ^ tHi);
  }
  return lo ^ hi ^ cLo ^ cHi;
}
