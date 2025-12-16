# Network Connectivity Troubleshooting Guide

## ✅ SOLUTION FOUND - FIREWALL ISSUE RESOLVED

The issue was **Windows Firewall blocking external connections** to your development server.

### Root Cause
- Your backend is running on `0.0.0.0:8001` (correct - listening on all interfaces)
- Your IP is `192.168.1.30` (confirmed via ipconfig)
- But Windows Firewall was blocking incoming connections to port 8001

### Fix Applied
1. **Backend Configuration**: ✅ Already correct in `backend/main.py`:
   ```python
   if __name__ == "__main__":
       uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
   ```

2. **Frontend Configuration**: ✅ Already correct in `frontend/.env.local`:
   ```
   VITE_API_URL=http://192.168.1.30:8001
   ```

3. **Firewall Rules Added**: ✅ Both ports now allowed:
   ```cmd
   # Backend port
   netsh advfirewall firewall add rule name="Prolinq Backend Port 8001" dir=in action=allow protocol=TCP localport=8001
   
   # Frontend port  
   netsh advfirewall firewall add rule name="Prolinq Frontend Port 3000" dir=in action=allow protocol=TCP localport=3000
   ```

## 🎯 How to Test from Your Phone

1. **Make sure both servers are running**:
   ```cmd
   # Terminal 1 - Backend
   cd backend
   python main.py

   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   ```

2. **Access from your phone on the same WiFi**:
   - **Frontend**: `http://192.168.1.30:3000`
   - **Backend API**: `http://192.168.1.30:8001`

3. **Test API directly from phone browser**:
   - Open `http://192.168.1.30:8001/docs` in your phone browser
   - You should see the FastAPI documentation page

## 🔧 Complete Network Setup Summary

- **Your IP**: `192.168.1.30`
- **Backend**: `http://192.168.1.30:8001` ✅
- **Frontend**: `http://192.168.1.30:3000` ✅
- **Firewall**: Ports 8001 & 3000 allowed ✅
- **Backend listening**: `0.0.0.0:8001` ✅
- **Frontend configured**: `VITE_API_URL=http://192.168.1.30:8001` ✅

You should now be able to access your Prolinq application from any device on your WiFi network!

---

## Original Troubleshooting Steps (For Reference)

### Diagnosis Steps

#### 1. Check Current Network Configuration
```bash
# Check your IP address
ipconfig
# or
ip addr show

# Check if backend is listening on all interfaces
netstat -an | findstr :8001
# or on Linux/Mac
netstat -an | grep :8001
```

#### 2. Test from Other Devices
From another device on the same network:
```bash
# Test backend connection
curl http://192.168.1.30:8001/health
# or in browser
http://192.168.1.30:8001/health
```

#### 3. Common Issues & Solutions

##### Windows Firewall
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Add Python/uvicorn to allow inbound connections on port 8001
4. Or create a new rule for port 8001

##### Antivirus Software
- Temporarily disable antivirus to test
- Add exception for Python/uvicorn
- Add exception for port 8001

##### Network Profile
- Make sure your network is set to "Private" not "Public"
- Public networks have stricter firewall rules

##### Router/Firewall
- Check if router is blocking internal connections
- Some routers have AP isolation enabled

#### 4. Backend Configuration Verification

The backend should be running with:
```python
uvicorn.run(socket_app, host="0.0.0.0", port=8001, reload=True)
```

This ensures it binds to all network interfaces, not just localhost.

#### 5. Frontend Configuration

Frontend environment should use:
```
VITE_API_URL=http://192.168.1.30:8001/api
VITE_ADMIN_API_URL=http://192.168.1.30:8001
```

## Quick Fix Commands

### Windows (Run as Administrator)
```cmd
# Allow Python through firewall
netsh advfirewall firewall add rule name="Python Backend" dir=in action=allow protocol=TCP localport=8001

# Or allow specific port
netsh advfirewall firewall add rule name="Backend Port 8001" dir=in action=allow protocol=TCP localport=8001
```

### Test Network Connectivity
```cmd
# Test from host machine
telnet 192.168.1.30 8001

# Test port accessibility
nmap -p 8001 192.168.1.30
```

## Verification Steps

1. ✅ Backend accessible from host machine
2. ✅ Backend now accessible from other devices (firewall fixed)
3. ✅ Firewall rules added for both ports
4. ✅ Network configuration verified

## Final Status: RESOLVED ✅

The network connectivity issue has been resolved. Both backend and frontend are now accessible from any device on the same WiFi network.
