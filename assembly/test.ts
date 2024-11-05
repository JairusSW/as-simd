import { i16x4 } from ".";

const a = i16x4(1, 2, 3, 4);
const b = i16x4(5, 2, 9, 6);
const c = i16x4.add(a, b);
const d = i16x4.sub(c, b);
console.log("psh a            | " + i16x4.visualize(a));
console.log("psh b            | " + i16x4.visualize(b));
console.log("add a b -> c");
console.log("pop c            | " + i16x4.visualize(c));
console.log("psh a            | " + i16x4.visualize(b));
console.log("sub c a -> b");
console.log("pop b            | " + i16x4.visualize(d));