# Admin Panel Guide

## Overview

The Prolinq Admin Panel provides comprehensive management capabilities for system administrators to oversee and manage all aspects of the platform.

## Features

### 🎯 Dashboard Overview
- **Real-time Statistics**: View key metrics including total users, jobs, applications, and reviews
- **User Analytics**: Track verified users, admin users, and completed jobs
- **Quick Actions**: Direct access to management sections
- **Activity Monitoring**: Daily message counts and recent registrations

### 👥 User Management
- **User Directory**: Complete list of all platform users
- **Search & Filter**: Find users by name, email, or status
- **Status Control**: Activate/deactivate user accounts
- **Verification Management**: Grant or revoke user verification
- **Admin Privileges**: Promote or demote admin access
- **User Statistics**: View jobs posted and applications submitted per user

### 💼 Job Management
- **Job Oversight**: View all jobs posted on the platform
- **Status Tracking**: Monitor job status (open, in progress, completed, cancelled)
- **Budget Information**: View job budgets and financial details
- **Application Counts**: Track how many applications each job receives
- **Content Moderation**: Remove inappropriate or invalid job postings

### 📄 Application Management
- **Application Tracking**: Monitor all job applications across the platform
- **Status Filtering**: View applications by status (pending, accepted, rejected)
- **Applicant Information**: Access applicant details and proposed prices
- **Job Context**: See which jobs applications are for

### ⭐ Review Management
- **Review Oversight**: View all user reviews and ratings
- **Content Moderation**: Remove inappropriate or fake reviews
- **Rating Analysis**: See star ratings and review content
- **User Feedback**: Monitor review patterns and quality

## Access Requirements

### Admin Account Setup
1. **Default Admin User**:
   - Email: `admin@prolinq.com`
   - Password: `admin123`
   - ⚠️ **Important**: Change this password immediately after first login!

2. **Creating New Admins**:
   - Only existing admins can promote users to admin status
   - Use the User Management section to grant admin privileges
   - Admin privileges should be granted carefully to trusted users only

### Authentication
- **Admin-Only Routes**: All admin routes require admin authentication
- **Role-Based Access**: Non-admin users are automatically redirected
- **Session Security**: Admin sessions are protected with proper authentication

## Navigation

### Main Sections
- **Dashboard**: `/admin` - Overview and statistics
- **Users**: User management and control
- **Jobs**: Job oversight and moderation
- **Applications**: Application tracking and management
- **Reviews**: Review moderation and oversight

### User Interface
- **Tabbed Navigation**: Easy switching between management sections
- **Search Functionality**: Quick access to specific users or jobs
- **Filter Options**: Filter by status, date, or other criteria
- **Responsive Design**: Works on desktop and mobile devices

## Security Features

### Access Control
- **Admin Verification**: Only verified admins can access the panel
- **Route Protection**: All admin routes are protected
- **Session Management**: Secure session handling
- **Automatic Logout**: Sessions expire appropriately

### Data Protection
- **Confirmation Dialogs**: Destructive actions require confirmation
- **Audit Trail**: All admin actions are logged
- **Permission Checks**: Users can only access their authorized sections
- **Error Handling**: Secure error messages without information leakage

## Best Practices

### For Administrators
1. **Regular Monitoring**: Check dashboard statistics regularly
2. **User Verification**: Verify legitimate users and businesses
3. **Content Moderation**: Review and remove inappropriate content
4. **Security First**: Never share admin credentials
5. **Password Security**: Use strong, unique passwords

### For User Management
1. **Fair Treatment**: Apply rules consistently to all users
2. **Clear Communication**: Notify users of account changes
3. **Due Process**: Warn users before account suspension
4. **Documentation**: Keep records of administrative actions

### For Content Moderation
1. **Clear Guidelines**: Follow consistent content policies
2. **Quick Response**: Address reports promptly
3. **Transparency**: Be clear about content removal reasons
4. **Appeals Process**: Allow users to appeal decisions

## Technical Details

### Backend Implementation
- **Admin Routes**: `/admin/*` endpoints with admin authentication
- **Role Checking**: `get_admin_user` dependency for route protection
- **Database Schema**: Added `is_admin` and `is_active` fields to users table
- **API Security**: All admin actions require proper authentication

### Frontend Implementation
- **AdminProtectedRoute**: Custom component for admin-only access
- **Role Context**: Admin status available throughout the app
- **Navigation Integration**: Admin access integrated with main navigation
- **Error Handling**: Proper error states and loading indicators

### Database Changes
- **New Fields**:
  - `is_admin`: Boolean field for admin status
  - `is_active`: Boolean field for account activation
- **Migration**: Applied via Alembic migration `003_add_admin_fields`
- **Default Values**: New users default to non-admin, active status

## Troubleshooting

### Common Issues
1. **Access Denied**: Ensure user has admin privileges
2. **Missing Data**: Check backend connection and API responses
3. **Permission Errors**: Verify admin authentication token
4. **Display Issues**: Check browser compatibility and JavaScript errors

### Support
- **Error Logs**: Check browser console for JavaScript errors
- **Network Issues**: Verify API connectivity and responses
- **Database**: Ensure database migrations are applied
- **Authentication**: Confirm token storage and retrieval

## Development Notes

### File Structure
```
backend/
├── routes/admin.py          # Admin API routes
├── auth.py                  # Admin authentication
├── models.py                 # User model updates
└── migrations/versions/
    └── 003_add_admin_fields.py  # Database migration

frontend/
├── src/
│   ├── pages/AdminDashboard.jsx    # Main admin interface
│   ├── components/AdminProtectedRoute.jsx  # Route protection
│   └── contexts/AuthContext.jsx  # Admin role context
```

### API Endpoints
- `GET /admin/dashboard/stats` - Dashboard statistics
- `GET /admin/users` - User management
- `PUT /admin/users/{id}/toggle-status` - Toggle user status
- `PUT /admin/users/{id}/toggle-verification` - Toggle verification
- `PUT /admin/users/{id}/toggle-admin` - Toggle admin status
- `GET /admin/jobs` - Job management
- `DELETE /admin/jobs/{id}` - Delete job
- `GET /admin/applications` - Application management
- `GET /admin/reviews` - Review management
- `DELETE /admin/reviews/{id}` - Delete review

## Future Enhancements

### Planned Features
- **Advanced Analytics**: More detailed platform insights
- **Bulk Operations**: Mass user/job management
- **Audit Logs**: Complete admin action history
- **Email Notifications**: Automated admin alerts
- **Role Management**: Multiple admin role levels
- **API Rate Limiting**: Protect admin endpoints from abuse

### Scalability
- **Database Optimization**: Indexes for admin queries
- **Caching**: Cache frequently accessed admin data
- **Pagination**: Large dataset handling
- **Background Jobs**: Automated admin tasks

---

**Last Updated**: November 19, 2025
**Version**: 1.0.0
