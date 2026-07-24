import binaryen from "binaryen";

type ExpressionRef = binaryen.ExpressionRef;
type Module = binaryen.Module;

interface RawBinaryen {
  _BinaryenBlockSetChildAt(
    expr: ExpressionRef,
    index: number,
    child: ExpressionRef,
  ): void;
  _BinaryenBreakSetCondition(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenBreakSetValue(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenCallSetOperandAt(
    expr: ExpressionRef,
    index: number,
    child: ExpressionRef,
  ): void;
  _BinaryenCallIndirectSetTarget(
    expr: ExpressionRef,
    child: ExpressionRef,
  ): void;
  _BinaryenCallIndirectSetOperandAt(
    expr: ExpressionRef,
    index: number,
    child: ExpressionRef,
  ): void;
  _BinaryenDropSetValue(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenFunctionSetBody(func: number, body: ExpressionRef): void;
  _BinaryenGlobalSetSetValue(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenIfSetCondition(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenIfSetIfFalse(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenIfSetIfTrue(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenLoadSetPtr(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenLocalSetSetValue(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenLoopSetBody(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenMemoryGrowSetDelta(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenMemoryCopySetDest(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenMemoryCopySetSource(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenMemoryCopySetSize(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenMemoryFillSetDest(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenMemoryFillSetValue(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenMemoryFillSetSize(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenReturnSetValue(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenSelectSetCondition(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenSelectSetIfFalse(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenSelectSetIfTrue(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenStoreSetPtr(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenStoreSetValue(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenSwitchSetCondition(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenSwitchSetValue(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenTableGetSetIndex(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenTableSetSetIndex(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenTableSetSetValue(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenTableGrowSetValue(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenTableGrowSetDelta(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenTupleMakeSetOperandAt(
    expr: ExpressionRef,
    index: number,
    child: ExpressionRef,
  ): void;
  _BinaryenTupleExtractSetTuple(
    expr: ExpressionRef,
    child: ExpressionRef,
  ): void;
  _BinaryenUnarySetValue(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenBinarySetLeft(expr: ExpressionRef, child: ExpressionRef): void;
  _BinaryenBinarySetRight(expr: ExpressionRef, child: ExpressionRef): void;
}

const raw = binaryen as unknown as RawBinaryen;

/** Bottom-up Binaryen tree visitor. Unknown proposal nodes are safe barriers. */
export abstract class ExpressionRewriter {
  expressions = 0;

  constructor(protected readonly module: Module) {}

  run(): void {
    for (let i = 0, n = this.module.getNumFunctions(); i < n; i++) {
      const func = this.module.getFunctionByIndex(i);
      const body = binaryen.getFunctionInfo(func).body;
      if (!body) continue; // Imported function.
      raw._BinaryenFunctionSetBody(func, this.visit(body));
    }
  }

  protected visit(expr: ExpressionRef): ExpressionRef {
    if (!expr) return expr;
    this.expressions++;
    let info: binaryen.ExpressionInfo;
    try {
      info = binaryen.getExpressionInfo(expr);
    } catch (error) {
      // Binaryen occasionally exposes transient Stack IR nodes after an
      // inlining pass that its JS metadata decoder does not model. They are
      // valid IR but must remain opaque to a tree rewrite.
      if (process.env["AS_SIMD_OPTIMIZE_TRACE"] === "1")
        console.error("[as-simd:opaque]", expr, binaryen.getExpressionId(expr));
      return expr;
    }
    if (process.env["AS_SIMD_OPTIMIZE_TRACE"] === "1")
      console.error("[as-simd:trace]", expr, info.id, info);

    switch (info.id) {
      case binaryen.BlockId: {
        const node = info as binaryen.BlockInfo;
        for (let i = 0; i < node.children.length; i++)
          raw._BinaryenBlockSetChildAt(expr, i, this.visit(node.children[i]));
        break;
      }
      case binaryen.IfId: {
        const node = info as binaryen.IfInfo;
        raw._BinaryenIfSetCondition(expr, this.visit(node.condition));
        raw._BinaryenIfSetIfTrue(expr, this.visit(node.ifTrue));
        if (node.ifFalse)
          raw._BinaryenIfSetIfFalse(expr, this.visit(node.ifFalse));
        break;
      }
      case binaryen.LoopId:
        raw._BinaryenLoopSetBody(
          expr,
          this.visit((info as binaryen.LoopInfo).body),
        );
        break;
      case binaryen.BreakId: {
        const node = info as binaryen.BreakInfo;
        if (node.condition)
          raw._BinaryenBreakSetCondition(expr, this.visit(node.condition));
        if (node.value)
          raw._BinaryenBreakSetValue(expr, this.visit(node.value));
        break;
      }
      case binaryen.SwitchId: {
        const node = info as binaryen.SwitchInfo;
        raw._BinaryenSwitchSetCondition(expr, this.visit(node.condition));
        if (node.value)
          raw._BinaryenSwitchSetValue(expr, this.visit(node.value));
        break;
      }
      case binaryen.CallId: {
        const node = info as binaryen.CallInfo;
        for (let i = 0; i < node.operands.length; i++)
          raw._BinaryenCallSetOperandAt(expr, i, this.visit(node.operands[i]));
        break;
      }
      case binaryen.CallIndirectId: {
        const node = info as binaryen.CallIndirectInfo;
        raw._BinaryenCallIndirectSetTarget(expr, this.visit(node.target));
        for (let i = 0; i < node.operands.length; i++)
          raw._BinaryenCallIndirectSetOperandAt(
            expr,
            i,
            this.visit(node.operands[i]),
          );
        break;
      }
      case binaryen.LocalSetId:
        raw._BinaryenLocalSetSetValue(
          expr,
          this.visit((info as binaryen.LocalSetInfo).value),
        );
        break;
      case binaryen.GlobalSetId:
        raw._BinaryenGlobalSetSetValue(
          expr,
          this.visit((info as binaryen.GlobalSetInfo).value),
        );
        break;
      case binaryen.TableGetId:
        raw._BinaryenTableGetSetIndex(
          expr,
          this.visit((info as binaryen.TableGetInfo).index),
        );
        break;
      case binaryen.TableSetId: {
        const node = info as binaryen.TableSetInfo;
        raw._BinaryenTableSetSetIndex(expr, this.visit(node.index));
        raw._BinaryenTableSetSetValue(expr, this.visit(node.value));
        break;
      }
      case binaryen.TableGrowId: {
        const node = info as binaryen.TableGrowInfo;
        raw._BinaryenTableGrowSetValue(expr, this.visit(node.value));
        raw._BinaryenTableGrowSetDelta(expr, this.visit(node.delta));
        break;
      }
      case binaryen.LoadId:
        raw._BinaryenLoadSetPtr(
          expr,
          this.visit((info as binaryen.LoadInfo).ptr),
        );
        break;
      case binaryen.StoreId: {
        const node = info as binaryen.StoreInfo;
        raw._BinaryenStoreSetPtr(expr, this.visit(node.ptr));
        raw._BinaryenStoreSetValue(expr, this.visit(node.value));
        break;
      }
      case binaryen.UnaryId:
        raw._BinaryenUnarySetValue(
          expr,
          this.visit((info as binaryen.UnaryInfo).value),
        );
        break;
      case binaryen.BinaryId: {
        const node = info as binaryen.BinaryInfo;
        raw._BinaryenBinarySetLeft(expr, this.visit(node.left));
        raw._BinaryenBinarySetRight(expr, this.visit(node.right));
        break;
      }
      case binaryen.SelectId: {
        const node = info as binaryen.SelectInfo;
        raw._BinaryenSelectSetIfTrue(expr, this.visit(node.ifTrue));
        raw._BinaryenSelectSetIfFalse(expr, this.visit(node.ifFalse));
        raw._BinaryenSelectSetCondition(expr, this.visit(node.condition));
        break;
      }
      case binaryen.DropId:
        raw._BinaryenDropSetValue(
          expr,
          this.visit((info as binaryen.DropInfo).value),
        );
        break;
      case binaryen.ReturnId: {
        const value = (info as binaryen.ReturnInfo).value;
        if (value) raw._BinaryenReturnSetValue(expr, this.visit(value));
        break;
      }
      case binaryen.MemoryGrowId:
        raw._BinaryenMemoryGrowSetDelta(
          expr,
          this.visit((info as binaryen.MemoryGrowInfo).delta),
        );
        break;
      case binaryen.MemoryCopyId: {
        const node = info as binaryen.MemoryCopyInfo;
        raw._BinaryenMemoryCopySetDest(expr, this.visit(node.dest));
        raw._BinaryenMemoryCopySetSource(expr, this.visit(node.source));
        raw._BinaryenMemoryCopySetSize(expr, this.visit(node.size));
        break;
      }
      case binaryen.MemoryFillId: {
        const node = info as binaryen.MemoryFillInfo;
        raw._BinaryenMemoryFillSetDest(expr, this.visit(node.dest));
        raw._BinaryenMemoryFillSetValue(expr, this.visit(node.value));
        raw._BinaryenMemoryFillSetSize(expr, this.visit(node.size));
        break;
      }
      case binaryen.TupleMakeId: {
        const node = info as binaryen.TupleMakeInfo;
        for (let i = 0; i < node.operands.length; i++)
          raw._BinaryenTupleMakeSetOperandAt(
            expr,
            i,
            this.visit(node.operands[i]),
          );
        break;
      }
      case binaryen.TupleExtractId:
        raw._BinaryenTupleExtractSetTuple(
          expr,
          this.visit((info as binaryen.TupleExtract).tuple),
        );
        break;
    }

    return this.rewrite(expr);
  }

  protected abstract rewrite(expr: ExpressionRef): ExpressionRef;
}
