# Railway Deployment Guide

This guide will help you deploy the Prolinq backend to Railway.

## Prerequisites

- A Railway account
- GitHub repository with the backend code
- Railway CLI (optional)

## Step 1: Prepare Your Repository

1. Ensure all files are committed to your GitHub repository
2. The backend should be in the `/backend` directory

## Step 2: Deploy to Railway

### Option A: Using Railway Dashboard

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Connect your GitHub repository
4. Select the `Prolinq` repository
5. Choose the `backend` directory as the root directory
6. Click "Deploy Now"

### Option B: Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
cd Prolinq/backend
railway init

# Deploy
railway up
```

## Step 3: Configure Environment Variables

In Railway dashboard, add these environment variables:

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Configuration
SECRET_KEY=your-super-secret-jwt-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend URL
FRONTEND_URL=https://prolinq-git-main-mikomborero-kanyokas-projects.vercel.app

# Environment
ENVIRONMENT=production
```

### Optional Variables

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

## Step 4: Set Up Database

1. In Railway dashboard, add a PostgreSQL service
2. Once created, click on the database service
3. Copy the DATABASE_URL from the "Connect" tab
4. Add this URL to your backend service environment variables

## Step 5: Run Database Migrations

1. After deployment, your app will automatically create tables
2. For manual migrations, you can use Railway console:

```bash
# Open Railway console for your service
railway open shell

# Run migrations (if using Alembic)
alembic upgrade head

# Create admin user (optional)
python create_admin.py
```

## Step 6: Verify Deployment

1. Check the deployment logs in Railway dashboard
2. Visit your Railway URL + `/health` to verify:
   ```
   https://your-app-name.railway.app/health
   ```
3. Should return: `{"status": "ok"}`

## Step 7: Update Frontend Configuration

Update your frontend environment variables to point to the new Railway backend:

```javascript
// In your frontend .env or config
VITE_API_URL=https://your-app-name.railway.app
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Check if PostgreSQL service is running
   - Ensure database credentials are valid

2. **CORS Errors**
   - Verify FRONTEND_URL environment variable
   - Check that the frontend URL is correctly set

3. **Build Failures**
   - Check the build logs in Railway dashboard
   - Ensure all dependencies are in requirements.txt
   - Verify Python syntax is correct

4. **Socket.IO Issues**
   - Ensure the start command uses `socket_app`
   - Check that the port is correctly configured

### Debug Commands

```bash
# Check logs
railway logs

# Open shell
railway open shell

# Check environment variables
railway variables
```

## Production Considerations

1. **Database**: Railway PostgreSQL is recommended for production
2. **File Storage**: Consider using Railway's persistent storage or external storage like AWS S3
3. **Monitoring**: Enable Railway's built-in monitoring
4. **Backups**: Enable automatic database backups in Railway

## URLs After Deployment

- **Backend API**: `https://your-app-name.railway.app`
- **Health Check**: `https://your-app-name.railway.app/health`
- **API Docs**: `https://your-app-name.railway.app/docs`

## Support

If you encounter issues:

1. Check Railway's [documentation](https://docs.railway.app/)
2. Review the deployment logs
3. Ensure all environment variables are set correctly
4. Verify your database connection
