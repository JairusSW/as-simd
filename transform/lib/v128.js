import { ImportStatement, Source, Tokenizer, } from "assemblyscript/dist/assemblyscript.js";
import { computeVectorImportSpecifier } from "./imports.js";
const VECTOR_NAMES = [
    "v64",
    "v128",
    "v256",
    "v512",
    "i8x32",
    "i16x16",
    "i32x8",
    "i64x4",
    "f32x8",
    "f64x4",
    "i8x64",
    "i16x32",
    "i32x16",
    "i64x8",
    "f32x16",
    "f64x8",
];
export function injectPortableVectors(parser, injectV128, baseDir) {
    let rewritten = 0;
    for (const source of parser.sources) {
        if (source.sourceKind !== 0 &&
            source.sourceKind !== 1)
            continue;
        if (isAsSimdSource(source.normalizedPath))
            continue;
        const declared = declaredNames(source);
        const needed = VECTOR_NAMES.filter((name) => (name !== "v128" || injectV128) &&
            !declared.has(name) &&
            new RegExp(`\\b${name}\\b`).test(source.text));
        if (!needed.length)
            continue;
        const specifier = computeVectorImportSpecifier(source.normalizedPath, baseDir);
        source.statements.unshift(parseImport(parser, `import { ${needed.join(", ")} } from "${specifier}";`, source));
        rewritten++;
    }
    return rewritten;
}
function isAsSimdSource(path) {
    const normalized = path.replaceAll("\\", "/");
    return (normalized.startsWith("assembly/") ||
        normalized.includes("/node_modules/as-simd/assembly/") ||
        normalized.startsWith("~lib/as-simd/assembly/"));
}
function declaredNames(source) {
    const declared = new Set();
    for (const statement of source.statements) {
        const named = statement;
        if (VECTOR_NAMES.includes(named.name?.text))
            declared.add(named.name.text);
        if (statement instanceof ImportStatement) {
            if (VECTOR_NAMES.includes(statement.namespaceName?.text))
                declared.add(statement.namespaceName.text);
            for (const declaration of statement.declarations ?? []) {
                if (VECTOR_NAMES.includes(declaration.name.text))
                    declared.add(declaration.name.text);
                if (VECTOR_NAMES.includes(declaration.foreignName.text))
                    declared.add(declaration.foreignName.text);
            }
        }
    }
    return declared;
}
function parseImport(parser, text, owner) {
    const synthetic = new Source(0, owner.normalizedPath, text);
    const previous = parser.currentSource;
    parser.currentSource = owner;
    const statement = parser.parseTopLevelStatement(new Tokenizer(synthetic));
    parser.currentSource = previous;
    if (!(statement instanceof ImportStatement))
        throw new Error("failed to construct portable vector import");
    return statement;
}
