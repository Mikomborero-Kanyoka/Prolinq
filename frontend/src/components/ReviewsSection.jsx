import { useState, useEffect } from 'react'
import { ChevronDown, Star, User } from 'lucide-react'
import { reviewsAPI } from '../services/api'

const ReviewsSection = ({ userId, compact = false, jobId = null }) => {
  const [reviews, setReviews] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedReviews, setExpandedReviews] = useState(false)

  useEffect(() => {
    if (jobId) {
      fetchJobReviews()
    } else {
      fetchUserReviews()
    }
  }, [userId, jobId])

  const fetchJobReviews = async () => {
    try {
      console.log(`Fetching reviews for job ${jobId}...`)
      const response = await reviewsAPI.getJobReviews(jobId)
      console.log('Reviews fetched successfully:', response.data)
      setReviews(response.data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      console.error('Error details:', error.response?.data)
      setReviews({
        job_id: jobId,
        total_reviews: 0,
        reviews: []
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserReviews = async () => {
    try {
      console.log(`Fetching reviews for user ${userId}...`)
      const response = await reviewsAPI.getUserReviews(userId)
      console.log('Reviews fetched successfully:', response.data)
      setReviews(response.data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      console.error('Error details:', error.response?.data)
      setReviews({
        user_id: userId,
        average_rating: 0,
        total_reviews: 0,
        reviews: []
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Handle different review data structures
  const hasReviews = Array.isArray(reviews) ? reviews.length > 0 : (reviews && reviews.reviews && reviews.reviews.length > 0)
  const reviewData = Array.isArray(reviews) ? reviews : (reviews && reviews.reviews ? reviews.reviews : [])
  
  console.log('ReviewsSection - reviews:', reviews)
  console.log('ReviewsSection - hasReviews:', hasReviews)
  console.log('ReviewsSection - reviewData:', reviewData)
  
  if (!hasReviews) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No reviews yet</p>
      </div>
    )
  }

  // Compact view - show average rating with "View Reviews" button
  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {renderStars(Math.round(reviews.average_rating || 0))}
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {(reviews.average_rating || 0).toFixed(1)}<span className="text-gray-600 font-normal text-sm ml-1">({reviews.total_reviews || 0} {reviews.total_reviews === 1 ? 'review' : 'reviews'})</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpandedReviews(!expandedReviews)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition-colors"
          >
            View Reviews
            <ChevronDown
              size={16}
              className={`transition-transform ${expandedReviews ? 'transform rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Expanded Reviews List */}
        {expandedReviews && reviews.reviews && (
          <div className="space-y-3">
            {reviews.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{review.reviewer_name}</p>
                    <div className="flex gap-0.5">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Average Rating Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">Overall Rating</p>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {renderStars(Math.round(reviews.average_rating || 0))}
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {(reviews.average_rating || 0).toFixed(1)}
              </span>
              <span className="text-sm text-gray-600">
                ({reviews.total_reviews || 0} {(reviews.total_reviews || 0) === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-3">
        {reviewData.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Review Header - Always Visible */}
            <div className="w-full px-6 py-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User size={20} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {review.reviewer_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-0.5">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {review.rating}/5
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mt-3">
                {review.comment}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReviewsSection
