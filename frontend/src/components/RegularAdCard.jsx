import { useState } from 'react'
import { ExternalLink, Eye, MousePointer, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const RegularAdCard = ({ ad, onAdClick }) => {
  const { user } = useAuth()
  const [isHovering, setIsHovering] = useState(false)

  // Only show analytics to admin users
  const isAdmin = user?.is_admin

  console.log('RegularAdCard: Rendering regular ad:', {
    id: ad.id,
    name: ad.name,
    item_type: ad.item_type,
    is_picture_only: ad.is_picture_only,
    picture_filename: ad.picture_filename
  })

  const handleAdClick = async () => {
    try {
      // Track the click using the advertisement service
      if (onAdClick) {
        onAdClick(ad)
      }

      // Handle CTA action
      if (ad.cta_url && ad.cta_url.trim() !== '') {
        window.open(ad.cta_url, '_blank', 'noopener,noreferrer')
      } else if (ad.cta_text && ad.cta_text.toLowerCase().includes('contact')) {
        window.location.href = `/messages?ad=${ad.id}`
      } else if (ad.cta_text && ad.cta_text.toLowerCase().includes('apply')) {
        window.location.href = `/jobs/post?ref=${ad.id}`
      } else if (ad.cta_text && ad.cta_text.toLowerCase().includes('learn')) {
        window.location.href = `/advertisement-details/${ad.id}`
      } else {
        // Default fallback
        window.open('#', '_blank')
      }
    } catch (error) {
      console.error('Error handling ad click:', error)
      // Still try to open the link even if tracking fails
      window.open(ad.cta_url || '#', '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      className={`
        relative group cursor-pointer
        bg-gradient-to-br from-gray-50 to-gray-100/50
        border border-gray-200
        rounded-xl shadow-md
        overflow-hidden
        transition-all duration-300 ease-out
        hover:shadow-lg
        hover:border-gray-300
        w-full
        ${isHovering ? 'translate-y-[-1px]' : 'translate-y-0'}
      `}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleAdClick}
    >
      {/* Sponsored Badge */}
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-gray-600/80 text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
          <Sparkles size={8} />
          <span>Sponsored</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Ad Title */}
        <h3 className="text-base font-semibold text-gray-700 mb-2 pr-12">
          {ad.name || 'Advertisement'}
        </h3>

        {/* Ad Description */}
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {ad.description || ad.cta_text || 'Check out this opportunity!'}
        </p>

        {/* Additional Info */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {ad.category && (
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {ad.category}
            </span>
          )}
          {ad.company_name && (
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {ad.company_name}
            </span>
          )}
          {ad.price && (
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {ad.price}
            </span>
          )}
        </div>

        {/* CTA Button */}
        <button
          className={`
            w-full px-3 py-2 rounded-lg font-medium text-sm
            transition-all duration-300 ease-out
            shadow-sm hover:shadow-md
            transform hover:scale-[1.02] active:scale-95
            bg-gray-600 text-white hover:bg-gray-700
          `}
        >
          <span className="flex items-center justify-center gap-1.5">
            {ad.cta_text || 'Learn More'}
            <ExternalLink size={12} />
          </span>
        </button>

        {/* Analytics Info (only for admin users) */}
        {isAdmin && (ad.views !== undefined || ad.clicks !== undefined) && (
          <div className="flex justify-around text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
            {ad.views !== undefined && (
              <div className="flex items-center gap-1">
                <Eye size={12} className="text-blue-500" />
                <span>{ad.views.toLocaleString()}</span>
              </div>
            )}
            {ad.clicks !== undefined && (
              <div className="flex items-center gap-1">
                <MousePointer size={12} className="text-purple-500" />
                <span>{ad.clicks.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default RegularAdCard
