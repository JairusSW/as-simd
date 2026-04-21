import { Transform } from "assemblyscript/dist/transform.js";
import * as asc from "assemblyscript/dist/assemblyscript.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SIMD_FEATURE = 16;
const FORCE_SWAR_ENV = "AS_SIMD_FORCE_SWAR_V128";
const FORCE_SWAR_USE_KEYS = new Set(["AS_BENCH_FORCE_SWAR", "AS_SIMD_FORCE_SWAR", "AS_SIMD_FORCE_SWAR_V128"]);
const V128_FAMILY_PATTERN = /\b(v128|i8x16|i16x8|i32x4|i64x2)\b/g;
const STRICT_DIAGNOSTIC_PREFIX = "[as-simd/transform]";
const INFO_PREFIX = "[as-simd/transform] info:";
const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE_ROOT_REAL = toRealPath(PACKAGE_ROOT);

function findFirstV128FamilyUse(text) {
  V128_FAMILY_PATTERN.lastIndex = 0;
  const match = V128_FAMILY_PATTERN.exec(text);
  return match ? { symbol: match[1], index: match.index } : null;
}

function parseFeatureList(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function parseCliFeatures(argv) {
  let explicitEnableSimd = false;
  let explicitDisableSimd = false;
  let hasSimdDirective = false;
  let forceSwarUse = false;
  let configPath = null;
  let target = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--enable" && i + 1 < argv.length) {
      const enabled = parseFeatureList(argv[++i]).includes("simd");
      explicitEnableSimd = explicitEnableSimd || enabled;
      hasSimdDirective = hasSimdDirective || enabled;
      continue;
    }
    if (arg.startsWith("--enable=")) {
      const enabled = parseFeatureList(arg.slice("--enable=".length)).includes("simd");
      explicitEnableSimd = explicitEnableSimd || enabled;
      hasSimdDirective = hasSimdDirective || enabled;
      continue;
    }
    if (arg === "--disable" && i + 1 < argv.length) {
      const disabled = parseFeatureList(argv[++i]).includes("simd");
      explicitDisableSimd = explicitDisableSimd || disabled;
      hasSimdDirective = hasSimdDirective || disabled;
      continue;
    }
    if (arg.startsWith("--disable=")) {
      const disabled = parseFeatureList(arg.slice("--disable=".length)).includes("simd");
      explicitDisableSimd = explicitDisableSimd || disabled;
      hasSimdDirective = hasSimdDirective || disabled;
      continue;
    }
    if (arg === "--config" && i + 1 < argv.length) {
      configPath = argv[++i];
      continue;
    }
    if (arg.startsWith("--config=")) {
      configPath = arg.slice("--config=".length);
      continue;
    }
    if (arg === "--use" && i + 1 < argv.length) {
      forceSwarUse = forceSwarUse || hasForceSwarUse(parseUseEntries(argv[++i]));
      continue;
    }
    if (arg.startsWith("--use=")) {
      forceSwarUse = forceSwarUse || hasForceSwarUse(parseUseEntries(arg.slice("--use=".length)));
      continue;
    }
    if (arg === "--target" && i + 1 < argv.length) {
      target = argv[++i];
      continue;
    }
    if (arg.startsWith("--target=")) {
      target = arg.slice("--target=".length);
    }
  }

  return { explicitEnableSimd, explicitDisableSimd, hasSimdDirective, forceSwarUse, configPath, target };
}

function parseUseEntries(raw) {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseUseEntry(entry) {
  const separatorIndex = entry.indexOf("=");
  if (separatorIndex === -1) return { key: entry, value: "" };
  return {
    key: entry.slice(0, separatorIndex),
    value: entry.slice(separatorIndex + 1),
  };
}

function hasForceSwarUse(entries) {
  for (const entry of entries) {
    const { key, value } = parseUseEntry(entry);
    if (!FORCE_SWAR_USE_KEYS.has(key)) continue;
    if (isTruthyUseValue(value)) return true;
  }
  return false;
}

function collectUseEntries(rawUse) {
  if (Array.isArray(rawUse)) return rawUse.flatMap(parseUseEntries);
  if (typeof rawUse === "string") return parseUseEntries(rawUse);
  if (rawUse && typeof rawUse === "object") {
    return Object.entries(rawUse).map(([key, value]) => `${key}=${value == null ? "" : value}`);
  }
  return [];
}

function toRealPath(value) {
  const resolved = path.resolve(value);
  try {
    return fs.realpathSync(resolved);
  } catch {
    return resolved;
  }
}

function isPackageOwnedConfig(configPath) {
  const resolvedReal = toRealPath(configPath);
  return resolvedReal === PACKAGE_ROOT_REAL || resolvedReal.startsWith(`${PACKAGE_ROOT_REAL}${path.sep}`);
}

function readAsconfigRecursive(configFile, target, visited = new Set()) {
  const resolved = path.resolve(configFile);
  if (visited.has(resolved)) {
    return {
      loaded: false,
      enable: false,
      disable: false,
      explicitEnable: false,
      explicitDisable: false,
      forceSwarUse: false,
    };
  }
  visited.add(resolved);

  let raw;
  try {
    raw = fs.readFileSync(resolved, "utf8");
  } catch {
    return {
      loaded: false,
      enable: false,
      disable: false,
      explicitEnable: false,
      explicitDisable: false,
      forceSwarUse: false,
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      loaded: false,
      enable: false,
      disable: false,
      explicitEnable: false,
      explicitDisable: false,
      forceSwarUse: false,
    };
  }

  const baseDir = path.dirname(resolved);
  const parent =
    typeof parsed.extends === "string"
      ? readAsconfigRecursive(path.resolve(baseDir, parsed.extends), target, visited)
      : {
          loaded: false,
          enable: false,
          disable: false,
          explicitEnable: false,
          explicitDisable: false,
          forceSwarUse: false,
        };

  let enable = parent.enable;
  let disable = parent.disable;
  let explicitEnable = parent.explicitEnable;
  let explicitDisable = parent.explicitDisable;
  let forceSwarUse = parent.forceSwarUse;
  let loaded = true;
  const packageOwned = isPackageOwnedConfig(resolved);

  const optionScopes = [];
  if (parsed.options && typeof parsed.options === "object") optionScopes.push(parsed.options);
  if (target && parsed.targets && parsed.targets[target] && typeof parsed.targets[target] === "object") optionScopes.push(parsed.targets[target]);

  for (const scope of optionScopes) {
    const enableList = Array.isArray(scope.enable) ? scope.enable : typeof scope.enable === "string" ? scope.enable.split(",") : [];
    const disableList = Array.isArray(scope.disable) ? scope.disable : typeof scope.disable === "string" ? scope.disable.split(",") : [];
    const useEntries = collectUseEntries(scope.use);

    const enablesSimd = enableList.some((feature) => String(feature).trim().toLowerCase() === "simd");
    const disablesSimd = disableList.some((feature) => String(feature).trim().toLowerCase() === "simd");

    if (enablesSimd) {
      enable = true;
      if (!packageOwned) explicitEnable = true;
    }
    if (disablesSimd) {
      disable = true;
      if (!packageOwned) explicitDisable = true;
    }
    if (hasForceSwarUse(useEntries)) forceSwarUse = true;
  }

  return { loaded, enable, disable, explicitEnable, explicitDisable, forceSwarUse };
}

function isTruthyUseValue(value) {
  if (value === null || value === undefined || value === "") return true;
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true";
  }
  return false;
}

function forceFeatureGlobalOff(program, name) {
  let global;
  try {
    global = program.requireGlobal(name);
  } catch {
    return;
  }
  if (!global) return;

  global.constantValueKind = asc.ConstantValueKind.None;
  global.constantIntegerValue = null;

  const initializer = global.declaration?.initializer;
  if (initializer?.kind === asc.NodeKind.True) {
    global.declaration.initializer = new asc.FalseExpression(initializer.range);
  }
}

function splitArgs(argText) {
  return argText
    .split(",")
    .map((arg) => arg.trim())
    .filter((arg) => arg.length > 0);
}

function rewriteI32x4Locals(text) {
  let out = text;
  out = out.replace(
    /\b(const|let)\s+([A-Za-z_]\w*)\s*=\s*i32x4\s*\(([^)]*)\)\s*;/g,
    (full, decl, name, argText) => {
      const args = splitArgs(argText);
      if (args.length !== 4) return full;
      const [a, b, c, d] = args;
      return `${decl} ${name}_lo: u64 = i32x4_pair.pack2(${a}, ${b});\n${decl} ${name}_hi: u64 = i32x4_pair.pack2(${c}, ${d});`;
    }
  );

  out = out.replace(
    /\b(const|let)\s+([A-Za-z_]\w*)\s*=\s*i32x4\.add\(\s*([A-Za-z_]\w*)\s*,\s*([A-Za-z_]\w*)\s*\)\s*;/g,
    (full, decl, outName, left, right) => {
      return `${decl} ${outName}_lo: u64 = i32x4_pair.add_lo(${left}_lo, ${left}_hi, ${right}_lo, ${right}_hi);\n${decl} ${outName}_hi: u64 = i32x4_pair.take_hi();`;
    }
  );

  out = out.replace(
    /\b(const|let)\s+([A-Za-z_]\w*)\s*=\s*i32x4\.load\(\s*([^,)]+)\s*([^)]*)\)\s*;/g,
    (full, decl, outName, ptrExpr, rest) => {
      return `${decl} ${outName}_lo: u64 = i32x4_pair.load_lo(${ptrExpr}${rest});\n${decl} ${outName}_hi: u64 = i32x4_pair.take_hi();`;
    }
  );

  out = out.replace(
    /\bi32x4\.store\(\s*([^,]+)\s*,\s*([A-Za-z_]\w*)([^)]*)\)\s*;/g,
    (full, ptrExpr, vecName, rest) => `i32x4_pair.store_pair(${ptrExpr}, ${vecName}_lo, ${vecName}_hi${rest});`
  );

  out = out.replace(
    /\bi32x4\.extract_lane\(\s*([A-Za-z_]\w*)\s*,\s*([^)]+)\)/g,
    (full, vecName, laneExpr) => `i32x4_pair.extract_lane_pair(${vecName}_lo, ${vecName}_hi, ${laneExpr.trim()})`
  );
  return out;
}

function rewriteUserEntriesForSwar(parser) {
  const targets = [];
  for (const source of parser.sources) {
    if (source.sourceKind !== asc.SourceKind.UserEntry) continue;
    if (!findFirstV128FamilyUse(source.text)) continue;
    targets.push(source);
  }

  for (const source of targets) {
    let rewritten = source.text;
    const hasI32x4 = /\bi32x4\b/.test(rewritten);
    const hasOtherV128Family = /\b(v128|i8x16|i16x8|i64x2)\b/.test(rewritten);
    if (hasOtherV128Family) {
      const first = findFirstV128FamilyUse(rewritten);
      if (first && first.symbol !== "i32x4") {
        const line = source.lineAt(first.index);
        const column = source.columnAt(first.index);
        throw new Error(
          `${STRICT_DIAGNOSTIC_PREFIX} SWAR fallback currently supports i32x4-only in transform mode; found '${first.symbol}' at ${source.normalizedPath}:${line}:${column}.`
        );
      }
    }
    if (!hasI32x4) continue;
    rewritten = rewriteI32x4Locals(rewritten);
    const importStmt = `import { i32x4_pair } from "as-simd/assembly/v128/i32x4_pair";\n`;
    const finalText = `${importStmt}${rewritten}`;
    const internalPath = source.internalPath;
    const idx = parser.sources.indexOf(source);
    if (idx >= 0) parser.sources.splice(idx, 1);
    parser.donelog.delete(internalPath);
    parser.seenlog.delete(internalPath);
    parser.parseFile(finalText, source.normalizedPath, true);
  }
}

