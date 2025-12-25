#!/bin/bash
set -e

# Defines frontend directory paths
FRONTEND_DIR="./frontend"

# Installs frontend dependencies
if [ -f "$FRONTEND_DIR/package.json" ]; then
    echo "[SETUP] Installing frontend dependencies..."
    (cd "$FRONTEND_DIR" && npm install)
else
    echo "[ERROR] package.json not found in $FRONTEND_DIR"
    exit 1
fi

# Starts frontend
echo "[INFO] Starting frontend server..."
(cd "$FRONTEND_DIR" && npm run dev)
