let currentHi: u64 = 0;

// @ts-expect-error: decorator
@inline function currentPair(lo: u64, hi: u64): u64 {
  currentHi = hi;
  return lo;
}

// @ts-expect-error: decorator
@inline function addCurrent(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  return currentPair(
    ((aLo & ~0x8080808080808080) + (bLo & ~0x8080808080808080)) ^ ((aLo ^ bLo) & 0x8080808080808080),
    ((aHi & ~0x8080808080808080) + (bHi & ~0x8080808080808080)) ^ ((aHi ^ bHi) & 0x8080808080808080),
  );
}

// @ts-expect-error: decorator
@inline function addMulti(aLo: u64, aHi: u64, bLo: u64, bHi: u64): readonly [u64, u64] {
  return [
    ((aLo & ~0x8080808080808080) + (bLo & ~0x8080808080808080)) ^ ((aLo ^ bLo) & 0x8080808080808080),
    ((aHi & ~0x8080808080808080) + (bHi & ~0x8080808080808080)) ^ ((aHi ^ bHi) & 0x8080808080808080),
  ];
}

// @ts-expect-error: decorator
@inline function ltSCurrent(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const axLo = aLo ^ 0x8080808080808080;
  const bxLo = bLo ^ 0x8080808080808080;
  const dLo = ((axLo | 0x8080808080808080) - (bxLo & 0x7f7f7f7f7f7f7f7f)) ^ ((axLo ^ ~bxLo) & 0x8080808080808080);
  const axHi = aHi ^ 0x8080808080808080;
  const bxHi = bHi ^ 0x8080808080808080;
  const dHi = ((axHi | 0x8080808080808080) - (bxHi & 0x7f7f7f7f7f7f7f7f)) ^ ((axHi ^ ~bxHi) & 0x8080808080808080);
  return currentPair(
    ((((~axLo & bxLo) | (~(axLo ^ bxLo) & dLo)) & 0x8080808080808080) >> 7) * 0xff,
    ((((~axHi & bxHi) | (~(axHi ^ bxHi) & dHi)) & 0x8080808080808080) >> 7) * 0xff,
  );
}

// @ts-expect-error: decorator
@inline function ltSMulti(aLo: u64, aHi: u64, bLo: u64, bHi: u64): readonly [u64, u64] {
  const axLo = aLo ^ 0x8080808080808080;
  const bxLo = bLo ^ 0x8080808080808080;
  const dLo = ((axLo | 0x8080808080808080) - (bxLo & 0x7f7f7f7f7f7f7f7f)) ^ ((axLo ^ ~bxLo) & 0x8080808080808080);
  const axHi = aHi ^ 0x8080808080808080;
  const bxHi = bHi ^ 0x8080808080808080;
  const dHi = ((axHi | 0x8080808080808080) - (bxHi & 0x7f7f7f7f7f7f7f7f)) ^ ((axHi ^ ~bxHi) & 0x8080808080808080);
  return [
    ((((~axLo & bxLo) | (~(axLo ^ bxLo) & dLo)) & 0x8080808080808080) >> 7) * 0xff,
    ((((~axHi & bxHi) | (~(axHi ^ bxHi) & dHi)) & 0x8080808080808080) >> 7) * 0xff,
  ];
}

// @ts-expect-error: decorator
@inline function mixStep(x: u64): u64 {
  let z = x + 0x9e3779b97f4a7c15;
  z = (z ^ (z >> 30)) * 0xbf58476d1ce4e5b9;
  z = (z ^ (z >> 27)) * 0x94d049bb133111eb;
  return z ^ (z >> 31);
}

export function addCurrentLoop(iters: u32, aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  let lo = aLo;
  let hi = aHi;
  let xLo = bLo;
  let xHi = bHi;
  for (let i: u32 = 0; i < iters; ++i) {
    lo = addCurrent(lo, hi, xLo, xHi);
    hi = currentHi;
    xLo = mixStep(xLo + lo);
    xHi = mixStep(xHi + hi);
  }
  return lo ^ hi ^ xLo ^ xHi;
}

export function addMultiLoop(iters: u32, aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  let lo = aLo;
  let hi = aHi;
  let xLo = bLo;
  let xHi = bHi;
  for (let i: u32 = 0; i < iters; ++i) {
    const pair = addMulti(lo, hi, xLo, xHi);
    lo = pair[0];
    hi = pair[1];
    xLo = mixStep(xLo + lo);
    xHi = mixStep(xHi + hi);
  }
  return lo ^ hi ^ xLo ^ xHi;
}

export function ltSCurrentLoop(iters: u32, aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  let lo = aLo;
  let hi = aHi;
  let xLo = bLo;
  let xHi = bHi;
  for (let i: u32 = 0; i < iters; ++i) {
    lo = ltSCurrent(lo, hi, xLo, xHi);
    hi = currentHi;
    xLo = mixStep(xLo + lo);
    xHi = mixStep(xHi + hi);
  }
  return lo ^ hi ^ xLo ^ xHi;
}

export function ltSMultiLoop(iters: u32, aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  let lo = aLo;
  let hi = aHi;
  let xLo = bLo;
  let xHi = bHi;
  for (let i: u32 = 0; i < iters; ++i) {
    const pair = ltSMulti(lo, hi, xLo, xHi);
    lo = pair[0];
    hi = pair[1];
    xLo = mixStep(xLo + lo);
    xHi = mixStep(xHi + hi);
  }
  return lo ^ hi ^ xLo ^ xHi;
}

export function addMultiRaw(aLo: u64, aHi: u64, bLo: u64, bHi: u64): readonly [u64, u64] {
  return addMulti(aLo, aHi, bLo, bHi);
}

export function ltSMultiRaw(aLo: u64, aHi: u64, bLo: u64, bHi: u64): readonly [u64, u64] {
  return ltSMulti(aLo, aHi, bLo, bHi);
}
