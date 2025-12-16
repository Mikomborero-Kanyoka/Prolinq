# 📧 Test Recommendations Email Guide

This guide explains how to send and test recommendation emails with **proper HTML formatting** and **actual ads**.

## ✅ What's Been Fixed

1. **HTML Email Support** ✓
   - Recommendation emails now send as HTML with inline CSS styling
   - Proper multipart/alternative MIME structure for email clients
   - Fallback plain text version for compatibility

2. **Actual Ads Included** ✓
   - Recommendations emails now include real ads from your database
   - If no ads exist, sample ads are used for testing
   - Ad impressions are tracked

3. **Direct Testing Available** ✓
   - New endpoint to send test recommendations emails directly
   - Doesn't use the queue - sends immediately
   - Perfect for verification before enabling scheduled sends

---

## 🚀 Quick Start

### Option 1: Using the Backend API (Recommended)

**Endpoint:** `POST /api/email/test/send-recommendations`

**Requirements:**
- Admin account
- Valid auth token
- SMTP configured and enabled

**Example using cURL:**
```bash
curl -X POST "http://localhost:8000/api/email/test/send-recommendations" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"recipient_email": "test@example.com"}'
```

**Using Python/requests:**
```python
import requests

token = "your-admin-token"
headers = {"Authorization": f"Bearer {token}"}

response = requests.post(
    "http://localhost:8000/api/email/test/send-recommendations",
    headers=headers,
    json={"recipient_email": "test@example.com"}
)

print(response.json())
```

**Expected Response:**
```json
{
  "recipient": "test@example.com",
  "status": "sent",
  "message": "Test recommendations email sent successfully with HTML and ads",
  "format": "HTML with plain text fallback",
  "includes_ads": true,
  "includes_jobs": true
}
```

---

### Option 2: Using the Python Script (For Local Testing)

**Script:** `backend/test_recommendations_email.py`

**Usage:**
```bash
cd backend

# Send test email to yourself
python test_recommendations_email.py your-email@example.com

# Send with custom name
python test_recommendations_email.py your-email@example.com --name "John Doe"

# Check SMTP configuration only
python test_recommendations_email.py --check-only your-email@example.com
```

**Features:**
- Automatically loads real jobs and ads from database
- Uses sample data if database is empty
- Saves HTML preview to a file
- Shows detailed progress and status

**Output Example:**
```
============================================================
📧 SENDING TEST RECOMMENDATIONS EMAIL
============================================================

🔍 CHECKING SMTP CONFIGURATION ONLY

✅ SMTP is configured
🔌 Testing SMTP connection...
✅ SMTP connection successful!

📋 Preparing email content...
✅ Loaded 5 sample jobs
✅ Loaded ad: Featured Opportunity - Prolinq Pro

🎨 Generating HTML email...
✅ Subject: 🔥 5 New Job Matches for Test User | Prolinq
✅ HTML length: 8534 characters

📤 Sending email to test@example.com...

============================================================
✅ EMAIL SENT SUCCESSFULLY!
   To: test@example.com
   Subject: 🔥 5 New Job Matches for Test User | Prolinq
   Format: HTML with plain text fallback
   Jobs included: 5
   Ad included: Featured Opportunity - Prolinq Pro
============================================================

💾 HTML email saved to: test_recommendations_email_20240115_143022.html
```

---

## 🔧 SMTP Configuration

Before sending test emails, ensure SMTP is properly configured:

### Required Environment Variables

In `backend/.env`:
```env
SMTP_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

### Gmail Setup

1. **Enable 2-Step Verification** in Google Account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password
3. **Use the App Password** as `SMTP_PASSWORD` in `.env`

### Test Connection

```bash
curl -X POST "http://localhost:8000/api/email/test/connection" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Email Content

### What's Included

**HTML Recommendations Email Contains:**

1. **Header Section**
   - Prolinq logo with gradient background
   - Tagline: "Smarter Job Matching For Everyone"

2. **Job Cards**
   - Job title and number
   - Company name (clickable in blue)
   - Location with icon
   - "View & Apply" button with link
   - Professional styling with hover effects

3. **Advertisement Section**
   - Eye-catching gradient background (gold/amber)
   - Ad title, text, and call-to-action button
   - Positioned between job listings and footer

4. **Why These Jobs Section**
   - Explanation of matching algorithm
   - Blue accent bar on the left

5. **Next Steps Section**
   - Green accent bar
   - Numbered action items for the user

6. **Footer**
   - Company info and branding
   - Legal notice
   - Preference update link

### Responsive Design

- Works perfectly on mobile (320px+)
- Works on tablets and desktops
- Email client compatible styling
- No external stylesheets (all inline CSS)

---

## 📧 Email Format

### MIME Structure

The email is sent as `multipart/alternative`:
```
Email Message
├── Plain Text Version (fallback)
└── HTML Version (primary)
```

Email clients will:
1. Display HTML version if supported
2. Fall back to plain text if HTML isn't supported
3. Both versions have identical content

### Why This Matters

- **Better Compatibility**: Works in Outlook, Gmail, Apple Mail, etc.
- **Mobile Friendly**: HTML renders correctly on mobile devices
- **No External Resources**: All CSS is inline (better security)
- **Better Styling**: Colors, fonts, and layout are preserved

---

## 🎯 Testing Checklist

After sending a test email, verify:

