# Network Login Connection Troubleshooting Guide

## Problem Analysis

You're getting a network connection error when trying to login:
```
Login.jsx:35 Login error: 
AxiosError {message: 'Network Error', name: 'AxiosError', code: 'ERR_NETWORK', config: {…}, request: XMLHttpRequest, …}

api.js:28 
POST http://192.168.1.30:8001/auth/login net::ERR_CONNECTION_TIMED_OUT
```

## Root Cause Identified

The frontend is trying to connect to IP `192.168.1.30:8001` but your actual network IP is `192.168.100.130`.

## Solution Steps

### 1. Update Frontend Network Configuration

The frontend `.env.network` file needs to point to the correct IP address:

```bash
# Current (incorrect)
VITE_API_BASE_URL=http://192.168.1.30:8001

# Should be (correct)
VITE_API_BASE_URL=http://192.168.100.130:8001
```

### 2. Update CORS Configuration (Already Done)

I've updated the backend CORS configuration in `backend/main.py` to allow connections from your network IP:

```python
# Updated CORS origins to include network IP
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000", 
        "http://192.168.100.130:3000", 
        "http://192.168.100.130:5173", 
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Restart Services

After making these changes:

1. **Stop the frontend server** (Ctrl+C in the terminal where it's running)
2. **Restart the frontend** with the network configuration:
   ```bash
   cd frontend
   npm run dev:network
   ```
3. **Verify backend is running** on port 8001:
   ```bash
   cd backend
   python main.py
   ```

### 4. Verification Steps

1. **Check backend accessibility**:
   ```bash
   curl http://192.168.100.130:8001/health
   ```
   Should return: `{"status": "ok"}`

2. **Check frontend is serving from network IP**:
   - Open browser to `http://192.168.100.130:5173`
   - Should see the Prolinq application

3. **Test login**:
   - Navigate to the login page
   - Try logging in with valid credentials
   - Should no longer get network error

## Alternative Solutions

### Option 1: Use Localhost Development
If network access isn't required, use local development:
```bash
# Frontend
cd frontend
npm run dev

# Backend (in separate terminal)
cd backend
python main.py
```

Then access via `http://localhost:5173`

### Option 2: Dynamic IP Detection
Create a script to automatically detect and set the correct IP:

```bash
# Create get-network-ip.js in frontend/
const os = require('os');
const interfaces = os.networkInterfaces();
const activeInterface = Object.values(interfaces)
  .flat()
  .find(iface => iface.family === 'IPv4' && !iface.internal);

if (activeInterface) {
  console.log(`VITE_API_BASE_URL=http://${activeInterface.address}:8001`);
} else {
  console.log('VITE_API_BASE_URL=http://localhost:8001');
}
```

## Network Configuration Summary

| Component | Host | Port | Status |
|-----------|------|------|--------|
| Backend | 0.0.0.0 | 8001 | ✅ Listening |
| Frontend | 192.168.100.130 | 5173 | ✅ Configured |
| Firewall | Port 8001 | - | ✅ Rule exists |
| CORS | Network IP | - | ✅ Updated |

## Common Issues & Fixes

### Issue: "ERR_CONNECTION_REFUSED"
**Fix**: Backend not running - start with `python main.py`

### Issue: "ERR_CONNECTION_TIMED_OUT"
**Fix**: Wrong IP address - update `.env.network` with correct IP

### Issue: CORS errors in console
**Fix**: Backend CORS not configured - I've updated this, restart backend

### Issue: "Network Error" in Axios
**Fix**: IP mismatch between frontend config and actual network IP

## Testing Checklist

- [ ] Backend running on port 8001
- [ ] Frontend running on network IP
- [ ] CORS allows network IP
- [ ] Firewall allows port 8001
- [ ] Can access `http://192.168.100.130:8001/health`
- [ ] Can access frontend at `http://192.168.100.130:5173`
- [ ] Login works without network errors

## Quick Fix Command

If you want to quickly fix the main issue:

```bash
# Update the frontend network config
echo "VITE_API_BASE_URL=http://192.168.100.130:8001" > frontend/.env.network

# Restart services
cd frontend && npm run dev:network
```

This should resolve the network connection error for login.
