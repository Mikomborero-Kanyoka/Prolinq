# 🚀 Minimal Railway Deployment Guide

## 📋 Problem Analysis
The full application was failing to start due to:
1. Complex import dependencies (socketio, database, routes, etc.)
2. Missing ML dependencies (numpy, sentence_transformers)
3. Database connection issues during startup
4. Scheduler failures

## 🎯 Solution: Minimal Approach
We'll deploy a minimal FastAPI app first to ensure Railway works, then gradually add functionality.

## 📁 Minimal Files Created

### 1. `main_minimal.py`
- Only FastAPI core dependencies
- No database, no routes, no complex imports
- Simple health check endpoint
- Guaranteed to start

### 2. `requirements_minimal.txt`
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
```

### 3. `nixpacks_minimal.toml`
- Minimal Python setup
- No PostgreSQL (for now)
- Simple startup command

### 4. Updated `railway.json`
- Direct uvicorn command
- No shell scripts
- Health check at `/health`

## 🚀 Deployment Steps

### Step 1: Test Minimal Version
1. **Replace Railway files:**
   ```bash
   # Copy minimal versions
   cp nixpacks_minimal.toml nixpacks.toml
   cp requirements_minimal.txt requirements.txt
   cp main_minimal.py main.py
   ```

2. **Update railway.json:**
   ```json
   {
     "$schema": "https://schema.railway.com/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
       "healthcheckPath": "/health",
       "healthcheckTimeout": 100,
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

3. **Deploy to Railway:**
   ```bash
   git add .
   git commit -m "Deploy minimal FastAPI app to Railway"
   git push origin main
   ```

### Step 2: Verify Minimal Deployment
✅ **Expected Results:**
- Health check: `https://your-app.railway.app/health` → `{"status": "ok"}`
- Root: `https://your-app.railway.app/` → `{"message": "Welcome to Prolinq API"}`
- No restart loops
- Fast startup time (< 30 seconds)

### Step 3: Gradually Add Features
Once minimal version works, add back features one by one:

1. **Add Database:**
   ```bash
   # Add to requirements.txt
   sqlalchemy==2.0.23
   psycopg2-binary==2.9.9
   
   # Add to main.py
   from database import engine, Base
   @app.on_event("startup")
   async def startup():
       Base.metadata.create_all(bind=engine)
   ```

2. **Add Routes:**
   ```python
   from routes import auth
   app.include_router(auth.router)
   ```

3. **Add CORS:**
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   app.add_middleware(CORSMiddleware, ...)
   ```

## 🔧 Quick Fix Commands

### Option 1: Use Minimal Files (Recommended)
```bash
# In Railway project directory
cp nixpacks_minimal.toml nixpacks.toml
cp requirements_minimal.txt requirements.txt
cp main_minimal.py main.py
git add . && git commit -m "Switch to minimal deployment" && git push
```

### Option 2: Manual Railway Config
If files don't work, configure in Railway dashboard:
1. **Build Command:** `pip install fastapi uvicorn python-dotenv`
2. **Start Command:** `uvicorn main_minimal:app --host 0.0.0.0 --port $PORT`
3. **Health Check Path:** `/health`

## 🎯 Expected Minimal Logs
```
INFO:     Started server process [1]
INFO:     Waiting for application startup.
🚀 Minimal Prolinq API starting...
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:3000
```

## 📊 Success Metrics
- ✅ Build time: < 30 seconds
- ✅ Startup time: < 10 seconds  
- ✅ Health check: Passes immediately
- ✅ Memory usage: < 100MB
- ✅ No errors in logs

## 🔄 Next Steps After Success

1. **Add database connectivity**
2. **Add authentication routes**
3. **Add job posting functionality**
4. **Add user management**
5. **Add remaining features incrementally**

## 🎉 Why This Approach Works

1. **Eliminates complex dependencies** that cause import errors
2. **Removes database dependency** during initial startup
3. **Simple configuration** that Railway can handle easily
4. **Fast feedback loop** - if this works, Railway is configured correctly
5. **Incremental development** - add features only after base works

---

## 🚨 Important Notes

- This minimal version has **no database**, **no authentication**, **no business logic**
- It's purely to test Railway deployment works
- Once successful, we can gradually add back the full functionality
- The frontend will need to be updated to point to the minimal backend initially

## 📞 If This Still Fails

If the minimal version doesn't work, the issue is likely:
1. Railway project configuration
2. Environment variables
3. Railway service issues
4. Network/proxy problems

Contact Railway support or check Railway status page.

---

**Ready to deploy! 🚀**
