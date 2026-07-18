import path from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_NAME = "as-simd";

interface PathFlavor {
  relative(from: string, to: string): string;
  sep: string;
}

/**
 * Collapse install-layout-specific paths ending in an `as-simd` directory to
 * the stable bare package specifier. Relative in-repository paths are kept.
 */
export function normalizeAsSimdBaseRel(baseRel: string): string {
  const normalized = baseRel.replaceAll("\\", "/");
  const segments = normalized.split("/").filter(Boolean);
  if (segments.at(-1) === PACKAGE_NAME) return PACKAGE_NAME;
  if (normalized === "" || normalized === ".") return ".";
  if (!normalized.startsWith(".") && !normalized.startsWith("/") && !/^[A-Za-z]:\//.test(normalized)) return `./${normalized}`;
  return normalized;
}

/** Compute a forward-slash import path from a source directory to this package. */
export function computeImportBaseRel(fromDir: string, packageDir: string, flavor: PathFlavor = path): string {
  const relative = flavor.relative(fromDir, packageDir).split(flavor.sep).join("/");
  return normalizeAsSimdBaseRel(relative);
}

/** Root of the package containing the currently executing compiled transform. */
export function packageRootFromTransform(moduleUrl: string = import.meta.url): string {
  return path.resolve(fileURLToPath(moduleUrl), "..", "..", "..");
}

/** Append the public AssemblyScript entry point without losing a leading `./`. */
export function vectorImportSpecifierFromBaseRel(baseRel: string): string {
  const specifier = path.posix.join(baseRel, "assembly", "index");
  if (specifier.startsWith(".") || specifier.startsWith("/") || specifier.startsWith(`${PACKAGE_NAME}/`)) return specifier;
  return `./${specifier}`;
}

/**
 * Compute the exact AssemblyScript source import injected into a user module.
 * Installed layouts become `as-simd/assembly/index`; in-repo development uses
 * a relative path such as `../../assembly/index`.
 */
export function computeVectorImportSpecifier(normalizedSourcePath: string, baseDir: string, packageDir: string = packageRootFromTransform()): string {
  const cwd = path.resolve(process.cwd(), baseDir);
  const sourcePath = normalizedSourcePath.replaceAll("/", path.sep);
  const fromFile = path.isAbsolute(sourcePath) ? sourcePath : path.resolve(cwd, sourcePath.startsWith(`~lib${path.sep}`) ? sourcePath.slice(5) : sourcePath);
  const baseRel = computeImportBaseRel(path.dirname(fromFile), packageDir);
  return vectorImportSpecifierFromBaseRel(baseRel);
}
