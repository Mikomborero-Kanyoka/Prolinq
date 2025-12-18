import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Check, X, Clock } from 'lucide-react'

const JobApplicantsPanel = ({ job, onApplicationStatusChange }) => {
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedApplicant, setExpandedApplicant] = useState(null)

  useEffect(() => {
    if (job?.id) fetchApplicants()
  }, [job?.id])

  const fetchApplicants = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/applications/job/${job.id}`)
      setApplicants(response.data)
    } catch (error) {
      toast.error('Failed to load applicants')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptApplication = async (applicationId) => {
    try {
      await api.put(`/applications/${applicationId}`, { status: 'accepted' })
      toast.success('Application accepted!')
      fetchApplicants()
      onApplicationStatusChange?.()
    } catch (error) {
      toast.error('Failed to accept application')
    }
  }

  const handleRejectApplication = async (applicationId) => {
    try {
      await api.put(`/applications/${applicationId}`, { status: 'rejected' })
      toast.success('Application rejected')
      fetchApplicants()
    } catch (error) {
      toast.error('Failed to reject application')
    }
  }

  const pending = applicants.filter(a => a.status === 'pending')
  const accepted = applicants.filter(a => a.status === 'accepted')
  const rejected = applicants.filter(a => a.status === 'rejected')

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-xl font-bold mb-6">Applicants</h3>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : applicants.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No applicants</div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <Section
              title="Pending"
              count={pending.length}
              items={pending}
              expandedApplicant={expandedApplicant}
              setExpandedApplicant={setExpandedApplicant}
              onAccept={handleAcceptApplication}
              onReject={handleRejectApplication}
            />
          )}
          {accepted.length > 0 && (
            <Section
              title="Accepted"
              count={accepted.length}
              items={accepted}
              expandedApplicant={expandedApplicant}
              setExpandedApplicant={setExpandedApplicant}
              readonly
            />
          )}
          {rejected.length > 0 && (
            <Section
              title="Rejected"
              count={rejected.length}
              items={rejected}
              expandedApplicant={expandedApplicant}
              setExpandedApplicant={setExpandedApplicant}
              readonly
            />
          )}
        </div>
      )}
    </div>
  )
}

const Section = ({
  title,
  count,
  items,
  expandedApplicant,
  setExpandedApplicant,
  onAccept,
  onReject,
  readonly
}) => {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
        {title} ({count})
      </h4>
      <div className="space-y-2">
        {items.map(app => (
          <Card
            key={app.id}
            app={app}
            expanded={expandedApplicant === app.id}
            setExpanded={() =>
              setExpandedApplicant(expandedApplicant === app.id ? null : app.id)
            }
            onAccept={onAccept}
            onReject={onReject}
            readonly={readonly}
          />
        ))}
      </div>
    </div>
  )
}

const Card = ({ app, expanded, setExpanded, onAccept, onReject, readonly }) => {
  const applicant = app.applicant
  if (!applicant) return null

  return (
    <div
      className="border border-gray-200 rounded p-3 hover:shadow-md transition cursor-pointer"
      onClick={setExpanded}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          {applicant.profile_photo && (
            <img
              src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://prolinq-production.up.railway.app'}${applicant.profile_photo}`}
              alt={applicant.full_name}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) =>
                (e.target.src = `https://ui-avatars.com/api/?name=${applicant.full_name}`)
              }
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900">
              {applicant.full_name}
            </p>
            {applicant.location && (
              <p className="text-xs text-gray-600">{applicant.location}</p>
            )}
          </div>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
            app.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : app.status === 'accepted'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {app.status}
        </span>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-sm">
          {applicant.skills && (
            <p>
              <b>Skills:</b> {applicant.skills}
            </p>
          )}
          {applicant.hourly_rate && (
            <p>
              <b>Rate:</b> ${applicant.hourly_rate}/hr
            </p>
          )}
          {app.cover_letter && (
            <p>
              <b>Letter:</b> {app.cover_letter}
            </p>
          )}
          {app.proposed_price && (
            <p>
              <b>Price:</b> ${app.proposed_price}
            </p>
          )}
          {!readonly && app.status === 'pending' && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onAccept(app.id)
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-xs font-medium"
              >
                Accept
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onReject(app.id)
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-xs font-medium"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default JobApplicantsPanel
