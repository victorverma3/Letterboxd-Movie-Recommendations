#!/bin/bash
set -e

# Defines backend directory paths
BACKEND_DIR="./backend"
VENV_DIR="$BACKEND_DIR/venv"

# Creates venv if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    echo "[SETUP] Creating backend virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

# Activates venv
echo "[SETUP] Activating backend virtual environment..."
source "$VENV_DIR/bin/activate"

# Installs backend dependencies
if [ -f "$BACKEND_DIR/requirements.txt" ]; then
    echo "[SETUP] Installing backend dependencies..."
    pip install -q -r "$BACKEND_DIR/requirements.txt"
else
    echo "[ERROR] requirements.txt not found in $BACKEND_DIR"
    exit 1
fi

# Starts backend server
echo "[INFO] Starting backend server..."
(cd "$BACKEND_DIR" && python3 -u main.py)
