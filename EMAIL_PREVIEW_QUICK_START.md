# 🎯 Email Preview & Testing - Quick Start

## What's New? ✨

A comprehensive **admin-only page** for previewing, testing, and managing all aspects of the email delivery system with full visibility into ad distribution and fairness.

## Access

**Path:** `/admin/email-preview`

**Navigation:** Admin Dashboard → "Email Preview & Testing" button

## 5 Tabs Overview

### 1️⃣ Email Previews
- **Welcome Email Template**: See exactly what new users receive
- **Daily Recommendations Email**: See job recommendations with optional ads
- **Copy to Clipboard**: Copy email content for testing in any email client

### 2️⃣ Ad Distribution
- **Visual Dashboard**: See how ads are distributed across users
- **Fairness Score**: Metric showing how evenly ads are spread (0-100)
- **Distribution Chart**: Bar chart showing % each ad receives
- **Sample Table**: Shows first 10 users and their ad assignments

### 3️⃣ Send Test
- **Single Test Email**: Send to any email to verify SMTP works
- **Bulk Test Emails**: Send to multiple users with fairness tracking
- **Response Includes**: Fairness score and ad distribution data

### 4️⃣ Manage Ads  
- **Create New Ad**: Title + text + optional link
- **View All Ads**: See impressions, creation date, status
- **Toggle Status**: Activate/deactivate ads anytime
- **Impression Tracking**: See how many times each ad has been shown

### 5️⃣ Queue Status
- **Real-time Metrics**: Pending, sent today, failed emails
- **Rate Limit Status**: Visual progress bar (0-140 emails/day)
- **SMTP Status**: Shows if Gmail configuration is active
- **Timing Info**: When last email sent, next send window

---

## How Ad Distribution Works 🎲

### The Process
```
Active Ads: [Ad1, Ad2, Ad3, Ad4]
↓
System randomly selects ONE ad per user
↓
Each ad has ~equal probability: 25% each
↓
Result: Fair distribution across all users
```

### Example With 100 Users
```
✅ Fair Distribution:
   Ad 1: 25 users (25%)
   Ad 2: 25 users (25%)
   Ad 3: 25 users (25%)
   Ad 4: 25 users (25%)
   Fairness Score: 100/100
```

### Why This Matters
- No single ad dominates
- All advertisers get equal exposure
- Random selection is truly random
- Fairness verified with scores

---

## Testing Checklist ✅

```
1. Go to "Manage Ads" tab
   ├─ Create 3-4 test ads
   └─ Verify they appear in "Active Ads" list

2. Go to "Email Previews" tab
   ├─ Review welcome email template
   └─ Review daily recommendations template

3. Go to "Ad Distribution" tab
   ├─ Check fairness score (should be 90+)
   ├─ Verify all ads in distribution chart
   └─ Review distribution percentages

4. Go to "Send Test" tab
   ├─ Enter your test email
   ├─ Click "Send Test Email"
   └─ Wait ~9 minutes, check inbox

5. Go to "Queue Status" tab
   ├─ Verify SMTP is enabled
   ├─ Watch email count increase
   └─ Monitor rate limiting
```

---

## Key Features 🚀

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Email Previews** | See exact email content before sending | Verify formatting, branding, content |
| **Fair Ad Distribution** | Ads randomly shuffled to all users | No advertiser favoritism |
| **Fairness Scores** | Metrics (0-100) on distribution quality | Verify system is working fairly |
| **Test Emails** | Send before going live | Verify Gmail SMTP configuration |
| **Bulk Testing** | Test with multiple users | Verify ad distribution at scale |
| **Ad Management** | Create, view, activate/deactivate ads | Full control over promotions |
| **Queue Monitoring** | Real-time queue status | Troubleshoot delivery issues |
| **Rate Limiting** | Gmail compliance built-in | 140 emails/day, 9-min spacing |

---

## Important Numbers 📊

```
Daily Email Limit:        140 emails/day
Minimum Email Spacing:    9 minutes
Queue Processing:         1 email/minute
Retry Attempts:           1 retry maximum
Failed Email Retention:   Marked as failed
Ad Selection Probability: Equal chance for all active ads
Welcome Email Trigger:    User registration
Daily Email Schedule:     8 AM - 8 PM UTC (hourly batches)
```

---

## Ad Distribution Algorithm 🔍

