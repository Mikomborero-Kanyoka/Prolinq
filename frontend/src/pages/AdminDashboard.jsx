import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Star, 
  Activity, 
  CheckCircle, 
  TrendingUp,
  Shield,
  Trash2,
  Search,
  RefreshCw,
  MessageSquare,
  BarChart3,
  PieChart,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [],
    jobTrend: [],
    applicationsTrend: [],
    jobStatusBreakdown: [],
    applicationStatusBreakdown: [],
    ratingDistribution: [],
    topCategories: [],
  });
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState(30);
  const [analyticsSubTab, setAnalyticsSubTab] = useState('trends');

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus) params.is_active = filterStatus === 'active';
      
      const response = await adminAPI.getUsers(params);
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    }
  };

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus) params.status = filterStatus;
      
      const response = await adminAPI.getJobs(params);
      setJobs(response.data);
    } catch (error) {
      toast.error('Failed to fetch jobs');
      console.error('Error fetching jobs:', error);
    }
  };

  // Fetch applications
  const fetchApplications = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      
      const response = await adminAPI.getApplications(params);
      setApplications(response.data);
    } catch (error) {
      toast.error('Failed to fetch applications');
      console.error('Error fetching applications:', error);
    }
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const response = await adminAPI.getReviews();
      setReviews(response.data);
    } catch (error) {
      toast.error('Failed to fetch reviews');
      console.error('Error fetching reviews:', error);
    }
  };

  // Toggle user status
  const toggleUserStatus = async (userId) => {
    try {
      const response = await adminAPI.toggleUserStatus(userId);
      toast.success(response.data.message);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to toggle user status');
      console.error('Error toggling user status:', error);
    }
  };

  // Toggle user verification
  const toggleUserVerification = async (userId) => {
    try {
      const response = await adminAPI.toggleUserVerification(userId);
      toast.success(response.data.message);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to toggle user verification');
      console.error('Error toggling user verification:', error);
    }
  };

  // Toggle user admin status
  const toggleUserAdmin = async (userId) => {
    try {
      const response = await adminAPI.toggleUserAdmin(userId);
      toast.success(response.data.message);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to toggle admin status');
      console.error('Error toggling admin status:', error);
    }
  };

  // Delete job
  const deleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        const response = await adminAPI.deleteJob(jobId);
        toast.success(response.data.message);
        fetchJobs();
      } catch (error) {
        toast.error('Failed to delete job');
        console.error('Error deleting job:', error);
      }
    }
  };

  // Delete review
  const deleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const response = await adminAPI.deleteReview(reviewId);
        toast.success(response.data.message);
        fetchReviews();
      } catch (error) {
        toast.error('Failed to delete review');
        console.error('Error deleting review:', error);
      }
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const [
        userGrowth,
        jobTrend,
        applicationsTrend,
        jobStatus,
        appStatus,
        ratings,
        categories
      ] = await Promise.all([
        adminAPI.getUserGrowth(analyticsTimeRange),
        adminAPI.getJobPostingTrend(analyticsTimeRange),
        adminAPI.getApplicationsTrend(analyticsTimeRange),
        adminAPI.getJobStatusBreakdown(),
        adminAPI.getApplicationStatusBreakdown(),
        adminAPI.getRatingDistribution(),
        adminAPI.getTopCategories(10),
      ]);

      setAnalyticsData({
        userGrowth: userGrowth.data.data || [],
        jobTrend: jobTrend.data.data || [],
        applicationsTrend: applicationsTrend.data.data || [],
        jobStatusBreakdown: jobStatus.data.data || [],
        applicationStatusBreakdown: appStatus.data.data || [],
        ratingDistribution: ratings.data.data || [],
        topCategories: categories.data.data || [],
      });
    } catch (error) {
      toast.error('Failed to fetch analytics data');
      console.error('Error fetching analytics:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (activeTab === 'dashboard') {
        await fetchStats();
      } else if (activeTab === 'users') {
        await fetchUsers();
      } else if (activeTab === 'jobs') {
        await fetchJobs();
      } else if (activeTab === 'applications') {
        await fetchApplications();
      } else if (activeTab === 'reviews') {
        await fetchReviews();
      } else if (activeTab === 'analytics') {
        await fetchAnalytics();
      }
      setLoading(false);
    };

    fetchData();
  }, [activeTab, searchTerm, filterStatus, analyticsTimeRange]);

  const StatCard = ({ icon: Icon, title, value, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-gray-500 mt-1">{trend}</p>
          )}
        </div>
        <Icon className={`w-8 h-8 ${color.replace('border-', 'text-')}`} />
      </div>
    </motion.div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
      
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.total_users}
            color="border-blue-500 text-blue-500"
            trend={`${stats.recent_registrations} new this week`}
          />
          <StatCard
            icon={Briefcase}
            title="Total Jobs"
            value={stats.total_jobs}
            color="border-green-500 text-green-500"
            trend={`${stats.active_jobs} active`}
          />
          <StatCard
            icon={FileText}
            title="Applications"
            value={stats.total_applications}
            color="border-yellow-500 text-yellow-500"
          />
          <StatCard
            icon={Star}
            title="Reviews"
            value={stats.total_reviews}
            color="border-purple-500 text-purple-500"
          />
          <StatCard
            icon={Activity}
            title="Messages Today"
            value={stats.messages_today}
            color="border-red-500 text-red-500"
          />
        </div>
      ) : (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-500 mt-2">Loading dashboard...</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Verified Users</span>
              <span className="font-semibold">{stats?.verified_users || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Admin Users</span>
              <span className="font-semibold">{stats?.admin_users || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed Jobs</span>
              <span className="font-semibold">{stats?.completed_jobs || 0}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('users')}
              className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              Manage Jobs
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              Manage Reviews
            </button>
            <button
              onClick={() => navigate('/admin/chats')}
              className="w-full text-left px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              Manage Chats
            </button>
            <button
              onClick={() => navigate('/admin/messaging')}
              className="w-full text-left px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors font-medium text-blue-700"
            >
              Send Messages (Admin)
            </button>
            <button
              onClick={() => navigate('/admin/email-preview')}
              className="w-full text-left px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors font-medium text-green-700"
            >
              Email Preview & Testing
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jobs/Apps
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.full_name || user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.primary_role}
                    </span>
                    {user.is_admin && (
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        Admin
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {user.is_verified && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.jobs_count}/{user.applications_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          user.is_active 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => toggleUserVerification(user.id)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          user.is_verified 
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {user.is_verified ? 'Unverify' : 'Verify'}
                      </button>
                      <button
                        onClick={() => toggleUserAdmin(user.id)}
                        className="px-3 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200"
                      >
                        {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderJobs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Job Management</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      <div className="text-sm text-gray-500">{job.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.creator_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${job.budget || `${job.budget_min}-${job.budget_max}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      job.status === 'open' ? 'bg-green-100 text-green-800' :
                      job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      job.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.applications_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => deleteJob(job.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Application Management</h2>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proposed Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {app.job_title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.applicant_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${app.proposed_price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Review Management</h2>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviewer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviewed User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {review.job_title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {review.reviewer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {review.reviewed_user_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {review.comment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  const analyticsSubTabs = [
    { id: 'trends', label: 'Growth & Trends' },
    { id: 'status', label: 'Status Breakdown' },
    { id: 'reviews', label: 'Reviews & Ratings' },
    { id: 'categories', label: 'Categories' },
    { id: 'summary', label: 'Summary' },
  ];

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
        <div className="flex gap-2">
          <select
            value={analyticsTimeRange}
            onChange={(e) => setAnalyticsTimeRange(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={60}>Last 60 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={365}>Last Year</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-500 mt-2">Loading analytics data...</p>
        </div>
      )}

      {!loading && (
        <>
          {Object.values(analyticsData).every(arr => arr.length === 0) && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-lg">No analytics data available yet.</p>
              <p className="text-gray-500 text-sm mt-1">Data will appear as users, jobs, and applications are created.</p>
            </div>
          )}

          {!Object.values(analyticsData).every(arr => arr.length === 0) && (
            <>
              {/* Analytics Sub-Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex gap-4 overflow-x-auto">
                  {analyticsSubTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setAnalyticsSubTab(tab.id)}
                      className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                        analyticsSubTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Growth & Trends Tab */}
              {analyticsSubTab === 'trends' && (
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analyticsData.userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={{ fill: '#3B82F6' }}
                          activeDot={{ r: 6 }}
                          name="New Users"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-xl shadow-lg p-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Postings Trend</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.jobTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#10B981" name="Jobs Posted" />
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-xl shadow-lg p-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications Trend</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analyticsData.applicationsTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#F59E0B"
                            strokeWidth={2}
                            dot={{ fill: '#F59E0B' }}
                            name="Applications"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Status Breakdown Tab */}
              {analyticsSubTab === 'status' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={analyticsData.jobStatusBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.status}: ${entry.count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analyticsData.jobStatusBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={analyticsData.applicationStatusBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.status}: ${entry.count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analyticsData.applicationStatusBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </motion.div>
                </div>
              )}

              {/* Reviews & Ratings Tab */}
              {analyticsSubTab === 'reviews' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Ratings Distribution</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analyticsData.ratingDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" label={{ value: 'Rating (★)', position: 'insideBottomRight', offset: -5 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8B5CF6" name="Count">
                        {analyticsData.ratingDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.rating - 1] || COLORS[0]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Categories Tab */}
              {analyticsSubTab === 'categories' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Job Categories</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={analyticsData.topCategories}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={190} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#EC4899" name="Jobs">
                        {analyticsData.topCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Summary Tab */}
              {analyticsSubTab === 'summary' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analyticsData.userGrowth.reduce((sum, d) => sum + d.count, 0)}</div>
                      <div className="text-sm text-gray-600">New Users (Period)</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analyticsData.jobTrend.reduce((sum, d) => sum + d.count, 0)}</div>
                      <div className="text-sm text-gray-600">Jobs Posted (Period)</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{analyticsData.applicationsTrend.reduce((sum, d) => sum + d.count, 0)}</div>
                      <div className="text-sm text-gray-600">Applications (Period)</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{analyticsData.ratingDistribution.reduce((sum, d) => sum + d.count, 0)}</div>
                      <div className="text-sm text-gray-600">Total Reviews</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            Admin Panel
          </h1>
          <p className="mt-2 text-gray-600">Manage users, jobs, applications, and reviews</p>
        </div>

        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'jobs' && renderJobs()}
            {activeTab === 'applications' && renderApplications()}
            {activeTab === 'reviews' && renderReviews()}
            {activeTab === 'analytics' && renderAnalytics()}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
