#!/bin/bash
set -e
echo "Checking venv..."
if [ ! -f "venv/bin/activate" ]; then
    echo "Virtual environment not found. Creating..."
    python3 -m venv venv
fi
echo "Activating virtual environment..."
source ./venv/bin/activate

if ! cmp -s requirements.txt venv/installed.txt; then
    echo "Installing updated dependencies..."
    pip install --no-cache-dir -r requirements.txt > /dev/null
    cp requirements.txt venv/installed.txt
    echo "Dependencies installed."
else
    echo "Dependencies unchanged, skipping install."
fi

echo "Starting app..."
python app.py
