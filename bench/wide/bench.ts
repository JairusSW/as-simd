import { v128_swar } from "../../assembly/v128/value";
import { rf } from "../../assembly/v128/regfile";
import { v128_kernels } from "../../assembly/v128/kernels";
import { wrf } from "../../assembly/wide/regfile";
import { v256r, v512r } from "../../assembly/wide/wide";

// Offset the I/O fixture from the 4 KiB-wide register file's page offset.
// Using the immediately adjacent address creates a pathological 4K-alias
// dependency in V8's generated machine code that is unrelated to vector I/O.
const wideIo = memory.data(128) + 64;

export function v128AddI8(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.add<i8>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}

export function v128MinI8(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.min<i8>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
    bLo += 0x0101010101010101;
    bHi -= 0x0101010101010101;
  }
  return lo ^ hi;
}

export function v128MulI8(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.mul<i8>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}

export function v128MulI64(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.mul<i64>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}

export function v128LtI32(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.lt<i32>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}

export function v128LtU32(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.lt<u32>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}

export function v128LeI32(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.le<i32>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}

export function v128LeU32(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.le<u32>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}

export function v128NeI32(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.ne<i32>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}

export function v128LtI8(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.lt<i8>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128LeI8(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.le<i8>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128LtI16(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.lt<i16>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128LeI16(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.le<i16>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128LtI64(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.lt<i64>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128LeI64(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.le<i64>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128EqI32(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.eq<i32>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128EqI64(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.eq<i64>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}

export function v128AnyTrue(iters: u32, aLo: u64, aHi: u64): u64 {
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) {
    sink += v128_swar.any_true(aLo, aHi) as u64;
    aLo += 0x0101010101010101;
    aHi ^= aLo;
  }
  return sink ^ aLo ^ aHi;
}
export function v128AllTrueI8(iters: u32, aLo: u64, aHi: u64): u64 {
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) {
    sink += v128_swar.all_true<i8>(aLo, aHi) as u64;
    aLo += 0x0101010101010101;
    aHi ^= aLo;
  }
  return sink ^ aLo ^ aHi;
}
export function v128AllTrueI32(iters: u32, aLo: u64, aHi: u64): u64 {
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) {
    sink += v128_swar.all_true<i32>(aLo, aHi) as u64;
    aLo += 0x0101010101010101;
    aHi ^= aLo;
  }
  return sink ^ aLo ^ aHi;
}
export function v128AllTrueI64(iters: u32, aLo: u64, aHi: u64): u64 {
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) {
    sink += v128_swar.all_true<i64>(aLo, aHi) as u64;
    aLo += 0x0101010101010101;
    aHi ^= aLo;
  }
  return sink ^ aLo ^ aHi;
}
export function v128BitmaskI8(iters: u32, aLo: u64, aHi: u64): u64 {
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) {
    sink += v128_swar.bitmask<i8>(aLo, aHi) as u64;
    aLo += 0x0101010101010101;
    aHi ^= aLo;
  }
  return sink ^ aLo ^ aHi;
}
export function v128BitmaskI32(iters: u32, aLo: u64, aHi: u64): u64 {
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) {
    sink += v128_swar.bitmask<i32>(aLo, aHi) as u64;
    aLo += 0x0101010101010101;
    aHi ^= aLo;
  }
  return sink ^ aLo ^ aHi;
}
export function v128BitmaskI64(iters: u32, aLo: u64, aHi: u64): u64 {
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) {
    sink += v128_swar.bitmask<i64>(aLo, aHi) as u64;
    aLo += 0x0101010101010101;
    aHi ^= aLo;
  }
  return sink ^ aLo ^ aHi;
}

