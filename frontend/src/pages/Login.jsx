import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import './Login.css'

const Login = () => {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [loginMethod, setLoginMethod] = useState('password') // 'password' or 'phone'
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  // Navigate to dashboard when user is logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      if (loginMethod === 'password') {
        // Send only email and password - phone login not supported yet
        await login({
          email: data.email || data.phone,
          password: data.password
        })
      } else {
        // Phone verification code login - not yet implemented in backend
        console.log('Phone verification login not yet implemented')
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 sm:p-6 md:p-8 relative">

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-4xl animate-fade-in">
        <div className="bg-white border-gray-100 rounded-2xl shadow-2xl overflow-hidden border sm:rounded-3xl">
          <div className="flex flex-col lg:flex-row">
            
            {/* Image Section - Top on mobile, Left on desktop */}
            <div className="w-full lg:w-2/5 relative overflow-hidden order-first lg:order-none">
              <div className="relative h-48 sm:h-56 md:h-64 lg:h-full">
                <img
                  src="/src/assets/images/login.jpg"
                  alt="Career opportunities"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent lg:bg-gradient-to-r lg:from-black/70 lg:via-black/40 lg:to-transparent"></div>
                
                {/* Subtle Pattern Overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
                  }}></div>
                </div>
                
                {/* Overlay Content */}
                <div className="absolute inset-0 flex flex-col justify-end lg:justify-center items-center p-4 sm:p-6 text-center pb-6 sm:pb-8 lg:pb-0">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                    Your Career Journey Starts Here
                  </h2>
                  <p className="text-white/90 text-sm sm:text-base max-w-md leading-relaxed font-light">
                    Join thousands of professionals who have found their dream jobs and built meaningful connections through ProLinq.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Section - Bottom on mobile, Right on desktop */}
            <div className="w-full lg:w-3/5 p-4 sm:p-6 md:p-8 lg:p-10 animate-slide-up">
              {/* Logo Section - Compact for mobile */}
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <span className="text-white text-xl sm:text-2xl md:text-3xl font-bold">P</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 text-gray-900">ProLinq</h1>
                <p className="text-sm sm:text-base md:text-lg text-gray-600">Where talent meets opportunity</p>
              </div>

              <form className="space-y-4 sm:space-y-5 md:space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* Login Method Tabs */}
                <div className="flex p-0.5 sm:p-1 bg-gray-50 rounded-lg sm:rounded-xl shadow-inner">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('password')}
                    className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02] ${
                      loginMethod === 'password'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md shadow-primary-500/25'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    Email & Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('phone')}
                    className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02] ${
                      loginMethod === 'phone'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md shadow-primary-500/25'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    Phone & Code
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 sm:space-y-5">
                  {loginMethod === 'password' ? (
                    <>
                      <div className="animate-fade-in-delay-1">
                        <label className="block text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 text-gray-700">
                          Email Address
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                            <span className="text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200 text-base">✉</span>
                          </div>
                          <input
                            {...register('email', { required: 'Email is required' })}
                            type="email"
                            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 placeholder-gray-400 focus:shadow-md focus:shadow-primary-500/10 text-sm sm:text-base bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                            placeholder="you@example.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1.5 text-xs sm:text-sm text-red-500 flex items-center animate-shake">
                            <span className="mr-1.5">⚠️</span> {errors.email.message}
                          </p>
                        )}
                      </div>
                      <div className="animate-fade-in-delay-2">
                        <label className="block text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 text-gray-700">
                          Password
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                            <span className="text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200 text-base">🔒</span>
                          </div>
                          <input
                            {...register('password', { required: 'Password is required' })}
                            type="password"
                            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 placeholder-gray-400 focus:shadow-md focus:shadow-primary-500/10 text-sm sm:text-base bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                            placeholder="••••••••"
                          />
                        </div>
                        {errors.password && (
                          <p className="mt-1.5 text-xs sm:text-sm text-red-500 flex items-center animate-shake">
                            <span className="mr-1.5">⚠️</span> {errors.password.message}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="animate-fade-in-delay-1">
                        <label className="block text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 text-gray-700">
                          Phone Number
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                            <span className="text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200 text-base">📱</span>
                          </div>
                          <input
                            {...register('phone', { required: 'Phone number is required' })}
                            type="tel"
                            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 placeholder-gray-400 focus:shadow-md focus:shadow-primary-500/10 text-sm sm:text-base bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                            placeholder="+263 123 456 789"
                          />
                        </div>
                        {errors.phone && (
                          <p className="mt-1.5 text-xs sm:text-sm text-red-500 flex items-center animate-shake">
                            <span className="mr-1.5">⚠️</span> {errors.phone.message}
                          </p>
                        )}
                      </div>
                      <div className="animate-fade-in-delay-2">
                        <label className="block text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 text-gray-700">
                          Verification Code
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                            <span className="text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200 text-base">🔢</span>
                          </div>
                          <input
                            {...register('code', { required: 'Verification code is required' })}
                            type="text"
                            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 placeholder-gray-400 focus:shadow-md focus:shadow-primary-500/10 text-sm sm:text-base bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white"
                            placeholder="123456"
                            maxLength={6}
                          />
                        </div>
                        {errors.code && (
                          <p className="mt-1.5 text-xs sm:text-sm text-red-500 flex items-center animate-shake">
                            <span className="mr-1.5">⚠️</span> {errors.code.message}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Sign In Button */}
                <div className="pt-3 sm:pt-4 animate-fade-in-delay-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 sm:py-3.5 px-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      'Sign in to ProLinq'
                    )}
                  </button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center pt-3 sm:pt-4 animate-fade-in-delay-4">
                  <p className="text-sm sm:text-base text-gray-600">
                    New to ProLinq?{' '}
                    <Link 
                      to="/register" 
                      className="font-semibold transition-colors duration-200 text-primary-600 hover:text-primary-500 hover:underline"
                    >
                      Create an account
                    </Link>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2">
                    or{' '}
                    <Link 
                      to="/forgot-password" 
                      className="font-medium text-primary-500 hover:text-primary-600 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </p>
                </div>
              </form>

              {/* Footer on mobile/tablet */}
              <div className="text-center mt-6 sm:mt-8 md:hidden">
                <p className="text-xs text-gray-500">© 2024 ProLinq. Empowering careers.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer - Desktop */}
        <div className="hidden md:block text-center mt-4 sm:mt-6 text-sm text-gray-600">
          <p>© 2024 ProLinq. Empowering careers, connecting talent.</p>
        </div>
      </div>
    </div>
  )
}

export default Login