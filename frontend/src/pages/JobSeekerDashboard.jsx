import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { MapPin, DollarSign, Clock, MessageSquare, CheckCircle, Briefcase, Star } from 'lucide-react'
import ReviewsSection from '../components/ReviewsSection'
import RecommendedJobsBadge from '../components/RecommendedJobsBadge'

const JobSeekerDashboard = () => {
  const { user } = useAuth()
  const [pendingApplications, setPendingApplications] = useState([])
  const [completedApplications, setCompletedApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log('Fetching dashboard data...')
      const response = await api.get('/applications/dashboard/applicant')
      console.log('Dashboard response:', response.data)
      
      // Filter out applications that don't have valid job data
      const validPending = (response.data.pending || []).filter(app => app && app.job)
      const validCompleted = (response.data.completed || []).filter(app => app && app.job)
      
      setPendingApplications(validPending)
      setCompletedApplications(validCompleted)
      
      // Log if we filtered out invalid data
      if ((response.data.pending || []).length > validPending.length) {
        console.warn(`Filtered out ${(response.data.pending || []).length - validPending.length} invalid pending applications`)
      }
      if ((response.data.completed || []).length > validCompleted.length) {
        console.warn(`Filtered out ${(response.data.completed || []).length - validCompleted.length} invalid completed applications`)
      }
      
      // Debug: Check if completed applications have reviews (use filtered data)
      if (validCompleted.length > 0) {
        console.log('Completed applications found:', validCompleted)
        validCompleted.forEach((app, index) => {
          console.log(`Job ${index + 1}:`, app.job.title, 'ID:', app.job.id)
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatBudget = (min, max, currency) => {
    if (!min && !max) return 'Negotiable'
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
    if (min) return `${currency} ${min.toLocaleString()}+`
    if (max) return `Up to ${currency} ${max.toLocaleString()}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderApplicationCard = (app) => {
    // Guard against missing job data
    if (!app || !app.job) {
      console.warn('Application missing job data:', app)
      return null
    }

    return (
    <div key={app.id} className="bg-white rounded-lg shadow hover:shadow-md transition p-6 border-l-4 border-primary-600">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0 mb-4">
        <div className="flex-1">
          <Link
            to={`/jobs/${app.job.id}`}
            className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition block"
          >
            {app.job.title}
          </Link>
          <p className="text-sm text-gray-500 mt-1">
            by {app.job.creator?.full_name || 'Anonymous'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:ml-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              app.status === 'accepted'
                ? 'bg-green-100 text-green-800'
                : app.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {app.status === 'accepted' ? '✓ Accepted' : app.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
          </span>
          {app.job.status === 'completed' && (
            <span className="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap bg-emerald-100 text-emerald-800">
              ✓ Job Completed
            </span>
          )}
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{app.job.description}</p>

      <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
        {app.job.budget || app.job.budget_min || app.job.budget_max ? (
          <span className="flex items-center bg-gray-50 px-3 py-1 rounded">
            <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
            {formatBudget(app.job.budget_min, app.job.budget_max, app.job.budget_currency)}
          </span>
        ) : null}
        
        {app.job.job_type && (
          <span className="flex items-center bg-gray-50 px-3 py-1 rounded">
            <Briefcase className="h-4 w-4 mr-1 text-gray-500" />
            {app.job.job_type.replace('_', ' ')}
          </span>
        )}

        {app.job.location && (
          <span className="flex items-center bg-gray-50 px-3 py-1 rounded">
            <MapPin className="h-4 w-4 mr-1 text-gray-500" />
            {app.job.location} {app.job.is_remote && '(Remote)'}
          </span>
        )}
      </div>

      {app.cover_letter && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-xs text-gray-500 font-semibold mb-1">Your Proposal:</p>
          <p className="text-sm text-gray-700 line-clamp-2">{app.cover_letter}</p>
        </div>
      )}

      {/* Reviews Section for Completed Jobs */}
      {app.job.status === 'completed' && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-xs text-gray-500 font-semibold mb-2">Your Performance Review:</p>
          <ReviewsSection 
            userId={user.id} 
            compact={true}
            title={`Reviews for ${app.job.title}`}
            jobId={app.job.id}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 pt-4 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          Applied: {formatDate(app.created_at)}
        </span>
        
        {app.status === 'accepted' && app.job.creator?.id ? (
          <Link
            to={`/messages/${app.job.creator.id}`}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm font-medium w-full sm:w-auto justify-center"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Message</span>
          </Link>
        ) : (
          <Link
            to={`/jobs/${app.job.id}`}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            View Details →
          </Link>
        )}
      </div>
    </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications Dashboard</h1>
          <p className="text-gray-600">Track your job applications and manage your opportunities</p>
        </div>
        <div className="flex justify-center">
          <RecommendedJobsBadge />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Applications</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{pendingApplications.length}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Accepted Jobs</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {completedApplications.filter(a => a.status === 'accepted').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Applications</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {pendingApplications.length + completedApplications.length}
              </p>
            </div>
            <Briefcase className="h-8 w-8 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-3 font-medium transition ${
            activeTab === 'pending'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending ({pendingApplications.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-3 font-medium transition ${
            activeTab === 'completed'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed ({completedApplications.length})
        </button>
      </div>

      {/* Applications List */}
      {activeTab === 'pending' && (
        <div>
          {pendingApplications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Applications</h3>
              <p className="text-gray-600 mb-6">You haven't applied to any jobs yet</p>
              <Link
                to="/jobs"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map(renderApplicationCard)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div>
          {completedApplications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Completed Jobs</h3>
              <p className="text-gray-600">Your completed jobs will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedApplications.map(renderApplicationCard)}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default JobSeekerDashboard
