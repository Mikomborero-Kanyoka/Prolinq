# Quick Test Guide - Personalized Email Recommendations

## 🚀 How to Test Everything

### Quick Summary
You now have a **fully styled** email system with:
- ✨ Professional formatting with clear sections
- 📌 5 job recommendations per user
- 💼 Featured ad placement below jobs
- 🎲 Ads randomly shuffled (fair distribution)
- 📊 Automatic impression tracking

---

## 📋 Testing Steps

### Step 1: Preview the Email Format
Visit the admin dashboard and click **"Load Previews"** under Email Management.

You should see:
- ✅ "Daily Job Recommendations" preview
- ✅ Styled format with job listings
- ✅ Ad placement at bottom (if ads are active)
- ✅ No errors

**Expected Output:**
```
Subject: 🔥 Your Daily Job Recommendations - Personalized For You

🔥 YOUR PERSONALIZED JOB RECOMMENDATIONS

Hi [Admin User]!

Great news! We found X perfect opportunities that match your skills...

📌 Job #1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...
```

---

### Step 2: Get List of Test Users
Use Postman or curl to get registered users:

**Postman:**
```
Method: GET
URL: http://localhost:8000/api/email/test-email/users
Headers:
  Authorization: Bearer [YOUR_ADMIN_TOKEN]
```

**cURL:**
```bash
curl -X GET http://localhost:8000/api/email/test-email/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response:**
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
    }
  ],
  "total_users": 2
}
```

**Note:** Copy the user ID you want to test with.

---

### Step 3: Send Personalized Email to User

Replace `{user_id}` with an actual user ID (e.g., `1`):

**Postman:**
```
Method: POST
URL: http://localhost:8000/api/email/test-email/send-recommendations/1
Headers:
  Authorization: Bearer [YOUR_ADMIN_TOKEN]
Body: (leave empty)
```

**cURL:**
```bash
curl -X POST http://localhost:8000/api/email/test-email/send-recommendations/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response:**
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
    "snippet": "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🔥 YOUR PERSONALIZED JOB RECOMMENDATIONS..."
  }
}
```

**✅ Success Indicators:**
- `success: true`
- `queue_id` returned (email was queued)
- `jobs_included: 5` (all 5 jobs found)
- `ad_included: true` (ad was selected and shuffled)
- Recipient email shown

---

### Step 4: Monitor Email Queue

**Via Admin Dashboard:**
1. Go to Admin Dashboard
2. Navigate to **Email Management**
3. Check **Queue Status** tab
4. Should see your queued email with status "pending"

**Via API:**
```bash
curl -X GET http://localhost:8000/api/email/queue/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### Step 5: Check Email Was Sent

**Option A: Check Recipient's Email**
- Log in as the test user
- Check their email inbox
- Email should arrive within a few seconds (depends on queue throttle settings)
- Should be from: `kanyokamikomborero1@gmail.com`

**Option B: Check Queue History**
```bash
curl -X GET http://localhost:8000/api/email/queue/history \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🎯 What to Verify

### Email Content Checklist

When the email arrives, verify:

- ✅ **Subject** contains: `🔥 Your Daily Job Recommendations`
- ✅ **Greeting** has user's actual name (not admin)
- ✅ **Job #1-5** sections are present
- ✅ Each job shows:
  - Position title
  - Company name
  - Location
  - Apply link (starts with `https://prolinq.app/jobs/`)
- ✅ **Featured Opportunity** section below jobs (if ad is active)
- ✅ Ad has:
  - Title
  - Description/text
  - Link
- ✅ Footer has Prolinq branding
- ✅ Plain text formatting (no HTML, clean)

### Ad Shuffling Verification

Send emails to 3-5 different users and verify:
- ✅ Different ads shown to different users
- ✅ Not all users get the same ad
- ✅ Ad distribution is varied

**How to check:**
1. Send email to User 1 → Note which ad was included
2. Send email to User 2 → Different ad?
3. Send email to User 3 → Different from both?

---

## 🔧 Troubleshooting

### Issue: "User not found"
**Solution:** 
- Make sure you used a valid user ID from step 2
- Verify user exists: GET `/api/email/test-email/users`

### Issue: "No open jobs available"
**Solution:**
- Create some test jobs first
- Use admin dashboard to create a job
- Jobs must have `status = "open"`

### Issue: "Can only send recommendations to talent users"
**Solution:**
- Only talent-type users can receive recommendations
- Get users list first to see user types
- Create a test talent user if needed

### Issue: Email not arriving
**Solution:**
- Check email queue status: `GET /api/email/queue/status`
- Check backend logs for errors
- Verify SMTP is configured in `.env`
- Check spam/junk folder
- Email may be throttled (takes time)

### Issue: Ad not showing in email
**Solution:**
- Make sure ads exist: `GET /api/email/ads`
- Make sure at least one ad has `is_active = true`
- Check if ad was randomly selected (random chance)

---

## 📊 Expected Workflow

```
1. Admin logs in
   ↓
2. Clicks "Load Previews" to see email format
   ↓
3. Uses /test-email/users to get list of test users
   ↓
4. Calls /test-email/send-recommendations/{user_id}
   ↓
5. Email gets queued with personalized jobs + random ad
   ↓
6. Background scheduler processes queue
   ↓
7. Email sent to user's email address
   ↓
8. User receives beautiful formatted email with:
   - Their personalized job recommendations
   - Random ad from available pool
   - Professional styling with clear sections
```

---

## 🎨 Email Features Recap

### Styling Elements
- Box-drawing separators for visual appeal
- Emoji indicators (📌 for jobs, 💼 for ads, 🔥 for header)
- Clear section breaks
- Proper spacing for readability

### Content
- User's actual name in greeting
- 5 most recent open jobs
- Location and company for each job
- Direct apply links
- One random featured ad
- Explanation of recommendations
- Clear next steps (4-step guide)

### Personalization
- User-specific jobs (not generic)
- User's name (not "Dear User")
- Jobs based on what's available
- Randomized ad selection (fair distribution)

### Technical
- Plain text format (universal compatibility)
- No HTML (works in all email clients)
- Mobile-friendly line lengths
- Uses existing email queue system
- Tracks ad impressions

---

## 🚀 Next Steps

1. ✅ Restart backend (if needed)
2. ✅ Test preview endpoint
3. ✅ Get users list
4. ✅ Send to a test user
5. ✅ Check email queue
6. ✅ Verify email arrives
7. ✅ Check content is personalized
8. ✅ Verify ad is showing
9. ✅ Test with multiple users to see ad shuffling

---

## 📞 API Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/email/preview/daily-recommendations` | POST | Admin | Preview email format |
| `/api/email/test-email/users` | GET | Admin | List registered users |
| `/api/email/test-email/send-recommendations/{user_id}` | POST | Admin | Send personalized email to user |
| `/api/email/queue/status` | GET | Admin | Check queue status |
| `/api/email/ads` | GET | Admin | List available ads |

---

**All set! Your personalized email recommendation system is ready to test!** 🎉