# Daily Job Recommendations & Notification Deletion Guide

## Overview

This guide explains how the daily job recommendations feature works and how to manage notifications in the Prolinq system.

## ✨ Features Implemented

### 1. **Daily Job Recommendations Notifications** 📅
- Automatically sends job recommendation notifications to all active users **daily at 9:00 AM UTC**
- Uses AI-powered skills matching to find the best 5 jobs for each user
- Only recommends jobs with **40%+ match score** based on user profile embedding
- Prevents duplicate recommendations within the same day
- Smartly archives outdated recommendations when new ones are generated

### 2. **Notification Deletion** 🗑️
- Users can delete any notification they no longer want to see
- Soft deletion via the API (not permanently removed from DB, but hidden from users)
- All notification management endpoints available

---

## 🔧 System Architecture

### Background Scheduler

A new background task scheduler using **APScheduler** has been added:

```
Backend Components:
├── scheduler.py (NEW)
│   ├── Daily recommendation generation task
│   ├── Scheduler initialization & lifecycle management
│   └── Logging for background tasks
│
├── main.py (MODIFIED)
│   ├── Startup event - starts scheduler
│   └── Shutdown event - stops scheduler
│
├── routes/job_recommendations.py (MODIFIED)
│   ├── /api/recommendations/trigger-daily (NEW - manual testing endpoint)
│   └── Existing endpoints enhanced
│
└── requirements.txt (MODIFIED)
    └── Added: APScheduler
```

### Key Files

1. **`backend/scheduler.py`** (NEW)
   - Defines the daily recommendation generation logic
   - Manages scheduler startup/shutdown
   - Implements the `generate_daily_recommendations()` async function

2. **`backend/main.py`** (MODIFIED)
   - Added startup event to initialize scheduler
   - Added shutdown event to cleanup scheduler
   - Imports scheduler functions

3. **`backend/routes/job_recommendations.py`** (MODIFIED)
   - New endpoint: `POST /api/recommendations/trigger-daily` for manual testing

4. **`backend/requirements.txt`** (MODIFIED)
   - Added `APScheduler` dependency

---

## 📋 API Endpoints

### Notification Management

#### Get All Notifications
```
GET /api/notifications/
Authorization: Bearer {token}

Response:
{
  "id": 123,
  "user_id": 1,
  "title": "🎯 Recommended Job Match",
  "message": "We found a job that matches your skills: \"Senior Developer\" (85% match)",
  "type": "job_recommendation",
  "is_read": false,
  "data": {
    "job_id": 456,
    "job_title": "Senior Developer",
    "match_score": 0.85,
    "match_percentage": 85
  },
  "created_at": "2024-01-15T09:00:00",
  "updated_at": "2024-01-15T09:00:00"
}
```

#### Delete a Notification ✅
```
DELETE /api/notifications/{notification_id}
Authorization: Bearer {token}

Response:
{
  "message": "Notification deleted"
}
```

#### Mark Notification as Read
```
PUT /api/notifications/{notification_id}/read
Authorization: Bearer {token}

Response:
{
  "message": "Notification marked as read"
}
```

#### Mark All Notifications as Read
```
PUT /api/notifications/mark-all-read
Authorization: Bearer {token}

Response:
{
  "message": "All notifications marked as read"
}
```

#### Get Unread Count
```
GET /api/notifications/unread/count
Authorization: Bearer {token}

Response:
{
  "count": 5
}
```

### Job Recommendations

#### Get Daily Recommendations
```
GET /api/recommendations/daily?limit=10
Authorization: Bearer {token}

Response:
{
  "success": true,
  "user_id": 1,
  "recommendations": [
    {
      "job_id": 456,
      "title": "Senior Developer",
      "description": "We're looking for a senior developer...",
      "company": "Tech Company Inc",
      "location": "Remote",
      "job_type": "full_time",
      "category": "Software Development",
      "budget": 150000,
      "budget_min": 120000,
      "budget_max": 180000,
      "budget_currency": "USD",
      "similarity_score": 0.85,
      "match_percentage": 85
    }
  ],
  "total_recommendations": 1,
  "from_cache": false,
  "generated_today": "2024-01-15T09:00:00"
}
```

