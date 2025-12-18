#!/bin/bash

echo "🔧 Production Build Script for Prolinq Frontend"
echo "=============================================="

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist
rm -rf .vite

# Set production environment
export NODE_ENV=production
export VITE_USER_NODE_ENV=production

echo "📦 Building for production..."
npm run build

echo "✅ Build complete!"
echo "📁 Build output: ./dist"
echo ""
echo "🚀 To deploy to Vercel:"
echo "1. Push changes to git"
echo "2. Vercel will automatically deploy"
echo ""
echo "🔍 Debug info:"
echo "- Environment: $NODE_ENV"
echo "- VITE_USER_NODE_ENV: $VITE_USER_NODE_ENV"
echo "- VITE_API_URL: ${VITE_API_URL:-Using .env.production}"
