import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Heart, Share2, MapPin, Calendar, DollarSign } from 'lucide-react'

const PictureJobCard = ({ job, onJobUpdated }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!job.is_picture_only || !job.picture_filename) {
    return null // Don't render if not a picture job
  }

  const imageUrl = `/uploads/${job.picture_filename}`

  const handleApply = () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (user.primary_role === 'employer') {
      toast.error('Employers cannot apply to jobs')
      return
    }

    navigate(`/jobs/${job.id}`)
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      if (isSaved) {
        // Remove from saved
        await api.delete(`/api/jobs/${job.id}/save`)
        setIsSaved(false)
        toast.success('Removed from saved jobs')
      } else {
        // Save job
        await api.post(`/api/jobs/${job.id}/save`)
        setIsSaved(true)
        toast.success('Job saved successfully')
      }
    } catch (error) {
      console.error('Error saving job:', error)
      toast.error('Failed to save job')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/jobs/${job.id}`
    
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title}`,
        url: url
      }).catch(err => console.log('Error sharing:', err))
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    }
  }

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden h-full flex flex-col">
      {/* Image Container */}
      <div className="relative h-48 w-full bg-gray-200 overflow-hidden group cursor-pointer" onClick={handleApply}>
        <img
          src={imageUrl}
          alt={job.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleApply()
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-blue-700"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition">
          {job.title}
        </h3>

        {/* Category Badge */}
        <div className="mb-3">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            {job.category}
          </span>
        </div>

        {/* Job Details */}
        <div className="space-y-2 text-sm text-gray-600 mb-4 flex-1">
          {job.budget && (
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-green-600" />
              <span>
                {job.budget_min && job.budget_max
                  ? `$${job.budget_min.toLocaleString()} - $${job.budget_max.toLocaleString()}`
                  : `$${job.budget.toLocaleString()}`}
              </span>
            </div>
          )}

          {job.location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-600" />
              <span>{job.location}</span>
            </div>
          )}

          {job.created_at && (
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              <span>{formatDate(job.created_at)}</span>
            </div>
          )}
        </div>

        {/* Creator Info */}
        {job.creator && (
          <div className="border-t pt-3 mb-3">
            <p className="text-xs text-gray-500">Posted by</p>
            <p className="text-sm font-semibold text-gray-900">{job.creator.full_name || job.creator.username}</p>
            {job.creator.company_name && (
              <p className="text-xs text-gray-600">{job.creator.company_name}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t">
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Apply Now
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-4 py-2 border-2 rounded-lg transition ${
              isSaved
                ? 'border-red-500 text-red-500 bg-red-50'
                : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
            }`}
            title="Save job"
          >
            <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 border-2 border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 rounded-lg transition"
            title="Share job"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PictureJobCard