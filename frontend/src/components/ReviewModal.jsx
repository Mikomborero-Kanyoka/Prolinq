import React, { useState, useEffect } from 'react'
import { Star, X, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const ReviewModal = ({ isOpen, jobId, reviewedUserId, reviewedUserName, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [alreadyRated, setAlreadyRated] = useState(false)
  const [existingReview, setExistingReview] = useState(null)

  // Check if already rated when modal opens
  useEffect(() => {
    if (isOpen && jobId && reviewedUserId) {
      checkIfAlreadyRated()
    }
  }, [isOpen, jobId, reviewedUserId])

  const checkIfAlreadyRated = async () => {
    try {
      const response = await api.get(`/reviews/check/${jobId}/${reviewedUserId}`)
      if (response.data.has_reviewed) {
        setAlreadyRated(true)
        setExistingReview(response.data.review)
      } else {
        setAlreadyRated(false)
        setExistingReview(null)
      }
    } catch (err) {
      console.error('Error checking review status:', err)
      setAlreadyRated(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    if (!comment.trim()) {
      setError('Please write a comment')
      return
    }

    if (comment.trim().length < 10) {
      setError('Comment must be at least 10 characters')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await api.post(`/reviews/user/${reviewedUserId}`, {
        job_id: jobId,
        reviewed_user_id: reviewedUserId,
        rating: rating,
        comment: comment
      })

      console.log('Review submitted successfully:', response.data)
      setSubmitSuccess(true)
      
      // Show success toast
      toast.success('Review submitted successfully! ✓')

      // Reset form
      setRating(0)
      setComment('')
      setHoveredRating(0)

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }

      // Close modal after showing success
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to submit review'
      setError(errorMessage)
      console.error('Error submitting review:', err)
      console.error('Full error response:', err.response)
      
      // Show error toast
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = () => {
    return (
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none transition-transform hover:scale-110"
            disabled={loading}
          >
            <Star
              size={40}
              className={`transition-colors ${
                star <= (hoveredRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (!isOpen) return null

  const renderStaticStars = (ratingValue) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= ratingValue ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Share Your Experience</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded transition disabled:opacity-50"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Already Rated Message */}
        {alreadyRated && existingReview && (
          <div className="p-6 bg-blue-50 border-b border-blue-200 flex flex-col items-center">
            <AlertCircle size={48} className="text-blue-500 mb-3" />
            <p className="text-lg font-semibold text-blue-800">You've Already Rated</p>
            <p className="text-sm text-blue-700 mt-3 text-center">
              You already submitted a review for {reviewedUserName}
            </p>
            <div className="mt-4 bg-white rounded-lg p-4 w-full">
              <div className="flex items-center gap-2 mb-2">
                {renderStaticStars(existingReview.rating)}
                <span className="text-sm font-medium text-gray-700">{existingReview.rating}/5</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{existingReview.comment}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(existingReview.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        )}

        {/* Success Message */}
        {submitSuccess && (
          <div className="p-6 bg-green-50 border-b border-green-200 flex flex-col items-center">
            <CheckCircle size={48} className="text-green-500 mb-3" />
            <p className="text-lg font-semibold text-green-800">Review Submitted!</p>
            <p className="text-sm text-green-700 mt-1">Thank you for your feedback</p>
          </div>
        )}

        {/* Content */}
        {!submitSuccess && !alreadyRated && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* User Info */}
            <div className="text-center">
              <p className="text-gray-600">Rating for</p>
              <p className="text-lg font-semibold text-gray-900">{reviewedUserName}</p>
            </div>

            {/* Star Rating */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Overall Experience Rating *
              </label>
              {renderStars()}
              {rating > 0 && (
                <p className="text-center text-sm font-medium text-gray-600">
                  {rating} out of 5 stars
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-3">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                Your Review (Required) *
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share details about your experience working together. Be honest and constructive."
                rows={4}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">
                Minimum 10 characters. {comment.length} characters.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || rating === 0 || !comment.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ReviewModal
