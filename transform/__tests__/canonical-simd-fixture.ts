import { v32 } from "../../assembly/v32/value";
import { v32_kernels } from "../../assembly/v32/kernels";
import { v64 } from "../../assembly/v64/value";
import { v64_kernels } from "../../assembly/v64/kernels";
import { V128Fallback } from "../../assembly/v128/value";
import { v128_kernels } from "../../assembly/v128/kernels";
import { rf } from "../../assembly/v128/regfile";

export function v32ValueMulI8(a: u32, b: u32): u32 {
  return v32.mul<i8>(a, b);
}

export function v32KernelAbsI16(a: u32): u32 {
  return v32_kernels.abs<i16>(a);
}

export function v64ValueMulI8(a: u64, b: u64): u64 {
  return v64.mul<i8>(a, b);
}

export function v64KernelAbsI16(a: u64): u64 {
  return v64_kernels.abs<i16>(a);
}

export function v128ValueMulI8(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  const result = V128Fallback.mul<i8>(
    new V128Fallback(aLo, aHi),
    new V128Fallback(bLo, bHi),
  );
  return result.lo ^ result.hi;
}

export function v128KernelMulI8(aLo: u64, aHi: u64, bLo: u64, bHi: u64): u64 {
  rf.set(0, aLo, aHi);
  rf.set(1, bLo, bHi);
  v128_kernels.mul<i8>(2, 0, 1);
  return rf.lo(2) ^ rf.hi(2);
}
