import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api, { uploadAPI } from '../services/api'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { 
  User, MapPin, Link as LinkIcon, FileText, Plus, X, Camera, 
  Building, UserCheck, Star, Edit, Save, Eye, Mail, Phone, 
  Globe, Briefcase, Award, Calendar, DollarSign, CheckCircle,
  Upload, Shield, Lock, Bell, Globe as GlobeIcon, ChevronDown,
  TrendingUp, Users as UsersIcon, ThumbsUp, Clock, Target, Zap,
  BarChart, TrendingDown
} from 'lucide-react'
import ReviewsSection from '../components/ReviewsSection'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState({ skill_name: '', proficiency_level: 'intermediate' })
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset, setValue } = useForm({
    defaultValues: user || {}
  })

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      reset(user)
    }
  }, [user, reset])

  const userRole = watch('primary_role')
  const isTalentType = ['talent', 'freelancer', 'job_seeker'].includes(userRole)

  useEffect(() => {
    if (user?.skills) {
      try {
        const parsedSkills = typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills
        setSkills(Array.isArray(parsedSkills) ? parsedSkills : [])
      } catch (error) {
        console.error('Error parsing skills:', error)
        setSkills([])
      }
    }
  }, [user])

  const onSubmit = async (data) => {
    try {
      const response = await api.put('/users/me', data)
      updateUser(response.data)
      setIsEditMode(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleAddSkill = async () => {
    if (!newSkill.skill_name.trim()) return

    try {
      const response = await api.post('/users/me/skills', newSkill)
      const userResponse = await api.get('/users/me')
      updateUser(userResponse.data)
      setNewSkill({ skill_name: '', proficiency_level: 'intermediate' })
      toast.success('Skill added!')
    } catch (error) {
      console.error('Add skill error:', error.response?.data || error.message)
      toast.error('Failed to add skill')
    }
  }

  const handleRemoveSkill = async (skillId) => {
    try {
      await api.delete(`/users/me/skills/${skillId}`)
      const userResponse = await api.get('/users/me')
      updateUser(userResponse.data)
      toast.success('Skill removed!')
    } catch (error) {
      console.error('Remove skill error:', error.response?.data || error.message)
      toast.error('Failed to remove skill')
    }
  }

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setUploadingPhoto(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('file_type', 'profile_photo')
      
      const response = await uploadAPI.uploadPhoto(formData)
      updateUser(response.data.user)
      toast.success('Profile photo uploaded!')
    } catch (error) {
      console.error('Photo upload error:', error.response?.data)
      toast.error('Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleCoverImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setUploadingCover(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('file_type', 'cover_image')
      
      const response = await uploadAPI.uploadPhoto(formData)
      updateUser(response.data.user)
      toast.success('Cover image uploaded!')
    } catch (error) {
      console.error('Cover upload error:', error.response?.data)
      toast.error('Failed to upload cover image')
    } finally {
      setUploadingCover(false)
    }
  }

  const handleDeleteCoverImage = async () => {
    try {
      const response = await api.delete('/users/me/cover-image')
      updateUser(response.data.user)
      toast.success('Cover image deleted!')
    } catch (error) {
      toast.error('Failed to delete cover image')
    }
  }

  const handlePortfolioImageUpload = async (event, index) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    const currentPreviews = user?.portfolio_image_previews ? [...user.portfolio_image_previews] : []
    currentPreviews[index] = previewUrl
    updateUser({ ...user, portfolio_image_previews: currentPreviews })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('file_type', 'portfolio_image')
      formData.append('image_index', index.toString())
      
      const response = await uploadAPI.uploadPhoto(formData)
      updateUser(response.data.user)
      toast.success('Portfolio image uploaded!')
    } catch (error) {
      console.error('Portfolio upload error:', error.response?.data)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to upload portfolio image'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to upload portfolio image')
    } finally {
      URL.revokeObjectURL(previewUrl)
    }
  }

  const handleDeletePortfolioImage = async (index) => {
    try {
      await api.delete(`/users/me/portfolio-image/${index}`)
      const userResponse = await api.get('/users/me')
      updateUser(userResponse.data)
      toast.success('Portfolio image deleted!')
    } catch (error) {
      toast.error('Failed to delete portfolio image')
    }
  }

  const handleResumeImageUpload = async (event, index) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    const currentPreviews = user?.resume_image_previews ? [...user.resume_image_previews] : []
    currentPreviews[index] = previewUrl
    updateUser({ ...user, resume_image_previews: currentPreviews })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('file_type', 'resume_image')
      formData.append('image_index', index.toString())
      
      const response = await uploadAPI.uploadPhoto(formData)
      updateUser(response.data.user)
      toast.success('Resume image uploaded!')
    } catch (error) {
      console.error('Resume upload error:', error.response?.data)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to upload resume image'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to upload resume image')
    } finally {
      URL.revokeObjectURL(previewUrl)
    }
  }

  const handleDeleteResumeImage = async (index) => {
    try {
      await api.delete(`/users/me/resume-image/${index}`)
      const userResponse = await api.get('/users/me')
      updateUser(userResponse.data)
      toast.success('Resume image deleted!')
    } catch (error) {
      toast.error('Failed to delete resume image')
    }
  }

  const renderProfilePhoto = () => {
    if (user?.profile_photo_preview) {
      return (
        <img
          src={user.profile_photo_preview}
          alt="Profile preview"
          className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
        />
      )
    }

    if (user?.profile_photo) {
      const imageUrl = `/uploads/${user.profile_photo}?t=${Date.now()}`
      return (
        <div className="relative group">
          <img
            src={imageUrl}
            alt="Profile"
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

  const StatCard = ({ icon: Icon, label, value, subtext, color = 'blue', trend }) => {
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
    
    return (
      <div className={`bg-white border ${border} rounded-xl p-3 sm:p-4 hover:shadow-md transition-all duration-200` }  style={{ marginTop: '80px' }}>
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

  const InputField = ({ label, name, type = 'text', placeholder, icon: Icon, ...rest }) => (
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
          {...register(name)}
          type={type}
          className={`w-full px-4 py-3 ${Icon ? 'pl-11' : 'pl-4'} bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-500`}
          placeholder={placeholder}
          {...rest}
        />
      </div>
    </div>
  )

  const SelectField = ({ label, name, options, icon: Icon, ...rest }) => (
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
        <select
          {...register(name)}
          className={`w-full px-4 py-3 ${Icon ? 'pl-11' : 'pl-4'} bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 appearance-none`}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  )

  const TextareaField = ({ label, name, placeholder, rows = 4, ...rest }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <textarea
        {...register(name)}
        rows={rows}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-500 resize-none"
        placeholder={placeholder}
        {...rest}
      />
    </div>
  )

  const SkillTag = ({ skill, onRemove }) => (
    <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg text-xs sm:text-sm font-medium text-blue-700 hover:from-blue-100 hover:to-blue-200 transition-all cursor-pointer">
      <span className="truncate max-w-[80px] sm:max-w-none">{skill.skill_name}</span>
      <span className="text-xs text-blue-500 hidden sm:inline">({skill.proficiency_level})</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-blue-400 hover:text-blue-600 transition-colors ml-1"
        >
          <X className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      )}
    </div>
  )

  const ImageUpload = ({ label, currentImage, onUpload, onDelete, uploading, max = 3 }) => {
    const images = currentImage ? (Array.isArray(currentImage) ? currentImage : JSON.parse(currentImage)) : []
    const previews = user?.portfolio_image_previews || []
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="relative group">
              {previews[index] || images[index] ? (
                <div className="relative">
                  <img
                    src={previews[index] || `/uploads/${images[index]}?t=${Date.now()}`}
                    alt={`${label} ${index + 1}`}
                    className="w-full h-32 sm:h-40 object-cover rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
                    onClick={() => window.open(previews[index] || `/uploads/${images[index]}?t=${Date.now()}`, '_blank')}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg"></div>
                  <button
                    type="button"
                    onClick={() => onDelete(index)}
                    className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-red-500 text-white p-1 sm:p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg h-32 sm:h-40 flex flex-col items-center justify-center transition-all group hover:bg-blue-50/30">
                    <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 group-hover:text-blue-400 mb-2 transition-colors" />
                    <span className="text-xs sm:text-sm text-gray-500 group-hover:text-blue-500">Upload Image</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onUpload(e, index)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderViewMode = () => (
    <div className="space-y-6 sm:space-y-8">
      <div className="relative rounded-2xl overflow-hidden shadow-xl mb-6 sm:mb-8">
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

        <div className="relative bg-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-flex-start sm:gap-4 md:gap-6 mb-4">
            <div className="mb-4 sm:mb-0 flex-shrink-0">
              <div className="relative">
                {renderProfilePhoto()}
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 truncate">
                    {user?.full_name}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 md:gap-4 text-gray-600 mb-2 flex-wrap">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base font-medium truncate">{user?.professional_title || 'No title'}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base truncate">{user?.location || 'No location'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-medium">
                      {user?.primary_role ? 
                        user.primary_role.charAt(0).toUpperCase() + 
                        user.primary_role.slice(1).replace('_', ' ') 
                        : 'No role'
                      }
                    </div>
                    {user?.hourly_rate && (
                      <div className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium">
                        ${user.hourly_rate}/hr
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2 sm:mt-0">
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
            <div className="flex justify-center overflow-x-auto pb-1 sm:pb-2">
              <nav className="inline-flex space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4">
                {[
                  { id: 'overview', label: 'Overview', icon: Eye },
                  { id: 'portfolio', label: 'Portfolio', icon: FileText },
                  { id: 'reviews', label: 'Reviews', icon: Star },
                  { id: 'settings', label: 'Settings', icon: Shield }
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


      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">Contact Info</h3>
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {user?.email && (
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
              {user?.phone && (
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
              {user?.portfolio_link && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-purple-50 flex-shrink-0">
                    <GlobeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
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
          </div>

          {skills.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">Top Skills</h3>
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {skills.slice(0, 5).map((skill) => (
                  <SkillTag key={skill.id} skill={skill} />
                ))}
              </div>
            </div>
          )}

          {!isTalentType && (
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-3 sm:p-4 md:p-6">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Building className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                Company Information
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {user?.company_name && (
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
                {user?.company_email && (
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
                {user?.company_cell && (
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
                {user?.company_address && (
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

        <div className="lg:col-span-3">
          <div className="space-y-4 sm:space-y-6">
            {activeTab === 'overview' && (
              <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 md:p-6">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  About
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {user?.bio || 'No bio added yet'}
                </p>
              </div>
            )}

            {activeTab === 'portfolio' && isTalentType && (
              <div className="space-y-4 sm:space-y-6">
                {(() => {
                  let portfolioImages = []
                  try {
                    portfolioImages = user?.portfolio_images ? JSON.parse(user.portfolio_images) : []
                  } catch (error) {
                    console.error('Error parsing portfolio images:', error)
                    portfolioImages = []
                  }
                  
                  return portfolioImages.length > 0 && (
                    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 sm:p-4 md:p-6">
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        Portfolio Gallery
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {portfolioImages.map((imageName, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={`/uploads/${imageName}?t=${Date.now()}`}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
                              onClick={() => window.open(`/uploads/${imageName}?t=${Date.now()}`, '_blank')}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {userRole === 'job_seeker' && (() => {
                  let resumeImages = []
                  try {
                    resumeImages = user?.resume_images ? JSON.parse(user.resume_images) : []
                  } catch (error) {
                    console.error('Error parsing resume images:', error)
                    resumeImages = []
                  }
                  
                  return resumeImages.length > 0 && (
                    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 sm:p-4 md:p-6">
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        Resume Documents
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {resumeImages.map((imageName, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={`/uploads/${imageName}?t=${Date.now()}`}
                              alt={`Resume ${index + 1}`}
                              className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
                              onClick={() => window.open(`/uploads/${imageName}?t=${Date.now()}`, '_blank')}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {activeTab === 'reviews' && isTalentType && (
              <ReviewsSection userId={user.id} compact={false} />
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 sm:p-4 md:p-6">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    Privacy Settings
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                      <div>
                        <p className="text-xs sm:text-sm md:text-base font-medium text-gray-900">Profile Visibility</p>
                        <p className="text-xs sm:text-sm text-gray-600">Control who can see your profile</p>
                      </div>
                      <div className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium">
                        Public
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                      <div>
                        <p className="text-xs sm:text-sm md:text-base font-medium text-gray-900">Email Notifications</p>
                        <p className="text-xs sm:text-sm text-gray-600">Receive email updates</p>
                      </div>
                      <div className="w-10 h-5 sm:w-12 sm:h-6 bg-blue-600 rounded-full relative">
                        <div className="absolute right-1 top-0.5 sm:top-1 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderEditMode = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
      <div className="relative rounded-2xl overflow-hidden shadow-xl mb-6 sm:mb-8">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>

        <div className="relative bg-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-flex-start sm:gap-4 md:gap-6 mb-4">
            <div className="mb-4 sm:mb-0 flex-shrink-0">
              <div className="relative">
                {renderProfilePhoto()}
                <label className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white cursor-pointer hover:bg-blue-600 transition-colors">
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">Edit Profile</h1>
                  <p className="text-sm sm:text-base text-gray-600">Update your personal and professional information</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditMode(false)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 text-sm"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <InputField
            label="Full Name"
            name="full_name"
            icon={User}
            placeholder="Enter your full name"
            required
          />
          <InputField
            label="Professional Title"
            name="professional_title"
            icon={Briefcase}
            placeholder="e.g., Senior Web Developer"
          />
          <SelectField
            label="Location"
            name="location"
            icon={MapPin}
            options={[
              { value: '', label: 'Select city' },
              { value: 'Harare', label: 'Harare' },
              { value: 'Bulawayo', label: 'Bulawayo' },
              { value: 'Gweru', label: 'Gweru' },
              { value: 'Mutare', label: 'Mutare' },
              { value: 'Other', label: 'Other' }
            ]}
          />
          <SelectField
            label="User Type"
            name="primary_role"
            icon={UserCheck}
            options={[
              { value: 'freelancer', label: 'Freelancer' },
              { value: 'job_seeker', label: 'Job Seeker' },
              { value: 'employer', label: 'Employer' },
              { value: 'client', label: 'Client' }
            ]}
          />
        </div>

        <TextareaField
          label="Bio"
          name="bio"
          placeholder="Tell us about yourself, your experience, and what makes you unique..."
          rows={5}
        />

        <InputField
          label="Portfolio Link"
          name="portfolio_link"
          icon={LinkIcon}
          type="url"
          placeholder="https://your-portfolio.com"
        />

        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-4 sm:p-6">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            Skills & Expertise
          </h3>
          
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              {skills.map((skill) => (
                <SkillTag 
                  key={skill.id} 
                  skill={skill} 
                  onRemove={() => handleRemoveSkill(skill.id)} 
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <input
                type="text"
                value={newSkill.skill_name}
                onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
                placeholder="Add a new skill"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 placeholder-gray-500"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <select
                value={newSkill.proficiency_level}
                onChange={(e) => setNewSkill({ ...newSkill, proficiency_level: e.target.value })}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-medium flex items-center justify-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>
        </div>

        {isTalentType && (
          <>
            <div>
              <InputField
                label="Hourly Rate (Optional)"
                name="hourly_rate"
                type="number"
                icon={DollarSign}
                placeholder="e.g., 50"
              />
            </div>

            <ImageUpload
              label="Portfolio Images"
              currentImage={user?.portfolio_images}
              onUpload={handlePortfolioImageUpload}
              onDelete={handleDeletePortfolioImage}
              uploading={uploadingPhoto}
            />

            {userRole === 'job_seeker' && (
              <ImageUpload
                label="Resume/CV Images"
                currentImage={user?.resume_images}
                onUpload={handleResumeImageUpload}
                onDelete={handleDeleteResumeImage}
                uploading={uploadingPhoto}
              />
            )}
          </>
        )}

        {!isTalentType && (
          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-4 sm:p-6">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Building className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <InputField
                label="Company Name"
                name="company_name"
                icon={Building}
                placeholder="Your company name"
              />
              <InputField
                label="Company Email"
                name="company_email"
                icon={Mail}
                type="email"
                placeholder="company@example.com"
              />
              <InputField
                label="Company Phone"
                name="company_cell"
                icon={Phone}
                placeholder="+1 (555) 000-0000"
              />
              <InputField
                label="Company Address"
                name="company_address"
                icon={MapPin}
                placeholder="123 Business St, City"
              />
            </div>
          </div>
        )}
      </div>
    </form>
  )

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-4 sm:pb-6 md:pb-8 px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {isEditMode ? renderEditMode() : renderViewMode()}
      </div>
    </div>
  )
}

export default Profile
