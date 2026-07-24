function blend(a: v128, b: v128): v128 {
  const sum = v128.add<i8>(a, b);
  const delta = v128.sub<i8>(a, b);
  return v128.xor(sum, delta);
}

export function autoV128(a: i8, b: i8): i32 {
  const av: v128 = v128.splat<i8>(a);
  const bv: v128 = v128.splat<i8>(b);
  const mixed: v128 = blend(av, bv);
  const expected: v128 = v128.splat<i8>(((a + b) as i8) ^ ((a - b) as i8));
  const equal: v128 = v128.eq<i8>(mixed, expected);
  return (
    (v128.extract_lane<i8>(mixed, 7) as i32) ^ (v128.bitmask<i8>(equal) << 8)
  );
}

export function autoV128Memory(ptr: usize, a: i32, b: i32): i32 {
  const av = v128.load(ptr);
  const bias = v128.add<i32>(v128.splat<i32>(a), v128.splat<i32>(b));
  v128.store(ptr, v128.add<i32>(av, bias));
  return v128.any_true(v128.eq<i32>(av, v128.load(ptr))) ? 1 : 0;
}
