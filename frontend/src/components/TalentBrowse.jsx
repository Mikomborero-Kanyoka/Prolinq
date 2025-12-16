import { useState, useEffect } from 'react'
import { Users, RefreshCw, Filter, X, Search, ChevronDown } from 'lucide-react'
import TalentCard from './TalentCard'
import SkeletonLoader from './SkeletonLoader'
import { useStagger } from '../animations/hooks'
import { animateButton } from '../animations/utils/animationUtils'
import { usersAPI } from '../services/api'
import './TalentBrowse.css'

const TalentBrowse = ({ showOnlyFreelancers = false }) => {
  const [talents, setTalents] = useState([])
  const [filteredTalents, setFilteredTalents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRole, setSelectedRole] = useState(showOnlyFreelancers ? 'freelancer' : 'all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTalents, setTotalTalents] = useState(0)
  
  // Filter states
  const [filters, setFilters] = useState({
    minRating: 0,
    availability: 'all',
  })

  const itemsPerPage = 12
  const { containerRef, getItemRef } = useStagger(loading ? itemsPerPage : filteredTalents.length, 50)

  const fetchTalents = async (role = null) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await usersAPI.browseFreelancers(0, 100, role)
      setTalents(response.data || [])
      setTotalTalents(response.data?.length || 0)
      setCurrentPage(1)
      setSearchQuery('')
    } catch (err) {
      console.error('Error fetching talents:', err)
      setError('Failed to load talents. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTalents(selectedRole)
  }, [selectedRole])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...talents]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(talent => 
        (talent.full_name?.toLowerCase().includes(query)) ||
        (talent.professional_title?.toLowerCase().includes(query)) ||
        (talent.location?.toLowerCase().includes(query)) ||
        (talent.skills && 
          (typeof talent.skills === 'string' ? JSON.parse(talent.skills) : talent.skills).some(
            skill => (skill.skill_name || skill).toLowerCase().includes(query)
          )
        )
      )
    }

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(talent => {
        const rating = talent.average_rating || 0
        return rating >= filters.minRating
      })
    }

    // Availability filter
    if (filters.availability !== 'all') {
      filtered = filtered.filter(talent => {
        const availability = talent.availability || 'available'
        return availability === filters.availability
      })
    }

    // Apply sorting
    switch (sortBy) {
      case 'highest-rated':
        filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
        break
      case 'lowest-rate':
        filtered.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0))
        break
      case 'highest-rate':
        filtered.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0))
        break
      case 'most-reviews':
        filtered.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0))
        break
      default: // relevance
        break
    }

    setFilteredTalents(filtered)
    setCurrentPage(1)
  }, [searchQuery, filters, sortBy, talents])

  const handleRefresh = () => {
    const refreshBtn = document.querySelector('[data-refresh-button]')
    if (refreshBtn) {
      animateButton(refreshBtn)
    }
    fetchTalents(selectedRole)
    setShowFilterPanel(false)
    setSearchQuery('')
    setFilters({ minRating: 0, availability: 'all' })
    setSortBy('relevance')
  }

  const handleRoleFilter = (role) => {
    setSelectedRole(role)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setFilters({ minRating: 0, availability: 'all' })
    setSortBy('relevance')
    setShowFilterPanel(false)
  }

  const activeFilterCount = 
    (searchQuery ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.availability !== 'all' ? 1 : 0) +
    (sortBy !== 'relevance' ? 1 : 0)

  // Pagination
  const paginatedTalents = filteredTalents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(filteredTalents.length / itemsPerPage)

  if (error) {
    return (
      <div className="error-state px-4 sm:px-6">
        <div className="error-state-icon">
          <X className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Unable to load talents</h3>
        <p className="text-gray-600 mb-4 sm:mb-6 text-base sm:text-lg">{error}</p>
        <button
          onClick={handleRefresh}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 sm:hover:-translate-y-1 font-semibold text-sm sm:text-base"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Enhanced Search Bar */}
      <div className="relative group">
        <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors">
          <Search className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <input
          type="text"
          placeholder="Search by name, skills, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-white/90 backdrop-blur-sm border border-gray-200 sm:border-2 rounded-xl sm:rounded-2xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-500 text-sm sm:text-base shadow-sm hover:shadow-md focus:shadow-lg"
        />
      </div>

      {/* Enhanced Controls Bar */}
      <div className="flex flex-col xs:flex-row gap-4 sm:gap-6 items-start xs:items-center justify-between bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full xs:w-auto">
          {/* Enhanced Role Filter Tabs */}
          {!showOnlyFreelancers && (
            <div className="flex gap-1.5 sm:gap-3 p-1 bg-gray-50 rounded-lg sm:rounded-xl w-full xs:w-auto overflow-x-auto">
              <button
                onClick={() => handleRoleFilter('all')}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  selectedRole === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                All Talent
              </button>
              <button
                onClick={() => handleRoleFilter('freelancer')}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  selectedRole === 'freelancer'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                Freelancers
              </button>
              <button
                onClick={() => handleRoleFilter('job_seeker')}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  selectedRole === 'job_seeker'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                Job Seekers
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full xs:w-auto justify-end mt-3 xs:mt-0">
          {/* Enhanced Filter Button */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`relative inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 border ${
              showFilterPanel
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30'
            }`}
            title="Open filters"
          >
            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center shadow-lg">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Enhanced Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className={`inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 border bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30 ${
                showSortDropdown ? 'border-blue-500 shadow-md bg-blue-50/50' : ''
              }`}
            >
              <span className="hidden xs:inline">Sort</span>
              <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showSortDropdown && (
              <div className="absolute right-0 mt-2 sm:mt-3 w-48 sm:w-56 bg-white/95 backdrop-blur-sm border border-gray-200 sm:border-2 rounded-lg sm:rounded-xl shadow-xl z-20 overflow-hidden">
                <div className="p-1 sm:p-2">
                  {[
                    { value: 'relevance', label: 'Relevance', icon: '🎯' },
                    { value: 'highest-rated', label: 'Highest Rated', icon: '⭐' },
                    { value: 'lowest-rate', label: 'Lowest Rate', icon: '💰' },
                    { value: 'highest-rate', label: 'Highest Rate', icon: '💎' },
                    { value: 'most-reviews', label: 'Most Reviews', icon: '📝' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value)
                        setShowSortDropdown(false)
                      }}
                      className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-lg transition-all duration-200 flex items-center gap-2 sm:gap-3 ${
                        sortBy === option.value
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-semibold border-l-2 sm:border-l-4 border-blue-500'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-base sm:text-lg">{option.icon}</span>
                      <span className="truncate">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Refresh Button */}
          <button
            onClick={handleRefresh}
            data-refresh-button
            className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 border bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:shadow-md hover:bg-green-50/30 group"
            title="Refresh talent list"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 space-y-4 sm:space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilterPanel(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-6">
            {/* Minimum Rating */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">Minimum Rating</label>
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                {[0, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFilters({ ...filters, minRating: rating })}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      filters.minRating === rating
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {rating === 0 ? 'Any' : `${rating}+ ⭐`}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-1 sm:focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available Now</option>
                <option value="busy">Busy</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex gap-2">
            <button
              onClick={handleClearFilters}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Results Info */}
      <div className="flex justify-between items-center px-2 sm:px-0">
        <div className="text-xs sm:text-sm text-gray-600">
          Showing {paginatedTalents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredTalents.length)} of {filteredTalents.length} {selectedRole === 'all' ? 'talents' : selectedRole === 'freelancer' ? 'freelancers' : 'job seekers'}
        </div>
      </div>

      {/* Talent Grid */}
      {loading ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(itemsPerPage)].map((_, index) => (
            <SkeletonLoader key={index} type="card" />
          ))}
        </div>
      ) : paginatedTalents.length > 0 ? (
        <>
          <div ref={containerRef} className="talent-grid">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedTalents.map((talent, index) => (
                <div key={talent.id} ref={getItemRef(index)}>
                  <TalentCard user={talent} />
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container px-2 sm:px-0">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="pagination-button pagination-nav text-sm sm:text-base"
              >
                Previous
              </button>
              
              <div className="pagination-numbers hidden xs:flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`pagination-number ${currentPage === page ? 'active' : ''} text-sm sm:text-base`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Mobile pagination - Show only current page */}
              <div className="pagination-numbers flex xs:hidden gap-1">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="pagination-button pagination-nav text-sm sm:text-base"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state px-4 sm:px-6 py-8 sm:py-12">
          <div className="empty-state-icon mb-3 sm:mb-4">
            <Users className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">No talents found</h3>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-lg">
            {searchQuery ? 'Try adjusting your search or filters' : 'Try adjusting your filters'}
          </p>
          <button
            onClick={handleClearFilters}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 sm:hover:-translate-y-1 font-semibold text-sm sm:text-base"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default TalentBrowse