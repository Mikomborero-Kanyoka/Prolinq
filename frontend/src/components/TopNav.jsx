import { Menu, LogOut, Briefcase, Bell, Search, ChevronDown, Plus, X, User, Settings, Home, MessageSquare, Mail, ExternalLink, Clock } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { jobsAPI, notificationsAPI } from '../services/api'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'

const TopNav = ({ onMenuToggle }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showPostJobModal, setShowPostJobModal] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
  const [isPostingJob, setIsPostingJob] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Job posting form state
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    job_type: 'full-time',
    salary_min: '',
    salary_max: '',
    company_name: '',
    application_deadline: ''
  })

  const notificationRef = useRef(null)
  const searchRef = useRef(null)
  const postJobModalRef = useRef(null)
  const userDropdownRef = useRef(null)

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Socket connection for real-time notifications
  useEffect(() => {
    if (!user) return

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:8001', {
      auth: {
        user_id: user.id
      }
    })

    socket.on('connect', () => {
      console.log('Connected to notification socket')
    })

    socket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)
      
      // Show subtle toast for notifications
      if (!isMobile) {
        toast.custom((t) => (
          <div className={`bg-white border border-gray-200 rounded-lg shadow-lg p-3 mb-2 min-w-[300px] max-w-[400px] ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5">
                {notification.type === 'message' ? <MessageSquare size={16} /> :
                 notification.type === 'job' ? <Briefcase size={16} /> :
                 <Bell size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">{notification.title}</p>
                <p className="text-xs text-gray-600 line-clamp-2">{notification.message}</p>
              </div>
            </div>
          </div>
        ), {
          duration: 4000,
          position: 'top-right',
        })
      }
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from notification socket')
    })

    return () => {
      socket.disconnect()
    }
  }, [user, isMobile])

  // Fetch notifications on component mount
  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        document.querySelector('.topnav-search-input')?.focus()
      }
      if (event.key === 'Escape') {
        setShowSearchResults(false)
        setShowNotifications(false)
        setShowUserDropdown(false)
        setShowPostJobModal(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true)
      const response = await notificationsAPI.getNotifications()
      setNotifications(response.data)
      
      // Get unread count
      const unreadResponse = await notificationsAPI.getUnreadCount()
      setUnreadCount(unreadResponse.data.count)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // Set default notifications if API fails
      setNotifications([
        {
          id: 1,
          title: 'Welcome to ProLinq!',
          message: 'Start exploring jobs and talent',
          type: 'general',
          is_read: false,
          created_at: new Date().toISOString()
        }
      ])
      setUnreadCount(1)
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  // Handle search functionality
  const handleSearch = async (query) => {
    setSearchQuery(query)
    
    if (query.trim().length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      setIsSearching(true)
      // Search for jobs using the correct API parameter
      const jobsResponse = await jobsAPI.getJobs({ search: query, limit: 5 })
      const jobs = jobsResponse.data || []
      
      setSearchResults(jobs)
      setShowSearchResults(true)
    } catch (error) {
      console.error('Error searching:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search result click
  const handleSearchResultClick = (jobId) => {
    navigate(`/jobs/${jobId}`)
    setShowSearchResults(false)
    setSearchQuery('')
  }

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await notificationsAPI.markAsRead(notification.id)
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    }
    
    // Handle navigation based on notification type
    if (notification.type === 'job_application') {
      navigate('/jobs')
    } else if (notification.type === 'message') {
      navigate('/messages')
    }
    
    setShowNotifications(false)
  }

  // Handle post job form submission
  const handlePostJob = async (e) => {
    e.preventDefault()
    
    if (!jobForm.title || !jobForm.description) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      setIsPostingJob(true)
      const jobData = {
        ...jobForm,
        requirements: jobForm.requirements.split('\n').filter(req => req.trim()),
        salary_min: jobForm.salary_min ? parseFloat(jobForm.salary_min) : null,
        salary_max: jobForm.salary_max ? parseFloat(jobForm.salary_max) : null
      }

      await jobsAPI.createJob(jobData)
      toast.success('Job posted successfully!')
      setShowPostJobModal(false)
      setJobForm({
        title: '',
        description: '',
        requirements: '',
        location: '',
        job_type: 'full-time',
        salary_min: '',
        salary_max: '',
        company_name: '',
        application_deadline: ''
      })
      navigate('/jobs')
    } catch (error) {
      console.error('Error posting job:', error)
      toast.error(error.response?.data?.detail || 'Failed to post job')
    } finally {
      setIsPostingJob(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'job_application':
        return <Briefcase className="w-4 h-4" />;
      case 'job_alert':
        return <Bell className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  }

  return (
    <header className="w-full h-20 bg-white/80 backdrop-blur-md border-b border-gray-200/80 fixed top-0 left-0 right-0 z-50 shadow-sm transition-all duration-300">
      <div className="h-full px-4 md:px-6 max-w-7xl mx-auto">
        <div className="h-full flex items-center justify-between gap-4">
          
          {/* Left Section - Brand & Mobile Menu */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-xl hover:bg-gray-100/80 text-gray-600 hover:text-gray-900 transition-all duration-200 md:hidden active:scale-95"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <Link to="/dashboard" className="flex items-center gap-3 hover:no-underline group">
              <div className="relative transition-transform duration-300 group-hover:scale-105">
                <div className="absolute inset-0 bg-indigo-500/30 rounded-xl blur-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 hidden sm:block tracking-tight">
                ProLinq
              </span>
            </Link>
          </div>

          {/* Center Section - Search Bar */}
          <div className="flex-1 max-w-2xl mx-auto" ref={searchRef}>
            <div className="relative group">
              <div className={`relative flex items-center bg-gray-50/80 border transition-all duration-300 rounded-2xl ${
                isSearching || showSearchResults 
                  ? 'bg-white border-indigo-500/50 ring-4 ring-indigo-500/10 shadow-lg shadow-indigo-500/5' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-white hover:shadow-md'
              }`}>
                <Search className={`absolute left-3.5 w-4 h-4 transition-colors duration-200 ${
                  isSearching || showSearchResults ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={isMobile ? "Search..." : "Search jobs, talent, or companies..."}
                  className="w-full pl-11 pr-20 py-2.5 bg-transparent border-0 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none text-sm md:text-base"
                />
                <div className="absolute right-3 flex items-center gap-1 pointer-events-none opacity-60 hidden md:flex">
                  <kbd className="min-w-[20px] h-5 flex items-center justify-center text-[10px] font-medium bg-white border border-gray-200 rounded shadow-sm text-gray-500">⌘</kbd>
                  <kbd className="min-w-[20px] h-5 flex items-center justify-center text-[10px] font-medium bg-white border border-gray-200 rounded shadow-sm text-gray-500">K</kbd>
                </div>
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 max-h-[32rem] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 backdrop-blur-sm sticky top-0 z-10">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Search Results</span>
                    {searchResults.length > 0 && (
                      <span className="text-xs font-medium px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">{searchResults.length} found</span>
                    )}
                  </div>
                  {isSearching ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-500">
                      <div className="w-6 h-6 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Searching...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="p-2 space-y-1">
                      {searchResults.map((job) => (
                        <button
                          key={job.id}
                          className="w-full p-3 flex items-center gap-4 hover:bg-gray-50 rounded-xl transition-all duration-200 text-left group/item border border-transparent hover:border-gray-100"
                          onClick={() => handleSearchResultClick(job.id)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover/item:bg-indigo-100 transition-colors">
                            <Briefcase className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate group-hover/item:text-indigo-600 transition-colors">{job.title}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              <span className="font-medium text-gray-700">{job.company_name}</span>
                              <span>•</span>
                              <span>{job.location}</span>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-300 group-hover/item:text-indigo-400 flex-shrink-0 transition-colors" />
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.trim().length >= 2 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <Search className="w-8 h-8 text-gray-300 mb-3" />
                      <p className="text-sm font-medium text-gray-900">No results found</p>
                      <p className="text-xs text-gray-500 mt-1">Try adjusting your search terms</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Right Section - User Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            {user && (
              <>
                {/* Post Job Button */}
                {(user.primary_role === 'employer' || user.primary_role === 'client') && (
                  <>
                    <button 
                      className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 font-medium text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95"
                      onClick={() => navigate('/jobs/post')}
                      aria-label="Post Job"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Post Job</span>
                    </button>
                    <button 
                      className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all duration-200 md:hidden active:scale-95"
                      onClick={() => navigate('/jobs/post')}
                      aria-label="Post Job"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    className={`relative p-2.5 rounded-xl transition-all duration-200 active:scale-95 ${
                      showNotifications 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => setShowNotifications(!showNotifications)}
                    aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                  >
                    <Bell className={`w-5 h-5 transition-transform duration-300 ${unreadCount > 0 ? 'animate-pulse-subtle' : ''}`} />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full shadow-sm"></span>
                    )}
                  </button>

                  {/* Notifications Panel */}
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 bg-black/5 z-40 backdrop-blur-[1px]" onClick={() => setShowNotifications(false)} />
                      <div className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 z-50 max-h-[32rem] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                              <span className="px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium rounded-full">{unreadCount} new</span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button 
                              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline decoration-indigo-200 underline-offset-2 transition-all"
                              onClick={async () => {
                                try {
                                  await notificationsAPI.markAllAsRead()
                                  setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
                                  setUnreadCount(0)
                                  toast.success('All notifications marked as read')
                                } catch (error) {
                                  console.error('Error marking all as read:', error)
                                }
                              }}
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                          {isLoadingNotifications ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-500">
                              <div className="w-6 h-6 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
                              <span className="text-sm">Loading...</span>
                            </div>
                          ) : notifications.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                              {notifications.slice(0, isMobile ? 5 : 7).map((notification) => (
                                <button
                                  key={notification.id}
                                  className={`w-full px-5 py-4 flex items-start gap-4 hover:bg-gray-50/80 transition-all duration-200 text-left group ${
                                    !notification.is_read ? 'bg-indigo-50/30' : ''
                                  }`}
                                  onClick={() => handleNotificationClick(notification)}
                                >
                                  <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${
                                    !notification.is_read ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className={`text-sm mb-1 ${!notification.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                      {notification.title}
                                    </div>
                                    <div className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">{notification.message}</div>
                                    <div className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatTimeAgo(notification.created_at)}
                                    </div>
                                  </div>
                                  {!notification.is_read && (
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0 shadow-sm shadow-indigo-200"></div>
                                  )}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Bell className="h-8 w-8 text-gray-300" />
                              </div>
                              <p className="text-sm font-medium text-gray-900">No notifications yet</p>
                              <span className="text-xs text-gray-500 mt-1">You're all caught up!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* User Profile */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className={`flex items-center gap-3 p-1.5 pr-3 rounded-full border transition-all duration-200 active:scale-95 ${
                      showUserDropdown 
                        ? 'bg-white border-indigo-200 shadow-md ring-2 ring-indigo-500/10' 
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    aria-label="User menu"
                  >
                    <div className="relative w-8 h-8 md:w-9 md:h-9">
                      {user?.profile_photo ? (
                        <img
                          src={`/uploads/${user.profile_photo}`}
                          alt={user.full_name || 'Profile'}
                          className="w-full h-full rounded-full object-cover ring-2 ring-white shadow-sm"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=6366f1&color=fff&bold=true&size=128`
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-sm">
                          {user.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                    </div>
                    <div className="hidden md:flex flex-col items-start mr-1">
                      <span className="text-sm font-semibold text-gray-900 leading-none mb-1">{user.full_name?.split(' ')[0] || 'User'}</span>
                      <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide leading-none">{user.primary_role || 'Member'}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showUserDropdown ? 'rotate-180 text-indigo-600' : ''}`} />
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserDropdown && (
                    <>
                      <div className="fixed inset-0 bg-black/5 z-40 backdrop-blur-[1px]" onClick={() => setShowUserDropdown(false)} />
                      <div className="absolute top-full right-0 mt-3 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-5 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-14 h-14 rounded-full ring-4 ring-white shadow-md overflow-hidden">
                              {user?.profile_photo ? (
                                <img
                                  src={`/uploads/${user.profile_photo}`}
                                  alt={user.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl">
                                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-gray-900 truncate">{user.full_name}</h4>
                              <p className="text-xs text-gray-500 truncate mb-1.5">{user.email}</p>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide">
                                {user.primary_role || 'Member'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-2">
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-xl transition-all duration-200 group"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <div className="p-1.5 rounded-lg bg-gray-50 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                              <Home className="w-4 h-4" />
                            </div>
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-xl transition-all duration-200 group"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <div className="p-1.5 rounded-lg bg-gray-50 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                              <User className="w-4 h-4" />
                            </div>
                            <span>My Profile</span>
                          </Link>
                          <Link
                            to="/messages"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-xl transition-all duration-200 group"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <div className="p-1.5 rounded-lg bg-gray-50 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <span>Messages</span>
                            <span className="ml-auto bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">3</span>
                          </Link>
                          <Link
                            to="/notifications"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-xl transition-all duration-200 group"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <div className="p-1.5 rounded-lg bg-gray-50 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                              <Bell className="w-4 h-4" />
                            </div>
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                              <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                            )}
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-xl transition-all duration-200 group"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <div className="p-1.5 rounded-lg bg-gray-50 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                              <Settings className="w-4 h-4" />
                            </div>
                            <span>Settings</span>
                          </Link>
                        </div>
                        
                        <div className="p-2 border-t border-gray-50 bg-gray-50/50">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 w-full group"
                          >
                            <div className="p-1.5 rounded-lg bg-red-50 text-red-500 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                              <LogOut className="w-4 h-4" />
                            </div>
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Post Job Modal */}
      {showPostJobModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPostJobModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" ref={postJobModalRef} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Post a New Job</h2>
              <button 
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPostJobModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePostJob} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Job Title *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                    placeholder="e.g. Senior Frontend Developer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={jobForm.company_name}
                    onChange={(e) => setJobForm({...jobForm, company_name: e.target.value})}
                    placeholder="e.g. Tech Corp"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                    placeholder="e.g. New York, NY or Remote"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Job Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={jobForm.job_type}
                    onChange={(e) => setJobForm({...jobForm, job_type: e.target.value})}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={jobForm.application_deadline}
                    onChange={(e) => setJobForm({...jobForm, application_deadline: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Salary Range (Min)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={jobForm.salary_min}
                    onChange={(e) => setJobForm({...jobForm, salary_min: e.target.value})}
                    placeholder="e.g. 50000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Salary Range (Max)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    value={jobForm.salary_max}
                    onChange={(e) => setJobForm({...jobForm, salary_max: e.target.value})}
                    placeholder="e.g. 80000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                  value={jobForm.description}
                  onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Requirements</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})}
                  placeholder="List the required skills and experience (one per line)..."
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  onClick={() => setShowPostJobModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isPostingJob}
                >
                  {isPostingJob ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Posting...
                    </>
                  ) : (
                    'Post Job'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}

export default TopNav
