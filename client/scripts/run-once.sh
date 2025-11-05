#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENT_ROOT="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$CLIENT_ROOT")"

cd "$CLIENT_ROOT"

npm run once >> "$PROJECT_ROOT/logs/ip-check.log" 2>&1