- [ ] Email received in inbox (not spam)
- [ ] HTML renders properly (not showing code)
- [ ] Styled with colors and formatting
- [ ] Jobs are displayed with companies and locations
- [ ] Ad is visible with yellow/gold background
- [ ] "View & Apply" buttons are clickable
- [ ] Text is readable on mobile
- [ ] Links work correctly
- [ ] Company logos/styling visible
- [ ] Footer information displayed

---

## 🚨 Troubleshooting

### Email Not Received

1. **Check SMTP is enabled:**
   ```bash
   # Test connection
   curl -X POST "http://localhost:8000/api/email/test/connection" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

2. **Check logs:**
   - Look for error messages in backend console
   - Check `error_message` in response

3. **Verify credentials:**
   - Gmail app password (not regular password)
   - 2-step verification enabled
   - `.env` file has correct values

### Email Showing Plain Text Instead of HTML

1. **Your email client**: Some corporate email clients strip HTML
2. **Try different client**: Test with Gmail, Outlook, Apple Mail
3. **Check spam**: HTML emails sometimes land in spam

### Missing Ads in Email

1. **No active ads in database:**
   - Check `/api/email/ads` endpoint
   - Create an ad via `/api/email/ads` POST endpoint
   - Or sample ad will be used automatically

2. **Ads marked inactive:**
   - Go to admin dashboard
   - Check if ads are marked as `is_active: true`
   - Update via `/api/email/ads/{id}` PUT endpoint

### Jobs Not Showing

1. **No open jobs in database:**
   - System automatically uses sample jobs
   - Create real jobs if available
   - Check job status is "open"

---

## 📋 API Endpoints Reference

### Test Email Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/email/test/send` | POST | Send basic test email |
| `/api/email/test/send-recommendations` | POST | Send test recommendations with HTML & ads ⭐ |
| `/api/email/test/connection` | POST | Test SMTP connection |

### Email Management Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/email/ads` | GET | List all ads |
| `/api/email/ads` | POST | Create new ad |
| `/api/email/ads/{id}` | PUT | Update ad |
| `/api/email/preview/daily-recommendations` | POST | Preview recommendations email |
| `/api/email/queue/status` | GET | Check queue status |

---

## 💡 Tips for Success

1. **Always test before scheduling:**
   - Send test email to yourself first
   - Verify HTML rendering in your email client
   - Check all links work

2. **Monitor queue status:**
   - Use `/api/email/queue/status` to monitor
   - Check for stuck emails
   - Verify SMTP is working

3. **Track ad performance:**
   - Each ad tracks impressions
   - Monitor which ads get the most visibility
   - Update ads based on performance

4. **Handle large lists:**
   - System has throttling to avoid overload
   - Emails are sent gradually through queue
   - Check metrics to see delivery rate

---

## 🔍 View Email HTML

The test script saves HTML to a file for inspection:

```bash
# After running the test script, open the HTML file in a browser:
open test_recommendations_email_20240115_143022.html

# Or on Windows:
start test_recommendations_email_20240115_143022.html
```

This lets you see exactly how the email will render before it goes to users.

---

## 📝 Advanced: Sending to Multiple Users

### Via Queue (Scheduled)

To send recommendation emails to all talent users:

```python
from database import SessionLocal
from models import User
from services.email_service import EmailService

db = SessionLocal()
service = EmailService()

# Get all talent users
users = db.query(User).filter(User.primary_role == "talent", User.is_active == True).all()

for user in users:
    jobs = []  # Get jobs from your recommendation system
    service.send_daily_job_recommendations(
        db=db,
        user=user,
        jobs=jobs,
        include_ad=True
    )

print(f"✅ Queued {len(users)} recommendation emails")
```

### Manual Scheduling

Set up cron job or scheduler to:
1. Get all talent users
2. Generate job recommendations for each
3. Call `send_daily_job_recommendations()`
4. System handles queue throttling automatically

---

## 🎓 Understanding the Email System

### Architecture

```
┌─────────────┐
│ Send Email  │
│  Request    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Email Service      │ ← Formats and prepares
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Email Queue        │ ← Stores in database
└──────┬──────────────┘   (for throttling)
       │
       ▼
┌─────────────────────┐
│  Queue Processor    │ ← Sends gradually
│  (Scheduler)        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  SMTP Service       │ ← Sends via Gmail
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Gmail SMTP Server  │ ← Delivers to users
└─────────────────────┘
```

### Direct Send (Test Emails)

Test emails bypass the queue:

```
┌─────────────┐
│ Test Email  │
│  Request    │
└──────┬──────┘
       │
       ▼ (DIRECT - no queue)
┌─────────────────────┐
│  SMTP Service       │ ← Sends immediately
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Gmail SMTP Server  │ ← Delivers to recipient
└─────────────────────┘
```

---

## ✅ Success Criteria

Your recommendation email system is working if:

✓ Test email arrives in inbox (not spam)
✓ HTML is rendered with colors and formatting
✓ Multiple job cards are displayed
✓ Ad section has gold background
✓ All links are clickable
✓ Emails work on mobile devices
✓ Queue status shows emails being processed
✓ Ads show increasing impression counts

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review backend logs for errors
3. Verify SMTP configuration
4. Test connection first
5. Start with a test email to yourself
6. Inspect the HTML file to see the structure

---

**Document Updated:** January 2024
**Last Tested:** HTML + Ads Implementation ✓