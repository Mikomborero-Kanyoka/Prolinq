# Prolinq Frontend Quick Start Guide

## 🚀 Easy Ways to Start the Frontend

You now have multiple convenient ways to run the Prolinq frontend:

### Method 1: Simple npm start (Local Only)
```bash
npm start
```
- Runs on `http://localhost:5173`
- Uses localhost API URLs
- Best for local development

### Method 2: Smart Runner Scripts (Recommended)
```bash
# For local development
npm run run:local

# For network access (other devices can connect)
npm run run:network
```

### Method 3: Manual Environment Switching
```bash
# Local development
npm start

# Network access (allows other devices to connect)
npm run start:network
```

## 📡 Access URLs

| Mode | Frontend URL | API URL | Who Can Access |
|------|--------------|---------|----------------|
| Local | http://localhost:5173 | http://localhost:8001/api | Only this computer |
| Network | http://192.168.1.31:3000 | http://192.168.1.31:8001/api | Any device on same network |

## 🔧 Environment Files

The setup uses two environment files:

- `.env.local` - For local development (localhost URLs)
- `.env.network` - For network access (192.168.1.31 URLs)

The smart runner scripts automatically copy the appropriate environment file to `.env` before starting.

## 🌐 Network Access Setup

To allow other devices (phones, tablets, other computers) to access your Prolinq app:

1. **Start the backend with network access:**
   ```bash
   cd backend
   python main.py
   ```
   (Backend already runs on 192.168.1.31:8001)

2. **Start the frontend with network access:**
   ```bash
   cd frontend
   npm run run:network
   ```

3. **Access from other devices:**
   - Frontend: `http://192.168.1.31:3000`
   - Backend API: `http://192.168.1.31:8001`

## 📱 Testing on Mobile Devices

1. Make sure your mobile device is on the same WiFi network
2. Open a browser and go to `http://192.168.1.31:3000`
3. The app should load and connect to the backend API

## 🔍 Troubleshooting

### Frontend not accessible from other devices?
- Check that both devices are on the same WiFi network
- Verify the frontend is running with `npm run run:network`
- Try accessing `http://192.168.1.31:3000` from another computer first

### API connection issues?
- Ensure the backend is running (`python main.py` in backend directory)
- Check that the API URL matches your running mode (local vs network)
- Verify no firewall is blocking port 8001 or 3000

### Wrong IP address?
- Update the IP address in `.env.network` and `backend/.env`
- Current IP: 192.168.1.31

## 💡 Pro Tips

1. **Use the smart runner scripts** (`npm run run:local` or `npm run run:network`) - they handle environment switching automatically
2. **For development**, stick with local mode for faster performance
3. **For testing** with real devices, use network mode
4. **Check the console output** - the scripts show you exactly which URLs are being used

## 🎯 Quick Commands Summary

```bash
# Start locally (most common)
npm start

# Start with smart runner (recommended)
npm run run:local        # Local development
npm run run:network      # Network access

# Manual network start
npm run start:network