export function v128MinI32(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.min<i32>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128MaxI32(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.max<i32>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128AbsI32(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.abs<i32>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128NegI32(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.neg<i32>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128ShlI32(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.shl<i32>(lo, hi, 13);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128ShrI32(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.shr<i32>(lo, hi, 13);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128AbsI64(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.abs<i64>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128NegI64(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.neg<i64>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}

export function v128AddI16(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.add<i16>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128SubI16(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.sub<i16>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128AddI32(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.add<i32>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128SubI32(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.sub<i32>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128AddI64(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.add<i64>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128SubI64(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.sub<i64>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128MulI16(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.mul<i16>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128MulI32(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.mul<i32>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128AddSatI8(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.add_sat<i8>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128AddSatI16(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.add_sat<i16>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128SubSatI8(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.sub_sat<i8>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128SubSatI16(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.sub_sat<i16>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128AvgrU8(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.avgr<u8>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128AvgrU16(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.avgr<u16>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128PopcntI8(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.popcnt<i8>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128DotI16(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.dot<i16>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128NegI8(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.neg<i8>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128NegI16(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.neg<i16>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128AbsI8(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.abs<i8>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128AbsI16(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.abs<i16>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128ShlI8(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.shl<i8>(lo, hi, 3);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128ShlI16(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.shl<i16>(lo, hi, 7);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128ShrI8(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.shr<i8>(lo, hi, 3);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128ShrI16(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.shr<i16>(lo, hi, 7);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128MaxI8(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.max<i8>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128MinI16(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.min<i16>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128MaxI16(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.max<i16>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128Swizzle(
  iters: u32,
  aLo: u64,
  aHi: u64,
  sLo: u64,
  sHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.swizzle(lo, hi, sLo, sHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128SqrtF32(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.sqrt<f32>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128SqrtF64(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.sqrt<f64>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128CeilF32(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.ceil<f32>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128CeilF64(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.ceil<f64>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128NearestF32(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.nearest<f32>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128NearestF64(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.nearest<f64>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128ConvertI32(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.convert<i32>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128ConvertLowI32(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.convert_low<i32>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128TruncSatI32(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.trunc_sat<i32>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128NarrowI16(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.narrow<i16>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128NarrowI32(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.narrow<i32>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128ExtendLowI8(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.extend_low<i8>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128ExtendLowI16(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.extend_low<i16>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128ExtendLowI32(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.extend_low<i32>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128ExtaddI8(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.extadd_pairwise<i8>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128ExtmulI8(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.extmul_low<i8>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128ExtmulI16(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.extmul_low<i16>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128ExtmulI32(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.extmul_low<i32>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128TruncSatZeroI32(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.trunc_sat_zero<i32>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128ExtaddI16(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.extadd_pairwise<i16>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128DemoteF64(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.demote_zero<f64>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128PromoteF32(iters: u32, aLo: u64, aHi: u64): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.promote_low<f32>(lo, hi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128Q15Mulr(
  iters: u32,
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
): u64 {
  let lo = aLo,
    hi = aHi;
  for (let i: u32 = 0; i < iters; i++) {
    lo = v128_swar.q15mulr_sat<i16>(lo, hi, bLo, bHi);
    hi = v128_swar.take_hi();
  }
  return lo ^ hi;
}
export function v128RelaxedSwizzle(
  aLo: u64,
  aHi: u64,
  sLo: u64,
  sHi: u64,
): u64 {
  const lo = v128_swar.relaxed_swizzle(aLo, aHi, sLo, sHi);
  return lo ^ v128_swar.take_hi();
}
export function v128RelaxedMaddF32(
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
  cLo: u64,
  cHi: u64,
): u64 {
  const lo = v128_swar.relaxed_madd<f32>(aLo, aHi, bLo, bHi, cLo, cHi);
  return lo ^ v128_swar.take_hi();
}
export function v128RelaxedLaneselectI8(
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
  mLo: u64,
  mHi: u64,
): u64 {
  const lo = v128_swar.relaxed_laneselect<i8>(aLo, aHi, bLo, bHi, mLo, mHi);
  return lo ^ v128_swar.take_hi();
}
export function v128RelaxedMinF32(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const lo = v128_swar.relaxed_min<f32>(aLo, aHi, bLo, bHi);
  return lo ^ v128_swar.take_hi();
}
export function v128RelaxedQ15(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const lo = v128_swar.relaxed_q15mulr<i16>(aLo, aHi, bLo, bHi);
  return lo ^ v128_swar.take_hi();
}
export function v128RelaxedDot(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const lo = v128_swar.relaxed_dot<i8>(aLo, aHi, bLo, bHi);
  return lo ^ v128_swar.take_hi();
}
export function v128RelaxedDotAdd(
  aLo: u64,
  aHi: u64,
  bLo: u64,
  bHi: u64,
  cLo: u64,
  cHi: u64,
): u64 {
  const lo = v128_swar.relaxed_dot_add<i8>(aLo, aHi, bLo, bHi, cLo, cHi);
  return lo ^ v128_swar.take_hi();
}

export function v256AddI8(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.add<i8>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256MinI8(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.min<i8>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256Bitselect(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
    wrf.set128(2, c, 0x00ff00ff00ff00ff, 0xff00ff00ff00ff00);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.bitselect(0, 0, 1, 2);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256MulI8(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.mul<i8>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256MulI64(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.mul<i64>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256AddI64(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.add<i64>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256SubI64(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.sub<i64>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256MinI32(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.min<i32>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256MinI64(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.min<i64>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256LtI32(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.lt<i32>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256LtI64(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.lt<i64>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256LtU64(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.lt<u64>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256EqI64(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.eq<i64>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256NegI64(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.neg<i64>(0, 0);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256AbsI64(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.abs<i64>(0, 0);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256ShlI64(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.shl<i64>(0, 0, 13);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256ShrI64(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.shr<i64>(0, 0, 13);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256SplatI64(iters: u32, a: i64): u64 {
  for (let i: u32 = 0; i < iters; i++) v256r.splat<i64>(0, a);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256NegI32(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.neg<i32>(0, 0);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256AbsI32(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.abs<i32>(0, 0);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256ShlI32(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.shl<i32>(0, 0, 13);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256ShrI32(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.shr<i32>(0, 0, 13);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256NegI8(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.neg<i8>(0, 0);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256AbsI8(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.abs<i8>(0, 0);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256ShlI8(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.shl<i8>(0, 0, 3);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256ShrI8(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.shr<i8>(0, 0, 3);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256NegI16(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.neg<i16>(0, 0);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256AbsI16(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.abs<i16>(0, 0);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256ShlI16(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.shl<i16>(0, 0, 7);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256ShrI16(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.shr<i16>(0, 0, 7);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256AddSatI16(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.add_sat<i16>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256SubSatI16(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.sub_sat<i16>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256AvgrU16(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.avgr<u16>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256AvgrU8(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.avgr<u8>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}

export function v512AddI8(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.add<i8>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}

export function v512MinI8(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.min<i8>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}

export function v512Xor(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.xor(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}

export function v256And(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.and(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256Or(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.or(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256Xor(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v256r.xor(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256Not(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.not(0, 0);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v512And(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.and(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512Or(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.or(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512Not(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v512r.not(0, 0);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}

export function v512Bitselect(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
    wrf.set128(2, c, 0x00ff00ff00ff00ff, 0xff00ff00ff00ff00);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.bitselect(0, 0, 1, 2);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}

export function v512AnyTrue(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v512r.any_true(0) as u64;
  return sink;
}

export function v512AnyTrueZero(iters: u32): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, 0, 0);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v512r.any_true(0) as u64;
  return sink;
}

export function v256AnyTrue(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v256r.any_true(0) as u64;
  return sink;
}

export function v256AnyTrueZero(iters: u32): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, 0, 0);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v256r.any_true(0) as u64;
  return sink;
}

export function v256AllTrueI8(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++)
    wrf.set128(0, c, a | 0x0101010101010101, ~a | 0x0101010101010101);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v256r.all_true<i8>(0) as u64;
  return sink;
}
export function v256AllTrueI32(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++)
    wrf.set128(0, c, a | 0x0000000100000001, ~a | 0x0000000100000001);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v256r.all_true<i32>(0) as u64;
  return sink;
}
export function v256AllTrueI64(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a | 1, ~a | 1);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v256r.all_true<i64>(0) as u64;
  return sink;
}
export function v512AllTrueI8(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++)
    wrf.set128(0, c, a | 0x0101010101010101, ~a | 0x0101010101010101);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v512r.all_true<i8>(0) as u64;
  return sink;
}
export function v512AllTrueI32(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++)
    wrf.set128(0, c, a | 0x0000000100000001, ~a | 0x0000000100000001);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v512r.all_true<i32>(0) as u64;
  return sink;
}
export function v512AllTrueI64(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a | 1, ~a | 1);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v512r.all_true<i64>(0) as u64;
  return sink;
}
export function v256BitmaskI8(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v256r.bitmask<i8>(0);
  return sink;
}
export function v256BitmaskI32(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v256r.bitmask<i32>(0);
  return sink;
}
export function v256BitmaskI64(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v256r.bitmask<i64>(0);
  return sink;
}
export function v512BitmaskI8(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v512r.bitmask<i8>(0);
  return sink;
}
export function v512BitmaskI32(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v512r.bitmask<i32>(0);
  return sink;
}
export function v512BitmaskI64(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v512r.bitmask<i64>(0);
  return sink;
}

export function v512ShlI16(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v512r.shl<i16>(0, 0, 3);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}

export function v512LtI16(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.lt<i16>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}

export function v512AddSatI16(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.add_sat<i16>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}

export function v512MulI8(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.mul<i8>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}

export function v512MulI16(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.mul<i16>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}

export function v512MulI64(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.mul<i64>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512AddI64(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.add<i64>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512SubI64(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.sub<i64>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512MinI32(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.min<i32>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512MinI64(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.min<i64>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512LtI32(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.lt<i32>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512LtI64(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.lt<i64>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512LtU64(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.lt<u64>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512EqI64(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.eq<i64>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512NegI64(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v512r.neg<i64>(0, 0);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512AbsI64(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v512r.abs<i64>(0, 0);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512ShlI64(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v512r.shl<i64>(0, 0, 13);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512ShrI64(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v512r.shr<i64>(0, 0, 13);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512SplatI64(iters: u32, a: i64): u64 {
  for (let i: u32 = 0; i < iters; i++) v512r.splat<i64>(0, a);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512NegI32(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v512r.neg<i32>(0, 0);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512AbsI32(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v512r.abs<i32>(0, 0);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512ShlI32(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v512r.shl<i32>(0, 0, 13);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512ShrI32(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v512r.shr<i32>(0, 0, 13);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512SubSatI16(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.sub_sat<i16>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512AvgrU16(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.avgr<u16>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512AvgrU8(iters: u32, a: u64, b: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) {
    wrf.set128(0, c, a + c, ~a - c);
    wrf.set128(1, c, b - c, ~b + c);
  }
  for (let i: u32 = 0; i < iters; i++) v512r.avgr<u8>(0, 0, 1);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}

export function v256Load(iters: u32, a: u64): u64 {
  for (let i: u32 = 0; i < 4; i++)
    store<u64>(wideIo + ((i as usize) << 3), a + i);
  for (let i: u32 = 0; i < iters; i++) v256r.load(0, wideIo);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v256Store(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v256r.store(wideIo, 0);
  return load<u64>(wideIo) ^ load<u64>(wideIo + 24);
}
export function v512Load(iters: u32, a: u64): u64 {
  for (let i: u32 = 0; i < 8; i++)
    store<u64>(wideIo + ((i as usize) << 3), a + i);
  for (let i: u32 = 0; i < iters; i++) v512r.load(0, wideIo);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v512Store(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++) v512r.store(wideIo, 0);
  return load<u64>(wideIo) ^ load<u64>(wideIo + 56);
}
export function v256ReplaceLane(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++)
    v256r.replace_lane<i16>(1, 0, 13, i as i16);
  return wrf.lo(1, 0) ^ wrf.hi(1, 1);
}
export function v256ReplaceLaneInPlace(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++)
    v256r.replace_lane<i16>(0, 0, 13, i as i16);
  return wrf.lo(0, 0) ^ wrf.hi(0, 1);
}
export function v512ReplaceLane(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++)
    v512r.replace_lane<i16>(1, 0, 29, i as i16);
  return wrf.lo(1, 0) ^ wrf.hi(1, 3);
}
export function v512ReplaceLaneInPlace(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  for (let i: u32 = 0; i < iters; i++)
    v512r.replace_lane<i16>(0, 0, 29, i as i16);
  return wrf.lo(0, 0) ^ wrf.hi(0, 3);
}
export function v256ReplaceLaneLegacy(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  const dp = wrf.addr(1),
    ap = wrf.addr(0);
  for (let i: u32 = 0; i < iters; i++) {
    memory.copy(dp, ap, 32);
    const lo = v128_swar.replace_lane<i16>(
      load<u64>(ap + 16),
      load<u64>(ap + 24),
      5,
      i as i16,
    );
    store<u64>(dp + 16, lo);
    store<u64>(dp + 24, v128_swar.take_hi());
  }
  return wrf.lo(1, 0) ^ wrf.hi(1, 1);
}
export function v512ReplaceLaneLegacy(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  const dp = wrf.addr(1),
    ap = wrf.addr(0);
  for (let i: u32 = 0; i < iters; i++) {
    memory.copy(dp, ap, 64);
    const lo = v128_swar.replace_lane<i16>(
      load<u64>(ap + 48),
      load<u64>(ap + 56),
      5,
      i as i16,
    );
    store<u64>(dp + 48, lo);
    store<u64>(dp + 56, v128_swar.take_hi());
  }
  return wrf.lo(1, 0) ^ wrf.hi(1, 3);
}
export function v256ExtractLane(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 2; c++) wrf.set128(0, c, a + c, ~a - c);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++)
    sink += v256r.extract_lane<i16>(0, i & 15) as u16 as u64;
  return sink;
}
export function v512ExtractLane(iters: u32, a: u64): u64 {
  for (let c: u32 = 0; c < 4; c++) wrf.set128(0, c, a + c, ~a - c);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++)
    sink += v512r.extract_lane<i16>(0, i & 31) as u16 as u64;
  return sink;
}

export function v128rAddI8(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.add<i8>(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}

export function v128rMinI8(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.min<i8>(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rMulI8(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.mul<i8>(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rAddSatI16(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.add_sat<i16>(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rXor(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.xor(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rBitselect(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  rf.set(2, 0x00ff00ff00ff00ff, 0xff00ff00ff00ff00);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.bitselect(0, 0, 1, 2);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rBitmaskI8(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++)
    sink += v128_kernels.bitmask<i8>(0) as u32 as u64;
  return sink;
}
export function v128rMaxI16(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.max<i16>(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rSubSatI8(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.sub_sat<i8>(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rDotI16(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.dot<i16>(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rLtI8(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.lt<i8>(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rAllTrueI8(iters: u32, a: u64): u64 {
  rf.set(0, a | 0x0101010101010101, ~a | 0x0101010101010101);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++)
    sink += v128_kernels.all_true<i8>(0) as u64;
  return sink;
}
export function v128rSwizzle(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, 0x0706050403020100, 0x0f0e0d0c0b0a0908);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.swizzle(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rNarrowI16(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.narrow<i16>(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rExtractLane(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++)
    sink += v128_kernels.extract_lane<i16>(0, (i & 7) as u8) as u16 as u64;
  return sink;
}
export function v128rReplaceLane(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  for (let i: u32 = 0; i < iters; i++)
    v128_kernels.replace_lane<i16>(1, 0, 5, i as i16);
  return rf.lo(1) ^ rf.hi(1);
}
export function v128rReplaceLaneInPlace(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  for (let i: u32 = 0; i < iters; i++)
    v128_kernels.replace_lane<i16>(0, 0, 5, i as i16);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rLoad(iters: u32, a: u64): u64 {
  store<u64>(wideIo, a);
  store<u64>(wideIo + 8, ~a);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.load(0, wideIo);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rStore(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.store(wideIo, 0);
  return load<u64>(wideIo) ^ load<u64>(wideIo + 8);
}
export function v128rAbsI8(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.abs<i8>(0, 0);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rSqrtF32(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.sqrt<f32>(0, 0);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rExtendLowI8(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.extend_low<i8>(0, 0);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rExtaddI8(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.extadd_pairwise<i8>(0, 0);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rExtmulI8(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.extmul_low<i8>(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rQ15(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.q15mulr_sat<i16>(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rTruncSatI32(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.trunc_sat<i32>(0, 0);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rConvertI32(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.convert<i32>(0, 0);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rConvertLowI32(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.convert_low<i32>(0, 0);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rTruncZeroI32(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.trunc_sat_zero<i32>(0, 0);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rDemoteF64(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.demote_zero(0, 0);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rPromoteF32(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.promote_low(0, 0);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rAnyTrue(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v128_kernels.any_true(0) as u64;
  return sink;
}
export function v128rAnyTrueZero(iters: u32): u64 {
  rf.set(0, 0, 0);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++) sink += v128_kernels.any_true(0) as u64;
  return sink;
}
export function v128rPopcntI8(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.popcnt<i8>(0, 0);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rLoadExtI8(iters: u32, a: u64): u64 {
  store<u64>(wideIo, a);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.load_ext<i8>(0, wideIo);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rLoadZeroI32(iters: u32, a: u64): u64 {
  store<u64>(wideIo, a);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.load_zero<i32>(0, wideIo);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rLoadSplatI8(iters: u32, a: u64): u64 {
  store<u64>(wideIo, a);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.load_splat<i8>(0, wideIo);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rLoadLaneI16(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  store<i16>(wideIo, -1234);
  for (let i: u32 = 0; i < iters; i++)
    v128_kernels.load_lane<i16>(0, wideIo, 0, 5);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rStoreLaneI16(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  for (let i: u32 = 0; i < iters; i++)
    v128_kernels.store_lane<i16>(wideIo, 0, 5);
  return load<u16>(wideIo);
}
export function v128rMulI32(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.mul<i32>(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rAbsI16(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.abs<i16>(0, 0);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rAbsI32(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.abs<i32>(0, 0);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rEqI32(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.eq<i32>(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rLtI32(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.lt<i32>(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rAllTrueI32(iters: u32, a: u64): u64 {
  rf.set(0, a | 0x0000000100000001, ~a | 0x0000000100000001);
  let sink: u64 = 0;
  for (let i: u32 = 0; i < iters; i++)
    sink += v128_kernels.all_true<i32>(0) as u64;
  return sink;
}
export function v128rExtendLowI16(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.extend_low<i16>(0, 0);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rExtendLowI32(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.extend_low<i32>(0, 0);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rExtaddI16(iters: u32, a: u64): u64 {
  rf.set(0, a, ~a);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.extadd_pairwise<i16>(0, 0);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rExtmulI16(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.extmul_low<i16>(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}
export function v128rExtmulI32(iters: u32, a: u64, b: u64): u64 {
  rf.set(0, a, ~a);
  rf.set(1, b, ~b);
  for (let i: u32 = 0; i < iters; i++) v128_kernels.extmul_low<i32>(0, 0, 1);
  return rf.lo(0) ^ rf.hi(0);
}
