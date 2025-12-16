import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Bell, MessageSquare, User, LogOut, Briefcase, Home, CheckCircle, BarChart3, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)

  // Debug: Log state changes
  useEffect(() => {
    console.log('🎯 [Navbar] STATE CHANGED - unreadCount:', unreadCount, 'unreadMessageCount:', unreadMessageCount)
  }, [unreadCount, unreadMessageCount])

  // Debug logging
  useEffect(() => {
    console.log('🔐 Navbar Debug Info:')
    console.log('  isAuthenticated:', isAuthenticated)
    console.log('  user:', user)
    console.log('  isAdmin:', isAdmin)
    console.log('  user?.is_admin:', user?.is_admin)
    console.log('  typeof isAdmin:', typeof isAdmin)
    console.log('  isAdmin === true:', isAdmin === true)
  }, [user, isAuthenticated, isAdmin])

  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Navbar useEffect triggered - isAuthenticated:', isAuthenticated)
      fetchUnreadCounts()
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCounts, 30000)
      
      // Listen for notification and message read events
      const handleNotificationRead = () => {
        console.log('🔔 Notification read event received')
        fetchUnreadCounts()
      }
      const handleMessageRead = () => {
        console.log('💬 Message read event received')
        fetchUnreadCounts()
      }
      const handleNewNotification = (event) => {
        console.log('🔔 Navbar received new notification:', event.detail)
        fetchUnreadCounts()
        // Show toast notification
        if (event.detail?.title) {
          toast.success(`${event.detail.title}: ${event.detail.message}`)
        }
      }
      const handleNewMessage = (event) => {
        console.log('📨 Navbar received new message:', event.detail)
        fetchUnreadCounts()
        // Show toast notification for regular messages
        if (event.detail?.sender_id !== user?.id) {
          toast.success('You have a new message!')
        }
      }
      
      window.addEventListener('notification-read', handleNotificationRead)
      window.addEventListener('message-read', handleMessageRead)
      window.addEventListener('notification', handleNewNotification)
      window.addEventListener('new_message', handleNewMessage)
      
      return () => {
        clearInterval(interval)
        window.removeEventListener('notification-read', handleNotificationRead)
        window.removeEventListener('message-read', handleMessageRead)
        window.removeEventListener('notification', handleNewNotification)
        window.removeEventListener('new_message', handleNewMessage)
      }
    } else {
      console.log('❌ Navbar useEffect skipped - isAuthenticated:', isAuthenticated)
    }
  }, [isAuthenticated])

  const fetchUnreadCounts = async () => {
    try {
      console.log('🔄 [Navbar] Fetching unread counts at', new Date().toLocaleTimeString())
      
      // Fetch each count separately to handle errors better
      let notificationCount = 0
      let messageCount = 0
      let adminMessageCount = 0
      
      // Get notifications count
      try {
        console.log('📢 [Navbar] Fetching /notifications/unread/count...')
        const notifRes = await api.get('/notifications/unread/count')
        console.log('📢 [Navbar] Response:', notifRes.data)
        notificationCount = notifRes.data.count || 0
        console.log('📢 [Navbar] ✅ Notifications unread count:', notificationCount)
      } catch (error) {
        console.error('📢 [Navbar] ❌ Error fetching notification count:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        })
      }
      
      // Get messages count
      try {
        console.log('💬 [Navbar] Fetching /messages/unread/count...')
        const msgRes = await api.get('/messages/unread/count')
        console.log('💬 [Navbar] Response:', msgRes.data)
        messageCount = msgRes.data.count || 0
        console.log('💬 [Navbar] ✅ Messages unread count:', messageCount)
      } catch (error) {
        console.error('💬 [Navbar] ❌ Error fetching message count:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        })
      }
      
      // Get admin messages count
      try {
        console.log('👑 [Navbar] Fetching /messages/admin/unread/count...')
        const adminRes = await api.get('/messages/admin/unread/count')
        console.log('👑 [Navbar] Response:', adminRes.data)
        adminMessageCount = adminRes.data.count || 0
        console.log('👑 [Navbar] ✅ Admin messages unread count:', adminMessageCount)
      } catch (error) {
        console.warn('👑 [Navbar] ⚠️ Error fetching admin message count (may not exist):', {
          message: error.message,
          status: error.response?.status
        })
        adminMessageCount = 0
      }
      
      const totalMessages = messageCount + adminMessageCount
      console.log('✅ [Navbar] FINAL COUNTS - notifications:', notificationCount, 'messages (incl admin):', totalMessages)
      console.log('✅ [Navbar] Setting state: unreadCount =', notificationCount, ', unreadMessageCount =', totalMessages)
      setUnreadCount(notificationCount)
      setUnreadMessageCount(totalMessages)
    } catch (error) {
      console.error('❌ [Navbar] CRITICAL ERROR in fetchUnreadCounts:', error)
    }
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="bg-white/98 backdrop-blur-md shadow-xl border-b border-gray-100/60 sticky top-0 z-50" style={{ boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <Briefcase className="h-8 w-8 text-primary-600 transition-all duration-300 group-hover:scale-110 group-hover:text-primary-700 drop-shadow-sm" />
              <span className="text-2xl font-bold text-gray-900 tracking-tight transition-all duration-300 group-hover:text-primary-700 group-hover:scale-105">ProLinq</span>
            </Link>
          </div>

          <div className="flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/jobs"
                  className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                  Jobs
                </Link>
                {user?.primary_role === 'employer' && (
                  <>
                    <Link
                      to="/browse-talent"
                      className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                    >
                      Browse Talent
                    </Link>
                    <Link
                      to="/jobs/post"
                      className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    >
                      Post Job
                    </Link>
                  </>
                )}
                <Link
                  to="/messages"
                  className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-2.5 rounded-lg relative transition-all duration-200 hover:scale-105"
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadMessageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-5.5 w-5.5 flex items-center justify-center shadow-md animate-pulse">
                      {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/notifications"
                  className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-2.5 rounded-lg relative transition-all duration-200 hover:scale-105"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-5.5 w-5.5 flex items-center justify-center shadow-md animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/completed-jobs"
                  className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                  <CheckCircle className="h-4.5 w-4.5" />
                  <span>Completed</span>
                </Link>
                <Link
                  to="/analytics"
                  className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-2.5 rounded-lg transition-all duration-200 hover:scale-105"
                  title="Analytics Dashboard"
                >
                  <BarChart3 className="h-5 w-5" />
                </Link>
                {isAdmin && (
                  <>
                    {console.log('✅ Rendering Shield icon - isAdmin is TRUE')}
                    <Link
                      to="/admin"
                      className="text-gray-600 hover:text-amber-600 hover:bg-amber-50 p-2.5 rounded-lg transition-all duration-200 hover:scale-105"
                      title="Admin Panel"
                    >
                      <Shield className="h-5 w-5" />
                    </Link>
                  </>
                )}
                {!isAdmin && isAuthenticated && (
                  <>
                    {console.log('❌ NOT rendering Shield - isAdmin is FALSE, isAuthenticated:', isAuthenticated)}
                    <button
                      onClick={async () => {
                        console.log('🔄 Refreshing user data...');
                        try {
                          await refreshUser();
                          console.log('✅ User data refreshed');
                        } catch (error) {
                          console.error('❌ Error refreshing user data:', error);
                        }
                      }}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-3 py-1.5 rounded-lg text-xs font-medium border border-orange-200 transition-all duration-200 hover:scale-105"
                      title="Refresh Admin Status"
                    >
                      Refresh Admin
                    </button>
                  </>
                )}
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-2.5 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
