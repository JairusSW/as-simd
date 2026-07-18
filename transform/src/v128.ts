import {
  ImportStatement,
  Parser,
  Source,
  SourceKind,
  Tokenizer,
} from "assemblyscript/dist/assemblyscript.js";
import { computeVectorImportSpecifier } from "./imports.js";

const VECTOR_NAMES = [
  "v64", "v128", "v256", "v512",
  "i8x32", "i16x16", "i32x8", "i64x4", "f32x8", "f64x4",
  "i8x64", "i16x32", "i32x16", "i64x8", "f32x16", "f64x8",
] as const;
type VectorName = (typeof VECTOR_NAMES)[number];

/** Inject portable vector imports into user sources that have not imported them. */
export function injectPortableVectors(parser: Parser, injectV128: boolean, baseDir: string): number {
  let rewritten = 0;
  for (const source of parser.sources) {
    if (source.sourceKind !== SourceKind.User && source.sourceKind !== SourceKind.UserEntry) continue;
    if (isAsSimdSource(source.normalizedPath)) continue;
    const declared = declaredNames(source);
    const needed = VECTOR_NAMES.filter((name) => (name !== "v128" || injectV128) && !declared.has(name) && new RegExp(`\\b${name}\\b`).test(source.text));
    if (!needed.length) continue;
    const specifier = computeVectorImportSpecifier(source.normalizedPath, baseDir);
    source.statements.unshift(parseImport(parser, `import { ${needed.join(", ")} } from "${specifier}";`, source));
    rewritten++;
  }
  return rewritten;
}

function isAsSimdSource(path: string): boolean {
  const normalized = path.replaceAll("\\", "/");
  return normalized.startsWith("assembly/") || normalized.includes("/node_modules/as-simd/assembly/") || normalized.startsWith("~lib/as-simd/assembly/");
}

function declaredNames(source: Source): Set<VectorName> {
  const declared = new Set<VectorName>();
  for (const statement of source.statements) {
    const named = statement as unknown as { name?: { text?: string } };
    if (VECTOR_NAMES.includes(named.name?.text as VectorName)) declared.add(named.name!.text as VectorName);
    if (statement instanceof ImportStatement) {
      if (VECTOR_NAMES.includes(statement.namespaceName?.text as VectorName)) declared.add(statement.namespaceName!.text as VectorName);
      for (const declaration of statement.declarations ?? []) {
        if (VECTOR_NAMES.includes(declaration.name.text as VectorName)) declared.add(declaration.name.text as VectorName);
        if (VECTOR_NAMES.includes(declaration.foreignName.text as VectorName)) declared.add(declaration.foreignName.text as VectorName);
      }
    }
  }
  return declared;
}

function parseImport(parser: Parser, text: string, owner: Source): ImportStatement {
  const synthetic = new Source(SourceKind.User, owner.normalizedPath, text);
  const previous = parser.currentSource;
  parser.currentSource = owner;
  const statement = parser.parseTopLevelStatement(new Tokenizer(synthetic));
  parser.currentSource = previous;
  if (!(statement instanceof ImportStatement)) throw new Error("failed to construct portable vector import");
  return statement;
}
