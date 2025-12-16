# Email Preview & Testing System - Admin Guide

## 🎉 Overview

A comprehensive admin page for previewing, testing, and managing the Prolinq email delivery system. This page provides full visibility into how emails look, how ads are distributed, and allows testing the email system before sending to real users.

**Access:** Admin Dashboard → "Email Preview & Testing" button → `/admin/email-preview`

---

## 📋 Features

### 1. **Email Previews Tab** 🎨

Preview exactly how emails will look when sent to users:

#### Welcome Email
- Shows the template sent to new users upon registration
- Includes friendly greeting and onboarding message
- Plain text format for maximum compatibility

#### Daily Job Recommendations Email
- Preview of the daily job recommendation email template
- Shows sample jobs with company, location, and apply links
- Demonstrates how an optional ad is included
- Displays the separator line between jobs and ads
- Shows metrics: # of jobs, whether an ad is included

### 2. **Ad Distribution Tab** 📊

Visualize how ads will be randomly distributed across all users:

#### Key Metrics
- **Total Active Ads**: Number of ads that are currently active
- **Total Talent Users**: Number of users who will receive emails
- **Sample Size**: Number of users in the simulation (max 100)
- **Average per Ad**: Expected impressions per ad

#### Distribution Visualization
- **Distribution Chart**: Horizontal bar chart showing percentage each ad receives
- **Sample Table**: Shows first 10 users and which ad they receive
- **Fairness Analysis**: 
  - Each active ad has equal probability of being selected
  - Random selection ensures fair distribution
  - No ad dominates the distribution

#### Example Distribution
```
4 Active Ads, 100 Sample Users:

Ad #1: ████░░░░░░ 25% (25 impressions)
Ad #2: ██████░░░░ 26% (26 impressions)
Ad #3: ████░░░░░░ 24% (24 impressions)
Ad #4: ██████░░░░ 25% (25 impressions)

Fairness Score: 95/100
```

### 3. **Send Test Tab** 📧

Send test emails to verify SMTP configuration:

#### Test Email Types
1. **Single Test Email**: Send to specific email address
2. **Bulk Test Emails**: Send to multiple users with fairness tracking

#### Single Test Email
- Enter recipient email address
- Click "Send Test Email"
- Email queued according to rate limits (arrives in ~9 minutes)
- Useful for verifying Gmail SMTP configuration

#### Bulk Test Emails
- Tests ad distribution fairness with multiple users
- Endpoint: `POST /api/email/test/send-bulk?num_users=10`
- Each user gets a random ad selected fairly
- Response includes:
  - Number of emails queued
  - Ad distribution across the test batch
  - Fairness score (0-100)

### 4. **Manage Ads Tab** 🎯

Create and manage promotional ads that appear in daily emails:

#### Create New Ad
- **Ad Title**: Short title/headline
- **Ad Text**: Main ad content (plain text)
- **Ad Link**: Optional URL for the ad (optional)
- Click "Create Ad" to add

