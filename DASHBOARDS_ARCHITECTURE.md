# 📐 Dashboards Architecture & System Design

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Job Seeker Path          Main Dashboard          Job Owner Path │
│  ┌─────────────────┐      ┌──────────────┐      ┌────────────────┐
│  │ Job Seeker      │      │   Dashboard  │      │  Job Owner     │
│  │ Dashboard       │──────│  /dashboard  │──────│   Dashboard    │
│  │                 │      │              │      │                │
│  │ Route:          │      │ Routes user  │      │ Route:         │
│  │ /dashboard/     │      │ based on     │      │ /dashboard/    │
│  │ job-seeker      │      │ primary_role │      │ job-owner      │
│  └─────────────────┘      └──────────────┘      └────────────────┘
│           │                     │                        │
│           └─────────┬───────────┴────────────┬──────────┘
│                     │                        │
│         React Router DOM Updates
│         Framer Motion Animations
│         Tailwind CSS Styling
│
└─────────────────────────────────────────────────────────────────┘
         │                              │
         ├──────────────┬───────────────┤
         │              │               │
         v              v               v
  ┌────────────┐  ┌───────────┐  ┌────────────────┐
  │   API      │  │   React   │  │  Components    │
  │  Calls     │  │  Hooks    │  │  & Logic       │
  └────────────┘  └───────────┘  └────────────────┘

         │
         │ HTTP GET Requests
         │
         v

┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (FastAPI)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Endpoints:                                                    │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ GET /api/jobs/dashboard/applicant                       │  │
│  │ • Requires authentication (JWT)                         │  │
│  │ • Returns current user's applications                   │  │
│  │ • Groups by pending/completed                           │  │
│  │ • Joins application + job data                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ GET /api/jobs/dashboard/owner                           │  │
│  │ • Requires authentication (JWT)                         │  │
│  │ • Returns current user's jobs                           │  │
│  │ • Groups by pending/completed                           │  │
│  │ • Counts applications per job                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Helper Functions:                                             │
│  • get_applicant_dashboard()                                   │
│  • get_owner_dashboard()                                       │
│  • Query database for filtered data                            │
│  • Format responses with DashboardData schema                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         │
         │ Database Queries
         │
         v

┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (SQLite)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tables:                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    users     │  │     jobs     │  │applications  │         │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤         │
│  │ id (PK)      │  │ id (PK)      │  │ id (PK)      │         │
│  │ full_name    │  │ title        │  │ job_id (FK)  │         │
│  │ email        │  │ description  │  │ applicant_id │         │
│  │ primary_role │  │ budget       │  │ (FK)         │         │
│  │ ...          │  │ creator_id   │  │ status       │         │
│  │              │  │ (FK)         │  │ proposed_pri │         │
│  │              │  │ status       │  │ created_at   │         │
│  │              │  │ ...          │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│       │                  │                   │                 │
│       │                  │                   │                 │
│       └──────────────────┴───────────────────┘                 │
│          Foreign Key Relationships                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Job Seeker Dashboard Data Flow

```
┌──────────────────────┐
│  User visits         │
│  /dashboard/job-seeker
└──────────┬───────────┘
           │
           v
┌──────────────────────────────────┐
│ JobSeekerDashboard component     │
│ mounts                           │
└──────────┬───────────────────────┘
           │
           v
┌──────────────────────────────────┐
│ useEffect() fires                │
│ fetchDashboardData() called       │
└──────────┬───────────────────────┘
           │
           v
┌──────────────────────────────────┐
│ API Request:                     │
│ GET /api/jobs/dashboard/applicant│
│ Headers: Authorization: Bearer..│
└──────────┬───────────────────────┘
           │
           v (HTTP GET)
┌──────────────────────────────────┐
│ Backend Route Handler            │
│ get_applicant_dashboard()        │
└──────────┬───────────────────────┘
           │
           v
┌──────────────────────────────────┐
│ Database Queries:                │
│ • Get applications for user      │
│ • Get job data for each app      │
│ • Get creator data for each job  │
└──────────┬───────────────────────┘
           │
           v
┌──────────────────────────────────┐
│ Sort & Group:                    │
│ • pending list                   │
│ • completed list                 │
└──────────┬───────────────────────┘
           │
           v
┌──────────────────────────────────┐
│ Return DashboardData Response    │
│ {pending: [...], completed: [...]}
└──────────┬───────────────────────┘
           │
           v (HTTP 200 JSON)
┌──────────────────────────────────┐
│ React Component receives data    │
│ setPendingApplications()         │
│ setCompletedApplications()       │
│ setLoading(false)                │
└──────────┬───────────────────────┘
           │
           v
┌──────────────────────────────────┐
│ Component re-renders with:       │
│ • Statistics cards               │
│ • Tab navigation                 │
│ • Application cards              │
│ • Empty states if needed         │
└──────────┬───────────────────────┘
           │
           v
┌──────────────────────────────────┐
│ User sees dashboard              │
│ • Can click to view job details  │
│ • Can message accepted employers │
│ • Can switch tabs                │
└──────────────────────────────────┘
```

