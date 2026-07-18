import binaryen from "binaryen";
type ExpressionRef = binaryen.ExpressionRef;
type Module = binaryen.Module;
export declare abstract class ExpressionRewriter {
    protected readonly module: Module;
    expressions: number;
    constructor(module: Module);
    run(): void;
    protected visit(expr: ExpressionRef): ExpressionRef;
    protected abstract rewrite(expr: ExpressionRef): ExpressionRef;
}
export {};
