import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { Briefcase, MessageSquare, Bell, TrendingUp, User, Mail, Search, Settings, BarChart, Plus, Sparkles } from 'lucide-react'
import dashboardBackground from '../assets/images/jobHero2.jpg'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    jobs: 0,
    applications: 0,
    messages: 0,
    notifications: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      setLoading(true)
      if (user?.primary_role === 'employer') {
        const jobsRes = await api.get('/jobs/?limit=1')
        setStats(prev => ({ ...prev, jobs: jobsRes.data.length }))
      } else {
        try {
          const appsRes = await api.get('/applications/me/applications')
          setStats(prev => ({ ...prev, applications: appsRes.data.length }))
        } catch (appError) {
          if (appError.response?.status === 403 || appError.response?.status === 401) {
            console.warn('Cannot fetch applications:', appError.response?.status)
            setStats(prev => ({ ...prev, applications: 0 }))
          } else {
            throw appError
          }
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" style={{ marginTop: '80px' }}>
      {/* Hero Section */}
      <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={dashboardBackground}
            alt="Dashboard background"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/25"></div>
        </div>
        
        <div className="relative z-10 h-full flex items-center justify-center px-3 xs:px-4 sm:px-6">
          <div className="text-center text-white animate-fade-in w-full max-w-4xl">
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3 lg:mb-4">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-300 animate-pulse" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
              </h1>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-300 animate-pulse" />
            </div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 max-w-2xl mx-auto leading-relaxed font-light px-2">
              {user?.primary_role === 'employer' 
                ? 'Manage your job postings and find exceptional talent'
                : 'Discover new opportunities and accelerate your career growth'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-5 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10 lg:mb-12">
          {user?.primary_role === 'employer' || user?.primary_role === 'client' ? (
            <>
              <Link 
                to="/dashboard/job-owner" 
                className="stat-card p-4 sm:p-5 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 border-l-2 sm:border-l-4 bg-white border-primary-600 hover:bg-blue-50 animate-slide-up-delay-1 min-h-[120px] sm:min-h-[140px] flex flex-col justify-center"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 truncate text-gray-600">My Jobs Dashboard</p>
                    {loading ? (
                      <div className="h-8 sm:h-10 rounded animate-pulse w-16 bg-gray-200"></div>
                    ) : (
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold truncate text-gray-900">{stats.jobs}</p>
                    )}
                  </div>
                  <div className="bg-gradient-to-br p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl shadow-lg ml-2 sm:ml-4 flex-shrink-0 from-primary-500 to-primary-600">
                    <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                </div>
              </Link>
              <Link 
                to="/jobs/post" 
                className="stat-card p-4 sm:p-5 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 animate-slide-up-delay-2 min-h-[120px] sm:min-h-[140px] flex flex-col justify-center bg-white hover:bg-blue-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-600">Post New Job</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">+</p>
                  </div>
                  <div className="bg-gradient-to-br p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl shadow-lg ml-2 sm:ml-4 flex-shrink-0 from-primary-500 to-primary-600">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                  </div>
                </div>
              </Link>
            </>
          ) : (
            <Link 
              to="/dashboard/job-seeker" 
              className="stat-card p-4 sm:p-5 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 border-l-2 sm:border-l-4 bg-white border-primary-600 hover:bg-blue-50 animate-slide-up-delay-1 min-h-[120px] sm:min-h-[140px] flex flex-col justify-center"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 truncate text-gray-600">Applications Dashboard</p>
                  {loading ? (
                      <div className="h-8 sm:h-10 rounded animate-pulse w-16 bg-gray-200"></div>
                  ) : (
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold truncate text-gray-900">{stats.applications}</p>
                  )}
                </div>
                <div className="bg-gradient-to-br p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl shadow-lg ml-2 sm:ml-4 flex-shrink-0 from-primary-500 to-primary-600">
                  <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </Link>
          )}
          
          <Link 
            to="/messages" 
            className="stat-card p-4 sm:p-5 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 animate-slide-up-delay-3 min-h-[120px] sm:min-h-[140px] flex flex-col justify-center bg-white hover:bg-blue-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-600">Messages</p>
                {loading ? (
                  <div className="h-8 sm:h-10 rounded animate-pulse w-16 bg-gray-200"></div>
                ) : (
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{stats.messages}</p>
                )}
              </div>
              <div className="bg-gradient-to-br p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl shadow-lg ml-2 sm:ml-4 flex-shrink-0 from-primary-500 to-primary-600">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
              </div>
            </div>
          </Link>
          
          <Link 
            to="/notifications" 
            className="stat-card p-4 sm:p-5 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 animate-slide-up-delay-4 min-h-[120px] sm:min-h-[140px] flex flex-col justify-center bg-white hover:bg-blue-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-600">Notifications</p>
                {loading ? (
                  <div className="h-8 sm:h-10 rounded animate-pulse w-16 bg-gray-200"></div>
                ) : (
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{stats.notifications}</p>
                )}
              </div>
              <div className="bg-gradient-to-br p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl shadow-lg ml-2 sm:ml-4 flex-shrink-0 from-primary-500 to-primary-600">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions Section */}
        <div className="rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 animate-fade-in-delay-2 bg-white">
          <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            {user?.primary_role === 'freelancer' && (
              <Link 
                to="/analytics" 
                className="hidden xs:flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-200 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300"
              >
                <BarChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                View Analytics
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {user?.primary_role === 'employer' ? (
              <Link
                to="/jobs/post"
                className="action-button primary bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 sm:px-5 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-center font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary-500/25 flex items-center justify-center gap-2 sm:gap-3"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Post New Job</span>
              </Link>
            ) : (
              <Link
                to="/jobs"
                className="action-button primary bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 sm:px-5 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-center font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary-500/25 flex items-center justify-center gap-2 sm:gap-3"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Browse Jobs</span>
              </Link>
            )}
            
            {/* Show Analytics button for freelancers on mobile */}
            {user?.primary_role === 'freelancer' && (
              <Link
                to="/analytics"
                className="xs:hidden action-button secondary px-4 sm:px-5 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-center font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md border flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300 border-gray-200"
              >
                <BarChart className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Analytics</span>
              </Link>
            )}
            
            <Link
              to="/profile"
              className="action-button secondary px-4 sm:px-5 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-center font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md border flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300 border-gray-200"
            >
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Edit Profile</span>
            </Link>
            
            <Link
              to="/messages"
              className="action-button secondary px-4 sm:px-5 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-center font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md border flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800 hover:from-blue-100 hover:to-blue-200 border-blue-200"
            >
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">View Messages</span>
            </Link>
          </div>
        </div>

        {/* Bottom Tip Section */}
        <div className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex-shrink-0 bg-primary-100">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm sm:text-base font-medium mb-0.5 sm:mb-1 text-primary-800">Pro Tip</p>
              <p className="text-xs sm:text-sm text-primary-700">
                {user?.primary_role === 'employer' 
                  ? 'Keep your profile updated to attract the best talent. Consider using featured job posts for better visibility.'
                  : 'Complete your profile and portfolio to increase your chances of getting hired. Set up job alerts for new opportunities.'
                }
              </p>
              <Link 
                to="/profile" 
                className="inline-flex items-center gap-1 mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-800"
              >
                Update your profile now
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
