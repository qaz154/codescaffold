#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR=$(mktemp -d)

cleanup() {
  rm -rf "$OUTPUT_DIR"
}
trap cleanup EXIT

cd "$ROOT_DIR"
npm run build >/dev/null

declare -A NODE_TEMPLATES
NODE_TEMPLATES[express-api]="package.json tsconfig.json src/server.ts"
NODE_TEMPLATES[nextjs-fullstack]="package.json next.config.ts app/page.tsx"

for template in "${!NODE_TEMPLATES[@]}"; do
  name="${template}-check"
  node dist/cli/index.js create "$name" --template "$template" --output "$OUTPUT_DIR" --quiet >/dev/null

  project_dir="$OUTPUT_DIR/$name"
  pushd "$project_dir" >/dev/null
  npm install --no-audit --no-fund >/dev/null
  npm run build
  popd >/dev/null

  for file in ${NODE_TEMPLATES[$template]}; do
    if [[ ! -f "$project_dir/$file" ]]; then
      echo "Missing $file in generated $template project" >&2
      exit 1
    fi
  done
done

python_template="python-fastapi"
python_name="$python_template-check"
node dist/cli/index.js create "$python_name" --template "$python_template" --output "$OUTPUT_DIR" --quiet >/dev/null
python -m compileall "$OUTPUT_DIR/$python_name" >/dev/null

go_template="go-microservice"
go_name="$go_template-check"
node dist/cli/index.js create "$go_name" --template "$go_template" --output "$OUTPUT_DIR" --quiet >/dev/null

if command -v go >/dev/null 2>&1; then
  pushd "$OUTPUT_DIR/$go_name" >/dev/null
  go test ./...
  popd >/dev/null
else
  echo "Go runtime not found; skipping go test"
fi

echo "Template deep validation passed."
