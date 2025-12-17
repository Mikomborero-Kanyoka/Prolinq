#!/bin/bash

# Railway startup script for Prolinq backend

echo "🚀 Starting Prolinq backend on Railway..."

# Set Python path
export PYTHONPATH=/app

# Wait for database to be ready (if needed)
echo "📊 Checking database connection..."

# Create uploads directory if it doesn't exist
mkdir -p uploads
echo "📁 Created uploads directory"

# Run database migrations/initialization
echo "🗃️ Initializing database..."
python -c "
from database import Base, engine
from models import User, Job, Application, Message, Review, Advertisement, EmailQueue, EmailAd, EmailMetrics
print('✅ Database tables created/verified')
"

# Create default admin user if it doesn't exist
echo "👤 Checking admin user..."
python -c "
from database import get_db
from models import User
from sqlalchemy.orm import Session

# Create a simple session for admin check
db = next(get_db())
admin = db.query(User).filter(User.email == 'admin@prolinq.com').first()
if not admin:
    print('🔧 Creating default admin user...')
    # You can set a default password or generate one
    admin_user = User(
        email='admin@prolinq.com',
        full_name='System Administrator',
        is_admin=True,
        is_active=True
    )
    # Set a default password - this should be changed on first login
    admin_user.set_password('admin123')
    db.add(admin_user)
    db.commit()
    print('✅ Default admin user created (email: admin@prolinq.com, password: admin123)')
else:
    print('✅ Admin user already exists')
db.close()
"

echo "🌟 Starting FastAPI application..."

# Default port for Railway
PORT=${PORT:-3000}

# Check if PORT is a valid number, otherwise use default
if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo "⚠️  Invalid PORT value: $PORT, using default 3000"
    PORT=3000
fi

echo "🚀 Starting on port: $PORT"
exec uvicorn main:socket_app --host 0.0.0.0 --port $PORT
