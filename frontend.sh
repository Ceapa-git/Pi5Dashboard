#!/bin/bash
set -e

cd frontend

# Check for node_modules
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Build the frontend for production
echo "Building frontend..."
npm run build

# Serve the frontend using Vite preview
echo "Starting frontend server..."
npx vite preview --port 5173 --host

