# 🚀 Prolinq - Full Stack Job Platform

A complete full-stack job platform built with **FastAPI** backend and **React** frontend.

## ⚡ Quick Start

### 1. Run Startup Script (Easiest)
```bash
# Windows PowerShell
.\start-dev.ps1

# Windows Command Prompt
start-dev.bat
```

### 2. Or Start Manually
```powershell
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Open in Browser
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

---

## 📦 What's Included

### Backend (FastAPI + SQLite)
- ✅ 8 Complete API route modules
- ✅ 32 Fully implemented endpoints
- ✅ JWT authentication (no passlib)
- ✅ SQLite database
- ✅ CORS enabled
- ✅ Automatic Swagger documentation

### Frontend (React + Vite)
- ✅ Complete API service layer
- ✅ Auth context with token management
- ✅ All dependencies installed
- ✅ Ready for development

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **QUICK_START.md** | 30-second setup guide |
| **SETUP_GUIDE.md** | Complete configuration guide |
| **INSTALLATION_SUMMARY.md** | What was installed and why |
| **API_USAGE_EXAMPLES.md** | React component examples |
| **README.md** | This file |

---

## 🎯 Project Structure

```
.
├── backend/                 # FastAPI backend
│   ├── main.py             # Entry point
│   ├── models.py           # Database models
│   ├── database.py         # SQLite connection
│   ├── schemas.py          # Data validation
│   ├── auth.py             # JWT authentication
│   ├── utils.py            # Utilities
│   ├── requirements.txt    # Python dependencies
│   ├── .env                # Configuration
│   └── routes/             # 8 API route modules
│
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── services/api.js # API client
│   │   ├── contexts/       # React contexts
│   │   └── components/     # React components
│   ├── .env                # Frontend config
│   └── package.json
│
├── start-dev.ps1          # PowerShell startup script
├── start-dev.bat          # Batch startup script
├── QUICK_START.md
├── SETUP_GUIDE.md
├── API_USAGE_EXAMPLES.md
└── README.md
```

---

## 🔌 API Routes

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout

### Jobs (6 endpoints)
- `GET /api/jobs/` - List jobs
- `GET /api/jobs/{id}` - Get job details
- `POST /api/jobs/` - Create job
- `PUT /api/jobs/{id}` - Update job
- `DELETE /api/jobs/{id}` - Delete job
- `GET /api/jobs/me/jobs` - Get my jobs

### Users (3 endpoints)
- `GET /api/users/` - List users
- `GET /api/users/{id}` - Get user
- `GET /api/users/me/profile` - Get current user

### Applications (5 endpoints)
- `POST /api/applications/` - Apply for job
- `GET /api/applications/job/{id}` - Get job applications
- `GET /api/applications/me/applications` - Get my applications
- `PUT /api/applications/{id}` - Update application
- `DELETE /api/applications/{id}` - Delete application

### Messages (4 endpoints)
- `POST /api/messages/` - Send message
- `GET /api/messages/{id}` - Get conversation
- `GET /api/messages/me/conversations` - Get all conversations
- `PUT /api/messages/{id}/read` - Mark as read

### Profiles (3 endpoints)
- `GET /api/profiles/{id}` - Get profile
- `GET /api/profiles/me/profile` - Get my profile
- `PUT /api/profiles/me/profile` - Update profile

### Notifications (4 endpoints)
- `GET /api/notifications/` - Get notifications
- `POST /api/notifications/` - Create notification
- `PUT /api/notifications/{id}/read` - Mark as read
- `DELETE /api/notifications/{id}` - Delete

### Job Completion (4 endpoints)
- `POST /api/job-completion/` - Complete job
- `GET /api/job-completion/{id}` - Get completion data
- `GET /api/job-completion/me/completed` - Get my completed
- `PUT /api/job-completion/{id}/rate` - Rate job

**Total: 32 endpoints ready to use**

---

## 🔐 Authentication

### How It Works
1. User registers/logs in
2. Backend returns JWT token
3. Token stored in browser `localStorage`
4. Token sent with every API request
5. Token lasts 30 days (configurable)

### Example
```javascript
import { authAPI } from '@/services/api'

