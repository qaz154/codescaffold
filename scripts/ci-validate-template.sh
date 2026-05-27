#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <template>" >&2
  exit 1
fi

TEMPLATE="$1"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR=$(mktemp -d)

cleanup() {
  rm -rf "$OUTPUT_DIR"
}
trap cleanup EXIT

cd "$ROOT_DIR"
PROJECT_DIR="$OUTPUT_DIR/${TEMPLATE}-ci"

node dist/cli/index.js create "${TEMPLATE}-ci" --template "$TEMPLATE" --output "$OUTPUT_DIR" --quiet >/dev/null

case "$TEMPLATE" in
  express-api|nextjs-fullstack)
    pushd "$PROJECT_DIR" >/dev/null
    npm install --no-audit --no-fund >/dev/null
    npm run build
    popd >/dev/null
    ;;
  python-fastapi)
    python -m compileall "$PROJECT_DIR" >/dev/null
    ;;
  go-microservice)
    pushd "$PROJECT_DIR" >/dev/null
    go test ./...
    popd >/dev/null
    ;;
  *)
    echo "Unsupported template: $TEMPLATE" >&2
    exit 1
    ;;
esac

echo "Deep validation passed for $TEMPLATE"
