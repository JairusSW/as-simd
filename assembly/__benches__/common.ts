export namespace bench_common {
  export const DEFAULT_OPS: u64 = 25_000_000;
  let s0: u64 = 0x0123456789abcdef;
  let s1: u64 = 0x8899aabbccddeeff;
  let s2: u64 = 0xfedcba9876543210;
  let s3: u64 = 0x7766554433221100;
  let s4: u64 = 0xaa55aa55aa55aa55;
  let s128: u64 = 0x9e3779b97f4a7c15;
  let next128_hi: u64 = 0;

  // @ts-expect-error: decorator
  @inline export function next64Step(x: u64): u64 {
    x ^= x << 13;
    x ^= x >> 7;
    x ^= x << 17;
    return x;
  }

  // @ts-expect-error: decorator
  @inline export function next64(): u64 {
    s0 = next64Step(s0);
    return s0;
  }

  // @ts-expect-error: decorator
  @inline export function next64Alt(): u64 {
    s1 = next64Step(s1);
    return s1;
  }

  // @ts-expect-error: decorator
  @inline export function nextA(): u64 {
    s0 = next64Step(s0);
    s2 = next64Step(s2);
    return s0 ^ (s2 >> 17);
  }

  // @ts-expect-error: decorator
  @inline export function nextB(): u64 {
    s1 = next64Step(s1);
    s3 = next64Step(s3);
    return s1 ^ (s3 << 13);
  }

  // @ts-expect-error: decorator
  @inline export function nextM(): u64 {
    s4 = next64Step(s4);
    return s4 ^ 0xaa55aa55aa55aa55;
  }

  // @ts-expect-error: decorator
  @inline export function next128(): u64 {
    const lo = next64();
    s128 = next64Step(s128);
    next128_hi = s128;
    return lo;
  }

  // @ts-expect-error: decorator
  @inline export function next128Hi(): u64 {
    return next128_hi;
  }

  // @ts-expect-error: decorator
  @inline export function nextV128(): v128 {
    return i64x2(next64() as i64, next64Alt() as i64);
  }

  // @ts-expect-error: decorator
  @inline export function nextV128A(): v128 {
    return i64x2(nextA() as i64, nextB() as i64);
  }
}
