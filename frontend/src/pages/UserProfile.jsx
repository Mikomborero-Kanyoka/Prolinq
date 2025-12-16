import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, User, MapPin, Building, Mail, Phone, Link as LinkIcon, 
  Camera, Star, Briefcase, CheckCircle, Edit2, Save, X, Award, 
  Globe, Calendar, DollarSign, Users, ChevronRight, MessageCircle,
  ExternalLink, Eye, Clock, Shield, Check, TrendingUp, Clock as ClockIcon,
  Users as UsersIcon, ThumbsUp, Zap, Target, Heart, BarChart, TrendingDown
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ReviewsSection from '../components/ReviewsSection'
import './UserProfile.css'

const UserProfile = () => {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState(null)
  const [performanceMetrics, setPerformanceMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchUser()
    fetchPerformanceMetrics()
  }, [id])

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${id}`)
      setUser(response.data)
    } catch (error) {
      console.error('[UserProfile] Error fetching user:', error)
      toast.error('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchPerformanceMetrics = async () => {
    try {
      const response = await api.get(`/users/${id}/performance-metrics`)
      setPerformanceMetrics(response.data)
    } catch (error) {
      console.error('[UserProfile] Error fetching performance metrics:', error)
      // Don't show toast error for metrics as it's not critical
    }
  }

  const parseSkills = () => {
    if (!user?.skills) return []
    try {
      if (Array.isArray(user.skills)) return user.skills
      const parsed = JSON.parse(user.skills)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('[UserProfile] Error parsing skills:', error)
      return []
    }
  }

  const handleEditClick = () => {
    setEditForm({
      full_name: user.full_name || '',
      professional_title: user.professional_title || '',
      bio: user.bio || '',
      location: user.location || '',
      portfolio_link: user.portfolio_link || '',
      company_name: user.company_name || '',
      company_email: user.company_email || '',
      company_cell: user.company_cell || '',
      company_address: user.company_address || '',
      hourly_rate: user.hourly_rate || '',
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({})
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const response = await api.profilesAPI.update(editForm)
      setUser(prevUser => ({ ...prevUser, ...response.data }))
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('[UserProfile] Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isOwnProfile = currentUser && currentUser.id === parseInt(id)

  const calculateMetrics = () => {
    const completedJobs = parseInt(user.completed_jobs) || 0
    const totalClients = parseInt(user.total_clients) || 0
    const avgRating = parseFloat(user.average_rating) || 0
    const memberMonths = Math.max(1, Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24 * 30)))
    
    let successRate = 92, satisfaction = 85, responseHours = 2
    
    if (completedJobs > 0 || avgRating > 0) {
      const estimatedTotalJobs = completedJobs > 0 ? Math.ceil(completedJobs / 0.85) : totalClients || 5
      successRate = completedJobs > 0 ? Math.round((completedJobs / estimatedTotalJobs) * 100) : 88
      satisfaction = avgRating > 0 ? Math.round((avgRating / 5) * 100) : 82
      responseHours = avgRating >= 4.5 ? 1 : avgRating >= 4 ? 2 : avgRating >= 3 ? 3 : 4
    }
    
    const baseViews = Math.round(120 * memberMonths)
    const ratingBoost = avgRating >= 4.5 ? 1.8 : avgRating >= 4 ? 1.5 : avgRating >= 3 ? 1.2 : 1
    const clientBoost = totalClients > 0 ? 1 + (totalClients * 0.1) : 1
    const profileViews = Math.round(baseViews * ratingBoost * clientBoost)
    const impressions = Math.round(profileViews * (1.5 + (satisfaction / 100) * 0.5))
    const connections = totalClients + (completedJobs > 0 ? Math.round(completedJobs * 0.5) : 0)
    
    return { successRate, satisfaction, responseHours, profileViews, impressions, connections }
  }
  
  const metrics = user ? calculateMetrics() : {}

  // Enhanced Horizontal Stat Card Component
  const StatCard = ({ icon: Icon, label, value, subtext, color = 'blue', trend, loading = false }) => {
    const colorClasses = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
      green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
      pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' },
      teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' }
    }
    
    const { bg, text, border } = colorClasses[color] || colorClasses.blue
    
    if (loading) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 animate-pulse">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-16 sm:w-24"></div>
              <div className="h-4 sm:h-6 bg-gray-200 rounded w-12 sm:w-16"></div>
            </div>
          </div>
        </div>
      )
    }
    
    return (
      <div className={`bg-white border ${border} rounded-xl p-3 sm:p-4 hover:shadow-md transition-all duration-200`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`p-2 sm:p-3 rounded-xl ${bg} flex-shrink-0`}>
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${text}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-gray-500 mb-1 truncate">{label}</p>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline">
                <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{value}</p>
                {subtext && (
                  <span className="text-xs text-gray-500 ml-1">{subtext}</span>
                )}
              </div>
              {trend && (
                <div className={`flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend > 0 ? <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />}
                  <span className="text-xs font-medium">{Math.abs(trend)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Professional Input Component
  const InputField = ({ label, name, type = 'text', placeholder, icon: Icon, value, onChange, ...rest }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className={`w-full px-4 py-3 ${Icon ? 'pl-11' : 'pl-4'} bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-500`}
          placeholder={placeholder}
          {...rest}
        />
      </div>
    </div>
  )

  // Professional Textarea Component
  const TextareaField = ({ label, name, placeholder, rows = 4, value, onChange, ...rest }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-500 resize-none"
        placeholder={placeholder}
        {...rest}
      />
    </div>
  )

  // Skill Tag Component
  const SkillTag = ({ skill, editable = false, onRemove }) => (
    <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg text-xs sm:text-sm font-medium text-blue-700 hover:from-blue-100 hover:to-blue-200 transition-all cursor-pointer">
      <span className="truncate max-w-[80px] sm:max-w-none">{skill.skill_name}</span>
      <span className="text-xs text-blue-500 hidden sm:inline">({skill.proficiency_level})</span>
      {editable && onRemove && (
        <button
          onClick={onRemove}
          className="text-blue-400 hover:text-blue-600 transition-colors ml-1"
        >
          <X className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      )}
    </div>
  )

  // Render profile photo
  const renderProfilePhoto = () => {
    if (user?.profile_photo) {
      const imageUrl = `/uploads/${user.profile_photo}?t=${Date.now()}`
      return (
        <div className="relative group">
          <img
            src={imageUrl}
            alt={user.full_name}
            className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer transition-transform group-hover:scale-105"
            onClick={() => window.open(imageUrl, '_blank')}
            title="Click to view full-size profile picture"
          />
          <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-all"></div>
        </div>
      )
    }
    return (
      <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-4 border-white shadow-lg">
        <User className="h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16 text-blue-600" />
      </div>
    )
  }

  // Render portfolio images
  const renderPortfolioImages = () => {
    if (!user?.portfolio_images) return []
    
    try {
      return JSON.parse(user.portfolio_images)
    } catch (error) {
      console.error('Error parsing portfolio images:', error)
      return []
    }
  }

  if (loading) {
    return (
      <div className="user-profile-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="user-profile-container flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">User not found</p>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const skills = parseSkills()
  const portfolioImages = renderPortfolioImages()
  const isTalentType = ['talent', 'freelancer', 'job_seeker'].includes(user.primary_role)

  return (
    <div className="user-profile-container">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Back Navigation */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors group"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Profile Header - FIXED LAYOUT */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl mb-6 sm:mb-8">
          {/* Cover Section */}
          <div className="h-40 sm:h-48 md:h-56 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600">
            {user?.cover_image ? (
              <img
                src={`/uploads/${user.cover_image}?t=${Date.now()}`}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
          </div>

          {/* White Content Section Below Cover */}
          <div className="relative bg-white px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* Profile Photo - Positioned over the cover */}
            <div className="absolute -top-12 sm:-top-16 left-4 sm:left-6 lg:left-8">
              <div className="relative">
                {renderProfilePhoto()}
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </div>
              </div>
            </div>

            {/* User Info - Properly positioned */}
            <div className="ml-28 sm:ml-36 md:ml-40 lg:ml-44 pt-3 sm:pt-4">
              {/* Name and Title Row */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 truncate">
                    {user.full_name}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 md:gap-4 text-gray-600 mb-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base font-medium truncate">{user.professional_title || 'No title'}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base truncate">{user.location || 'No location'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                      {user.primary_role ? 
                        user.primary_role.charAt(0).toUpperCase() + 
                        user.primary_role.slice(1).replace('_', ' ') 
                        : 'No role'
                      }
                    </div>
                    {user.hourly_rate && (
                      <div className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium">
                        ${user.hourly_rate}/hr
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {isOwnProfile && !isEditing ? (
                    <button
                      onClick={handleEditClick}
                      className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </button>
                  ) : !isOwnProfile && (
                    <>
                      <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow">
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </button>
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg">
                        <Users className="h-4 w-4" />
                        Hire Now
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Profile Stats Navigation - CENTERED AND FIXED */}
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                <div className="flex justify-center overflow-x-auto pb-1 sm:pb-2">
                  <nav className="inline-flex space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4">
                    {[
                      { id: 'overview', label: 'Overview', icon: Eye },
                      { id: 'portfolio', label: 'Portfolio', icon: Camera },
                      { id: 'reviews', label: 'Reviews', icon: Star },
                      { id: 'experience', label: 'Experience', icon: Briefcase }
                    ].map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-1 sm:gap-2 px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                          activeTab === id
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden xs:inline">{label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {/* Left Sidebar - Contact & Skills */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Quick Contact */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">Contact Info</h3>
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {user.email && (
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50 flex-shrink-0">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Email</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate" title={user.email}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-green-50 flex-shrink-0">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Phone</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}
                {user.portfolio_link && (
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-purple-50 flex-shrink-0">
                      <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Portfolio</p>
                      <a
                        href={user.portfolio_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors truncate block"
                        title={user.portfolio_link}
                      >
                        View Portfolio
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Contact Button */}
              {!isOwnProfile && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                  <button className="w-full px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    Contact Now
                  </button>
                </div>
              )}
            </div>

            {/* Skills Preview */}
            {skills.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">Top Skills</h3>
                  <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {skills.slice(0, 6).map((skill, index) => (
                    <SkillTag key={skill.id || index} skill={skill} />
                  ))}
                  {skills.length > 6 && (
                    <div className="text-center w-full mt-3">
                      <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium">
                        +{skills.length - 6} more skills
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              {/* Tab Content */}
              <div className="p-3 sm:p-4 md:p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-4 sm:space-y-6 md:space-y-8">
                    {/* Bio Section */}
                    {user.bio && (
                      <div className="bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4 md:p-6 rounded-xl border border-gray-200">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          About Me
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{user.bio}</p>
                      </div>
                    )}

                    {/* Skills Section */}
                    {skills.length > 0 && (
                      <div className="bg-gradient-to-br from-blue-50 to-white p-3 sm:p-4 md:p-6 rounded-xl border border-blue-100">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                          <Award className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          Skills & Expertise
                        </h3>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3">
                          {skills.map((skill, index) => (
                            <SkillTag key={skill.id || index} skill={skill} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Company Information for Employers */}
                    {user.primary_role === 'employer' && (
                      <div className="bg-gradient-to-br from-blue-50 to-white p-3 sm:p-4 md:p-6 rounded-xl border border-blue-100">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                          <Building className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          Company Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {user.company_name && (
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50">
                                <Building className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm text-gray-600">Company Name</p>
                                <p className="text-xs sm:text-sm font-medium text-gray-900">{user.company_name}</p>
                              </div>
                            </div>
                          )}
                          {user.company_email && (
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="p-1.5 sm:p-2 rounded-lg bg-green-50">
                                <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm text-gray-600">Email</p>
                                <p className="text-xs sm:text-sm font-medium text-gray-900">{user.company_email}</p>
                              </div>
                            </div>
                          )}
                          {user.company_cell && (
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="p-1.5 sm:p-2 rounded-lg bg-purple-50">
                                <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm text-gray-600">Phone</p>
                                <p className="text-xs sm:text-sm font-medium text-gray-900">{user.company_cell}</p>
                              </div>
                            </div>
                          )}
                          {user.company_address && (
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="p-1.5 sm:p-2 rounded-lg bg-amber-50">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm text-gray-600">Address</p>
                                <p className="text-xs sm:text-sm font-medium text-gray-900">{user.company_address}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'portfolio' && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Portfolio Link */}
                    {user.portfolio_link && (
                      <div className="bg-gradient-to-br from-blue-50 to-white p-3 sm:p-4 md:p-6 rounded-xl border border-blue-100">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                          <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          Portfolio Link
                        </h3>
                        <a
                          href={user.portfolio_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
                        >
                          View Portfolio Website
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                        </a>
                      </div>
                    )}

                    {/* Portfolio Images */}
                    {portfolioImages.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 md:p-6">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                          <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          Portfolio Gallery
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {portfolioImages.map((image, index) => {
                            const imageUrl = `/uploads/${image}?t=${Date.now()}`
                            return (
                              <div key={index} className="group relative overflow-hidden rounded-xl cursor-pointer">
                                <img
                                  src={imageUrl}
                                  alt={`Portfolio ${index + 1}`}
                                  className="w-full h-32 sm:h-40 md:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                  onClick={() => window.open(imageUrl, '_blank')}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all"></div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && isTalentType && (
                  <ReviewsSection userId={user.id} compact={false} />
                )}

                {activeTab === 'experience' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-gradient-to-br from-gray-50 to-white p-3 sm:p-4 md:p-6 rounded-xl border border-gray-200">
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        Experience & Background
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        {user.bio && (
                          <div className="p-3 sm:p-4 bg-white rounded-lg border border-gray-100">
                            <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">{user.bio}</p>
                          </div>
                        )}
                        <div className="p-3 sm:p-4 bg-white rounded-lg border border-gray-100">
                          <p className="text-xs sm:text-sm text-gray-500 mb-2">Member Since</p>
                          <p className="text-xs sm:text-sm md:text-base font-medium text-gray-900">
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Profile</h2>
              <button
                onClick={handleCancelEdit}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <InputField
                  label="Full Name"
                  name="full_name"
                  icon={User}
                  placeholder="Enter your full name"
                  value={editForm.full_name}
                  onChange={handleInputChange}
                  required
                />
                <InputField
                  label="Professional Title"
                  name="professional_title"
                  icon={Briefcase}
                  placeholder="e.g., Senior Web Developer"
                  value={editForm.professional_title}
                  onChange={handleInputChange}
                />
                <InputField
                  label="Location"
                  name="location"
                  icon={MapPin}
                  placeholder="City, Country"
                  value={editForm.location}
                  onChange={handleInputChange}
                />
                {user.primary_role === 'freelancer' && (
                  <InputField
                    label="Hourly Rate ($)"
                    name="hourly_rate"
                    icon={DollarSign}
                    type="number"
                    step="0.01"
                    placeholder="25.00"
                    value={editForm.hourly_rate}
                    onChange={handleInputChange}
                  />
                )}
              </div>

              <TextareaField
                label="Bio"
                name="bio"
                placeholder="Tell us about yourself, your experience, and what makes you unique..."
                rows={5}
                value={editForm.bio}
                onChange={handleInputChange}
              />

              <InputField
                label="Portfolio Link"
                name="portfolio_link"
                icon={LinkIcon}
                type="url"
                placeholder="https://your-portfolio.com"
                value={editForm.portfolio_link}
                onChange={handleInputChange}
              />

              {/* Company Information for Employers */}
              {user.primary_role === 'employer' && (
                <div className="bg-gradient-to-br from-blue-50 to-white p-4 sm:p-6 rounded-xl border border-blue-100 space-y-3 sm:space-y-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Building className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Company Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <InputField
                      label="Company Name"
                      name="company_name"
                      placeholder="Enter company name"
                      value={editForm.company_name}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Company Email"
                      name="company_email"
                      type="email"
                      placeholder="company@example.com"
                      value={editForm.company_email}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Company Phone"
                      name="company_cell"
                      type="tel"
                      placeholder="+263 123 456 789"
                      value={editForm.company_cell}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Company Address"
                      name="company_address"
                      placeholder="123 Main St, Harare"
                      value={editForm.company_address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 sm:px-6 py-3 sm:py-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {isOwnProfile && !isEditing && (
        <button
          onClick={handleEditClick}
          className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xl font-medium transition-all duration-300 inline-flex items-center justify-center hover:scale-110 z-40 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
          title="Edit Profile"
        >
          <Edit2 className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}
    </div>
  )
}

export default UserProfile
