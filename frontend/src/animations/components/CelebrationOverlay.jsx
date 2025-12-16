import { motion, AnimatePresence } from 'framer-motion'
import LottieAnimation from './LottieAnimation'

const CelebrationOverlay = ({ show, animationData }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 pointer-events-none"
        >
          <LottieAnimation animationData={animationData} style={{ width: 400, height: 400 }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CelebrationOverlay