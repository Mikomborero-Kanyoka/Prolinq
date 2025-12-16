import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, MapPin, Code, Trash2 } from 'lucide-react'

/**
 * ENHANCEMENT: Search Suggestions Dropdown Component
 * 
 * This component displays:
 * - Recently searched items (from localStorage)
 * - Suggested skills related to jobs
 * - Suggested locations for job filtering
 * - Ability to quickly apply suggestions
 * 
 * The component is non-breaking and only renders when the search is focused.
 * All existing job filtering and display logic remains unchanged.
 */
const SearchSuggestions = ({
  isOpen,
  onSelectSuggestion,
  currentQuery,
  activeIndex,
  onMouseOverIndex
}) => {
  const [recentSearches, setRecentSearches] = useState([])
  const [suggestedSkills] = useState([
    'Web Development',
    'React',
    'Python',
    'JavaScript',
    'UI Design',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Project Management',
    'Content Writing'
  ])
  const [suggestedLocations] = useState([
    'Remote',
    'Harare',
    'Bulawayo',
    'Gweru',
    'Mutare',
    'New York',
    'London',
    'Singapore'
  ])

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('jobSearchHistory')
      if (stored) {
        const searches = JSON.parse(stored)
        // Keep only the first 5 most recent searches
        setRecentSearches(searches.slice(0, 5))
      }
    } catch (error) {
      console.error('Error loading search history:', error)
    }
  }, [])

  // Filter suggestions based on current query
  const filteredSkills = suggestedSkills.filter(skill =>
    skill.toLowerCase().includes(currentQuery.toLowerCase())
  )
  
  const filteredLocations = suggestedLocations.filter(loc =>
    loc.toLowerCase().includes(currentQuery.toLowerCase())
  )

  const handleClearHistory = () => {
    localStorage.removeItem('jobSearchHistory')
    setRecentSearches([])
  }

  const handleRemoveRecent = (index) => {
    const updated = recentSearches.filter((_, i) => i !== index)
    setRecentSearches(updated)
    localStorage.setItem('jobSearchHistory', JSON.stringify(updated))
  }

  if (!isOpen) return null

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-96 overflow-y-auto"
      >
        {/* Recent Searches Section */}
        {recentSearches.length > 0 && !currentQuery && (
          <motion.div className="border-b border-gray-100">
            <div className="px-4 pt-3 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">Recent Searches</span>
              </div>
              <button
                onClick={handleClearHistory}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
                title="Clear search history"
              >
                Clear
              </button>
            </div>
            <div className="space-y-1 pb-2">
              {recentSearches.map((search, index) => (
                <motion.button
                  key={`recent-${index}`}
                  variants={itemVariants}
                  onClick={() => onSelectSuggestion(search)}
                  onMouseEnter={() => onMouseOverIndex(index)}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between group ${
                    activeIndex === index
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="truncate">{search}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveRecent(index)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3 text-gray-400" />
                  </button>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Suggested Skills Section */}
        {filteredSkills.length > 0 && (
          <motion.div className="border-b border-gray-100 last:border-b-0">
            <div className="px-4 pt-3 pb-2 flex items-center gap-2">
              <Code className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-semibold text-gray-700">
                {currentQuery ? 'Matching Skills' : 'Popular Skills'}
              </span>
            </div>
            <div className="space-y-1 pb-2">
              {filteredSkills.slice(0, 5).map((skill, index) => (
                <motion.button
                  key={`skill-${skill}`}
                  variants={itemVariants}
                  onClick={() => onSelectSuggestion(skill)}
                  onMouseEnter={() => onMouseOverIndex(recentSearches.length + index)}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    activeIndex === recentSearches.length + index
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="truncate">{skill}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Suggested Locations Section */}
        {filteredLocations.length > 0 && (
          <motion.div>
            <div className="px-4 pt-3 pb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-400" />
              <span className="text-sm font-semibold text-gray-700">
                {currentQuery ? 'Matching Locations' : 'Popular Locations'}
              </span>
            </div>
            <div className="space-y-1 pb-2">
              {filteredLocations.slice(0, 5).map((location, index) => (
                <motion.button
                  key={`location-${location}`}
                  variants={itemVariants}
                  onClick={() => onSelectSuggestion(location)}
                  onMouseEnter={() => onMouseOverIndex(recentSearches.length + filteredSkills.length + index)}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    activeIndex === recentSearches.length + filteredSkills.length + index
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="truncate">{location}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!currentQuery && recentSearches.length === 0 && (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-gray-500">
              Your recent searches will appear here
            </p>
          </div>
        )}

        {currentQuery && filteredSkills.length === 0 && filteredLocations.length === 0 && (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-gray-500">
              No matching suggestions for "{currentQuery}"
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default SearchSuggestions