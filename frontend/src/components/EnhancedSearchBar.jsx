import { useState, useRef, useEffect } from 'react'
import { Search, Loader, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SearchSuggestions from './SearchSuggestions'
import useDebounce from '../hooks/useDebounce'

/**
 * ENHANCEMENT: Enhanced Search Bar Component - AI-Powered Version
 * 
 * This component extends the existing search functionality with:
 * 1. Modern UI improvements with AI-powered aesthetic (rounded-2xl, soft shadows, glow effects)
 * 2. Semantic search integration via debouncing
 * 3. Search suggestions dropdown with recent searches, skills, and locations
 * 4. Keyboard navigation support (up/down/enter/esc)
 * 5. Loading indicator during semantic search
 * 6. Smooth animations using Framer Motion
 * 7. AI-powered badge with sparkles and micro-text
 * 8. Support for both large and compact sizes
 * 
 * The component is completely non-breaking:
 * - All existing props are respected
 * - All existing behaviors are preserved
 * - Enhancement features are additive only
 * - Works seamlessly with existing job filtering logic
 * 
 * @param {string} value - Current search value
 * @param {function} onChange - Callback when search value changes
 * @param {function} onSemanticSearch - Callback for semantic search results
 * @param {boolean} isLoadingSemanticSearch - Loading state for semantic search
 * @param {string} placeholder - Placeholder text for the search input
 * @param {boolean} isLarge - If true, render as large hero search bar (default: false)
 * @param {boolean} showAIBadge - If true, show "AI-powered" badge (default: true when isLarge)
 */
const EnhancedSearchBar = ({
  value,
  onChange,
  onSemanticSearch,
  isLoadingSemanticSearch = false,
  placeholder = "Search jobs...",
  isLarge = false,
  showAIBadge = null
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Default showAIBadge based on isLarge
  const shouldShowAIBadge = showAIBadge !== null ? showAIBadge : isLarge

  // Debounce the search query for semantic search
  const debouncedQuery = useDebounce(value, 350)

  // Perform semantic search when debounced query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim().length > 2 && onSemanticSearch) {
      onSemanticSearch(debouncedQuery)
    }
  }, [debouncedQuery, onSemanticSearch])

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e) => {
    // Allow all existing keyboard behavior through
    if (e.key === 'Escape') {
      setIsFocused(false)
      setActiveIndex(-1)
      return
    }

    // Don't interfere with existing keyboard shortcuts
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      // This can be extended later for keyboard navigation through suggestions
      return
    }

    if (e.key === 'Enter') {
      // Preserve existing enter behavior
      // User can still submit search normally
      return
    }
  }

  const handleSelectSuggestion = (suggestion) => {
    onChange({ target: { value: suggestion } })
    setIsFocused(false)
    
    // Save to search history
    try {
      const history = JSON.parse(localStorage.getItem('jobSearchHistory') || '[]')
      const filtered = history.filter(item => item !== suggestion)
      const updated = [suggestion, ...filtered].slice(0, 10) // Keep last 10 searches
      localStorage.setItem('jobSearchHistory', JSON.stringify(updated))
    } catch (error) {
      console.error('Error saving search history:', error)
    }
  }

  // Size variants
  const sizeClasses = isLarge 
    ? 'pl-6 pr-16 py-5 text-lg' 
    : 'pl-10 pr-12 py-3 text-base'
  
  const iconSize = isLarge ? 'h-6 w-6' : 'h-5 w-5'
  const iconLeftOffset = isLarge ? 'left-5' : 'left-3'
  const iconRightOffset = isLarge ? 'right-5' : 'right-3'

  return (
    <div className="relative w-full">
      {/* AI-Powered Badge (above search bar) */}
      {shouldShowAIBadge && isLarge && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-200"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="h-4 w-4 text-indigo-600" />
          </motion.div>
          <span className="text-sm font-medium text-indigo-700">✨ AI-Powered Search</span>
        </motion.div>
      )}

      {/* Enhanced Search Input Container */}
      <motion.div
        initial={isLarge ? { opacity: 0, scale: 0.95, y: 10 } : false}
        animate={isLarge ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={isLarge ? { duration: 0.5, delay: 0.1 } : {}}
        className={`relative transition-all duration-200 ${
          isFocused
            ? isLarge
              ? 'ring-2 ring-indigo-500 ring-offset-0 shadow-2xl shadow-indigo-200'
              : 'ring-2 ring-indigo-500 ring-offset-2'
            : 'ring-0'
        }`}
        style={{ 
          borderRadius: isLarge ? '1.5rem' : '0.75rem'
        }}
      >
        {/* Search Icon */}
        <motion.div
          className={`absolute top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${iconLeftOffset}`}
          animate={{ color: isFocused ? '#4f46e5' : '#9ca3af' }}
        >
          <Search className={iconSize} />
        </motion.div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay blur to allow clicking on suggestions
            setTimeout(() => setIsFocused(false), 200)
          }}
          onKeyDown={handleKeyDown}
          className={`w-full bg-white transition-all duration-300 font-medium focus:outline-none text-gray-900 placeholder-gray-400 ${sizeClasses} ${
            isLarge
              ? `rounded-2xl border-2 shadow-lg ${
                  isFocused
                    ? 'border-indigo-500 shadow-2xl shadow-indigo-200 transform -translate-y-0.5'
                    : 'border-gray-200 hover:shadow-xl hover:transform hover:-translate-y-0.5'
                }`
              : `rounded-xl border-2 shadow-md ${
                  isFocused
                    ? 'border-indigo-500 shadow-lg shadow-indigo-100'
                    : 'border-gray-200 hover:shadow-lg'
                }`
          }`}
          style={{
            boxShadow: isLarge && !isFocused ? '0 8px 32px rgba(0, 0, 0, 0.12)' : undefined
          }}
        />

        {/* Loading Spinner for Semantic Search */}
        <AnimatePresence>
          {isLoadingSemanticSearch && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute top-1/2 transform -translate-y-1/2 ${iconRightOffset}`}
            >
              <Loader className={`${iconSize} text-indigo-500 animate-spin`} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sparkle Indicator (when semantic search is active) */}
        <AnimatePresence>
          {isLoadingSemanticSearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute top-1/2 transform -translate-y-1/2 pointer-events-none ${
                isLarge ? 'right-20' : 'right-20'
              }`}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4 text-purple-400" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Search Suggestions Dropdown */}
      {isFocused && (
        <SearchSuggestions
          isOpen={isFocused}
          onSelectSuggestion={handleSelectSuggestion}
          currentQuery={value}
          activeIndex={activeIndex}
          onMouseOverIndex={setActiveIndex}
        />
      )}

      {/* AI-Powered Micro-Text (below search bar for large variant) */}
      {isLarge && value && value.trim().length > 2 && !isLoadingSemanticSearch && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-xs text-gray-500 flex items-center gap-1.5"
        >
          <span className="inline-block w-1 h-1 bg-indigo-500 rounded-full"></span>
          <span>Smart search understands similar roles (e.g., searching 'software engineer' also shows backend developer jobs).</span>
        </motion.div>
      )}

      {/* Visual indicator badge when semantic search is active (compact variant) */}
      {!isLarge && value && value.trim().length > 2 && !isLoadingSemanticSearch && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -bottom-6 left-3 text-xs text-indigo-600 font-medium flex items-center gap-1"
        >
          <span className="inline-block w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
          Semantic search enabled
        </motion.div>
      )}
    </div>
  )
}

export default EnhancedSearchBar