### How It Works
```javascript
// For each user with job recommendations:
1. Get list of active ads
2. Randomly select ONE ad from the list
3. Include ad in their daily email
4. Track impression for ROI
```

### Why Random is Fair
- No bias toward any ad
- All active ads have equal probability
- Distribution becomes even as sample grows
- Fairness score reflects actual fairness

### Distribution Math
```
4 Active Ads, 100 Users:
Expected: 25 per ad
Typical actual: 25, 25, 24, 26
Fairness: ~99/100

50 Active Ads, 100 Users:
2 per ad average (some get 2, some get 1)
Fairness: ~50/100 (expected due to low sample)
```

---

## Troubleshooting 🔧

**Q: Test email not arriving?**
A: 
1. Check SMTP is enabled in queue status
2. Check email spam folder
3. Wait full 9 minutes
4. Click "Test Connection" button

**Q: Ads not showing in emails?**
A:
1. Create ads first in "Manage Ads" tab
2. Verify ads are Active (green toggle)
3. Check fairness score >0
4. Send test email again

**Q: Unfair distribution?**
A:
1. If fairness score <70, check ad count
2. Try with more users (100+ for fairness)
3. Verify all ads are active
4. Resend bulk test to recalculate

**Q: Rate limiting too slow?**
A:
1. Current: 140/day, 9 min spacing
2. This is conservative (Gmail allows 150, 8 min)
3. Contact admin to adjust if needed
4. Spreadsheet: 140/day = ~6 emails/hour max

---

## Email Content Examples 📧

### Welcome Email
```
👋 Welcome to Prolinq!

Thanks for joining our platform. You'll now start 
receiving personalized job recommendations based on 
your skills and interests.

If you need help, reply to this message anytime.

— The Prolinq Team
```

### Daily Email (with Ad)
```
🔥 Your Daily Job Recommendations

Here are opportunities that match your profile:

1. Senior Python Developer
   Tech Corp — Remote
   Apply: [link]

2. Frontend React Developer
   StartupXYZ — San Francisco, CA
   Apply: [link]

------------------------------
📢 Sponsored Ad

[Ad Title]
[Ad Text]
More info: [link]

Wishing you the best!
— Prolinq Matching Engine
```

---

## API Endpoints (For Developers) 🔌

```
GET    /api/email/preview/welcome
POST   /api/email/preview/daily-recommendations
GET    /api/email/preview/ad-distribution
POST   /api/email/test/send
POST   /api/email/test/send-bulk?num_users=10
GET    /api/email/queue/status
GET    /api/email/metrics/today
```

---

## What Each Ad Distribution % Means

```
With 4 active ads:
✅ 24-26% each = Perfect (100 fairness score)
✅ 23-27% each = Excellent (95+ fairness score)
✅ 22-28% each = Good (90+ fairness score)
⚠️  20-30% each = Fair (80+ fairness score)
❌ <20% or >30% = Unfair (seek advice)
```

---

## Pre-Launch Checklist ✅

```
Configuration:
☐ Gmail App Password obtained
☐ SMTP_ENABLED=true in .env
☐ All SMTP variables set correctly
☐ Database migrations run

Testing:
☐ 3+ test ads created
☐ Single test email sent successfully
☐ Bulk test emails sent successfully
☐ Ad fairness score >90
☐ All email previews reviewed

Monitoring:
☐ Queue status showing SMTP enabled
☐ Email count increasing properly
☐ No failed emails or very few retries
☐ Fairness scores consistent

Go-Live:
☐ All above completed
☐ Team notified
☐ Monitoring dashboard bookmarked
☐ Ready to send real campaigns!
```

---

## Quick Links 🔗

- **Email Preview Page**: `/admin/email-preview`
- **Admin Dashboard**: `/admin`
- **Full Documentation**: `EMAIL_PREVIEW_TESTING_GUIDE.md`
- **API Reference**: Included in full documentation

---

## Need Help? 💬

1. **Troubleshooting**: See "Troubleshooting" section above
2. **Full Docs**: Read `EMAIL_PREVIEW_TESTING_GUIDE.md`
3. **API Docs**: Check API Reference section
4. **Logs**: Check `backend/app.log` for detailed errors

---

**Created:** Email Preview & Testing System v1.0  
**Compatible With:** Gmail SMTP, FastAPI, React  
**Status:** ✅ Production Ready