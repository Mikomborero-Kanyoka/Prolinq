# Quick Start: Daily Job Recommendations & Deletable Notifications

## 🎯 What You Get

✅ **Notifications are deletable** - Already working  
✅ **Daily job recommendations** - New feature, auto-runs at 9 AM UTC daily  
✅ **Manual testing endpoint** - Test without waiting for 9 AM

---

## ⚡ 3-Minute Setup

### Step 1: Install APScheduler
```bash
cd c:\Users\Querllett\Desktop\Prolinq3.0\backend
pip install APScheduler
```

Or install all requirements:
```bash
pip install -r requirements.txt
```

### Step 2: Restart Backend
```bash
python main.py
```

You should see this in logs:
```
🚀 Starting background scheduler...
✅ Background scheduler started successfully
📅 Scheduled: Daily job recommendations at 09:00 UTC
```

### Step 3: Done! ✅

The system is now running. Every day at **9:00 AM UTC**, all active users automatically receive up to 5 job recommendations.

---

## 🧪 Test It Right Now

### Option A: Manual Trigger (Recommended for Testing)

```bash
curl -X POST http://localhost:8001/api/recommendations/trigger-daily \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

Response:
```json
{
  "success": true,
  "recommendations_generated": 5,
  "new_notifications_created": 3,
  "recommendations": [...]
}
```

### Option B: In Frontend (React/Vue)

```javascript
// Test daily recommendations
async function testDailyRecommendations(token) {
  const response = await fetch('/api/recommendations/trigger-daily', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  console.log('Recommendations generated:', data.recommendations_generated);
  return data;
}

// Test notification deletion
async function deleteNotification(notificationId, token) {
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}

// Get all notifications
async function getNotifications(token) {
  const response = await fetch('/api/notifications/', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}
```

---

## 📝 API Reference

### Notifications (Deletable)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/notifications/` | GET | Get all notifications |
| `/api/notifications/{id}` | DELETE | **Delete a notification** ✨ |
| `/api/notifications/{id}/read` | PUT | Mark as read |
| `/api/notifications/mark-all-read` | PUT | Mark all as read |
| `/api/notifications/unread/count` | GET | Get unread count |

### Job Recommendations

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/recommendations/daily` | GET | Get today's recommendations |
| `/api/recommendations/trigger-daily` | POST | **Manual test trigger** ✨ |
| `/api/recommendations/refresh` | POST | Force refresh |
| `/api/recommendations/active` | GET | Get active (unread) only |

---

## 📊 How It Works

### Daily Automatic Process (9 AM UTC)

1. Scheduler wakes up at 9:00 AM UTC
2. Gets all active users with profile embeddings
3. For each user:
   - Calculates AI similarity with all open jobs
   - Filters for matches ≥ 40% similarity
   - Takes top 5 matches
   - Creates notifications
   - Skips if user already has today's recommendations
4. Logs everything with detailed stats

### Notification Deletion

- Users can delete any notification
- Delete is permanent from user's view
- Database keeps soft-delete audit trail
- Frontend shows clean notification list

---

## 🛠️ Files Changed

### New Files
- ✨ `backend/scheduler.py` - Background scheduler logic

### Modified Files
- 📝 `backend/main.py` - Added startup/shutdown events
- 📝 `backend/routes/job_recommendations.py` - Added manual trigger endpoint
- 📝 `backend/requirements.txt` - Added APScheduler

### Unchanged (Already Working)
- ✅ `backend/routes/notifications.py` - Delete endpoint already exists
- ✅ `backend/models.py` - No changes needed
- ✅ `backend/database.py` - No changes needed

---

## ⚙️ Configuration

### Change Schedule Time

Edit `backend/scheduler.py`, find this line:

```python
scheduler.add_job(
    generate_daily_recommendations,
    CronTrigger(hour=9, minute=0, second=0),  # ← Change here
    ...
)
```

Examples:
- **8 AM UTC**: `CronTrigger(hour=8, minute=0, second=0)`
- **6 PM UTC**: `CronTrigger(hour=18, minute=0, second=0)`
- **Twice daily (9 AM & 6 PM)**: `CronTrigger(hour=[9, 18], minute=0, second=0)`

### Change Match Threshold

Edit `backend/scheduler.py`:

```python
if similarity >= 0.4:  # ← Change from 0.4
    matches.append({...})
```

Values:
- `0.4` = 40% match (current)
- `0.5` = 50% match
- `0.7` = 70% match (stricter)

### Change Recommendations Count

Edit `backend/scheduler.py`:

```python
matches = matches[:5]  # ← Change from 5
```

---

## 🔍 Verify It's Working

### Check Scheduler Started
```
Look for these logs on startup:
✅ Background scheduler started successfully
📅 Scheduled: Daily job recommendations at 09:00 UTC
```

### Check Recommendations Generated
```
Look at logs at 9 AM UTC:
🌅 Starting daily job recommendations generation...
🎯 Processing recommendations for user 1 (john_doe)
✨ Creating 5 recommendation notifications
🎉 Daily recommendations generation complete! Created 23 total recommendations
```

### Check Deletion Works
```bash
# Get notifications (should see the notification)
curl http://localhost:8001/api/notifications/ \
  -H "Authorization: Bearer TOKEN"

# Delete one (note the ID from above)
curl -X DELETE http://localhost:8001/api/notifications/123 \
  -H "Authorization: Bearer TOKEN"

# Get notifications again (should be gone)
curl http://localhost:8001/api/notifications/ \
  -H "Authorization: Bearer TOKEN"
```

---

## 🎨 Frontend Implementation

### Show Notifications with Delete Button

```jsx
import React, { useState, useEffect } from 'react';

function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setNotifications(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Remove from list
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Update in list
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="notifications-panel">
      <h2>Notifications ({notifications.length})</h2>
      
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul>
          {notifications.map(notif => (
            <li key={notif.id} className={notif.is_read ? 'read' : 'unread'}>
              <div className="notification-content">
                <h4>{notif.title}</h4>
                <p>{notif.message}</p>
                {notif.type === 'job_recommendation' && notif.data && (
                  <small>
                    Match: {JSON.parse(notif.data).match_percentage}%
                  </small>
                )}
              </div>
              
              <div className="notification-actions">
                {!notif.is_read && (
                  <button onClick={() => markAsRead(notif.id)}>
                    Mark Read
                  </button>
                )}
                <button onClick={() => deleteNotification(notif.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificationsPanel;
```

---

## 📱 Testing Checklist

- [ ] Backend starts without errors
- [ ] Scheduler logs appear on startup
- [ ] Manual trigger endpoint works
- [ ] Notifications appear in GET request
- [ ] Delete request removes notification
- [ ] Mark as read works
- [ ] Unread count is accurate
- [ ] Test with different users
- [ ] Verify recommendations have 40%+ match scores
- [ ] Check logs for any errors

---

## 🚨 Troubleshooting

### Issue: "APScheduler not found"
**Solution**: `pip install APScheduler`

### Issue: No recommendations generated
**Solution**: 
- Check if users have profile embeddings
- Check if jobs have job embeddings
- Verify job status is "open"
- Use manual trigger endpoint to debug

### Issue: "Notification not found" on delete
**Solution**: 
- Verify notification ID is correct
- Check if notification belongs to current user
- Make sure you're using correct token

### Issue: Scheduler not showing in logs
**Solution**:
- Check if running in reload mode (might restart constantly)
- Verify APScheduler is installed
- Check for startup errors in logs

---

## 📚 Full Documentation

For more details, see:
- `DAILY_RECOMMENDATIONS_GUIDE.md` - Complete guide with all features
- `DAILY_RECOMMENDATIONS_SUMMARY.md` - Implementation summary

---

## ✅ You're All Set!

Everything is ready to use. The system will:

1. **Automatically send daily recommendations** at 9:00 AM UTC to all users
2. **Allow users to delete notifications** anytime
3. **Provide a manual testing endpoint** for development

Enjoy! 🎉