import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import TopNav from './components/TopNav'
import Sidebar from './components/Sidebar'
import LandingPage from './pages/LandingPage'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import PostJob from './pages/PostJob'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import Chat from './pages/Chat'
import Notifications from './pages/Notifications'
import JobApplications from './pages/JobApplications'
import MyJobs from './pages/MyJobs'
import MyApplications from './pages/MyApplications'
import UserProfile from './pages/UserProfile'
import BrowseTalent from './pages/BrowseTalent'
import JobCompletion from './pages/JobCompletion'
import JobSeekerDashboard from './pages/JobSeekerDashboard'
import JobOwnerDashboard from './pages/JobOwnerDashboard'
import Analytics from './pages/Analytics'
import AdminDashboard from './pages/AdminDashboard'
import AdminChats from './pages/AdminChats'
import AdminMessaging from './pages/AdminMessaging'
import AdminEmailPreview from './pages/AdminEmailPreview'
import AdvertisementDemo from './pages/AdvertisementDemo'
import AdvertisementManager from './pages/AdvertisementManager'
import RecommendedJobsPage from './pages/RecommendedJobsPage'
import PictureJobForm from './components/PictureJobForm'
import PictureAdForm from './components/PictureAdForm'
import { useEffect, useState } from 'react'
import './utils/adminFix.js' // Load admin fix utilities

function AppContent() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarMinimized, setSidebarMinimized] = useState(false)

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 0.98,
      transition: {
        duration: 0.4,
        ease: "easeIn"
      }
    }
  }

  const PageWrapper = ({ children }) => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="w-full"
    >
      {children}
    </motion.div>
  )

  const isLandingPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={!isLandingPage ? { paddingTop: '0px' } : {}}>
      {!isLandingPage && (
        <TopNav onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      )}
      <div className="flex flex-1 relative">
        {!isLandingPage && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
            isMinimized={sidebarMinimized}
            onToggleMinimize={() => setSidebarMinimized(!sidebarMinimized)}
          />
        )}
        <main className={`
          main-content flex-1 flex flex-col overflow-auto transition-all duration-300
          ${!isLandingPage && sidebarMinimized ? 'ml-0 md:ml-20 lg:ml-24' : ''}
          ${!isLandingPage && !sidebarMinimized ? 'ml-0 md:ml-72 lg:ml-80' : ''}
        `} style={!isLandingPage ? { paddingTop: '0px', minHeight: 'calc(100vh - 80px)' } : {}}>
          <AnimatePresence mode="wait">
            <Routes location={location}>
          <Route 
            path="/" 
            element={
              <PageWrapper>
                <LandingPage />
              </PageWrapper>
            } 
          />
          <Route 
            path="/home" 
            element={
              <PageWrapper>
                <Home />
              </PageWrapper>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PageWrapper>
                <Login />
              </PageWrapper>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PageWrapper>
                <Register />
              </PageWrapper>
            } 
          />
          <Route
            path="/dashboard"
            element={
              <PageWrapper>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/jobs"
            element={
              <PageWrapper>
                <Jobs />
              </PageWrapper>
            }
          />
          <Route 
            path="/recommended-jobs" 
            element={
              <PageWrapper>
                <ProtectedRoute>
                  <RecommendedJobsPage />
                </ProtectedRoute>
              </PageWrapper>
            } 
          />
          <Route 
            path="/jobs/:id" 
            element={
              <PageWrapper>
                <JobDetail />
              </PageWrapper>
            } 
          />
          <Route
            path="/applications/job/:id"
            element={
              <PageWrapper>
                <ProtectedRoute>
                  <JobApplications />
                </ProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/users/:id"
            element={
              <PageWrapper>
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/jobs/post"
            element={
              <PageWrapper>
                <ProtectedRoute>
                  <PostJob />
                </ProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/jobs/my-jobs"
            element={
              <PageWrapper>
                <ProtectedRoute>
                  <MyJobs />
                </ProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/jobs/me/applications"
            element={
              <PageWrapper>
                <ProtectedRoute>
                  <MyApplications />
                </ProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/profile"
            element={
              <PageWrapper>
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/messages"
            element={
              <PageWrapper>
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/messages/:userId"
            element={
              <PageWrapper>
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/browse-talent"
            element={
              <PageWrapper>
                <ProtectedRoute>
                  <BrowseTalent />
                </ProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/notifications"
            element={
              <PageWrapper>
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/job-completion/:jobId"
            element={
              <PageWrapper>
                <ProtectedRoute>
                  <JobCompletion />
                </ProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/dashboard/job-seeker"
            element={
              <PageWrapper>
                <ProtectedRoute>
                  <JobSeekerDashboard />
                </ProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/dashboard/job-owner"
            element={
              <PageWrapper>
                <ProtectedRoute>
                  <JobOwnerDashboard />
                </ProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/analytics"
            element={
              <PageWrapper>
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/advertisement-generator"
            element={
              <PageWrapper>
                <AdminProtectedRoute>
                  <AdvertisementDemo />
                </AdminProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/advertisement-manager"
            element={
              <PageWrapper>
                <AdminProtectedRoute>
                  <AdvertisementManager />
                </AdminProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/admin"
            element={
              <PageWrapper>
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/admin/chats"
            element={
              <PageWrapper>
                <AdminProtectedRoute>
                  <AdminChats />
                </AdminProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/admin/messaging"
            element={
              <PageWrapper>
                <AdminProtectedRoute>
                  <AdminMessaging />
                </AdminProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/admin/email-preview"
            element={
              <PageWrapper>
                <AdminProtectedRoute>
                  <AdminEmailPreview />
                </AdminProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/jobs/post-picture"
            element={
              <PageWrapper>
                <ProtectedRoute>
                  <PictureJobForm />
                </ProtectedRoute>
              </PageWrapper>
            }
          />
          <Route
            path="/advertisements/create-picture"
            element={
              <PageWrapper>
                <AdminProtectedRoute>
                  <PictureAdForm />
                </AdminProtectedRoute>
              </PageWrapper>
            }
          />
        </Routes>
          </AnimatePresence>
          <Toaster position="top-right" />
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppContent />
        </Router>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