// Register
await authAPI.register({
  email: "user@example.com",
  username: "username",
  full_name: "Full Name",
  password: "password123"
})

// Login
await authAPI.login({
  email: "user@example.com",
  password: "password123"
})
```

---

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern web framework
- **SQLAlchemy** - ORM
- **Pydantic** - Data validation
- **PyJWT** - JWT tokens
- **SQLite** - Database
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hook Form** - Forms

---

## 📋 Features

✅ User authentication with JWT
✅ Job posting and management
✅ Job applications tracking
✅ User profiles with skills
✅ Direct messaging system
✅ Notifications
✅ Job completion tracking
✅ User browsing and search
✅ CORS enabled
✅ Automatic API docs

---

## 🧪 Testing

### Interactive API Docs
Visit `http://localhost:8000/docs` and test endpoints directly

### Using curl
```powershell
# Register
$body = @{email="test@example.com"; username="test"; full_name="Test"; password="pass"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8000/api/auth/register" -Method POST -Body $body -ContentType "application/json"

# Login
$body = @{email="test@example.com"; password="pass"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

---

## 🐛 Troubleshooting

### Backend won't start
```powershell
cd backend
# Delete and recreate database
Remove-Item prolinq.db
python main.py
```

### Port already in use
```powershell
# Kill process on port 8000
Get-NetTCPConnection -LocalPort 8000 | Stop-Process -Force
```

### CORS errors
Check `backend/.env` and `frontend/.env` have correct URLs

### Reinstall dependencies
```powershell
# Backend
cd backend ; pip install --upgrade -r requirements.txt

# Frontend
cd frontend ; npm install
```

---

## 🔒 Security Notes

✅ Implemented:
- JWT authentication
- Password hashing (SHA256 + salt)
- CORS protection
- Request validation

⚠️ Before production:
- [ ] Change `SECRET_KEY` in `backend/.env`
- [ ] Use environment-specific configs
- [ ] Enable HTTPS
- [ ] Migrate to PostgreSQL
- [ ] Add rate limiting
- [ ] Setup proper logging

---

## 📖 More Documentation

- **QUICK_START.md** - Quick reference
- **SETUP_GUIDE.md** - Complete guide
- **INSTALLATION_SUMMARY.md** - What was installed
- **API_USAGE_EXAMPLES.md** - React examples
- **API Docs** - `http://localhost:8000/docs`

---

## 🚀 Next Steps

1. Run startup script: `.\start-dev.ps1`
2. Open `http://localhost:5173`
3. Create account and explore
4. Check `API_USAGE_EXAMPLES.md` for component code
5. Start building features!

---

## 📞 Quick Commands

```powershell
# Start both servers
.\start-dev.ps1

# Start backend only
cd backend ; python main.py

# Start frontend only
cd frontend ; npm run dev

# View API documentation
http://localhost:8000/docs

# Check backend health
http://localhost:8000/health
```

---

## ✨ Features Implemented

### Authentication System
- User registration
- User login/logout
- JWT token management
- Password hashing
- Protected routes

### Job Management
- Create job postings
- Update job listings
- Delete jobs
- View all jobs
- Filter by status

### Applications
- Apply for jobs
- Track applications
- Accept/reject applications
- View applications for your jobs

### User System
- User profiles
- User search
- Profile updates
- Skills management
- Hourly rates

### Messaging
- Send direct messages
- View conversations
- Message history
- Mark messages as read

### Additional Features
- Notifications system
- Job completion tracking
- Rating system
- User browsing

---

## 💡 Tips

- Use `F12` in browser to check frontend console
- Use `http://localhost:8000/docs` for API testing
- Check backend terminal for errors
- Use React Developer Tools extension
- Store important data in database, not localStorage

---

## 📄 License

This project is ready for development and deployment.

---

## 🎯 You're All Set!

Everything is installed and ready to use. Just run:

```powershell
.\start-dev.ps1
```

Then open `http://localhost:5173` and start building! 🎉

**For detailed setup, see SETUP_GUIDE.md**
**For API examples, see API_USAGE_EXAMPLES.md**