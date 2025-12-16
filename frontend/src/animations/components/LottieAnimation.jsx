import React, { useEffect, useRef } from 'react'
import Lottie from 'lottie-react'

const LottieAnimation = ({ 
  animationData, 
  width = 300, 
  height = 300, 
  loop = true, 
  autoplay = true,
  className = '',
  onComplete = null 
}) => {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current && animationData) {
      // Add entrance animation
      containerRef.current.style.opacity = '0'
      containerRef.current.style.transform = 'scale(0.8)'
      
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'
          containerRef.current.style.opacity = '1'
          containerRef.current.style.transform = 'scale(1)'
        }
      }, 100)
    }
  }, [animationData])

  if (!animationData) {
    return (
      <div 
        ref={containerRef}
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{ width, height }}
    >
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        onComplete={onComplete}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

export default LottieAnimation
