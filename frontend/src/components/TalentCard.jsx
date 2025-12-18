import { Link } from 'react-router-dom'
import { 
  Star, ExternalLink, MapPin, Briefcase, 
  Clock, Award, MessageCircle, Eye, Zap, 
  CheckCircle, TrendingUp, DollarSign,
  Building, Globe, Calendar, Users,
  FileText
} from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../services/api'

const TalentCard = ({ user }) => {
  const [userRating, setUserRating] = useState(null)
  const [loadingRating, setLoadingRating] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  // Build image URLs
  const getImageUrl = (filename) => {
    if (!filename) return null
    if (filename.startsWith('http')) return filename
    const apiUrl = import.meta.env.VITE_API_URL || 'https://prolinq-production.up.railway.app/api'
    const baseUrl = apiUrl.replace('/api', '')
    return `${baseUrl}/uploads/${filename}`
  }

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await api.get(`/reviews/user/${user.id}`)
        setUserRating(response.data)
      } catch (error) {
        console.error('Error fetching rating:', error)
      } finally {
        setLoadingRating(false)
      }
    }

    if (user?.id) {
      fetchRating()
    }
  }, [user?.id])

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const parseSkills = () => {
    try {
      if (!user.skills) return []
      if (Array.isArray(user.skills)) return user.skills
      if (typeof user.skills === 'string') {
        const parsed = JSON.parse(user.skills)
        return Array.isArray(parsed) ? parsed : []
      }
      return []
    } catch {
      return []
    }
  }

  const skills = parseSkills()
  const topSkills = skills.slice(0, 4)
  const hasMoreSkills = skills.length > 4

  // Get status with default
  const getStatus = () => {
    if (user.availability === 'available') return 'Available Now'
    if (user.availability === 'busy') return 'Busy'
    return 'Not Specified'
  }

  const getStatusColor = () => {
    if (user.availability === 'available') return 'green'
    if (user.availability === 'busy') return 'orange'
    return 'gray'
  }

  const statusColor = getStatusColor()
  const statusText = getStatus()

  // Format rating display
  const getRatingDisplay = () => {
    if (loadingRating) return { average: '...', reviews: 'Loading' }
    if (userRating && userRating.total_reviews > 0) {
      return {
        average: userRating.average_rating.toFixed(1),
        reviews: `${userRating.total_reviews} review${userRating.total_reviews === 1 ? '' : 's'}`
      }
    }
    return { average: 'N/A', reviews: 'No reviews' }
  }

  const ratingDisplay = getRatingDisplay()

  // Get experience display
  const getExperienceDisplay = () => {
    if (user.experience_years) return `${user.experience_years}+ yrs`
    if (user.years_experience) return `${user.years_experience}+ yrs`
    return 'N/A'
  }

  // Get hourly rate display
  const getRateDisplay = () => {
    if (user.hourly_rate) return `$${user.hourly_rate}`
    if (user.rate) return `$${user.rate}`
    return 'N/A'
  }

  return (
    <div 
      className="relative group h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Container - Fixed Height */}
      <div className="h-full bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200/50 flex flex-col">
        
        {/* Profile Header with Gradient */}
        <div className="relative bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-5 lg:p-6 pb-12 sm:pb-14 lg:pb-16 border-b border-gray-100">
          {/* Status Badge */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
            <div className={`
              flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm
              ${statusColor === 'green' 
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-emerald-700 border border-emerald-200' 
                : statusColor === 'orange'
                ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-300'
              }
            `}>
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                statusColor === 'green' ? 'bg-emerald-500' :
                statusColor === 'orange' ? 'bg-amber-500' :
                'bg-gray-400'
              }`} />
              <span className="hidden xs:inline">{statusText}</span>
              <span className="xs:hidden">
                {statusColor === 'green' ? '✓' : 
                 statusColor === 'orange' ? '⌛' : '?'}
              </span>
            </div>
          </div>
          
          {/* Profile Image */}
          <div className="relative flex flex-col items-center">
            <div className="relative mb-3 sm:mb-4">
              {/* Image Container */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full border-2 sm:border-3 lg:border-4 border-white shadow-lg overflow-hidden">
                {getImageUrl(user.profile_photo) ? (
                  <img
                    src={getImageUrl(user.profile_photo)}
                    alt={user.full_name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-base sm:text-lg lg:text-xl font-bold">
                    {getInitials(user.full_name)}
                  </div>
                )}
                
                {/* Verified Badge */}
                {user.is_verified && (
                  <div className="absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 lg:-bottom-2 lg:-right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-1 sm:p-1.5 lg:p-1.5 rounded-full shadow-lg">
                    <CheckCircle className="w-2.5 h-2.5 sm:w-3 h-3 lg:w-3.5 lg:h-3.5" />
                  </div>
                )}
              </div>
            </div>

            {/* Name and Title - Always show something */}
            <div className="text-center min-h-[50px] sm:min-h-[55px] lg:min-h-[60px] w-full px-2">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                {user.full_name || 'Anonymous Professional'}
              </h3>
              <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
                <p className="text-xs sm:text-sm font-semibold text-gray-700 line-clamp-1">
                  {user.professional_title || user.title || 'Professional'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Flex grow for equal height */}
        <div className="flex-1 p-3 sm:p-4 lg:p-5 pt-6 sm:pt-7 lg:pt-8">
          {/* Stats Grid - Always show 3 items */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-5">
            {/* Rating */}
            <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
                <Star className="w-2.5 h-2.5 sm:w-3 h-3 lg:w-3.5 lg:h-3.5 text-amber-500 fill-amber-500" />
                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                  {ratingDisplay.average}
                </span>
              </div>
              <p className="text-[10px] xs:text-xs text-gray-500 truncate">
                {ratingDisplay.reviews}
              </p>
            </div>

            {/* Experience */}
            <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 h-3 lg:w-3.5 lg:h-3.5 text-blue-500" />
                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                  {getExperienceDisplay()}
                </span>
              </div>
              <p className="text-[10px] xs:text-xs text-gray-500">Experience</p>
            </div>

            {/* Rate */}
            <div className="text-center p-1.5 sm:p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
                <DollarSign className="w-2.5 h-2.5 sm:w-3 h-3 lg:w-3.5 lg:h-3.5 text-green-500" />
                <span className="font-bold text-gray-900 text-xs sm:text-sm">
                  {getRateDisplay()}
                </span>
              </div>
              <p className="text-[10px] xs:text-xs text-gray-500">Hourly</p>
            </div>
          </div>

          {/* Company/Current Role - Always show */}
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50/50 rounded-lg sm:rounded-xl border border-blue-100">
              <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              <span className="text-xs sm:text-sm font-medium text-blue-700 truncate">
                {user.current_company || user.company || 'Currently not specified'}
              </span>
            </div>
          </div>

          {/* Location - Always show */}
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 px-1.5 sm:px-2 py-1 sm:py-1.5 bg-gray-50 rounded-lg sm:rounded-xl">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              <span className="text-xs sm:text-sm truncate">
                {user.location || 'Location not specified'}
              </span>
            </div>
          </div>

          {/* Skills - Always show section */}
          <div className="mb-3 sm:mb-4 lg:mb-5">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1 sm:gap-1.5">
                <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Skills</span>
                <span className="xs:hidden">Skills</span>
              </p>
              {hasMoreSkills && (
                <span className="text-[10px] xs:text-xs text-gray-500">
                  +{skills.length - 4}
                </span>
              )}
            </div>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {topSkills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-1.5 sm:px-2 lg:px-2.5 py-0.5 sm:py-1 bg-primary-50 text-primary-700 text-[10px] xs:text-xs font-medium rounded-md sm:rounded-lg border border-primary-100 truncate max-w-[80px] sm:max-w-[90px] lg:max-w-[100px]"
                    title={skill.skill_name || skill}
                  >
                    {skill.skill_name || skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500 italic">Skills not specified</p>
              </div>
            )}
          </div>

          {/* Portfolio Link - Always show */}
          <div className="mb-3 sm:mb-4 lg:mb-5">
            <div className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-all duration-300 ${
              user.portfolio_link 
                ? 'bg-gradient-to-r from-gray-50 to-white border-gray-200 hover:border-primary-300 hover:shadow-sm' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg ${
                user.portfolio_link ? 'bg-primary-100' : 'bg-gray-200'
              }`}>
                <ExternalLink className={`w-3 h-3 sm:w-4 sm:h-4 ${
                  user.portfolio_link ? 'text-primary-600' : 'text-gray-500'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                  {user.portfolio_link ? 'View Portfolio' : 'Portfolio'}
                </p>
                <p className="text-[10px] xs:text-xs text-gray-500 truncate">
                  {user.portfolio_link 
                    ? user.portfolio_link.replace(/^https?:\/\//, '').slice(0, 25) + '...'
                    : 'Not available'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="p-3 sm:p-4 lg:p-5 pt-0">
          <div className="flex gap-2 sm:gap-3">
            <Link
              to={`/users/${user.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow hover:shadow-md text-xs sm:text-sm"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>View Profile</span>
            </Link>
            <Link
              to={`/messages/${user.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 bg-white text-primary-600 rounded-lg sm:rounded-xl font-semibold border border-gray-300 hover:bg-primary-50 hover:border-primary-300 transition-all duration-300 shadow-sm hover:shadow-md text-xs sm:text-sm"
            >
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Success Rate Popup (Optional) */}
      {isHovered && user.success_rate && (
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-20 hidden sm:block">
          <div className="px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-xl flex items-center gap-1.5 sm:gap-2">
            <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>{user.success_rate}% Success</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TalentCard