export default class SwarV128AliasesTransform extends Transform {
  #simdIntent = null;

  getSimdIntent() {
    if (this.#simdIntent) return this.#simdIntent;

    const cli = parseCliFeatures(process.argv.slice(2));
    const baseDir = this.baseDir || process.cwd();
    const configFile = cli.configPath ? path.resolve(baseDir, cli.configPath) : path.resolve(baseDir, "asconfig.json");
    const asconfig = readAsconfigRecursive(configFile, cli.target || "release");

    this.#simdIntent = {
      explicitEnable: cli.explicitEnableSimd || asconfig.explicitEnable,
      explicitDisable: cli.explicitDisableSimd || asconfig.disable,
      forceSwarUse: cli.forceSwarUse || asconfig.forceSwarUse,
      hasConfigEnable: asconfig.enable,
      hasConfigDisable: asconfig.disable,
      hasCliSimdDirective: cli.hasSimdDirective,
      hasLoadedConfig: asconfig.loaded,
      source: cli.explicitEnableSimd || cli.explicitDisableSimd ? "cli" : "asconfig",
    };
    return this.#simdIntent;
  }

  getExecutionPolicy(options) {
    const hasSimd = (options.features & SIMD_FEATURE) !== 0;
    const simdIntent = this.getSimdIntent();
    const forceSwarFromEnv = process.env[FORCE_SWAR_ENV] === "1";
    const forceSwarFromUse = simdIntent.forceSwarUse;
    const assumeProgrammaticExplicit =
      hasSimd && !simdIntent.hasCliSimdDirective && !simdIntent.hasConfigEnable && !simdIntent.hasConfigDisable;
    const useSimd = (simdIntent.explicitEnable || assumeProgrammaticExplicit) && !simdIntent.explicitDisable;
    const forceSwarFromIntent = !useSimd;
    const forceSwar = forceSwarFromEnv || forceSwarFromUse || forceSwarFromIntent;
    return { hasSimd, simdIntent, useSimd, forceSwar };
  }

  afterParse(parser) {
    const options = this.program.options;
    const { forceSwar } = this.getExecutionPolicy(options);

    if (forceSwar) {
      // Strict SWAR mode via pointer-based runtime.
      asc.setFeature(options, asc.FEATURE_SIMD, false);
      asc.setFeature(options, asc.FEATURE_RELAXED_SIMD, false);
      rewriteUserEntriesForSwar(parser);
      return;
    }

    const simdIntent = this.getSimdIntent();
    const hasSimd = (options.features & SIMD_FEATURE) !== 0;
    if (!hasSimd && !simdIntent.explicitDisable) {
      asc.setFeature(options, asc.FEATURE_SIMD, true);
    }
  }

  afterInitialize(program) {
    const options = program.options;
    const { hasSimd, simdIntent, forceSwar } = this.getExecutionPolicy(options);

    if (forceSwar) {
      forceFeatureGlobalOff(program, "ASC_FEATURE_SIMD");
      forceFeatureGlobalOff(program, "ASC_FEATURE_RELAXED_SIMD");
    }

    if (hasSimd && !simdIntent.explicitEnable && !forceSwar) {
      this.stderr.write(
        `${INFO_PREFIX} SIMD feature is enabled but was not detected as explicitly enabled through --enable simd or asconfig 'enable'. ` +
          "This can happen in programmatic asc() flows. For deterministic behavior, set SIMD intent explicitly.\n"
      );
    }

    if (hasSimd && !forceSwar) asc.addGlobalAlias(options, "v128_swar", "v128");
  }
}
