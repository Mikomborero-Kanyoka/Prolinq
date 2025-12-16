import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const navigate = useNavigate()

  // Redirect to landing page when user logs out from a protected page
  useEffect(() => {
    if (!isLoading && !isAuthenticated && user === null) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, user, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute











