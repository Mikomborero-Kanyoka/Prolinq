import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Check, X, User, MessageSquare, Briefcase, Calendar, Mail, Phone, Globe, Award, Star } from 'lucide-react'
import LottieAnimation from '../animations/components/LottieAnimation'
import { animations } from '../assets/animations'
import { useCelebrate } from '../animations/hooks/useCelebrate'

const JobApplications = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, accepted, rejected
  const { triggerCelebration } = useCelebrate()
  
  const [profileCacheKey] = useState(() => Date.now())

  useEffect(() => {
    fetchJobAndApplications()
  }, [id])

  const fetchJobAndApplications = async () => {
    try {
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        api.get(`/applications/job/${id}`)
      ])
      setJob(jobRes.data)
      setApplications(appsRes.data)
    } catch (error) {
      toast.error('Failed to load applications')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (applicationId) => {
    try {
      await api.put(`/applications/${applicationId}`, { status: 'accepted' })
      toast.success('🎉 Application accepted! Welcome to the team!')
      triggerCelebration()
      fetchJobAndApplications()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to accept application')
    }
  }

  const handleDecline = async (applicationId) => {
    try {
      await api.put(`/applications/${applicationId}`, { status: 'rejected' })
      toast.success('Application declined')
      fetchJobAndApplications()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to decline application')
    }
  }

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  // Add celebration overlay
  const CelebrationOverlay = () => (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <LottieAnimation
        animationData={animations.fireworks}
        width={400}
        height={400}
        loop={false}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  )

  return (
    <>
      {triggerCelebration && <CelebrationOverlay />}
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50" style={{ marginTop: '80px' }}>
        {/* Header with Back Button - Increased left padding */}
        <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto pl-6 sm:pl-8 lg:pl-10 pr-4 sm:pr-6 lg:pr-8">
            <div className="py-4">
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

        {/* Main Content - Increased left padding */}
        <div className="max-w-7xl mx-auto pl-6 sm:pl-8 lg:pl-10 pr-4 sm:pr-6 lg:pr-8 py-8">
          {/* Job Header */}
          <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-xl shadow-lg p-6 mb-8 border border-blue-100/50">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Applications for: {job?.title}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    job?.category === 'Technology' ? 'bg-blue-100 text-blue-700' :
                    job?.category === 'Design' ? 'bg-pink-100 text-pink-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {job?.category}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {job?.location} • {job?.job_type?.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {applications.filter(app => app.status === 'accepted').length}
                  </div>
                  <div className="text-sm text-gray-600">Accepted</div>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {applications.filter(app => app.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow p-4 mb-6 border border-gray-200">
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
                ⏳ Pending ({applications.filter(app => app.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('accepted')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  filter === 'accepted'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                    : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                }`}
              >
                ✓ Accepted ({applications.filter(app => app.status === 'accepted').length})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  filter === 'rejected'
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                ✗ Rejected ({applications.filter(app => app.status === 'rejected').length})
              </button>
            </div>
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "There are no applications for this job yet." 
                  : `There are no ${filter} applications.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredApplications.map((application) => (
                <div 
                  key={application.id} 
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all"
                >
                  {/* Applicant Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      {application.applicant?.profile_photo ? (
                        <img
                          src={`/uploads/${application.applicant.profile_photo}?t=${profileCacheKey}`}
                          alt={application.applicant.full_name}
                          className="h-16 w-16 rounded-full object-cover border-2 border-white shadow"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(application.applicant?.full_name || 'User')}&background=6366f1&color=fff&bold=true`
                          }}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center border-2 border-white shadow">
                          <User className="h-8 w-8 text-blue-600" />
                        </div>
                      )}
                      <span className={`absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(application.status)}`}>
                        {application.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <Link
                        to={`/users/${application.applicant_id}`}
                        className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-lg"
                      >
                        {application.applicant?.full_name || `Talent #${application.applicant_id}`}
                      </Link>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          Applied {new Date(application.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        {application.applicant?.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="h-3 w-3" />
                            Email
                          </div>
                        )}
                        {application.applicant?.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            Phone
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Applicant Info */}
                  {application.applicant?.bio && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">About</h4>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {application.applicant.bio}
                      </p>
                    </div>
                  )}

                  {/* Cover Letter */}
                  {application.cover_letter && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        Cover Letter
                      </h4>
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

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAccept(application.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                        >
                          <Check className="h-4 w-4" />
                          Accept Application
                        </button>
                        <button
                          onClick={() => handleDecline(application.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-rose-700 transition-all"
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </button>
                      </>
                    )}

                    {application.status === 'accepted' && (
                      <div className="flex gap-3 w-full">
                        <Link
                          to={`/messages/${application.applicant_id}`}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Message Talent
                        </Link>
                        <Link
                          to={`/users/${application.applicant_id}`}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all"
                        >
                          <User className="h-4 w-4" />
                          View Profile
                        </Link>
                      </div>
                    )}

                    {application.status === 'rejected' && (
                      <div className="w-full text-center py-2">
                        <span className="text-sm font-medium text-gray-500">Application declined</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Footer */}
          {applications.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Application Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-700">{applications.length}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-700">
                    {applications.filter(app => app.status === 'accepted').length}
                  </div>
                  <div className="text-sm text-gray-600">Accepted</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-bold text-yellow-700">
                    {applications.filter(app => app.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-bold text-red-700">
                    {applications.filter(app => app.status === 'rejected').length}
                  </div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default JobApplications