export namespace bench_common {
  export const DEFAULT_OPS: u64 = 25_000_000;
  let s0: u64 = 0x0123456789abcdef;
  let s1: u64 = 0x8899aabbccddeeff;
  let s2: u64 = 0xfedcba9876543210;
  let s3: u64 = 0x7766554433221100;
  let s4: u64 = 0xaa55aa55aa55aa55;
  let s128: u64 = 0x9e3779b97f4a7c15;
  let suite64: u64 = 0;
  let suite64Alt: u64 = 0;
  let suiteA: u64 = 0;
  let suiteB: u64 = 0;
  let suiteM: u64 = 0;
  let suite128Lo: u64 = 0;
  let suite128Hi: u64 = 0;
  let next128_hi: u64 = 0;

  // @ts-expect-error: decorator
  @inline export function next64Step(x: u64): u64 {
    x ^= x << 13;
    x ^= x >> 7;
    x ^= x << 17;
    return x;
  }

  function refreshSuite(): void {
    s0 = next64Step(s0);
    s1 = next64Step(s1);
    s2 = next64Step(s2);
    s3 = next64Step(s3);
    s4 = next64Step(s4);
    s128 = next64Step(s128);
    suite64 = s0;
    suite64Alt = s1;
    suiteA = s2;
    suiteB = s3;
    suiteM = s4 ^ 0xaa55aa55aa55aa55;
    suite128Lo = s0;
    suite128Hi = s128;
  }

  // @ts-expect-error: decorator
  @inline export function advanceSuite(): void {
    refreshSuite();
  }

  // @ts-expect-error: decorator
  @inline export function next64(): u64 {
    return suite64;
  }

  // @ts-expect-error: decorator
  @inline export function next64Alt(): u64 {
    return suite64Alt;
  }

  // @ts-expect-error: decorator
  @inline export function nextA(): u64 {
    return suiteA;
  }

  // @ts-expect-error: decorator
  @inline export function nextB(): u64 {
    return suiteB;
  }

  // @ts-expect-error: decorator
  @inline export function nextM(): u64 {
    return suiteM;
  }

  // @ts-expect-error: decorator
  @inline export function next128(): u64 {
    next128_hi = suite128Hi;
    return suite128Lo;
  }

  // @ts-expect-error: decorator
  @inline export function next128Hi(): u64 {
    return next128_hi;
  }

  // @ts-expect-error: decorator
  @inline export function nextV128(): v128 {
    const lo = next128();
    const hi = next128Hi();
    return i64x2(lo as i64, hi as i64);
  }

  // @ts-expect-error: decorator
  @inline export function nextV128A(): v128 {
    return i64x2(nextA() as i64, nextB() as i64);
  }
}
