# Analytics Dashboard - Quick Start Guide

## ⚡ Quick Setup (2 Minutes)

### Step 1: Install Recharts
```powershell
Set-Location "c:\Users\Querllett\Desktop\Prolinq3.0\frontend"
npm install recharts
```

### Step 2: Restart Your Services
- Restart backend: Stop and run `python main.py` again
- Frontend will auto-refresh if running on dev server

### Step 3: Access Analytics
1. Login to your application
2. Click the **chart icon** in the navbar (between "Completed" and "Profile")
3. Or go to: `http://localhost:5173/analytics`

## 📊 What You'll See

### 4 Key Metrics at the Top:
- **Total Earnings** - Sum of all completed jobs (💚 Green)
- **Completion Rate** - % of jobs you completed (💙 Blue)
- **Average Rating** - Your average user rating (💛 Yellow)
- **Activity Count** - Jobs posted or applications sent (💜 Purple)

### 4 Interactive Charts:
1. **Earnings Over Time** (Line Chart)
   - Shows last 12 months of earnings
   - Hover for exact amounts

2. **Rating Trend** (Line Chart)
   - Your rating progression by month
   - Scale 0-5 stars

3. **Monthly Activity** (Bar Chart)
   - Jobs posted (employers) or apps sent (talent)
   - Different data for employer vs talent roles

4. **Completion Status** (Donut Chart)
   - Visual split of completed vs pending jobs
   - Shows percentage completed

## 🎯 Key Features

✅ **Real-time Data** - Fresh calculations every visit  
✅ **Role-Aware** - Different metrics for employers vs freelancers  
✅ **Responsive Design** - Works on mobile and desktop  
✅ **Interactive Charts** - Hover for details, smooth animations  
✅ **Professional UI** - Matches your existing design system  

## 🔧 Customization Options

### Change Chart Colors
Edit `frontend/src/pages/Analytics.jsx`:
- Line colors: `stroke="#10b981"` (change hex code)
- Bar colors: `fill="#3b82f6"` (change hex code)

### Change Time Range
Edit `backend/routes/analytics.py`:
- Change `range(11, -1, -1)` to get different number of months
- Currently shows last 12 months

### Add More Metrics
1. Add calculation in `backend/routes/analytics.py`
2. Add chart in `frontend/src/pages/Analytics.jsx`
3. Use Recharts components: LineChart, BarChart, PieChart, etc.

## 📋 Data Requirements

For analytics to show data, you need:
- ✅ Completed jobs (status = "completed")
- ✅ Reviews with ratings
- ✅ Applications marked as "accepted"

**Example**: If you have 0 completed jobs, earnings will show $0.

## 🐛 Troubleshooting

**"Charts not showing"**
→ Check browser console (F12) for errors  
→ Verify `npm install recharts` was successful

**"No data appearing"**
→ You need completed jobs or reviews in database  
→ Make sure jobs have status "completed"

**"API Error 401"**
→ Your token expired, login again

**"API Error 404"**
→ Backend not running or analytics route not added

## 📁 What Changed

### Created:
- `backend/routes/analytics.py` - Backend API
- `frontend/src/pages/Analytics.jsx` - Frontend dashboard

### Modified:
- `frontend/package.json` - Added Recharts
- `frontend/src/App.jsx` - Added route
- `frontend/src/components/Navbar.jsx` - Added link
- `backend/main.py` - Imported analytics
- `backend/routes/__init__.py` - Registered analytics

## 🚀 Next Steps

1. ✅ Install Recharts: `npm install recharts`
2. ✅ Restart services
3. ✅ Navigate to `/analytics`
4. ✅ See your charts!

## 💡 Tips

- **For Testing**: Create some test jobs and mark them complete to see data
- **For Employers**: Focus on jobs posted and completion metrics
- **For Talent**: Track earnings and rating trends to improve your profile
- **Best View**: Charts work best on screens 1024px+ wide

## 📞 Support Files

Detailed info: `ANALYTICS_DASHBOARD_SETUP.md`  
API Details: Check `backend/routes/analytics.py` docstrings

---

**Ready? Go to `/analytics` and check out your stats! 📈**