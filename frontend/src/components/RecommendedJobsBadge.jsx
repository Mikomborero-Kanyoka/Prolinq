import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { Sparkles, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const RecommendedJobsBadge = () => {
  const { user } = useAuth()
  const [jobCount, setJobCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchRecommendedJobsCount()
    }
  }, [user])

  const fetchRecommendedJobsCount = async () => {
    try {
      setLoading(true)
      
      // Generate user embedding if needed
      await generateUserEmbedding()
      
      // Get recommended jobs count
      const response = await api.get(`/skills-matching/matches-for-user/${user.id}?limit=50`)
      
      if (response.data.success && response.data.matches) {
        setJobCount(response.data.matches.length)
      } else {
        setJobCount(0)
      }
    } catch (error) {
      console.error('Error fetching recommended jobs count:', error)
      setJobCount(0)
    } finally {
      setLoading(false)
    }
  }

  const generateUserEmbedding = async () => {
    try {
      if (!user.profile_embedding) {
        await api.post(`/skills-matching/embed-user-db/${user.id}`)
      }
    } catch (error) {
      console.error('Error generating user embedding:', error)
    }
  }

  if (loading) {
    return null
  }

  if (jobCount === 0) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm font-medium">No recommendations yet</span>
      </div>
    )
  }

  return (
    <Link
      to="/recommended-jobs"
      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:from-purple-600 hover:to-purple-700 hover:scale-105 hover:-translate-y-0.5"
    >
      <motion.div
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Sparkles className="h-4 w-4" />
      </motion.div>
      <span className="whitespace-nowrap">{jobCount} {jobCount === 1 ? 'job' : 'jobs'} recommended</span>
    </Link>
  )
}

export default RecommendedJobsBadge
