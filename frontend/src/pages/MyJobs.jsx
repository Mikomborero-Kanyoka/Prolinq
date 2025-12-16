import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { MapPin, DollarSign, Clock, Trash2 } from 'lucide-react'

const MyJobs = () => {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, open, in_progress, closed

  useEffect(() => {
    fetchJobs()
  }, [filter])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter)
      }
      
      const response = await api.get(`/jobs/me/jobs?${params.toString()}`)
      setJobs(response.data)
    } catch (error) {
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return
    }

    try {
      await api.delete(`/jobs/${jobId}`)
      toast.success('Job deleted successfully')
      fetchJobs()
    } catch (error) {
      toast.error('Failed to delete job')
    }
  }

  const formatBudget = (min, max, currency) => {
    if (!min && !max) return 'Negotiable'
    if (min && max) return `${currency} ${min} - ${max}`
    if (min) return `${currency} ${min}+`
    if (max) return `Up to ${currency} ${max}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Jobs</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-4 py-2 rounded-md ${
              filter === 'open'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded-md ${
              filter === 'in_progress'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-4 py-2 rounded-md ${
              filter === 'closed'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Closed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No jobs found.</p>
          <Link
            to="/jobs/post"
            className="mt-4 inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            Post Your First Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-primary-600"
                    >
                      {job.title}
                    </Link>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        job.status === 'open'
                          ? 'bg-green-100 text-green-800'
                          : job.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location} {job.is_remote && '(Remote)'}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {job.job_type.replace('_', ' ')}
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatBudget(job.budget_min, job.budget_max, job.budget_currency)}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex space-x-2">
                  <Link
                    to={`/jobs/${job.id}/applications`}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                  >
                    View Applications
                  </Link>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyJobs

