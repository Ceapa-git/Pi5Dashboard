#!/bin/bash
set -e

cd frontend

# Check for node_modules
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm ci
fi

echo "Building frontend..."
npm run build

echo "Frontend build complete: frontend/dist"
echo "Serve with nginx (recommended)."

