import binaryen from "binaryen";
import { ExpressionRewriter } from "./visitor.js";

type ExpressionRef = binaryen.ExpressionRef;
type Module = binaryen.Module;

export interface SwarOptimizationStats {
  expressions: number;
  rewrites: number;
}

type Width = 32 | 64;
type BinaryOp = number;

interface MaskedValue {
  value: ExpressionRef;
  mask: ExpressionRef;
  complemented: boolean;
}

interface LaneBroadcast {
  highBits: ExpressionRef;
  highMask: bigint;
  shift: number;
  complemented: boolean;
}

interface LaneNonzeroDetector {
  source: ExpressionRef;
  highMask: bigint;
  shift: number;
}

const raw = binaryen as unknown as {
  _BinaryenBinary(
    module: number,
    op: BinaryOp,
    left: ExpressionRef,
    right: ExpressionRef,
  ): ExpressionRef;
};

class SwarRewriter extends ExpressionRewriter {
  rewrites = 0;

  protected rewrite(expr: ExpressionRef): ExpressionRef {
    const nodeInfo = info(expr);
    if (nodeInfo.id === binaryen.UnaryId) {
      const node = nodeInfo as binaryen.UnaryInfo;
      const width =
        node.op === binaryen.EqZInt32
          ? 32
          : node.op === binaryen.EqZInt64
            ? 64
            : null;
      return width
        ? this.fuseZeroLaneReduction(node.value, width) || expr
        : expr;
    }
    if (nodeInfo.id !== binaryen.BinaryId) return expr;

    const op = binary(expr).op;
    const width = widthOf(op);
    if (!width) return expr;

    return (
      this.fuseZeroLaneComparison(expr, op, width) ||
      this.fuseExpandedLaneReduction(expr, op, width) ||
      this.fuseExpandedLaneMask(expr, op, width) ||
      this.mergeConstantMasks(expr, op, width) ||
      this.factorCommonMask(expr, op, width) ||
      this.fuseShiftMasks(expr, op, width) ||
      this.fuseBitselect(expr, op, width) ||
      expr
    );
  }

  private fuseZeroLaneComparison(
    expr: ExpressionRef,
    op: BinaryOp,
    width: Width,
  ): ExpressionRef | null {
    if (op !== eqOp(width)) return null;
    const pair = valueAndConstantOp(expr, width, op);
    return pair?.constant === 0n
      ? this.fuseZeroLaneReduction(pair.value, width)
      : null;
  }

  /** Eliminate the has-zero-lane reduction around a full-lane comparison mask. */
  private fuseZeroLaneReduction(
    expr: ExpressionRef,
    width: Width,
  ): ExpressionRef | null {
    const outer = valueAndConstant(expr, width);
    if (
      !outer ||
      info(outer.value).id !== binaryen.BinaryId ||
      binary(outer.value).op !== andOp(width)
    )
      return null;
    const { left, right } = binary(outer.value);
    for (const [difference, inverse] of [
      [left, right],
      [right, left],
    ] as const) {
      if (
        info(difference).id !== binaryen.BinaryId ||
        binary(difference).op !== subOp(width) ||
        !isComplement(inverse, width)
      )
        continue;
      const differenceNode = binary(difference);
      const ones = integerConstantValue(differenceNode.right, width);
      if (
        ones === null ||
        !sameValueReference(differenceNode.left, complementValue(inverse))
      )
        continue;
      const broadcast = laneBroadcast(differenceNode.left, width);
      if (
        !broadcast ||
        outer.constant !== broadcast.highMask ||
        ones !== broadcast.highMask >> BigInt(broadcast.shift)
      )
        continue;
      const target = broadcast.complemented ? 0n : broadcast.highMask;
      if (target === 0n) {
        const source = laneNonzeroSource(broadcast.highBits, width);
        if (source)
          return this.changed(
            makeBinary(
              this.module,
              eqOp(width),
              source,
              integerConstant(this.module, width, 0n),
            ),
          );
      }
      return this.changed(
        makeBinary(
          this.module,
          eqOp(width),
          broadcast.highBits,
          integerConstant(this.module, width, target),
        ),
      );
    }
    return null;
  }

  /**
   * A lane comparison first produces one high bit per lane, broadcasts those
   * bits to full-lane masks, then reductions often compare that expansion with
   * zero or all-ones. Compare the compact high-bit representation directly:
   *
   *   broadcast(high) != 0  -> high != 0
   *   ~broadcast(high) != 0 -> high != highMask
   */
  private fuseExpandedLaneReduction(
    expr: ExpressionRef,
    op: BinaryOp,
    width: Width,
  ): ExpressionRef | null {
    if (op !== eqOp(width) && op !== neOp(width)) return null;
    const pair = valueAndConstantOp(expr, width, op);
    if (!pair) return null;

    // The exact carry-isolated detector is sometimes consumed directly,
    // without first being expanded to full-lane masks. Reduce predicates on
    // that compact form before looking for a broadcast:
    //
    //   nonzeroHighBits == 0        -> source == 0
    //   nonzeroHighBits == highMask -> hasZero(source) == 0
    const detector = laneNonzeroDetector(pair.value, width);
    if (detector && pair.constant === 0n) {
      return this.changed(
        makeBinary(
          this.module,
          op,
          detector.source,
          integerConstant(this.module, width, 0n),
        ),
      );
    }
    if (detector && pair.constant === detector.highMask) {
      const hasZero = makeHasZero(
        this.module,
        detector.source,
        detector.highMask,
        detector.shift,
        width,
      );
      if (hasZero)
        return this.changed(
          makeBinary(
            this.module,
            op,
            hasZero,
            integerConstant(this.module, width, 0n),
          ),
        );
    }

    const all = (1n << BigInt(width)) - 1n;
    if (pair.constant !== 0n && pair.constant !== all) return null;

    const broadcast = laneBroadcast(pair.value, width);
    if (!broadcast) return null;
    const target =
      pair.constant === 0n
        ? broadcast.complemented
          ? broadcast.highMask
          : 0n
        : broadcast.complemented
          ? 0n
          : broadcast.highMask;
    if (target === broadcast.highMask) {
      const source = laneNonzeroSource(broadcast.highBits, width);
      const hasZero = source
        ? makeHasZero(
            this.module,
            source,
            broadcast.highMask,
            broadcast.shift,
            width,
          )
        : null;
      if (hasZero)
        return this.changed(
          makeBinary(
            this.module,
            op,
            hasZero,
            integerConstant(this.module, width, 0n),
          ),
        );
    }
    if (target === 0n) {
      const source = laneNonzeroSource(broadcast.highBits, width);
      if (source)
        return this.changed(
          makeBinary(
            this.module,
            op,
            source,
            integerConstant(this.module, width, 0n),
          ),
        );
    }
    return this.changed(
      makeBinary(
        this.module,
        op,
        broadcast.highBits,
        integerConstant(this.module, width, target),
      ),
    );
  }

  /**
   * Cancel a full-lane mask expansion when the consumer immediately keeps
   * only each lane's high bit:
   *
   *   (~((((highBits >> s) * laneMax))) & highBitsMask)
   *     -> highBits ^ highBitsMask
   *
   * Equality followed by bitmask is the common producer/consumer pair.
   */
  private fuseExpandedLaneMask(
    expr: ExpressionRef,
    op: BinaryOp,
    width: Width,
  ): ExpressionRef | null {
    if (op !== andOp(width)) return null;
    const outer = valueAndConstant(expr, width);
    if (!outer) return null;

    let expanded = outer.value;
    let complemented = false;
    if (isComplement(expanded, width)) {
      expanded = complementValue(expanded);
      complemented = true;
    }
    if (
      info(expanded).id !== binaryen.BinaryId ||
      binary(expanded).op !== mulOp(width)
    )
      return null;

    const product = valueAndConstantOp(expanded, width, mulOp(width));
    if (!product || info(product.value).id !== binaryen.BinaryId) return null;
    const shiftNode = binary(product.value);
    if (shiftNode.op !== shrUOp(width)) return null;
    const shiftValue = integerConstantValue(shiftNode.right, width);
    if (shiftValue === null) return null;
    const shift = Number(shiftValue & BigInt(width - 1));

    const high = valueAndConstant(shiftNode.left, width);
    if (!high || high.constant !== outer.constant) return null;
    // This both proves the mask is one high bit per lane and that the multiply
    // is the corresponding broadcast to all bits of that lane.
    if (
      shift === 0 ||
      !isLaneBroadcast(outer.constant, shift, product.constant, width)
    )
      return null;

    if (!complemented) return this.changed(shiftNode.left);
    return this.changed(
      makeBinary(
        this.module,
        xorOp(width),
        shiftNode.left,
        integerConstant(this.module, width, outer.constant),
      ),
    );
  }

  private changed(expr: ExpressionRef): ExpressionRef {
    this.rewrites++;
    return expr;
  }

  /** Merge two masked copies of the same pure value into one mask operation. */
  private mergeConstantMasks(
    expr: ExpressionRef,
    op: BinaryOp,
    width: Width,
  ): ExpressionRef | null {
    const isAdd = op === addOp(width);
    if (
      op !== orOp(width) &&
      op !== xorOp(width) &&
      op !== andOp(width) &&
      !isAdd
    )
      return null;

    const left = binary(expr).left;
    const right = binary(expr).right;
    if (
      info(left).id !== binaryen.BinaryId ||
      info(right).id !== binaryen.BinaryId
    )
      return null;

    const childOp = binary(left).op;
    if (childOp !== andOp(width) || binary(right).op !== childOp) return null;
    const l = valueAndConstant(left, width);
    const r = valueAndConstant(right, width);
    if (!l || !r || !sameSimpleValue(l.value, r.value)) return null;

    let mask: bigint;
    if (op === andOp(width)) mask = l.constant & r.constant;
    else if (op === orOp(width)) mask = l.constant | r.constant;
    else if (op === xorOp(width)) mask = l.constant ^ r.constant;
    else {
      if ((l.constant & r.constant) !== 0n) return null;
      mask = l.constant | r.constant;
    }

    return this.changed(
      makeBinary(
        this.module,
        andOp(width),
        l.value,
        integerConstant(this.module, width, mask),
      ),
    );
  }

  /**
   * Factor a common constant mask through a bitwise operation. This turns two
   * mask instructions plus a merge into one merge plus one mask.
   */
  private factorCommonMask(
    expr: ExpressionRef,
    op: BinaryOp,
    width: Width,
  ): ExpressionRef | null {
    if (op !== andOp(width) && op !== orOp(width) && op !== xorOp(width))
      return null;
    const left = binary(expr).left;
    const right = binary(expr).right;
    if (
      info(left).id !== binaryen.BinaryId ||
      info(right).id !== binaryen.BinaryId
    )
      return null;
    const childOp = binary(left).op;
    if (
      (childOp !== andOp(width) && childOp !== orOp(width)) ||
      binary(right).op !== childOp
    )
      return null;
    const l = valueAndConstantOp(left, width, childOp);
    const r = valueAndConstantOp(right, width, childOp);
    if (!l || !r || l.constant !== r.constant) return null;

    const merged = makeBinary(this.module, op, l.value, r.value);
    if (childOp === andOp(width) || op === xorOp(width)) {
      const all = (1n << BigInt(width)) - 1n;
      const mask = childOp === andOp(width) ? l.constant : all ^ l.constant;
      return this.changed(
        makeBinary(
          this.module,
          andOp(width),
          merged,
          integerConstant(this.module, width, mask),
        ),
      );
    }
    return this.changed(
      makeBinary(
        this.module,
        orOp(width),
        merged,
        integerConstant(this.module, width, l.constant),
      ),
    );
  }

  /** Collapse extraction/repacking shift pairs into a single constant mask. */
  private fuseShiftMasks(
    expr: ExpressionRef,
    op: BinaryOp,
    width: Width,
  ): ExpressionRef | null {
    if (op !== shlOp(width) && op !== shrUOp(width)) return null;
    const amount = integerConstantValue(binary(expr).right, width);
    if (amount === null) return null;
    const shift = Number(amount & BigInt(width - 1));
    const left = binary(expr).left;
    if (info(left).id !== binaryen.BinaryId) return null;

    let inner = left;
    let mask: bigint | null = null;
    if (binary(inner).op === andOp(width)) {
      const pair = valueAndConstant(inner, width);
      if (!pair || info(pair.value).id !== binaryen.BinaryId) return null;
      mask = pair.constant;
      inner = pair.value;
    }

    const inverse = op === shlOp(width) ? shrUOp(width) : shlOp(width);
    if (binary(inner).op !== inverse) return null;
    const innerAmount = integerConstantValue(binary(inner).right, width);
    if (
      innerAmount === null ||
      Number(innerAmount & BigInt(width - 1)) !== shift
    )
      return null;

    const all = (1n << BigInt(width)) - 1n;
    let fused =
      op === shlOp(width) ? (all << BigInt(shift)) & all : all >> BigInt(shift);
    if (mask !== null) {
      fused =
        op === shlOp(width)
          ? (mask << BigInt(shift)) & all
          : mask >> BigInt(shift);
    }

    const value = binary(inner).left;
    if (shift === 0 || fused === all) return this.changed(value);
    return this.changed(
      makeBinary(
        this.module,
        andOp(width),
        value,
        integerConstant(this.module, width, fused),
      ),
    );
  }

  /**
   * (a & mask) | (b & ~mask) -> b ^ ((a ^ b) & mask)
   *
   * This is the scalar SWAR form of bitselect and removes one logical op.
   * Values are restricted to cheap leaves so copying b cannot duplicate work.
   */
  private fuseBitselect(
    expr: ExpressionRef,
    op: BinaryOp,
    width: Width,
  ): ExpressionRef | null {
    if (op !== orOp(width) && op !== xorOp(width)) return null;
    const left = maskedValue(binary(expr).left, width);
    const right = maskedValue(binary(expr).right, width);
    if (!left || !right || left.complemented === right.complemented)
      return null;

    const plain = left.complemented ? right : left;
    const inverse = left.complemented ? left : right;
    if (
      !sameSimpleValue(plain.mask, inverse.mask) ||
      !isCheapLeaf(plain.value) ||
      !isCheapLeaf(inverse.value)
    )
      return null;

    const inverseCopy = this.module.copyExpression(inverse.value);
    return this.changed(
      makeBinary(
        this.module,
        xorOp(width),
        inverse.value,
        makeBinary(
          this.module,
          andOp(width),
          makeBinary(this.module, xorOp(width), plain.value, inverseCopy),
          plain.mask,
        ),
      ),
    );
  }
}

/**
 * Build the reduced borrow-based zero-lane predicate:
 *   ((x - laneOnes) & ~x & laneHighBits)
 *
 * Borrow propagation can mark an adjacent lane, so this is unsuitable for a
 * lane bitmask. It is exact for the only property used here: zero iff no lane
 * is zero. A local.tee is evaluated once and reused through a local.get.
 */
function makeHasZero(
  module: Module,
  source: ExpressionRef,
  highMask: bigint,
  shift: number,
  width: Width,
): ExpressionRef | null {
  let second: ExpressionRef;
  const sourceInfo = info(source);
  if (
    sourceInfo.id === binaryen.LocalSetId &&
    (sourceInfo as binaryen.LocalSetInfo).isTee
  ) {
    const local = sourceInfo as binaryen.LocalSetInfo;
    second = module.local.get(local.index, sourceInfo.type);
  } else if (isCheapLeaf(source)) {
    second = module.copyExpression(source);
  } else return null;

  const all = (1n << BigInt(width)) - 1n;
  const laneOnes = highMask >> BigInt(shift);
  const difference = makeBinary(
    module,
    subOp(width),
    source,
    integerConstant(module, width, laneOnes),
  );
  const inverse = makeBinary(
    module,
    xorOp(width),
    second,
    integerConstant(module, width, all),
  );
  return makeBinary(
    module,
    andOp(width),
    makeBinary(module, andOp(width), difference, inverse),
    integerConstant(module, width, highMask),
  );
}

function isLaneBroadcast(
  highMask: bigint,
  shift: number,
  laneMask: bigint,
  width: Width,
): boolean {
  const all = (1n << BigInt(width)) - 1n;
  let occupied = 0n;
  for (let bitIndex = 0; bitIndex < width; bitIndex++) {
    const bit = 1n << BigInt(bitIndex);
    if ((highMask & bit) === 0n) continue;
    if (bitIndex < shift) return false;
    const expansion = ((bit >> BigInt(shift)) * laneMask) & all;
    if ((expansion & highMask) !== bit || (occupied & expansion) !== 0n)
      return false;
    occupied |= expansion;
  }
  return occupied === all;
}

export function optimizeSwarExpressions(module: Module): SwarOptimizationStats {
  let expressions = 0;
  let rewrites = 0;

  // A replacement can expose a new outer pattern (for example, contracting a
  // full-lane broadcast first exposes its compact nonzero-lane detector).
  // Resolve those pure expression islands to a fixed point, Valent-block
  // style. Every rule removes operations, so convergence is normally reached
  // in two sweeps; the cap is a defensive guard for future rules.
  for (let pass = 0; pass < 8; pass++) {
    const optimizer = new SwarRewriter(module);
    optimizer.run();
    expressions += optimizer.expressions;
    rewrites += optimizer.rewrites;
    if (optimizer.rewrites === 0) break;
  }
  return { expressions, rewrites };
}

function widthOf(op: BinaryOp): Width | null {
  return op >= binaryen.AddInt32 && op <= binaryen.GeUInt32
    ? 32
    : op >= binaryen.AddInt64 && op <= binaryen.GeUInt64
      ? 64
      : null;
}

function andOp(width: Width): BinaryOp {
  return width === 32 ? binaryen.AndInt32 : binaryen.AndInt64;
}
function orOp(width: Width): BinaryOp {
  return width === 32 ? binaryen.OrInt32 : binaryen.OrInt64;
}
function xorOp(width: Width): BinaryOp {
  return width === 32 ? binaryen.XorInt32 : binaryen.XorInt64;
}
function shlOp(width: Width): BinaryOp {
  return width === 32 ? binaryen.ShlInt32 : binaryen.ShlInt64;
}
function mulOp(width: Width): BinaryOp {
  return width === 32 ? binaryen.MulInt32 : binaryen.MulInt64;
}
function addOp(width: Width): BinaryOp {
  return width === 32 ? binaryen.AddInt32 : binaryen.AddInt64;
}
function subOp(width: Width): BinaryOp {
  return width === 32 ? binaryen.SubInt32 : binaryen.SubInt64;
}
function shrUOp(width: Width): BinaryOp {
  return width === 32 ? binaryen.ShrUInt32 : binaryen.ShrUInt64;
}
function eqOp(width: Width): BinaryOp {
  return width === 32 ? binaryen.EqInt32 : binaryen.EqInt64;
}
function neOp(width: Width): BinaryOp {
  return width === 32 ? binaryen.NeInt32 : binaryen.NeInt64;
}