### Job Owner Dashboard Data Flow

```
┌──────────────────────┐
│  User visits         │
│  /dashboard/job-owner│
└──────────┬───────────┘
           │
           v
┌──────────────────────────────────┐
│ JobOwnerDashboard component      │
│ mounts                           │
└──────────┬───────────────────────┘
           │
           v
┌──────────────────────────────────┐
│ useEffect() fires                │
│ fetchDashboardData() called       │
└──────────┬───────────────────────┘
           │
           v
┌──────────────────────────────────┐
│ API Request:                     │
│ GET /api/jobs/dashboard/owner    │
│ Headers: Authorization: Bearer..│
└──────────┬───────────────────────┘
           │
           v (HTTP GET)
┌──────────────────────────────────┐
│ Backend Route Handler            │
│ get_owner_dashboard()            │
└──────────┬───────────────────────┘
           │
           v
┌──────────────────────────────────┐
│ Database Queries:                │
│ • Get jobs for user              │
│ • For each job:                  │
│   - Count applications           │
│   - Count accepted applications  │
└──────────┬───────────────────────┘
           │
           v
┌──────────────────────────────────┐
│ Sort & Group:                    │
│ • pending jobs list              │
│ • completed jobs list            │
│ • Calculate statistics           │
└──────────┬───────────────────────┘
           │
           v
┌──────────────────────────────────┐
│ Return DashboardData Response    │
│ {                                │
│   pending: [...],                │
│   completed: [...]               │
│ }                                │
└──────────┬───────────────────────┘
           │
           v (HTTP 200 JSON)
┌──────────────────────────────────┐
│ React Component receives data    │
│ setPendingJobs()                 │
│ setCompletedJobs()               │
│ calculateStatistics()            │
│ setLoading(false)                │
└──────────┬───────────────────────┘
           │
           v
┌──────────────────────────────────┐
│ Component re-renders with:       │
│ • Statistics cards (4 metrics)   │
│ • Tab navigation                 │
│ • Job cards with app counts      │
│ • Empty states if needed         │
│ • Post job button                │
└──────────┬───────────────────────┘
           │
           v
┌──────────────────────────────────┐
│ User sees dashboard              │
│ • Can view job applications      │
│ • Can delete jobs                │
│ • Can post new job               │
│ • Can switch tabs                │
└──────────────────────────────────┘
```

---

## Component Structure

### JobSeekerDashboard.jsx Structure

```
JobSeekerDashboard
├── State Management
│   ├── pendingApplications: []
│   ├── completedApplications: []
│   ├── loading: boolean
│   └── activeTab: 'pending' | 'completed'
│
├── Effects
│   └── useEffect(() => {
│         fetchDashboardData()
│       })
│
├── Functions
│   ├── fetchDashboardData()
│   │   └── api.get('/jobs/dashboard/applicant')
│   ├── formatBudget()
│   └── formatDate()
│
├── Render
│   ├── Header section
│   ├── Statistics Cards (3x)
│   │   ├── Pending count
│   │   ├── Accepted count
│   │   └── Total count
│   ├── Tab Navigation
│   │   ├── Pending tab
│   │   └── Completed tab
│   └── Content section
│       ├── Loading spinner (if loading)
│       ├── Empty state (if no apps)
│       └── Application Cards (map)
│           ├── Job title (link)
│           ├── Status badge
│           ├── Job details
│           ├── Budget info
│           ├── Proposal preview
│           ├── Applied date
│           └── Action buttons
│               ├── View Details link
│               └── Message button (if accepted)
```

### JobOwnerDashboard.jsx Structure

