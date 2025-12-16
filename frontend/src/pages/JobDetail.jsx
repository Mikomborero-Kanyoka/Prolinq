import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { MapPin, DollarSign, Clock, User, ArrowLeft, Briefcase, CheckCircle, Calendar, Globe, Users, Building, Award, Target, FileText, Gift, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const JobDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applied, setApplied] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')

  useEffect(() => {
    console.log(`JobDetail: isAuthenticated=${isAuthenticated}, user role=${user?.primary_role}, user id=${user?.id}`)
    fetchJob()
    if (isAuthenticated) {
      checkApplication()
    }
  }, [id, isAuthenticated, user])

  const fetchJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`)
      const jobData = response.data
      
      if (user?.primary_role === 'employer' && jobData.creator_id === user?.id) {
        try {
          const appsRes = await api.get(`/applications/job/${id}`)
          jobData.applications = appsRes.data
        } catch (error) {
          jobData.applications = []
        }
      }
      
      setJob(jobData)
    } catch (error) {
      toast.error('Failed to load job')
      navigate('/jobs')
    } finally {
      setLoading(false)
    }
  }

  const checkApplication = async () => {
    try {
      const response = await api.get('/applications/me/applications')
      const hasApplied = response.data.some(app => app.job_id === parseInt(id))
      setApplied(hasApplied)
    } catch (error) {
      console.error('Error checking applications:', error.response?.status, error.message)
      setApplied(false)
    }
  }

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      await api.post(`/applications/jobs/${id}/apply`, {
        cover_letter: coverLetter || null
      })
      toast.success('Application submitted successfully!')
      setApplied(true)
      setShowApplicationForm(false)
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to apply'
      console.error('Apply error:', error.response?.data)
      toast.error(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) return null

  const formatBudget = (min, max, currency) => {
    if (!min && !max) return 'Negotiable'
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
    if (min) return `${currency} ${min.toLocaleString()}+`
    if (max) return `Up to ${currency} ${max.toLocaleString()}`
  }

  const formatDeadline = (dateString) => {
    if (!dateString) return 'No deadline'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Deadline passed'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= 7) return `${diffDays} days left`
    
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const renderActionContent = () => {
    // Debug logging
    console.log('renderActionContent debug:', {
      isAuthenticated,
      user: user ? {
        id: user.id,
        primary_role: user.primary_role,
        isVerified: user.isVerified,
        email: user.email
      } : null,
      jobCreatorId: job?.creator_id,
      isTalent: user?.primary_role === 'talent',
      isEmployer: user?.primary_role === 'employer',
      isJobCreator: job?.creator_id === user?.id
    });

    if (isAuthenticated && user?.primary_role === 'employer' && job?.creator_id === user?.id) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Manage Job</h3>
          </div>
          
          <div className="space-y-3">
            <Link
              to={`/applications/job/${id}`}
              className="flex items-center justify-between w-full bg-white border border-blue-200 text-blue-700 px-4 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all hover:scale-[1.02] active:scale-95 group"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                View Applications
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                {job.applications?.length || 0}
              </span>
            </Link>
            
            {job.status !== 'completed' && (
              <Link
                to={`/job-completion/${id}`}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all hover:scale-[1.02] active:scale-95"
              >
                <CheckCircle className="h-4 w-4" />
                Mark Complete
              </Link>
            )}
            
            {job.status === 'completed' && (
              <Link
                to={`/job-completion/${id}`}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Award className="h-4 w-4" />
                View Reviews
              </Link>
            )}
            
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this job?')) {
                  try {
                    await api.delete(`/jobs/${id}`)
                    toast.success('Job deleted successfully')
                    navigate('/dashboard')
                  } catch (error) {
                    toast.error('Failed to delete job')
                  }
                }
              }}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-rose-600 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Briefcase className="h-4 w-4" />
              Delete Job
            </button>
          </div>
        </motion.div>
      )
    } else if (isAuthenticated && (user?.primary_role === 'talent' || user?.primary_role === 'freelancer' || user?.primary_role === 'jobseeker') && !applied && job?.creator_id !== user?.id) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {!showApplicationForm ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-50 rounded-lg">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Ready to Apply?</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-4">
                  This job matches your profile. Submit your application now!
                </p>
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
                >
                  Apply Now
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Submit Application</h3>
              </div>
              
              <div className="mb-6">
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Write a cover letter (optional)..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4 text-sm bg-white"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleApply}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setShowApplicationForm(false)}
                    className="flex-1 bg-gray-100 text-gray-800 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )
    } else if (applied) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-bold text-green-800">
                ✓ Application Submitted
              </span>
            </div>
            <p className="text-green-700 text-xs">
              Your application has been received and is under review.
            </p>
          </div>
          
          {(job.status === 'in_progress' || job.status === 'completed') && (
            <Link
              to={`/job-completion/${id}`}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all"
            >
              {job.status === 'completed' ? 'Leave Your Review' : 'View Progress'}
            </Link>
          )}
        </motion.div>
      )
    } else if (isAuthenticated && user?.primary_role !== 'talent' && user?.primary_role !== 'freelancer' && user?.primary_role !== 'jobseeker') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="p-2 bg-gradient-to-r from-orange-100 to-orange-50 rounded-lg inline-block mb-3">
            <Briefcase className="h-6 w-6 text-orange-600 mx-auto" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Talent Account Required
          </h3>
          <p className="text-gray-600 text-sm">
            Only talent, freelancer, or jobseeker accounts can apply for jobs. Please create or switch to an appropriate account.
          </p>
        </motion.div>
      )
    } else {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg inline-block mb-3">
            <User className="h-6 w-6 text-blue-600 mx-auto" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Sign In to Apply
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Log in as a talent, freelancer, or jobseeker to apply for this job.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="block w-full bg-white border border-gray-300 text-gray-800 px-4 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Create Account
            </Link>
          </div>
        </motion.div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50" style={{ marginTop: '80px' }}>
      {/* Header with Back Button - Increased left padding */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto pl-6 sm:pl-8 lg:pl-10 pr-4 sm:pr-6 lg:pr-8">
          <div className="py-4">
            <Link
              to="/jobs"
              className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium">Back to Jobs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content - Increased left padding */}
      <div className="max-w-7xl mx-auto pl-6 sm:pl-8 lg:pl-10 pr-4 sm:pr-6 lg:pr-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2">
            {/* Job Header Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
              {/* Status Badges */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  job.category === 'Technology' ? 'bg-blue-100 text-blue-700' :
                  job.category === 'Design' ? 'bg-pink-100 text-pink-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {job.category}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  job.status === 'completed' ? 'bg-green-100 text-green-700' :
                  job.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {job.status?.replace('_', ' ')}
                </span>
              </div>
              
              {/* Job Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{job.title}</h1>
              
              {/* Company Info */}
              <div className="flex items-center text-gray-600 mb-6">
                <Building className="h-5 w-5 mr-2 text-blue-500" />
                <span className="font-medium">{job.company || 'Anonymous Company'}</span>
              </div>

              {/* Job Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-500">Location</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {job.location} {job.is_remote && <span className="text-blue-600">(Remote)</span>}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-500">Job Type</span>
                  </div>
                  <p className="font-semibold text-gray-900 capitalize">
                    {job.job_type.replace('_', ' ')}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-500">Budget</span>
                  </div>
                  <p className="font-bold text-green-600">
                    {formatBudget(job.budget_min, job.budget_max, job.budget_currency)}
                  </p>
                </div>

                {job.positions && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-500">Positions</span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {job.positions}
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {job.deadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      <span className="font-medium">Deadline:</span> {formatDeadline(job.deadline)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    <span className="font-medium">Posted:</span> {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
                {job.is_remote && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-blue-600">Remote Available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Job Description</h2>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {job.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Required Skills */}
            {job.skills_required && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Award className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Required Skills</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.split(',').map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Sections */}
            {[
              { key: 'experience_required', title: 'Experience Required', icon: Target },
              { key: 'qualifications', title: 'Qualifications', icon: Award },
              { key: 'responsibilities', title: 'Responsibilities', icon: FileText },
              { key: 'benefits', title: 'Benefits', icon: Gift },
            ].map((section) => (
              job[section.key] && (
                <div key={section.key} className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <section.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {job[section.key]}
                    </p>
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Right Column - Action Sidebar */}
          <div className="lg:sticky lg:top-24">
            {/* Action Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6">
              {renderActionContent()}
            </div>

            {/* Job Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Job Stats</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Views</span>
                  <span className="font-bold text-blue-600">{job.views || '0'}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Applications</span>
                  <span className="font-bold text-green-600">{job.application_count || '0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    job.status === 'open' ? 'bg-green-100 text-green-800' :
                    job.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDetail
