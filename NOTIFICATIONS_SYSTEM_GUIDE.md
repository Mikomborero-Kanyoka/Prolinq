# Notifications System - Complete Guide

## Overview
The notifications system has been rebuilt to work with real user interactions. Notifications are automatically created when specific events occur throughout the application.

## Notification Types & Triggers

### 1. **Job Application** (`job_application`)
- **When**: A user applies for a job
- **Who Gets It**: The job creator/employer
- **Message**: "{Applicant Name} applied to your job: "{Job Title}""
- **Data Included**: 
  - `application_id`
  - `job_id`
  - `applicant_id`
  - `applicant_name`
- **File**: `backend/routes/applications.py`

### 2. **Application Status Update** (`application_update`)
- **When**: Job application status is changed (accepted, rejected, reviewed, shortlisted)
- **Who Gets It**: The applicant
- **Message**: 
  - Accepted: "🎉 Your application has been accepted for "{Job Title}"!"
  - Rejected: "❌ Your application for "{Job Title}" has been rejected."
  - Reviewed: "👀 Your application for "{Job Title}" is being reviewed."
  - Shortlisted: "⭐ Your application for "{Job Title}" has been shortlisted!"
- **Data Included**:
  - `application_id`
  - `job_id`
  - `old_status`
  - `new_status`
- **File**: `backend/routes/applications.py`

### 3. **New Message** (`new_message`)
- **When**: A user sends a message to another user
- **Who Gets It**: The message recipient
- **Message**: 'You have a new message from {Sender Name}: "{Message Preview}""'
- **Data Included**:
  - `message_id`
  - `sender_id`
  - `sender_name`
- **File**: `backend/routes/messages.py`

### 4. **Review Received** (`review_received`)
- **When**: A user receives a review/rating from another user after job completion
- **Who Gets It**: The reviewed/rated user
- **Message**: '{Reviewer Name} left you a {Rating}-star review for "{Job Title}". ⭐⭐⭐...'
- **Data Included**:
  - `review_id`
  - `reviewer_id`
  - `reviewer_name`
  - `job_id`
  - `job_title`
  - `rating`
- **File**: `backend/routes/reviews.py`

### 5. **Job Completed** (`job_completed`)
- **When**: A job is marked as complete by the employer
- **Who Gets It**: The accepted talent/worker
- **Message**: 'The job "{Job Title}" has been marked as complete.'
- **Data Included**:
  - `job_id`
  - `job_title`
  - `recipient_type`
- **File**: `backend/routes/job_completion.py`

### 6. **Job Recommendation** (`job_recommendation`)
- **When**: A job matches a user's skills (when AI matching is implemented)
- **Who Gets It**: Matching user
- **Message**: 'We found a job that matches your skills: "{Job Title}" ({Match Percentage}% match)'
- **Data Included**:
  - `job_id`
  - `job_title`
  - `match_score` (0-1)
  - `match_percentage` (0-100)
- **File**: Can be triggered from skills matching endpoints
- **Status**: Ready to use, needs integration with skills matching API

## Notification Features

### For Users
1. **View Notifications Page**: `/notifications`
   - Shows all notifications sorted by date (newest first)
   - Unread notifications highlighted in primary color
   - Click checkmark to mark as read
   
2. **Mark Notifications**:
   - Mark individual notification as read: `PUT /api/notifications/{id}/read`
   - Mark all as read: `PUT /api/notifications/mark-all-read`
   
3. **Delete Notifications**:
   - Delete single notification: `DELETE /api/notifications/{id}`

4. **Get Unread Count**:
   - Get unread notification count: `GET /api/notifications/unread/count`

### Real-time Updates
- Notifications are created immediately when events occur
- Socket.IO integration for live updates (when available)
- Frontend automatically refreshes notification list on new notification

## API Endpoints

### Fetch Notifications
```
GET /api/notifications/
Authorization: Required
Response: Array of notification objects
```

### Get Unread Count
```
GET /api/notifications/unread/count
Authorization: Required
Response: { "count": number }
```

### Mark Notification as Read
```
PUT /api/notifications/{notification_id}/read
Authorization: Required
Response: { "message": "Notification marked as read" }
```

### Mark All Notifications as Read
```
PUT /api/notifications/mark-all-read
Authorization: Required
Response: { "message": "All notifications marked as read" }
```

### Delete Notification
```
DELETE /api/notifications/{notification_id}
Authorization: Required
Response: { "message": "Notification deleted" }
```

## Database Schema

### Notification Table
```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL (foreign key to users),
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR (notification type),
    is_read BOOLEAN DEFAULT false,
    data TEXT (JSON string for additional data),
    created_at DATETIME,
    updated_at DATETIME
)
```

## Helper Module

A new helper module `notification_helpers.py` provides centralized notification creation functions:

### Available Functions
1. `create_notification()` - Generic notification creation
2. `create_job_application_notification()` - For job applications
3. `create_application_status_notification()` - For application status changes
4. `create_new_message_notification()` - For new messages
5. `create_review_received_notification()` - For reviews
6. `create_job_completion_notification()` - For job completion
7. `create_job_recommendation_notification()` - For job recommendations
8. `create_admin_message_notification()` - For admin messages

### Usage Example
```python
from routes.notification_helpers import create_job_application_notification
from database import SessionLocal

db = SessionLocal()
notification = create_job_application_notification(
    db=db,
    job_creator_id=123,
    applicant_name="John Doe",
    applicant_id=456,
    job_title="Web Developer",
    job_id=789,
    application_id=1011
)
```

## Frontend Components

### Notifications Page
- **Path**: `/frontend/src/pages/Notifications.jsx`
- **Features**:
  - Displays all notifications for current user
  - Unread notifications highlighted
  - Mark as read functionality
  - Real-time updates via Socket.IO
  - Action links for different notification types (view job, reply to message, etc.)

### Notification Badge
- **Location**: Navigation bar/header
- **Shows**: Count of unread notifications
- **Updates**: Real-time with Socket.IO

## Testing the System

### Manual Testing Steps

1. **Test Job Application Notification**:
   - Create a job as User A
   - Apply to the job as User B
   - Check User A's notifications - should see "User B applied to your job"

2. **Test Application Status Update**:
   - From User A, accept the application
   - Check User B's notifications - should see "Your application has been accepted!"

3. **Test Message Notification**:
   - Send a message from User A to User B
   - Check User B's notifications - should see new message

4. **Test Review Notification**:
   - Complete a job
   - Leave a review for the other user
   - Check their notifications - should see review with rating

5. **Test Job Completion**:
   - Mark a job as complete
   - Check the worker's notifications - should see job completion notice

## Troubleshooting

### Notifications Not Appearing
1. Check browser console for errors
2. Verify user is logged in
3. Check backend logs for error messages
4. Ensure notification API endpoint is accessible: `/api/notifications/`

### Unread Count Not Updating
1. Refresh the page
2. Check that `notification-read` event is being dispatched
3. Verify unread count endpoint: `GET /api/notifications/unread/count`

### Real-time Updates Not Working
- Socket.IO might not be connected
- This is optional - notifications still work without it, just need page refresh

## Recent Changes

### Files Modified
1. **backend/routes/notification_helpers.py** (NEW)
   - Centralized notification creation helpers
   
2. **backend/routes/applications.py**
   - Updated to use notification helpers
   
3. **backend/routes/messages.py**
   - Updated to use notification helpers
   
4. **backend/routes/reviews.py**
   - Added notification creation for new reviews (WAS MISSING)
   
5. **backend/routes/job_completion.py**
   - Added notification creation for job completion (WAS MISSING)

## Next Steps / Future Enhancements

1. **Job Recommendations**: Integrate with skills matching to send recommendations
2. **Notification Preferences**: Let users choose which notifications they want
3. **Email Notifications**: Send email summaries of important notifications
4. **Notification Grouping**: Combine similar notifications
5. **Notification Expiry**: Auto-archive old notifications
6. **Analytics**: Track notification engagement

## Support

For questions or issues with the notification system, check:
1. Backend logs: Look for `📢` icon for notification creation logs
2. Frontend console: Check for API errors
3. Database: Verify notifications table has data
4. This guide: Check troubleshooting section