#!/bin/bash

set -e

echo "🔧 Setting up Bench Talent Optimizer..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Try to configure npm to handle certificate issues
echo "🔐 Configuring npm settings..."
npm config set strict-ssl false 2>/dev/null || true
npm config set registry https://registry.npmjs.org/ 2>/dev/null || true

# Install dependencies
echo "📦 Installing dependencies..."
if [ -d "node_modules" ]; then
    echo "⚠️  node_modules already exists. Skipping install."
else
    npm install --legacy-peer-deps --no-audit --no-fund || {
        echo "⚠️  npm install failed, trying yarn..."
        yarn install --ignore-engines || {
            echo "⚠️  yarn install failed, trying pnpm..."
            pnpm install || {
                echo "❌ All package managers failed. Please install dependencies manually."
                exit 1
            }
        }
    }
fi

echo ""
echo "✨ Starting development server..."
echo "🌐 The app will be available at http://localhost:5173"
echo ""

# Start the dev server
npm run dev || yarn dev || pnpm dev
