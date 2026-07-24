import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "build", "wago-wide");
const carriers = ["externref", "i32", "i64", "f32", "f64", "v128", "funcref"];
const goEnv = {
  ...process.env,
  GONOSUMDB: [process.env.GONOSUMDB, "github.com/JairusSW/wide"].filter(Boolean).join(","),
};

function run(command, args, options = {}) {
  execFileSync(command, args, {
    cwd: options.cwd ?? root,
    env: options.env ?? (command === "go" ? goEnv : process.env),
    stdio: "inherit",
  });
}

function localModule(module, directory) {
  const resolved = path.resolve(root, directory);
  run("go", ["mod", "edit", `-require=${module}@v0.0.0`, `-replace=${module}=${resolved}`], {
    cwd: temporaryModule,
  });
}

mkdirSync(output, { recursive: true });
for (const carrier of carriers) {
  run(
    path.join(root, "node_modules", ".bin", "asc"),
    [
      "bench/wide/bench.ts",
      "--runtime",
      "stub",
      "--transform",
      "./transform",
      "-O3",
      "--converge",
      "--enable",
      "simd",
      "-o",
      path.join(output, `${carrier}.wasm`),
    ],
    {
      env: {
        ...process.env,
        WAGO_PLUGINS: "wide",
        AS_SIMD_WIDE_CARRIER: carrier,
      },
    },
  );
}

const temporaryModule = mkdtempSync(path.join(os.tmpdir(), "as-simd-wago-wide-"));
writeFileSync(
  path.join(temporaryModule, "go.mod"),
  "module as-simd-wago-wide-integration\n\ngo 1.22\n",
);
writeFileSync(
  path.join(temporaryModule, "main.go"),
  `package main

import (
	"fmt"
	"os"
	"path/filepath"

	wide "github.com/JairusSW/wide"
	wago "github.com/wago-org/wago"
)

func main() {
	carriers := map[string]wago.WasmType{
		"externref": wago.WasmExternRef,
		"i32":       wago.WasmI32,
		"i64":       wago.WasmI64,
		"f32":       wago.WasmF32,
		"f64":       wago.WasmF64,
		"v128":      wago.WasmV128,
		"funcref":   wago.WasmFuncRef,
	}
	for name, carrier := range carriers {
		wasm, err := os.ReadFile(filepath.Join(os.Args[1], name+".wasm"))
		if err != nil {
			panic(err)
		}
		plain, err := wago.NewRuntime().Compile(wasm)
		if err != nil {
			panic(fmt.Errorf("%s compile without Wide: %w", name, err))
		}
		if plain.Compiled().RequiresAVX2() {
			panic(fmt.Errorf("%s unexpectedly selected AVX2 without Wide", name))
		}
		runtime := wago.NewRuntime()
		if err := runtime.Use(wide.New(wide.WithCarrier(carrier))); err != nil {
			panic(fmt.Errorf("%s register Wide: %w", name, err))
		}
		native, err := runtime.Compile(wasm)
		if err != nil {
			panic(fmt.Errorf("%s compile with Wide: %w", name, err))
		}
		if !native.Compiled().RequiresAVX2() {
			panic(fmt.Errorf("%s did not select native wide lowering", name))
		}
		fmt.Printf("ok: %s\\n", name)
	}
}
`,
);

try {
  if (process.env.WIDE_DIR) {
    localModule("github.com/JairusSW/wide", process.env.WIDE_DIR);
  } else {
    run("go", ["get", `github.com/JairusSW/wide@${process.env.WIDE_VERSION ?? "main"}`], {
      cwd: temporaryModule,
    });
  }
  if (process.env.WAGO_DIR) {
    localModule("github.com/wago-org/wago", process.env.WAGO_DIR);
  } else {
    run("go", ["get", `github.com/wago-org/wago@${process.env.WAGO_VERSION ?? "latest"}`], {
      cwd: temporaryModule,
    });
  }
  run("go", ["mod", "tidy"], { cwd: temporaryModule });
  run("go", ["run", ".", output], { cwd: temporaryModule });
} finally {
  rmSync(temporaryModule, { recursive: true, force: true });
}
