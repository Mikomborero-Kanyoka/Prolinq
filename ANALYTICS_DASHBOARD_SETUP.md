# Analytics Dashboard Setup Guide

## Overview
A comprehensive analytics dashboard has been added to the Prolinq platform with 4 different charts tracking key metrics for users.

## What Was Added

### 1. Backend Analytics Endpoint
- **File**: `backend/routes/analytics.py`
- **Endpoint**: `GET /api/analytics/user-dashboard`
- **Purpose**: Provides aggregated analytics data for the authenticated user

#### Metrics Provided:
- **Earnings Over Time**: Monthly earnings for last 12 months (for freelancers/talent)
- **Completion Rate**: Percentage of accepted jobs that have been completed
- **Ratings Trend**: Average rating received by month (last 12 months)
- **Monthly Activity**: 
  - For employers: Jobs posted per month
  - For talent: Applications submitted and accepted per month
- **Summary Statistics**: Total earnings, total reviews, average rating, etc.

### 2. Frontend Analytics Page
- **File**: `frontend/src/pages/Analytics.jsx`
- **Route**: `/analytics`
- **Features**:
  - 4 responsive charts using Recharts
  - Key statistics cards (Total Earnings, Completion Rate, Average Rating, Activity Count)
  - Real-time data fetching
  - Loading and error states
  - Mobile-friendly layout

#### Chart Types:
1. **Earnings Over Time** - Line Chart (Green)
   - Shows monthly earnings progression
   - Interactive hover for detailed values

2. **Rating Trend** - Line Chart (Amber)
   - Shows average rating progression over months
   - Scale from 0 to 5 stars

3. **Monthly Activity** - Bar Chart (Blue)
   - For employers: Shows jobs posted per month
   - For talent: Shows applications submitted and accepted
   - Dual bar visualization for talent

4. **Job Completion Status** - Donut Chart (Green/Gray)
   - Visual representation of completion vs. pending jobs
   - Shows completion percentage

### 3. Database Requirements
The system uses existing database tables:
- `users` - User information
- `jobs` - Job postings and status
- `applications` - Job applications and their status
- `reviews` - User reviews and ratings

No new database tables or migrations are required.

### 4. Dependencies Added
- **Recharts** (v2.10.3): Chart and graph library for React
- Install with: `npm install recharts`

## Installation Instructions

### Frontend Setup
1. Navigate to the frontend directory:
   ```powershell
   Set-Location "c:\Users\Querllett\Desktop\Prolinq3.0\frontend"
   ```

2. Install Recharts dependency:
   ```powershell
   npm install recharts
   ```

3. The Analytics page is already integrated into the routing system and will be accessible at `/analytics`

### Backend Setup
1. The analytics route has already been:
   - Created in `backend/routes/analytics.py`
   - Imported in `backend/main.py`
   - Added to `backend/routes/__init__.py`

2. No additional setup required - just restart your backend server

## Usage

### Accessing the Dashboard
1. Login to the application
2. Click the **chart/analytics icon** in the navigation bar (next to the profile icon)
3. Or navigate directly to `/analytics`

### What You'll See
- **Dashboard Header**: "Your Analytics Dashboard"
- **4 Summary Cards**: 
  - Total Earnings
  - Completion Rate
  - Average Rating
  - Activity Count (Jobs Posted for employers, Applications for talent)
- **4 Interactive Charts**:
  - Earnings trend over the past 12 months
  - Rating trend over the past 12 months
  - Monthly activity breakdown
  - Job completion status donut chart

### Data Refresh
- Data is fetched fresh each time you visit the analytics page
- Charts are based on completed jobs and confirmed reviews
- All values are calculated in real-time from the database

## Technical Details

### Backend Analytics Calculation

**Earnings Over Time**:
- Queries jobs where status = "completed"
- Filters for jobs where current user is the accepted applicant (freelancer)
- Sums `final_amount` by month
- Returns last 12 months of data

**Completion Rate**:
- Counts total accepted applications for the user
- Counts how many have corresponding completed jobs
- Calculates percentage

**Ratings Trend**:
- Queries reviews where user is the reviewed_user
- Calculates average rating per month
- Returns last 12 months of data

**Monthly Activity**:
- For employers: Counts jobs posted per month
- For talent: Counts applications submitted and accepted per month
- Returns last 12 months of data

### Frontend Components
- Uses React hooks (useState, useEffect) for state management
- Integrates with existing AuthContext for user authentication
- Uses API service for backend communication
- Responsive design using Tailwind CSS
- Loading and error handling included

## API Response Format

```json
{
  "earnings_trend": [
    {"month": "Jan 2024", "earnings": 500.00},
    ...
  ],
  "completion_rate": 85.5,
  "total_completed_jobs": 17,
  "total_accepted_jobs": 20,
  "ratings_trend": [
    {"month": "Jan 2024", "rating": 4.8},
    ...
  ],
  "total_reviews": 25,
  "average_rating": 4.7,
  "monthly_activity": [
    {"month": "Jan 2024", "submitted": 5, "accepted": 2},
    ...
  ],
  "total_earnings": 5000.00,
  "user_role": "talent"
}
```

## Testing Checklist

- [ ] Backend service is running
- [ ] Frontend npm dependencies installed (`npm install`)
- [ ] Login as a talent/freelancer user
- [ ] Navigate to `/analytics`
- [ ] Verify all 4 charts load without errors
- [ ] Hover over charts to see interactive tooltips
- [ ] Check that metrics match your expected data
- [ ] Test as an employer user to see job posting metrics
- [ ] Verify responsive design on mobile

## Troubleshooting

### Charts Not Loading
1. Ensure Recharts is installed: `npm install recharts`
2. Check browser console for errors
3. Verify backend is running and responding to `/api/analytics/user-dashboard`

### No Data Showing
1. Ensure you have completed jobs or reviews in the system
2. Data is only calculated from jobs with "completed" status
3. Reviews must have been created with ratings

### API Errors
1. Verify authentication token is valid
2. Check backend logs for SQL errors
3. Ensure all models and relationships are properly defined

## Future Enhancements

Potential improvements:
- Add date range filters for custom period analysis
- Export analytics to PDF/CSV
- Add weekly/daily breakdown options
- Add comparison with previous periods
- Add performance benchmarks
- Add client feedback insights
- Add project pipeline visualization
- Add skill-based performance metrics

## Files Modified

1. `frontend/package.json` - Added Recharts dependency
2. `frontend/src/App.jsx` - Added Analytics route and import
3. `frontend/src/components/Navbar.jsx` - Added Analytics link
4. `backend/main.py` - Added analytics route import
5. `backend/routes/__init__.py` - Added analytics module

## Files Created

1. `backend/routes/analytics.py` - Backend analytics endpoint
2. `frontend/src/pages/Analytics.jsx` - Frontend analytics dashboard

## Support

For issues or questions, refer to:
- Recharts documentation: https://recharts.org/
- FastAPI documentation: https://fastapi.tiangolo.com/
- React documentation: https://react.dev/