#!/bin/bash
set -e

echo "Waiting for database on localhost:27018..."
until nc -z localhost 27018; do
    sleep 1
done
echo "Database is up."

echo "Activating virtual environment..."
source ../venv/bin/activate

if ! cmp -s requirements.txt installed.txt; then
    echo "Installing updated dependencies..."
    pip install --no-cache-dir -r requirements.txt > /dev/null
    cp requirements.txt installed.txt
    echo "Dependencies installed."
else
    echo "Dependencies unchanged, skipping install."
fi

echo "Starting app..."
python app.py
