import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useCelebrate } from '../animations/hooks/useCelebrate';
import AnimatedCard from '../components/AnimatedCard';
import { Star, MessageCircle, CheckCircle, Award, Clock, DollarSign, Users, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const JobCompletion = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [finalAmount, setFinalAmount] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [paymentCurrency, setPaymentCurrency] = useState('USD');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Review states
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoveredStar, setHoveredStar] = useState({ field: null, value: 0 });
  
  const { celebrate: triggerCelebration } = useCelebrate();

  useEffect(() => {
    fetchJobDetails();
    if (jobId) {
      fetchReviews();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/jobs/${jobId}/completion`);
      setJob(response.data);
      
      // Pre-fill form if data exists
      if (response.data.final_amount) {
        setFinalAmount(response.data.final_amount);
      }
      if (response.data.completion_notes) {
        setCompletionNotes(response.data.completion_notes);
      }
      if (response.data.payment_currency) {
        setPaymentCurrency(response.data.payment_currency);
      }
      
      return response.data;
    } catch (err) {
      setError('Failed to load job details');
      console.error('Error fetching job details:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/job/${jobId}`);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    }
  };

  const handleCompleteJob = async (e) => {
    e.preventDefault();
    if (!finalAmount || parseFloat(finalAmount) <= 0) {
      setError('Please enter a valid final amount');
      return;
    }

    try {
      setCompleting(true);
      setError('');
      setSuccess('');
      
      const completionData = {
        final_amount: parseFloat(finalAmount),
        payment_currency: paymentCurrency,
        completion_notes: completionNotes || null
      };

      await api.post(`/jobs/${jobId}/complete`, completionData);
      setSuccess('Job marked as completed successfully!');
      triggerCelebration();
      
      // Refresh job details
      await fetchJobDetails();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to complete job');
      console.error('Error completing job:', err);
    } finally {
      setCompleting(false);
    }
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    
    try {
      setConfirmingPayment(true);
      setError('');
      setSuccess('');
      
      const paymentData = {
        payment_reference: paymentReference || null,
        payment_method: paymentMethod || null,
        notes: null
      };

      await api.post(`/jobs/${jobId}/confirm-payment`, paymentData);
      setSuccess('Payment confirmed successfully!');
      triggerCelebration();
      
      // Refresh job details
      await fetchJobDetails();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to confirm payment');
      console.error('Error confirming payment:', err);
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewData.comment.trim()) {
      toast.error('Please provide a comment for your review');
      return;
    }

    try {
      setSubmittingReview(true);
      
      let reviewedUserId = null;
      if (isEmployer && job.accepted_application?.talent_id) {
        reviewedUserId = job.accepted_application.talent_id;
      } else if (isAcceptedTalent) {
        reviewedUserId = job.employer_id;
      }
      
      if (!reviewedUserId) {
        toast.error('Cannot determine who to review');
        return;
      }
      
      const reviewPayload = {
        job_id: parseInt(jobId),
        reviewed_user_id: reviewedUserId,
        rating: reviewData.rating,
        comment: reviewData.comment
      };

      await api.post('/reviews/', reviewPayload);
      
      toast.success('Review submitted successfully!');
      setReviewData({
        rating: 5,
        comment: ''
      });
      setShowReviewForm(false);
      
      // Refresh reviews
      await fetchReviews();
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStarRating = (field, value, onChange, label) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-2 text-2xl transition-all hover:scale-110 focus:outline-none"
              onClick={() => onChange(field, star)}
              onMouseEnter={() => setHoveredStar({ field, value: star })}
              onMouseLeave={() => setHoveredStar({ field: null, value: 0 })}
            >
              <span
                className={`${
                  star <= (hoveredStar.field === field ? hoveredStar.value : value)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              >
                ★
              </span>
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">({value}/5)</span>
        </div>
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'disputed': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Job not found</p>
          <button
            onClick={() => navigate('/my-jobs')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to My Jobs
          </button>
        </div>
      </div>
    );
  }

  const isEmployer = user?.id === job.employer_id;
  const isAcceptedTalent = job.accepted_application?.talent_id === user?.id;
  const canCompleteJob = isEmployer && job.status === 'in_progress';
  const canConfirmPayment = isEmployer && job.status === 'completed' && job.payment_status === 'pending';
  const canLeaveReview = (isEmployer || isAcceptedTalent) && job.status === 'completed';
  const hasReviewed = Array.isArray(reviews) && reviews.some(review => review.reviewer_id === user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/my-jobs')}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to My Jobs
          </button>
        </div>

        <AnimatedCard>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Job Completion & Payment</h1>
            
            {/* Job Details */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">{job.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(job.status)}`}>
                    {job.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(job.payment_status)}`}>
                    {(job.payment_status || 'pending').toUpperCase()}
                  </span>
                </div>
              </div>
              
              {job.completed_at && (
                <div className="mb-4">
                  <span className="text-gray-600">Completed:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(job.completed_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {job.final_amount && (
                <div className="mb-4">
                  <span className="text-gray-600">Final Amount:</span>
                  <span className="ml-2 font-semibold text-green-600">
                    {job.payment_currency} {job.final_amount}
                  </span>
                </div>
              )}
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600">{success}</p>
              </div>
            )}

            {/* Employer: Complete Job Form */}
            {canCompleteJob && (
              <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Complete Job</h3>
                <form onSubmit={handleCompleteJob} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Final Amount ({paymentCurrency})*
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={finalAmount}
                      onChange={(e) => setFinalAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter final amount to be paid"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Currency
                    </label>
                    <select
                      value={paymentCurrency}
                      onChange={(e) => setPaymentCurrency(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Completion Notes
                    </label>
                    <textarea
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any notes about the job completion..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={completing}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {completing ? 'Completing...' : 'Complete Job'}
                  </button>
                </form>
              </div>
            )}


            {/* Employer: Confirm Payment Form */}
            {canConfirmPayment && (
              <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Confirm Payment</h3>
                <form onSubmit={handleConfirmPayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Reference
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Transaction ID or reference number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select payment method</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="cash">Cash</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={confirmingPayment}
                    className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {confirmingPayment ? 'Confirming...' : 'Confirm Payment'}
                  </button>
                </form>
              </div>
            )}


            {/* Completion Notes Display */}
            {job.completion_notes && !canCompleteJob && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Completion Notes</h3>
                <p className="text-gray-600">{job.completion_notes}</p>
              </div>
            )}

            {/* Reviews Section */}
            <div className="mt-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    Reviews & Ratings
                  </h3>
                  
                  {canLeaveReview && !hasReviewed && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Leave a Review
                    </button>
                  )}
                </div>

                {/* Review Form */}
                {showReviewForm && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-lg font-medium mb-4">Submit Your Review</h4>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      {renderStarRating('rating', reviewData.rating, (field, value) => 
                        setReviewData({...reviewData, [field]: value}), 'Overall Rating')}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comment *
                        </label>
                        <textarea
                          value={reviewData.comment}
                          onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                          rows="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Share your experience working on this job..."
                          required
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                {Array.isArray(reviews) && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {review.reviewer_name || 'Anonymous'}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({review.reviewer_role})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center text-lg">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={`${
                                      star <= review.rating
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 ml-1">
                                {review.rating}/5
                              </span>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No reviews yet for this job</p>
                    {canLeaveReview && !hasReviewed && (
                      <p className="text-sm text-gray-400 mt-2">
                        Be the first to share your experience!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default JobCompletion;
