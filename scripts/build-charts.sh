#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mapfile -t chart_files < <(find "$SCRIPT_DIR" -maxdepth 1 -type f -name "*.chart.ts" | sort)

if [[ ${#chart_files[@]} -eq 0 ]]; then
  echo "No chart scripts found in $SCRIPT_DIR (*.chart.ts)"
  exit 1
fi

run_chart() {
  local chart="$1" chart_output
  if chart_output=$(bun run "$chart" 2>&1); then
    [[ -z "$chart_output" ]] || printf '%s\n' "$chart_output"
    return 0
  fi
  if [[ "$chart_output" == *"No benchmark JSON"* || "$chart_output" == *"No overlapping benchmark methods"* ]]; then
    printf '%s\n' "$chart_output"
    return 0
  fi
  printf '%s\n' "$chart_output" >&2
  return 1
}

for chart in "${chart_files[@]}"; do
  [[ "$(basename "$chart")" == overview-*.chart.ts ]] && continue
  run_chart "$chart"
done

# Overview charts aggregate the detailed markdown tables, so they must run
# after every source chart has refreshed its table.
for chart in "${chart_files[@]}"; do
  [[ "$(basename "$chart")" != overview-*.chart.ts ]] && continue
  run_chart "$chart"
done
