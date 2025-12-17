#!/bin/bash

# Railway startup script for Prolinq backend

echo "🚀 Starting Prolinq backend on Railway..."

# Set Python path
export PYTHONPATH=/app

# Create uploads directory if it doesn't exist
mkdir -p uploads
echo "📁 Created uploads directory"

# Default port for Railway
PORT=${PORT:-3000}

# Check if PORT is a valid number, otherwise use default
if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo "⚠️  Invalid PORT value: $PORT, using default 3000"
    PORT=3000
fi

echo "🚀 Starting FastAPI application on port: $PORT"
echo "🌐 Healthcheck will be available at: http://0.0.0.0:$PORT/"

# Start the application directly - database initialization will happen on first request
exec uvicorn main:socket_app --host 0.0.0.0 --port $PORT --log-level info
