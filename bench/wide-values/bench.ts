import { v256 } from "../../assembly/v256/value";
import { v512 } from "../../assembly/v512/value";
import { V256, V512 } from "../../assembly/wide/value";

export function legacyV256(a: i32, b: i32): i32 {
  const x = V256.add<i32>(V256.splat<i32>(a), V256.splat<i32>(b));
  const y = V256.sub<i32>(x, V256.splat<i32>(b));
  return V256.extract_lane<i32>(y, 7);
}

export function dedicatedV256(a: i32, b: i32): i32 {
  const x = v256.add<i32>(v256.splat<i32>(a), v256.splat<i32>(b));
  const y = v256.sub<i32>(x, v256.splat<i32>(b));
  return v256.extract_lane<i32>(y, 7);
}

export function legacyV512(a: i32, b: i32): i32 {
  const x = V512.add<i32>(V512.splat<i32>(a), V512.splat<i32>(b));
  const y = V512.sub<i32>(x, V512.splat<i32>(b));
  return V512.extract_lane<i32>(y, 15);
}

export function dedicatedV512(a: i32, b: i32): i32 {
  const x = v512.add<i32>(v512.splat<i32>(a), v512.splat<i32>(b));
  const y = v512.sub<i32>(x, v512.splat<i32>(b));
  return v512.extract_lane<i32>(y, 15);
}
