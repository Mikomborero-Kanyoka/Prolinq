import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { Tilt } from 'react-tilt'

const AnimatedCard = ({ 
  children, 
  className = '', 
  tiltEnabled = true,
  hoverScale = 1.05,
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
        delay: animationDelay,
        ease: "easeOut"
      }
    }
  }

  const CardContent = (
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

  if (tiltEnabled) {
    return (
      <Tilt
        options={{
          max: 15,
          speed: 300,
          glare: true,
          "max-glare": 0.3,
          scale: 1.02
        }}
        style={{ width: '100%' }}
      >
        {CardContent}
      </Tilt>
    )
  }

  return CardContent
}

export default AnimatedCard
