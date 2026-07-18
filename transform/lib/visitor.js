import binaryen from "binaryen";
const raw = binaryen;
export class ExpressionRewriter {
    module;
    expressions = 0;
    constructor(module) {
        this.module = module;
    }
    run() {
        for (let i = 0, n = this.module.getNumFunctions(); i < n; i++) {
            const func = this.module.getFunctionByIndex(i);
            const body = binaryen.getFunctionInfo(func).body;
            if (!body)
                continue;
            raw._BinaryenFunctionSetBody(func, this.visit(body));
        }
    }
    visit(expr) {
        if (!expr)
            return expr;
        this.expressions++;
        let info;
        try {
            info = binaryen.getExpressionInfo(expr);
        }
        catch (error) {
            if (process.env["AS_SIMD_OPTIMIZE_TRACE"] === "1")
                console.error("[as-simd:opaque]", expr, binaryen.getExpressionId(expr));
            return expr;
        }
        if (process.env["AS_SIMD_OPTIMIZE_TRACE"] === "1")
            console.error("[as-simd:trace]", expr, info.id, info);
        switch (info.id) {
            case binaryen.BlockId: {
                const node = info;
                for (let i = 0; i < node.children.length; i++)
                    raw._BinaryenBlockSetChildAt(expr, i, this.visit(node.children[i]));
                break;
            }
            case binaryen.IfId: {
                const node = info;
                raw._BinaryenIfSetCondition(expr, this.visit(node.condition));
                raw._BinaryenIfSetIfTrue(expr, this.visit(node.ifTrue));
                if (node.ifFalse)
                    raw._BinaryenIfSetIfFalse(expr, this.visit(node.ifFalse));
                break;
            }
            case binaryen.LoopId:
                raw._BinaryenLoopSetBody(expr, this.visit(info.body));
                break;
            case binaryen.BreakId: {
                const node = info;
                if (node.condition)
                    raw._BinaryenBreakSetCondition(expr, this.visit(node.condition));
                if (node.value)
                    raw._BinaryenBreakSetValue(expr, this.visit(node.value));
                break;
            }
            case binaryen.SwitchId: {
                const node = info;
                raw._BinaryenSwitchSetCondition(expr, this.visit(node.condition));
                if (node.value)
                    raw._BinaryenSwitchSetValue(expr, this.visit(node.value));
                break;
            }
            case binaryen.CallId: {
                const node = info;
                for (let i = 0; i < node.operands.length; i++)
                    raw._BinaryenCallSetOperandAt(expr, i, this.visit(node.operands[i]));
                break;
            }
            case binaryen.CallIndirectId: {
                const node = info;
                raw._BinaryenCallIndirectSetTarget(expr, this.visit(node.target));
                for (let i = 0; i < node.operands.length; i++)
                    raw._BinaryenCallIndirectSetOperandAt(expr, i, this.visit(node.operands[i]));
                break;
            }
            case binaryen.LocalSetId:
                raw._BinaryenLocalSetSetValue(expr, this.visit(info.value));
                break;
            case binaryen.GlobalSetId:
                raw._BinaryenGlobalSetSetValue(expr, this.visit(info.value));
                break;
            case binaryen.TableGetId:
                raw._BinaryenTableGetSetIndex(expr, this.visit(info.index));
                break;
            case binaryen.TableSetId: {
                const node = info;
                raw._BinaryenTableSetSetIndex(expr, this.visit(node.index));
                raw._BinaryenTableSetSetValue(expr, this.visit(node.value));
                break;
            }
            case binaryen.TableGrowId: {
                const node = info;
                raw._BinaryenTableGrowSetValue(expr, this.visit(node.value));
                raw._BinaryenTableGrowSetDelta(expr, this.visit(node.delta));
                break;
            }
            case binaryen.LoadId:
                raw._BinaryenLoadSetPtr(expr, this.visit(info.ptr));
                break;
            case binaryen.StoreId: {
                const node = info;
                raw._BinaryenStoreSetPtr(expr, this.visit(node.ptr));
                raw._BinaryenStoreSetValue(expr, this.visit(node.value));
                break;
            }
            case binaryen.UnaryId:
                raw._BinaryenUnarySetValue(expr, this.visit(info.value));
                break;
            case binaryen.BinaryId: {
                const node = info;
                raw._BinaryenBinarySetLeft(expr, this.visit(node.left));
                raw._BinaryenBinarySetRight(expr, this.visit(node.right));
                break;
            }
            case binaryen.SelectId: {
                const node = info;
                raw._BinaryenSelectSetIfTrue(expr, this.visit(node.ifTrue));
                raw._BinaryenSelectSetIfFalse(expr, this.visit(node.ifFalse));
                raw._BinaryenSelectSetCondition(expr, this.visit(node.condition));
                break;
            }
            case binaryen.DropId:
                raw._BinaryenDropSetValue(expr, this.visit(info.value));
                break;
            case binaryen.ReturnId: {
                const value = info.value;
                if (value)
                    raw._BinaryenReturnSetValue(expr, this.visit(value));
                break;
            }
            case binaryen.MemoryGrowId:
                raw._BinaryenMemoryGrowSetDelta(expr, this.visit(info.delta));
                break;
            case binaryen.MemoryCopyId: {
                const node = info;
                raw._BinaryenMemoryCopySetDest(expr, this.visit(node.dest));
                raw._BinaryenMemoryCopySetSource(expr, this.visit(node.source));
                raw._BinaryenMemoryCopySetSize(expr, this.visit(node.size));
                break;
            }
            case binaryen.MemoryFillId: {
                const node = info;
                raw._BinaryenMemoryFillSetDest(expr, this.visit(node.dest));
                raw._BinaryenMemoryFillSetValue(expr, this.visit(node.value));
                raw._BinaryenMemoryFillSetSize(expr, this.visit(node.size));
                break;
            }
            case binaryen.TupleMakeId: {
                const node = info;
                for (let i = 0; i < node.operands.length; i++)
                    raw._BinaryenTupleMakeSetOperandAt(expr, i, this.visit(node.operands[i]));
                break;
            }
            case binaryen.TupleExtractId:
                raw._BinaryenTupleExtractSetTuple(expr, this.visit(info.tuple));
                break;
        }
        return this.rewrite(expr);
    }
}
