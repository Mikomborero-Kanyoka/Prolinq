# Analytics Dashboard - Code Examples & Extensions

## Available Metrics

The analytics endpoint provides the following data:

```python
{
    "earnings_trend": List[Dict],           # Monthly earnings (last 12 months)
    "completion_rate": float,               # Percentage of jobs completed
    "total_completed_jobs": int,            # Count of completed jobs
    "total_accepted_jobs": int,             # Count of accepted jobs
    "ratings_trend": List[Dict],            # Monthly ratings (last 12 months)
    "total_reviews": int,                   # Total reviews received
    "average_rating": float,                # Average rating (0-5)
    "monthly_activity": List[Dict],         # Activity breakdown by month
    "total_earnings": float,                # Total earnings all time
    "user_role": str                        # "talent", "employer", or "client"
}
```

## Chart Examples

### 1. Adding a New Chart - Skills Distribution

**Frontend Component**:
```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Add to your data structure
const skillsData = [
  { skill: "React", jobs: 15 },
  { skill: "Python", jobs: 12 },
  { skill: "Design", jobs: 8 }
]

// Add to your component JSX
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills Performance</h2>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={skillsData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="skill" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="jobs" fill="#8b5cf6" name="Jobs Completed" />
    </BarChart>
  </ResponsiveContainer>
</div>
```

### 2. Radar Chart - Performance Overview

```jsx
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

const performanceData = [
  { category: "Earnings", value: (totalEarnings / 5000) * 100 },
  { category: "Completion Rate", value: completionRate },
  { category: "Rating", value: (averageRating / 5) * 100 },
  { category: "Response Time", value: avgResponseTime }
]

// JSX:
<ResponsiveContainer width="100%" height={400}>
  <RadarChart data={performanceData}>
    <PolarGrid />
    <PolarAngleAxis dataKey="category" />
    <PolarRadiusAxis />
    <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
  </RadarChart>
</ResponsiveContainer>
```

### 3. Combo Chart - Earnings vs Completion

```jsx
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

// JSX:
<ResponsiveContainer width="100%" height={300}>
  <ComposedChart data={analytics.earnings_trend}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis yAxisId="left" />
    <YAxis yAxisId="right" orientation="right" />
    <Tooltip />
    <Legend />
    <Bar yAxisId="left" dataKey="earnings" fill="#10b981" name="Earnings" />
    <Line yAxisId="right" type="monotone" dataKey="completionRate" stroke="#f59e0b" name="Completion %" />
  </ComposedChart>
</ResponsiveContainer>
```

## Backend Extension Examples

### Adding Skills Breakdown to Backend

```python
# In backend/routes/analytics.py

@router.get("/user-dashboard/skills-breakdown")
def get_skills_breakdown(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get job breakdown by skills"""
    
    # Parse skills from jobs completed by user
    skills_dict = {}
    
    jobs = db.query(Job).filter(
        and_(
            Job.status == "completed",
            Job.applications.any(
                and_(
                    Application.applicant_id == current_user.id,
                    Application.status == "accepted"
                )
            )
        )
    ).all()
    
    for job in jobs:
        skills = job.skills_required.split(',')
        for skill in skills:
            skill = skill.strip()
            skills_dict[skill] = skills_dict.get(skill, 0) + 1
    
    return {
        "skills": [
            {"skill": k, "jobs": v} 
            for k, v in sorted(skills_dict.items(), key=lambda x: x[1], reverse=True)
        ]
    }
```

### Adding Response Time Metric

```python
from datetime import datetime, timedelta

@router.get("/user-dashboard/response-metrics")
def get_response_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get average response time for applications"""
    
    applications = db.query(Application).filter(
        Application.applicant_id == current_user.id
    ).all()
    
    response_times = []
    
    for app in applications:
        job = app.job
        if job.created_at and app.created_at:
            time_diff = (app.created_at - job.created_at).total_seconds() / 3600  # hours
            response_times.append(time_diff)
    
    avg_response_time = sum(response_times) / len(response_times) if response_times else 0
    
    return {
        "average_response_hours": round(avg_response_time, 2),
        "responses_tracked": len(response_times)
    }
```

## Frontend Data Manipulation Examples

### Filter Data by Date Range

