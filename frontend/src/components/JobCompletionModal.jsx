import React, { useState, useEffect } from 'react'
import { X, Star, CheckCircle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const JobCompletionModal = ({ isOpen, onClose, job, onJobCompleted }) => {
  const [finalAmount, setFinalAmount] = useState('')
  const [completionNotes, setCompletionNotes] = useState('')
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (job) {
      setFinalAmount(job.budget || job.final_amount || '')
      setCompletionNotes('')
      setRating(0)
      setComment('')
    }
  }, [job])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!finalAmount || parseFloat(finalAmount) <= 0) {
      toast.error('Please enter a valid final amount')
      return
    }

    if (rating === 0) {
      toast.error('Please provide a rating')
      return
    }

    setLoading(true)

    try {
      const response = await api.post(`/jobs/${job.id}/complete`, {
        final_amount: parseFloat(finalAmount),
        completion_notes: completionNotes,
        talent_rating: rating,
        comment: comment
      })

      toast.success('Job completed and review submitted successfully!')
      onJobCompleted && onJobCompleted(response.data)
      onClose()
      
      // Reset form
      setFinalAmount('')
      setCompletionNotes('')
      setRating(0)
      setComment('')
      
    } catch (error) {
      console.error('Error completing job:', error)
      toast.error(error.response?.data?.detail || 'Failed to complete job')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !job) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Complete Job & Review</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Job Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
            <p className="text-sm text-gray-600">Original Budget: {job.budget_currency || '$'}{job.budget || 'Not specified'}</p>
            {job.accepted_application && (
              <p className="text-sm text-gray-600 mt-1">
                Assigned to: <span className="font-medium">{job.accepted_application.applicant.full_name}</span>
              </p>
            )}
          </div>

          {/* Final Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Final Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {job.budget_currency || '$'}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={finalAmount}
                onChange={(e) => setFinalAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Completion Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion Notes
            </label>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any notes about the job completion..."
            />
          </div>

          {/* Rating Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rate the Talent's Performance *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-all duration-200 transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredStar || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm font-medium text-gray-600">
                {rating === 0 ? 'Please rate' : `${rating} star${rating > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          {/* Review Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Comment *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Share your experience working with this talent..."
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Your review will help other employers make informed decisions
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Complete Job & Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JobCompletionModal
