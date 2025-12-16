import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, Briefcase, MessageSquare, Bell, BarChart3, 
  Shield, Users, PlusCircle, ChevronLeft, ChevronRight, 
  Megaphone, Image, Mail, Sparkles, User, 
  Settings, LayoutDashboard, TrendingUp, LogOut
} from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../services/api'
import './Sidebar.css'

const Sidebar = ({ isOpen, onClose, isMinimized, onToggleMinimize }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [activePath, setActivePath] = useState(location.pathname)
  const [isMobile, setIsMobile] = useState(false)
  const [isSmallMobile, setIsSmallMobile] = useState(false)

  // Check screen sizes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsSmallMobile(window.innerWidth < 640)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
    setActivePath(location.pathname)
  }, [location.pathname])

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCounts()
      const interval = setInterval(fetchUnreadCounts, 30000)
      
      const handleNotificationRead = () => fetchUnreadCounts()
      const handleMessageRead = () => fetchUnreadCounts()
      window.addEventListener('notification-read', handleNotificationRead)
      window.addEventListener('message-read', handleMessageRead)
      
      return () => {
        clearInterval(interval)
        window.removeEventListener('notification-read', handleNotificationRead)
        window.removeEventListener('message-read', handleMessageRead)
      }
    }
  }, [isAuthenticated])

  const fetchUnreadCounts = async () => {
    try {
      const [notificationResponse, messageResponse] = await Promise.all([
        api.get('/notifications/unread/count'),
        api.get('/messages/unread/count')
      ])
      setUnreadCount(notificationResponse.data.count)
      setUnreadMessageCount(messageResponse.data.count)
    } catch (error) {
      // Ignore errors
    }
  }

  const isActive = (path) => activePath.startsWith(path)

  // Admin-only menu items
  const adminMenuItems = [
    { path: '/advertisement-manager', icon: Megaphone, label: 'My Ads', show: true, color: 'from-orange-500 to-amber-500' },
    { path: '/advertisements/create-picture', icon: Image, label: 'Create Picture Ads', show: true, color: 'from-emerald-500 to-teal-500' },
    { path: '/jobs', icon: Briefcase, label: 'Jobs', show: true, color: 'from-blue-500 to-cyan-500' },
    { path: '/admin', icon: Shield, label: 'Admin', show: true, color: 'from-purple-500 to-pink-500' },
    { path: '/admin/email-preview', icon: Mail, label: 'Email Preview', show: true, color: 'from-rose-500 to-red-500' },
  ]

  // Regular user menu items
  const regularMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', show: true, color: 'from-blue-500 to-indigo-500' },
    { path: '/jobs', icon: Briefcase, label: 'Jobs', show: true, color: 'from-emerald-500 to-green-500' },
    { path: '/browse-talent', icon: Users, label: 'Browse Talent', show: user?.primary_role === 'employer', color: 'from-violet-500 to-purple-500' },
    { path: '/jobs/post', icon: PlusCircle, label: 'Post Job', show: user?.primary_role === 'employer', color: 'from-amber-500 to-orange-500' },
    { path: '/jobs/post-picture', icon: Image, label: 'Post Picture Job', show: user?.primary_role === 'employer', color: 'from-cyan-500 to-blue-500' },
    { path: '/advertisement-generator', icon: Sparkles, label: 'Ad Generator', show: isAdmin, color: 'from-pink-500 to-rose-500' },
    { path: '/advertisement-manager', icon: Megaphone, label: 'My Ads', show: isAdmin, color: 'from-orange-500 to-amber-500' },
    { path: '/advertisements/create-picture', icon: Image, label: 'Create Picture Ad', show: isAdmin, color: 'from-emerald-500 to-teal-500' },
    { path: '/messages', icon: MessageSquare, label: 'Messages', show: true, badge: unreadMessageCount, color: 'from-indigo-500 to-blue-500' },
    { path: '/notifications', icon: Bell, label: 'Notifications', show: true, badge: unreadCount, color: 'from-red-500 to-pink-500' },
    { path: '/analytics', icon: TrendingUp, label: 'Analytics', show: true, color: 'from-green-500 to-emerald-500' },
    { path: '/admin', icon: Shield, label: 'Admin', show: isAdmin, color: 'from-purple-500 to-pink-500' },
    { path: '/profile', icon: User, label: 'Profile', show: true, color: 'from-blue-500 to-purple-500' },
    { path: '/settings', icon: Settings, label: 'Settings', show: true, color: 'from-gray-500 to-gray-700' },
  ]

  // Choose which menu to use based on admin status
  const menuItems = isAdmin ? adminMenuItems : regularMenuItems

  const visibleItems = menuItems.filter(item => item.show)
  const adminItem = visibleItems.find(item => item.path === '/admin')
  const mainItems = visibleItems.filter(item => item.path !== '/admin' && item.path !== '/profile' && item.path !== '/settings')

  const handleLogout = () => {
    logout()
    if (isMobile) {
      onClose()
    }
  }

  // For small to medium screens, use a bottom sheet style
  if (isMobile && isOpen) {
    return (
      <>
        <div 
          className="sidebar-overlay fixed inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/20 backdrop-blur-sm z-40 transition-all duration-300 ease-out"
          onClick={onClose}
        />
        
        {/* Bottom sheet style for very small screens */}
        <aside className="
          fixed bottom-0 left-0 right-0 z-50 
          bg-white rounded-t-3xl shadow-2xl border-t border-gray-100
          h-4/5 max-h-[85vh]
          transform transition-transform duration-300 ease-out
          flex flex-col
        ">
          {/* Draggable handle */}
          <div className="pt-3 pb-2 flex justify-center">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
          </div>

          {/* Navigation content with scroll */}
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-2">
              {visibleItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center justify-between w-full px-4 py-4 rounded-2xl font-medium
                    ${isActive(item.path) 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive(item.path) ? 'text-white' : 'text-gray-600'}`} />
                    <span className="font-medium">
                      {item.label}
                    </span>
                  </div>
                  
                  {item.badge && item.badge > 0 && (
                    <span className={`
                      text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center
                      ${isActive(item.path) 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                      }
                    `}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full mt-6 px-4 py-4 rounded-2xl font-medium text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-4"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </aside>
      </>
    )
  }

  return (
    <>
      {/* Sidebar - Fixed to fill exact height */}
      <aside className={`
        sidebar-container fixed z-40 transform transition-all duration-300 ease-out flex flex-col
        bg-gradient-to-b from-white via-white/95 to-white/90 backdrop-blur-xl shadow-2xl border-r border-gray-100/50
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isMinimized ? 'w-20 lg:w-24' : 'w-64 sm:w-72 lg:w-80'}
        ${isMobile ? 'top-0 h-screen' : 'md:fixed md:top-20 md:h-[calc(100vh-5rem)]'}
        h-full
      `}>
        
        {/* Brand Header with Minimize Button */}
        <div className={`sidebar-header flex items-center ${isMinimized ? 'justify-center px-3 lg:px-4' : 'justify-between px-4 sm:px-5 lg:px-6'} py-4 sm:py-5 lg:py-6 border-b border-gray-100/50 flex-shrink-0 ${isMobile ? 'mt-0' : ''}`}>
          {!isMinimized && (
            <div className="sidebar-brand flex items-center gap-2 sm:gap-3">
              <div className="sidebar-logo relative">
                <div className="sidebar-logo-glow"></div>
                <div className="sidebar-logo-inner">
                  <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              
            </div>
          )}

          {/* Hide minimize button on mobile */}
          {!isMobile && (
            <button
              onClick={onToggleMinimize}
              className="sidebar-toggle-btn"
              title={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
              aria-label="Toggle sidebar"
            >
              {isMinimized ? (
                <ChevronRight className="h-4 w-4 sm:h-5 sm:h-5 sidebar-toggle-icon" />
              ) : (
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:h-5 sidebar-toggle-icon" />
              )}
            </button>
          )}
        </div>

        {/* Navigation - Takes all available space */}
        <nav className="flex-1 overflow-y-auto px-2 sm:px-3 lg:px-4 py-4 sm:py-5 lg:py-6">
          {/* Main Navigation Items */}
          <div className="space-y-1 sm:space-y-1.5">
            {mainItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && onClose()}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
                title={isMinimized ? item.label : ""}
                className={`
                  sidebar-nav-item group relative flex items-center ${isMinimized ? 'justify-center' : 'justify-between'} 
                  w-full px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium text-sm transition-all duration-300
                  ${isActive(item.path) 
                    ? `sidebar-nav-item-active bg-gradient-to-r ${item.color} text-white shadow-lg scale-[1.02]` 
                    : 'text-gray-700 hover:bg-gray-50/80 hover:scale-[1.01]'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive(item.path) && !isMinimized && (
                  <div className="sidebar-nav-indicator absolute -left-2 sm:-left-3 top-1/2 transform -translate-y-1/2 w-1 h-6 sm:w-1.5 sm:h-8 bg-gradient-to-b from-primary-500 to-purple-600 rounded-r-full"></div>
                )}

                <div className={`flex items-center ${isMinimized ? '' : 'gap-2 sm:gap-3'}`}>
                  <div className="sidebar-nav-icon-container relative">
                    {!isActive(item.path) && (
                      <div className={`sidebar-nav-icon-glow absolute inset-0 bg-gradient-to-br ${item.color} rounded-lg sm:rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                    )}
                    <item.icon className={`sidebar-nav-icon relative h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-transform duration-300 ${isActive(item.path) ? 'text-white' : 'text-gray-600'} ${!isActive(item.path) && hoveredItem === item.path ? 'text-primary-600 scale-110' : ''}`} />
                  </div>
                  {!isMinimized && (
                    <span className={`sidebar-nav-label text-xs sm:text-sm font-medium transition-colors duration-300 ${isActive(item.path) ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>
                      {item.label}
                    </span>
                  )}
                </div>

                {/* Badge */}
                {!isMinimized && item.badge && item.badge > 0 && (
                  <span className={`
                    sidebar-nav-badge text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center flex-shrink-0
                    transition-all duration-300
                    ${isActive(item.path) 
                      ? 'sidebar-nav-badge-active bg-white/20 text-white backdrop-blur-sm border border-white/30' 
                      : 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md'
                    }
                  `}>
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}

                {/* Hover indicator for minimized */}
                {isMinimized && (
                  <div className="sidebar-nav-tooltip absolute left-full ml-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-900 text-white text-xs sm:text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <span className="ml-1.5 sm:ml-2 px-1 sm:px-1.5 py-0.5 bg-red-500 text-xs rounded-full">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Divider with gradient */}
          {adminItem && (
            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200/50"></div>
              </div>
              {!isMinimized && (
                <div className="relative flex justify-center">
                  <span className="px-2 sm:px-3 bg-white text-xs font-semibold text-gray-500">ADMIN</span>
                </div>
              )}
            </div>
          )}

          {/* Admin Section */}
          {adminItem && (
            <div className="space-y-1 sm:space-y-1.5 mb-4 sm:mb-6">
              <Link
                to={adminItem.path}
                onClick={() => isMobile && onClose()}
                onMouseEnter={() => setHoveredItem(adminItem.path)}
                onMouseLeave={() => setHoveredItem(null)}
                title={isMinimized ? adminItem.label : ""}
                className={`
                  sidebar-nav-item group relative flex items-center ${isMinimized ? 'justify-center' : 'justify-between'} 
                  w-full px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium text-sm transition-all duration-300
                  ${isActive(adminItem.path) 
                    ? `sidebar-nav-item-active bg-gradient-to-r ${adminItem.color} text-white shadow-lg scale-[1.02]` 
                    : 'text-gray-700 hover:bg-gray-50/80 hover:scale-[1.01]'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive(adminItem.path) && !isMinimized && (
                  <div className="sidebar-nav-indicator absolute -left-2 sm:-left-3 top-1/2 transform -translate-y-1/2 w-1 h-6 sm:w-1.5 sm:h-8 bg-gradient-to-b from-primary-500 to-purple-600 rounded-r-full"></div>
                )}

                <div className={`flex items-center ${isMinimized ? '' : 'gap-2 sm:gap-3'}`}>
                  <div className="sidebar-nav-icon-container relative">
                    {!isActive(adminItem.path) && (
                      <div className={`sidebar-nav-icon-glow absolute inset-0 bg-gradient-to-br ${adminItem.color} rounded-lg sm:rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                    )}
                    <adminItem.icon className={`sidebar-nav-icon relative h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-transform duration-300 ${isActive(adminItem.path) ? 'text-white' : 'text-gray-600'} ${!isActive(adminItem.path) && hoveredItem === adminItem.path ? 'text-primary-600 scale-110' : ''}`} />
                  </div>
                  {!isMinimized && (
                    <span className={`sidebar-nav-label text-xs sm:text-sm font-medium transition-colors duration-300 ${isActive(adminItem.path) ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>
                      {adminItem.label}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          )}
        </nav>

        {/* Bottom Section - Profile, Settings, Logout */}
        <div className="border-t border-gray-100/50 px-2 sm:px-3 lg:px-4 py-3 sm:py-4 mt-auto flex-shrink-0">
          {!isMinimized && (
            <div className="space-y-1 sm:space-y-1.5">
              {/* Profile */}
              <Link
                to="/profile"
                onClick={() => isMobile && onClose()}
                className="sidebar-nav-item group relative flex items-center justify-between w-full px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium text-sm transition-all duration-300 text-gray-700 hover:bg-gray-50/80 hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="sidebar-nav-icon-container relative">
                    <div className="sidebar-nav-icon-glow absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg sm:rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <User className="sidebar-nav-icon relative h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-gray-600" />
                  </div>
                  <span className="sidebar-nav-label text-xs sm:text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Profile
                  </span>
                </div>
              </Link>

              {/* Settings */}
              <Link
                to="/settings"
                onClick={() => isMobile && onClose()}
                className="sidebar-nav-item group relative flex items-center justify-between w-full px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium text-sm transition-all duration-300 text-gray-700 hover:bg-gray-50/80 hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="sidebar-nav-icon-container relative">
                    <div className="sidebar-nav-icon-glow absolute inset-0 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg sm:rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <Settings className="sidebar-nav-icon relative h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-gray-600" />
                  </div>
                  <span className="sidebar-nav-label text-xs sm:text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Settings
                  </span>
                </div>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="sidebar-nav-item group relative flex items-center justify-between w-full px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium text-sm transition-all duration-300 text-red-600 hover:bg-red-50/80 hover:scale-[1.01]"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="sidebar-nav-icon-container relative">
                    <div className="sidebar-nav-icon-glow absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg sm:rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <LogOut className="sidebar-nav-icon relative h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-red-600" />
                  </div>
                  <span className="sidebar-nav-label text-xs sm:text-sm font-medium text-red-600 group-hover:text-red-700">
                    Logout
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Minimized bottom icons */}
          {isMinimized && (
            <div className="flex flex-col items-center space-y-2 sm:space-y-3">
              <Link
                to="/profile"
                onClick={() => isMobile && onClose()}
                title="Profile"
                className="p-2 rounded-lg hover:bg-gray-50/80 transition-colors"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </Link>
              <Link
                to="/settings"
                onClick={() => isMobile && onClose()}
                title="Settings"
                className="p-2 rounded-lg hover:bg-gray-50/80 transition-colors"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </Link>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
