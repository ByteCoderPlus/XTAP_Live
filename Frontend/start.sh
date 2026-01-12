#!/bin/bash

echo "🚀 Starting Bench Talent Optimizer..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps || yarn install || pnpm install
    echo ""
fi

echo "✨ Starting development server..."
npm run dev || yarn dev || pnpm dev
