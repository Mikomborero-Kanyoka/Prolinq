import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { MapPin, DollarSign, Clock, Star, TrendingUp, Sparkles } from 'lucide-react'

const RecommendedJobs = ({ limit = 5 }) => {
  const { user } = useAuth()
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchRecommendedJobs()
    }
  }, [user, limit])

  const fetchRecommendedJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First, ensure user has an embedding
      await generateUserEmbedding()
      
      // Then get recommended jobs
      const response = await api.get(`/skills-matching/matches-for-user/${user.id}?limit=${limit}`)
      
      if (response.data.success && response.data.matches) {
        setRecommendedJobs(response.data.matches)
      } else {
        setRecommendedJobs([])
      }
    } catch (error) {
      console.error('Error fetching recommended jobs:', error)
      setError('Failed to load recommended jobs')
      setRecommendedJobs([])
    } finally {
      setLoading(false)
    }
  }

  const generateUserEmbedding = async () => {
    try {
      // Prepare user profile data for embedding
      const userProfile = {
        bio: user.bio || '',
        skills: user.skills || '',
        location: user.location || '',
        experience: user.experience || '',
        education: user.education || '',
        professional_title: user.professional_title || '',
        primary_role: user.primary_role || 'talent',
        company_name: user.company_name || null
      }

      // Generate embedding if user doesn't have one or it's outdated
      if (!user.profile_embedding) {
        await api.post(`/skills-matching/embed-user-db/${user.id}`)
      }
    } catch (error) {
      console.error('Error generating user embedding:', error)
      // Don't throw error here, as we can still try to get matches
    }
  }

  const formatBudget = (min, max, currency) => {
    if (!min && !max) return 'Negotiable'
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
    if (min) return `${currency} ${min.toLocaleString()}+`
    if (max) return `Up to ${currency} ${max.toLocaleString()}`
  }

  const getSimilarityColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100'
    if (score >= 0.6) return 'text-blue-600 bg-blue-100'
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getSimilarityLabel = (score) => {
    if (score >= 0.8) return 'Excellent Match'
    if (score >= 0.6) return 'Good Match'
    if (score >= 0.4) return 'Fair Match'
    return 'Low Match'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Recommended Jobs</h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Recommended Jobs</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={fetchRecommendedJobs}
            className="mt-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (recommendedJobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Recommended Jobs</h2>
        </div>
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No recommended jobs found</p>
          <p className="text-sm text-gray-400 mb-4">
            Complete your profile to get better job recommendations
          </p>
          <Link
            to="/profile"
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition"
          >
            Update Profile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Recommended Jobs</h2>
        </div>
        <span className="text-sm text-gray-500">Based on your profile</span>
      </div>
      
      <div className="space-y-4">
        {recommendedJobs.map((job) => (
          <Link
            key={job.job_id}
            to={`/jobs/${job.job_id}`}
            className="block border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  by {job.company || 'Anonymous'}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSimilarityColor(job.similarity_score)}`}>
                  <Star className="h-3 w-3 inline mr-1" />
                  {(job.similarity_score * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-3 text-sm">
              {job.location && (
                <span className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  {job.location}
                </span>
              )}
              {job.job_type && (
                <span className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  {job.job_type.replace('_', ' ')}
                </span>
              )}
              {job.category && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                  {job.category}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${getSimilarityColor(job.similarity_score)}`}>
                {getSimilarityLabel(job.similarity_score)}
              </span>
              <span className="text-purple-600 font-medium text-sm hover:text-purple-700">
                View Details →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            AI-powered recommendations based on your skills and experience
          </p>
          <Link
            to="/jobs"
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            Browse All Jobs →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RecommendedJobs
