import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Upload, X, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'

const PictureAdForm = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    cta_text: '',
    cta_url: ''
  })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

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

    if (!formData.cta_text.trim()) {
      newErrors.cta_text = 'CTA text is required'
    } else {
      const wordCount = formData.cta_text.trim().split(/\s+/).length
      if (wordCount > 3) {
        newErrors.cta_text = 'CTA text must be 3 words or less'
      }
    }

    if (!formData.cta_url.trim()) {
      newErrors.cta_url = 'CTA URL is required'
    } else if (!formData.cta_url.match(/^https?:\/\//)) {
      newErrors.cta_url = 'URL must start with http:// or https://'
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

    if (!user || !user.is_admin) {
      toast.error('Only admins can create picture ads')
      return
    }

    setIsLoading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('cta_text', formData.cta_text)
      uploadFormData.append('cta_url', formData.cta_url)
      uploadFormData.append('file', image)

      const response = await api.post('/advertisements/picture', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('Picture ad created successfully!')
      navigate('/advertisement-manager')
    } catch (error) {
      console.error('Error creating picture ad:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to create picture ad'
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

  const wordCount = formData.cta_text.trim() ? formData.cta_text.trim().split(/\s+/).length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Picture Ad</h1>
            <p className="text-purple-100">Eye-catching visual advertisements with direct links</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* CTA Text Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Call-to-Action Text * (Max 3 words)
              </label>
              <input
                type="text"
                name="cta_text"
                value={formData.cta_text}
                onChange={handleInputChange}
                placeholder="e.g., 'Learn More', 'Sign Up', 'Shop Now'"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                  errors.cta_text
                    ? 'border-red-500 focus:border-red-600 bg-red-50'
                    : 'border-gray-300 focus:border-purple-500'
                }`}
              />
              {errors.cta_text && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  {errors.cta_text}
                </div>
              )}
              <p className={`text-xs mt-1 ${wordCount > 3 ? 'text-red-600' : 'text-gray-500'}`}>
                {wordCount} word{wordCount !== 1 ? 's' : ''} (Maximum 3)
              </p>
            </div>

            {/* CTA URL Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Destination URL *
              </label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  name="cta_url"
                  value={formData.cta_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/campaign"
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                    errors.cta_url
                      ? 'border-red-500 focus:border-red-600 bg-red-50'
                      : 'border-gray-300 focus:border-purple-500'
                  }`}
                />
              </div>
              {errors.cta_url && (
                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  {errors.cta_url}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Must start with http:// or https://
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ad Image *
              </label>
              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                    errors.image
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50'
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
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
              <p className="text-sm text-purple-800">
                <span className="font-semibold">💡 Best Practices:</span>
              </p>
              <ul className="text-sm text-purple-700 space-y-1 ml-4">
                <li>• Use high-quality, eye-catching images</li>
                <li>• Keep CTA text short and action-oriented</li>
                <li>• Ensure URL is correct before publishing</li>
              </ul>
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
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Picture Ad'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PictureAdForm
