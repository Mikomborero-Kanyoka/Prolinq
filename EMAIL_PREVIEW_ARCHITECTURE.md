# 📐 Email Preview & Testing System - Architecture & Data Flow

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     ADMIN USER                                   │
│           (visits /admin/email-preview)                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ADMIN EMAIL PREVIEW PAGE                        │
│              (AdminEmailPreview.jsx Component)                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │   Previews   │ │ Distribution │ │  Send Test   │  ...        │
│  │     Tab      │ │      Tab     │ │     Tab      │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   ┌─────────┐     ┌──────────┐    ┌──────────┐
   │ Preview │     │  Testing │    │  Queue   │
   │Endpoints│     │Endpoints │    │Status EP │
   └────┬────┘     └────┬─────┘    └────┬─────┘
        │               │               │
        └───────────────┼───────────────┘
                        ▼
        ┌───────────────────────────────┐
        │   BACKEND API (FastAPI)       │
        │   (/api/email/...)            │
        └───────┬───────────────────────┘
                ▼
        ┌───────────────────────────────┐
        │   Database Services           │
        │   - EmailQueue                │
        │   - EmailAd                   │
        │   - User                      │
        │   - Job                       │
        └───────┬───────────────────────┘
                ▼
        ┌───────────────────────────────┐
        │   Database (SQLite/PostgreSQL)│
        │   - Emails queued             │
        │   - Ad definitions            │
        │   - Distribution history      │
        └───────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### Email Preview Flow

```
Admin clicks "Email Previews" tab
        ▼
Call: GET /api/email/preview/welcome
        ▼
Backend:
  1. Check if user is admin
  2. Generate welcome email template
  3. Return subject + text_content
        ▼
Frontend displays:
  - Email subject line
  - Plain text email body
  - Copy button
```

### Ad Distribution Preview Flow

```
Admin clicks "Ad Distribution" tab
        ▼
Call: GET /api/email/preview/ad-distribution
        ▼
Backend:
  1. Check admin permission
  2. Query all ACTIVE ads
  3. Query talent users count
  4. Simulate distribution:
     ├─ For each of 100 users
     ├─ Randomly select one ad
     ├─ Track selection
     └─ Calculate percentages
  5. Score fairness (0-100)
  6. Return distribution data
        ▼
Frontend displays:
  - Stats (# ads, # users, sample size)
  - Bar chart of distribution
  - Fairness percentages
  - Sample distribution table
```

### Test Email Sending Flow

```
Admin enters email + clicks "Send Test"
        ▼
Call: POST /api/email/test/send
        ▼
Backend:
  1. Validate admin permission
  2. Validate email format
  3. Create EmailQueue record:
     - to: [email]
     - subject: "Test Email"
     - status: pending
     - email_type: test
  4. Return queue_id
        ▼
Frontend shows:
  - Success toast
  - Clear input field
  - Display confirmation
        ▼
Background Scheduler (every minute):
  1. Check queue
  2. Respect rate limiting (1 email / 9 minutes)
  3. Send via Gmail SMTP
  4. Mark as 'sent' with timestamp
        ▼
Email arrives in inbox (~9 minutes)
```

### Ad Creation Flow

```
Admin fills form + clicks "Create Ad"
        ▼
Call: POST /api/email/ads
Request body:
{
  "title": "Ad Title",
  "ad_text": "Ad description",
  "ad_link": "https://example.com"
}
        ▼
Backend:
  1. Validate admin permission
  2. Validate required fields
  3. Create EmailAd record:
     - created_by_id: [admin_id]
     - is_active: true
     - impressions: 0
  4. Commit to database
  5. Return ad_id
        ▼
Frontend:
  1. Show success toast
  2. Clear form
  3. Reload ads list
  4. Display new ad in Active Ads section
```

### Ad Distribution Simulation Flow

```
For each of 100 sample users:
        ▼
   Get active ads list
   [Ad1, Ad2, Ad3, Ad4]
        ▼
   Randomly select one ad
   (Random.choice())
        ▼
   Track selection
   impressions[selected_ad] += 1
        ▼
After 100 iterations:
        ▼
   Calculate percentages
   percent[ad_id] = (impressions[ad_id] / 100) * 100
        ▼
   Calculate fairness score
   max_impr = max(impressions.values())
   min_impr = min(impressions.values())
   fairness = 100 - (max_impr - min_impr) * 10
        ▼
   Display results:
   - Bar chart of percentages
   - Fairness score
   - Distribution table
```

---

## 📊 Component Hierarchy

```
AdminEmailPreview (main component)
├── Header Section
│   ├── Title + Description
│   └── Refresh Button
├── Tab Navigation
│   ├── Email Previews Tab
│   ├── Ad Distribution Tab
│   ├── Send Test Tab
│   ├── Manage Ads Tab
│   └── Queue Status Tab
└── Tab Content Areas
    ├── EmailPreviewBox (reusable)
    │   ├── Email Subject
    │   ├── Email Body
    │   └── Copy Button
    ├── Distribution Charts
    │   ├── Stat Cards
    │   ├── Bar Charts
    │   └── Tables
    ├── Form Inputs
    │   ├── Text Input
    │   ├── TextArea
    │   └── Buttons
    └── Status Displays
        ├── Metric Cards
        ├── Progress Bars
        └── Status Indicators
```

---

## 🔌 API Endpoint Architecture

```
/api/email
├── /preview (GET/POST)
│   ├── /welcome (GET)
│   │   └─> Returns: subject, text_content
│   ├── /daily-recommendations (POST)
│   │   └─> Returns: subject, text_content, jobs_count
│   └── /ad-distribution (GET)
│       └─> Returns: impressions, percentages, fairness_score
├── /test (POST)
│   ├── /connection (POST)
│   │   └─> Returns: smtp_status
│   ├── /send (POST)
│   │   ├─> Input: recipient_email
│   │   └─> Returns: queue_id
│   └── /send-bulk (POST) [NEW]
│       ├─> Input: num_users
│       └─> Returns: fairness_score, distribution
├── /ads (CRUD)
│   ├── POST /ads
│   │   └─> Create ad
│   ├── GET /ads
│   │   └─> List all ads
│   ├── PUT /ads/{id}
│   │   └─> Update ad
│   └── DELETE /ads/{id}
│       └─> Delete ad
├── /queue
│   ├── /status (GET)
│   │   └─> Queue metrics
│   ├── /pending (GET)
│   │   └─> Pending emails
│   └── /recent (GET)
│       └─> Recent emails
└── /metrics
    ├── /today (GET)
    ├── /history (GET)
    └── /summary (GET)
```

---

## 🗄️ Database Schema (Email Tables)

```
EmailQueue Table:
┌─────────────────────────────────────────┐
│ id (PK)                                 │
│ to (email)                              │
│ subject                                 │
│ text_content                            │
│ email_type (welcome/recommendation/test)│
│ status (pending/sent/failed/retry)      │
│ retry_count                             │
│ error_message                           │
│ created_at                              │
│ sent_at                                 │
└─────────────────────────────────────────┘

EmailAd Table:
┌─────────────────────────────────────────┐
│ id (PK)                                 │
│ created_by_id (FK → User)               │
│ title                                   │
│ ad_text                                 │
│ ad_link                                 │
│ is_active (boolean)                     │
│ impressions (count)                     │
│ created_at                              │
│ updated_at                              │
└─────────────────────────────────────────┘

EmailMetrics Table:
┌─────────────────────────────────────────┐
│ id (PK)                                 │
│ date                                    │
│ total_sent                              │
│ total_welcome                           │
│ total_job_recommendations               │
│ total_ads_shown                         │
│ total_failed                            │
└─────────────────────────────────────────┘
```

---

## 🎯 Tab-to-Feature Mapping

```
┌──────────────────────────────────────────────────────────┐
│ EMAIL PREVIEWS TAB                                       │
├──────────────────────────────────────────────────────────┤
│ • Call: GET /api/email/preview/welcome                  │
│ • Call: POST /api/email/preview/daily-recommendations   │
│ • Display: Email subject, body, format                  │
│ • Feature: Copy-to-clipboard                            │
│ • Data: EmailTemplates service                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ AD DISTRIBUTION TAB                                      │
├──────────────────────────────────────────────────────────┤
│ • Call: GET /api/email/preview/ad-distribution          │
│ • Display: Bar chart, percentages, fairness score       │
│ • Feature: Distribution simulation                      │
│ • Data: EmailAd table + random selection algorithm      │
│ • Metrics: Fairness scoring (0-100)                     │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ SEND TEST TAB                                            │
├──────────────────────────────────────────────────────────┤
│ • Call: POST /api/email/test/send                       │
│ • Input: Email address                                  │
│ • Output: Queue confirmation                            │
│ • Processing: Background scheduler queues email         │
│ • Delivery: ~9 minutes via Gmail SMTP                   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ MANAGE ADS TAB                                           │
├──────────────────────────────────────────────────────────┤
│ • Call: GET /api/email/ads (list)                       │
│ • Call: POST /api/email/ads (create)                    │
│ • Call: PUT /api/email/ads/{id} (toggle)                │
│ • Display: Ad list with impressions                     │
│ • Feature: Toggle active/inactive                       │
│ • Data: EmailAd table                                   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ QUEUE STATUS TAB                                         │
├──────────────────────────────────────────────────────────┤
│ • Call: GET /api/email/queue/status                     │
│ • Display: Pending, sent, failed counts                 │
│ • Display: Daily quota progress bar                     │
│ • Display: SMTP enabled/disabled status                 │
│ • Data: EmailQueue table + metrics                      │
└──────────────────────────────────────────────────────────┘
```

---

## 🔀 State Management Flow

