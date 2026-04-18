export type v64 = u64;
export type v32 = u32;
export type v16 = u16;
export type v8 = u8;

export enum JSONMode {
  SWAR = 0,
  SIMD = 1,
}

// Compile-time mode used by benchmark logging.
// @ts-expect-error: decorator
@inline export const JSON_MODE: JSONMode = ASC_FEATURE_SIMD ? JSONMode.SIMD : JSONMode.SWAR;
