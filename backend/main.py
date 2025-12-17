from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

from database import Base, engine, get_db
from routes import auth, jobs, users, applications, messages, profiles, notifications, job_completion, reviews, analytics, admin, advertisements, skills_matching, job_recommendations, email
# Import all models to ensure they're registered with SQLAlchemy
from models import User, Job, Application, Message, Review, Advertisement, EmailQueue, EmailAd, EmailMetrics

# Socket.IO imports
import socketio
import uvicorn

# Background scheduler imports
from scheduler import start_scheduler, stop_scheduler

load_dotenv()

# Get environment variables
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Defer database creation - will be done in startup event
def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"⚠️  Error creating database tables: {e}")
        # Don't fail startup - tables will be created on first access

# Configure CORS origins based on environment
if ENVIRONMENT == "production":
    cors_origins = [FRONTEND_URL]
else:
    cors_origins = [
        "http://localhost:5173", 
        "http://localhost:3000", 
        "http://192.168.100.130:3000", 
        "http://192.168.100.130:5173",
        FRONTEND_URL
    ]

# Create Socket.IO app
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=cors_origins,
    cors_credentials=True
)

app = FastAPI(
    title="Prolinq API", 
    version="1.0.0",
    description="API for Prolinq job matching platform"
)

# Mount uploads directory for serving static files
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(users.router)
app.include_router(applications.router)
app.include_router(messages.router)
app.include_router(profiles.router)
app.include_router(notifications.router)
app.include_router(job_completion.router)
app.include_router(reviews.router)
app.include_router(analytics.router)
app.include_router(admin.router)
app.include_router(advertisements.router)
app.include_router(skills_matching.router)
app.include_router(job_recommendations.router)
app.include_router(email.router)

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize database and start background scheduler"""
    print("🚀 Application starting...")
    
    # Initialize database tables
    create_tables()
    
    # Start scheduler (this might fail in Railway, so catch exceptions)
    try:
        start_scheduler(app)
        print("✅ Scheduler started successfully")
    except Exception as e:
        print(f"⚠️  Scheduler failed to start (this is okay in Railway): {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Stop background scheduler on application shutdown"""
    print("🛑 Application shutting down...")
    stop_scheduler(app)

@app.get("/")
def read_root():
    return {"message": "Welcome to Prolinq API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Socket.IO event handlers
@sio.event
async def connect(sid, environ, auth=None):
    print(f"🔌 Client connected: {sid}")
    print(f"   environ keys: {environ.keys() if environ else 'None'}")
    print(f"   auth: {auth}")
    
    # Extract user_id from auth or query params
    user_id = None
    if auth and 'user_id' in auth:
        user_id = auth['user_id']
    elif environ and 'auth' in environ and 'user_id' in environ['auth']:
        user_id = environ['auth']['user_id']
    elif environ and 'QUERY_STRING' in environ:
        try:
            query_params = dict(q.split('=') for q in environ['QUERY_STRING'].split('&') if '=' in q)
            user_id = query_params.get('user_id')
        except Exception as e:
            print(f"   Error parsing query params: {e}")
    
    if user_id:
        # Join user-specific room
        await sio.enter_room(sid, f"user_{user_id}")
        print(f"✅ User {user_id} joined room user_{user_id}")
    else:
        print(f"ℹ️ Connected without user_id")

@sio.event
async def disconnect(sid):
    print(f"🔌 Client disconnected: {sid}")

@sio.event
async def new_message(data):
    """Broadcast new message to all connected clients"""
    print(f"📤 Broadcasting message: {data}")
    await sio.emit('new_message', data)

@sio.event
async def typing(data):
    """Broadcast typing indicator"""
    print(f"⌨️ Typing event: {data}")
    await sio.emit('typing', data)

@sio.event
async def notification(data):
    """Broadcast notification to specific user"""
    user_id = data.get('user_id')
    if user_id:
        print(f"📢 Sending notification to user {user_id}: {data}")
        await sio.emit('notification', data, room=f"user_{user_id}")
    else:
        print(f"📢 Broadcasting notification to all: {data}")
        await sio.emit('notification', data)

# Create Socket.IO app
socket_app = socketio.ASGIApp(sio, app)

# Store socket server instance for routes to use
app.state.sio = sio

if __name__ == "__main__":
    import uvicorn
    # Use the Socket.IO ASGI app
    port = int(os.getenv("PORT", 3000))
    uvicorn.run(socket_app, host="0.0.0.0", port=port, reload=True)
