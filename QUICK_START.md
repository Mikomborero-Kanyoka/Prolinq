# Prolinq - Quick Start Guide

## ⚡ 30-Second Setup

### 1. Start Backend
```powershell
cd c:\Users\Querllett\Desktop\Prolinq3.0\backend
python main.py
```
✅ Backend runs on `http://localhost:8000`

### 2. Start Frontend  
```powershell
cd c:\Users\Querllett\Desktop\Prolinq3.0\frontend
npm run dev
```
✅ Frontend runs on `http://localhost:5173`

---

## 🚀 Using Startup Scripts (Recommended)

### Option A: PowerShell (Windows)
```powershell
cd c:\Users\Querllett\Desktop\Prolinq3.0
.\start-dev.ps1
```

### Option B: Command Prompt (Windows)
```cmd
cd c:\Users\Querllett\Desktop\Prolinq3.0
start-dev.bat
```

Both start backend and frontend in separate windows automatically.

---

## 📚 What's Been Created

### Backend (FastAPI + SQLite)
- ✅ RESTful API with 8 complete route modules
- ✅ SQLite database (auto-created)
- ✅ JWT authentication (no passlib needed)
- ✅ CORS enabled for frontend
- ✅ Automatic Swagger documentation

**Routes:**
- Auth (register, login, logout)
- Jobs (CRUD operations)
- Users (profile management)
- Applications (job applications)
- Messages (user messaging)
- Profiles (user profiles)
- Notifications (notification system)
- Job Completion (job completion tracking)

### Frontend (React + Vite)
- ✅ API service layer (`src/services/api.js`)
- ✅ Auth context with JWT handling
- ✅ Pre-configured environment variables
- ✅ All dependencies installed

---

## 🔑 Important Credentials

### Test Login
Create an account through the registration page or use:
```
Email: test@example.com
Password: password123
```

### Security Notes
- JWT tokens stored in `localStorage`
- Tokens last 30 days
- Change `SECRET_KEY` in `.env` before production

---

## 📡 API Usage

### In Your Components
```javascript
import { jobsAPI, authAPI, messagesAPI } from '@/services/api'

// List all jobs
const jobs = await jobsAPI.list()

// Create a job
await jobsAPI.create({
  title: "Build a website",
  description: "...",
  budget: 1000,
  category: "Web Development",
  skills_required: "React, Node.js"
})

// Send a message
await messagesAPI.send({
  receiver_id: 5,
  content: "Hello!"
})
```

### API Documentation
Visit `http://localhost:8000/docs` for interactive Swagger documentation

---

## 🛠️ File Structure

```
backend/
├── main.py              # Entry point
├── models.py            # Database models
├── schemas.py           # Data validation
├── database.py          # SQLite connection
├── auth.py              # JWT authentication
├── utils.py             # Utilities (token creation)
├── requirements.txt     # Python dependencies
└── routes/
    ├── auth.py
    ├── jobs.py
    ├── users.py
    ├── applications.py
    ├── messages.py
    ├── profiles.py
    ├── notifications.py
    └── job_completion.py

frontend/
├── src/
│   ├── services/
│   │   └── api.js       # API service layer
│   ├── contexts/
│   │   └── AuthContext.jsx
│   └── ...
├── package.json
└── .env
```

---

## ✅ Checklist

- [x] Backend created with FastAPI
- [x] SQLite database configured
- [x] All 8 route modules implemented
- [x] JWT authentication (no passlib)
- [x] Frontend API service configured
- [x] Auth context with token management
- [x] CORS enabled
- [x] Environment variables set
- [x] Startup scripts created
- [x] All dependencies listed

---

## 🐛 Common Issues

### Port Already in Use
```powershell
# Kill process using port 8000
Get-NetTCPConnection -LocalPort 8000 | Stop-Process -Force
```

### Database Error
Delete `backend/prolinq.db` and restart backend

### Frontend won't connect to backend
Check `.env` has correct `VITE_API_URL=http://localhost:8000/api`

### Module Not Found Error
```powershell
cd c:\Users\Querllett\Desktop\Prolinq3.0\backend
pip install -r requirements.txt
```

---

## 📖 Documentation

- **Setup Guide**: `SETUP_GUIDE.md` - Detailed documentation
- **API Docs**: `http://localhost:8000/docs` - Interactive Swagger UI
- **Code**: Check route files in `backend/routes/` for endpoint implementations

---

## 🔒 Security Notes

Before going to production:
1. Change `SECRET_KEY` in `backend/.env`
2. Update `CORS allow_origins` to specific domains
3. Switch database to PostgreSQL
4. Enable HTTPS
5. Add rate limiting
6. Add input validation

---

## 🎯 Next Steps

1. **Run**: `start-dev.ps1` or `start-dev.bat`
2. **Test**: Open `http://localhost:5173` in browser
3. **Register**: Create a user account
4. **Explore**: Visit `http://localhost:8000/docs` for API docs
5. **Build**: Start implementing your app features!

---

## 📞 Need Help?

Check files:
- `backend/main.py` - Backend entry point
- `backend/routes/` - Endpoint implementations
- `frontend/src/services/api.js` - API client methods
- `frontend/src/contexts/AuthContext.jsx` - Auth management

All dependencies are installed and ready to use!