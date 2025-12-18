import axios from 'axios';

// Fixed: Ensure HTTPS URLs for production deployment - Dec 18 2025
const API_URL = import.meta.env.VITE_API_URL || 'https://prolinq-production.up.railway.app/api';

// Debug: Log the actual URL being used
console.log('🔧 [API Service] Environment:', import.meta.env.MODE);
console.log('🔧 [API Service] VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🔧 [API Service] Final API_URL:', API_URL);
console.log('🔧 [API Service] App Version:', typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'unknown');

const api = axios.create({
  baseURL: API_URL,
  // Don't set Content-Type here - let axios auto-detect based on request body
  // This allows FormData to use multipart/form-data for file uploads
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('📤 Request to:', config.url);
  console.log('🔑 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'MISSING');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Authorization header set');
  } else {
    console.warn('⚠️ NO TOKEN FOUND IN LOCALSTORAGE');
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url);
    console.error('📄 Error details:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.warn('🚨 401 Unauthorized - Clearing invalid token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect to login if not already on login page
      if (!window.location.pathname.includes('/login')) {
        console.log('🔄 Redirecting to login due to 401 error');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/users/me/profile'),
};

// Jobs endpoints
export const jobsAPI = {
  list: (skip = 0, limit = 10, status = null) =>
    api.get('/jobs/', { params: { skip, limit, status_filter: status } }),
  get: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs/', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: () => api.get('/jobs/me/jobs'),
  getJobs: (params = {}) => api.get('/jobs/', { params }),
  createJob: (data) => api.post('/jobs/', data),
  createPictureJob: (formData) => api.post('/jobs/picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  complete: (jobId, data) => api.post(`/jobs/${jobId}/complete`, data),
  getApplicantDashboard: () => api.get('/jobs/dashboard/applicant'),
  getOwnerDashboard: () => api.get('/jobs/dashboard/owner'),
  getMyCompletedJobs: () => api.get('/jobs/me/completed-jobs'),
  acceptApplication: (applicationId) => api.post(`/jobs/applications/${applicationId}/accept`),
  declineApplication: (applicationId) => api.post(`/jobs/applications/${applicationId}/decline`),
};

// Users endpoints
export const usersAPI = {
  list: (skip = 0, limit = 10) => api.get('/users/', { params: { skip, limit } }),
  get: (id) => api.get(`/users/${id}`),
  getMe: () => api.get('/users/me/profile'),
  browseFreelancers: (skip = 0, limit = 10, role = null) => 
    api.get('/users/browse/freelancers', { params: { skip, limit, role } }),
};

// Applications endpoints
export const applicationsAPI = {
  create: (data) => api.post('/applications/', data),
  getJobApplications: (jobId) => api.get(`/applications/job/${jobId}`),
  getMyApplications: () => api.get('/applications/me/applications'),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
};

// Messages endpoints
export const messagesAPI = {
  send: (data) => api.post('/messages/', data),
  getConversation: (userId) => api.get(`/messages/${userId}/`),
  getAllConversations: () => api.get('/messages/me/conversations/'),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read/`),
};

// Profiles endpoints
export const profilesAPI = {
  get: (id) => api.get(`/profiles/${id}`),
  getMe: () => api.get('/profiles/me/profile'),
  update: (data) => api.put('/profiles/me/profile', data),
};

// Notifications endpoints
export const notificationsAPI = {
  get: () => api.get('/notifications/'),
  getNotifications: () => api.get('/notifications/'),
  create: (data) => api.post('/notifications/', data),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  delete: (notificationId) => api.delete(`/notifications/${notificationId}`),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
};

// Job Completion endpoints
export const jobCompletionAPI = {
  complete: (data) => api.post('/job-completion/', data),
  get: (jobId) => api.get(`/job-completion/${jobId}`),
  getMyCompleted: () => api.get('/job-completion/me/completed'),
  rate: (jobId, rating) => api.put(`/job-completion/${jobId}/rate`, { rating }),
};

// Reviews endpoints
export const reviewsAPI = {
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
  getJobReviews: (jobId) => api.get(`/reviews/job/${jobId}`),
  checkReviewExists: (jobId, reviewedUserId) => api.get(`/reviews/check/${jobId}/${reviewedUserId}`),
  createReview: (reviewData) => api.post('/reviews/', reviewData),
};

// Admin API - separate instance without /api prefix
const adminApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_URL || 'https://prolinq-production.up.railway.app',
});

// Add token to admin requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin endpoints
export const adminAPI = {
  getDashboardStats: () => adminApi.get('/admin/dashboard/stats'),
  getUsers: (params = {}) => adminApi.get('/admin/users', { params }),
  getJobs: (params = {}) => adminApi.get('/admin/jobs', { params }),
  getApplications: (params = {}) => adminApi.get('/admin/applications', { params }),
  getReviews: (params = {}) => adminApi.get('/admin/reviews', { params }),
  toggleUserStatus: (userId) => adminApi.put(`/admin/users/${userId}/toggle-status`),
  toggleUserVerification: (userId) => adminApi.put(`/admin/users/${userId}/toggle-verification`),
  toggleUserAdmin: (userId) => adminApi.put(`/admin/users/${userId}/toggle-admin`),
  deleteJob: (jobId) => adminApi.delete(`/admin/jobs/${jobId}`),
  deleteReview: (reviewId) => adminApi.delete(`/admin/reviews/${reviewId}`),
  getSystemHealth: () => adminApi.get('/admin/system/health'),
  // Chat endpoints
  getConversations: () => adminApi.get('/admin/chats/conversations'),
  getConversationMessages: (userId, params = {}) => adminApi.get(`/admin/chats/conversation/${userId}`, { params }),
  searchMessages: (query, params = {}) => adminApi.get('/admin/chats/search', { params: { ...params, query } }),
  deleteMessage: (messageId) => adminApi.delete(`/admin/chats/messages/${messageId}`),
  // Analytics endpoints
  getUserGrowth: (days = 30) => adminApi.get('/admin/analytics/user-growth', { params: { days } }),
  getJobPostingTrend: (days = 30) => adminApi.get('/admin/analytics/job-posting-trend', { params: { days } }),
  getApplicationsTrend: (days = 30) => adminApi.get('/admin/analytics/applications-trend', { params: { days } }),
  getJobStatusBreakdown: () => adminApi.get('/admin/analytics/job-status-breakdown'),
  getApplicationStatusBreakdown: () => adminApi.get('/admin/analytics/application-status-breakdown'),
  getRatingDistribution: () => adminApi.get('/admin/analytics/rating-distribution'),
  getTopCategories: (limit = 10) => adminApi.get('/admin/analytics/top-categories', { params: { limit } }),
  // Admin Messaging endpoints
  sendAdminIndividualMessage: (data) => api.post('/messages/admin/send-individual', data),
  sendAdminBulkMessage: (data) => api.post('/messages/admin/send-bulk', data),
  getAdminReceivedMessages: () => api.get('/messages/admin/received'),
  getAdminSentMessages: () => api.get('/messages/admin/sent'),
  markAdminMessageAsRead: (messageId) => api.put(`/messages/admin/${messageId}/read`),
  deleteAdminMessage: (messageId) => api.delete(`/messages/admin/${messageId}`),
  deleteReceivedAdminMessage: (messageId) => api.delete(`/messages/admin/${messageId}/delete-received`),
  deleteSentAdminMessage: (messageId) => api.delete(`/messages/admin/${messageId}/delete-sent`),
  getAdminCampaignStats: (campaignId) => api.get(`/messages/admin/campaign/${campaignId}/stats`),
  getAdminCampaignDetails: (campaignId) => api.get(`/messages/admin/campaign/${campaignId}/details`),
  getAdminUnreadCount: () => api.get('/messages/admin/unread/count'),
};

export default api;
