import { v128_swar } from "../v128/v128_swar";
import { wrf } from "../wide/regfile";

/** Width-specialized, fully unrolled hot kernels for the v512 register API. */
export namespace v512_kernels {
  @inline export function load_bits(dst: u32, ptr: usize, offset: usize = 0): void {
    const dp = wrf.addr(dst), p = ptr + offset;
    if (ASC_FEATURE_SIMD) { v128.store(dp, v128.load(p)); v128.store(dp + 16, v128.load(p + 16)); v128.store(dp + 32, v128.load(p + 32)); v128.store(dp + 48, v128.load(p + 48)); }
    else { store<u64>(dp, load<u64>(p)); store<u64>(dp + 8, load<u64>(p + 8)); store<u64>(dp + 16, load<u64>(p + 16)); store<u64>(dp + 24, load<u64>(p + 24)); store<u64>(dp + 32, load<u64>(p + 32)); store<u64>(dp + 40, load<u64>(p + 40)); store<u64>(dp + 48, load<u64>(p + 48)); store<u64>(dp + 56, load<u64>(p + 56)); }
  }

  @inline export function store_bits(ptr: usize, src: u32, offset: usize = 0): void {
    const sp = wrf.addr(src), p = ptr + offset;
    if (ASC_FEATURE_SIMD) { v128.store(p, v128.load(sp)); v128.store(p + 16, v128.load(sp + 16)); v128.store(p + 32, v128.load(sp + 32)); v128.store(p + 48, v128.load(sp + 48)); }
    else { store<u64>(p, load<u64>(sp)); store<u64>(p + 8, load<u64>(sp + 8)); store<u64>(p + 16, load<u64>(sp + 16)); store<u64>(p + 24, load<u64>(sp + 24)); store<u64>(p + 32, load<u64>(sp + 32)); store<u64>(p + 40, load<u64>(sp + 40)); store<u64>(p + 48, load<u64>(sp + 48)); store<u64>(p + 56, load<u64>(sp + 56)); }
  }

  @inline function put(dp: usize, offset: usize, lo: u64): void {
    store<u64>(dp + offset, lo);
    store<u64>(dp + offset + 8, v128_swar.take_hi());
  }

  @inline function addChunk<T>(dp: usize, ap: usize, bp: usize, offset: usize): void {
    if (ASC_FEATURE_SIMD) v128.store(dp + offset, v128.add<T>(v128.load(ap + offset), v128.load(bp + offset)));
    else put(dp, offset, v128_swar.add<T>(load<u64>(ap + offset), load<u64>(ap + offset + 8), load<u64>(bp + offset), load<u64>(bp + offset + 8)));
  }
  @inline function subChunk<T>(dp: usize, ap: usize, bp: usize, offset: usize): void {
    if (ASC_FEATURE_SIMD) v128.store(dp + offset, v128.sub<T>(v128.load(ap + offset), v128.load(bp + offset)));
    else put(dp, offset, v128_swar.sub<T>(load<u64>(ap + offset), load<u64>(ap + offset + 8), load<u64>(bp + offset), load<u64>(bp + offset + 8)));
  }
  @inline function mulChunk<T>(dp: usize, ap: usize, bp: usize, offset: usize): void {
    if (ASC_FEATURE_SIMD && (sizeof<T>() != 8 || isFloat<T>())) {
      const a = v128.load(ap + offset), b = v128.load(bp + offset);
      if (sizeof<T>() == 1) {
        const lo = i16x8.extmul_low_i8x16_u(a, b), hi = i16x8.extmul_high_i8x16_u(a, b);
        v128.store(dp + offset, i8x16.shuffle(lo, hi, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30));
      } else v128.store(dp + offset, v128.mul<T>(a, b));
    } else put(dp, offset, v128_swar.mul<T>(load<u64>(ap + offset), load<u64>(ap + offset + 8), load<u64>(bp + offset), load<u64>(bp + offset + 8)));
  }
  @inline function minChunk<T>(dp: usize, ap: usize, bp: usize, offset: usize): void {
    if (ASC_FEATURE_SIMD && (sizeof<T>() <= 2 || isFloat<T>())) v128.store(dp + offset, v128.min<T>(v128.load(ap + offset), v128.load(bp + offset)));
    else put(dp, offset, v128_swar.min<T>(load<u64>(ap + offset), load<u64>(ap + offset + 8), load<u64>(bp + offset), load<u64>(bp + offset + 8)));
  }
  @inline function maxChunk<T>(dp: usize, ap: usize, bp: usize, offset: usize): void {
    if (ASC_FEATURE_SIMD && (sizeof<T>() <= 2 || isFloat<T>())) v128.store(dp + offset, v128.max<T>(v128.load(ap + offset), v128.load(bp + offset)));
    else put(dp, offset, v128_swar.max<T>(load<u64>(ap + offset), load<u64>(ap + offset + 8), load<u64>(bp + offset), load<u64>(bp + offset + 8)));
  }

  @inline function unaryChunk<T>(dp: usize, ap: usize, offset: usize, op: u32): void {
    if (ASC_FEATURE_SIMD) {
      const a = v128.load(ap + offset);
      v128.store(dp + offset, op == 0 ? v128.neg<T>(a) : v128.abs<T>(a));
    } else if (op == 0) put(dp, offset, v128_swar.neg<T>(load<u64>(ap + offset), load<u64>(ap + offset + 8)));
    else put(dp, offset, v128_swar.abs<T>(load<u64>(ap + offset), load<u64>(ap + offset + 8)));
  }
  @inline function addSatChunk<T>(dp: usize, ap: usize, bp: usize, offset: usize): void {
    if (ASC_FEATURE_SIMD) v128.store(dp + offset, v128.add_sat<T>(v128.load(ap + offset), v128.load(bp + offset)));
    else put(dp, offset, v128_swar.add_sat<T>(load<u64>(ap + offset), load<u64>(ap + offset + 8), load<u64>(bp + offset), load<u64>(bp + offset + 8)));
  }
  @inline function subSatChunk<T>(dp: usize, ap: usize, bp: usize, offset: usize): void {
    if (ASC_FEATURE_SIMD) v128.store(dp + offset, v128.sub_sat<T>(v128.load(ap + offset), v128.load(bp + offset)));
    else put(dp, offset, v128_swar.sub_sat<T>(load<u64>(ap + offset), load<u64>(ap + offset + 8), load<u64>(bp + offset), load<u64>(bp + offset + 8)));
  }
  @inline function avgrChunk<T>(dp: usize, ap: usize, bp: usize, offset: usize): void {
    if (ASC_FEATURE_SIMD) v128.store(dp + offset, v128.avgr<T>(v128.load(ap + offset), v128.load(bp + offset)));
    else put(dp, offset, v128_swar.avgr<T>(load<u64>(ap + offset), load<u64>(ap + offset + 8), load<u64>(bp + offset), load<u64>(bp + offset + 8)));
  }
  @inline function shiftChunk<T>(dp: usize, ap: usize, offset: usize, shift: i32, right: bool): void {
    if (ASC_FEATURE_SIMD) {
      const a = v128.load(ap + offset);
      v128.store(dp + offset, right ? v128.shr<T>(a, shift) : v128.shl<T>(a, shift));
    } else if (right) put(dp, offset, v128_swar.shr<T>(load<u64>(ap + offset), load<u64>(ap + offset + 8), shift));
    else put(dp, offset, v128_swar.shl<T>(load<u64>(ap + offset), load<u64>(ap + offset + 8), shift));
  }
  @inline function compareChunk<T>(dp: usize, ap: usize, bp: usize, offset: usize, op: u32): void {
    if (ASC_FEATURE_SIMD) {
      const a = v128.load(ap + offset), b = v128.load(bp + offset);
      if (op == 0) { v128.store(dp + offset, v128.eq<T>(a, b)); return; }
      if (sizeof<T>() != 8 || isSigned<T>() || isFloat<T>()) {
        v128.store(dp + offset, op == 1 ? v128.lt<T>(a, b) : v128.le<T>(a, b));
        return;
      }
    }
    if (op == 0) put(dp, offset, v128_swar.eq<T>(load<u64>(ap + offset), load<u64>(ap + offset + 8), load<u64>(bp + offset), load<u64>(bp + offset + 8)));
    else if (op == 1) put(dp, offset, v128_swar.lt<T>(load<u64>(ap + offset), load<u64>(ap + offset + 8), load<u64>(bp + offset), load<u64>(bp + offset + 8)));
    else put(dp, offset, v128_swar.le<T>(load<u64>(ap + offset), load<u64>(ap + offset + 8), load<u64>(bp + offset), load<u64>(bp + offset + 8)));
  }

  @inline export function add<T>(dst: u32, a: u32, b: u32): void {
    const dp = wrf.addr(dst), ap = wrf.addr(a), bp = wrf.addr(b);
    addChunk<T>(dp, ap, bp, 0); addChunk<T>(dp, ap, bp, 16); addChunk<T>(dp, ap, bp, 32); addChunk<T>(dp, ap, bp, 48);
  }
  @inline export function sub<T>(dst: u32, a: u32, b: u32): void {
    const dp = wrf.addr(dst), ap = wrf.addr(a), bp = wrf.addr(b);
    subChunk<T>(dp, ap, bp, 0); subChunk<T>(dp, ap, bp, 16); subChunk<T>(dp, ap, bp, 32); subChunk<T>(dp, ap, bp, 48);
  }
  @inline export function mul<T>(dst: u32, a: u32, b: u32): void {
    const dp = wrf.addr(dst), ap = wrf.addr(a), bp = wrf.addr(b);
    mulChunk<T>(dp, ap, bp, 0); mulChunk<T>(dp, ap, bp, 16); mulChunk<T>(dp, ap, bp, 32); mulChunk<T>(dp, ap, bp, 48);
  }
  @inline export function min<T>(dst: u32, a: u32, b: u32): void {
    const dp = wrf.addr(dst), ap = wrf.addr(a), bp = wrf.addr(b);
    minChunk<T>(dp, ap, bp, 0); minChunk<T>(dp, ap, bp, 16); minChunk<T>(dp, ap, bp, 32); minChunk<T>(dp, ap, bp, 48);
  }
  @inline export function max<T>(dst: u32, a: u32, b: u32): void {
    const dp = wrf.addr(dst), ap = wrf.addr(a), bp = wrf.addr(b);
    maxChunk<T>(dp, ap, bp, 0); maxChunk<T>(dp, ap, bp, 16); maxChunk<T>(dp, ap, bp, 32); maxChunk<T>(dp, ap, bp, 48);
  }
  @inline export function splat<T>(dst: u32, x: T): void {
    const dp = wrf.addr(dst);
    if (ASC_FEATURE_SIMD) { const v = v128.splat<T>(x); v128.store(dp, v); v128.store(dp + 16, v); v128.store(dp + 32, v); v128.store(dp + 48, v); }
    else { const lo = v128_swar.splat<T>(x), hi = v128_swar.take_hi(); store<u64>(dp, lo); store<u64>(dp + 8, hi); store<u64>(dp + 16, lo); store<u64>(dp + 24, hi); store<u64>(dp + 32, lo); store<u64>(dp + 40, hi); store<u64>(dp + 48, lo); store<u64>(dp + 56, hi); }
  }
  @inline export function neg<T>(dst: u32, a: u32): void { const dp = wrf.addr(dst), ap = wrf.addr(a); unaryChunk<T>(dp, ap, 0, 0); unaryChunk<T>(dp, ap, 16, 0); unaryChunk<T>(dp, ap, 32, 0); unaryChunk<T>(dp, ap, 48, 0); }
  @inline export function abs<T>(dst: u32, a: u32): void { const dp = wrf.addr(dst), ap = wrf.addr(a); unaryChunk<T>(dp, ap, 0, 1); unaryChunk<T>(dp, ap, 16, 1); unaryChunk<T>(dp, ap, 32, 1); unaryChunk<T>(dp, ap, 48, 1); }
  @inline export function add_sat<T>(dst: u32, a: u32, b: u32): void { const dp = wrf.addr(dst), ap = wrf.addr(a), bp = wrf.addr(b); addSatChunk<T>(dp, ap, bp, 0); addSatChunk<T>(dp, ap, bp, 16); addSatChunk<T>(dp, ap, bp, 32); addSatChunk<T>(dp, ap, bp, 48); }
  @inline export function sub_sat<T>(dst: u32, a: u32, b: u32): void { const dp = wrf.addr(dst), ap = wrf.addr(a), bp = wrf.addr(b); subSatChunk<T>(dp, ap, bp, 0); subSatChunk<T>(dp, ap, bp, 16); subSatChunk<T>(dp, ap, bp, 32); subSatChunk<T>(dp, ap, bp, 48); }
  @inline export function avgr<T>(dst: u32, a: u32, b: u32): void { const dp = wrf.addr(dst), ap = wrf.addr(a), bp = wrf.addr(b); avgrChunk<T>(dp, ap, bp, 0); avgrChunk<T>(dp, ap, bp, 16); avgrChunk<T>(dp, ap, bp, 32); avgrChunk<T>(dp, ap, bp, 48); }
  @inline export function shl<T>(dst: u32, a: u32, shift: i32): void { const dp = wrf.addr(dst), ap = wrf.addr(a); shiftChunk<T>(dp, ap, 0, shift, false); shiftChunk<T>(dp, ap, 16, shift, false); shiftChunk<T>(dp, ap, 32, shift, false); shiftChunk<T>(dp, ap, 48, shift, false); }
  @inline export function shr<T>(dst: u32, a: u32, shift: i32): void { const dp = wrf.addr(dst), ap = wrf.addr(a); shiftChunk<T>(dp, ap, 0, shift, true); shiftChunk<T>(dp, ap, 16, shift, true); shiftChunk<T>(dp, ap, 32, shift, true); shiftChunk<T>(dp, ap, 48, shift, true); }
  @inline export function compare<T>(dst: u32, a: u32, b: u32, op: u32): void { const dp = wrf.addr(dst), ap = wrf.addr(a), bp = wrf.addr(b); compareChunk<T>(dp, ap, bp, 0, op); compareChunk<T>(dp, ap, bp, 16, op); compareChunk<T>(dp, ap, bp, 32, op); compareChunk<T>(dp, ap, bp, 48, op); }

  @inline export function bitwise(dst: u32, a: u32, b: u32, op: u32): void {
    const dp = wrf.addr(dst), ap = wrf.addr(a), bp = wrf.addr(b);
    // Eight scalar word ops still beat four vector load/op/store sequences;
    // unlike arithmetic, bitwise operations gain no lane-level parallelism.
    if (op == 0) {
      store<u64>(dp, load<u64>(ap) & load<u64>(bp)); store<u64>(dp + 8, load<u64>(ap + 8) & load<u64>(bp + 8));
      store<u64>(dp + 16, load<u64>(ap + 16) & load<u64>(bp + 16)); store<u64>(dp + 24, load<u64>(ap + 24) & load<u64>(bp + 24));
      store<u64>(dp + 32, load<u64>(ap + 32) & load<u64>(bp + 32)); store<u64>(dp + 40, load<u64>(ap + 40) & load<u64>(bp + 40));
      store<u64>(dp + 48, load<u64>(ap + 48) & load<u64>(bp + 48)); store<u64>(dp + 56, load<u64>(ap + 56) & load<u64>(bp + 56));
    } else if (op == 1) {
      store<u64>(dp, load<u64>(ap) | load<u64>(bp)); store<u64>(dp + 8, load<u64>(ap + 8) | load<u64>(bp + 8));
      store<u64>(dp + 16, load<u64>(ap + 16) | load<u64>(bp + 16)); store<u64>(dp + 24, load<u64>(ap + 24) | load<u64>(bp + 24));
      store<u64>(dp + 32, load<u64>(ap + 32) | load<u64>(bp + 32)); store<u64>(dp + 40, load<u64>(ap + 40) | load<u64>(bp + 40));
      store<u64>(dp + 48, load<u64>(ap + 48) | load<u64>(bp + 48)); store<u64>(dp + 56, load<u64>(ap + 56) | load<u64>(bp + 56));
    } else {
      store<u64>(dp, load<u64>(ap) ^ load<u64>(bp)); store<u64>(dp + 8, load<u64>(ap + 8) ^ load<u64>(bp + 8));
      store<u64>(dp + 16, load<u64>(ap + 16) ^ load<u64>(bp + 16)); store<u64>(dp + 24, load<u64>(ap + 24) ^ load<u64>(bp + 24));
      store<u64>(dp + 32, load<u64>(ap + 32) ^ load<u64>(bp + 32)); store<u64>(dp + 40, load<u64>(ap + 40) ^ load<u64>(bp + 40));
      store<u64>(dp + 48, load<u64>(ap + 48) ^ load<u64>(bp + 48)); store<u64>(dp + 56, load<u64>(ap + 56) ^ load<u64>(bp + 56));
    }
  }

  @inline export function not(dst: u32, a: u32): void {
    const dp = wrf.addr(dst), ap = wrf.addr(a);
    store<u64>(dp, ~load<u64>(ap)); store<u64>(dp + 8, ~load<u64>(ap + 8)); store<u64>(dp + 16, ~load<u64>(ap + 16)); store<u64>(dp + 24, ~load<u64>(ap + 24));
    store<u64>(dp + 32, ~load<u64>(ap + 32)); store<u64>(dp + 40, ~load<u64>(ap + 40)); store<u64>(dp + 48, ~load<u64>(ap + 48)); store<u64>(dp + 56, ~load<u64>(ap + 56));
  }

  @inline function selectWord(dp: usize, ap: usize, bp: usize, mp: usize, offset: usize): void {
    const bv = load<u64>(bp + offset);
    store<u64>(dp + offset, bv ^ ((load<u64>(ap + offset) ^ bv) & load<u64>(mp + offset)));
  }

  @inline export function bitselect(dst: u32, a: u32, b: u32, m: u32): void {
    const dp = wrf.addr(dst), ap = wrf.addr(a), bp = wrf.addr(b), mp = wrf.addr(m);
    if (ASC_FEATURE_SIMD) {
      v128.store(dp, v128.bitselect(v128.load(ap), v128.load(bp), v128.load(mp)));
      v128.store(dp + 16, v128.bitselect(v128.load(ap + 16), v128.load(bp + 16), v128.load(mp + 16)));
      v128.store(dp + 32, v128.bitselect(v128.load(ap + 32), v128.load(bp + 32), v128.load(mp + 32)));
      v128.store(dp + 48, v128.bitselect(v128.load(ap + 48), v128.load(bp + 48), v128.load(mp + 48)));
      return;
    }
    selectWord(dp, ap, bp, mp, 0); selectWord(dp, ap, bp, mp, 8); selectWord(dp, ap, bp, mp, 16); selectWord(dp, ap, bp, mp, 24);
    selectWord(dp, ap, bp, mp, 32); selectWord(dp, ap, bp, mp, 40); selectWord(dp, ap, bp, mp, 48); selectWord(dp, ap, bp, mp, 56);
  }

  @inline export function any_true(a: u32): bool {
    const p = wrf.addr(a);
    if (load<u64>(p) != 0) return true;
    return (load<u64>(p + 8) | load<u64>(p + 16) | load<u64>(p + 24) | load<u64>(p + 32)
      | load<u64>(p + 40) | load<u64>(p + 48) | load<u64>(p + 56)) != 0;
  }

  @inline export function all_true<T>(a: u32): bool {
    const p = wrf.addr(a);
    if (ASC_FEATURE_SIMD) return v128.all_true<T>(v128.load(p)) && v128.all_true<T>(v128.load(p + 16)) && v128.all_true<T>(v128.load(p + 32)) && v128.all_true<T>(v128.load(p + 48));
    return v128_swar.all_true<T>(load<u64>(p), load<u64>(p + 8))
      && v128_swar.all_true<T>(load<u64>(p + 16), load<u64>(p + 24))
      && v128_swar.all_true<T>(load<u64>(p + 32), load<u64>(p + 40))
      && v128_swar.all_true<T>(load<u64>(p + 48), load<u64>(p + 56));
  }

  @inline export function bitmask<T>(a: u32): u64 {
    const p = wrf.addr(a), lanes = 16 / sizeof<T>();
    if (ASC_FEATURE_SIMD) return (v128.bitmask<T>(v128.load(p)) as u32 as u64)
      | ((v128.bitmask<T>(v128.load(p + 16)) as u32 as u64) << lanes)
      | ((v128.bitmask<T>(v128.load(p + 32)) as u32 as u64) << (lanes * 2))
      | ((v128.bitmask<T>(v128.load(p + 48)) as u32 as u64) << (lanes * 3));
    return (v128_swar.bitmask<T>(load<u64>(p), load<u64>(p + 8)) as u32 as u64)
      | ((v128_swar.bitmask<T>(load<u64>(p + 16), load<u64>(p + 24)) as u32 as u64) << lanes)
      | ((v128_swar.bitmask<T>(load<u64>(p + 32), load<u64>(p + 40)) as u32 as u64) << (lanes * 2))
      | ((v128_swar.bitmask<T>(load<u64>(p + 48), load<u64>(p + 56)) as u32 as u64) << (lanes * 3));
  }

  @inline export function extract_lane<T>(a: u32, idx: u32): T {
    const lanes = (64 / sizeof<T>()) as u32, lane = idx % lanes;
    return load<T>(wrf.addr(a) + (lane as usize) * sizeof<T>());
  }

  @inline export function replace_lane<T>(dst: u32, a: u32, idx: u32, value: T): void {
    const dp = wrf.addr(dst), ap = wrf.addr(a);
    if (dst != a) {
      if (ASC_FEATURE_SIMD) { v128.store(dp, v128.load(ap)); v128.store(dp + 16, v128.load(ap + 16)); v128.store(dp + 32, v128.load(ap + 32)); v128.store(dp + 48, v128.load(ap + 48)); }
      else { store<u64>(dp, load<u64>(ap)); store<u64>(dp + 8, load<u64>(ap + 8)); store<u64>(dp + 16, load<u64>(ap + 16)); store<u64>(dp + 24, load<u64>(ap + 24)); store<u64>(dp + 32, load<u64>(ap + 32)); store<u64>(dp + 40, load<u64>(ap + 40)); store<u64>(dp + 48, load<u64>(ap + 48)); store<u64>(dp + 56, load<u64>(ap + 56)); }
    }
    const lanes = (64 / sizeof<T>()) as u32, lane = idx % lanes;
    store<T>(dp + (lane as usize) * sizeof<T>(), value);
  }
}