```jsx
const filterByDateRange = (data, startDate, endDate) => {
  return data.filter(item => {
    const itemDate = new Date(item.date)
    return itemDate >= startDate && itemDate <= endDate
  })
}

// Usage:
const lastMonth = filterByDateRange(
  analytics.earnings_trend,
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  new Date()
)
```

### Calculate Growth Rate

```jsx
const calculateGrowth = (currentValue, previousValue) => {
  if (previousValue === 0) return 0
  return ((currentValue - previousValue) / previousValue) * 100
}

// Usage:
const earningsGrowth = calculateGrowth(
  analytics.earnings_trend[11].earnings,
  analytics.earnings_trend[0].earnings
)
```

### Format Large Numbers

```jsx
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}
```

## Advanced Recharts Features

### Custom Tooltip

```jsx
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded shadow border border-gray-200">
        <p className="text-sm font-semibold text-gray-900">
          {payload[0].payload.month}
        </p>
        <p className="text-sm text-blue-600">
          ${payload[0].value.toFixed(2)}
        </p>
      </div>
    )
  }
  return null
}

// Usage in chart:
<LineChart data={analytics.earnings_trend}>
  <Tooltip content={<CustomTooltip />} />
</LineChart>
```

### Animated Bar Chart

```jsx
<Bar 
  dataKey="earnings" 
  fill="#10b981" 
  name="Monthly Earnings"
  isAnimationActive={true}
  animationDuration={800}
/>
```

### Responsive Text

```jsx
const [windowWidth, setWindowWidth] = useState(window.innerWidth)

useEffect(() => {
  const handleResize = () => setWindowWidth(window.innerWidth)
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])

const chartHeight = windowWidth < 768 ? 250 : 300
```

## Export Examples

### Export to CSV

```jsx
const exportToCSV = (data, filename) => {
  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

// Usage:
exportToCSV(analytics.earnings_trend, 'earnings-report.csv')
```

### Export to PDF (requires jspdf library)

```jsx
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const exportToPDF = async (elementId, filename) => {
  const element = document.getElementById(elementId)
  const canvas = await html2canvas(element)
  const pdf = new jsPDF()
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0)
  pdf.save(filename)
}

// Usage:
exportToPDF('analytics-dashboard', 'analytics-report.pdf')
```

## Performance Tips

1. **Memoize Calculations**:
```jsx
const memoizedAnalytics = useMemo(() => {
  return calculateExpensiveMetrics(data)
}, [data])
```

2. **Lazy Load Charts**:
```jsx
import dynamic from 'next/dynamic'
const AnalyticsChart = dynamic(() => import('./AnalyticsChart'), {
  loading: () => <div>Loading chart...</div>
})
```

3. **Cache API Responses**:
```jsx
const [analyticsCache, setAnalyticsCache] = useState({})
const [cacheTime, setCacheTime] = useState(null)

const fetchAnalyticsWithCache = async () => {
  const now = new Date().getTime()
  if (analyticsCache && cacheTime && now - cacheTime < 300000) {
    return analyticsCache // 5 min cache
  }
  
  const data = await api.get('/analytics/user-dashboard')
  setAnalyticsCache(data.data)
  setCacheTime(now)
  return data.data
}
```

## Testing Analytics Data

### Mock Data for Development

```jsx
const mockAnalyticsData = {
  earnings_trend: [
    { month: 'Jan 2024', earnings: 500 },
    { month: 'Feb 2024', earnings: 750 },
    // ... more months
  ],
  completion_rate: 85.5,
  total_completed_jobs: 17,
  total_accepted_jobs: 20,
  ratings_trend: [
    { month: 'Jan 2024', rating: 4.5 },
    // ... more months
  ],
  total_reviews: 25,
  average_rating: 4.7,
  monthly_activity: [
    { month: 'Jan 2024', submitted: 5, accepted: 2 },
    // ... more months
  ],
  total_earnings: 5000,
  user_role: 'talent'
}

// In your component:
const [analytics, setAnalytics] = useState(mockAnalyticsData)
```

---

**Pro Tips:**
- Always format large numbers for readability
- Use consistent color schemes with your branding
- Add loading states for better UX
- Test on mobile and desktop
- Keep API calls optimized with proper filtering