export type s64 = u64;
/** Initializes a 64-bit vector from four 16-bit integer values. Arguments must be compile-time constants. */
export function i16x4(a: i16, b: i16, c: i16, d: i16): s64 {
    return (
        ((a as s64) & 0xFFFF) |
        (((b as s64) & 0xFFFF) << 16) |
        (((c as s64) & 0xFFFF) << 32) |
        (((d as s64) & 0xFFFF) << 48)
    )
}

export type i16x4 = s64;
export namespace i16x4 {
    /** Creates a vector with four identical 16-bit integer lanes. */
    // @ts-ignore: Decorator
    @inline export function splat(x: i16): i16x4 {
        return i16x4(x, x, x, x);
    }
    /** Extracts one 16-bit integer lane as a signed scalar. */
    // @ts-ignore: Decorator
    @inline export function extract_lane_s(x: s64, idx: u8): i16 {
        return ((x >> (idx * 16)) & 0xFFFF) as i16;
    }
    /** Extracts one 16-bit integer lane as an unsigned scalar. */
    // @ts-ignore: Decorator
    @inline export function extract_lane_u(x: s64, idx: u8): u16 {
        return ((x >> (idx * 16)) & 0xFFFF) as u16;
    }
    // @ts-ignore: Decorator
    @inline export function add(a: s64, b: s64): i16x4 {
        const lane0 = ((extract_lane_s(a, 0) + extract_lane_s(b, 0)) & 0xFFFF) as i16;
        const lane1 = ((extract_lane_s(a, 1) + extract_lane_s(b, 1)) & 0xFFFF) as i16;
        const lane2 = ((extract_lane_s(a, 2) + extract_lane_s(b, 2)) & 0xFFFF) as i16;
        const lane3 = ((extract_lane_s(a, 3) + extract_lane_s(b, 3)) & 0xFFFF) as i16;
        return i16x4(lane0, lane1, lane2, lane3);
    }
    // @ts-ignore: Decorator
    @inline export function sub(a: s64, b: s64): i16x4 {
        const lane0 = ((extract_lane_s(a, 0) - extract_lane_s(b, 0)) & 0xFFFF) as i16;
        const lane1 = ((extract_lane_s(a, 1) - extract_lane_s(b, 1)) & 0xFFFF) as i16;
        const lane2 = ((extract_lane_s(a, 2) - extract_lane_s(b, 2)) & 0xFFFF) as i16;
        const lane3 = ((extract_lane_s(a, 3) - extract_lane_s(b, 3)) & 0xFFFF) as i16;
        return i16x4(lane0, lane1, lane2, lane3);
    }
    // @ts-ignore: Decorator
    @inline export function mul(a: s64, b: s64): i16x4 {
        const lane0 = ((extract_lane_s(a, 0) * extract_lane_s(b, 0)) & 0xFFFF) as i16;
        const lane1 = ((extract_lane_s(a, 1) * extract_lane_s(b, 1)) & 0xFFFF) as i16;
        const lane2 = ((extract_lane_s(a, 2) * extract_lane_s(b, 2)) & 0xFFFF) as i16;
        const lane3 = ((extract_lane_s(a, 3) * extract_lane_s(b, 3)) & 0xFFFF) as i16;
        return i16x4(lane0, lane1, lane2, lane3);
    }
    // @ts-ignore: Decorator
    @inline export function div(a: s64, b: s64): i16x4 {
        const lane0 = ((extract_lane_s(a, 0) / extract_lane_s(b, 0)) & 0xFFFF) as i16;
        const lane1 = ((extract_lane_s(a, 1) / extract_lane_s(b, 1)) & 0xFFFF) as i16;
        const lane2 = ((extract_lane_s(a, 2) / extract_lane_s(b, 2)) & 0xFFFF) as i16;
        const lane3 = ((extract_lane_s(a, 3) / extract_lane_s(b, 3)) & 0xFFFF) as i16;
        return i16x4(lane0, lane1, lane2, lane3);
    }
    // @ts-ignore: Decorator
    @inline export function bitmask(x: s64): i32 {
        const lane0 = (i32(i16x4.extract_lane_s(x, 0) > 0)) << 0;
        const lane1 = (i32(i16x4.extract_lane_s(x, 1) > 0)) << 1;
        const lane2 = (i32(i16x4.extract_lane_s(x, 2) > 0)) << 2;
        const lane3 = (i32(i16x4.extract_lane_s(x, 3) > 0)) << 3;
        return lane0 | lane1 | lane2 | lane3;
    }
    // @ts-ignore: Decorator
    @inline export function eq(a: s64, b: s64): s64 {
        const lane0 = i16(i16x4.extract_lane_s(a, 0) == i16x4.extract_lane_s(b, 0));
        const lane1 = i16(i16x4.extract_lane_s(a, 1) == i16x4.extract_lane_s(b, 1));
        const lane2 = i16(i16x4.extract_lane_s(a, 2) == i16x4.extract_lane_s(b, 2));
        const lane3 = i16(i16x4.extract_lane_s(a, 3) == i16x4.extract_lane_s(b, 3));
        return i16x4(lane0, lane1, lane2, lane3);
    }
    // @ts-ignore: Decorator
    @inline export function all_eq(a: s64, b: s64): bool {
        return a == b;
    }
    // @ts-ignore: Decorator
    @inline export function visualize(x: s64): string {
        return i16x4.extract_lane_s(x, 0).toString() + " " + i16x4.extract_lane_s(x, 1).toString() + " " + i16x4.extract_lane_s(x, 2).toString() + " " + i16x4.extract_lane_s(x, 3).toString();
    }
}