function laneBroadcast(
  expr: ExpressionRef,
  width: Width,
): LaneBroadcast | null {
  let expanded = expr;
  const expandedInfo = info(expanded);
  if (
    expandedInfo.id === binaryen.LocalSetId &&
    (expandedInfo as binaryen.LocalSetInfo).isTee
  ) {
    expanded = (expandedInfo as binaryen.LocalSetInfo).value;
  }
  let complemented = false;
  if (isComplement(expanded, width)) {
    expanded = complementValue(expanded);
    complemented = true;
  }
  const product = valueAndConstantOp(expanded, width, mulOp(width));
  if (!product || info(product.value).id !== binaryen.BinaryId) return null;
  const shiftNode = binary(product.value);
  if (shiftNode.op !== shrUOp(width)) return null;
  const shiftValue = integerConstantValue(shiftNode.right, width);
  if (shiftValue === null) return null;
  const shift = Number(shiftValue & BigInt(width - 1));
  const high = valueAndConstant(shiftNode.left, width);
  if (
    !high ||
    shift === 0 ||
    !isLaneBroadcast(high.constant, shift, product.constant, width)
  )
    return null;
  return {
    highBits: shiftNode.left,
    highMask: high.constant,
    shift,
    complemented,
  };
}

/** Match the exact carry-isolated SWAR nonzero-lane detector used by bitmask_lane. */
function laneNonzeroSource(
  expr: ExpressionRef,
  width: Width,
): ExpressionRef | null {
  return laneNonzeroDetector(expr, width)?.source ?? null;
}

function laneNonzeroDetector(
  expr: ExpressionRef,
  width: Width,
): LaneNonzeroDetector | null {
  const outer = valueAndConstant(expr, width);
  if (
    !outer ||
    info(outer.value).id !== binaryen.BinaryId ||
    binary(outer.value).op !== orOp(width)
  )
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
  ] as const) {
    const sum = valueAndConstantOp(
      sumExpr,
      width,
      width === 32 ? binaryen.AddInt32 : binaryen.AddInt64,
    );
    if (!sum || sum.constant !== lowMask) continue;
    const masked = valueAndConstant(sum.value, width);
    if (
      masked &&
      masked.constant === lowMask &&
      sameValueReference(masked.value, source)
    ) {
      // Preserve a local.tee when it is the computation that defines the
      // matching local.get; returning only the get would orphan that value.
      return {
        source:
          info(masked.value).id === binaryen.LocalSetId ? masked.value : source,
        highMask: outer.constant,
        shift,
      };
    }
  }
  return null;
}

function trailingZeroes(value: bigint, width: Width): number {
  for (let shift = 0; shift < width; shift++) {
    if ((value & (1n << BigInt(shift))) !== 0n) return shift;
  }
  return width;
}

function integerConstantValue(
  expr: ExpressionRef,
  width: Width,
): bigint | null {
  const node = info(expr);
  if (node.id !== binaryen.ConstId) return null;
  const value = (node as binaryen.ConstInfo).value;
  if (width === 32) return BigInt((value as number) >>> 0);
  if (typeof value === "bigint") return BigInt.asUintN(64, value);
  const parts = value as { low: number; high: number };
  const lo = BigInt(parts.low >>> 0);
  const hi = BigInt(parts.high >>> 0);
  return (hi << 32n) | lo;
}

function integerConstant(
  module: Module,
  width: Width,
  value: bigint,
): ExpressionRef {
  if (width === 32) return module.i32.const(Number(value & 0xffff_ffffn) | 0);
  return module.i64.const(BigInt.asIntN(64, value));
}

function makeBinary(
  module: Module,
  op: BinaryOp,
  left: ExpressionRef,
  right: ExpressionRef,
): ExpressionRef {
  return raw._BinaryenBinary(module.ptr, op, left, right);
}

function valueAndConstant(
  expr: ExpressionRef,
  width: Width,
): { value: ExpressionRef; constant: bigint } | null {
  if (info(expr).id !== binaryen.BinaryId || binary(expr).op !== andOp(width))
    return null;
  const { left, right } = binary(expr);
  const rc = integerConstantValue(right, width);
  if (rc !== null) return { value: left, constant: rc };
  const lc = integerConstantValue(left, width);
  return lc === null ? null : { value: right, constant: lc };
}

