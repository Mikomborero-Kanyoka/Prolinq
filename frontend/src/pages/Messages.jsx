import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  Send,
  ArrowLeft,
  Search,
  MoreVertical,
  Smile,
  MessageSquare,
  Phone,
  X,
  Check,
  CheckCheck,
  Clock,
  Home,
  Trash2,
  Reply,
  Pin,
  Star,
  Filter,
  Calendar,
  Users,
  Video,
  Settings,
  Bell,
  Shield,
  ChevronRight,
  ChevronLeft,
  SendHorizonal,
  MessageCircle,
  UserPlus,
  MoreHorizontal,
  Mail,
  PinOff,
  StarOff,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Download,
  Copy,
  Share2,
  Edit,
  Bookmark,
  BookmarkCheck,
  Menu,
  Navigation,
  Paperclip,
  Mic,
  File
} from 'lucide-react'
import LottieAnimation from '../animations/components/LottieAnimation'
import { animations } from '../assets/animations'

const Messages = () => {
  const { userId } = useParams()
  const { user } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  // Conversations state
  const [conversations, setConversations] = useState([])
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredConversations, setFilteredConversations] = useState([])
  const [activeFilter, setActiveFilter] = useState('all') // all, unread, pinned, admin
  const [pinnedConversations, setPinnedConversations] = useState([])

  // Chat state
  const [messages, setMessages] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [loadingChat, setLoadingChat] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showMessageSent, setShowMessageSent] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [repliedMessage, setRepliedMessage] = useState(null)
  const [hoveredMessageId, setHoveredMessageId] = useState(null)
  const [highlightedMessageId, setHighlightedMessageId] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false) // Hide sidebar by default on mobile
  const [showConversationMenu, setShowConversationMenu] = useState(null)
  const [showMessageMenu, setShowMessageMenu] = useState(null)
  const [mutedConversations, setMutedConversations] = useState([])
  const [archivedConversations, setArchivedConversations] = useState([])
  const [messageFilter, setMessageFilter] = useState('all') // all, links
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isRecording, setIsRecording] = useState(false)

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations()
    // Load pinned conversations from localStorage
    const savedPinned = localStorage.getItem('pinnedConversations')
    if (savedPinned) setPinnedConversations(JSON.parse(savedPinned))
  }, [])

  // Save pinned conversations to localStorage
  useEffect(() => {
    localStorage.setItem('pinnedConversations', JSON.stringify(pinnedConversations))
  }, [pinnedConversations])

  // Update filtered conversations when search or filter changes
  useEffect(() => {
    let filtered = conversations.filter(conv => {
      // Apply active filter
      if (activeFilter === 'unread') {
        if (conv.unread_count === 0) return false
      } else if (activeFilter === 'pinned') {
        if (!pinnedConversations.includes(conv.id)) return false
      } else if (activeFilter === 'admin') {
        if (!conv.is_admin_conversation) return false
      } else if (activeFilter === 'muted') {
        if (!mutedConversations.includes(conv.id)) return false
      } else if (activeFilter === 'archived') {
        if (!archivedConversations.includes(conv.id)) return false
      }

      // Apply search
      if (searchQuery.trim()) {
        const otherUserName = conv.user2?.full_name || ''
        const lastMessage = conv.last_message || ''
        const query = searchQuery.toLowerCase()
        return (
          otherUserName.toLowerCase().includes(query) ||
          lastMessage.toLowerCase().includes(query)
        )
      }
      return true
    })
    
    // Sort: pinned first, then by last message time
    filtered.sort((a, b) => {
      const aPinned = pinnedConversations.includes(a.id)
      const bPinned = pinnedConversations.includes(b.id)
      if (aPinned && !bPinned) return -1
      if (!aPinned && bPinned) return 1
      return new Date(b.last_message_at) - new Date(a.last_message_at)
    })
    
    setFilteredConversations(filtered)
  }, [searchQuery, conversations, activeFilter, pinnedConversations, mutedConversations, archivedConversations])

  // Socket listeners for new messages and typing
  useEffect(() => {
    if (!socket) return

    socket.on('new_message', (message) => {
      if (userId && (message.sender_id === parseInt(userId) || message.receiver_id === parseInt(userId))) {
        setMessages(prev => [...prev, message])
        if (message.reply_to_id) {
          setHighlightedMessageId(message.reply_to_id)
          setTimeout(() => setHighlightedMessageId(null), 3000)
        }
      }
      fetchConversations()
    })

    socket.on('typing', ({ sender_id, is_typing }) => {
      if (userId && sender_id === parseInt(userId)) {
        setTypingUsers(prev => is_typing 
          ? [...new Set([...prev, sender_id])] 
          : prev.filter(id => id !== sender_id)
        )
      }
    })

    socket.on('message_read', ({ message_id }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === message_id ? { ...msg, is_read: true } : msg
      ))
    })

    return () => {
      socket.off('new_message')
      socket.off('typing')
      socket.off('message_read')
    }
  }, [socket, userId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Scroll to highlighted message
  useEffect(() => {
    if (highlightedMessageId) {
      const element = document.getElementById(`message-${highlightedMessageId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [highlightedMessageId])

  // Fetch messages and user info when userId changes
  useEffect(() => {
    if (!userId) return
    fetchMessages(userId)
    fetchOtherUser(userId)
    // On mobile, hide sidebar when a conversation is selected
    if (window.innerWidth < 768) {
      setShowSidebar(false)
    }
  }, [userId])

  // Mark messages as read when viewing a chat
  useEffect(() => {
    if (!userId || messages.length === 0) return
    const markAsRead = async () => {
      try {
        const conversation = conversations.find(conv => 
          (conv.is_admin_conversation && conv.admin_id === parseInt(userId)) ||
          (!conv.is_admin_conversation && conv.user2?.id === parseInt(userId))
        )
        
        if (conversation?.is_admin_conversation) {
          const adminMessages = messages.filter(msg => msg.is_admin_message && !msg.is_read)
          for (const msg of adminMessages) {
            await api.put(`/messages/admin/${msg.id}/read/`)
          }
        } else {
          await api.post(`/messages/conversations/${userId}/mark-read/`)
        }
        fetchConversations()
      } catch (error) {
        console.error('Error marking as read:', error)
      }
    }
    markAsRead()
  }, [userId, messages])

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const [regularResponse, adminResponse] = await Promise.all([
        api.get('/messages/conversations'),
        api.get('/messages/admin/received').catch(() => ({ data: [] }))
      ])
      
      const regularConversations = regularResponse.data || []
      const adminMessages = adminResponse.data || []
      
      const adminConversationsMap = {}
      adminMessages.forEach(msg => {
        const adminId = msg.admin_id
        if (!adminConversationsMap[adminId]) {
          adminConversationsMap[adminId] = msg
        } else if (new Date(msg.created_at) > new Date(adminConversationsMap[adminId].created_at)) {
          adminConversationsMap[adminId] = msg
        }
      })
      
      const adminConversations = Object.values(adminConversationsMap).map(latestMsg => ({
        id: `admin_${latestMsg.admin_id}`,
        user1: user,
        user2: { 
          id: latestMsg.admin_id, 
          full_name: latestMsg.admin?.full_name || 'Admin Support', 
          profile_photo: latestMsg.admin?.profile_photo || null 
        },
        last_message: latestMsg.content,
        last_message_at: latestMsg.created_at,
        unread_count: adminMessages.filter(m => m.admin_id === latestMsg.admin_id && !m.is_read).length,
        is_admin_conversation: true,
        admin_id: latestMsg.admin_id,
        is_pinned: pinnedConversations.includes(`admin_${latestMsg.admin_id}`),
        is_muted: mutedConversations.includes(`admin_${latestMsg.admin_id}`)
      }))
      
      const allConversations = [...regularConversations.map(conv => ({
        ...conv,
        is_pinned: pinnedConversations.includes(conv.id),
        is_muted: mutedConversations.includes(conv.id)
      })), ...adminConversations]
        .sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0))
      
      setConversations(allConversations)
      setLoadingConversations(false)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast.error('Failed to load conversations')
      setLoadingConversations(false)
    }
  }

  // Fetch chat messages
  const fetchMessages = async (otherUserId, isAdminConversation = false) => {
    if (!otherUserId) return
    try {
      setLoadingChat(true)
      
      if (isAdminConversation) {
        const adminResponse = await api.get('/messages/admin/received').catch(() => ({ data: [] }))
        const adminMessages = (adminResponse.data || [])
          .filter(msg => msg.admin_id === parseInt(otherUserId))
          .map(msg => ({
            ...msg,
            is_admin_message: true,
            sender_id: msg.admin_id,
            receiver_id: msg.receiver_id
          }))
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        
        setMessages(adminMessages)
      } else {
        const [regularResponse, adminResponse] = await Promise.all([
          api.get(`/messages/conversations/${otherUserId}`),
          api.get('/messages/admin/received').catch(() => ({ data: [] }))
        ])
        
        const regularMessages = regularResponse.data || []
        const adminMessages = (adminResponse.data || [])
          .filter(msg => msg.admin_id === parseInt(otherUserId) || (msg.receiver_id === user?.id && msg.admin_id === parseInt(otherUserId)))
          .map(msg => ({
            ...msg,
            is_admin_message: true,
            sender_id: msg.admin_id,
            receiver_id: msg.receiver_id
          }))
        
        const allMessages = [...regularMessages, ...adminMessages]
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        
        setMessages(allMessages)
      }
      setLoadingChat(false)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
      setLoadingChat(false)
    }
  }

  // Fetch other user info
  const fetchOtherUser = async (otherUserId) => {
    if (!otherUserId) return
    try {
      const response = await api.get(`/users/${otherUserId}`)
      setOtherUser(response.data)
    } catch (error) {
      console.error('Error fetching user:', error)
      toast.error('Failed to load user info')
    }
  }

  // Handle conversation click
  const handleSelectConversation = (conversation) => {
    const navigateId = conversation.is_admin_conversation ? conversation.admin_id : conversation.user2.id
    navigate(`/messages/${navigateId}`)
    setOtherUser(conversation.user2)
    fetchMessages(navigateId, conversation.is_admin_conversation)
    // On mobile, hide sidebar when conversation is selected
    if (window.innerWidth < 768) {
      setShowSidebar(false)
    }
    setShowConversationMenu(null)
  }

  // Pin/unpin conversation
  const togglePinConversation = (conversationId, e) => {
    e.stopPropagation()
    if (pinnedConversations.includes(conversationId)) {
      setPinnedConversations(prev => prev.filter(id => id !== conversationId))
      toast.success('Conversation unpinned')
    } else {
      setPinnedConversations(prev => [...prev, conversationId])
      toast.success('Conversation pinned')
    }
    setShowConversationMenu(null)
  }

  // Mute/unmute conversation
  const toggleMuteConversation = (conversationId, e) => {
    e.stopPropagation()
    if (mutedConversations.includes(conversationId)) {
      setMutedConversations(prev => prev.filter(id => id !== conversationId))
      toast.success('Conversation unmuted')
    } else {
      setMutedConversations(prev => [...prev, conversationId])
      toast.success('Conversation muted')
    }
    setShowConversationMenu(null)
  }

  // Archive conversation
  const toggleArchiveConversation = (conversationId, e) => {
    e.stopPropagation()
    if (archivedConversations.includes(conversationId)) {
      setArchivedConversations(prev => prev.filter(id => id !== conversationId))
      toast.success('Conversation unarchived')
    } else {
      setArchivedConversations(prev => [...prev, conversationId])
      toast.success('Conversation archived')
    }
    setShowConversationMenu(null)
  }

  // Handle typing indicator
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value)
    if (socket && userId) {
      socket.emit('typing', { receiver_id: parseInt(userId), is_typing: true })
      // Stop typing after 2 seconds of inactivity
      clearTimeout(window.typingTimeout)
      window.typingTimeout = setTimeout(() => {
        socket.emit('typing', { receiver_id: parseInt(userId), is_typing: false })
      }, 2000)
    }
  }

  // Handle message click to mark as read
  const handleMessageClick = async (message) => {
    if (message.sender_id !== user.id && !message.is_read) {
      try {
        const endpoint = message.is_admin_message 
          ? `/messages/admin/${message.id}/read`
          : `/messages/${message.id}/read`
        await api.put(endpoint)
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, is_read: true } : msg
        ))
        fetchConversations()
      } catch (error) {
        console.error('Error marking message as read:', error)
      }
    }
  }

  // Delete message
  const handleDeleteMessage = async (messageId, isAdminMessage = false) => {
    if (!window.confirm('Delete this message?')) return
    try {
      if (isAdminMessage) {
        await api.delete(`/messages/admin/${messageId}/delete-received/`)
      } else {
        await api.delete(`/messages/${messageId}/`)
      }
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
      toast.success('Message deleted')
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Failed to delete message')
    }
  }

  // Delete conversation
  const handleDeleteConversation = async () => {
    if (!window.confirm('Delete this conversation?')) return
    try {
      await api.delete(`/messages/conversations/${userId}/`)
      navigate('/messages')
      fetchConversations()
      toast.success('Conversation deleted')
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast.error('Failed to delete conversation')
    }
  }

  // Reply to message
  const handleReplyMessage = (message) => {
    setRepliedMessage(message)
    inputRef.current?.focus()
  }

  // Copy message to clipboard
  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content)
    toast.success('Message copied to clipboard')
  }

  // Forward message
  const handleForwardMessage = (message) => {
    toast.success('Forward message functionality coming soon!')
    setShowMessageMenu(null)
  }

  // Bookmark message
  const handleBookmarkMessage = (message) => {
    toast.success('Message bookmarked')
    setShowMessageMenu(null)
  }

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId) return

    try {
      setSendingMessage(true)
      const conversation = conversations.find(conv => 
        conv.is_admin_conversation && conv.admin_id === parseInt(userId)
      )
      
      if (conversation?.is_admin_conversation) {
        toast.error('Admin messages are read-only')
        return
      }
      
      const messageData = {
        receiver_id: parseInt(userId),
        content: newMessage.trim(),
        ...(repliedMessage && { reply_to_id: repliedMessage.id })
      }
      
      const response = await api.post('/messages/', messageData)
      setMessages(prev => [...prev, response.data])
      setNewMessage('')
      setRepliedMessage(null)
      triggerMessageSentAnimation()
      fetchConversations()
      
      if (socket) {
        socket.emit('typing', { receiver_id: parseInt(userId), is_typing: false })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  // Handle file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 5) {
      toast.error('Maximum 5 files allowed')
      return
    }
    setSelectedFiles(files)
    toast.success(`${files.length} file(s) selected`)
  }

  // Handle voice recording
  const handleVoiceRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      toast.success('Recording started...')
    } else {
      toast.success('Recording stopped')
    }
  }

  const triggerMessageSentAnimation = () => {
    setShowMessageSent(true)
    setTimeout(() => setShowMessageSent(false), 1500)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Get user avatar with gradient
  const getAvatar = (userData, isOnline = true) => {
    const photo = userData?.profile_photo
    const name = userData?.full_name || 'User'
    
    if (photo && photo !== 'undefined' && photo !== 'null') {
      // Create a stable cache key for the image to prevent unnecessary reloads
      const cacheKey = `${photo}_${userData.id || 'unknown'}`
      const imageUrl = `/uploads/${photo}`
      
      return (
        <div className="relative">
          <img
            key={cacheKey}
            src={imageUrl}
            alt={name}
            className="w-full h-full rounded-full object-cover border-2 border-white"
            onError={(e) => {
              console.log('Image failed to load:', imageUrl)
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
            onLoad={(e) => {
              e.target.style.opacity = '1'
            }}
            style={{ 
              opacity: '0', 
              transition: 'opacity 0.3s ease',
              backgroundColor: '#f3f4f6' // Show light gray background while loading
            }}
          />
          {/* Fallback gradient that shows if image fails to load */}
          <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-white" style={{ display: 'none' }}>
            {name.charAt(0).toUpperCase()}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
      )
    }
    return (
      <div className="relative w-full h-full">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-white">
          {name.charAt(0).toUpperCase()}
        </div>
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>
    )
  }

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = {}
    msgs.forEach(msg => {
      const dateKey = formatDate(msg.created_at)
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(msg)
    })
    return groups
  }

  // Filter messages by type
  const filterMessagesByType = (msgs, filterType) => {
    if (filterType === 'all') return msgs
    if (filterType === 'media') return msgs.filter(msg => msg.media_url)
    if (filterType === 'links') return msgs.filter(msg => msg.content.includes('http'))
    if (filterType === 'files') return msgs.filter(msg => msg.file_url)
    return msgs
  }

  // Message sent animation overlay
  const MessageSentOverlay = () => (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      <LottieAnimation
        animationData={animations.success}
        width={150}
        height={150}
        loop={false}
      />
    </div>
  )

  // If no conversation selected
  if (!userId) {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-white flex" style={{ paddingTop: '80px' }}>
        {/* Sidebar - Always visible on mobile when no conversation selected */}
        <div className={ `fixed md:relative left-0 top-20 md:top-0 h-[calc(100vh-80px)] md:h-full w-full md:w-96 ${showSidebar ? 'flex' : 'flex'} bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex-col shadow-2xl z-40 md:z-0`}>
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-primary-700 bg-clip-text text-transparent">
                  Messages
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">Connect with your network</p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-100 to-white border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300">
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <button className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-100 to-white border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300">
                  <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-50/80 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300 transition-all duration-300 text-gray-800 placeholder-gray-500 text-sm"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200/50">
            <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-2">
              {['all', 'unread', 'pinned', 'admin', 'muted', 'archived'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === filter
                      ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-3 border-primary-500 border-t-transparent"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm text-gray-500">No conversations found</p>
                <button className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-600 text-white rounded-lg sm:rounded-xl hover:bg-primary-700 transition-colors text-sm">
                  Start New Chat
                </button>
              </div>
            ) : (
              <div className="space-y-0.5 sm:space-y-1 p-1 sm:p-2">
                {filteredConversations.map((conversation) => {
                  const otherUserData = conversation.user2
                  const isPinned = pinnedConversations.includes(conversation.id)
                  const isMuted = mutedConversations.includes(conversation.id)
                  const isArchived = archivedConversations.includes(conversation.id)
                  
                  return (
                    <div
                      key={conversation.id}
                      className="group relative"
                      onContextMenu={(e) => {
                        e.preventDefault()
                        setShowConversationMenu(conversation.id)
                      }}
                    >
                      <button
                        onClick={() => handleSelectConversation(conversation)}
                        className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 text-left hover:scale-[1.02] ${
                          conversation.is_admin_conversation
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50'
                            : 'hover:bg-gray-50/80'
                        }`}
                      >
                        <div className="flex gap-2 sm:gap-3">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14">
                              {getAvatar(otherUserData, true)}
                            </div>
                            {/* Status Badges */}
                            {isPinned && (
                              <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 p-0.5 sm:p-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full">
                                <Pin className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                              </div>
                            )}
                            {isMuted && (
                              <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 p-0.5 sm:p-1 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full">
                                <VolumeX className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                              <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                                <p className="font-bold text-gray-900 truncate text-sm sm:text-base">
                                  {otherUserData.full_name || `User #${otherUserData.id}`}
                                </p>
                                {conversation.is_admin_conversation && (
                                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-xs font-bold rounded-full whitespace-nowrap">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                {isArchived && (
                                  <BookmarkCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                                )}
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {formatTime(conversation.last_message_at)}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 truncate mb-0.5 sm:mb-1">
                              {conversation.last_message || 'No messages yet'}
                            </p>
                            <div className="flex items-center justify-between">
                              {conversation.unread_count > 0 ? (
                                <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full">
                                  {conversation.unread_count} new
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400">Seen</div>
                              )}
                              <div className="flex items-center gap-0.5 sm:gap-1">
                                {conversation.is_admin_message && (
                                  <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Context Menu */}
                      {showConversationMenu === conversation.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setShowConversationMenu(null)}
                          />
                          <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-50 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 w-40 sm:w-48">
                            <div className="p-1.5 sm:p-2">
                              <button
                                onClick={(e) => togglePinConversation(conversation.id, e)}
                                className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 rounded-lg sm:rounded-xl transition-colors"
                              >
                                {isPinned ? (
                                  <>
                                    <PinOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>Unpin</span>
                                  </>
                                ) : (
                                  <>
                                    <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>Pin</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={(e) => toggleMuteConversation(conversation.id, e)}
                                className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 rounded-lg sm:rounded-xl transition-colors"
                              >
                                {isMuted ? (
                                  <>
                                    <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>Unmute</span>
                                  </>
                                ) : (
                                  <>
                                    <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>Mute</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={(e) => toggleArchiveConversation(conversation.id, e)}
                                className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 rounded-lg sm:rounded-xl transition-colors"
                              >
                                {isArchived ? (
                                  <>
                                    <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>Unarchive</span>
                                  </>
                                ) : (
                                  <>
                                    <BookmarkCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>Archive</span>
                                  </>
                                )}
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors">
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Empty Chat Area */}
        <div className="flex-1 hidden md:flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          <div className="text-center max-w-md">
            <div className="relative mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full blur-2xl opacity-20"></div>
              <MessageSquare className="relative w-16 h-16 sm:w-20 sm:h-20 text-primary-600 mx-auto" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Welcome to Messages</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
              Select a conversation or start a new one to begin messaging
            </p>
            <div className="space-y-2 sm:space-y-3">
              <button className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base">
                New Conversation
              </button>
              <button className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-primary-600 border border-primary-200 rounded-lg sm:rounded-xl hover:bg-primary-50 transition-colors text-sm sm:text-base">
                Browse Contacts
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Chat view with sidebar and conversation
  return (
    <>
      {showMessageSent && <MessageSentOverlay />}
      <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-white flex" style={{ paddingTop: '80px' }}>
        {/* Sidebar - Hide on mobile when chat is open */}
        <div className={`fixed md:relative left-0 top-20 md:top-0 h-[calc(100vh-80px)] md:h-full ${showSidebar ? 'flex' : 'hidden md:flex'} w-full md:w-80 lg:w-96 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex-col shadow-2xl z-30 md:z-0`}>
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-primary-700 bg-clip-text text-transparent">
                  Messages
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">Connect with your network</p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-100 to-white border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300">
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <button className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-100 to-white border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300">
                  <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 bg-gray-50/80 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300 transition-all duration-300 text-gray-800 placeholder-gray-500 text-sm"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200/50">
            <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-2">
              {['all', 'unread', 'pinned', 'admin', 'muted', 'archived'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    activeFilter === filter
                      ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-3 border-primary-500 border-t-transparent"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm text-gray-500">No conversations found</p>
                <button className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-600 text-white rounded-lg sm:rounded-xl hover:bg-primary-700 transition-colors text-sm">
                  Start New Chat
                </button>
              </div>
            ) : (
              <div className="space-y-0.5 sm:space-y-1 p-1 sm:p-2">
                {filteredConversations.map((conversation) => {
                  const otherUserData = conversation.user2
                  const isPinned = pinnedConversations.includes(conversation.id)
                  const isMuted = mutedConversations.includes(conversation.id)
                  const isArchived = archivedConversations.includes(conversation.id)
                  const isActive = (conversation.is_admin_conversation && conversation.admin_id === parseInt(userId)) ||
                                 (!conversation.is_admin_conversation && conversation.user2?.id === parseInt(userId))
                  
                  return (
                    <div
                      key={conversation.id}
                      className="group relative"
                      onContextMenu={(e) => {
                        e.preventDefault()
                        setShowConversationMenu(conversation.id)
                      }}
                    >
                      <button
                        onClick={() => handleSelectConversation(conversation)}
                        className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 text-left hover:scale-[1.02] ${
                          isActive
                            ? 'bg-gradient-to-r from-primary-50 to-purple-50 border-2 border-primary-300 shadow-lg'
                            : conversation.is_admin_conversation
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50'
                            : 'hover:bg-gray-50/80'
                        }`}
                      >
                        <div className="flex gap-2 sm:gap-3">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14">
                              {getAvatar(otherUserData, true)}
                            </div>
                            {/* Status Badges */}
                            {isPinned && (
                              <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 p-0.5 sm:p-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full">
                                <Pin className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                              </div>
                            )}
                            {isMuted && (
                              <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 p-0.5 sm:p-1 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full">
                                <VolumeX className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                              <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                                <p className="font-bold text-gray-900 truncate text-sm sm:text-base">
                                  {otherUserData.full_name || `User #${otherUserData.id}`}
                                </p>
                                {conversation.is_admin_conversation && (
                                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-xs font-bold rounded-full whitespace-nowrap">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                {isArchived && (
                                  <BookmarkCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                                )}
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {formatTime(conversation.last_message_at)}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 truncate mb-0.5 sm:mb-1">
                              {conversation.last_message || 'No messages yet'}
                            </p>
                            <div className="flex items-center justify-between">
                              {conversation.unread_count > 0 ? (
                                <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full">
                                  {conversation.unread_count} new
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400">Seen</div>
                              )}
                              <div className="flex items-center gap-0.5 sm:gap-1">
                                {conversation.is_admin_message && (
                                  <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Context Menu */}
                      {showConversationMenu === conversation.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setShowConversationMenu(null)}
                          />
                          <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-50 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 w-40 sm:w-48">
                            <div className="p-1.5 sm:p-2">
                              <button
                                onClick={(e) => togglePinConversation(conversation.id, e)}
                                className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 rounded-lg sm:rounded-xl transition-colors"
                              >
                                {isPinned ? (
                                  <>
                                    <PinOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>Unpin</span>
                                  </>
                                ) : (
                                  <>
                                    <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>Pin</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={(e) => toggleMuteConversation(conversation.id, e)}
                                className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 rounded-lg sm:rounded-xl transition-colors"
                              >
                                {isMuted ? (
                                  <>
                                    <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>Unmute</span>
                                  </>
                                ) : (
                                  <>
                                    <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>Mute</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={(e) => toggleArchiveConversation(conversation.id, e)}
                                className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 rounded-lg sm:rounded-xl transition-colors"
                              >
                                {isArchived ? (
                                  <>
                                    <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>Unarchive</span>
                                  </>
                                ) : (
                                  <>
                                    <BookmarkCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>Archive</span>
                                  </>
                                )}
                              </button>
                              <div className="border-t border-gray-100 my-1"></div>
                              <button className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors">
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Mobile Back Button */}
          <button
            onClick={() => {
              navigate('/messages')
              setShowSidebar(true)
            }}
            className="md:hidden absolute top-4 left-4 z-10 p-2 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Mobile Menu Button to Show Sidebar */}
          <button
            onClick={() => setShowSidebar(true)}
            className="md:hidden absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Chat Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 ml-10 md:ml-0">
                {otherUser && (
                  <>
                    <div className="relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14">
                        {getAvatar(otherUser, true)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 p-0.5 sm:p-1 bg-green-500 rounded-full">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">{otherUser.full_name}</h3>
                        {otherUser.is_admin && (
                          <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-xs font-bold rounded-full">
                            Admin Support
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-xs sm:text-sm text-gray-600">Active now</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button className="p-1.5 sm:p-2 lg:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-100 to-white border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <button className="p-1.5 sm:p-2 lg:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-100 to-white border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300">
                  <Video className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowConversationMenu('header')}
                    className="p-1.5 sm:p-2 lg:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-100 to-white border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300"
                  >
                    <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                  {showConversationMenu === 'header' && (
                    <div className="absolute right-0 mt-2 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 w-48 sm:w-56 z-50">
                      <div className="p-1.5 sm:p-2">
                        <button className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 rounded-lg sm:rounded-xl">
                          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Conversation Info</span>
                        </button>
                        <button className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 rounded-lg sm:rounded-xl">
                          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Notification Settings</span>
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button 
                          onClick={handleDeleteConversation}
                          className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Delete Conversation</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Message Filter Bar */}
          <div className="px-4 sm:px-6 py-2 sm:py-3 border-b border-gray-200/50 bg-white/60">
            <div className="flex items-center justify-between">
              <div className="flex gap-1 sm:gap-2">
                {['all', 'links'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setMessageFilter(filter)}
                    className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      messageFilter === filter
                        ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
              <button className="text-xs text-gray-500 hover:text-gray-700">
                Search in chat
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-gradient-to-b from-gray-50/50 to-white/50">
            {loadingChat || !otherUser ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-3 border-primary-500 border-t-transparent"></div>
                  <p className="mt-2 sm:mt-3 text-sm text-gray-500">Loading messages...</p>
                </div>
              </div>
            ) : filterMessagesByType(messages, messageFilter).length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm text-gray-600">No messages yet</p>
                </div>
              </div>
            ) : (
              Object.entries(groupMessagesByDate(filterMessagesByType(messages, messageFilter))).map(([date, dateMessages]) => (
                <div key={date}>
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-4 sm:my-6 lg:my-8">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    <span className="px-3 py-0.5 sm:px-4 sm:py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 text-xs font-bold rounded-full mx-2 sm:mx-4">
                      {date}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  </div>

                  {/* Messages */}
                  <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                    {dateMessages.map(message => {
                      const isOwn = message.sender_id === user.id
                      const repliedToMsg = message.reply_to_id ? messages.find(m => m.id === message.reply_to_id) : null
                      
                      return (
                        <div
                          key={message.id}
                          id={`message-${message.id}`}
                          className={`group relative ${
                            isOwn ? 'flex justify-end' : 'flex justify-start'
                          } ${message.id === highlightedMessageId ? 'animate-pulse ring-1 ring-primary-400 rounded-lg sm:rounded-xl' : ''}`}
                          onMouseEnter={() => setHoveredMessageId(message.id)}
                          onMouseLeave={() => {
                            setHoveredMessageId(null)
                            setShowMessageMenu(null)
                          }}
                        >
                          {/* Message Bubble */}
                          <div className={`flex items-end gap-2 sm:gap-3 max-w-[85%] sm:max-w-xl ${isOwn ? 'flex-row-reverse' : ''}`}>
                            {/* Sender Avatar (only for others) */}
                            {!isOwn && !message.is_admin_message && (
                              <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex-shrink-0">
                                {getAvatar(otherUser, true)}
                              </div>
                            )}

                            {/* Message Content */}
                            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-0.5 sm:gap-1`}>
                              {/* Reply Preview */}
                              {repliedToMsg && (
                                <div className={`mb-1 sm:mb-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border-l-2 sm:border-l-4 ${
                                  repliedToMsg.sender_id === user.id
                                    ? 'bg-gradient-to-r from-purple-50 to-purple-100/50 border-purple-400'
                                    : 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-400'
                                }`}>
                                  <p className="text-xs font-bold text-gray-700 mb-0.5">
                                    Replying to {repliedToMsg.sender_id === user.id ? 'yourself' : otherUser.full_name}
                                  </p>
                                  <p className="text-sm truncate max-w-[160px] sm:max-w-[200px]">
                                    {repliedToMsg.content}
                                  </p>
                                </div>
                              )}

                              {/* Message Bubble */}
                              <div
                                className={`rounded-xl sm:rounded-2xl px-3 sm:px-4 lg:px-5 py-2 sm:py-3 shadow-sm relative ${
                                  isOwn
                                    ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-br-md'
                                    : message.is_admin_message
                                    ? 'bg-gradient-to-r from-blue-100 to-blue-200/80 text-blue-900 rounded-bl-md'
                                    : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                                }`}
                                onClick={() => handleMessageClick(message)}
                              >
                                {message.is_admin_message && (
                                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 pb-1.5 sm:pb-2 border-b border-blue-300/30">
                                    <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                                    <span className="text-xs font-bold text-blue-700">Admin Message</span>
                                  </div>
                                )}
                                <p className="break-words text-sm sm:text-base">{message.content}</p>
                                <div className={`flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-xs opacity-80">
                                    {formatTime(message.created_at)}
                                  </span>
                                  {isOwn && (
                                    <>
                                      {message.is_read ? (
                                        <CheckCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      ) : (
                                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Message Actions */}
                              {hoveredMessageId === message.id && (
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                  <button
                                    onClick={() => handleReplyMessage(message)}
                                    className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-white border border-gray-200 hover:bg-gray-50 shadow-sm"
                                  >
                                    <Reply className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                                  </button>
                                  <button
                                    onClick={() => handleCopyMessage(message.content)}
                                    className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-white border border-gray-200 hover:bg-gray-50 shadow-sm"
                                  >
                                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                                  </button>
                                  <button
                                    onClick={() => setShowMessageMenu(message.id)}
                                    className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-white border border-gray-200 hover:bg-gray-50 shadow-sm"
                                  >
                                    <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Message Context Menu */}
                            {showMessageMenu === message.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-40" 
                                  onClick={() => setShowMessageMenu(null)}
                                />
                                <div className="absolute right-0 top-0 z-50 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 w-40 sm:w-48">
                                  <div className="p-1.5 sm:p-2">
                                    <button
                                      onClick={() => handleReplyMessage(message)}
                                      className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 rounded-lg sm:rounded-xl"
                                    >
                                      <Reply className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      <span>Reply</span>
                                    </button>
                                    <button
                                      onClick={() => handleCopyMessage(message.content)}
                                      className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 rounded-lg sm:rounded-xl"
                                    >
                                      <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      <span>Copy</span>
                                    </button>
                                    <button
                                      onClick={() => handleForwardMessage(message)}
                                      className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 rounded-lg sm:rounded-xl"
                                    >
                                      <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      <span>Forward</span>
                                    </button>
                                    <button
                                      onClick={() => handleBookmarkMessage(message)}
                                      className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 rounded-lg sm:rounded-xl"
                                    >
                                      <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      <span>Bookmark</span>
                                    </button>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                      onClick={() => handleDeleteMessage(message.id, message.is_admin_message)}
                                      className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8">
                  {getAvatar(otherUser, true)}
                </div>
                <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl rounded-bl-md px-3 sm:px-4 lg:px-5 py-2 sm:py-3">
                  <div className="flex gap-0.5 sm:gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 p-3 sm:p-4 lg:p-6">
            {(() => {
              const conversation = conversations.find(conv => 
                conv.is_admin_conversation && conv.admin_id === parseInt(userId)
              )
              
              if (conversation?.is_admin_conversation) {
                return (
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl sm:rounded-2xl text-center">
                    <p className="text-xs sm:text-sm font-medium text-amber-800">
                      Admin messages are read-only. Please contact support directly.
                    </p>
                  </div>
                )
              }
              
              return (
                <div className="space-y-3 sm:space-y-4">
                  {/* Reply Preview */}
                  {repliedMessage && (
                    <div className="mb-2 sm:mb-3 sm:mb-4 p-2 sm:p-3 bg-gradient-to-r from-purple-50 to-purple-100/50 border-l-2 sm:border-l-4 border-purple-400 rounded-lg sm:rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-purple-700 mb-0.5 sm:mb-1">
                            Replying to {repliedMessage.sender_id === user.id ? 'yourself' : otherUser.full_name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {repliedMessage.content}
                          </p>
                        </div>
                        <button
                          onClick={() => setRepliedMessage(null)}
                          className="p-1 hover:bg-purple-200 rounded-md sm:rounded-lg transition-colors ml-2 flex-shrink-0"
                        >
                          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* File Preview */}
                  {selectedFiles.length > 0 && (
                    <div className="mb-2 sm:mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200 rounded-lg sm:rounded-2xl">
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <p className="text-xs sm:text-sm font-medium text-gray-700">
                          {selectedFiles.length} file(s) selected
                        </p>
                        <button
                          onClick={() => setSelectedFiles([])}
                          className="text-xs sm:text-sm text-red-600 hover:text-red-800"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white border border-gray-200 rounded-lg sm:rounded-xl p-1.5 sm:p-2">
                            <File className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto" />
                            <p className="text-xs text-gray-600 truncate text-center mt-0.5 sm:mt-1">
                              {file.name.slice(0, 8)}...
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input Area */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={handleFileSelect}
                      className="p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-100 to-white border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300"
                    >
                      <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-100 to-white border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-300"
                    >
                      <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={handleVoiceRecording}
                      className={`p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl border transition-all duration-300 ${
                        isRecording
                          ? 'bg-gradient-to-br from-red-100 to-red-200 border-red-300 animate-pulse'
                          : 'bg-gradient-to-br from-gray-100 to-white border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <Mic className={`w-4 h-4 sm:w-5 sm:h-5 ${isRecording ? 'text-red-600' : 'text-gray-600'}`} />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={handleMessageChange}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Type your message..."
                        className="w-full px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300 transition-all duration-300 text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                      />
                      {newMessage && (
                        <div className="absolute -bottom-5 left-0 text-xs text-gray-500">
                          {newMessage.length}/2000
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className={`p-2.5 sm:p-3 lg:p-3.5 rounded-lg sm:rounded-xl transition-all duration-300 ${
                        newMessage.trim()
                          ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700 hover:shadow-lg transform hover:scale-105'
                          : 'bg-gradient-to-br from-gray-100 to-white border border-gray-200 text-gray-400'
                      } ${sendingMessage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <SendHorizonal className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </>
  )
}

export default Messages
