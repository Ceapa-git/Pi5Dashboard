#!/bin/bash
set -e
cd backend
echo "Checking venv..."
if [ ! -f ".venv/bin/activate" ]; then
    echo "Virtual environment not found. Creating..."
    python3 -m venv .venv
fi
echo "Activating virtual environment..."
source ./.venv/bin/activate

python3 -m pip install --upgrade pip > /dev/null

if ! cmp -s requirements.txt .venv/installed.txt; then
    echo "Installing updated dependencies..."
    pip install --no-cache-dir -r requirements.txt > /dev/null
    cp requirements.txt .venv/installed.txt
    echo "Dependencies installed."
else
    echo "Dependencies unchanged, skipping install."
fi

echo "Starting backend..."
python app.py
