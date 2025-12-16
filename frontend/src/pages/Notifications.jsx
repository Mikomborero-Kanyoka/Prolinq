import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import api from '../services/api'
import { Bell, Check, Trash2, ExternalLink, MessageSquare, Briefcase, Star, Award, CheckCircle, Clock } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Notifications = () => {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()

    if (socket) {
      socket.on('notification', (notification) => {
        console.log('🔔 Real-time notification received:', notification)
        const mapped = {
          ...notification,
          is_read: notification.is_read !== undefined ? notification.is_read : notification.read
        }
        
        // Parse data field if it's a string
        if (typeof notification.data === 'string' && notification.data) {
          try {
            mapped.parsedData = JSON.parse(notification.data)
          } catch (e) {
            console.warn('⚠️ Failed to parse notification data:', e)
            mapped.parsedData = {}
          }
        } else {
          mapped.parsedData = notification.data || {}
        }
        
        setNotifications(prev => [mapped, ...prev])
      })

      return () => {
        socket.off('notification')
      }
    }
  }, [socket])

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/')
      // API returns array directly, not nested under 'notifications' key
      const notificationList = Array.isArray(response.data) ? response.data : []
      // Map backend fields to frontend field names
      const mappedNotifications = notificationList.map(n => {
        const mapped = {
          ...n,
          is_read: n.is_read !== undefined ? n.is_read : n.read
        }
        
        // Parse data field if it's a string
        if (typeof n.data === 'string' && n.data) {
          try {
            mapped.parsedData = JSON.parse(n.data)
            console.log(`📦 Parsed notification data for ${n.type}:`, mapped.parsedData)
          } catch (e) {
            console.warn(`⚠️ Failed to parse notification data for ${n.id}:`, e)
            mapped.parsedData = {}
          }
        } else {
          mapped.parsedData = n.data || {}
        }
        
        return mapped
      })
      setNotifications(mappedNotifications)
      console.log('✅ Notifications fetched:', mappedNotifications.length)
      console.log('📊 Notification types:', mappedNotifications.map(n => ({ id: n.id, type: n.type, hasData: !!n.data })))
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
      // Trigger a page refresh to update navbar counter
      window.dispatchEvent(new Event('notification-read'))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // Mark each unread notification as read
      const unreadNotifications = notifications.filter(n => !n.is_read)
      await Promise.all(unreadNotifications.map(n => 
        api.put(`/notifications/${n.id}/read`)
      ))
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      // Trigger a page refresh to update navbar counter
      window.dispatchEvent(new Event('notification-read'))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`)
      setNotifications(notifications.filter(n => n.id !== notificationId))
      // Trigger a page refresh to update navbar counter
      window.dispatchEvent(new Event('notification-read'))
      toast.success('Notification deleted successfully')
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  const confirmDeleteNotification = (notificationId, notificationTitle) => {
    if (window.confirm(`Are you sure you want to delete this notification?\n\n"${notificationTitle}"`)) {
      deleteNotification(notificationId)
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'new_message':
        return <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
      case 'job_recommendation':
        return <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
      case 'job_application':
        return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
      case 'application_update':
        return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
      case 'job_completed':
        return <Award className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
      case 'review_received':
        return <Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
      default:
        return <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
    }
  }

  // Format time ago
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec ago`
    } else if (diffInSeconds < 3600) {
      const diffInMinutes = Math.floor(diffInSeconds / 60)
      return `${diffInMinutes} min ago`
    } else if (diffInSeconds < 86400) {
      const diffInHours = Math.floor(diffInSeconds / 3600)
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else {
      const diffInDays = Math.floor(diffInSeconds / 86400)
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ marginTop: '80px' }}>
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ marginTop: '80px' }}>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              {unreadCount > 0 
                ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : 'All caught up!'
              }
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <Bell className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-600 text-sm sm:text-base">No notifications yet.</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">We'll notify you when something important happens.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl sm:rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 sm:p-4 lg:p-6 border-b border-gray-100 last:border-b-0 transition-all duration-200 hover:bg-gray-50 ${
                  !notification.is_read ? 'bg-gradient-to-r from-blue-50/30 to-white' : ''
                }`}
              >
                <div className="flex gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${
                    !notification.is_read 
                      ? 'bg-gradient-to-r from-blue-100 to-blue-50' 
                      : 'bg-gray-100'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {getTimeAgo(notification.created_at)}
                        </span>
                        <div className="flex items-center gap-1">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                              title="Mark as read"
                            >
                              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => confirmDeleteNotification(notification.id, notification.title)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    {/* Action Links */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {/* Generic job link for various notification types */}
                      {notification.parsedData?.job_id && (
                        <Link
                          to={`/jobs/${notification.parsedData.job_id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 text-xs font-medium rounded-lg border border-primary-200 hover:bg-primary-200 hover:border-primary-300 transition-all duration-200"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Job
                        </Link>
                      )}
                      
                      {/* New message notification */}
                      {notification.type === 'new_message' && notification.parsedData?.sender_id && (
                        <Link
                          to={`/messages/${notification.parsedData.sender_id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs font-medium rounded-lg border border-blue-200 hover:bg-blue-200 hover:border-blue-300 transition-all duration-200"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Reply to {notification.parsedData.sender_name || 'User'}
                        </Link>
                      )}
                      
                      {/* Job recommendation notification */}
                      {notification.type === 'job_recommendation' && notification.parsedData?.job_id && (
                        <Link
                          to={`/jobs/${notification.parsedData.job_id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-green-50 to-green-100 text-green-700 text-xs font-medium rounded-lg border border-green-200 hover:bg-green-200 hover:border-green-300 transition-all duration-200"
                        >
                          <Briefcase className="w-3 h-3" />
                          View Recommendation
                        </Link>
                      )}
                      
                      {/* Application update notification */}
                      {notification.type === 'application_update' && notification.parsedData?.job_id && (
                        <Link
                          to={`/jobs/${notification.parsedData.job_id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 text-xs font-medium rounded-lg border border-amber-200 hover:bg-amber-200 hover:border-amber-300 transition-all duration-200"
                        >
                          <Clock className="w-3 h-3" />
                          Check Status
                        </Link>
                      )}
                      
                      {/* Job completed notification */}
                      {notification.type === 'job_completed' && notification.parsedData?.job_id && (
                        <Link
                          to={`/jobs/${notification.parsedData.job_id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-200 hover:bg-emerald-200 hover:border-emerald-300 transition-all duration-200"
                        >
                          <Award className="w-3 h-3" />
                          View Details
                        </Link>
                      )}
                      
                      {/* Review received notification */}
                      {notification.type === 'review_received' && notification.parsedData?.job_id && (
                        <Link
                          to={`/jobs/${notification.parsedData.job_id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 text-xs font-medium rounded-lg border border-purple-200 hover:bg-purple-200 hover:border-purple-300 transition-all duration-200"
                        >
                          <Star className="w-3 h-3" />
                          See Review
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Unread</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span>Read</span>
            </div>
          </div>
          <div>
            Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications