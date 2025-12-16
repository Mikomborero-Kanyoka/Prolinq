import React, { useRef } from 'react'
import { motion } from 'framer-motion'

const AnimatedCard = ({ 
  children, 
  className = '', 
  tiltEnabled = true,
  hoverScale = 1.03,
  animationDelay = 0 
}) => {
  const cardRef = useRef(null)

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: animationDelay
      }
    }
  }

  return (
    <motion.div
      ref={cardRef}
      className={className}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        scale: hoverScale,
        y: -5,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedCard
