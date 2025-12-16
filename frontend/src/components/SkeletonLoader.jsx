import React from 'react'

const SkeletonLoader = ({ 
  type = 'card', 
  count = 1, 
  className = '' 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
              <div className="flex space-x-2 mt-4">
                <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
              </div>
            </div>
          </div>
        )
      
      case 'text':
        return (
          <div className={`space-y-2 ${className}`}>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        )
      
      case 'avatar':
        return (
          <div className={`w-16 h-16 bg-gray-200 rounded-full animate-pulse ${className}`}></div>
        )
      
      case 'button':
        return (
          <div className={`h-10 bg-gray-200 rounded animate-pulse ${className}`}></div>
        )
      
      case 'input':
        return (
          <div className={`h-12 bg-gray-200 rounded animate-pulse ${className}`}></div>
        )
      
      case 'job':
        return (
          <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="flex justify-between items-center mb-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className={`h-8 bg-gray-200 rounded animate-pulse ${className}`}></div>
        )
    }
  }

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div key={index} className="mb-4">
          {renderSkeleton()}
        </div>
      ))}
    </>
  )
}

export default SkeletonLoader
