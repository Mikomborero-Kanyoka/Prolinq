# Job Recommendations System Guide

## Overview

The job recommendations system provides daily, personalized job suggestions to talent based on their skills and profile. Recommendations are created as notifications and automatically refresh daily with smart caching.

## Key Features

✨ **Daily Refreshing**: Recommendations are generated/refreshed daily for each user
🎯 **Smart Matching**: Uses AI embeddings to match job requirements with user skills (40%+ similarity threshold)
📱 **Notification-Based**: Recommendations appear as notifications in the user's notification feed
🔄 **Automatic Cleanup**: Old recommendations are archived when new ones are generated
🗑️ **Auto-Removal**: Recommendations are automatically removed if:
   - The job is deleted
   - The job status changes from "open" to something else
   - The job deadline passes
   - The job is marked as taken/completed

## API Endpoints

### 1. Get Daily Recommendations
**Endpoint**: `GET /api/recommendations/daily`
**Authentication**: Required (logged-in user)
**Description**: Gets daily job recommendations for the current user. Automatically refreshes if not done today.

**Query Parameters**:
- `limit` (optional, default: 10, max: 50): Number of recommendations to return

**Response**:
```json
{
  "success": true,
  "user_id": 1,
  "recommendations": [
    {
      "job_id": 42,
      "title": "React Developer",
      "description": "Looking for experienced React developer...",
      "company": "Tech Corp",
      "location": "Remote",
      "job_type": "full_time",
      "category": "Development",
      "budget": 5000,
      "budget_min": 4000,
      "budget_max": 6000,
      "budget_currency": "USD",
      "similarity_score": 0.876,
      "match_percentage": 88
    }
  ],
  "total_recommendations": 5,
  "from_cache": false,
  "generated_today": "2024-01-15T08:30:00"
}
```

### 2. Force Refresh Recommendations
**Endpoint**: `POST /api/recommendations/refresh`
**Authentication**: Required
**Description**: Force refresh recommendations regardless of date. Useful for manual refresh or testing.

**Response**:
```json
{
  "success": true,
  "message": "Recommendations refreshed",
  "previous_count": 8,
  "new_count": 10,
  "timestamp": "2024-01-15T08:35:00"
}
```

### 3. Get Active Recommendations
**Endpoint**: `GET /api/recommendations/active`
**Authentication**: Required
**Description**: Get all active (unread) recommendations for the user. Automatically cleans up recommendations for expired/deleted/taken jobs.

**Response**:
```json
{
  "success": true,
  "recommendations": [
    {
      "notification_id": 123,
      "job_id": 42,
      "job_title": "React Developer",
      "match_percentage": 88,
      "match_score": 0.876,
      "created_at": "2024-01-15T08:30:00",
      "job_deadline": "2024-02-15T23:59:59"
    }
  ],
  "total_active": 5,
  "cleaned_up": 2
}
```

### 4. Cleanup Expired Recommendations
**Endpoint**: `POST /api/recommendations/cleanup-expired`
**Authentication**: Required
**Description**: Manually trigger cleanup of recommendations for expired or deleted jobs.

**Response**:
```json
{
  "success": true,
  "cleaned_count": 3,
  "timestamp": "2024-01-15T08:40:00"
}
```

## How the Daily Refresh Works

### First Call of the Day
1. User calls `GET /api/recommendations/daily`
2. System checks if recommendations were created today
3. If NOT found today:
   - Gets all open jobs with embeddings
   - Compares against user's profile embedding
   - Filters jobs with 40%+ similarity score
   - Creates notifications for new recommendations
   - Returns the recommendations

### Subsequent Calls
1. User calls `GET /api/recommendations/daily` again
2. System checks if recommendations exist from today
3. If FOUND today:
   - Returns cached recommendations
   - No new notifications created
   - `from_cache: true` in response

### Next Day
1. All previous recommendations from yesterday are still visible (unread)
2. User calls `GET /api/recommendations/daily` 
3. System generates NEW recommendations for today
4. Compares with yesterday's recommendations:
   - **If job lists CHANGED**: Old different jobs are marked as read (archived), new jobs get notifications
   - **If job lists SAME**: No changes, keeps all active recommendations
5. Returns new day's recommendations

## Automatic Cleanup Scenarios

### Scenario 1: Job Deleted
When a job is deleted via `DELETE /api/jobs/{job_id}`:
- System finds all recommendation notifications for that job
- Deletes those notifications
- User no longer sees that recommendation

### Scenario 2: Job Status Changed
When a job status changes via `PUT /api/jobs/{job_id}` from "open" to something else:
- System finds all recommendations for that job
- Removes them from notifications
- Marks as complete/closed status

### Scenario 3: Job Deadline Passed
When calling `GET /api/recommendations/active`:
- System checks each recommendation's job deadline
- If deadline < now, removes the recommendation
- Cleanup happens automatically

### Scenario 4: Job Taken/Completed
When a job is accepted and marked complete:
- Recommendations are automatically removed
- Users only see active opportunities

## Frontend Integration

### Display Recommendations
```javascript
// Get daily recommendations
const response = await fetch('/api/recommendations/daily', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();

// Show in UI
data.recommendations.forEach(job => {
  console.log(`${job.title} - ${job.match_percentage}% match`);
});
```

### Check Active Recommendations
```javascript
// Get active recommendations (auto-cleans expired)
const active = await fetch('/api/recommendations/active', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const result = await active.json();
console.log(`${result.total_active} active recommendations`);
console.log(`Cleaned up ${result.cleaned_up} expired`);
```

### Manual Refresh
```javascript
// Force refresh (e.g., when user clicks "Refresh" button)
const refresh = await fetch('/api/recommendations/refresh', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
const result = await refresh.json();
console.log(`Updated from ${result.previous_count} to ${result.new_count}`);
```

## Important Notes

### Matching Threshold
- Only jobs with **40%+ similarity score** appear as recommendations
- This threshold ensures quality matches based on user skills
- Adjustable in `job_recommendations.py` line 112

### Daily Cache
- Recommendations are cached by **date** (00:00 - 23:59 UTC)
- Midnight UTC triggers a new recommendation generation
- Recommendations from previous days remain visible until marked as read

### Notification Behavior
- ✅ Unread recommendations are "active"
- ✅ Archived/marked-read recommendations are kept for history
- ✅ Deleted job recommendations are fully removed

### User Profile Embedding
- **Required**: User must have a profile embedding to get recommendations
- **Generated**: Created via `POST /api/skills-matching/embed-user-db/{user_id}`
- **Updated**: Refreshed when user updates their profile

## Database Schema

### Notification Table (Extended for Recommendations)
```sql
-- Existing columns
id (Primary Key)
user_id (Foreign Key -> users.id)
title (String) -- "🎯 Recommended Job Match"
message (Text) -- "We found a job that matches..."
type (String) -- "job_recommendation"
is_read (Boolean) -- False = active, True = archived
data (JSON Text) -- Contains job_id, match_score, etc.
created_at (DateTime) -- When notification created
updated_at (DateTime) -- Last updated

-- Example data field for job_recommendation:
{
  "job_id": 42,
  "job_title": "React Developer",
  "match_score": 0.876,
  "match_percentage": 88
}
```

## Performance Considerations

### Query Optimization
- Filters jobs by `status = "open"` and valid deadline
- Only processes jobs with embeddings
- Uses in-memory sorting for match scores

### Scalability
- Recommendations generated on-demand (not in background)
- Caching by date reduces repeated calculations
- Cleanup happens during active requests

## Troubleshooting

### No Recommendations Appearing
1. Check if user has profile embedding:
   - `GET /api/users/me` -> check `profile_embedding` field
   - If null, generate: `POST /api/skills-matching/embed-user-db/{user_id}`

2. Check if jobs have embeddings:
   - Jobs need `job_embedding` to be matched
   - Generated via `POST /api/skills-matching/embed-job-db/{job_id}`

3. Check similarity threshold:
   - Default is 40%, may need to lower for more results
   - See line 112 in `job_recommendations.py`

### Recommendations Disappearing
1. Check if job was deleted or status changed
2. Check if job deadline passed
3. Call `GET /api/recommendations/active` to auto-cleanup
4. Old recommendations may be marked as read - check is_read flag

### Old Recommendations Still Showing
- This is intentional! Keep showing until:
  - User marks notification as read
  - Job is deleted/completed
  - Job status changes to "closed"
  - Job deadline passes

## Configuration

### Adjust Similarity Threshold
Edit `backend/routes/job_recommendations.py`, line 112:
```python
# Only include matches above 40% threshold
if similarity >= 0.4:  # Change 0.4 to desired value (0.0-1.0)
```

### Adjust Top K Results
Modify `limit` parameter in endpoint calls or default in code:
```python
limit: int = Query(10, ge=1, le=50)  # Change 10 to desired default
```

## Future Enhancements

🚀 Potential improvements:
- Bulk recommendation email digests (daily/weekly)
- User preference settings (job types, locations, etc.)
- Recommendation dismissal ("Not interested in this job")
- Recommendation analytics ("Jobs recommended" vs "Applied" rate)
- Predictive ranking (jobs user is most likely to apply for)
- Skill gap analysis ("Learn X to match more jobs")

## Summary

The job recommendations system provides:
- ✅ Daily personalized job suggestions
- ✅ Automatic refresh with smart caching
- ✅ Notification-based delivery
- ✅ Automatic cleanup for expired/deleted jobs
- ✅ Keeps available opportunities until job is taken/deleted
- ✅ Simple, intuitive API endpoints
- ✅ Production-ready implementation