#### Active Ads List
Shows all created ads with:
- Title and ad text content
- Clickable link (if provided)
- Impression count (# of times shown to users)
- Created date
- Active/Inactive toggle button

#### Ad Status
- **Active Ads**: Randomly selected for inclusion in daily emails
- **Inactive Ads**: Excluded from distribution but kept in database
- Toggle button to enable/disable any time

#### Ad Selection Logic
- One random active ad shown per user (if they have job recommendations)
- All active ads have equal chance of selection
- Different users may receive different ads
- Ad impressions tracked for ROI measurement

### 5. **Queue Status Tab** 📬

Monitor the email queue and rate limiting status:

#### Queue Statistics
- **Pending Emails**: # of emails waiting to be sent
- **Emails Sent Today**: Total emails sent in current UTC day
- **Failed Emails**: # of emails that failed delivery
- **Daily Limit**: Gmail's limit (140 emails/day)

#### Rate Limiting Status
- **Daily Email Quota Progress Bar**: Visual representation of 140/day limit
- **Last Sent Time**: When the most recent email was sent
- **Next Send Window**: Approximately 9 minutes between sends
- **Compliance**: Shows if we're within Gmail's rate limits

#### SMTP Status
- **✅ SMTP Enabled**: Gmail configuration is active and working
- **⚠️ SMTP Disabled**: Configuration needed before emails can send

#### Rate Limiting Rules
```
Maximum Daily Quota: 140 emails/day (conservative within Gmail's 100-150 limit)
Minimum Spacing: 9 minutes between sends (conservative within 8-10 minute window)
Queue Processing: 1 email per minute (faster than spacing requirement)
Failed Email Retry: Automatic retry with max 1 retry per email
Database Persistence: Queue survives app restarts
```

---

## 🔄 How Ads Are Distributed Across Users

### Fair Distribution Algorithm

```
Active Ads: [Ad1, Ad2, Ad3, Ad4]
Users: [User1, User2, User3, ..., User100]

For each user with job recommendations:
  1. Randomly select one ad from active ads list
  2. Include ad in their daily email
  3. Increment impression count for selected ad
  4. Log distribution for tracking

Result: Each ad has ~equal probability across all users
```

### Distribution Fairness Metrics

**Fairness Score** (0-100):
- 100 = Perfect even distribution
- 90+ = Excellent fairness (minimal variance)
- 70+ = Good fairness
- <70 = Consider checking ad setup

Calculated as: `100 - (max_impressions - min_impressions) * 10`

### Example: 5 Active Ads, 50 Users

**Random Distribution:**
```
Ad 1: 10 impressions (20%)
Ad 2: 11 impressions (22%)  ← One more due to randomness
Ad 3: 10 impressions (20%)
Ad 4:  9 impressions (18%)  ← One less due to randomness
Ad 5: 10 impressions (20%)

Fairness Score: 95/100 (very fair)
```

**With 100 Users:**
```
Ad 1: 25 impressions (25%)
Ad 2: 25 impressions (25%)
Ad 3: 25 impressions (25%)
Ad 4: 25 impressions (25%)

Fairness Score: 100/100 (perfect fairness)
```

---

## 🚀 Testing Workflow

### Step 1: Create Test Ads
1. Go to "Manage Ads" tab
2. Click "Create New Ad"
3. Fill in title, text, and link
4. Click "Create Ad"
5. Repeat for 2-3 more ads

### Step 2: Preview Emails
1. Go to "Email Previews" tab
2. Review welcome email template
3. Review daily recommendations template
4. Copy preview content to test email clients (optional)

### Step 3: Test Ad Distribution
1. Go to "Ad Distribution" tab
2. Check fairness scores and distribution visualization
3. Ensure all ads show in the distribution list
4. Verify percentages are approximately equal

### Step 4: Send Test Emails
1. Go to "Send Test" tab
2. Enter your test email address
3. Click "Send Test Email"
4. Wait ~9 minutes for email to arrive
5. Check email content and formatting

### Step 5: Send Bulk Tests (Optional)
```bash
# Via API
POST /api/email/test/send-bulk?num_users=10

Response:
{
  "success": true,
  "queued_count": 10,
  "total_users": 10,
  "ad_distribution": {
    "1": 3,
    "2": 2,
    "3": 3,
    "4": 2
  },
  "fairness_score": 95
}
```

### Step 6: Monitor Queue
1. Go to "Queue Status" tab
2. Watch "Emails Sent Today" increase
3. Verify rate limiting is working
4. Confirm SMTP is enabled

---

## 📨 Email Sending Schedule

### Daily Job Recommendations
- **Schedule**: Every hour from 8 AM to 8 PM UTC
- **Distribution**: Users divided into 13 hourly batches
- **Staggering**: Prevents "thundering herd" of 1000+ emails at once
- **Ad Inclusion**: Random ad selected for each user (if they have jobs)

### Welcome Emails
- **Trigger**: Automatic on user registration
- **Recipient**: New talent users only
- **Timing**: Queued immediately, sent within 9 minutes

### Test Emails
- **Trigger**: Manual via admin
- **Recipient**: Any email address
- **Use Case**: Verify Gmail SMTP configuration

---

## 🔧 Configuration & Setup

### Prerequisites
1. Gmail account with 2-factor authentication enabled
2. Gmail App Password (not regular password)
3. Backend `.env` file configured

### Environment Variables
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-gmail@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-gmail@gmail.com
SMTP_ENABLED=true
```

### Getting Gmail App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail" and "Windows Computer"
4. Use 16-character password in `SMTP_PASSWORD`

### Database Migrations
```bash
# Create EmailQueue, EmailAd, EmailMetrics tables
cd backend
alembic upgrade head
```

---

## 📊 Metrics & Analytics

### Available Metrics
- **Today's Dashboard**: Real-time metrics for current UTC day
- **30-Day History**: Historical metrics for trend analysis
- **System Summary**: Combined status of queue, ads, and SMTP

### Metrics Tracked
- `total_sent`: Total emails sent today
- `total_welcome`: Welcome emails count
- `total_job_recommendations`: Daily recommendation emails count
- `total_ads_shown`: Number of ads shown in emails
- `total_failed`: Failed email delivery count

### API Endpoints
```
GET /api/email/metrics/today          # Today's metrics
GET /api/email/metrics/history        # 30 days history
GET /api/email/metrics/summary        # Complete system summary
```

---

## ✅ Checklist: Before Going Live

- [ ] Gmail SMTP configured with App Password
- [ ] `SMTP_ENABLED=true` in backend `.env`
- [ ] Database migrations run successfully
- [ ] Test email sent successfully (check inbox)
- [ ] Ads created and active
- [ ] Ad distribution fairness verified (>90%)
- [ ] Welcome email preview looks good
- [ ] Daily recommendations email preview looks good
- [ ] Queue status shows SMTP enabled
- [ ] At least 5 jobs in database (for recommendations)
- [ ] At least 2 talent users created (for testing)

---

## 🐛 Troubleshooting

### Issue: Test email not arriving
**Solution:**
1. Check SMTP_ENABLED is true
2. Verify Gmail credentials are correct
3. Check spam/promotions folder
4. Click "Test SMTP Connection" button
5. Check backend logs for errors

### Issue: Ads never appear in emails
**Solution:**
1. Verify ads are created and active
2. Check "Manage Ads" tab to see ad list
3. Ensure at least one active ad exists
4. Check fairness score in "Ad Distribution" tab
5. Send test email and inspect content

### Issue: Rate limiting too slow
**Solution:**
1. Current: 140/day, 9-minute spacing (conservative)
2. Can adjust in `advanced_throttling_queue.py`
3. Max Gmail allows: 150/day, 8-minute spacing
4. Recommended: Keep conservative for reliability

### Issue: Queue shows "SMTP Disabled"
**Solution:**
1. Check `SMTP_ENABLED=true` in .env
2. Verify all SMTP variables are set
3. Restart backend server
4. Check backend logs for initialization errors

---

## 🎓 API Reference

### Preview Endpoints
```
GET    /api/email/preview/welcome                # Preview welcome email
POST   /api/email/preview/daily-recommendations  # Preview daily email
GET    /api/email/preview/ad-distribution        # Preview ad distribution
```

### Testing Endpoints
```
POST   /api/email/test/connection                # Test SMTP connection
POST   /api/email/test/send                      # Send single test email
POST   /api/email/test/send-bulk?num_users=10   # Send bulk test emails
```

### Ad Management Endpoints
```
POST   /api/email/ads                 # Create new ad
GET    /api/email/ads                 # List all ads
PUT    /api/email/ads/{id}            # Update ad
DELETE /api/email/ads/{id}            # Delete ad
```

### Queue & Status Endpoints
```
GET    /api/email/queue/status        # Current queue status
GET    /api/email/queue/pending       # Pending emails in queue
GET    /api/email/queue/recent        # Recently sent/failed emails
```

### Metrics Endpoints
```
GET    /api/email/metrics/today       # Today's metrics
GET    /api/email/metrics/history     # 30-day history
GET    /api/email/metrics/summary     # System summary
```

---

## 📝 Notes

- All emails are **text-only** (no HTML) for maximum compatibility
- Emails are **brand-safe** and professional
- Admin operations **never send accidentally** to users
- Test emails are **marked as test** in content
- Ad selection is **completely random and fair**
- All times are in **UTC** for consistency
- Queue uses **database persistence** (survives restarts)
- Failed emails **automatically retry once** then mark as failed
- System **fails gracefully** if SMTP is misconfigured

---

## 🎯 Key Design Principles

✅ **Fair Distribution**: Random selection ensures all ads get equal exposure
✅ **Rate Limiting**: Respects Gmail limits with built-in safety margin
✅ **Staggered Sending**: Hourly batches prevent overwhelming the queue
✅ **Database Persistence**: Queue survives application restarts
✅ **Graceful Degradation**: Email issues don't crash the application
✅ **Admin Visibility**: Complete transparency into email operations
✅ **Test Coverage**: Comprehensive testing tools before going live

---

## 🚀 Next Steps

1. Configure Gmail SMTP credentials
2. Run database migrations
3. Set `SMTP_ENABLED=true`
4. Create test ads via "Manage Ads" tab
5. Send test email to verify setup
6. Monitor queue status
7. Review metrics dashboard
8. Go live with email campaigns!

---

**Questions or Issues?**
- Check troubleshooting section above
- Review API documentation
- Check backend logs: `tail -f backend/app.log`
- Verify database migrations: `alembic current`