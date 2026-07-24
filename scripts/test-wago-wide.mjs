import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "build", "wago-wide");
const goEnv = {
  ...process.env,
  GONOSUMDB: [process.env.GONOSUMDB, "github.com/JairusSW/wide"]
    .filter(Boolean)
    .join(","),
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
  run(
    "go",
    [
      "mod",
      "edit",
      `-require=${module}@v0.0.0`,
      `-replace=${module}=${resolved}`,
    ],
    {
      cwd: temporaryModule,
    },
  );
}

mkdirSync(output, { recursive: true });
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
    path.join(output, "externref.wasm"),
  ],
  {
    env: {
      ...process.env,
      WAGO_PLUGINS: "wide",
    },
  },
);

const temporaryModule = mkdtempSync(
  path.join(os.tmpdir(), "as-simd-wago-wide-"),
);
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
	wasm, err := os.ReadFile(filepath.Join(os.Args[1], "externref.wasm"))
	if err != nil {
		panic(err)
	}
	plain, err := wago.NewRuntime().Compile(wasm)
	if err != nil {
		panic(fmt.Errorf("compile without Wide: %w", err))
	}
	if plain.Compiled().RequiresAVX2() {
		panic("unexpectedly selected AVX2 without Wide")
	}
	runtime := wago.NewRuntime()
	if err := runtime.Use(wide.New()); err != nil {
		panic(fmt.Errorf("register Wide: %w", err))
	}
	native, err := runtime.Compile(wasm)
	if err != nil {
		panic(fmt.Errorf("compile with Wide: %w", err))
	}
	if !native.Compiled().RequiresAVX2() {
		panic("did not select native wide lowering")
	}
	fmt.Println("ok: externref")
}
`,
);

try {
  if (process.env.WIDE_DIR) {
    localModule("github.com/JairusSW/wide", process.env.WIDE_DIR);
  } else {
    run(
      "go",
      ["get", `github.com/JairusSW/wide@${process.env.WIDE_VERSION ?? "main"}`],
      {
        cwd: temporaryModule,
      },
    );
  }
  if (process.env.WAGO_DIR) {
    localModule("github.com/wago-org/wago", process.env.WAGO_DIR);
  } else {
    run(
      "go",
      [
        "get",
        `github.com/wago-org/wago@${process.env.WAGO_VERSION ?? "latest"}`,
      ],
      {
        cwd: temporaryModule,
      },
    );
  }
  run("go", ["mod", "tidy"], { cwd: temporaryModule });
  run("go", ["run", ".", output], { cwd: temporaryModule });
} finally {
  rmSync(temporaryModule, { recursive: true, force: true });
}