```
JobOwnerDashboard
├── State Management
│   ├── pendingJobs: []
│   ├── completedJobs: []
│   ├── loading: boolean
│   └── activeTab: 'pending' | 'completed'
│
├── Effects
│   └── useEffect(() => {
│         fetchDashboardData()
│       })
│
├── Functions
│   ├── fetchDashboardData()
│   │   └── api.get('/jobs/dashboard/owner')
│   ├── handleDeleteJob()
│   ├── formatBudget()
│   └── formatDate()
│
├── Render
│   ├── Header section with action button
│   │   └── Post New Job button
│   ├── Statistics Cards (4x)
│   │   ├── Total jobs
│   │   ├── Total applications
│   │   ├── Accepted applications
│   │   └── Open jobs
│   ├── Tab Navigation
│   │   ├── Open & In Progress tab
│   │   └── Completed tab
│   └── Content section
│       ├── Loading spinner (if loading)
│       ├── Empty state (if no jobs)
│       └── Job Cards (map)
│           ├── Job title (link)
│           ├── Status badge
│           ├── Job details
│           ├── Budget info
│           ├── Type and location
│           ├── Application stats box
│           │   ├── Total applications count
│           │   └── Accepted count
│           ├── Posted date
│           └── Action buttons
│               ├── View Applications link
│               ├── Edit button
│               └── Delete button
│                   └── Confirmation dialog
```

---

## API Response Structure

### Applicant Dashboard Response

```json
{
  "pending": [
    {
      "id": 1,
      "job_id": 10,
      "applicant_id": 5,
      "cover_letter": "I'm very interested in this project...",
      "proposed_price": 500,
      "status": "pending",
      "created_at": "2024-01-15T10:30:00",
      "job": {
        "id": 10,
        "title": "Web Development Project",
        "description": "Build a responsive React website",
        "budget": 1000,
        "budget_min": 800,
        "budget_max": 1200,
        "budget_currency": "USD",
        "category": "web",
        "skills_required": "React, Node.js, MongoDB",
        "job_type": "contract",
        "location": "Remote",
        "is_remote": true,
        "deadline": "2024-02-15T23:59:59",
        "status": "open",
        "created_at": "2024-01-10T09:00:00",
        "updated_at": "2024-01-10T09:00:00",
        "creator": {
          "id": 1,
          "username": "john_employer",
          "full_name": "John Smith",
          "email": "john@example.com"
        }
      }
    }
  ],
  "completed": [
    {
      "id": 2,
      "job_id": 11,
      "applicant_id": 5,
      "cover_letter": "I have experience with similar projects",
      "proposed_price": 750,
      "status": "accepted",
      "created_at": "2024-01-08T14:20:00",
      "job": {
        "id": 11,
        "title": "Mobile App Design",
        "status": "completed",
        "...": "..."
      }
    }
  ]
}
```

### Owner Dashboard Response

```json
{
  "pending": [
    {
      "id": 10,
      "title": "Web Development Project",
      "description": "Build a responsive React website",
      "budget": 1000,
      "budget_min": 800,
      "budget_max": 1200,
      "budget_currency": "USD",
      "category": "web",
      "skills_required": "React, Node.js, MongoDB",
      "job_type": "contract",
      "location": "Remote",
      "is_remote": true,
      "deadline": "2024-02-15T23:59:59",
      "status": "open",
      "created_at": "2024-01-10T09:00:00",
      "updated_at": "2024-01-10T09:00:00",
      "applications_count": 5,
      "accepted_count": 1
    }
  ],
  "completed": [
    {
      "id": 11,
      "title": "Mobile App Design",
      "status": "completed",
      "applications_count": 8,
      "accepted_count": 2,
      "...": "..."
    }
  ]
}
```

---

## Database Schema Relationships

```
┌─────────────────────┐
│      Users          │
├─────────────────────┤
│ id (PK)             │
│ email               │
│ username            │
│ full_name           │
│ primary_role        │◄────────────┐
│ ...                 │             │
└──────────┬──────────┘             │
           │                        │
           │ creator_id (1:M)       │
           v                        │
┌─────────────────────┐             │
│      Jobs           │             │
├─────────────────────┤             │
│ id (PK)             │             │
│ title               │             │
│ description         │             │
│ budget              │             │
│ creator_id (FK) ────┼─────────────┘
│ status              │
│ ...                 │
└──────────┬──────────┘
           │
           │ job_id (1:M)
           v
┌─────────────────────┐
│   Applications      │
├─────────────────────┤
│ id (PK)             │
│ job_id (FK) ────────┘
│ applicant_id (FK) ──┐
│ cover_letter        │
│ proposed_price      │
│ status              │
│ created_at          │
└─────────────────────┘
           ▲
           │
           └─────────┬──────┐
                     │      │
                     │      │ applicant_id (M:1)
                     │      │
                     │      v
                     └─ Users (id)
```

