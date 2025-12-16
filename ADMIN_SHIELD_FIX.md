# Admin Shield Fix Guide

## Problem Description
The admin Shield icon is not rendering in the Navbar even when the user is an admin. The console shows:
```
❌ NOT rendering Shield - isAdmin is FALSE, isAuthenticated: true
```

## Root Cause
This issue occurs when:
1. The user's localStorage contains stale user data that doesn't have `is_admin: true`
2. The user was promoted to admin after they last logged in
3. The browser cache has old authentication data

## Solutions Implemented

### 1. Automatic Refresh on App Load
The AuthContext now automatically refreshes user data from the server when the app loads, ensuring the latest admin status is fetched.

### 2. Manual Refresh Button
A "Refresh Admin" button appears in the navbar when a user is authenticated but not detected as admin. Clicking this will:
- Fetch fresh user data from the server
- Update localStorage with the correct admin status
- Show the Shield icon if the user is actually an admin

### 3. Debug Utilities
New utilities are available in the browser console:

#### `window.debugAdminStatus()`
Shows current authentication status and admin information from localStorage.

#### `window.fixAdminStatus()`
Clears all authentication cache and redirects to login page for a fresh start.

## How to Fix the Issue

### Option 1: Use the Refresh Button (Recommended)
1. Log in as admin (admin@prolinq.com / admin123)
2. Look for the orange "Refresh Admin" button in the navbar
3. Click it to refresh your admin status
4. The Shield icon should appear

### Option 2: Use Console Commands
1. Open browser developer tools (F12)
2. Go to Console tab
3. Type: `window.debugAdminStatus()` to check current status
4. Type: `window.fixAdminStatus()` to clear cache and re-login

### Option 3: Clear Browser Storage
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Clear LocalStorage for the site
4. Log in again as admin

## Technical Details

### Backend Verification
The database correctly shows the admin user:
```sql
SELECT email, is_admin FROM users WHERE email = 'admin@prolinq.com';
-- Result: ('admin@prolinq.com', 1)
```

### API Endpoints
- `GET /api/users/me/profile` - Returns current user with admin status
- `POST /api/auth/login` - Returns user data with admin field

### Frontend Changes
1. **AuthContext**: Added `refreshUser()` function and automatic refresh on mount
2. **Navbar**: Added refresh button for non-admin authenticated users
3. **API Service**: Added `getProfile()` method
4. **Utils**: Created admin fix utilities

## Prevention
To prevent this issue in the future:
- The app now automatically refreshes user data on load
- Admin status is always fetched from the server, not just localStorage
- Debug tools are available for troubleshooting

## Testing
1. Log in as admin user
2. Verify Shield icon appears in navbar
3. If not, click "Refresh Admin" button
4. Shield should appear and admin panel should be accessible at `/admin`

## Additional Issue Fixed: Admin Dashboard API 404 Error

### Problem
After fixing admin shield, admin dashboard showed:
```
GET http://localhost:8001/api/admin/dashboard/stats 404 (Not Found)
```

### Root Cause
1. Frontend was configured to use port 8000, but backend runs on port 8001
2. Admin API endpoints weren't properly defined in frontend API service

### Solution Applied
1. **Updated API URL**: Changed from `http://localhost:8000/api` to `http://localhost:8001/api`
2. **Added Admin API Methods**: Created comprehensive `adminAPI` object with all admin endpoints:
   - `getDashboardStats()` - Fetch dashboard statistics
   - `getUsers(params)` - Fetch users with filters
   - `getJobs(params)` - Fetch jobs with filters
   - `getApplications(params)` - Fetch applications with filters
   - `getReviews(params)` - Fetch reviews with filters
   - `toggleUserStatus(userId)` - Toggle user active status
   - `toggleUserVerification(userId)` - Toggle user verification
   - `toggleUserAdmin(userId)` - Toggle user admin privileges
   - `deleteJob(jobId)` - Delete a job
   - `deleteReview(reviewId)` - Delete a review
   - `getSystemHealth()` - Get system health information

3. **Updated AdminDashboard**: Modified to use new `adminAPI` methods instead of direct `api` calls

## Files Modified
- `frontend/src/contexts/AuthContext.jsx` - Added refresh functionality
- `frontend/src/components/Navbar.jsx` - Added refresh button
- `frontend/src/services/api.js` - Added getProfile method and adminAPI endpoints, updated API URL to port 8001
- `frontend/src/utils/adminFix.js` - Added debug utilities
- `frontend/src/App.jsx` - Imported admin fix utilities
- `frontend/src/pages/AdminDashboard.jsx` - Updated to use adminAPI methods
