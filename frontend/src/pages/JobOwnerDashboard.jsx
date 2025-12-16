import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { MapPin, DollarSign, Clock, Users, CheckCircle, Briefcase, Trash2, Edit2, Check, Plus, ArrowRight, Calendar, BarChart, Award, Target, TrendingUp, Filter, Search } from 'lucide-react'
import { motion } from 'framer-motion'

const JobOwnerDashboard = () => {
  const { user } = useAuth()
  const [pendingJobs, setPendingJobs] = useState([])
  const [completedJobs, setCompletedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all') // all, open, in_progress

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/jobs/dashboard/owner')
      setPendingJobs(response.data.pending || [])
      setCompletedJobs(response.data.completed || [])
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }


  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      await api.delete(`/jobs/${jobId}`)
      toast.success('Job deleted successfully')
      fetchDashboardData()
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error('Failed to delete job')
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

  // Filter and search jobs
  const getFilteredJobs = () => {
    let jobs = activeTab === 'pending' ? pendingJobs : completedJobs
    
    // Apply status filter for pending tab
    if (activeTab === 'pending' && filter !== 'all') {
      jobs = jobs.filter(job => job.status === filter)
    }
    
    // Apply search
    if (searchQuery) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return jobs
  }

  const renderJobCard = (job, showDelete = false) => (
    <motion.div
      key={job.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              job.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
              job.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
              'bg-yellow-100 text-yellow-700 border border-yellow-200'
            }`}>
              {job.status === 'completed' ? '✓ Completed' : job.status === 'in_progress' ? '⏳ In Progress' : '📢 Open'}
            </span>
            <span className="text-xs text-gray-500">
              Posted {formatDate(job.created_at)}
            </span>
          </div>
          
          <Link
            to={`/jobs/${job.id}`}
            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {job.title}
          </Link>
          
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{job.description}</p>
        </div>
      </div>

      {/* Job Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {(job.budget || job.budget_min || job.budget_max) && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium text-gray-500">Budget</span>
            </div>
            <p className="font-semibold text-green-600 text-sm">
              {formatBudget(job.budget_min, job.budget_max, job.budget_currency)}
            </p>
          </div>
        )}

        {job.job_type && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-gray-500">Job Type</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm capitalize">
              {job.job_type.replace('_', ' ')}
            </p>
          </div>
        )}

        {job.location && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium text-gray-500">Location</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">
              {job.location} {job.is_remote && '(Remote)'}
            </p>
          </div>
        )}

        {job.deadline && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium text-gray-500">Deadline</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">
              {formatDate(job.deadline)}
            </p>
          </div>
        )}
      </div>

      {/* Applications Stats */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-700">{job.applications_count}</div>
              <div className="text-xs text-gray-600">Applications</div>
            </div>
            <div className="h-8 w-px bg-blue-300"></div>
            {job.accepted_count > 0 && (
              <div className="text-center">
                <div className="text-lg font-bold text-green-700">{job.accepted_count}</div>
                <div className="text-xs text-gray-600">Accepted</div>
              </div>
            )}
          </div>
          <Link
            to={`/jobs/${job.id}/applications`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Manage Applications
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <div className="flex-1 flex gap-3">
          <Link
            to={`/jobs/${job.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            <Edit2 className="h-4 w-4" />
            View Details & Complete Job
          </Link>
        </div>
        
        {showDelete && (
          <button
            onClick={() => handleDeleteJob(job.id, job.title)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-red-600 hover:to-rose-600 transition-all"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const totalJobs = pendingJobs.length + completedJobs.length
  const totalApplications = pendingJobs.reduce((sum, job) => sum + job.applications_count, 0) +
                            completedJobs.reduce((sum, job) => sum + job.applications_count, 0)
  const totalAccepted = pendingJobs.reduce((sum, job) => sum + job.accepted_count, 0) +
                        completedJobs.reduce((sum, job) => sum + job.accepted_count, 0)

  const filteredJobs = getFilteredJobs()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50" style={{ marginTop: '80px' }}>
      {/* Main Content - Increased left padding */}
      <div className="max-w-7xl mx-auto pl-6 sm:pl-8 lg:pl-10 pr-4 sm:pr-6 lg:pr-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Jobs Dashboard</h1>
              <p className="text-gray-600">Manage your job postings and review applications</p>
            </div>
            <Link
              to="/jobs/post"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              Post New Job
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your jobs..."
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalJobs}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {pendingJobs.length} open • {completedJobs.length} completed
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Applications</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalApplications}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {totalAccepted} accepted • {totalApplications - totalAccepted} pending
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Accepted</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalAccepted}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {Math.round((totalAccepted / totalApplications) * 100) || 0}% acceptance rate
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Open Jobs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{pendingJobs.length}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Active opportunities for talent
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'pending'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Open & In Progress ({pendingJobs.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'completed'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed ({completedJobs.length})
              </button>
            </div>
            
            {/* Status Filter for Pending Tab */}
            {activeTab === 'pending' && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open Only</option>
                  <option value="in_progress">In Progress Only</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Jobs List */}
        {activeTab === 'pending' ? (
          filteredJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No jobs found' : 'No Open Jobs'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? `No jobs match "${searchQuery}"`
                  : 'Post your first job to get started'}
              </p>
              <Link
                to="/jobs/post"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                <Plus className="h-5 w-5" />
                Post a Job
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredJobs.map(job => renderJobCard(job, true))}
            </div>
          )
        ) : (
          filteredJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No jobs found' : 'No Completed Jobs'}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? `No completed jobs match "${searchQuery}"`
                  : 'Your completed jobs will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredJobs.map(job => renderJobCard(job, true))}
            </div>
          )
        )}
      </div>

    </div>
  )
}

export default JobOwnerDashboard
