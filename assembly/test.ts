let ASC_FEATURES: string = "";
if (ASC_FEATURE_SIMD) ASC_FEATURES += "simd ";
if (ASC_FEATURE_RELAXED_SIMD) ASC_FEATURES += "relaxed-simd ";
if (ASC_FEATURE_SIGN_EXTENSION) ASC_FEATURES += "sign-extension ";

console.log("Features: " + ASC_FEATURES + "\n");

const a = i32x4(1, 2, 3, 4);
const b = i32x4(5, 6, 7, 8);
const c = i32x4.add(a, b);
console.log("Result: " + i32x4.extract_lane(c, 0).toString() + " " + i32x4.extract_lane(c, 1).toString() + " " + i32x4.extract_lane(c, 2).toString() + " " + i32x4.extract_lane(c, 3).toString());
