import { useEffect, useState } from 'react'
import { Mail, Send, Eye, BarChart3, RefreshCw, Copy, Check, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api, { adminAPI } from '../services/api'

const AdminEmailPreview = () => {
  const [welcomePreview, setWelcomePreview] = useState(null)
  const [dailyPreview, setDailyPreview] = useState(null)
  const [adDistribution, setAdDistribution] = useState(null)
  const [queueStatus, setQueueStatus] = useState(null)
  const [ads, setAds] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [testEmail, setTestEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(null)
  const [newAd, setNewAd] = useState({ title: '', ad_text: '', ad_link: '' })
  const [creatingAd, setCreatingAd] = useState(false)
  
  // Personalized recommendations test
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [sendingRecommendation, setSendingRecommendation] = useState(false)
  
  // Pending emails management
  const [pendingEmails, setPendingEmails] = useState([])
  const [loadingPendingEmails, setLoadingPendingEmails] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [cancellingEmail, setCancellingEmail] = useState(false)
  
  // Remaining emails for today management
  const [remainingEmails, setRemainingEmails] = useState([])
  const [loadingRemainingEmails, setLoadingRemainingEmails] = useState(false)
  const [clearingQueue, setClearingQueue] = useState(false)
  
  const [activeTab, setActiveTab] = useState('preview') // preview, ads, queue, distribution, recommendations

  useEffect(() => {
    loadPreviews()
  }, [])

  const loadPreviews = async () => {
    try {
      setLoading(true)
      
      // Load all previews in parallel
      const [welcome, daily, distrib, status, adsList] = await Promise.all([
        api.get('/email/preview/welcome'),
        api.post('/email/preview/daily-recommendations'),
        api.get('/email/preview/ad-distribution'),
        api.get('/email/queue/status'),
        api.get('/email/ads')
      ])
      
      setWelcomePreview(welcome.data)
      setDailyPreview(daily.data)
      setAdDistribution(distrib.data)
      setQueueStatus(status.data)
      setAds(adsList.data)
    } catch (error) {
      console.error('Error loading previews:', error)
      toast.error('Failed to load email previews')
    } finally {
      setLoading(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast.error('Please enter an email address')
      return
    }

    try {
      setSending(true)
      const response = await api.post('/email/test/send', { recipient_email: testEmail })
      toast.success(`✅ Test email sent directly to ${testEmail}`)
      setTestEmail('')
    } catch (error) {
      console.error('Error sending test email:', error)
      toast.error(error.response?.data?.detail || 'Failed to send test email')
    } finally {
      setSending(false)
    }
  }

  const createNewAd = async () => {
    if (!newAd.title.trim() || !newAd.ad_text.trim()) {
      toast.error('Title and ad text are required')
      return
    }

    try {
      setCreatingAd(true)
      await api.post('/email/ads', newAd)
      toast.success('Ad created successfully')
      setNewAd({ title: '', ad_text: '', ad_link: '' })
      loadPreviews() // Reload to update ads list
    } catch (error) {
      console.error('Error creating ad:', error)
      toast.error('Failed to create ad')
    } finally {
      setCreatingAd(false)
    }
  }

  const toggleAdStatus = async (adId, isActive) => {
    try {
      await api.put(`/email/ads/${adId}`, { is_active: !isActive })
      toast.success(`Ad ${!isActive ? 'activated' : 'deactivated'}`)
      loadPreviews()
    } catch (error) {
      console.error('Error updating ad:', error)
      toast.error('Failed to update ad')
    }
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(null), 2000)
  }

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await api.get('/email/test-email/users')
      const usersList = response.data.users || []
      setUsers(usersList)
      if (usersList.length > 0) {
        setSelectedUserId(usersList[0].id)
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }

  const sendRecommendationEmail = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user')
      return
    }

    try {
      setSendingRecommendation(true)
      await api.post(`/email/test-email/send-recommendations/${selectedUserId}`)
      toast.success('✅ Email queued! It will be sent within the next 9 minutes (rate limiting)')
    } catch (error) {
      console.error('Error sending recommendation:', error)
      toast.error(error.response?.data?.detail || 'Failed to send recommendation email')
    } finally {
      setSendingRecommendation(false)
    }
  }

  const loadPendingEmails = async () => {
    try {
      setLoadingPendingEmails(true)
      const response = await api.get('/email/queue/pending?limit=50')
      setPendingEmails(response.data || [])
    } catch (error) {
      console.error('Error loading pending emails:', error)
      toast.error('Failed to load pending emails')
    } finally {
      setLoadingPendingEmails(false)
    }
  }

  const cancelPendingEmail = async () => {
    if (!selectedEmail) return

    try {
      setCancellingEmail(true)
      await api.delete(`/email/queue/${selectedEmail.id}`)
      toast.success(`✅ Email to ${selectedEmail.to} has been cancelled`)
      setSelectedEmail(null)
      loadPendingEmails() // Reload list
    } catch (error) {
      console.error('Error cancelling email:', error)
      toast.error(error.response?.data?.detail || 'Failed to cancel email')
    } finally {
      setCancellingEmail(false)
    }
  }

  const loadRemainingEmails = async () => {
    try {
      setLoadingRemainingEmails(true)
      const response = await api.get('/email/queue/remaining')
      setRemainingEmails(response.data.emails || [])
    } catch (error) {
      console.error('Error loading remaining emails:', error)
      toast.error('Failed to load remaining emails')
    } finally {
      setLoadingRemainingEmails(false)
    }
  }

  const clearAllRemainingEmails = async () => {
    if (remainingEmails.length === 0) {
      toast.info('No remaining emails to clear')
      return
    }

    // Confirmation dialog
    const confirmed = window.confirm(
      `⚠️  Are you sure you want to cancel ALL ${remainingEmails.length} remaining emails? This cannot be undone!`
    )
    if (!confirmed) return

    try {
      setClearingQueue(true)
      const response = await api.delete('/email/queue/clear-all')
      toast.success(`✅ Cancelled ${response.data.cancelled_count} remaining emails`)
      setRemainingEmails([]) // Clear the list
      loadQueueStatus() // Reload stats
    } catch (error) {
      console.error('Error clearing queue:', error)
      toast.error(error.response?.data?.detail || 'Failed to clear queue')
    } finally {
      setClearingQueue(false)
    }
  }

  const loadQueueStatus = async () => {
    try {
      const response = await api.get('/email/queue/status')
      setQueueStatus(response.data)
    } catch (error) {
      console.error('Error loading queue status:', error)
    }
  }

  const EmailPreviewBox = ({ title, subject, content, type }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subject && <p className="text-sm text-gray-600 mt-1">Subject: {subject}</p>}
      </div>
      <div className="p-4">
        <div className="bg-gray-50 rounded p-4 font-mono text-sm text-gray-800 whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
          {content}
        </div>
        <button
          onClick={() => copyToClipboard(content, type)}
          className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
        >
          {copied === type ? <Check size={16} /> : <Copy size={16} />}
          {copied === type ? 'Copied' : 'Copy to Clipboard'}
        </button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={32} className="animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading email previews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail size={32} className="text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Email Preview & Testing</h1>
                <p className="text-gray-600 text-sm">Preview emails and test ad distribution</p>
              </div>
            </div>
            <button
              onClick={loadPreviews}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'preview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye size={18} className="inline mr-2" />
              Email Previews
            </button>
            <button
              onClick={() => setActiveTab('distribution')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'distribution'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 size={18} className="inline mr-2" />
              Ad Distribution
            </button>
            <button
              onClick={() => {
                setActiveTab('test')
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'test'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Send size={18} className="inline mr-2" />
              Send Test
            </button>
            <button
              onClick={() => {
                setActiveTab('recommendations')
                if (users.length === 0) {
                  loadUsers()
                }
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'recommendations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail size={18} className="inline mr-2" />
              Test Recommendations
            </button>
            <button
              onClick={() => setActiveTab('ads')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'ads'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail size={18} className="inline mr-2" />
              Manage Ads
            </button>
            <button
              onClick={() => {
                setActiveTab('queue')
                if (pendingEmails.length === 0) {
                  loadPendingEmails()
                }
                if (remainingEmails.length === 0) {
                  loadRemainingEmails()
                }
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'queue'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Queue Status
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* EMAIL PREVIEWS TAB */}
        {activeTab === 'preview' && (
          <div className="space-y-8">
            <div className="grid gap-8">
              {/* Welcome Email */}
              {welcomePreview && (
                <EmailPreviewBox
                  title="🎉 Welcome Email"
                  subject={welcomePreview.subject}
                  content={welcomePreview.text_content}
                  type="welcome"
                />
              )}

              {/* Daily Recommendations */}
              {dailyPreview && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">📨 Daily Job Recommendations Email</h3>
                    <p className="text-sm text-gray-600 mt-1">Subject: {dailyPreview.subject}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {dailyPreview.jobs_count} jobs
                      </span>
                      {dailyPreview.includes_ad && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          Includes ad
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    {/* HTML Preview */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">HTML Preview</span>
                        <button
                          onClick={() => copyToClipboard(dailyPreview.html_content || dailyPreview.text_content, 'daily')}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          {copied === 'daily' ? <Check size={12} /> : <Copy size={12} />}
                          {copied === 'daily' ? 'Copied' : 'Copy HTML'}
                        </button>
                      </div>
                      <div 
                        className="bg-white p-4 max-h-96 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: dailyPreview.html_content || dailyPreview.text_content }}
                      />
                    </div>
                    
                    {/* Raw HTML Source */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-medium">
                        📄 View Raw HTML Source
                      </summary>
                      <div className="mt-2 bg-gray-50 rounded p-4 font-mono text-xs text-gray-800 whitespace-pre-wrap break-words max-h-64 overflow-y-auto border border-gray-200">
                        {dailyPreview.html_content || dailyPreview.text_content}
                      </div>
                    </details>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-semibold mb-2">💡 About Email Previews</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Welcome emails are sent automatically when users register</li>
                <li>Daily recommendations are sent from 8 AM to 8 PM UTC, staggered hourly</li>
                <li>Ads are randomly selected from active ads and shown to users with recommendations</li>
              </ul>
            </div>
          </div>
        )}

        {/* AD DISTRIBUTION TAB */}
        {activeTab === 'distribution' && adDistribution && (
          <div className="space-y-8">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <p className="text-gray-600 text-sm">Total Active Ads</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{adDistribution.total_active_ads}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <p className="text-gray-600 text-sm">Total Talent Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{adDistribution.total_talent_users}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <p className="text-gray-600 text-sm">Sample Size</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{adDistribution.sample_size}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <p className="text-gray-600 text-sm">Avg per Ad</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {adDistribution.total_active_ads > 0
                    ? Math.round(adDistribution.sample_size / adDistribution.total_active_ads)
                    : 0}
                </p>
              </div>
            </div>

            {/* Distribution Summary Table */}
            {adDistribution.impression_summary && adDistribution.impression_summary.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Ad Impression Distribution</h3>
                  <p className="text-sm text-gray-600 mt-1">{adDistribution.distribution_note}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Ad ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Impressions (Sample)</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Distribution %</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Visual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {adDistribution.impression_summary.map((item) => (
                        <tr key={item.ad_id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm font-mono text-gray-900">#{item.ad_id}</td>
                          <td className="px-6 py-3 text-sm text-gray-900 font-semibold">{item.impressions_in_sample}</td>
                          <td className="px-6 py-3 text-sm text-gray-900">{item.percentage}%</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-40 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${item.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Distribution Example */}
            {adDistribution.distribution_sample && adDistribution.distribution_sample.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Sample Distribution (First 10 Users)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">User #</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Selected Ad</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Ad Title</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {adDistribution.distribution_sample.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm text-gray-900 font-mono">User {item.user_index}</td>
                          <td className="px-6 py-3 text-sm text-gray-900 font-semibold">#{item.selected_ad_id}</td>
                          <td className="px-6 py-3 text-sm text-gray-700">{item.selected_ad_title}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
              <p className="font-semibold mb-2">✅ Fair Distribution</p>
              <p>
                Ads are shuffled randomly across all users to ensure fair distribution. Each active ad
                has an equal chance of being selected for each user's email.
              </p>
            </div>
          </div>
        )}

        {/* TEST EMAIL TAB */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Test Email</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={sendTestEmail}
                  disabled={sending || !testEmail}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
                >
                  {sending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                  {sending ? 'Sending...' : 'Send Test Email'}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                The test email will be queued and sent according to the system's rate limiting rules.
                Check your inbox in a few moments.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">📧 About Test Emails</p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li><strong>Sent immediately</strong> - bypasses queue and rate limiting</li>
                <li>System confirmation message with SMTP status</li>
                <li>Timestamp of email send</li>
                <li>Useful for verifying Gmail integration works</li>
                <li><strong>Different from recommendations:</strong> Recommendations go through the queue with 9-min rate limiting</li>
              </ul>
            </div>
          </div>
        )}

        {/* TEST RECOMMENDATIONS TAB */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Personalized Recommendations</h2>
              <p className="text-gray-600 text-sm mb-6">
                Send a personalized recommendation email to a specific user. The email will include:
                <br />✓ 5 personalized job recommendations
                <br />✓ User's actual name
                <br />✓ Random ad selection for fair distribution
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select User
                  </label>
                  {loadingUsers ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <RefreshCw size={16} className="animate-spin" />
                      Loading users...
                    </div>
                  ) : users.length > 0 ? (
                    <select
                      value={selectedUserId || ''}
                      onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    >
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || user.username} ({user.email})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500">
                      No users found
                    </div>
                  )}
                </div>

                {users.length > 0 && selectedUserId && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {(() => {
                      const user = users.find(u => u.id === selectedUserId)
                      return (
                        <div className="text-sm text-gray-700 space-y-2">
                          <div><strong>Name:</strong> {user.full_name || user.username}</div>
                          <div><strong>Email:</strong> {user.email}</div>
                          <div><strong>User ID:</strong> {user.id}</div>
                        </div>
                      )
                    })()}
                  </div>
                )}

                <button
                  onClick={sendRecommendationEmail}
                  disabled={sendingRecommendation || !selectedUserId || users.length === 0}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
                >
                  {sendingRecommendation ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Recommendation Email
                    </>
                  )}
                </button>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <p className="text-sm font-semibold text-green-900 mb-2">✨ What Happens Next?</p>
                <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                  <li>Email is queued with the user's actual name</li>
                  <li>5 personalized job recommendations are included</li>
                  <li>A random ad is selected from active ads (fair distribution)</li>
                  <li>Ad impression is tracked in the database</li>
                  <li><strong>Email will be sent according to rate limiting:</strong>
                    <div className="ml-5 mt-1 text-green-700 text-xs">
                      • 1 email every 9 minutes (Gmail compliance)<br/>
                      • Check "Queue Status" tab to see when your email will send<br/>
                      • Max 140 emails per day
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* MANAGE ADS TAB */}
        {activeTab === 'ads' && (
          <div className="space-y-8">
            {/* Create New Ad */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Ad</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ad Title</label>
                  <input
                    type="text"
                    value={newAd.title}
                    onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                    placeholder="e.g., Premium Job Posting"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ad Text</label>
                  <textarea
                    value={newAd.ad_text}
                    onChange={(e) => setNewAd({ ...newAd, ad_text: e.target.value })}
                    placeholder="Ad description text..."
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ad Link (Optional)</label>
                  <input
                    type="url"
                    value={newAd.ad_link}
                    onChange={(e) => setNewAd({ ...newAd, ad_link: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={createNewAd}
                  disabled={creatingAd}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
                >
                  {creatingAd ? 'Creating...' : 'Create Ad'}
                </button>
              </div>
            </div>

            {/* Existing Ads */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Active Ads ({ads.length})</h2>
              </div>
              {ads.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>No ads created yet. Create one above to get started!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {ads.map((ad) => (
                    <div key={ad.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                          <p className="text-gray-600 text-sm mt-2">{ad.ad_text}</p>
                          {ad.ad_link && (
                            <a
                              href={ad.ad_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                            >
                              {ad.ad_link}
                            </a>
                          )}
                          <div className="flex gap-4 mt-3 text-sm">
                            <span className="text-gray-500">
                              👁️ {ad.impressions} impressions
                            </span>
                            <span className="text-gray-500">
                              📅 {new Date(ad.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleAdStatus(ad.id, ad.is_active)}
                          className={`px-4 py-2 rounded-lg font-medium ml-4 ${
                            ad.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {ad.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* QUEUE STATUS TAB */}
        {activeTab === 'queue' && queueStatus && (
          <div className="space-y-6">
            {/* Queue Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <p className="text-gray-600 text-sm">Pending Emails</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{queueStatus.pending || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <p className="text-gray-600 text-sm">Retry Queue</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{queueStatus.retry || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <p className="text-gray-600 text-sm">Sent Today</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{queueStatus.sent_today || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <p className="text-gray-600 text-sm">Failed Today</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{queueStatus.failed_today || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <p className="text-gray-600 text-sm">Remaining Today</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{queueStatus.remaining_today || 0}</p>
              </div>
            </div>

            {/* Rate Limiting Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">📊 Rate Limiting Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Daily Email Quota</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {queueStatus.sent_today || 0}/140
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(((queueStatus.sent_today || 0) / 140) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-gray-600">Rate Limit</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      1 email every {Math.round((queueStatus.rate_limit_seconds || 540) / 60)} min
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-gray-600">Next Send Time</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {queueStatus.next_send_time 
                        ? new Date(queueStatus.next_send_time).toLocaleTimeString() 
                        : 'Ready now'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Queue Control Panel */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🎮 Queue Control</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Unsent Emails</p>
                  <p className="text-3xl font-bold text-blue-600">{(queueStatus.pending || 0) + (queueStatus.retry || 0)}</p>
                  <p className="text-xs text-gray-500 mt-1">Pending: {queueStatus.pending || 0} | Retry: {queueStatus.retry || 0}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Sent vs Failed</p>
                  <div className="flex gap-2">
                    <div>
                      <p className="text-xl font-bold text-green-600">{queueStatus.sent_today || 0}</p>
                      <p className="text-xs text-gray-500">Sent</p>
                    </div>
                    <div className="text-gray-300">|</div>
                    <div>
                      <p className="text-xl font-bold text-red-600">{queueStatus.failed_today || 0}</p>
                      <p className="text-xs text-gray-500">Failed</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 flex flex-col justify-center">
                  <button
                    onClick={() => {
                      if (remainingEmails.length === 0) {
                        loadRemainingEmails()
                      }
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm mb-2"
                  >
                    📋 View Remaining ({remainingEmails.length})
                  </button>
                  {remainingEmails.length > 0 && (
                    <button
                      onClick={clearAllRemainingEmails}
                      disabled={clearingQueue}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm disabled:opacity-50"
                    >
                      {clearingQueue ? 'Clearing...' : `🗑️ Clear All (${remainingEmails.length})`}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Pending Emails List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">📧 Pending Emails ({pendingEmails.length})</h3>
                <button
                  onClick={loadPendingEmails}
                  disabled={loadingPendingEmails}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  <RefreshCw size={14} className={loadingPendingEmails ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
              {loadingPendingEmails ? (
                <div className="p-6 text-center text-gray-500">
                  <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
                  Loading pending emails...
                </div>
              ) : pendingEmails.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>✨ No pending emails in queue</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Recipient</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pendingEmails.map((email) => (
                        <tr key={email.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm text-gray-900 truncate">{email.to}</td>
                          <td className="px-6 py-3 text-sm text-gray-700 truncate">{email.subject}</td>
                          <td className="px-6 py-3 text-sm">
                            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {email.email_type}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              email.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {email.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">
                            {new Date(email.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <button
                              onClick={() => setSelectedEmail(email)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* All Remaining Emails for Today */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">📋 All Remaining Emails Today ({remainingEmails.length})</h3>
                <div className="flex gap-2">
                  <button
                    onClick={loadRemainingEmails}
                    disabled={loadingRemainingEmails}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={loadingRemainingEmails ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                  {remainingEmails.length > 0 && (
                    <button
                      onClick={clearAllRemainingEmails}
                      disabled={clearingQueue}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Clear All ({remainingEmails.length})
                    </button>
                  )}
                </div>
              </div>
              {loadingRemainingEmails ? (
                <div className="p-6 text-center text-gray-500">
                  <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
                  Loading remaining emails...
                </div>
              ) : remainingEmails.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>✅ No remaining emails for today</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Recipient</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Retries</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {remainingEmails.map((email) => (
                        <tr key={email.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm text-gray-900 truncate">{email.to}</td>
                          <td className="px-6 py-3 text-sm text-gray-700 truncate">{email.subject}</td>
                          <td className="px-6 py-3 text-sm">
                            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {email.email_type}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              email.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : email.status === 'retry'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {email.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">
                            {email.retry_count > 0 ? (
                              <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-orange-50 text-orange-700">
                                {email.retry_count}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600 text-xs">
                            {new Date(email.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <button
                              onClick={() => setSelectedEmail(email)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* SMTP Status */}
            <div className={`rounded-lg border p-6 ${
              queueStatus.smtp_enabled
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <h3 className="font-semibold mb-2">
                {queueStatus.smtp_enabled ? '✅ SMTP Enabled' : '⚠️ SMTP Disabled'}
              </h3>
              <p className={queueStatus.smtp_enabled ? 'text-green-800' : 'text-yellow-800'}>
                {queueStatus.smtp_enabled
                  ? 'Gmail SMTP is configured and emails are being sent'
                  : 'SMTP is currently disabled. Configure Gmail credentials to enable email sending'}
              </p>
            </div>
          </div>
        )}

        {/* Email Details Modal */}
        {selectedEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Email Details</h3>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Recipient</p>
                  <p className="text-sm text-gray-900 mt-1 break-all">{selectedEmail.to}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Subject</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedEmail.subject}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Type</p>
                    <p className="text-sm text-gray-900 mt-1">{selectedEmail.email_type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Status</p>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        selectedEmail.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {selectedEmail.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Created</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedEmail.created_at).toLocaleString()}
                  </p>
                </div>

                {selectedEmail.retry_count > 0 && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ This email has been retried <strong>{selectedEmail.retry_count}</strong> time(s)
                    </p>
                  </div>
                )}

                {selectedEmail.error && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-red-800 uppercase mb-1">Last Error</p>
                    <p className="text-sm text-red-700 break-words">{selectedEmail.error}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={cancelPendingEmail}
                  disabled={cancellingEmail}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancellingEmail ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Cancel Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminEmailPreview
