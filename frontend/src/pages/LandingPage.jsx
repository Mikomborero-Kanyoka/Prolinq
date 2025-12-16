import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Briefcase, Users, MessageSquare, Star, TrendingUp, Shield } from 'lucide-react'
import LottieAnimation from '../animations/components/LottieAnimation'
import AnimatedCard from '../components/AnimatedCard'
import { animations } from '../assets/animations'
import { useFadeIn } from '../animations/hooks/useFadeIn'
import { useSlideUp } from '../animations/hooks/useSlideUp'

const LandingPage = () => {
  const { isAuthenticated } = useAuth()
  
  // Animation hooks
  const fadeIn = useFadeIn(1000, 0)
  const slideUp = useSlideUp(1000, 200)

  const features = [
    {
      icon: <Briefcase className="h-8 w-8" />,
      title: "Post Jobs & Gigs",
      description: "Employers can easily post job openings and short-term gigs, set budgets, and find the right talent."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Find Opportunities",
      description: "Talents can browse jobs, filter by skills and location, and apply directly to opportunities."
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Real-time Chat",
      description: "Communicate directly with employers or talents through our real-time messaging system."
    }
  ]

  const stats = [
    { number: "1000+", label: "Active Users" },
    { number: "500+", label: "Jobs Posted" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "Support" }
  ]

  const testimonials = [
    {
      name: "Sarah T.",
      role: "Software Developer",
      content: "ProLinq helped me find my dream job in just 2 weeks. The platform is intuitive and the real-time chat feature is amazing.",
      rating: 5
    },
    {
      name: "John M.",
      role: "HR Manager",
      content: "As an employer, I've found exceptional talent through ProLinq. The quality of candidates is outstanding.",
      rating: 5
    },
    {
      name: "Grace K.",
      role: "Graphic Designer",
      content: "I've landed several freelance gigs through ProLinq. It's the best platform for creative professionals in Zimbabwe.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section ref={fadeIn} className="relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Connect Talent with Opportunities
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto">
              The premier platform where Zimbabwe's top talent meets amazing opportunities
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center relative z-20">
              <Link
                to="/register"
                className="inline-flex items-center justify-center bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg min-w-[120px] sm:min-w-[140px]"
              >
                Get Started
              </Link>
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center bg-white border-2 border-gray-300 text-gray-700 px-4 sm:px-6 py-3 rounded-lg text-base sm:text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 min-w-[120px] sm:min-w-[140px]"
              >
                Browse Jobs
              </Link>
            </div>
            
            {/* Additional Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
          
          {/* Hero Animation */}
          <div className="mt-12 flex justify-center">
            <LottieAnimation
              animationData={animations.creativeTeam}
              width={300}
              height={300}
              loop={true}
            />
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={slideUp} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={fadeIn} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ProLinq?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We connect talented professionals with meaningful opportunities across Zimbabwe
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedCard 
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100"
                animationDelay={index * 0.2}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-xl flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section ref={slideUp} className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Matches</h3>
              <p className="text-gray-600">Our smart matching algorithm connects the right talent with the right opportunities.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Career Growth</h3>
              <p className="text-gray-600">Access opportunities that help you grow professionally and financially.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
              <p className="text-gray-600">Your data and transactions are protected with industry-leading security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={fadeIn} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">Real stories from real people</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedCard 
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl"
                animationDelay={index * 0.1}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section ref={slideUp} className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center px-4">
            <LottieAnimation
              animationData={animations.rocketLaunch}
              width={100}
              height={100}
              loop={true}
              className="mx-auto mb-8"
            />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join ProLinq today and connect with Zimbabwe's top talent and opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                ProLinq
              </h3>
              <p className="text-gray-400">
                Connecting Zimbabwe's talent with meaningful opportunities.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link to="/jobs" className="text-gray-400 hover:text-white transition">Browse Jobs</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition">Post a Job</Link></li>
                <li><Link to="/browse-talent" className="text-gray-400 hover:text-white transition">Find Talent</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <p className="text-gray-400 mb-4">Stay updated with our latest features and opportunities.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235V2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046C.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 ProLinq. All rights reserved. Made with love in Zimbabwe.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