```
React Component State:
├── welcomePreview (email preview data)
├── dailyPreview (email preview data)
├── adDistribution (distribution data)
├── queueStatus (queue metrics)
├── ads (list of all ads)
├── loading (fetch in progress)
├── testEmail (form input)
├── sending (test email sending)
├── newAd (form inputs)
├── creatingAd (submission in progress)
└── activeTab (current tab)

API Calls (Promise.all for parallel):
├── GET /email/preview/welcome
├── POST /email/preview/daily-recommendations
├── GET /email/preview/ad-distribution
├── GET /email/queue/status
└── GET /email/ads

Error Handling:
├── Try-catch blocks
├── Toast notifications (success/error)
├── User feedback
└── Graceful degradation
```

---

## 🔐 Security & Permission Flow

```
User navigates to /admin/email-preview
        ▼
Check: AdminProtectedRoute wrapper
        ▼
Check: useAuth() hook
        ▼
Check: user.is_admin === true?
        ├─ YES: Render page
        └─ NO: Redirect to /dashboard
                ▼
        API Request sent
        ▼
Backend: Check admin permission
        ├─ has is_admin token?
        ├─ JWT validation?
        └─ Return 403 Forbidden if not admin
```

---

## 📈 Performance Optimization Strategy

```
Frontend Optimization:
├── Parallel API calls (Promise.all)
├── Component memoization
├── Debounced form inputs
└── Lazy loading of tabs

Backend Optimization:
├── Efficient database queries
│   ├── Filtered queries (is_active = true)
│   ├── Limited results (limit: 50)
│   └── Indexed lookups
├── Sample size capped (max 100 users)
├── Distribution simulation (efficient)
└── Caching of ad lists

Database Optimization:
├── Indexed columns
│   ├── email status
│   ├── email_type
│   ├── ad is_active
│   └── ad created_by_id
├── Query optimization
└── Connection pooling
```

---

## 🔄 Real-Time Update Strategy

```
Method 1: Manual Refresh
├─ User clicks "Refresh" button
├─ All API calls re-executed
└─ State updated with new data

Method 2: Tab Switching
├─ User clicks different tab
├─ Tab content loaded on demand
└─ Previous state preserved

Method 3: Auto-Fetch (Queue Status)
├─ Could implement setInterval
├─ Poll every 10 seconds
├─ Update queue metrics live
└─ Currently manual refresh

Future Enhancement:
├─ WebSocket for real-time updates
├─ Server-Sent Events (SSE)
├─ Socket.io integration
└─ Live metrics dashboard
```

---

## 📊 Distribution Algorithm Visualization

```
Random Distribution Process:

Active Ads: [Ad#1, Ad#2, Ad#3, Ad#4]

User 1: Random.choice() → Ad#2 ✓
User 2: Random.choice() → Ad#1 ✓
User 3: Random.choice() → Ad#3 ✓
User 4: Random.choice() → Ad#1 ✓
User 5: Random.choice() → Ad#4 ✓
User 6: Random.choice() → Ad#2 ✓
User 7: Random.choice() → Ad#3 ✓
User 8: Random.choice() → Ad#4 ✓
User 9: Random.choice() → Ad#2 ✓
User 10: Random.choice() → Ad#1 ✓

Results:
Ad#1: 3 impressions (30%)
Ad#2: 3 impressions (30%)
Ad#3: 2 impressions (20%)
Ad#4: 2 impressions (20%)

Fairness Score:
max = 3, min = 2
fairness = 100 - (3-2)*10 = 90/100 ✅
```

---

## 🎯 File Structure

```
frontend/src/
├── pages/
│   ├── AdminEmailPreview.jsx (NEW - 700 lines)
│   ├── AdminDashboard.jsx (MODIFIED)
│   └── ...
├── App.jsx (MODIFIED)
└── ...

backend/
├── routes/
│   ├── email.py (ENHANCED - +110 lines)
│   └── ...
├── services/
│   ├── email_service.py
│   ├── email_templates.py
│   ├── advanced_throttling_queue.py
│   └── ...
├── models.py
└── ...
```

---

## 🔗 External Integrations

```
Gmail SMTP (Rate Limited):
├── Host: smtp.gmail.com
├── Port: 587
├── Auth: App Password
├── Limits: 140/day, 9-min spacing
├── Fallback: Graceful failure if disabled
└── Tracking: Success/failure logged

Database (Persistence):
├── Tables: EmailQueue, EmailAd, EmailMetrics
├── Operations: CRUD on ads
├── Queries: Status, history, distribution
├── Transactions: Atomic operations
└── Indexes: Performance optimization

User Authentication:
├── JWT token validation
├── Admin check (is_admin flag)
├── Permission verification
└── Audit logging
```

---

**Summary:**
- Clean separation of concerns
- Efficient API design
- Scalable architecture
- Secure permission model
- Optimized performance
- Real-time capable
- Future-proof design