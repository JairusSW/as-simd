import binaryen from "binaryen";
type Module = binaryen.Module;
export interface SwarOptimizationStats {
    expressions: number;
    rewrites: number;
}
export declare function optimizeSwarExpressions(module: Module): SwarOptimizationStats;
export {};
