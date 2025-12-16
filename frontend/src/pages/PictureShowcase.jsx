import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import PictureJobCard from '../components/PictureJobCard'
import PictureAdCard from '../components/PictureAdCard'
import { Loader, AlertCircle } from 'lucide-react'

const PictureShowcase = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [jobs, setJobs] = useState([])
  const [ads, setAds] = useState([])
  const [activeTab, setActiveTab] = useState('all') // 'all', 'jobs', 'ads'
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState('latest') // 'latest', 'popular'

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch picture jobs
      const jobsResponse = await api.get('/jobs?is_picture_only=true&limit=50')
      setJobs(jobsResponse.data || [])

      // Fetch picture ads
      const adsResponse = await api.get('/advertisements/public/all?is_picture_only=true&limit=50')
      setAds(adsResponse.data || [])
    } catch (error) {
      console.error('Error fetching content:', error)
      setError('Failed to load content')
    } finally {
      setIsLoading(false)
    }
  }

  const sortContent = (items) => {
    if (sortBy === 'latest') {
      return [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (sortBy === 'popular') {
      // For ads: use views, for jobs: use created_at (no views tracking for jobs)
      return [...items].sort((a, b) => {
        const aMetric = a.views !== undefined ? a.views : 0
        const bMetric = b.views !== undefined ? b.views : 0
        return bMetric - aMetric
      })
    }
    return items
  }

  const getDisplayContent = () => {
    let content = []
    if (activeTab === 'all' || activeTab === 'jobs') {
      content = [...content, ...jobs.map(job => ({ ...job, type: 'job' }))]
    }
    if (activeTab === 'all' || activeTab === 'ads') {
      content = [...content, ...ads.map(ad => ({ ...ad, type: 'ad' }))]
    }
    return sortContent(content)
  }

  const displayContent = getDisplayContent()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Picture Jobs & Ads</h1>
          <p className="text-lg text-gray-600 mb-6">Discover visual job postings and promotional ads</p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            {user && user.primary_role !== 'talent' && (
              <button
                onClick={() => navigate('/jobs/post-picture')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
              >
                + Post Picture Job
              </button>
            )}
            {user && user.is_admin && (
              <button
                onClick={() => navigate('/advertisements/create-picture')}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
              >
                + Create Picture Ad
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Tab Selection */}
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'jobs', label: 'Picture Jobs' },
                { value: 'ads', label: 'Picture Ads' }
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    activeTab === tab.value
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Selection */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="latest">Latest</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">Loading content...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 flex items-center gap-4">
            <AlertCircle size={32} className="text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Error loading content</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchContent}
                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : displayContent.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No content yet</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'jobs' && "No picture jobs available yet"}
              {activeTab === 'ads' && "No picture ads available yet"}
              {activeTab === 'all' && "No picture jobs or ads available yet"}
            </p>
            {user && user.primary_role !== 'talent' && (
              <button
                onClick={() => navigate('/jobs/post-picture')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition inline-block"
              >
                Be the first to post a picture job
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayContent.map((item, index) => {
              // Check if current item and next item are both picture ads
              const isCurrentAd = item.type === 'ad'
              const isNextAd = index < displayContent.length - 1 && displayContent[index + 1].type === 'ad'
              
              // If current is an ad and next is also an ad, group them in a 2-column layout
              if (isCurrentAd && isNextAd) {
                return (
                  <div key={`pair-${item.id}-${displayContent[index + 1].id}`} className="col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <PictureAdCard ad={item} />
                      <PictureAdCard ad={displayContent[index + 1]} />
                    </div>
                  </div>
                )
              }
              
              // Skip next item if we already grouped it
              if (isCurrentAd && isNextAd) {
                return null
              }
              
              // Render single item (job or unpaired ad)
              return (
                <div 
                  key={`${item.type}-${item.id}`} 
                  className="col-span-1"
                >
                  {item.type === 'job' ? (
                    <PictureJobCard job={item} />
                  ) : (
                    <PictureAdCard ad={item} />
                  )}
                </div>
              )
            }).filter(Boolean)}
          </div>
        )}

        {/* Stats Footer */}
        {!isLoading && !error && displayContent.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-blue-600">{jobs.length}</p>
                <p className="text-gray-600">Picture Jobs</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">{ads.length}</p>
                <p className="text-gray-600">Picture Ads</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{jobs.length + ads.length}</p>
                <p className="text-gray-600">Total Items</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PictureShowcase
