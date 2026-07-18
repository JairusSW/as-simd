import path from "node:path";
import { fileURLToPath } from "node:url";
const PACKAGE_NAME = "as-simd";
export function normalizeAsSimdBaseRel(baseRel) {
    const normalized = baseRel.replaceAll("\\", "/");
    const segments = normalized.split("/").filter(Boolean);
    if (segments.at(-1) === PACKAGE_NAME)
        return PACKAGE_NAME;
    if (normalized === "" || normalized === ".")
        return ".";
    if (!normalized.startsWith(".") && !normalized.startsWith("/") && !/^[A-Za-z]:\//.test(normalized))
        return `./${normalized}`;
    return normalized;
}
export function computeImportBaseRel(fromDir, packageDir, flavor = path) {
    const relative = flavor.relative(fromDir, packageDir).split(flavor.sep).join("/");
    return normalizeAsSimdBaseRel(relative);
}
export function packageRootFromTransform(moduleUrl = import.meta.url) {
    return path.resolve(fileURLToPath(moduleUrl), "..", "..", "..");
}
export function vectorImportSpecifierFromBaseRel(baseRel) {
    const specifier = path.posix.join(baseRel, "assembly", "index");
    if (specifier.startsWith(".") || specifier.startsWith("/") || specifier.startsWith(`${PACKAGE_NAME}/`))
        return specifier;
    return `./${specifier}`;
}
export function computeVectorImportSpecifier(normalizedSourcePath, baseDir, packageDir = packageRootFromTransform()) {
    const cwd = path.resolve(process.cwd(), baseDir);
    const sourcePath = normalizedSourcePath.replaceAll("/", path.sep);
    const fromFile = path.isAbsolute(sourcePath) ? sourcePath : path.resolve(cwd, sourcePath.startsWith(`~lib${path.sep}`) ? sourcePath.slice(5) : sourcePath);
    const baseRel = computeImportBaseRel(path.dirname(fromFile), packageDir);
    return vectorImportSpecifierFromBaseRel(baseRel);
}
