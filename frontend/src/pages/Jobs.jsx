import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { Search, Filter, MapPin, DollarSign, Clock, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import advertisementService from '../services/advertisementService'
import { useAuth } from '../contexts/AuthContext'
import RecommendedJobsBadge from '../components/RecommendedJobsBadge'
// ENHANCEMENT: Import new components for enhanced search functionality
import EnhancedSearchBar from '../components/EnhancedSearchBar'
import PictureAdCard from '../components/PictureAdCard'
import RegularAdCard from '../components/RegularAdCard'
import { motion } from 'framer-motion'
import JobHeroImage from '../assets/images/JobHero.jpg'

const Jobs = () => {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [advertisements, setAdvertisements] = useState([])
  const [loading, setLoading] = useState(true)
  const [adsLoading, setAdsLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    job_type: '',
    location: '',
    min_budget: '',
    max_budget: ''
  })
  const searchTimeoutRef = useRef(null)

  // ENHANCEMENT: State for semantic search functionality
  const [semanticSearchResults, setSemanticSearchResults] = useState([])
  const [isLoadingSemanticSearch, setIsLoadingSemanticSearch] = useState(false)
  const [showSemanticResults, setShowSemanticResults] = useState(false)
  const [showFilters, setShowFilters] = useState(true)

  useEffect(() => {
    // Initial fetch on component mount
    fetchJobs()
    fetchAdvertisements()
  }, [])

  useEffect(() => {
    // Debounce filter changes (but not initial load)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchJobs()
      fetchAdvertisements()
    }, 300)
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [filters])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      
      const queryString = params.toString()
      console.log('Fetching jobs with filters:', filters, 'Query:', queryString)
      const response = await api.get(`/jobs${queryString ? '?' + queryString : ''}`)
      console.log('Jobs response:', response.data)
      setJobs(response.data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const fetchAdvertisements = async () => {
    try {
      setAdsLoading(true)
      const params = { limit: 10 } // Get more ads to intersperse
      if (filters.category) params.category = filters.category
      
      console.log('=== FETCHING ADS ===')
      console.log('Fetching ads with params:', params) // Debug log
      const ads = await advertisementService.getPublicAdvertisements(params)
      console.log('Raw ads response:', ads) // Debug log
      console.log('Ads type:', typeof ads)
      console.log('Ads isArray:', Array.isArray(ads))
      console.log('Ads length:', ads?.length || 0)
      
      const adsArray = ads || []
      console.log('Processed ads array:', adsArray)
      console.log('Sample ad structure:', adsArray[0])
      
      setAdvertisements(adsArray)
    } catch (error) {
      console.error('Error fetching advertisements:', error)
      console.error('Error details:', error.message, error.stack)
      setAdvertisements([]) // Ensure we set empty array on error
    } finally {
      setAdsLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // ENHANCEMENT: Semantic search function
  // This function calls the backend /search/semantic endpoint with debounced query
  const performSemanticSearch = async (query) => {
    if (!query || query.trim().length < 3) {
      setSemanticSearchResults([])
      setShowSemanticResults(false)
      return
    }

    try {
      setIsLoadingSemanticSearch(true)
      console.log('🔍 Performing semantic search for:', query)

      const response = await api.post('/jobs/search/semantic', {
        query: query.trim(),
        limit: 10,
        min_score: 0.1
      })

      console.log('✅ Semantic search results:', response.data)

      // Extract jobs from results (they come with similarity scores)
      const resultsWithJobs = response.data.map(result => ({
        ...result.job,
        similarity_score: result.similarity_score,
        is_semantic_result: true
      }))

      setSemanticSearchResults(resultsWithJobs)
      setShowSemanticResults(resultsWithJobs.length > 0)
    } catch (error) {
      console.error('Error performing semantic search:', error)
      setSemanticSearchResults([])
      setShowSemanticResults(false)
    } finally {
      setIsLoadingSemanticSearch(false)
    }
  }

  const formatBudget = (min, max, currency) => {
    if (!min && !max) return 'Negotiable'
    if (min && max) return `${currency || '$'} ${min} - ${max}`
    if (min) return `${currency || '$'} ${min}+`
    if (max) return `Up to ${currency || '$'} ${max}`
  }

  // Function to intersperse ads between jobs
  const createMixedContent = () => {
    if (jobs.length === 0) return []
    
    console.log('Creating mixed content with:', { jobsCount: jobs.length, adsCount: advertisements.length }) // Debug log
    
    const mixed = []
    let adIndex = 0
    
    // Calculate optimal spacing to distribute all ads
    const totalAds = advertisements.length
    const totalJobs = jobs.length
    
    if (totalAds === 0) {
      // No ads, just return jobs
      jobs.forEach(job => {
        mixed.push({ type: 'job', data: job, key: `job-${job.id}` })
      })
      return mixed
    }
    
    // Group picture ads in pairs for 2-column layout
    const pictureAds = advertisements.filter(ad => ad.is_picture_only === true || ad.picture_filename || ad.item_type === 'Picture Ad')
    const regularAds = advertisements.filter(ad => ad.is_picture_only !== true && !ad.picture_filename && ad.item_type !== 'Picture Ad')
    
    // Debug: Check if picture ads have picture_filename
    console.log('Picture ads details:', pictureAds.map(ad => ({
      id: ad.id,
      name: ad.name,
      is_picture_only: ad.is_picture_only,
      picture_filename: ad.picture_filename
    })))
    
    // Debug logging
    console.log('=== AD FILTERING DEBUG ===')
    console.log('Total advertisements:', advertisements.length)
    console.log('Picture ads:', pictureAds.length, pictureAds)
    console.log('Regular ads:', regularAds.length, regularAds)
    
    // Calculate positions where ads should be placed
    // We want to distribute ads evenly, ensuring no two ads are adjacent
    const adPositions = new Set()
    
    if (totalJobs === 1 && totalAds > 0) {
      // Special case: only 1 job, place one ad after it
      adPositions.add(1)
    } else if (totalJobs >= 2) {
      // Calculate spacing to distribute all ads
      const spacing = Math.max(2, Math.floor((totalJobs + totalAds) / totalAds))
      
      for (let i = 0; i < totalAds && adIndex < totalAds; i++) {
        let position = (i + 1) * spacing - 1
        
        // Ensure position is within bounds and not adjacent to another ad
        while (position < totalJobs + i && (adPositions.has(position) || adPositions.has(position - 1) || adPositions.has(position + 1))) {
          position++
        }
        
        if (position < totalJobs + totalAds) {
          adPositions.add(position)
        }
      }
    }
    
    console.log('Ad positions calculated:', Array.from(adPositions).sort((a, b) => a - b)) // Debug log
    
    // Build the mixed content
    let currentPosition = 0
    let pictureAdPairIndex = 0
    
    jobs.forEach((job, jobIndex) => {
      mixed.push({ type: 'job', data: job, key: `job-${job.id}` })
      currentPosition++
      
      // Check if we should add an ad after this job
      if (adPositions.has(currentPosition)) {
        // Prioritize picture ad pairs for 2-column layout
        if (pictureAdPairIndex < Math.floor(pictureAds.length / 2)) {
          // Add a pair of picture ads
          const firstAd = pictureAds[pictureAdPairIndex * 2]
          const secondAd = pictureAds[(pictureAdPairIndex * 2) + 1]
          
          mixed.push({ 
            type: 'picture-ad-pair', 
            data: [firstAd, secondAd].filter(Boolean), 
            key: `picture-ad-pair-${pictureAdPairIndex}-${currentPosition}` 
          })
          pictureAdPairIndex++
        } else if (regularAds.length > 0) {
          // Add regular ad
          const regularAdIndex = adIndex - (pictureAdPairIndex * 2)
          if (regularAdIndex < regularAds.length && regularAds[regularAdIndex]) {
            mixed.push({ 
              type: 'ad', 
              data: regularAds[regularAdIndex], 
              key: `ad-${regularAds[regularAdIndex].id}-${currentPosition}` 
            })
          }
        } else if (pictureAdPairIndex * 2 < pictureAds.length) {
          // Add remaining single picture ad
          const remainingAd = pictureAds[pictureAdPairIndex * 2]
          if (remainingAd) {
            mixed.push({ 
              type: 'ad', 
              data: remainingAd, 
              key: `ad-${remainingAd.id}-${currentPosition}` 
            })
          }
        }
        adIndex++
        currentPosition++
      }
    })
    
    // If we still have ads left and space, add them at the end (ensuring no adjacency)
    while (adIndex < advertisements.length) {
      // Only add if the last item isn't an ad
      if (mixed.length === 0 || mixed[mixed.length - 1].type !== 'ad') {
        // Try to add remaining picture ad pairs first
        if (pictureAdPairIndex < Math.floor(pictureAds.length / 2)) {
          const firstAd = pictureAds[pictureAdPairIndex * 2]
          const secondAd = pictureAds[(pictureAdPairIndex * 2) + 1]
          
          mixed.push({ 
            type: 'picture-ad-pair', 
            data: [firstAd, secondAd].filter(Boolean), 
            key: `picture-ad-pair-${pictureAdPairIndex}-end` 
          })
          pictureAdPairIndex++
        } else {
          // Add remaining single ads
          const ad = advertisements[adIndex]
          console.log(`Adding remaining ad at the end, adIndex: ${adIndex}`) // Debug log
          mixed.push({ 
            type: 'ad', 
            data: ad, 
            key: `ad-${ad.id}-end-${adIndex}` 
          })
        }
      }
      adIndex++
    }
    
    console.log('Mixed content created:', mixed.map(item => ({ type: item.type, key: item.key }))) // Debug log
    
    // Debug: Check if items are being rendered
    mixed.forEach((item, index) => {
      console.log(`Rendering item ${index}:`, {
        type: item.type,
        key: item.key,
        hasData: !!item.data,
        dataType: typeof item.data,
        adData: item.data ? {
          id: item.data.id,
          item_type: item.data.item_type,
          is_picture_only: item.data.is_picture_only,
          picture_filename: item.data.picture_filename
        } : null
      })
    })
    
    return mixed
  }

  const handleAdClick = async (ad) => {
    try {
      await advertisementService.trackClick(ad.id)
      
      // Handle CTA action - check for external link first, then fallback to text-based routing
      if (ad.cta_url && ad.cta_url.trim() !== '') {
        // External link provided - open in new tab
        window.open(ad.cta_url, '_blank')
      } else if (ad.cta_text.toLowerCase().includes('contact')) {
        window.location.href = `/messages?ad=${ad.id}`
      } else if (ad.cta_text.toLowerCase().includes('apply')) {
        window.location.href = `/jobs/post?ref=${ad.id}`
      } else if (ad.cta_text.toLowerCase().includes('learn')) {
        window.location.href = `/advertisement-details/${ad.id}`
      } else {
        // Default fallback - open in new tab to avoid leaving jobs page
        window.open('#', '_blank')
      }
    } catch (error) {
      console.error('Error tracking click:', error)
    }
  }

  const handleAdView = async (ad) => {
    try {
      await advertisementService.trackView(ad.id)
    } catch (error) {
      console.error('Error tracking view:', error)
    }
  }

  // Track ad views when they're displayed
  useEffect(() => {
    advertisements.forEach(ad => {
      handleAdView(ad)
    })
  }, [advertisements])

  // Function to format time ago (e.g., "20 min ago", "2 hours ago", "3 days ago")
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec ago`
    } else if (diffInSeconds < 3600) {
      const diffInMinutes = Math.floor(diffInSeconds / 60)
      return `${diffInMinutes} min ago`
    } else if (diffInSeconds < 86400) {
      const diffInHours = Math.floor(diffInSeconds / 3600)
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else {
      const diffInDays = Math.floor(diffInSeconds / 86400)
      if (diffInDays === 0) {
        return 'today'
      } else if (diffInDays < 30) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
      } else {
        const diffInMonths = Math.floor(diffInDays / 30)
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-gray-50" style={{ marginTop: '80px' }}>
      {/* Modern Hero Section with Background Image - Full Width */}
      <div 
        className="relative w-full min-h-[400px] sm:min-h-[500px] md:min-h-[550px] lg:min-h-[600px] bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url(${JobHeroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Content container - Vertically centered with proper padding */}
        <div className="relative z-10 w-full h-full flex flex-col justify-center px-4 xs:px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-12 sm:py-16 md:py-18 lg:py-20">
          {/* Modern Hero Headline */}
          <div className="text-center mb-3 sm:mb-4">
            <h1 className="text-2xl xs:text-3xl sm:text-[36px] md:text-[42px] lg:text-[48px] xl:text-[56px] 2xl:text-[64px] font-bold text-white leading-tight sm:leading-tight md:leading-tight drop-shadow-2xl">
              Find Your Dream Job
            </h1>
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <p className="text-sm xs:text-base sm:text-[17px] md:text-[19px] lg:text-[22px] xl:text-[24px] 2xl:text-[28px] text-white/90 font-light drop-shadow-lg max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto px-2 xs:px-0">
              Discover opportunities that match your skills
            </p>
          </div>

          {/* AI-Powered Search Badge - Single instance */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600" />
              </motion.div>
              <span className="text-xs sm:text-sm font-medium text-gray-800">AI-Powered Search</span>
            </div>
          </div>

          {/* Modern Search Bar with Premium Feel - Centered with max-width */}
          <div className="flex justify-center">
            <div className="w-full px-2 xs:px-4 sm:px-6 md:px-8 lg:px-0 lg:w-10/12 xl:w-8/12 2xl:w-7/12 max-w-[500px] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
              <EnhancedSearchBar
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onSemanticSearch={performSemanticSearch}
                isLoadingSemanticSearch={isLoadingSemanticSearch}
                placeholder="Search for jobs..."
                isLarge={true}
                showAIBadge={false} // Disabled since we have the badge above
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Jobs Badge - Below Hero */}
      <div className="relative z-20 -mt-6 sm:-mt-8">
        <div className="flex justify-center">
          <RecommendedJobsBadge />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-full xs:max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Compact Vibrant Filters */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-5 mb-6 sm:mb-8 border border-blue-500">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 sm:gap-2">
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Filters
            </h3>
            <button 
              onClick={() => {/* Add reset filters function */}}
              className="text-xs sm:text-sm text-blue-100 hover:text-white transition-colors font-medium"
            >
              Reset All
            </button>
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white/95 backdrop-blur-sm border border-blue-300 sm:border-2 rounded-lg text-xs sm:text-sm font-medium text-gray-800 focus:ring-1 sm:focus:ring-2 focus:ring-white focus:border-white transition-all hover:bg-white"
            >
              <option value="">Category</option>
              <option value="Web Development">Web Dev</option>
              <option value="Mobile Development">Mobile</option>
              <option value="Design">Design</option>
              <option value="Writing">Writing</option>
              <option value="Marketing">Marketing</option>
              <option value="Data Science">Data Science</option>
            </select>

            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white/95 backdrop-blur-sm border border-blue-300 sm:border-2 rounded-lg text-xs sm:text-sm font-medium text-gray-800 focus:ring-1 sm:focus:ring-2 focus:ring-white focus:border-white transition-all hover:bg-white"
            >
              <option value="">Location</option>
              <option value="Harare">Harare</option>
              <option value="Bulawayo">Bulawayo</option>
              <option value="Gweru">Gweru</option>
              <option value="Mutare">Mutare</option>
              <option value="Remote">Remote</option>
            </select>

            <select
              value={filters.job_type}
              onChange={(e) => handleFilterChange('job_type', e.target.value)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white/95 backdrop-blur-sm border border-blue-300 sm:border-2 rounded-lg text-xs sm:text-sm font-medium text-gray-800 focus:ring-1 sm:focus:ring-2 focus:ring-white focus:border-white transition-all hover:bg-white"
            >
              <option value="">Job Type</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="gig">Gig</option>
              <option value="freelance">Freelance</option>
            </select>

            <input
              type="number"
              placeholder="Min $"
              value={filters.min_budget}
              onChange={(e) => handleFilterChange('min_budget', e.target.value)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white/95 backdrop-blur-sm border border-blue-300 sm:border-2 rounded-lg text-xs sm:text-sm font-medium text-gray-800 focus:ring-1 sm:focus:ring-2 focus:ring-white focus:border-white transition-all hover:bg-white placeholder:text-gray-500"
            />
            
            <input
              type="number"
              placeholder="Max $"
              value={filters.max_budget}
              onChange={(e) => handleFilterChange('max_budget', e.target.value)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 bg-white/95 backdrop-blur-sm border border-blue-300 sm:border-2 rounded-lg text-xs sm:text-sm font-medium text-gray-800 focus:ring-1 sm:focus:ring-2 focus:ring-white focus:border-white transition-all hover:bg-white placeholder:text-gray-500"
            />

            <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-blue-700 rounded-lg text-xs sm:text-sm font-bold hover:bg-blue-50 transition-all shadow-md hover:shadow-lg">
              Apply
            </button>
          </div>
        </div>

        {/* Jobs and Advertisements Content */}
        <div className="max-w-full xs:max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
          {loading || adsLoading ? (
            <div className="flex justify-center items-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Show semantic search results if available */}
              {showSemanticResults && semanticSearchResults.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                    AI-Powered Search Results
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {semanticSearchResults.map((job) => (
                      <div key={job.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                        <div className="p-4 sm:p-5 md:p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">{job.title}</h3>
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                              {Math.round(job.similarity_score * 100)}% match
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                            {job.category && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {job.category}
                              </span>
                            )}
                            {job.job_type && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                {job.job_type}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                            <span className="text-base sm:text-lg font-bold text-green-600">
                              {formatBudget(job.budget_min, job.budget_max, job.budget_currency)}
                            </span>
                            <Link
                              to={`/jobs/${job.id}`}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regular jobs and ads */}
              {!showSemanticResults && (
                <>
                  {jobs.length === 0 && advertisements.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="text-gray-400 mb-3 sm:mb-4">
                        <Search className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-1.5 sm:mb-2">No jobs or advertisements found</h3>
                      <p className="text-gray-500 text-sm sm:text-base">Try adjusting your filters or search terms</p>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      {createMixedContent().map((item) => {
                        if (item.type === 'job') {
                          const job = item.data
                          return (
                            <div key={item.key} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200">
                              <div className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                                      </h3>
                                      {job.featured && (
                                        <span className="text-xs font-medium px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                                          Featured
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                                      {job.company && (
                                        <span className="font-medium text-gray-700">{job.company}</span>
                                      )}
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>{job.location}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{getTimeAgo(job.created_at)}</span>
                                      </div>
                                    </div>
                                    
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{job.description}</p>
                                    
                                    <div className="flex flex-wrap gap-2 mb-4">
                                      {job.category && (
                                        <span className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md font-medium">
                                          {job.category}
                                        </span>
                                      )}
                                      {job.job_type && (
                                        <span className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-md font-medium">
                                          {job.job_type.replace('_', ' ')}
                                        </span>
                                      )}
                                      {job.experience_level && (
                                        <span className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded-md font-medium">
                                          {job.experience_level}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="sm:text-right">
                                    <div className="inline-block">
                                      <span className="text-lg sm:text-xl font-bold text-gray-900 block">
                                        {formatBudget(job.budget_min, job.budget_max, job.budget_currency)}
                                      </span>
                                      <span className="text-xs text-gray-500 block mt-1">
                                        {job.payment_type === 'hourly' ? 'per hour' : 'fixed price'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                      </svg>
                                      <span>{job.applications_count || 0} applicants</span>
                                    </div>
                                    {job.skills && job.skills.length > 0 && (
                                      <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                                        <span className="text-gray-400">•</span>
                                        <span>{job.skills.slice(0, 2).join(', ')}</span>
                                        {job.skills.length > 2 && (
                                          <span className="text-gray-400">+{job.skills.length - 2} more</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex gap-3">
                                    <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                                      Save
                                    </button>
                                    <Link
                                      to={`/jobs/${job.id}`}
                                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                      Apply Now
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        } else if (item.type === 'ad') {
                          const ad = item.data
                          const isPictureAd = ad.is_picture_only === true || ad.picture_filename || ad.item_type === 'Picture Ad'
                          
                          return (
                            <div key={item.key} className="mt-8 sm:mt-12 md:mt-16 pt-6 sm:pt-8 border-t border-gray-200">
                              <div className="mb-4 sm:mb-6 text-center">
                                <span className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">Sponsored Content</span>
                              </div>
                              <div className="opacity-90 hover:opacity-100 transition-opacity duration-300">
                                {isPictureAd ? (
                                  <PictureAdCard 
                                    ad={ad} 
                                    onAdClick={handleAdClick}
                                  />
                                ) : (
                                  <RegularAdCard 
                                    ad={ad} 
                                    onAdClick={handleAdClick}
                                  />
                                )}
                              </div>
                            </div>
                          )
                        } else if (item.type === 'picture-ad-pair') {
                          const ads = item.data
                          return (
                            <div key={item.key} className="mt-8 sm:mt-12 md:mt-16 pt-6 sm:pt-8 border-t border-gray-200">
                              <div className="mb-4 sm:mb-6 text-center">
                                <span className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">Sponsored Content</span>
                              </div>
                              <div className="opacity-90 hover:opacity-100 transition-opacity duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                  {ads.map((ad, index) => (
                                    <PictureAdCard 
                                      key={`${item.key}-${index}`}
                                      ad={ad} 
                                      onAdClick={handleAdClick}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Jobs
