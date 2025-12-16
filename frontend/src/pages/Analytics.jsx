import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { TrendingUp, Award, CheckCircle, DollarSign, Loader, BarChart3, Users, Clock, Target } from 'lucide-react'

const Analytics = () => {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) fetchAnalytics()
  }, [user])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await api.get('/analytics/user-dashboard')
      setAnalytics(response.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ paddingTop: '80px' }}>
        <div className="text-center">
          <Loader className="h-10 w-10 sm:h-12 sm:w-12 text-primary-600 animate-spin mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">Loading your analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-3 sm:px-4 lg:px-8 py-6 sm:py-8" style={{ marginTop: '80px' }}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4 text-red-700 text-sm sm:text-base">
            {error}
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-3 sm:px-4 lg:px-8 py-6 sm:py-8" style={{ marginTop: '80px' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-gray-600 text-sm sm:text-base">No analytics data available.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ paddingTop: '80px' }}>
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary-600" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Your Analytics Dashboard</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Track your performance and growth metrics</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 sm:p-5 lg:p-6 border-l-2 sm:border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">Total Earnings</p>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  ${analytics.total_earnings.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">
                  Lifetime earnings
                </p>
              </div>
              <div className="flex-shrink-0 ml-2">
                <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg sm:rounded-xl">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 sm:p-5 lg:p-6 border-l-2 sm:border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">Completion Rate</p>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {analytics.completion_rate}%
                </p>
                <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">
                  {analytics.total_completed_jobs} of {analytics.total_accepted_jobs} jobs
                </p>
              </div>
              <div className="flex-shrink-0 ml-2">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg sm:rounded-xl">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 sm:p-5 lg:p-6 border-l-2 sm:border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">Average Rating</p>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {analytics.average_rating.toFixed(1)} / 5.0
                </p>
                <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">
                  {analytics.total_reviews} review{analytics.total_reviews !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex-shrink-0 ml-2">
                <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg sm:rounded-xl">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 sm:p-5 lg:p-6 border-l-2 sm:border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                    {analytics.user_role === 'employer' ? 'Jobs Posted' : 'Applications'}
                  </p>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {analytics.user_role === 'employer'
                    ? analytics.monthly_activity.reduce((sum, m) => sum + m.posted, 0)
                    : analytics.monthly_activity.reduce((sum, m) => sum + m.submitted, 0)
                  }
                </p>
                <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">Last 12 months</p>
              </div>
              <div className="flex-shrink-0 ml-2">
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg sm:rounded-xl">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Earnings Over Time */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-2 sm:mb-3 lg:mb-4">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Earnings Over Time</h2>
            </div>
            <div className="h-[250px] sm:h-[280px] lg:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.earnings_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6b7280' }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Earnings']}
                    contentStyle={{ 
                      fontSize: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: '12px',
                      paddingTop: '10px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Monthly Earnings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rating Trend */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-2 sm:mb-3 lg:mb-4">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Rating Trend</h2>
            </div>
            <div className="h-[250px] sm:h-[280px] lg:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.ratings_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    domain={[0, 5]}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip 
                    formatter={(value) => [value.toFixed(2), 'Rating']}
                    contentStyle={{ 
                      fontSize: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: '12px',
                      paddingTop: '10px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Average Rating"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Monthly Activity */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-2 sm:mb-3 lg:mb-4">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                {analytics.user_role === 'employer' ? 'Monthly Jobs Posted' : 'Monthly Applications'}
              </h2>
            </div>
            <div className="h-[250px] sm:h-[280px] lg:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthly_activity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: '12px',
                      paddingTop: '10px'
                    }}
                  />
                  {analytics.user_role === 'employer' ? (
                    <Bar 
                      dataKey="posted" 
                      fill="#3b82f6" 
                      name="Jobs Posted"
                      radius={[4, 4, 0, 0]}
                    />
                  ) : (
                    <>
                      <Bar 
                        dataKey="submitted" 
                        fill="#3b82f6" 
                        name="Applications Submitted"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="accepted" 
                        fill="#10b981" 
                        name="Applications Accepted"
                        radius={[4, 4, 0, 0]}
                      />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-2 sm:mb-3 lg:mb-4">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Job Completion Status</h2>
            </div>
            <div className="h-[250px] sm:h-[280px] lg:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: analytics.total_completed_jobs },
                      { name: 'Pending', value: analytics.total_accepted_jobs - analytics.total_completed_jobs }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    contentStyle={{ 
                      fontSize: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: '12px',
                      paddingTop: '10px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-sm sm:text-base text-gray-600">
                <span className="font-semibold text-gray-900">{analytics.completion_rate}%</span>{" "}
                of accepted jobs completed
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                ({analytics.total_completed_jobs} completed, {analytics.total_accepted_jobs - analytics.total_completed_jobs} pending)
              </p>
            </div>
          </div>
        </div>

        {/* Tip Box */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-200 rounded-lg sm:rounded-xl flex-shrink-0">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-medium text-blue-800 mb-1">Analytics Tip</p>
              <p className="text-xs sm:text-sm text-blue-700">
                Hover over the charts to see detailed information. Your analytics update based on your real activity.
                {analytics.user_role === 'freelancer' ? " Complete more jobs to increase your earnings and rating." : 
                 analytics.user_role === 'employer' ? " Post consistent jobs to attract more talent." : ""}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Analytics