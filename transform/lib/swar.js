import binaryen from "binaryen";
import { ExpressionRewriter } from "./visitor.js";
const raw = binaryen;
class SwarRewriter extends ExpressionRewriter {
    rewrites = 0;
    rewrite(expr) {
        const nodeInfo = info(expr);
        if (nodeInfo.id === binaryen.UnaryId) {
            const node = nodeInfo;
            const width = node.op === binaryen.EqZInt32
                ? 32
                : node.op === binaryen.EqZInt64
                    ? 64
                    : null;
            return width
                ? this.fuseZeroLaneReduction(node.value, width) || expr
                : expr;
        }
        if (nodeInfo.id !== binaryen.BinaryId)
            return expr;
        const op = binary(expr).op;
        const width = widthOf(op);
        if (!width)
            return expr;
        return (this.fuseZeroLaneComparison(expr, op, width) ||
            this.fuseExpandedLaneReduction(expr, op, width) ||
            this.fuseExpandedLaneMask(expr, op, width) ||
            this.mergeConstantMasks(expr, op, width) ||
            this.factorCommonMask(expr, op, width) ||
            this.fuseShiftMasks(expr, op, width) ||
            this.fuseBitselect(expr, op, width) ||
            expr);
    }
    fuseZeroLaneComparison(expr, op, width) {
        if (op !== eqOp(width))
            return null;
        const pair = valueAndConstantOp(expr, width, op);
        return pair?.constant === 0n
            ? this.fuseZeroLaneReduction(pair.value, width)
            : null;
    }
    fuseZeroLaneReduction(expr, width) {
        const outer = valueAndConstant(expr, width);
        if (!outer ||
            info(outer.value).id !== binaryen.BinaryId ||
            binary(outer.value).op !== andOp(width))
            return null;
        const { left, right } = binary(outer.value);
        for (const [difference, inverse] of [
            [left, right],
            [right, left],
        ]) {
            if (info(difference).id !== binaryen.BinaryId ||
                binary(difference).op !== subOp(width) ||
                !isComplement(inverse, width))
                continue;
            const differenceNode = binary(difference);
            const ones = integerConstantValue(differenceNode.right, width);
            if (ones === null ||
                !sameValueReference(differenceNode.left, complementValue(inverse)))
                continue;
            const broadcast = laneBroadcast(differenceNode.left, width);
            if (!broadcast ||
                outer.constant !== broadcast.highMask ||
                ones !== broadcast.highMask >> BigInt(broadcast.shift))
                continue;
            const target = broadcast.complemented ? 0n : broadcast.highMask;
            if (target === 0n) {
                const source = laneNonzeroSource(broadcast.highBits, width);
                if (source)
                    return this.changed(makeBinary(this.module, eqOp(width), source, integerConstant(this.module, width, 0n)));
            }
            return this.changed(makeBinary(this.module, eqOp(width), broadcast.highBits, integerConstant(this.module, width, target)));
        }
        return null;
    }
    fuseExpandedLaneReduction(expr, op, width) {
        if (op !== eqOp(width) && op !== neOp(width))
            return null;
        const pair = valueAndConstantOp(expr, width, op);
        if (!pair)
            return null;
        const detector = laneNonzeroDetector(pair.value, width);
        if (detector && pair.constant === 0n) {
            return this.changed(makeBinary(this.module, op, detector.source, integerConstant(this.module, width, 0n)));
        }
        if (detector && pair.constant === detector.highMask) {
            const hasZero = makeHasZero(this.module, detector.source, detector.highMask, detector.shift, width);
            if (hasZero)
                return this.changed(makeBinary(this.module, op, hasZero, integerConstant(this.module, width, 0n)));
        }
        const all = (1n << BigInt(width)) - 1n;
        if (pair.constant !== 0n && pair.constant !== all)
            return null;
        const broadcast = laneBroadcast(pair.value, width);
        if (!broadcast)
            return null;
        const target = pair.constant === 0n
            ? broadcast.complemented
                ? broadcast.highMask
                : 0n
            : broadcast.complemented
                ? 0n
                : broadcast.highMask;
        if (target === broadcast.highMask) {
            const source = laneNonzeroSource(broadcast.highBits, width);
            const hasZero = source
                ? makeHasZero(this.module, source, broadcast.highMask, broadcast.shift, width)
                : null;
            if (hasZero)
                return this.changed(makeBinary(this.module, op, hasZero, integerConstant(this.module, width, 0n)));
        }
        if (target === 0n) {
            const source = laneNonzeroSource(broadcast.highBits, width);
            if (source)
                return this.changed(makeBinary(this.module, op, source, integerConstant(this.module, width, 0n)));
        }
        return this.changed(makeBinary(this.module, op, broadcast.highBits, integerConstant(this.module, width, target)));
    }
    fuseExpandedLaneMask(expr, op, width) {
        if (op !== andOp(width))
            return null;
        const outer = valueAndConstant(expr, width);
        if (!outer)
            return null;
        let expanded = outer.value;
        let complemented = false;
        if (isComplement(expanded, width)) {
            expanded = complementValue(expanded);
            complemented = true;
        }
        if (info(expanded).id !== binaryen.BinaryId ||
            binary(expanded).op !== mulOp(width))
            return null;
        const product = valueAndConstantOp(expanded, width, mulOp(width));
        if (!product || info(product.value).id !== binaryen.BinaryId)
            return null;
        const shiftNode = binary(product.value);
        if (shiftNode.op !== shrUOp(width))
            return null;
        const shiftValue = integerConstantValue(shiftNode.right, width);
        if (shiftValue === null)
            return null;
        const shift = Number(shiftValue & BigInt(width - 1));
        const high = valueAndConstant(shiftNode.left, width);
        if (!high || high.constant !== outer.constant)
            return null;
        if (shift === 0 ||
            !isLaneBroadcast(outer.constant, shift, product.constant, width))
            return null;
        if (!complemented)
            return this.changed(shiftNode.left);
        return this.changed(makeBinary(this.module, xorOp(width), shiftNode.left, integerConstant(this.module, width, outer.constant)));
    }
    changed(expr) {
        this.rewrites++;
        return expr;
    }
    mergeConstantMasks(expr, op, width) {
        const isAdd = op === addOp(width);
        if (op !== orOp(width) &&
            op !== xorOp(width) &&
            op !== andOp(width) &&
            !isAdd)
            return null;
        const left = binary(expr).left;
        const right = binary(expr).right;
        if (info(left).id !== binaryen.BinaryId ||
            info(right).id !== binaryen.BinaryId)
            return null;
        const childOp = binary(left).op;
        if (childOp !== andOp(width) || binary(right).op !== childOp)
            return null;
        const l = valueAndConstant(left, width);
        const r = valueAndConstant(right, width);
        if (!l || !r || !sameSimpleValue(l.value, r.value))
            return null;
        let mask;
        if (op === andOp(width))
            mask = l.constant & r.constant;
        else if (op === orOp(width))
            mask = l.constant | r.constant;
        else if (op === xorOp(width))
            mask = l.constant ^ r.constant;
        else {
            if ((l.constant & r.constant) !== 0n)
                return null;
            mask = l.constant | r.constant;
        }
        return this.changed(makeBinary(this.module, andOp(width), l.value, integerConstant(this.module, width, mask)));
    }
    factorCommonMask(expr, op, width) {
        if (op !== andOp(width) && op !== orOp(width) && op !== xorOp(width))
            return null;
        const left = binary(expr).left;
        const right = binary(expr).right;
        if (info(left).id !== binaryen.BinaryId ||
            info(right).id !== binaryen.BinaryId)
            return null;
        const childOp = binary(left).op;
        if ((childOp !== andOp(width) && childOp !== orOp(width)) ||
            binary(right).op !== childOp)
            return null;
        const l = valueAndConstantOp(left, width, childOp);
        const r = valueAndConstantOp(right, width, childOp);
        if (!l || !r || l.constant !== r.constant)
            return null;
        const merged = makeBinary(this.module, op, l.value, r.value);
        if (childOp === andOp(width) || op === xorOp(width)) {
            const all = (1n << BigInt(width)) - 1n;
            const mask = childOp === andOp(width) ? l.constant : all ^ l.constant;
            return this.changed(makeBinary(this.module, andOp(width), merged, integerConstant(this.module, width, mask)));
        }
        return this.changed(makeBinary(this.module, orOp(width), merged, integerConstant(this.module, width, l.constant)));
    }
    fuseShiftMasks(expr, op, width) {
        if (op !== shlOp(width) && op !== shrUOp(width))
            return null;
        const amount = integerConstantValue(binary(expr).right, width);
        if (amount === null)
            return null;
        const shift = Number(amount & BigInt(width - 1));
        const left = binary(expr).left;
        if (info(left).id !== binaryen.BinaryId)
            return null;
        let inner = left;
        let mask = null;
        if (binary(inner).op === andOp(width)) {
            const pair = valueAndConstant(inner, width);
            if (!pair || info(pair.value).id !== binaryen.BinaryId)
                return null;
            mask = pair.constant;
            inner = pair.value;
        }
        const inverse = op === shlOp(width) ? shrUOp(width) : shlOp(width);
        if (binary(inner).op !== inverse)
            return null;
        const innerAmount = integerConstantValue(binary(inner).right, width);
        if (innerAmount === null ||
            Number(innerAmount & BigInt(width - 1)) !== shift)
            return null;
        const all = (1n << BigInt(width)) - 1n;
        let fused = op === shlOp(width) ? (all << BigInt(shift)) & all : all >> BigInt(shift);
        if (mask !== null) {
            fused =
                op === shlOp(width)
                    ? (mask << BigInt(shift)) & all
                    : mask >> BigInt(shift);
        }
        const value = binary(inner).left;
        if (shift === 0 || fused === all)
            return this.changed(value);
        return this.changed(makeBinary(this.module, andOp(width), value, integerConstant(this.module, width, fused)));
    }
    fuseBitselect(expr, op, width) {
        if (op !== orOp(width) && op !== xorOp(width))
            return null;
        const left = maskedValue(binary(expr).left, width);
        const right = maskedValue(binary(expr).right, width);
        if (!left || !right || left.complemented === right.complemented)
            return null;
        const plain = left.complemented ? right : left;
        const inverse = left.complemented ? left : right;
        if (!sameSimpleValue(plain.mask, inverse.mask) ||
            !isCheapLeaf(plain.value) ||
            !isCheapLeaf(inverse.value))
            return null;
        const inverseCopy = this.module.copyExpression(inverse.value);
        return this.changed(makeBinary(this.module, xorOp(width), inverse.value, makeBinary(this.module, andOp(width), makeBinary(this.module, xorOp(width), plain.value, inverseCopy), plain.mask)));
    }
}
function makeHasZero(module, source, highMask, shift, width) {
    let second;
    const sourceInfo = info(source);
    if (sourceInfo.id === binaryen.LocalSetId &&
        sourceInfo.isTee) {
        const local = sourceInfo;
        second = module.local.get(local.index, sourceInfo.type);
    }
    else if (isCheapLeaf(source)) {
        second = module.copyExpression(source);
    }
    else
        return null;
    const all = (1n << BigInt(width)) - 1n;
    const laneOnes = highMask >> BigInt(shift);
    const difference = makeBinary(module, subOp(width), source, integerConstant(module, width, laneOnes));
    const inverse = makeBinary(module, xorOp(width), second, integerConstant(module, width, all));
    return makeBinary(module, andOp(width), makeBinary(module, andOp(width), difference, inverse), integerConstant(module, width, highMask));
}
function isLaneBroadcast(highMask, shift, laneMask, width) {
    const all = (1n << BigInt(width)) - 1n;
    let occupied = 0n;
    for (let bitIndex = 0; bitIndex < width; bitIndex++) {
        const bit = 1n << BigInt(bitIndex);
        if ((highMask & bit) === 0n)
            continue;
        if (bitIndex < shift)
            return false;
        const expansion = ((bit >> BigInt(shift)) * laneMask) & all;
        if ((expansion & highMask) !== bit || (occupied & expansion) !== 0n)
            return false;
        occupied |= expansion;
    }
    return occupied === all;
}
export function optimizeSwarExpressions(module) {
    let expressions = 0;
    let rewrites = 0;
    for (let pass = 0; pass < 8; pass++) {
        const optimizer = new SwarRewriter(module);
        optimizer.run();
        expressions += optimizer.expressions;
        rewrites += optimizer.rewrites;
        if (optimizer.rewrites === 0)
            break;
    }
    return { expressions, rewrites };
}
function widthOf(op) {
    return op >= binaryen.AddInt32 && op <= binaryen.GeUInt32
        ? 32
        : op >= binaryen.AddInt64 && op <= binaryen.GeUInt64
            ? 64
            : null;
}
function andOp(width) {
    return width === 32 ? binaryen.AndInt32 : binaryen.AndInt64;
}
function orOp(width) {
    return width === 32 ? binaryen.OrInt32 : binaryen.OrInt64;
}
function xorOp(width) {
    return width === 32 ? binaryen.XorInt32 : binaryen.XorInt64;
}
function shlOp(width) {
    return width === 32 ? binaryen.ShlInt32 : binaryen.ShlInt64;
}
function mulOp(width) {
    return width === 32 ? binaryen.MulInt32 : binaryen.MulInt64;
}
function addOp(width) {
    return width === 32 ? binaryen.AddInt32 : binaryen.AddInt64;
}
function subOp(width) {
    return width === 32 ? binaryen.SubInt32 : binaryen.SubInt64;
}
function shrUOp(width) {
    return width === 32 ? binaryen.ShrUInt32 : binaryen.ShrUInt64;
}
function eqOp(width) {
    return width === 32 ? binaryen.EqInt32 : binaryen.EqInt64;
}
function neOp(width) {
    return width === 32 ? binaryen.NeInt32 : binaryen.NeInt64;
}
function laneBroadcast(expr, width) {
    let expanded = expr;
    const expandedInfo = info(expanded);
    if (expandedInfo.id === binaryen.LocalSetId &&
        expandedInfo.isTee) {
        expanded = expandedInfo.value;
    }
    let complemented = false;
    if (isComplement(expanded, width)) {
        expanded = complementValue(expanded);
        complemented = true;
    }
    const product = valueAndConstantOp(expanded, width, mulOp(width));
    if (!product || info(product.value).id !== binaryen.BinaryId)
        return null;
    const shiftNode = binary(product.value);
    if (shiftNode.op !== shrUOp(width))
        return null;
    const shiftValue = integerConstantValue(shiftNode.right, width);
    if (shiftValue === null)
        return null;
    const shift = Number(shiftValue & BigInt(width - 1));
    const high = valueAndConstant(shiftNode.left, width);
    if (!high ||
        shift === 0 ||
        !isLaneBroadcast(high.constant, shift, product.constant, width))
        return null;
    return {
        highBits: shiftNode.left,
        highMask: high.constant,
        shift,
        complemented,
    };
}
function laneNonzeroSource(expr, width) {
    return laneNonzeroDetector(expr, width)?.source ?? null;
}
function laneNonzeroDetector(expr, width) {
    const outer = valueAndConstant(expr, width);
    if (!outer ||
        info(outer.value).id !== binaryen.BinaryId ||
        binary(outer.value).op !== orOp(width))
        return null;
    const all = (1n << BigInt(width)) - 1n;
    const lowMask = all ^ outer.constant;
    const shift = trailingZeroes(outer.constant, width);
    const laneMask = (1n << BigInt(shift + 1)) - 1n;
    if (shift === 0 || !isLaneBroadcast(outer.constant, shift, laneMask, width))
        return null;
    const { left, right } = binary(outer.value);
    for (const [sumExpr, source] of [
        [left, right],
        [right, left],
    ]) {
        const sum = valueAndConstantOp(sumExpr, width, width === 32 ? binaryen.AddInt32 : binaryen.AddInt64);
        if (!sum || sum.constant !== lowMask)
            continue;
        const masked = valueAndConstant(sum.value, width);
        if (masked &&
            masked.constant === lowMask &&
            sameValueReference(masked.value, source)) {
            return {
                source: info(masked.value).id === binaryen.LocalSetId ? masked.value : source,
                highMask: outer.constant,
                shift,
            };
        }
    }
    return null;
}
function trailingZeroes(value, width) {
    for (let shift = 0; shift < width; shift++) {
        if ((value & (1n << BigInt(shift))) !== 0n)
            return shift;
    }
    return width;
}
function integerConstantValue(expr, width) {
    const node = info(expr);
    if (node.id !== binaryen.ConstId)
        return null;
    const value = node.value;
    if (width === 32)
        return BigInt(value >>> 0);
    if (typeof value === "bigint")
        return BigInt.asUintN(64, value);
    const parts = value;
    const lo = BigInt(parts.low >>> 0);
    const hi = BigInt(parts.high >>> 0);
    return (hi << 32n) | lo;
}
function integerConstant(module, width, value) {
    if (width === 32)
        return module.i32.const(Number(value & 0xffffffffn) | 0);
    return module.i64.const(BigInt.asIntN(64, value));
}
function makeBinary(module, op, left, right) {
    return raw._BinaryenBinary(module.ptr, op, left, right);
}
function valueAndConstant(expr, width) {
    if (info(expr).id !== binaryen.BinaryId || binary(expr).op !== andOp(width))
        return null;
    const { left, right } = binary(expr);
    const rc = integerConstantValue(right, width);
    if (rc !== null)
        return { value: left, constant: rc };
    const lc = integerConstantValue(left, width);
    return lc === null ? null : { value: right, constant: lc };
}
function valueAndConstantOp(expr, width, op) {
    if (info(expr).id !== binaryen.BinaryId || binary(expr).op !== op)
        return null;
    const { left, right } = binary(expr);
    const rc = integerConstantValue(right, width);
    if (rc !== null)
        return { value: left, constant: rc };
    const lc = integerConstantValue(left, width);
    return lc === null ? null : { value: right, constant: lc };
}
function maskedValue(expr, width) {
    if (info(expr).id !== binaryen.BinaryId || binary(expr).op !== andOp(width))
        return null;
    let { left: value, right: mask } = binary(expr);
    if (isComplement(value, width))
        [value, mask] = [mask, value];
    if (isComplement(mask, width)) {
        return {
            value,
            mask: complementValue(mask),
            complemented: true,
        };
    }
    return { value, mask, complemented: false };
}
function isComplement(expr, width) {
    if (info(expr).id !== binaryen.BinaryId || binary(expr).op !== xorOp(width))
        return false;
    const all = (1n << BigInt(width)) - 1n;
    return (integerConstantValue(binary(expr).left, width) === all ||
        integerConstantValue(binary(expr).right, width) === all);
}
function complementValue(expr) {
    const { left, right } = binary(expr);
    return info(left).id === binaryen.ConstId ? right : left;
}
function isCheapLeaf(expr) {
    const id = info(expr).id;
    return (id === binaryen.LocalGetId ||
        id === binaryen.GlobalGetId ||
        id === binaryen.ConstId);
}
function sameSimpleValue(a, b) {
    const ai = info(a);
    const bi = info(b);
    const aid = ai.id;
    if (aid !== bi.id || ai.type !== bi.type)
        return false;
    switch (aid) {
        case binaryen.LocalGetId:
            return (ai.index ===
                bi.index);
        case binaryen.GlobalGetId:
            return (ai.name ===
                bi.name);
        case binaryen.ConstId:
            return (ai.value === bi.value);
        default:
            return false;
    }
}
function sameValueReference(a, b) {
    const ai = info(a);
    const bi = info(b);
    if ((ai.id === binaryen.LocalGetId || ai.id === binaryen.LocalSetId) &&
        (bi.id === binaryen.LocalGetId || bi.id === binaryen.LocalSetId)) {
        const aLocal = ai;
        const bLocal = bi;
        return (aLocal.index === bLocal.index &&
            (ai.id !== binaryen.LocalSetId || ai.isTee) &&
            (bi.id !== binaryen.LocalSetId || bi.isTee));
    }
    return sameSimpleValue(a, b);
}
function info(expr) {
    return binaryen.getExpressionInfo(expr);
}
function binary(expr) {
    return binaryen.getExpressionInfo(expr);
}
