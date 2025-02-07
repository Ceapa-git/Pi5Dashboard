#!/bin/bash
echo "Installing dependencies..."
source ../venv/bin/activate
pip install --no-cache-dir -r requirements.txt > /dev/null
python app.py