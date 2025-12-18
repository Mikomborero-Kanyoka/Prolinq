import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth()

  // Handle redirect when user becomes null (logout scenario)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && user === null) {
      // Don't redirect here - let AuthContext handle the logout redirect
      // This prevents conflicting redirects
    }
  }, [isAuthenticated, user, isLoading])

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
