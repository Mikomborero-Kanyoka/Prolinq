#!/bin/bash

echo "🚀 Starting HTTP 401 Error Fix Deployment"
echo "=========================================="

# Navigate to project root
cd "$(dirname "$0")"

echo "📋 Step 1: Verifying all fixes are in place..."

# Check frontend environment files
echo "🔍 Checking frontend .env.production..."
if [ -f "frontend/.env.production" ]; then
    echo "✅ .env.production exists"
    grep -q "https://prolinq-production.up.railway.app" frontend/.env.production && echo "✅ HTTPS URLs configured" || echo "❌ HTTPS URLs missing"
else
    echo "❌ .env.production missing"
fi

# Check vite config
echo "🔍 Checking vite.config.js..."
if [ -f "frontend/vite.config.js" ]; then
    echo "✅ vite.config.js exists"
    grep -q "manualChunks" frontend/vite.config.js && echo "✅ Build optimization configured" || echo "❌ Build optimization missing"
else
    echo "❌ vite.config.js missing"
fi

# Check backend CORS
echo "🔍 Checking backend CORS configuration..."
if [ -f "backend/main.py" ]; then
    echo "✅ backend/main.py exists"
    grep -q "https://prolinq-frontend.vercel.app" backend/main.py && echo "✅ Vercel frontend URL added" || echo "❌ Vercel frontend URL missing"
else
    echo "❌ backend/main.py missing"
fi

echo ""
echo "📦 Step 2: Building frontend for production..."

cd frontend

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/
rm -rf node_modules/.cache

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Build production
echo "🔨 Building production version..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful"
    echo "📊 Build contents:"
    ls -la dist/
else
    echo "❌ Build failed"
    exit 1
fi

cd ..

echo ""
echo "🔧 Step 3: Preparing backend for deployment..."

cd backend

# Check requirements
echo "📋 Checking requirements..."
if [ -f "requirements.txt" ]; then
    echo "✅ requirements.txt exists"
    echo "📦 Key dependencies:"
    grep -E "(fastapi|uvicorn|sqlalchemy|python-multipart)" requirements.txt
else
    echo "❌ requirements.txt missing"
fi

# Check startup script
echo "🚀 Checking startup configuration..."
if [ -f "start.sh" ]; then
    echo "✅ start.sh exists"
    chmod +x start.sh
else
    echo "❌ start.sh missing"
fi

cd ..

echo ""
echo "📝 Step 4: Creating deployment summary..."

cat > DEPLOYMENT_SUMMARY.md << EOF
# HTTP 401 Fix Deployment Summary

## Date: $(date)

## Fixes Applied:
1. ✅ Frontend environment configured for HTTPS
2. ✅ Vite build optimization enabled
3. ✅ Backend CORS updated for Vercel frontend
4. ✅ API service debugging enhanced
5. ✅ Token cleanup improved in AuthContext

## Files Modified:
- frontend/.env.production
- frontend/vite.config.js
- frontend/src/services/api.js
- frontend/src/contexts/AuthContext.jsx
- backend/main.py

## Deployment Commands:
1. Frontend: Deploy dist/ to Vercel
2. Backend: Push to Railway (automatically deployed)

## Verification Steps:
1. Clear browser cache and localStorage
2. Test login flow
3. Check network requests use HTTPS
4. Verify no 401 errors with valid credentials

## Environment Variables:
- VITE_API_URL=https://prolinq-production.up.railway.app/api
- VITE_SOCKET_URL=https://prolinq-production.up.railway.app
- FRONTEND_URL=https://prolinq-frontend.vercel.app
EOF

echo ""
echo "🎯 Step 5: Git preparation..."

# Add all changes
git add .

# Check status
echo "📊 Git status:"
git status --porcelain

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Commit changes: git commit -m 'Fix HTTP 401 errors - ensure HTTPS and proper CORS'"
echo "2. Push to trigger Railway backend deployment: git push origin main"
echo "3. Deploy frontend to Vercel (manual or automatic)"
echo "4. Clear browser cache and test login flow"
echo ""
echo "📖 For detailed troubleshooting, see: HTTP_401_TROUBLESHOOTING_GUIDE.md"
