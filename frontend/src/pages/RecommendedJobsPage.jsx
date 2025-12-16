import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { MapPin, Clock, Star, TrendingUp, Sparkles, ArrowLeft } from 'lucide-react'

const RecommendedJobsPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchRecommendedJobs()
    }
  }, [user])

  const fetchRecommendedJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First, ensure user has an embedding
      await generateUserEmbedding()
      
      // Then get recommended jobs (fetch more than the dashboard shows)
      const response = await api.get(`/skills-matching/matches-for-user/${user.id}?limit=50`)
      
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

      if (!user.profile_embedding) {
        await api.post(`/skills-matching/embed-user-db/${user.id}`)
      }
    } catch (error) {
      console.error('Error generating user embedding:', error)
    }
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 sm:mb-8 md:mb-10"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            <span className="text-base sm:text-lg">Back</span>
          </button>
          <div className="bg-white rounded-xl shadow p-6 sm:p-8">
            <div className="flex items-center mb-8 sm:mb-10">
              <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-purple-500 mr-3 sm:mr-4" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Recommended Jobs</h1>
            </div>
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 sm:h-7 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 sm:mb-8 md:mb-10"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            <span className="text-base sm:text-lg">Back</span>
          </button>
          <div className="bg-white rounded-xl shadow p-8 sm:p-10 md:p-12 text-center">
            <p className="text-gray-500 mb-6 sm:mb-8 text-lg sm:text-xl">{error}</p>
            <button 
              onClick={fetchRecommendedJobs}
              className="bg-purple-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-medium hover:bg-purple-700 transition text-base sm:text-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 sm:mb-8 md:mb-10"
        >
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
          <span className="text-base sm:text-lg">Back</span>
        </button>

        <div className="bg-white rounded-xl shadow p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-10 gap-4 sm:gap-0">
            <div className="flex items-center">
              <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-purple-500 mr-3 sm:mr-4" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Recommended Jobs</h1>
            </div>
            <div className="bg-purple-100 text-purple-700 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-base sm:text-lg whitespace-nowrap">
              {recommendedJobs.length} {recommendedJobs.length === 1 ? 'job' : 'jobs'} found
            </div>
          </div>

          {recommendedJobs.length === 0 ? (
            <div className="text-center py-12 sm:py-16 md:py-20">
              <TrendingUp className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mx-auto mb-6 sm:mb-8" />
              <p className="text-gray-500 mb-4 text-xl sm:text-2xl">No recommended jobs found</p>
              <p className="text-gray-400 mb-8 sm:mb-10 text-lg sm:text-xl max-w-2xl mx-auto">
                Complete your profile to get better job recommendations
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="bg-purple-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-medium hover:bg-purple-700 transition inline-block text-base sm:text-lg"
              >
                Update Profile
              </button>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {recommendedJobs.map((job) => (
                <div
                  key={job.job_id}
                  onClick={() => navigate(`/jobs/${job.job_id}`)}
                  className="border border-gray-200 rounded-xl p-6 sm:p-8 hover:border-purple-300 hover:shadow-xl transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 sm:mb-6 gap-4 lg:gap-0">
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 text-lg sm:text-xl">
                        by <span className="font-semibold">{job.company || 'Anonymous'}</span>
                      </p>
                    </div>
                    <div className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-base sm:text-lg font-semibold whitespace-nowrap flex items-center gap-2 justify-start lg:justify-center ${getSimilarityColor(job.similarity_score)} lg:ml-6 w-fit lg:w-auto`}>
                      <Star className="h-5 w-5 sm:h-6 sm:w-6" />
                      {(job.similarity_score * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 sm:gap-4 mb-5 sm:mb-6 text-base sm:text-lg">
                    {job.location && (
                      <span className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-gray-400" />
                        {job.location}
                      </span>
                    )}
                    {job.job_type && (
                      <span className="flex items-center text-gray-600">
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-gray-400" />
                        {job.job_type.replace(/_/g, ' ')}
                      </span>
                    )}
                    {job.category && (
                      <span className="bg-gray-100 text-gray-700 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-medium">
                        {job.category}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-5 sm:pt-6 border-t border-gray-100 gap-3 sm:gap-0">
                    <span className={`text-base sm:text-lg font-semibold ${getSimilarityColor(job.similarity_score)}`}>
                      {getSimilarityLabel(job.similarity_score)}
                    </span>
                    <span className="text-purple-600 font-semibold text-base sm:text-lg group-hover:text-purple-700 transition-colors">
                      View Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 sm:mt-12 md:mt-16 pt-8 sm:pt-10 border-t border-gray-200 text-center">
            <p className="text-gray-500 mb-6 sm:mb-8 text-lg sm:text-xl max-w-3xl mx-auto">
              💡 AI-powered recommendations based on your skills and experience
            </p>
            <button
              onClick={() => navigate('/jobs')}
              className="text-purple-600 hover:text-purple-700 font-semibold text-lg sm:text-xl transition-colors"
            >
              Browse All Jobs →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecommendedJobsPage