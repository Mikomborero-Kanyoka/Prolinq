import { useState } from 'react'
import api from '../services/api'
import { ExternalLink, Eye, MousePointer, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const PictureAdCard = ({ ad, onAdClick }) => {
  const { user } = useAuth()
  const [isHovering, setIsHovering] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Only show analytics to admin users
  const isAdmin = user?.is_admin

  // Check if this is a picture ad
  const isPictureAd = ad.is_picture_only === true || ad.picture_filename || ad.item_type === 'Picture Ad'
  
  if (!isPictureAd) {
    console.log('PictureAdCard: Skipping ad - not a picture ad:', {
      id: ad.id,
      name: ad.name,
      item_type: ad.item_type,
      is_picture_only: ad.is_picture_only,
      picture_filename: ad.picture_filename
    })
    return null // Don't render if not a picture ad
  }
  
  console.log('PictureAdCard: Rendering picture ad:', {
    id: ad.id,
    name: ad.name,
    item_type: ad.item_type,
    is_picture_only: ad.is_picture_only,
    picture_filename: ad.picture_filename
  })

  const imageUrl = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://prolinq-production.up.railway.app'}/uploads/${ad.picture_filename}`

  const handleAdClick = async () => {
    try {
      // Track the click
      await api.post(`/advertisements/${ad.id}/click`)

      // Open the URL in a new tab
      window.open(ad.cta_url, '_blank', 'noopener,noreferrer')

      if (onAdClick) {
        onAdClick(ad)
      }
    } catch (error) {
      console.error('Error tracking ad click:', error)
      // Still open the link even if tracking fails
      window.open(ad.cta_url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleView = async () => {
    try {
      await api.post(`/advertisements/${ad.id}/view`)
    } catch (error) {
      console.error('Error tracking ad view:', error)
    }
  }

  return (
    <div
      className={`
        relative group cursor-pointer opacity-85
        bg-white/5 backdrop-blur-sm
        border border-gray-200/50
        rounded-xl shadow-md
        overflow-hidden
        transition-all duration-300 ease-out
        hover:opacity-90 hover:shadow-lg
        hover:border-gray-300/50
        w-full
        ${isHovering ? 'translate-y-[-2px]' : 'translate-y-0'}
      `}
      style={{ height: '440px' }}
      onMouseEnter={() => {
        setIsHovering(true)
        handleView()
      }}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Simplified background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-gray-100/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Smaller, less prominent Sponsored Badge */}
      <div className="absolute top-3 left-3 z-20">
        <div className="relative">
          <div className="relative bg-gray-600 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Sparkles size={10} />
            <span>SPONSORED</span>
          </div>
        </div>
      </div>

      {/* Image Container - 60% of card height */}
      <div 
        className="relative w-full overflow-hidden"
        style={{ height: '264px' }} // 60% of 440px
      >
        {/* Gradient overlay that appears on hover */}
        <div className={`
          absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent
          transition-opacity duration-500 z-10
          ${isHovering ? 'opacity-100' : 'opacity-0'}
        `} />
        
        {/* Image */}
        <img
          src={imageUrl}
          alt={ad.cta_text}
          className={`
            w-full h-full object-cover
            transition-all duration-700 ease-out
            ${isHovering ? 'scale-110' : 'scale-100'}
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x264?text=Ad+Image'
          }}
        />

        {/* Hover overlay with view indicator */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300 z-10
            ${isHovering ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
        >
          <div className="bg-white/20 backdrop-blur-md rounded-full p-3 transform transition-transform duration-300">
            <ExternalLink size={24} className="text-white" />
          </div>
        </div>
      </div>

      {/* Content Section - 40% of card height */}
      <div 
        className="relative z-10 p-6 flex flex-col justify-between h-full"
        style={{ height: '176px' }} // 40% of 440px
      >
        {/* Simplified CTA Button */}
        <button
          onClick={handleAdClick}
          className={`
            relative overflow-hidden
            px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-200 ease-out
            shadow hover:shadow-md
            transform hover:scale-102 active:scale-95
            bg-gray-600 hover:bg-gray-700 text-white
          `}
        >
          <span className="flex items-center justify-center gap-1.5">
            {ad.cta_text || 'Learn More'}
            <ExternalLink size={12} />
          </span>
        </button>

        {/* Analytics Info (only for admin users) */}
        {isAdmin && (ad.views !== undefined || ad.clicks !== undefined) && (
          <div className="flex justify-around text-xs text-gray-600/80 backdrop-blur-sm">
            {ad.views !== undefined && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                <Eye size={12} className="text-blue-500" />
                <span className="font-medium">{ad.views.toLocaleString()}</span>
              </div>
            )}
            {ad.clicks !== undefined && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                <MousePointer size={12} className="text-purple-500" />
                <span className="font-medium">{ad.clicks.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating animation keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

export default PictureAdCard
