# Postman API Testing Guide - Email Recommendations

## 🎯 Quick Setup

### 1. Set Base URL
In Postman, set a variable:
```
Variable: base_url
Value: http://localhost:8000
```

Or just use `http://localhost:8000` directly in URLs.

### 2. Get Your Admin Token
```
1. Login as admin via frontend
2. Open DevTools (F12)
3. Go to Application > Local Storage
4. Find "token" or "auth_token"
5. Copy the value
```

---

## 📋 API Endpoints to Test

### Endpoint 1: Preview Email Template

**Purpose:** See what the styled email looks like

**Setup:**
```
Method: POST
URL: http://localhost:8000/api/email/preview/daily-recommendations
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
Body: (empty - no body needed)
```

**Expected Response (200 OK):**
```json
{
  "type": "daily_recommendations",
  "subject": "🔥 Your Daily Job Recommendations - Personalized For You",
  "text_content": "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🔥 YOUR PERSONALIZED JOB RECOMMENDATIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nHi [Admin Name]!\n\nGreat news! We found X perfect opportunities...",
  "preview_name": "Daily Job Recommendations",
  "jobs_count": 3,
  "includes_ad": true
}
```

**✅ What to Check:**
- Subject has emoji
- text_content includes job listings
- includes_ad is true/false based on available ads
- jobs_count shows number of jobs

---

### Endpoint 2: Get List of Registered Users

**Purpose:** See all talent users and pick one to test with

**Setup:**
```
Method: GET
URL: http://localhost:8000/api/email/test-email/users
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
Body: (empty)
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe"
    },
    {
      "id": 2,
      "full_name": "Jane Smith",
      "email": "jane@example.com",
      "username": "janesmith"
    },
    {
      "id": 3,
      "full_name": "Bob Wilson",
      "email": "bob@example.com",
      "username": "bobwilson"
    }
  ],
  "total_users": 3
}
```

**✅ What to Check:**
- Returns at least one user
- Each user has id, full_name, email
- Note the user ID for next step

**💡 Pro Tip:**
Save a user ID as a Postman variable:
```
In Postman: 
Settings > Variables
Add: test_user_id = 1
```

Then use `{{test_user_id}}` in URLs.

---

### Endpoint 3: Send Personalized Email to User

**Purpose:** Queue and send personalized job recommendations + ad to a specific user

**Setup:**
```
Method: POST
URL: http://localhost:8000/api/email/test-email/send-recommendations/1
(Replace "1" with actual user ID)

Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
Body: (empty - no body needed)
```

**If Using Postman Variable:**
```
URL: {{base_url}}/api/email/test-email/send-recommendations/{{test_user_id}}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Personalized recommendation email queued for John Doe",
  "queue_id": 42,
  "recipient": "john@example.com",
  "jobs_included": 5,
  "ad_included": true,
  "ad_title": "Premium Advertising Package",
  "preview": {
    "subject": "🔥 Your Daily Job Recommendations - Personalized For You",
    "snippet": "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🔥 YOUR PERSONALIZED JOB RECOMMENDATIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nHi John Doe!..."
  }
}
```

**✅ What to Check:**
- `success: true`
- `queue_id` is returned (not null)
- `recipient` shows the user's email
- `jobs_included: 5` (or whatever number you have)
- `ad_included: true` (if ads are available)
- `ad_title` shows which ad was selected

**📊 Verify Ad Shuffling:**
Send to 3 different users:
```
User 1: ad_title = "Premium Advertising Package"
User 2: ad_title = "Enterprise Solutions"
User 3: ad_title = "Premium Advertising Package"
```
(Different ads should be randomly distributed)

---

### Endpoint 4: Check Email Queue Status

**Purpose:** See what's queued to send

**Setup:**
```
Method: GET
URL: http://localhost:8000/api/email/queue/status
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
Body: (empty)
```

**Expected Response (200 OK):**
```json
{
  "total_pending": 2,
  "total_sent": 45,
  "total_failed": 1,
  "queue_info": {
    "pending_count": 2,
    "sent_count": 45,
    "failed_count": 1,
    "processing_rate": "~2 emails/second",
    "estimated_time_remaining": "~1 second"
  }
}
```

**✅ What to Check:**
- Your email should appear in `total_pending` count
- It will move to `total_sent` after a few seconds
- `processing_rate` shows how fast emails are sending

---

## 🚀 Complete Testing Workflow

### Step-by-Step Process

#### 1️⃣ Preview the Template
```
POST /api/email/preview/daily-recommendations
```
**Verify:** Email format looks good

#### 2️⃣ Get Users
```
GET /api/email/test-email/users
```
**Verify:** Pick User ID (e.g., 1)

#### 3️⃣ Send Personalized Email
```
POST /api/email/test-email/send-recommendations/1
```
**Verify:** Email queued, note the ad_title

#### 4️⃣ Send to Another User
```
POST /api/email/test-email/send-recommendations/2
```
**Verify:** Different ad_title (if available)

#### 5️⃣ Send to Third User
```
POST /api/email/test-email/send-recommendations/3
```
**Verify:** Ad variety shows shuffling works

#### 6️⃣ Check Queue Status
```
GET /api/email/queue/status
```
**Verify:** All 3 emails are queued

#### 7️⃣ Wait a Few Seconds
**Let the queue processor send them**

#### 8️⃣ Check Status Again
```
GET /api/email/queue/status
```
**Verify:** Emails moved to "sent"

#### 9️⃣ Check Real Emails
**Log into recipient accounts**
- Should receive beautifully formatted emails
- Each should have their own personalized jobs
- Each should have a (possibly different) ad

#### 🔟 Verify Ad Distribution
**Check all 3 emails:**
```
User 1 Email Ad: Premium Advertising Package (impressions: 10 → 11)
User 2 Email Ad: Enterprise Solutions (impressions: 8 → 9)
User 3 Email Ad: Premium Advertising Package (impressions: 11 → 12)
```
**Result:** Fair distribution with randomness

---

## 🎯 Expected Results Table

| Step | Method | URL | Expected Status | Key Indicators |
|------|--------|-----|-----------------|-----------------|
| 1 | POST | `/preview/daily-recommendations` | 200 | subject with emoji, jobs_count > 0 |
| 2 | GET | `/test-email/users` | 200 | users array with 1+ users |
| 3 | POST | `/send-recommendations/1` | 200 | queue_id returned, jobs_included > 0 |
| 4 | POST | `/send-recommendations/2` | 200 | queue_id returned, different ad |
| 5 | POST | `/send-recommendations/3` | 200 | queue_id returned, random ad |
| 6 | GET | `/queue/status` | 200 | total_pending >= 3 |
| 7 | WAIT | — | — | Background processor handles queue |
| 8 | GET | `/queue/status` | 200 | total_sent >= 3 |
| 9 | CHECK | Email inbox | Email received | Content personalized + ad showing |
| 10 | VERIFY | Ad impressions | ✅ Fair | Different ads distributed |

---

## 💡 Postman Tips & Tricks

### Create a Test Collection

**Create New Collection:**
1. Click "New" > "Collection"
2. Name: "Prolinq Email Tests"
3. Add requests:

```
├─ Email Tests
│  ├─ Preview Template (POST)
│  ├─ Get Users (GET)
│  ├─ Send to User 1 (POST)
│  ├─ Send to User 2 (POST)
│  ├─ Send to User 3 (POST)
│  └─ Check Queue (GET)
```

### Set Environment Variables

**Create Environment:**
1. Settings > Environments > New
2. Name: "Prolinq Local"
3. Add variables:

```
base_url = http://localhost:8000
token = YOUR_TOKEN_HERE
user_1_id = 1
user_2_id = 2
user_3_id = 3
```

### Use Pre-request Scripts

**Before sending requests, auto-grab token:**
```javascript
// In Pre-request Script tab:
// This would auto-refresh token if expired
```

### Save Responses as Examples

**Right-click response > Save as Example**

Then share with team members.

---

## 🔍 Debugging Failed Requests

### Error: 403 Forbidden
```
"Only admins can access this"
```
**Solution:** Check token - must be admin user's token

### Error: 404 Not Found
```
"User not found"
```
**Solution:** User ID doesn't exist. Run GET /test-email/users first

### Error: 400 Bad Request
```
"Can only send recommendations to talent users"
```
**Solution:** Selected user is not a talent user (check user_type)

### Error: 400 Bad Request
```
"No open jobs available for recommendations"
```
**Solution:** Create test jobs first. Jobs must have status="open"

### Error: 500 Internal Server Error
```
"Failed to queue email"
```
**Solution:** Check backend logs for actual error

---

## 📊 Monitoring Dashboard Integration

**While testing, keep open in browser:**

1. Admin Dashboard
2. Go to Email Management
3. Watch Queue Status update in real-time
4. See emails move from "pending" to "sent"

---

## ✅ Success Checklist

- ✅ Can preview styled email template
- ✅ Can get list of registered users
- ✅ Can send personalized email to user
- ✅ Email gets queued (queue_id returned)
- ✅ Email eventually sends (status changes)
- ✅ User receives email with their name
- ✅ Email shows real jobs (not mock jobs)
- ✅ Email includes an ad (if available)
- ✅ Different users get different (or same) random ads
- ✅ Ad impressions are tracked

---

**You're all set! Start testing in Postman!** 🚀