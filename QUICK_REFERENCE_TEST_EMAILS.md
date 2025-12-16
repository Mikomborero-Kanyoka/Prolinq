# ⚡ Quick Reference: Testing Recommendation Emails

## 🎯 Send Test Email NOW (3 ways)

### 1️⃣ Python Script (Fastest)
```bash
cd backend
python test_recommendations_email.py your-email@example.com
```

### 2️⃣ cURL (API)
```bash
curl -X POST "http://localhost:8000/api/email/test/send-recommendations" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient_email": "test@example.com"}'
```

### 3️⃣ Python Requests
```python
import requests

headers = {"Authorization": f"Bearer {token}"}
response = requests.post(
    "http://localhost:8000/api/email/test/send-recommendations",
    headers=headers,
    json={"recipient_email": "test@example.com"}
)
print(response.json())
```

---

## ✅ What You Should See

✓ **HTML Email** - Not plain text!
✓ **Styled Jobs** - Multiple job cards with colors
✓ **Yellow Ad Section** - Featured opportunity  
✓ **Clickable Links** - All buttons work
✓ **Mobile Friendly** - Looks good on phones

---

## 🔧 Prerequisites

### 1. SMTP Configured
```env
# backend/.env
SMTP_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

### 2. Test Connection
```bash
curl -X POST "http://localhost:8000/api/email/test/connection" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Have Active Ads (Optional)
```bash
# Create an ad:
curl -X POST "http://localhost:8000/api/email/ads" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Features",
    "ad_text": "Upgrade to get more jobs",
    "ad_link": "https://prolinq.app/upgrade"
  }'
```

---

## 🚀 Common Tasks

| Task | Command |
|------|---------|
| Send test email | `python test_recommendations_email.py email@test.com` |
| Check SMTP | `curl ... /api/email/test/connection` |
| List all ads | `curl ... /api/email/ads` |
| Check queue | `curl ... /api/email/queue/status` |
| View pending | `curl ... /api/email/queue/pending` |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| SMTP not enabled | Set `SMTP_ENABLED=true` in `.env` |
| Plain text email | Check email client supports HTML |
| No ads showing | Create ads or check `is_active=true` |
| Email not received | Check spam folder |
| Connection fails | Verify Gmail app password |

---

## 📊 Email Structure

```
📧 Subject: 🔥 5 New Job Matches for You | Prolinq

┌─ HEADER ─────────────────────────┐
│ 🚀 Prolinq Logo                  │
│ Smarter Job Matching             │
└──────────────────────────────────┘

┌─ JOBS ───────────────────────────┐
│ 1️⃣  Senior Python Developer      │
│     Tech Corp (Remote)            │
│     [View & Apply →]              │
│                                   │
│ 2️⃣  Frontend React Developer     │
│     StartupXYZ (San Francisco)   │
│     [View & Apply →]              │
└──────────────────────────────────┘

┌─ AD 🟡 ─────────────────────────┐
│ Premium Features - Prolinq Pro    │
│ Upgrade to get priority access    │
│ [Learn More →]                    │
└──────────────────────────────────┘

┌─ WHY THESE? ─────────────────────┐
│ Selected based on your skills     │
└──────────────────────────────────┘

┌─ NEXT STEPS ─────────────────────┐
│ 1. Review opportunities           │
│ 2. View full details              │
│ 3. Apply (30 seconds)             │
└──────────────────────────────────┘

┌─ FOOTER ─────────────────────────┐
│ — The Prolinq Matching Engine     │
│ Manage preferences                │
└──────────────────────────────────┘
```

---

## 📋 Files Added/Modified

### ✨ NEW FILES
- `backend/test_recommendations_email.py` - Standalone test script
- `TEST_RECOMMENDATIONS_EMAIL_GUIDE.md` - Full documentation
- `QUICK_REFERENCE_TEST_EMAILS.md` - This file!

### 🔄 MODIFIED FILES  
- `backend/services/email_service.py` - Added `send_test_recommendations_email()` method
- `backend/routes/email.py` - Added `/api/email/test/send-recommendations` endpoint

### ℹ️ NO CHANGES TO
- Email templates (already sending HTML)
- SMTP service (already supports HTML)
- Database models

---

## 🎯 Expected Output

```
✅ EMAIL SENT SUCCESSFULLY!
   To: test@example.com
   Subject: 🔥 5 New Job Matches for Test User | Prolinq
   Format: HTML with plain text fallback
   Jobs included: 5
   Ad included: Featured Opportunity - Prolinq Pro
```

---

## 💾 View HTML Preview

After running test script:
```bash
# On Mac/Linux
open test_recommendations_email_*.html

# On Windows
start test_recommendations_email_*.html
```

This shows exactly how the email will look in a browser!

---

## 🔐 Get Admin Token

```bash
# Login to get token
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'

# Response includes:
# "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
```

---

**Start here:** Run the Python script first!  
**Then:** Check your email inbox for the styled recommendation email  
**Finally:** Read the full guide for more details