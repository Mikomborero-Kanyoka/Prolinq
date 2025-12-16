import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { MapPin, DollarSign, Clock, MessageSquare, CheckCircle, ArrowLeft, Briefcase, Filter, Search } from 'lucide-react'

const MyApplications = () => {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, accepted, rejected
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [filter])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const response = await api.get('/applications/me/applications')
      let filtered = response.data
      
      if (filter !== 'all') {
        filtered = filtered.filter(app => app.status === filter)
      }
      
      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(app => 
          app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          application.cover_letter?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      setApplications(filtered)
    } catch (error) {
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const formatBudget = (min, max, currency) => {
    if (!min && !max) return 'Negotiable'
    if (min && max) return `${currency} ${min} - ${max}`
    if (min) return `${currency} ${min}+`
    if (max) return `Up to ${currency} ${max}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-gradient-to-r from-green-100 to-emerald-50 text-green-700 border border-green-200'
      case 'rejected':
        return 'bg-gradient-to-r from-red-100 to-rose-50 text-red-700 border border-red-200'
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-amber-50 text-yellow-700 border border-yellow-200'
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return '✓'
      case 'rejected':
        return '✗'
      case 'pending':
        return '⏳'
      default:
        return '📄'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50" style={{ marginTop: '80px' }}>
      {/* Header with Back Button - Increased left padding */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto pl-6 sm:pl-8 lg:pl-10 pr-4 sm:pr-6 lg:pr-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <Link
                to="/dashboard"
                className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Increased left padding */}
      <div className="max-w-7xl mx-auto pl-6 sm:pl-8 lg:pl-10 pr-4 sm:pr-6 lg:pr-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
              <p className="text-gray-600">Track all your job applications in one place</p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applications..."
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filter Tabs - Modern Design */}
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by Status</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Applications
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  filter === 'pending'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-md'
                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                }`}
              >
                ⏳ Pending
              </button>
              <button
                onClick={() => setFilter('accepted')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  filter === 'accepted'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                    : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                }`}
              >
                ✓ Accepted
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  filter === 'rejected'
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                ✗ Rejected
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't applied to any jobs yet." 
                : `You don't have any ${filter} applications.`}
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
            >
              <Search className="h-5 w-5" />
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-5 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-5 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {applications.filter(app => app.status === 'pending').length}
                    </p>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-5 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Accepted</p>
                    <p className="text-2xl font-bold text-green-600">
                      {applications.filter(app => app.status === 'accepted').length}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Applications List */}
            <div className="grid grid-cols-1 gap-6">
              {applications.map((application) => (
                <div 
                  key={application.id} 
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Left Column - Application Details */}
                    <div className="flex-1">
                      {/* Application Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <Link
                              to={`/jobs/${application.job_id}`}
                              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {application.job?.title || `Job #${application.job_id}`}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(application.status)}`}>
                                {getStatusIcon(application.status)} {application.status.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-gray-500">
                                Applied {new Date(application.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {application.job && (
                          <div className="flex flex-wrap gap-2">
                            {application.job.location && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                {application.job.location}
                              </div>
                            )}
                            {application.job.job_type && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                {application.job.job_type.replace('_', ' ')}
                              </div>
                            )}
                            {application.job.budget_min && (
                              <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                                <DollarSign className="h-4 w-4" />
                                {formatBudget(application.job.budget_min, application.job.budget_max, application.job.budget_currency)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Cover Letter Preview */}
                      {application.cover_letter && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Your Cover Letter</h4>
                          <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-3">
                            {application.cover_letter}
                          </p>
                          {application.cover_letter.length > 200 && (
                            <button className="text-blue-600 text-sm font-medium mt-2 hover:text-blue-700">
                              Read full cover letter
                            </button>
                          )}
                        </div>
                      )}

                      {/* Job Preview (if available) */}
                      {application.job?.description && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-sm text-gray-700 mb-2">Job Description Preview</h4>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {application.job.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Actions */}
                    <div className="lg:w-64">
                      <div className="space-y-3">
                        {/* Message Employer Button (only for accepted) */}
                        {application.status === 'accepted' && application.job?.employer_id && (
                          <Link
                            to={`/messages/${application.job.employer_id}`}
                            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Message Employer
                          </Link>
                        )}

                        {/* View Job Details Button */}
                        <Link
                          to={`/jobs/${application.job_id}`}
                          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
                        >
                          <Briefcase className="h-4 w-4" />
                          View Job Details
                        </Link>

                        {/* Status Info */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h5 className="text-xs font-semibold text-gray-700 mb-1">Application Status</h5>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              application.status === 'accepted' ? 'bg-green-500' :
                              application.status === 'rejected' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`}></div>
                            <span className="text-sm font-medium capitalize">
                              {application.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Last updated: {new Date(application.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State for Filter */}
            {applications.length === 0 && searchQuery && (
              <div className="text-center py-8 bg-white rounded-xl shadow p-6 border border-gray-200">
                <p className="text-gray-600 mb-4">
                  No applications found matching "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyApplications