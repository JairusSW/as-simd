#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mapfile -t chart_files < <(find "$SCRIPT_DIR" -maxdepth 1 -type f -name "*.chart.ts" | sort)

if [[ ${#chart_files[@]} -eq 0 ]]; then
  echo "No chart scripts found in $SCRIPT_DIR (*.chart.ts)"
  exit 1
fi

for chart in "${chart_files[@]}"; do
  bun run "$chart"
done
