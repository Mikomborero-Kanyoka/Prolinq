import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io('http://localhost:8001', {
        auth: {
          user_id: user.id
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      })

      newSocket.on('connect', () => {
        console.log('✅ [SocketContext] Socket CONNECTED with id:', newSocket.id)
      })

      newSocket.on('connect_error', (error) => {
        console.warn('❌ [SocketContext] Socket connection error:', error)
        // Don't spam errors - Socket.IO will retry automatically
      })

      newSocket.on('disconnect', (reason) => {
        console.log('⚠️ [SocketContext] Socket disconnected:', reason)
      })

      newSocket.on('notification', (notification) => {
        console.log('🔔 [SocketContext] ✅ RECEIVED NOTIFICATION event:', notification)
        // Trigger navbar to refresh notification count
        console.log('🔔 [SocketContext] Dispatching custom event to window...')
        window.dispatchEvent(new CustomEvent('notification', { detail: notification }))
        console.log('🔔 [SocketContext] Custom event dispatched')
      })
      
      newSocket.on('new_message', (message) => {
        console.log('📨 [SocketContext] ✅ RECEIVED NEW_MESSAGE event:', message)
        // Trigger navbar to refresh message count
        console.log('📨 [SocketContext] Dispatching custom event to window...')
        window.dispatchEvent(new CustomEvent('new_message', { detail: message }))
        console.log('📨 [SocketContext] Custom event dispatched')
      })

      // Debug: Log all events received (Socket.IO 4.x uses onAny instead of onAnyIncoming)
      newSocket.onAny((eventName, ...args) => {
        console.log(`📡 [SocketContext] Socket event received: "${eventName}"`, args)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    } else {
      if (socket) {
        socket.close()
        setSocket(null)
      }
    }
  }, [isAuthenticated, user])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}
