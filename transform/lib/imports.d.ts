interface PathFlavor {
    relative(from: string, to: string): string;
    sep: string;
}
export declare function normalizeAsSimdBaseRel(baseRel: string): string;
export declare function computeImportBaseRel(fromDir: string, packageDir: string, flavor?: PathFlavor): string;
export declare function packageRootFromTransform(moduleUrl?: string): string;
export declare function vectorImportSpecifierFromBaseRel(baseRel: string): string;
export declare function computeVectorImportSpecifier(normalizedSourcePath: string, baseDir: string, packageDir?: string): string;
export {};
