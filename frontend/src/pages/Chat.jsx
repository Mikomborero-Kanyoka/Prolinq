import { useEffect, useState, useRef } from 'react'

import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Send, ArrowLeft, Reply, X, Trash2, Smile } from 'lucide-react'
import { Link } from 'react-router-dom'
import LottieAnimation from '../animations/components/LottieAnimation'
import { animations } from '../assets/animations'

const Chat = () => {
  const { userId } = useParams()
  const { user } = useAuth()
  const { socket } = useSocket()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [otherUser, setOtherUser] = useState(null)
  const [replyTo, setReplyTo] = useState(null)
  const [highlightedMessageId, setHighlightedMessageId] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const emojiPickerRef = useRef(null)
  
  // Stable cache key for profile pictures to prevent flickering
  const [profileCacheKey] = useState(() => Date.now())

  const commonEmojis = ['😀', '😂', '😍', '😭', '😢', '😡', '👍', '👎', '🎉', '🎊', '❤️', '🔥', '✨', '😎', '🚀', '💯']

  useEffect(() => {
    fetchMessages()
    fetchOtherUser()
    
    if (socket) {
      socket.on('new_message', (message) => {
        if (message.sender_id === parseInt(userId) || message.receiver_id === parseInt(userId)) {
          setMessages(prev => [...prev, message])
          
          // If this message is a reply, highlight the original message
          if (message.reply_to_id) {
            setHighlightedMessageId(message.reply_to_id)
            setTimeout(() => {
              setHighlightedMessageId(null)
            }, 3000) // Highlight for 3 seconds to ensure visibility
          }
        }
      })

      return () => {
        socket.off('new_message')
      }
    }
  }, [userId, socket])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (replyTo) {
      inputRef.current?.focus()
    }
  }, [replyTo])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const markAsRead = async () => {
      if (!userId) return
      try {
        await api.post(`/messages/conversations/${userId}/mark-read`)
      } catch (error) {
        // ignore
      }
    }
    markAsRead()
  }, [userId])

  const fetchMessages = async () => {
    if (!userId) return
    try {
      const response = await api.get(`/messages/conversations/${userId}`)
      setMessages(response.data)
    } catch (error) {
      toast.error('Failed to fetch messages')
    }
  }

  const fetchOtherUser = async () => {
    if (!userId) return
    try {
      const response = await api.get(`/users/${userId}`)
      setOtherUser(response.data)
    } catch (error) {
      toast.error('Failed to fetch user')
    }
  }

  const [showMessageSent, setShowMessageSent] = useState(false)

  const triggerMessageSentAnimation = () => {
    setShowMessageSent(true)
    setTimeout(() => setShowMessageSent(false), 1500)
  }

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }



  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId) return

    try {
      const messageData = {
        receiver_id: parseInt(userId),
        content: newMessage,
        reply_to_id: replyTo?.id || null,
        message_type: 'text'
      }
      const response = await api.post('/messages', messageData)
      setMessages(prev => [...prev, response.data])
      setNewMessage('')
      setReplyTo(null)
      toast.success('Message sent!')
      triggerMessageSentAnimation()
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const handleMessageLongClick = (message) => {
    setReplyTo(message)
  }

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`)
      setMessages(prev => prev.filter(m => m.id !== messageId))
      toast.success('Message deleted')
    } catch (error) {
      toast.error('Failed to delete message')
    }
  }

  const handleDeleteAllMessages = async () => {
    if (!confirm('Are you sure you want to delete all messages in this chat? This action cannot be undone.') || !userId) return

    try {
      await api.delete(`/messages/conversations/${userId}`)
      setMessages([])
      toast.success('All messages deleted')
    } catch (error) {
      toast.error('Failed to delete all messages')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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

  return (
    <>
      {showMessageSent && <MessageSentOverlay />}
      <div className="flex flex-col bg-gray-50 max-w-4xl mx-auto shadow-lg" style={{ height: 'calc(100vh - 80px)', marginTop: '80px' }}>
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center">
        <Link to="/messages" className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        {otherUser?.profile_photo && otherUser.profile_photo !== 'undefined' ? (
          <img
            src={`/uploads/${otherUser.profile_photo}?t=${profileCacheKey}`}
            alt={otherUser.full_name}
            className="h-8 w-8 rounded-full object-cover flex-shrink-0 mr-3"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0 mr-3">
            <span className="text-sm text-white font-semibold">
              {(otherUser?.full_name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <h1 className="text-lg font-semibold flex-1">{otherUser?.full_name || 'Loading...'}</h1>
        <button
          onClick={handleDeleteAllMessages}
          className="ml-2 p-1 rounded-full hover:bg-gray-100"
          title="Delete all messages"
        >
          <Trash2 className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.map(message => {
          const isOwnMessage = message.sender_id === user.id
          const repliedMessage = messages.find(m => m.id === message.reply_to_id)
          const senderName = isOwnMessage ? 'You' : otherUser?.full_name || 'User'
          const senderPhoto = isOwnMessage ? user.profile_photo : otherUser?.profile_photo

          return (
            <div key={message.id} className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              {/* Profile Picture - Left side for other messages */}
              {!isOwnMessage && (
                <>
                  {senderPhoto && senderPhoto !== 'undefined' ? (
                    <img
                      src={`/uploads/${senderPhoto}?t=${profileCacheKey}`}
                      alt={senderName}
                      className="h-8 w-8 rounded-full object-cover flex-shrink-0 mr-2"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0 mr-2">
                      <span className="text-xs text-white font-semibold">
                        {senderName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </>
              )}

              <div className="max-w-sm lg:max-w-lg">
                {/* Replied Message */}
                {repliedMessage && (
                  <div className={`mb-1 p-2 rounded-lg ${isOwnMessage ? 'bg-primary-500' : 'bg-gray-300'}`}>
                    <p className={`text-xs font-semibold ${isOwnMessage ? 'text-primary-100' : 'text-gray-700'}`}>
                      {repliedMessage.sender_id === user.id ? 'You' : otherUser?.full_name || 'User'}
                    </p>
                    <p className={`italic truncate ${isOwnMessage ? 'text-primary-50' : 'text-gray-500'}`}>
                      {repliedMessage.content}
                    </p>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`px-4 py-2 rounded-lg cursor-pointer hover:opacity-90 transition relative group ${
                    isOwnMessage
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  } ${
                    message.id === highlightedMessageId
                      ? 'ring-2 ring-blue-400 ring-offset-2 animate-pulse'
                      : ''
                  }`}
                  onClick={() => handleMessageLongClick(message)}
                >
                  {/* Reply Button */}
                  <button
                    className={`absolute ${repliedMessage ? '-top-8' : '-top-1'} ${isOwnMessage ? '-left-6' : '-right-6'} opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full ${
                      isOwnMessage ? 'bg-primary-100 text-primary-600' : 'bg-gray-300 text-gray-600'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMessageLongClick(message)
                    }}
                    title="Reply to this message"
                  >
                    <Reply className="h-3 w-3" />
                  </button>

                  {/* Delete Button */}
                  <button
                    className={`absolute ${repliedMessage ? '-top-8' : '-top-1'} ${isOwnMessage ? '-left-12' : '-right-12'} opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full ${
                      isOwnMessage ? 'bg-red-100 text-red-600' : 'bg-red-300 text-red-600'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteMessage(message.id)
                    }}
                    title="Delete this message"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>

                  <p className="break-words">{message.content}</p>

                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-xs ${isOwnMessage ? 'text-primary-100' : 'text-gray-500'}`}>
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Picture - Right side for own messages */}
              {isOwnMessage && (
                <>
                  {senderPhoto && senderPhoto !== 'undefined' ? (
                    <img
                      src={`/uploads/${senderPhoto}?t=${profileCacheKey}`}
                      alt={senderName}
                      className="h-8 w-8 rounded-full object-cover flex-shrink-0 ml-2"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 ml-2">
                      <span className="text-xs text-white font-semibold">
                        {senderName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyTo && (
        <div className="bg-gray-100 p-2 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700">
              Replying to {replyTo.sender_id === user.id ? 'yourself' : otherUser?.full_name || 'User'}
            </p>
            <p className="text-sm text-gray-500 truncate">{replyTo.content}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="ml-2">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      )}

      {/* Input */}
      <div className="bg-white p-4 border-t">
        <div className="flex items-center gap-2">
          <div className="relative" ref={emojiPickerRef}>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              title="Add emoji"
            >
              <Smile className="h-5 w-5 text-gray-600" />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 bg-white border rounded-lg shadow-lg p-2 z-10 grid grid-cols-4 gap-1">
                {commonEmojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleEmojiClick(emoji)}
                    className="p-1 hover:bg-gray-100 rounded text-lg transition"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
    </>
  )
}

export default Chat
