import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Briefcase, Users, MessageSquare, Search } from 'lucide-react'
import AdvertisementDisplay from '../components/AdvertisementDisplay'

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connect Talent with Opportunities in Zimbabwe
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              The platform where employers meet skilled professionals
            </p>
            {!isAuthenticated && (
              <div className="space-x-4">
                <Link
                  to="/register"
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-50 transition"
                >
                  Get Started
                </Link>
                <Link
                  to="/jobs"
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-primary-600 transition"
                >
                  Browse Jobs
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Post Jobs & Gigs</h3>
            <p className="text-gray-600">
              Employers can easily post job openings and short-term gigs, set budgets, and find the right talent.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Find Opportunities</h3>
            <p className="text-gray-600">
              Talents can browse jobs, filter by skills and location, and apply directly to opportunities.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Chat</h3>
            <p className="text-gray-600">
              Communicate directly with employers or talents through our real-time messaging system.
            </p>
          </div>
        </div>
      </div>

      {/* Advertisements Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Opportunities</h2>
          <p className="text-gray-600">Discover services and products from our community</p>
        </div>
        <div className="max-w-4xl mx-auto">
          <AdvertisementDisplay limit={3} />
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="bg-gray-100 py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-gray-600 mb-8">
              Join ProLinq today and connect with Zimbabwe's top talent and opportunities.
            </p>
            <Link
              to="/register"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition inline-block"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
