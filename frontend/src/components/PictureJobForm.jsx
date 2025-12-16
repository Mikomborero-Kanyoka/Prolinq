import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react'

const PictureJobForm = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    title: '',
    category: ''
  })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const categories = [
    'Web Development',
    'Mobile Development',
    'Design',
    'Marketing',
    'Writing',
    'Data Analysis',
    'Video Editing',
    'Illustration',
    'Translation',
    'Business Consulting',
    'Other'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        image: 'Only JPEG, PNG, GIF, and WebP images are allowed'
      }))
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        image: 'Image size must be less than 10MB'
      }))
      return
    }

    setImage(file)
    setErrors(prev => ({ ...prev, image: '' }))

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must not exceed 100 characters'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!image) {
      newErrors.image = 'Image is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    if (!user || user.primary_role === 'talent') {
      toast.error('Only employers can post jobs')
      return
    }

    setIsLoading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('title', formData.title)
      uploadFormData.append('category', formData.category)
      uploadFormData.append('file', image)

      const response = await api.post('/jobs/picture', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('Picture job posted successfully!')
      navigate('/my-jobs')
    } catch (error) {
      console.error('Error posting picture job:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to post picture job'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    setErrors(prev => ({ ...prev, image: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">Post a Picture Job</h1>
            <p className="text-blue-100">Simple, visual job posting with just an image and title</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Website Redesign, Logo Design, App Development"
                maxLength={100}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                  errors.title
                    ? 'border-red-500 focus:border-red-600 bg-red-50'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
              />
              {errors.title && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  {errors.title}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Category Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                  errors.category
                    ? 'border-red-500 focus:border-red-600 bg-red-50'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  {errors.category}
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Image *
              </label>
              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                    errors.image
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <Upload size={40} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                  <p className="text-gray-500 text-sm">PNG, JPG, GIF, WebP up to 10MB</p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              {errors.image && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  {errors.image}
                </div>
              )}
              {image && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle size={14} /> Image selected
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Tip:</span> Picture jobs are great for quick visual job postings. Use clear, professional images that represent your job well.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Posting...' : 'Post Picture Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PictureJobForm
