import binaryen from "binaryen";
import { ExpressionRewriter } from "./visitor.js";
const INSTRUCTION_MODULE = "as-simd";
const raw = binaryen;
function wideCarrier(module) {
    module.setFeatures(module.getFeatures() | binaryen.Features.ReferenceTypes);
    return binaryen.externref;
}
const binarySubopcode = new Map([
    [binaryen.EqVecI8x16, 35],
    [binaryen.NeVecI8x16, 36],
    [binaryen.LtSVecI8x16, 37],
    [binaryen.LtUVecI8x16, 38],
    [binaryen.GtSVecI8x16, 39],
    [binaryen.GtUVecI8x16, 40],
    [binaryen.LeSVecI8x16, 41],
    [binaryen.LeUVecI8x16, 42],
    [binaryen.GeSVecI8x16, 43],
    [binaryen.GeUVecI8x16, 44],
    [binaryen.EqVecI16x8, 45],
    [binaryen.NeVecI16x8, 46],
    [binaryen.LtSVecI16x8, 47],
    [binaryen.LtUVecI16x8, 48],
    [binaryen.GtSVecI16x8, 49],
    [binaryen.GtUVecI16x8, 50],
    [binaryen.LeSVecI16x8, 51],
    [binaryen.LeUVecI16x8, 52],
    [binaryen.GeSVecI16x8, 53],
    [binaryen.GeUVecI16x8, 54],
    [binaryen.EqVecI32x4, 55],
    [binaryen.NeVecI32x4, 56],
    [binaryen.LtSVecI32x4, 57],
    [binaryen.LtUVecI32x4, 58],
    [binaryen.GtSVecI32x4, 59],
    [binaryen.GtUVecI32x4, 60],
    [binaryen.LeSVecI32x4, 61],
    [binaryen.LeUVecI32x4, 62],
    [binaryen.GeSVecI32x4, 63],
    [binaryen.GeUVecI32x4, 64],
    [binaryen.EqVecF32x4, 65],
    [binaryen.NeVecF32x4, 66],
    [binaryen.LtVecF32x4, 67],
    [binaryen.GtVecF32x4, 68],
    [binaryen.LeVecF32x4, 69],
    [binaryen.GeVecF32x4, 70],
    [binaryen.EqVecF64x2, 71],
    [binaryen.NeVecF64x2, 72],
    [binaryen.LtVecF64x2, 73],
    [binaryen.GtVecF64x2, 74],
    [binaryen.LeVecF64x2, 75],
    [binaryen.GeVecF64x2, 76],
    [binaryen.AndVec128, 78],
    [binaryen.AndNotVec128, 79],
    [binaryen.OrVec128, 80],
    [binaryen.XorVec128, 81],
    [binaryen.AddVecI8x16, 110],
    [binaryen.AddSatSVecI8x16, 111],
    [binaryen.AddSatUVecI8x16, 112],
    [binaryen.SubVecI8x16, 113],
    [binaryen.SubSatSVecI8x16, 114],
    [binaryen.SubSatUVecI8x16, 115],
    [binaryen.MinSVecI8x16, 118],
    [binaryen.MinUVecI8x16, 119],
    [binaryen.MaxSVecI8x16, 120],
    [binaryen.MaxUVecI8x16, 121],
    [binaryen.AvgrUVecI8x16, 123],
    [binaryen.Q15MulrSatSVecI16x8, 130],
    [binaryen.AddVecI16x8, 142],
    [binaryen.AddSatSVecI16x8, 143],
    [binaryen.AddSatUVecI16x8, 144],
    [binaryen.SubVecI16x8, 145],
    [binaryen.SubSatSVecI16x8, 146],
    [binaryen.SubSatUVecI16x8, 147],
    [binaryen.MulVecI16x8, 149],
    [binaryen.MinSVecI16x8, 150],
    [binaryen.MinUVecI16x8, 151],
    [binaryen.MaxSVecI16x8, 152],
    [binaryen.MaxUVecI16x8, 153],
    [binaryen.AvgrUVecI16x8, 155],
    [binaryen.AddVecI32x4, 174],
    [binaryen.SubVecI32x4, 177],
    [binaryen.MulVecI32x4, 181],
    [binaryen.MinSVecI32x4, 182],
    [binaryen.MinUVecI32x4, 183],
    [binaryen.MaxSVecI32x4, 184],
    [binaryen.MaxUVecI32x4, 185],
    [binaryen.DotSVecI16x8ToVecI32x4, 186],
    [binaryen.AddVecI64x2, 206],
    [binaryen.SubVecI64x2, 209],
    [binaryen.MulVecI64x2, 213],
    [binaryen.EqVecI64x2, 214],
    [binaryen.NeVecI64x2, 215],
    [binaryen.LtSVecI64x2, 216],
    [binaryen.GtSVecI64x2, 217],
    [binaryen.LeSVecI64x2, 218],
    [binaryen.GeSVecI64x2, 219],
    [binaryen.AddVecF32x4, 228],
    [binaryen.SubVecF32x4, 229],
    [binaryen.MulVecF32x4, 230],
    [binaryen.DivVecF32x4, 231],
    [binaryen.MinVecF32x4, 232],
    [binaryen.MaxVecF32x4, 233],
    [binaryen.PMinVecF32x4, 234],
    [binaryen.PMaxVecF32x4, 235],
    [binaryen.AddVecF64x2, 240],
    [binaryen.SubVecF64x2, 241],
    [binaryen.MulVecF64x2, 242],
    [binaryen.DivVecF64x2, 243],
    [binaryen.MinVecF64x2, 244],
    [binaryen.MaxVecF64x2, 245],
    [binaryen.PMinVecF64x2, 246],
    [binaryen.PMaxVecF64x2, 247],
]);
const unarySubopcode = new Map([
    [binaryen.NotVec128, 77],
    [binaryen.AbsVecI8x16, 96],
    [binaryen.NegVecI8x16, 97],
    [binaryen.PopcntVecI8x16, 98],
    [binaryen.CeilVecF32x4, 103],
    [binaryen.FloorVecF32x4, 104],
    [binaryen.TruncVecF32x4, 105],
    [binaryen.NearestVecF32x4, 106],
    [binaryen.CeilVecF64x2, 116],
    [binaryen.FloorVecF64x2, 117],
    [binaryen.TruncVecF64x2, 122],
    [binaryen.ExtAddPairwiseSVecI8x16ToI16x8, 124],
    [binaryen.ExtAddPairwiseUVecI8x16ToI16x8, 125],
    [binaryen.ExtAddPairwiseSVecI16x8ToI32x4, 126],
    [binaryen.ExtAddPairwiseUVecI16x8ToI32x4, 127],
    [binaryen.AbsVecI16x8, 128],
    [binaryen.NegVecI16x8, 129],
    [binaryen.NearestVecF64x2, 148],
    [binaryen.AbsVecI32x4, 160],
    [binaryen.NegVecI32x4, 161],
    [binaryen.AbsVecI64x2, 192],
    [binaryen.NegVecI64x2, 193],
    [binaryen.AbsVecF32x4, 224],
    [binaryen.NegVecF32x4, 225],
    [binaryen.SqrtVecF32x4, 227],
    [binaryen.AbsVecF64x2, 236],
    [binaryen.NegVecF64x2, 237],
    [binaryen.SqrtVecF64x2, 239],
    [binaryen.TruncSatSVecF32x4ToVecI32x4, 248],
    [binaryen.TruncSatUVecF32x4ToVecI32x4, 249],
    [binaryen.ConvertSVecI32x4ToVecF32x4, 250],
    [binaryen.ConvertUVecI32x4ToVecF32x4, 251],
    [binaryen.RelaxedTruncSVecF32x4ToVecI32x4, 257],
    [binaryen.RelaxedTruncUVecF32x4ToVecI32x4, 258],
]);
const ternarySubopcode = new Map([
    [binaryen.BitselectVec128, 82],
    [binaryen.RelaxedMaddVecF32x4, 261],
    [binaryen.RelaxedNmaddVecF32x4, 262],
    [binaryen.RelaxedMaddVecF64x2, 263],
    [binaryen.RelaxedNmaddVecF64x2, 264],
    [binaryen.LaneselectI8x16, 265],
    [binaryen.LaneselectI16x8, 266],
    [binaryen.LaneselectI32x4, 267],
    [binaryen.LaneselectI64x2, 268],
    [binaryen.DotI8x16I7x16AddSToVecI32x4, 275],
]);
const canonicalNames = new Map([
    [35, "i8x16.eq"],
    [36, "i8x16.ne"],
    [37, "i8x16.lt_s"],
    [38, "i8x16.lt_u"],
    [39, "i8x16.gt_s"],
    [40, "i8x16.gt_u"],
    [41, "i8x16.le_s"],
    [42, "i8x16.le_u"],
    [43, "i8x16.ge_s"],
    [44, "i8x16.ge_u"],
    [45, "i16x8.eq"],
    [46, "i16x8.ne"],
    [47, "i16x8.lt_s"],
    [48, "i16x8.lt_u"],
    [49, "i16x8.gt_s"],
    [50, "i16x8.gt_u"],
    [51, "i16x8.le_s"],
    [52, "i16x8.le_u"],
    [53, "i16x8.ge_s"],
    [54, "i16x8.ge_u"],
    [55, "i32x4.eq"],
    [56, "i32x4.ne"],
    [57, "i32x4.lt_s"],
    [58, "i32x4.lt_u"],
    [59, "i32x4.gt_s"],
    [60, "i32x4.gt_u"],
    [61, "i32x4.le_s"],
    [62, "i32x4.le_u"],
    [63, "i32x4.ge_s"],
    [64, "i32x4.ge_u"],
    [65, "f32x4.eq"],
    [66, "f32x4.ne"],
    [67, "f32x4.lt"],
    [68, "f32x4.gt"],
    [69, "f32x4.le"],
    [70, "f32x4.ge"],
    [71, "f64x2.eq"],
    [72, "f64x2.ne"],
    [73, "f64x2.lt"],
    [74, "f64x2.gt"],
    [75, "f64x2.le"],
    [76, "f64x2.ge"],
    [77, "v128.not"],
    [78, "v128.and"],
    [79, "v128.andnot"],
    [80, "v128.or"],
    [81, "v128.xor"],
    [82, "v128.bitselect"],
    [96, "i8x16.abs"],
    [97, "i8x16.neg"],
    [98, "i8x16.popcnt"],
    [103, "f32x4.ceil"],
    [104, "f32x4.floor"],
    [105, "f32x4.trunc"],
    [106, "f32x4.nearest"],
    [116, "f64x2.ceil"],
    [117, "f64x2.floor"],
    [122, "f64x2.trunc"],
    [148, "f64x2.nearest"],
    [124, "i16x8.extadd_pairwise_i8x16_s"],
    [125, "i16x8.extadd_pairwise_i8x16_u"],
    [126, "i32x4.extadd_pairwise_i16x8_s"],
    [127, "i32x4.extadd_pairwise_i16x8_u"],
    [128, "i16x8.abs"],
    [129, "i16x8.neg"],
    [160, "i32x4.abs"],
    [161, "i32x4.neg"],
    [192, "i64x2.abs"],
    [193, "i64x2.neg"],
    [224, "f32x4.abs"],
    [225, "f32x4.neg"],
    [227, "f32x4.sqrt"],
    [236, "f64x2.abs"],
    [237, "f64x2.neg"],
    [239, "f64x2.sqrt"],
    [248, "i32x4.trunc_sat_f32x4_s"],
    [249, "i32x4.trunc_sat_f32x4_u"],
    [250, "f32x4.convert_i32x4_s"],
    [251, "f32x4.convert_i32x4_u"],
    [257, "i32x4.relaxed_trunc_f32x4_s"],
    [258, "i32x4.relaxed_trunc_f32x4_u"],
    [110, "i8x16.add"],
    [111, "i8x16.add_sat_s"],
    [112, "i8x16.add_sat_u"],
    [113, "i8x16.sub"],
    [114, "i8x16.sub_sat_s"],
    [115, "i8x16.sub_sat_u"],
    [118, "i8x16.min_s"],
    [119, "i8x16.min_u"],
    [120, "i8x16.max_s"],
    [121, "i8x16.max_u"],
    [123, "i8x16.avgr_u"],
    [130, "i16x8.q15mulr_sat_s"],
    [142, "i16x8.add"],
    [143, "i16x8.add_sat_s"],
    [144, "i16x8.add_sat_u"],
    [145, "i16x8.sub"],
    [146, "i16x8.sub_sat_s"],
    [147, "i16x8.sub_sat_u"],
    [149, "i16x8.mul"],
    [150, "i16x8.min_s"],
    [151, "i16x8.min_u"],
    [152, "i16x8.max_s"],
    [153, "i16x8.max_u"],
    [155, "i16x8.avgr_u"],
    [174, "i32x4.add"],
    [177, "i32x4.sub"],
    [181, "i32x4.mul"],
    [182, "i32x4.min_s"],
    [183, "i32x4.min_u"],
    [184, "i32x4.max_s"],
    [185, "i32x4.max_u"],
    [186, "i32x4.dot_i16x8_s"],
    [206, "i64x2.add"],
    [209, "i64x2.sub"],
    [213, "i64x2.mul"],
    [214, "i64x2.eq"],
    [215, "i64x2.ne"],
    [216, "i64x2.lt_s"],
    [217, "i64x2.gt_s"],
    [218, "i64x2.le_s"],
    [219, "i64x2.ge_s"],
    [228, "f32x4.add"],
    [229, "f32x4.sub"],
    [230, "f32x4.mul"],
    [231, "f32x4.div"],
    [232, "f32x4.min"],
    [233, "f32x4.max"],
    [234, "f32x4.pmin"],
    [235, "f32x4.pmax"],
    [240, "f64x2.add"],
    [241, "f64x2.sub"],
    [242, "f64x2.mul"],
    [243, "f64x2.div"],
    [244, "f64x2.min"],
    [245, "f64x2.max"],
    [246, "f64x2.pmin"],
    [247, "f64x2.pmax"],
    [261, "f32x4.relaxed_madd"],
    [262, "f32x4.relaxed_nmadd"],
    [263, "f64x2.relaxed_madd"],
    [264, "f64x2.relaxed_nmadd"],
    [265, "i8x16.relaxed_laneselect"],
    [266, "i16x8.relaxed_laneselect"],
    [267, "i32x4.relaxed_laneselect"],
    [268, "i64x2.relaxed_laneselect"],
    [269, "f32x4.relaxed_min"],
    [270, "f32x4.relaxed_max"],
    [271, "f64x2.relaxed_min"],
    [272, "f64x2.relaxed_max"],
    [273, "i16x8.relaxed_q15mulr_s"],
    [274, "i16x8.relaxed_dot_i8x16_i7x16_s"],
    [275, "i32x4.relaxed_dot_i8x16_i7x16_add_s"],
]);
function instructionName(bits, subopcode) {
    const base = canonicalNames.get(subopcode);
    if (!base)
        throw new Error(`as-simd: missing semantic name for SIMD opcode ${subopcode}`);
    const scale = bits / 128;
    return base
        .replaceAll("v128", `v${bits}`)
        .replaceAll("i8x16", `i8x${16 * scale}`)
        .replaceAll("i7x16", `i7x${16 * scale}`)
        .replaceAll("i16x8", `i16x${8 * scale}`)
        .replaceAll("i32x4", `i32x${4 * scale}`)
        .replaceAll("i64x2", `i64x${2 * scale}`)
        .replaceAll("f32x4", `f32x${4 * scale}`)
        .replaceAll("f64x2", `f64x${2 * scale}`);
}
class KernelRewriter extends ExpressionRewriter {
    rewrites = 0;
    helpers = new Map();
    loads = new Map();
    stores = new Map();
    originalFunctions = [];
    carrier;
    constructor(module) {
        super(module);
        this.carrier = wideCarrier(module);
        for (let i = 0, n = module.getNumFunctions(); i < n; i++) {
            this.originalFunctions.push(binaryen.getFunctionInfo(module.getFunctionByIndex(i)).name);
        }
    }
    runOriginals() {
        for (const name of this.originalFunctions) {
            const func = this.module.getFunction(name);
            if (!func)
                continue;
            const body = binaryen.getFunctionInfo(func).body;
            if (body)
                raw._BinaryenFunctionSetBody(func, this.visit(body));
        }
    }
    rewrite(expr) {
        const info = safeInfo(expr);
        if (!info || info.id !== binaryen.BlockId)
            return expr;
        const children = info.children;
        for (let i = 0; i + 1 < children.length; i++) {
            const fullWidth = matchKernelSequence(children, i, 4) ??
                matchKernelSequence(children, i, 2);
            if (fullWidth) {
                const bits = fullWidth.consumed * 128;
                raw._BinaryenBlockSetChildAt(expr, i, this.kernel(bits, fullWidth.subopcode, fullWidth.op, fullWidth.kind, fullWidth.dst, fullWidth.inputs));
                for (let child = 1; child < fullWidth.consumed; child++)
                    raw._BinaryenBlockSetChildAt(expr, i + child, this.module.nop());
                this.rewrites++;
                i += fullWidth.consumed - 1;
                continue;
            }
            const genericCalls = matchV256KernelCallPair(children, i) ??
                matchV256KernelCallAndUpperPair(children, i);
            if (genericCalls) {
                raw._BinaryenBlockSetChildAt(expr, i, this.kernel(512, genericCalls.subopcode, genericCalls.op, genericCalls.kind, genericCalls.dst, genericCalls.inputs));
                for (let child = 1; child < genericCalls.consumed; child++)
                    raw._BinaryenBlockSetChildAt(expr, i + child, this.module.nop());
                this.rewrites++;
                i += genericCalls.consumed - 1;
                continue;
            }
            const calls = matchV256CallPair(children, i);
            if (calls) {
                raw._BinaryenBlockSetChildAt(expr, i, this.kernel(512, calls.subopcode, calls.op, "binary", calls.dst, [
                    calls.left,
                    calls.right,
                ]));
                for (let child = 1; child < calls.consumed; child++)
                    raw._BinaryenBlockSetChildAt(expr, i + child, this.module.nop());
                this.rewrites++;
                i += calls.consumed - 1;
                continue;
            }
            const upper = matchV256CallAndUpperPair(children, i);
            if (upper) {
                raw._BinaryenBlockSetChildAt(expr, i, this.kernel(512, upper.subopcode, upper.op, "binary", upper.dst, [
                    upper.left,
                    upper.right,
                ]));
                for (let child = 1; child < upper.consumed; child++)
                    raw._BinaryenBlockSetChildAt(expr, i + child, this.module.nop());
                this.rewrites++;
                i += upper.consumed - 1;
                continue;
            }
            const pair = matchKernelPair(children[i], children[i + 1]);
            if (!pair)
                continue;
            let bits = 256, consumed = 2;
            if (i + 3 < children.length) {
                const upper = matchKernelPair(children[i + 2], children[i + 3]);
                if (upper && sameKernelStride(pair, upper, 32)) {
                    bits = 512;
                    consumed = 4;
                }
            }
            raw._BinaryenBlockSetChildAt(expr, i, this.kernel(bits, pair.subopcode, pair.op, pair.kind, pair.dst, pair.inputs));
            for (let child = 1; child < consumed; child++)
                raw._BinaryenBlockSetChildAt(expr, i + child, this.module.nop());
            this.rewrites++;
            i += consumed - 1;
        }
        return expr;
    }
    helper(bits, subopcode, _op, kind = "binary") {
        const key = `${bits}:${subopcode}`;
        const existing = this.helpers.get(key);
        if (existing)
            return existing;
        const name = `__as_simd_instruction_v${bits}_fd_${subopcode}`;
        const arity = kind === "unary" ? 1 : kind === "binary" ? 2 : 3;
        const params = binaryen.createType(Array.from({ length: arity }, () => this.carrier));
        this.module.addFunctionImport(name, INSTRUCTION_MODULE, instructionName(bits, subopcode), params, this.carrier);
        this.helpers.set(key, name);
        return name;
    }
    load(bits) {
        const existing = this.loads.get(bits);
        if (existing)
            return existing;
        const name = `__as_simd_instruction_v${bits}_load`;
        this.module.addFunctionImport(name, INSTRUCTION_MODULE, `v${bits}.load`, binaryen.i32, this.carrier);
        this.loads.set(bits, name);
        return name;
    }
    store(bits) {
        const existing = this.stores.get(bits);
        if (existing)
            return existing;
        const name = `__as_simd_instruction_v${bits}_store`;
        this.module.addFunctionImport(name, INSTRUCTION_MODULE, `v${bits}.store`, binaryen.createType([this.carrier, binaryen.i32]), binaryen.none);
        this.stores.set(bits, name);
        return name;
    }
    kernel(bits, subopcode, op, kind, dst, inputs) {
        const load = this.load(bits);
        const values = inputs.map((input) => this.module.call(load, [this.module.i32.const(input)], this.carrier));
        const result = this.module.call(this.helper(bits, subopcode, op, kind), values, this.carrier);
        return this.module.call(this.store(bits), [result, this.module.i32.const(dst)], binaryen.none);
    }
}
export function insertWideIntrinsicKernels(module) {
    const pass = new KernelRewriter(module);
    pass.runOriginals();
    module.optimize();
    module.updateMaps();
    pass.runOriginals();
    module.optimize();
    module.updateMaps();
    pass.runOriginals();
    return pass.rewrites;
}
function operationForSubopcode(subopcode) {
    for (const [kind, map] of [
        ["unary", unarySubopcode],
        ["binary", binarySubopcode],
        ["ternary", ternarySubopcode],
    ]) {
        const found = [...map].find(([, sub]) => sub === subopcode);
        if (found)
            return { kind, op: found[0] };
    }
    return null;
}
function v256KernelCall(expr) {
    const call = safeInfo(expr);
    if (!call || call.id !== binaryen.CallId)
        return null;
    if (call.target === "__as_simd_instruction_v256_store" &&
        call.operands.length === 2) {
        const operationCall = safeInfo(call.operands[0]);
        const dst = constantAddress(call.operands[1], 0);
        if (!operationCall || operationCall.id !== binaryen.CallId || dst === null)
            return null;
        const match = /^__as_simd_instruction_v256_fd_(\d+)$/.exec(operationCall.target);
        if (!match)
            return null;
        const subopcode = Number(match[1]), operation = operationForSubopcode(subopcode);
        if (!operation)
            return null;
        const arity = operation.kind === "unary" ? 1 : operation.kind === "binary" ? 2 : 3;
        if (operationCall.operands.length !== arity)
            return null;
        const inputs = operationCall.operands.map((operand) => {
            const load = safeInfo(operand);
            return !load ||
                load.id !== binaryen.CallId ||
                load.target !== "__as_simd_instruction_v256_load" ||
                load.operands.length !== 1
                ? null
                : constantAddress(load.operands[0], 0);
        });
        return inputs.some((input) => input === null)
            ? null
            : {
                kind: operation.kind,
                op: operation.op,
                subopcode,
                dst,
                inputs: inputs,
            };
    }
    const match = /^__as_simd_instruction_v256_fd_(\d+)$/.exec(call.target);
    if (!match)
        return null;
    const subopcode = Number(match[1]), operation = operationForSubopcode(subopcode);
    if (!operation)
        return null;
    const arity = operation.kind === "unary" ? 1 : operation.kind === "binary" ? 2 : 3;
    if (call.operands.length !== arity + 1)
        return null;
    const addresses = call.operands.map((operand) => constantAddress(operand, 0));
    if (addresses.some((address) => address === null))
        return null;
    return {
        kind: operation.kind,
        op: operation.op,
        subopcode,
        dst: addresses[0],
        inputs: addresses.slice(1),
    };
}
function matchV256KernelCallPair(children, index) {
    const first = v256KernelCall(children[index]);
    if (!first)
        return null;
    let next = index + 1;
    while (next < children.length &&
        safeInfo(children[next])?.id === binaryen.NopId)
        next++;
    const second = next < children.length ? v256KernelCall(children[next]) : null;
    return second && sameKernelStride(first, second, 32)
        ? { ...first, consumed: next - index + 1 }
        : null;
}
function matchV256KernelCallAndUpperPair(children, index) {
    const first = v256KernelCall(children[index]);
    if (!first)
        return null;
    let next = index + 1;
    while (next < children.length &&
        safeInfo(children[next])?.id === binaryen.NopId)
        next++;
    const upperFirst = next < children.length ? kernelStore(children[next]) : null;
    if (!upperFirst || !sameKernelStride(first, upperFirst, 32))
        return null;
    const last = next + 1, rawStore = last < children.length
        ? safeInfo(children[last])
        : null;
    if (!rawStore ||
        rawStore.id !== binaryen.StoreId ||
        rawStore.bytes !== 16 ||
        rawStore.isAtomic ||
        constantAddress(rawStore.ptr, rawStore.offset) !== first.dst + 48)
        return null;
    const operation = operationInfo(rawStore.value);
    return operation && operation.kind === first.kind && operation.op === first.op
        ? { ...first, consumed: last - index + 1 }
        : null;
}
function operationInfo(expr) {
    const value = safeInfo(expr);
    if (!value)
        return null;
    if (value.id === binaryen.UnaryId)
        return { kind: "unary", op: value.op };
    if (value.id === binaryen.BinaryId)
        return { kind: "binary", op: value.op };
    if (value.id === binaryen.SIMDTernaryId)
        return { kind: "ternary", op: value.op };
    return null;
}
function matchV256CallPair(children, index) {
    const first = v256Call(children[index]);
    if (!first)
        return null;
    let next = index + 1;
    while (next < children.length &&
        safeInfo(children[next])?.id === binaryen.NopId)
        next++;
    const second = next < children.length ? v256Call(children[next]) : null;
    if (!second ||
        first.subopcode !== second.subopcode ||
        second.dst !== first.dst + 32 ||
        second.left !== first.left + 32 ||
        second.right !== first.right + 32)
        return null;
    return { ...first, consumed: next - index + 1 };
}
function matchV256CallAndUpperPair(children, index) {
    const first = v256Call(children[index]);
    if (!first)
        return null;
    let next = index + 1;
    while (next < children.length &&
        safeInfo(children[next])?.id === binaryen.NopId)
        next++;
    const upperFirst = next < children.length ? binaryStore(children[next]) : null;
    if (!upperFirst ||
        upperFirst.op !== first.op ||
        upperFirst.dst !== first.dst + 32 ||
        upperFirst.left !== first.left + 32 ||
        upperFirst.right !== first.right + 32)
        return null;
    const last = next + 1;
    const rawStore = last < children.length
        ? safeInfo(children[last])
        : null;
    const rawValue = rawStore?.id === binaryen.StoreId
        ? safeInfo(rawStore.value)
        : null;
    const rawDst = rawStore?.id === binaryen.StoreId
        ? constantAddress(rawStore.ptr, rawStore.offset)
        : null;
    if (!rawStore ||
        rawStore.bytes !== 16 ||
        rawStore.isAtomic ||
        !rawValue ||
        rawValue.id !== binaryen.BinaryId ||
        rawValue.op !== first.op ||
        rawDst !== first.dst + 48)
        return null;
    return { ...first, consumed: last - index + 1 };
}
function v256Call(expr) {
    const call = safeInfo(expr);
    if (!call || call.id !== binaryen.CallId || call.operands.length !== 3)
        return null;
    const match = /^__as_simd_instruction_v256_fd_(\d+)$/.exec(call.target);
    if (!match)
        return null;
    const subopcode = Number(match[1]);
    const op = [...binarySubopcode].find(([, value]) => value === subopcode)?.[0];
    const dst = constantAddress(call.operands[0], 0), left = constantAddress(call.operands[1], 0), right = constantAddress(call.operands[2], 0);
    return op === undefined || dst === null || left === null || right === null
        ? null
        : { subopcode, op, dst, left, right };
}
function matchKernelPair(a, b) {
    const first = kernelStore(a), second = kernelStore(b);
    return first && second && sameKernelStride(first, second, 16) ? first : null;
}
function matchKernelSequence(children, index, count) {
    if (index + count > children.length)
        return null;
    const parts = Array.from({ length: count }, (_, i) => partialKernelStore(children[index + i]));
    const first = parts[0];
    if (!first)
        return null;
    for (let i = 1; i < count; i++) {
        const part = parts[i];
        if (!part ||
            part.kind !== first.kind ||
            part.op !== first.op ||
            part.subopcode !== first.subopcode ||
            part.dst !== first.dst + i * 16 ||
            part.inputs.length !== first.inputs.length)
            return null;
    }
    const inputs = [];
    for (let input = 0; input < first.inputs.length; input++) {
        let base = null;
        for (let i = 0; i < count; i++) {
            const value = parts[i].inputs[input];
            if (value === null)
                continue;
            const candidate = value - i * 16;
            if (base !== null && base !== candidate)
                return null;
            base = candidate;
        }
        if (base === null)
            return null;
        inputs.push(base);
    }
    return {
        kind: first.kind,
        op: first.op,
        subopcode: first.subopcode,
        dst: first.dst,
        inputs,
        consumed: count,
    };
}
function partialKernelStore(expr) {
    const store = safeInfo(expr);
    if (!store ||
        store.id !== binaryen.StoreId ||
        store.bytes !== 16 ||
        store.isAtomic)
        return null;
    const dst = constantAddress(store.ptr, store.offset), info = operationInfo(store.value);
    if (dst === null || !info)
        return null;
    let subopcode, operands;
    const value = safeInfo(store.value);
    if (info.kind === "unary") {
        subopcode = unarySubopcode.get(info.op);
        operands = [value.value];
    }
    else if (info.kind === "binary") {
        subopcode = binarySubopcode.get(info.op);
        const binary = value;
        operands = [binary.left, binary.right];
    }
    else {
        subopcode = ternarySubopcode.get(info.op);
        const ternary = value;
        operands = [ternary.a, ternary.b, ternary.c];
    }
    return subopcode === undefined
        ? null
        : {
            kind: info.kind,
            op: info.op,
            subopcode,
            dst,
            inputs: operands.map(vectorLoad),
        };
}
function sameKernelStride(first, second, stride) {
    return (first.kind === second.kind &&
        first.op === second.op &&
        first.subopcode === second.subopcode &&
        second.dst === first.dst + stride &&
        first.inputs.length === second.inputs.length &&
        first.inputs.every((input, index) => second.inputs[index] === input + stride));
}
function kernelStore(expr) {
    const store = safeInfo(expr);
    if (!store ||
        store.id !== binaryen.StoreId ||
        store.bytes !== 16 ||
        store.isAtomic)
        return null;
    const dst = constantAddress(store.ptr, store.offset);
    if (dst === null)
        return null;
    const value = safeInfo(store.value);
    if (!value)
        return null;
    let kind, op, subopcode, operands;
    if (value.id === binaryen.UnaryId) {
        const unary = value;
        kind = "unary";
        op = unary.op;
        subopcode = unarySubopcode.get(op);
        operands = [unary.value];
    }
    else if (value.id === binaryen.BinaryId) {
        const binary = value;
        kind = "binary";
        op = binary.op;
        subopcode = binarySubopcode.get(op);
        operands = [binary.left, binary.right];
    }
    else if (value.id === binaryen.SIMDTernaryId) {
        const ternary = value;
        kind = "ternary";
        op = ternary.op;
        subopcode = ternarySubopcode.get(op);
        operands = [ternary.a, ternary.b, ternary.c];
    }
    else
        return null;
    if (subopcode === undefined)
        return null;
    const inputs = operands.map(vectorLoad);
    return inputs.some((input) => input === null)
        ? null
        : { kind, op, subopcode, dst, inputs: inputs };
}
function matchBinaryPair(a, b) {
    const first = binaryStore(a), second = binaryStore(b);
    if (!first ||
        !second ||
        first.op !== second.op ||
        second.dst !== first.dst + 16 ||
        second.left !== first.left + 16 ||
        second.right !== first.right + 16)
        return null;
    const subopcode = binarySubopcode.get(first.op);
    return subopcode === undefined ? null : { ...first, subopcode };
}
function binaryStore(expr) {
    const store = safeInfo(expr);
    if (!store ||
        store.id !== binaryen.StoreId ||
        store.bytes !== 16 ||
        store.isAtomic)
        return null;
    const value = safeInfo(store.value);
    if (!value ||
        value.id !== binaryen.BinaryId ||
        !binarySubopcode.has(value.op))
        return null;
    const left = vectorLoad(value.left), right = vectorLoad(value.right), dst = constantAddress(store.ptr, store.offset);
    return left === null || right === null || dst === null
        ? null
        : { op: value.op, dst, left, right };
}
function vectorLoad(expr) {
    const load = safeInfo(expr);
    return !load ||
        load.id !== binaryen.LoadId ||
        load.bytes !== 16 ||
        load.isAtomic
        ? null
        : constantAddress(load.ptr, load.offset);
}
function constantAddress(expr, offset) {
    const info = safeInfo(expr);
    return !info || info.id !== binaryen.ConstId || typeof info.value !== "number"
        ? null
        : (info.value + offset) >>> 0;
}
function safeInfo(expr) {
    try {
        return binaryen.getExpressionInfo(expr);
    }
    catch {
        return null;
    }
}