function valueAndConstantOp(
  expr: ExpressionRef,
  width: Width,
  op: BinaryOp,
): { value: ExpressionRef; constant: bigint } | null {
  if (info(expr).id !== binaryen.BinaryId || binary(expr).op !== op)
    return null;
  const { left, right } = binary(expr);
  const rc = integerConstantValue(right, width);
  if (rc !== null) return { value: left, constant: rc };
  const lc = integerConstantValue(left, width);
  return lc === null ? null : { value: right, constant: lc };
}

function maskedValue(expr: ExpressionRef, width: Width): MaskedValue | null {
  if (info(expr).id !== binaryen.BinaryId || binary(expr).op !== andOp(width))
    return null;
  let { left: value, right: mask } = binary(expr);
  if (isComplement(value, width)) [value, mask] = [mask, value];
  if (isComplement(mask, width)) {
    return {
      value,
      mask: complementValue(mask),
      complemented: true,
    };
  }
  return { value, mask, complemented: false };
}

function isComplement(expr: ExpressionRef, width: Width): boolean {
  if (info(expr).id !== binaryen.BinaryId || binary(expr).op !== xorOp(width))
    return false;
  const all = (1n << BigInt(width)) - 1n;
  return (
    integerConstantValue(binary(expr).left, width) === all ||
    integerConstantValue(binary(expr).right, width) === all
  );
}

function complementValue(expr: ExpressionRef): ExpressionRef {
  const { left, right } = binary(expr);
  return info(left).id === binaryen.ConstId ? right : left;
}

function isCheapLeaf(expr: ExpressionRef): boolean {
  const id = info(expr).id;
  return (
    id === binaryen.LocalGetId ||
    id === binaryen.GlobalGetId ||
    id === binaryen.ConstId
  );
}

function sameSimpleValue(a: ExpressionRef, b: ExpressionRef): boolean {
  const ai = info(a);
  const bi = info(b);
  const aid = ai.id;
  if (aid !== bi.id || ai.type !== bi.type) return false;
  switch (aid) {
    case binaryen.LocalGetId:
      return (
        (ai as binaryen.LocalGetInfo).index ===
        (bi as binaryen.LocalGetInfo).index
      );
    case binaryen.GlobalGetId:
      return (
        (ai as binaryen.GlobalGetInfo).name ===
        (bi as binaryen.GlobalGetInfo).name
      );
    case binaryen.ConstId:
      return (
        (ai as binaryen.ConstInfo).value === (bi as binaryen.ConstInfo).value
      );
    default:
      return false;
  }
}

function sameValueReference(a: ExpressionRef, b: ExpressionRef): boolean {
  const ai = info(a);
  const bi = info(b);
  if (
    (ai.id === binaryen.LocalGetId || ai.id === binaryen.LocalSetId) &&
    (bi.id === binaryen.LocalGetId || bi.id === binaryen.LocalSetId)
  ) {
    const aLocal = ai as binaryen.LocalGetInfo | binaryen.LocalSetInfo;
    const bLocal = bi as binaryen.LocalGetInfo | binaryen.LocalSetInfo;
    return (
      aLocal.index === bLocal.index &&
      (ai.id !== binaryen.LocalSetId || (ai as binaryen.LocalSetInfo).isTee) &&
      (bi.id !== binaryen.LocalSetId || (bi as binaryen.LocalSetInfo).isTee)
    );
  }
  return sameSimpleValue(a, b);
}

function info(expr: ExpressionRef): binaryen.ExpressionInfo {
  return binaryen.getExpressionInfo(expr);
}

function binary(expr: ExpressionRef): binaryen.BinaryInfo {
  return binaryen.getExpressionInfo(expr) as binaryen.BinaryInfo;
}
