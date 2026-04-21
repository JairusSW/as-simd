declare global {
  const i8x8: typeof import("./assembly").i8x8;
  const i8x16: typeof import("./assembly").i8x16;
  const i16x8: typeof import("./assembly").i16x8;
  const i32x4: typeof import("./assembly").i32x4;
  const i64x2: typeof import("./assembly").i64x2;
  const v128: typeof import("./assembly").v128;
}

export {};
