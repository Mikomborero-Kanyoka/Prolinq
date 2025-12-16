# Prolinq - FastAPI Backend & React Frontend Setup Guide

## Project Structure

```
Prolinq3.0/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── utils.py
│   ├── auth.py
│   ├── requirements.txt
│   ├── .env
│   ├── prolinq.db (SQLite database)
│   └── routes/
│       ├── __init__.py
│       ├── auth.py
│       ├── jobs.py
│       ├── users.py
│       ├── applications.py
│       ├── messages.py
│       ├── profiles.py
│       ├── notifications.py
│       └── job_completion.py
└── frontend/
    ├── src/
    │   ├── services/
    │   │   └── api.js
    │   └── ...
    ├── package.json
    └── .env
```

## Backend Setup

### 1. Dependencies Installed
The backend uses the following packages (no passlib - using SHA256 hashing instead):
- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **sqlalchemy** - ORM
- **python-dotenv** - Environment variables
- **pydantic** - Data validation
- **PyJWT** - JWT authentication
- **aiofiles** - Async file handling

### 2. Start Backend Server

Open PowerShell and run:
```powershell
cd c:\Users\Querllett\Desktop\Prolinq3.0\backend
python main.py
```

Or use uvicorn directly:
```powershell
cd c:\Users\Querllett\Desktop\Prolinq3.0\backend ; uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### 3. Environment Variables

The `.env` file is already configured with:
- `SECRET_KEY` - JWT secret (change in production!)
- `DATABASE_URL` - SQLite database path

## Frontend Setup

### 1. Start Frontend Dev Server

Open PowerShell and run:
```powershell
cd c:\Users\Querllett\Desktop\Prolinq3.0\frontend
npm run dev
```

The frontend will be available at: `http://localhost:5173`

### 2. Environment Configuration

The `.env` file is configured with:
- `VITE_API_URL` - Backend API URL (http://localhost:8000/api)
- `VITE_SOCKET_URL` - WebSocket URL

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Jobs
- `GET /api/jobs/` - List all jobs
- `GET /api/jobs/{job_id}` - Get job details
- `POST /api/jobs/` - Create job (requires auth)
- `PUT /api/jobs/{job_id}` - Update job (requires auth)
- `DELETE /api/jobs/{job_id}` - Delete job (requires auth)
- `GET /api/jobs/me/jobs` - Get my posted jobs (requires auth)

### Users
- `GET /api/users/` - List users
- `GET /api/users/{user_id}` - Get user details
- `GET /api/users/me/profile` - Get current user profile (requires auth)

### Applications
- `POST /api/applications/` - Apply for a job (requires auth)
- `GET /api/applications/job/{job_id}` - Get job applications (requires auth)
- `GET /api/applications/me/applications` - Get my applications (requires auth)
- `PUT /api/applications/{application_id}` - Update application status (requires auth)
- `DELETE /api/applications/{application_id}` - Delete application (requires auth)

### Messages
- `POST /api/messages/` - Send message (requires auth)
- `GET /api/messages/{user_id}` - Get conversation with user (requires auth)
- `GET /api/messages/me/conversations` - Get all conversations (requires auth)
- `PUT /api/messages/{message_id}/read` - Mark message as read (requires auth)

### Profiles
- `GET /api/profiles/{user_id}` - Get user profile
- `GET /api/profiles/me/profile` - Get my profile (requires auth)
- `PUT /api/profiles/me/profile` - Update my profile (requires auth)

### Notifications
- `GET /api/notifications/` - Get notifications (requires auth)
- `POST /api/notifications/` - Create notification (requires auth)
- `PUT /api/notifications/{notification_id}/read` - Mark notification as read (requires auth)
- `DELETE /api/notifications/{notification_id}` - Delete notification (requires auth)

### Job Completion
- `POST /api/job-completion/` - Mark job as completed (requires auth)
- `GET /api/job-completion/{job_id}` - Get job completion data (requires auth)
- `GET /api/job-completion/me/completed` - Get my completed jobs (requires auth)
- `PUT /api/job-completion/{job_id}/rate` - Rate a completed job (requires auth)

## Authentication Flow

### Login/Register Response
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "full_name": "User Name",
    "bio": null,
    "skills": null,
    "hourly_rate": null,
    "profile_picture": null,
    "created_at": "2024-01-01T00:00:00"
  }
}
```

### Token Storage
The frontend automatically stores the token in `localStorage`:
- Key: `token` - JWT access token
- Key: `user` - Current user object (JSON)

### Making Authenticated Requests
All subsequent requests include the token in the Authorization header:
```
Authorization: Bearer <token>
```

The API service in `src/services/api.js` automatically handles this.

## Database

SQLite database (`prolinq.db`) is automatically created on first run with the following tables:
- `users` - User accounts
- `jobs` - Job postings
- `applications` - Job applications
- `messages` - Direct messages
- Additional tables for relationships

## Key Features

1. **User Authentication** - JWT-based authentication without passlib
2. **Job Management** - Create, update, delete job postings
3. **Job Applications** - Apply for jobs, track applications
4. **Messaging** - Send and receive messages between users
5. **User Profiles** - Update profile information and skills
6. **Notifications** - In-app notifications system
7. **Job Completion** - Mark jobs as complete and rate them

## Running Both Servers

### Option 1: Separate PowerShell Windows
Window 1:
```powershell
cd c:\Users\Querllett\Desktop\Prolinq3.0\backend ; python main.py
```

Window 2:
```powershell
cd c:\Users\Querllett\Desktop\Prolinq3.0\frontend ; npm run dev
```

### Option 2: Background Execution
```powershell
# Start backend
Start-Process powershell -ArgumentList "cd c:\Users\Querllett\Desktop\Prolinq3.0\backend ; python main.py"

# Start frontend
Start-Process powershell -ArgumentList "cd c:\Users\Querllett\Desktop\Prolinq3.0\frontend ; npm run dev"
```

## Testing the API

Use Swagger UI: `http://localhost:8000/docs`

Or use curl/Postman:
```bash
# Register
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","username":"testuser","full_name":"Test User","password":"password123"}'

# Login
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'
```

## Production Deployment

Before deploying to production:

1. Change `SECRET_KEY` in `.env` to a secure random string
2. Set `CORS allow_origins` to specific domains (not "*")
3. Use a production-grade database (PostgreSQL recommended)
4. Enable HTTPS
5. Use environment-specific configuration
6. Add rate limiting
7. Add input validation and sanitization
8. Implement proper error handling and logging

## Troubleshooting

### Port Already in Use
```powershell
# Find and kill process using port 8000
Get-NetTCPConnection -LocalPort 8000 | Stop-Process -Force
```

### Database Issues
Delete `prolinq.db` and restart the backend to recreate the database.

### CORS Errors
Ensure frontend URL matches `allow_origins` in `main.py`.

### Installation Issues
Reinstall dependencies:
```powershell
cd c:\Users\Querllett\Desktop\Prolinq3.0\backend ; pip install --upgrade -r requirements.txt
cd c:\Users\Querllett\Desktop\Prolinq3.0\frontend ; npm install --save
```

## API Usage Examples

See `frontend/src/services/api.js` for all available API methods:
- `authAPI` - Authentication
- `jobsAPI` - Job management
- `usersAPI` - User data
- `applicationsAPI` - Applications
- `messagesAPI` - Messaging
- `profilesAPI` - Profiles
- `notificationsAPI` - Notifications
- `jobCompletionAPI` - Job completion

## Support

For issues or questions, check:
1. Backend logs in terminal
2. Frontend console (F12)
3. API documentation at `http://localhost:8000/docs`