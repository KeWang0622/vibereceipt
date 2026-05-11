#!/usr/bin/env bash
set -euo pipefail

case "${1:-}" in
  install)
    npm install --no-audit --no-fund
    npm run build
    ;;
  example)
    # Non-interactive demo — produces the headline artifact deterministically
    mkdir -p assets
    node dist/src/index.js --demo --out assets/example.svg
    ;;
  test)
    npm test
    ;;
  *)
    echo "usage: $0 {install|example|test}"
    exit 2
    ;;
esac
