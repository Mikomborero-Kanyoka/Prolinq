# Railway Deployment Checklist

## ✅ Pre-Deployment Checklist

### Repository Setup
- [ ] All code committed to GitHub
- [ ] Backend files are in `/backend` directory
- [ ] No sensitive data in repository (no .env files with real credentials)
- [ ] Railway configuration files present:
  - [ ] `railway.json`
  - [ ] `nixpacks.toml`
  - [ ] `Dockerfile` (alternative)
  - [ ] `.dockerignore`

### Environment Configuration
- [ ] `.env.example` file is complete
- [ ] All required environment variables documented
- [ ] Frontend URL correctly set: `https://prolinq-git-main-mikomborero-kanyokas-projects.vercel.app`

### Dependencies
- [ ] `requirements.txt` is up to date
- [ ] All dependencies are production-ready
- [ ] No development-only dependencies in production

### Database
- [ ] Database models are up to date
- [ ] SQLAlchemy models are properly defined
- [ ] Database initialization script works

### Security
- [ ] JWT secret key is configured
- [ ] CORS settings are production-ready
- [ ] Admin user creation script is ready

## 🚀 Deployment Steps

### 1. Railway Setup
- [ ] Create Railway account
- [ ] Connect GitHub repository
- [ ] Select backend directory as root

### 2. Database Setup
- [ ] Add PostgreSQL service
- [ ] Get DATABASE_URL from Railway
- [ ] Add DATABASE_URL to environment variables

### 3. Environment Variables
Set these in Railway dashboard:

```bash
# Required
DATABASE_URL=postgresql://...
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
FRONTEND_URL=https://prolinq-git-main-mikomborero-kanyokas-projects.vercel.app
ENVIRONMENT=production

# Optional (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 4. Deploy
- [ ] Click "Deploy Now" or use `railway up`
- [ ] Monitor build logs
- [ ] Check deployment logs for errors

## ✅ Post-Deployment Verification

### Health Checks
- [ ] Visit `https://your-app.railway.app/health` → Should return `{"status": "ok"}`
- [ ] Visit `https://your-app.railway.app/docs` → API documentation should load
- [ ] Check logs for any errors

### Database Verification
- [ ] Tables created successfully
- [ ] Default admin user created (email: admin@prolinq.com, password: admin123)
- [ ] Database connection is stable

### API Testing
- [ ] Test authentication endpoints
- [ ] Test job listings
- [ ] Test user registration
- [ ] Test file uploads

### Frontend Integration
- [ ] Update frontend API URL to point to Railway backend
- [ ] Test frontend-backend communication
- [ ] Verify CORS is working correctly

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check requirements.txt for syntax errors
   - Verify Python version compatibility
   - Check for missing dependencies

2. **Database Connection**
   - Verify DATABASE_URL format
   - Check PostgreSQL service status
   - Ensure database is accessible

3. **CORS Issues**
   - Verify FRONTEND_URL environment variable
   - Check that frontend URL is exactly correct
   - Ensure no trailing slashes

4. **Socket.IO Issues**
   - Check that start command uses `socket_app`
   - Verify port configuration
   - Check WebSocket connection in browser

### Debug Commands
```bash
# View logs
railway logs

# Open shell
railway open shell

# Check environment variables
railway variables

# Restart service
railway restart
```

## 📋 Production Considerations

### Security
- [ ] Change default admin password immediately
- [ ] Use strong JWT secret key
- [ ] Enable HTTPS (Railway does this automatically)
- [ ] Regularly update dependencies

### Performance
- [ ] Monitor application performance
- [ ] Set up database backups
- [ ] Configure monitoring alerts
- [ ] Optimize database queries if needed

### Maintenance
- [ ] Set up log monitoring
- [ ] Configure error tracking
- [ ] Plan regular updates
- [ ] Document any custom configurations

## 🎯 Success Criteria

Your deployment is successful when:

- [ ] Health check returns `{"status": "ok"}`
- [ ] API documentation is accessible
- [ ] Frontend can communicate with backend
- [ ] Users can register and login
- [ ] Jobs can be created and viewed
- [ ] File uploads work correctly
- [ ] No critical errors in logs
- [ ] CORS is properly configured

## 📞 Support Resources

- [Railway Documentation](https://docs.railway.app/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Railway Discord Community](https://discord.gg/railway)
- [GitHub Issues](https://github.com/railwayapp/railway/issues)

## 🔄 Next Steps

After successful deployment:

1. **Monitor**: Keep an eye on application performance and errors
2. **Update Frontend**: Point frontend to the new Railway backend URL
3. **Test**: Thoroughly test all functionality
4. **Backup**: Ensure database backups are configured
5. **Scale**: Monitor and scale as needed

---

**Remember**: Railway automatically provides HTTPS and handles SSL certificates. Your application will be accessible at `https://your-app-name.railway.app`.