---

## Authentication Flow

```
┌─────────────────────────────────┐
│  User clicks dashboard link     │
└──────────────┬──────────────────┘
               │
               v
        ┌──────────────┐
        │ React Router │
        │ checks route │
        └──────┬───────┘
               │
               v
        ┌──────────────────────┐
        │ <ProtectedRoute>     │
        │ wrapper checks if    │
        │ user is logged in    │
        └──────┬───────────────┘
               │
        ┌──────┴──────┐
        │             │
      NO              YES
        │             │
        v             v
   Redirect to  ┌─────────────────┐
   /login       │ Load dashboard  │
               │ component       │
               └────────┬────────┘
                        │
                        v
                ┌─────────────────┐
                │ Component mounts│
                │ calls API with  │
                │ JWT token in    │
                │ Authorization   │
                │ header          │
                └────────┬────────┘
                        │
                        v
                ┌─────────────────┐
                │ Backend checks  │
                │ valid JWT token │
                └────────┬────────┘
                        │
                   ┌────┴────┐
                   │         │
              INVALID      VALID
                   │         │
                   v         v
              Return 401  Query DB
              (Unauthorized) for user data
                         │
                         v
                   Return only
                   current user's
                   data
```

---

## File Organization

```
Frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx (Modified)
│   │   ├── JobSeekerDashboard.jsx (New)
│   │   ├── JobOwnerDashboard.jsx (New)
│   │   ├── MyApplications.jsx (Existing)
│   │   ├── MyJobs.jsx (Existing)
│   │   └── ... other pages
│   ├── App.jsx (Modified - routes added)
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── components/
│   │   └── ProtectedRoute.jsx
│   └── services/
│       └── api.js
│
Backend/
├── routes/
│   ├── jobs.py (Modified - endpoints added)
│   ├── applications.py
│   └── ... other routes
├── models.py
├── schemas.py
├── main.py
└── database.py

Documentation/
├── DASHBOARDS_ARCHITECTURE.md (This file)
├── DASHBOARDS_GUIDE.md
├── DASHBOARDS_IMPLEMENTATION.md
└── DASHBOARDS_QUICK_START.md
```

---

## Performance Considerations

### Frontend Performance
- ✅ Single API call on mount
- ✅ Tab switching is instant (no API calls)
- ✅ Memoization can be added for expensive renders
- ✅ Virtual scrolling can be added for large lists

### Backend Performance
- ✅ Indexed queries on user IDs
- ✅ No N+1 queries (relationships eager loaded)
- ✅ Minimal data transfer
- ✅ Can add pagination for large datasets

### Caching Strategy
- Frontend: Components cache data until unmount
- Backend: Could add Redis caching for frequently accessed data
- Browser: Leverages HTTP caching headers

---

## Security Measures

```
┌─────────────────────────────────────────┐
│   Request to /api/jobs/dashboard/*      │
├─────────────────────────────────────────┤
│                                         │
│  1. JWT Token Validation                │
│     └─ Extract token from header        │
│     └─ Verify signature                 │
│     └─ Check expiration                 │
│                                         │
│  2. User Identification                 │
│     └─ Decode token to get user_id      │
│     └─ Verify user exists in DB         │
│                                         │
│  3. Database Query Filtering            │
│     └─ For applicant: filter by         │
│        applicant_id = current_user.id   │
│     └─ For owner: filter by             │
│        creator_id = current_user.id     │
│                                         │
│  4. Response Validation                 │
│     └─ Validate response schema         │
│     └─ No sensitive data leaks          │
│     └─ Only user's own data returned    │
│                                         │
└─────────────────────────────────────────┘
```

---

## Scaling Considerations

### Current Limitations
- No pagination (loads all data at once)
- No caching layer
- No database query optimization beyond indexes

### How to Scale
1. **Add Pagination** - Limit results, add offset/limit params
2. **Add Caching** - Redis cache frequently accessed data
3. **Database Indexes** - Ensure indexes on user_id, creator_id, status
4. **Lazy Loading** - Load more button instead of all at once
5. **Background Jobs** - Pre-compute statistics
6. **API Response Compression** - Gzip responses

---

## Summary

The dashboards architecture provides:
- ✅ Clean separation of concerns (frontend/backend)
- ✅ RESTful API design
- ✅ Type-safe responses (Pydantic schemas)
- ✅ Secure data access (JWT + user ID filtering)
- ✅ Responsive UI with proper error handling
- ✅ Extensible design for future features

Everything is built on solid foundations with room for growth!