#### Manual Trigger Daily Recommendations (Testing)
```
POST /api/recommendations/trigger-daily
Authorization: Bearer {token}

Response:
{
  "success": true,
  "user_id": 1,
  "recommendations_generated": 5,
  "new_notifications_created": 3,
  "existing_notifications_today": 0,
  "recommendations": [...],
  "timestamp": "2024-01-15T15:30:45"
}
```

#### Force Refresh Recommendations
```
POST /api/recommendations/refresh
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Recommendations refreshed",
  "previous_count": 5,
  "new_count": 5,
  "timestamp": "2024-01-15T15:30:45"
}
```

#### Clean Up Expired Recommendations
```
POST /api/recommendations/cleanup-expired
Authorization: Bearer {token}

Response:
{
  "success": true,
  "cleaned_count": 2,
  "timestamp": "2024-01-15T15:30:45"
}
```

---

## 🎯 How Daily Recommendations Work

### Automated Daily Generation (9:00 AM UTC)

1. **Scheduler Trigger**: APScheduler wakes up at 9:00 AM UTC
2. **User Selection**: Gets all active users with valid profile embeddings
3. **For Each User**:
   - Checks if user already has unread recommendations from today
   - Skips users who already received today's recommendations
   - Gets user's profile embedding (AI representation of skills)
4. **Job Matching**:
   - Retrieves all open, non-expired jobs with embeddings
   - Calculates similarity score between user profile and each job
   - Filters for matches with ≥40% similarity threshold
   - Sorts by match score (highest first)
   - Takes top 5 recommendations
5. **Notification Creation**:
   - For each new recommendation, creates a notification
   - Stores job ID, match score, and job title in notification data
   - Old recommendations are automatically archived (marked as read)
6. **Logging**: All actions logged with emoji indicators for easy monitoring

### Manual Trigger (for Testing)

Use the `/api/recommendations/trigger-daily` endpoint to manually generate recommendations:

```bash
curl -X POST http://localhost:8001/api/recommendations/trigger-daily \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json"
```

---

## 🗑️ Notification Deletion Features

### What Users Can Delete
- ✅ All notification types (job_recommendation, job_application, messages, etc.)
- ✅ Individual notifications
- ✅ Archive notifications by marking as read

### How Notifications Persist

Notifications follow a soft-delete pattern:
1. **User deletes notification** → Record remains in DB but is inaccessible to user
2. **Prevents data loss** while keeping audit trail
3. **User sees clean notification list** without deleted items

### Smart Cleanup

Outdated recommendations are automatically cleaned when:
- Job is deleted from the system
- Job status changes to "closed" or "completed"
- Job deadline has passed
- New daily recommendations are generated (old ones marked as read)

---

## ⚙️ Configuration

### Scheduler Timing

**Current Schedule**: 9:00 AM UTC daily

To change the time, edit `backend/scheduler.py`:

```python
# In start_scheduler() function
scheduler.add_job(
    generate_daily_recommendations,
    CronTrigger(hour=9, minute=0, second=0),  # ← Change these values
    id='daily_recommendations',
    name='Generate daily job recommendations',
    replace_existing=True
)
```

**CronTrigger Format**:
- `hour`: 0-23 (UTC)
- `minute`: 0-59
- `second`: 0-59

Examples:
- Every day at 8:00 AM: `CronTrigger(hour=8, minute=0, second=0)`
- Every day at 6:00 PM: `CronTrigger(hour=18, minute=0, second=0)`
- Multiple times daily: `CronTrigger(hour=[9, 18], minute=0, second=0)`

### Match Score Threshold

Currently set to **40%** (0.4) in `scheduler.py`:

```python
if similarity >= 0.4:  # ← Change this threshold
    matches.append({...})
```

### Top N Recommendations

Currently limited to **5** recommendations per user per day:

```python
matches = matches[:5]  # ← Change to get more/fewer recommendations
```

---

## 📊 Database Changes

The system uses the existing `Notification` table:

```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR DEFAULT 'general',  -- Can be: job_recommendation, job_application, etc.
    is_read BOOLEAN DEFAULT FALSE,
    data TEXT,  -- JSON string with job_id, match_score, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

---

## 🚀 Installation & Setup

### 1. Install APScheduler

```bash
pip install APScheduler
```

Or update your environment:
```bash
pip install -r backend/requirements.txt
```

### 2. Restart the Backend

The scheduler starts automatically when the backend starts:

```bash
python backend/main.py
```

You should see:
```
🚀 Application starting...
🚀 Starting background scheduler...
✅ Background scheduler started successfully
📅 Scheduled: Daily job recommendations at 09:00 UTC
```

### 3. Verify It's Working

- Check logs for scheduler startup messages
- Use the manual trigger endpoint for testing
- Check notifications after 9:00 AM UTC for automatic recommendations

---

## 🧪 Testing

### Quick Test Steps

1. **Create a test user with profile embedding**
2. **Create a few test jobs with embeddings**
3. **Call the manual trigger endpoint**:
   ```bash
   curl -X POST http://localhost:8001/api/recommendations/trigger-daily \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
4. **Check notifications list**:
   ```bash
   curl http://localhost:8001/api/notifications/ \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
5. **Delete a notification**:
   ```bash
   curl -X DELETE http://localhost:8001/api/notifications/123 \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Manual Testing in Frontend

To test deletion in your frontend:

```javascript
// Delete a notification
async function deleteNotification(notificationId) {
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${userToken}`
    }
  });
  return await response.json();
}
```

---

## 📝 Logging

The scheduler logs detailed information with emoji indicators:

```
🌅 Starting daily job recommendations generation...
📋 Found 5 active users to generate recommendations for
🎯 Processing recommendations for user 1 (john_doe)
📌 Found 0 existing recommendations from today, skipping
📌 Found 125 open jobs to match against for user 1
✨ Creating 5 recommendation notifications for user 1
🎉 Daily recommendations generation complete! Created 23 total recommendations
```

**Log Levels**:
- 🌅 - Scheduler start
- 📋 - User processing
- 🎯 - Per-user operations
- 📌 - Database queries
- ✨ - Notifications created
- ⚠️ - Warnings (no embedding, invalid data)
- ❌ - Errors (caught and logged)
- 🎉 - Completion

---

## ✅ Checklist for Implementation

- [x] APScheduler added to requirements.txt
- [x] scheduler.py created with daily task
- [x] main.py updated with startup/shutdown events
- [x] Job recommendations endpoint enhanced with manual trigger
- [x] Notification deletion endpoint functional
- [x] Logging implemented
- [x] Error handling in place
- [x] Documentation complete

---

## 🔍 Troubleshooting

### Scheduler Not Starting
- Check backend logs for startup errors
- Verify APScheduler is installed: `pip list | grep APScheduler`
- Check for port conflicts or other startup errors

### No Recommendations Generated
- Verify users have profile embeddings
- Verify jobs have job embeddings
- Check if users have been skipped (might already have today's recommendations)
- Use manual trigger endpoint to test

### Recommendations Look Wrong
- Check match score threshold in scheduler.py (currently 0.4)
- Verify embeddings are being generated correctly
- Check that jobs are marked as "open" status
- Verify job deadlines haven't passed

### Database Issues
- Ensure notification table exists (created automatically on startup)
- Check database file location (prolinq.db)
- Verify database permissions are correct

---

## 📞 Support

For issues with:
- **Daily scheduling**: Check `scheduler.py` and APScheduler logs
- **Recommendations**: Check embedding quality and match scores
- **Notifications**: Verify API endpoints in `routes/notifications.py`
- **Database**: Check SQLAlchemy models in `models.py`

---

## 🎓 Additional Resources

- [APScheduler Documentation](https://apscheduler.readthedocs.io/)
- [FastAPI Background Tasks](https://fastapi.tiangolo.com/tutorial/background-tasks/)
- [Cron Expression Format](https://en.wikipedia.org/wiki/Cron)