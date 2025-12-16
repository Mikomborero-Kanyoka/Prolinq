# Job Recommendations Troubleshooting Guide

## Overview
Job recommendations are created when:
1. A user has a **profile embedding** (AI-generated skills profile)
2. There are **open jobs with embeddings**
3. The `/api/recommendations/daily` endpoint is called
4. Jobs match the user's skills above 40% threshold

---

## Issue: Job Recommendations Not Showing in Notifications

### What We Just Fixed (Frontend)
The issue was in how the **frontend** was processing recommendation notifications:

✅ **Before**: Tried to parse `notification.data` incorrectly
✅ **After**: Now properly parses JSON data and extracts job IDs

### Diagnosis Steps

#### 1️⃣ Run the Debug Script
```bash
cd backend
python test_job_recommendation_flow.py
```

This will show you:
- ✅ If user has profile embedding
- ✅ How many open jobs exist
- ✅ How many jobs have embeddings
- ✅ How many recommendations exist in the database
- ✅ Sample recommendation data structure

#### 2️⃣ Check Browser Console
Open your app → Press F12 → Console tab

Look for these logs:
```
✅ Notifications fetched: X
📊 Notification types: [...]
📦 Parsed notification data for job_recommendation: {...}
🔔 Real-time notification received: {...}
```

If you see errors about parsing, that's what we fixed!

#### 3️⃣ Manually Trigger Recommendations
Use this curl command to generate recommendations:

```bash
curl -X GET "http://localhost:8000/api/recommendations/daily?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Possible Issues & Solutions

### Issue A: "No Recommendations in Database"
**Symptoms**: `test_job_recommendation_flow.py` shows 0 total recommendations

**Solutions**:
1. **Trigger the endpoint manually**:
   - Call `/api/recommendations/daily` endpoint
   - This creates notifications for matching jobs

2. **Check if user has embedding**:
   - Run debug script, look for "User HAS profile embedding"
   - If not, generate it: `POST /api/skills-matching/embed-user-db/{user_id}`

3. **Check if jobs have embeddings**:
   - Debug script shows "jobs with embeddings"
   - If 0, generate them with: `POST /api/skills-matching/embed-jobs-db`

---

### Issue B: "User Has No Recommendations"
**Symptoms**: Recommendations exist in DB, but not for this user

**Possible Causes**:
1. ❌ User doesn't have profile embedding
   - Solution: Generate with `/api/skills-matching/embed-user-db/{user_id}`

2. ❌ No matching jobs (< 40% similarity)
   - Solution: Job descriptions and user skills don't match well
   - Try creating a job closely related to user's skills

3. ❌ Jobs don't have embeddings
   - Solution: Generate with `/api/skills-matching/embed-jobs-db`

---

### Issue C: "Recommendations in DB, but Not Showing in Frontend"
**Symptoms**: Debug script shows recommendations, but UI doesn't display

**Causes & Solutions**:

1. **Data not being parsed correctly**
   - ✅ We fixed this! Frontend now properly parses `notification.data`
   - Clear browser cache (Ctrl+Shift+Delete)
   - Refresh the page

2. **Recommendations are marked as "read"**
   - Unread notifications show with blue background
   - Read recommendations might still be visible
   - Check the "is_read" field in debug output

3. **Network request failing**
   - Open DevTools Network tab
   - Look for `/api/notifications` request
   - Check Response tab - should show array of notifications
   - If error, check server logs

4. **Wrong user ID**
   - Make sure you're logged in as the right user
   - Check debug script "Using talent user: ID X"
   - Recommendations are per-user

---

### Issue D: "Frontend Shows Error Parsing Data"
**Symptoms**: Console shows `⚠️ Failed to parse notification data`

**Solutions**:
1. **Data field is malformed JSON**
   - Check backend notification creation code
   - Verify `json.dumps(data)` is called before storing

2. **Data field is null/empty**
   - Some notifications might not have `data` field
   - Frontend now handles this with optional chaining (`?.job_id`)

---

## Complete Workflow Test

To verify everything works end-to-end:

### Step 1: Verify Setup
```bash
# Run debug script
python test_job_recommendation_flow.py
```

Expected output:
```
✅ Found X users
✅ User HAS profile embedding
✅ Found X open jobs
✅ X/Y jobs have embeddings
✅ Total job_recommendation notifications: X
```

### Step 2: Trigger Recommendations
Visit in browser:
```
http://localhost:3000/api/recommendations/daily
```

Or use test script:
```bash
python test_job_recommendations.py
```

### Step 3: Check Notifications Page
1. Go to Notifications page
2. Look for "🎯 Recommended Job Match" notifications
3. Should show match percentage
4. Click "View Recommended Job →" link

### Step 4: Check Real-Time (Optional)
1. Open DevTools Console (F12)
2. Create a new job or trigger recommendations
3. Should see `🔔 Real-time notification received` log

---

## Data Structure Reference

### Job Recommendation Notification
When created by backend, stored as:

```json
{
  "type": "job_recommendation",
  "title": "🎯 Recommended Job Match",
  "message": "We found a job that matches your skills: \"Senior Developer\" (85% match)",
  "data": {
    "job_id": 5,
    "job_title": "Senior Developer",
    "match_score": 0.85,
    "match_percentage": 85
  }
}
```

### Frontend Processing
Frontend now:
1. Fetches all notifications
2. Parses JSON `data` field into `parsedData`
3. Checks `notification.type === 'job_recommendation'`
4. Extracts `parsedData.job_id` for the link

---

## Common Errors in Browser Console

### ❌ "Cannot read property 'job_id' of undefined"
**Cause**: `notification.data` wasn't parsed to `parsedData`
**Fix**: We fixed this in the latest update!

### ❌ "JSON.parse: unexpected character"
**Cause**: `data` field contains invalid JSON
**Fix**: Check backend `json.dumps()` call

### ❌ "Cannot find a user with the provided email"
**Cause**: Wrong user ID in API request
**Fix**: Verify logged-in user ID

---

## Quick Reference: API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/recommendations/daily` | GET | Get/create daily recommendations |
| `/api/recommendations/refresh` | POST | Force refresh recommendations |
| `/api/recommendations/cleanup-expired` | POST | Remove expired recommendations |
| `/api/notifications` | GET | Get all notifications |
| `/api/notifications/{id}/read` | PUT | Mark as read |

---

## Debugging Checklist

- [ ] Run `python test_job_recommendation_flow.py`
- [ ] Check browser console for errors (F12)
- [ ] Verify user has profile embedding
- [ ] Verify jobs have embeddings
- [ ] Call `/api/recommendations/daily` endpoint
- [ ] Check `/api/notifications` returns data
- [ ] Clear browser cache and refresh
- [ ] Check Firefox DevTools Console for any errors
- [ ] Verify backend server logs show "Notification created"

---

## Backend Logs to Watch For

When recommendations are working, you should see:

```
🎯 Getting daily recommendations for user 1
📌 Found 3 existing recommendations from today
✨ Creating new notifications for jobs: {5, 6, 7}
✅ Notification created (ID: 42, User: 1, Type: job_recommendation)
📢 Broadcasting notification via Socket.IO: {...}
```

If missing, check:
- Is recommendation endpoint being called?
- Does user have embedding? ("User X has no embedding")
- Does user have matching jobs? ("No new recommendations generated")

---

## Still Having Issues?

1. **Check the test script output** first
2. **Look at browser console** (F12)
3. **Check backend server logs** (terminal running `python main.py`)
4. **Verify database** with debug script

The fix we applied ensures:
- ✅ Frontend correctly parses notification data
- ✅ Job IDs are extracted from JSON data field
- ✅ Links to recommended jobs work properly
- ✅ All notification types are supported

**If recommendations still don't show, likely causes:**
1. Recommendations aren't being created (backend issue)
2. User doesn't have profile embedding
3. No matching jobs in system