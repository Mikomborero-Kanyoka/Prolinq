import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const FloatingElement = ({ 
  children, 
  duration = 3, 
  delay = 0, 
  distance = 10,
  className = '' 
}) => {
  const elementRef = useRef(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Add floating animation with CSS
    element.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`
  }, [duration, delay])

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-${distance}px);
          }
        }
      `}</style>
      <motion.div
        ref={elementRef}
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay }}
        whileHover={{ scale: 1.05 }}
      >
        {children}
      </motion.div>
    </>
  )
}

export default FloatingElement
