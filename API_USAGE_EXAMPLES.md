# API Usage Examples for React Components

This guide shows how to use the API service in your React components.

## Table of Contents
1. [Authentication](#authentication)
2. [Jobs](#jobs)
3. [Applications](#applications)
4. [Messages](#messages)
5. [Profiles](#profiles)
6. [Notifications](#notifications)
7. [Job Completion](#job-completion)

---

## Authentication

### Register New User

```javascript
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

export function RegisterForm() {
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = {
      email: e.target.email.value,
      username: e.target.username.value,
      full_name: e.target.full_name.value,
      password: e.target.password.value
    }

    try {
      setLoading(true)
      await register(formData)
      // User is automatically logged in
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="username" type="text" placeholder="Username" required />
      <input name="full_name" type="text" placeholder="Full Name" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  )
}
```

### Login User

```javascript
import { useAuth } from '@/contexts/AuthContext'

export function LoginForm() {
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login({
        email: e.target.email.value,
        password: e.target.password.value
      })
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  )
}
```

### Get Current User

```javascript
import { useAuth } from '@/contexts/AuthContext'

export function Profile() {
  const { user } = useAuth()

  return (
    <div>
      <h1>{user?.full_name}</h1>
      <p>Email: {user?.email}</p>
      <p>Username: @{user?.username}</p>
    </div>
  )
}
```

---

## Jobs

### List All Jobs

```javascript
import { useEffect, useState } from 'react'
import { jobsAPI } from '@/services/api'

export function JobsList() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const response = await jobsAPI.list(0, 10)
      setJobs(response.data)
    } catch (error) {
      console.error('Failed to load jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading jobs...</div>

  return (
    <div>
      {jobs.map(job => (
        <div key={job.id} className="border p-4 mb-4">
          <h3>{job.title}</h3>
          <p>{job.description}</p>
          <p className="font-bold">${job.budget}</p>
          <p>Category: {job.category}</p>
        </div>
      ))}
    </div>
  )
}
```

### Create a Job (Authenticated)

```javascript
import { jobsAPI } from '@/services/api'
import toast from 'react-hot-toast'

export function PostJobForm() {
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const jobData = {
      title: e.target.title.value,
      description: e.target.description.value,
      budget: parseFloat(e.target.budget.value),
      category: e.target.category.value,
      skills_required: e.target.skills.value
    }

    try {
      const response = await jobsAPI.create(jobData)
      toast.success('Job posted successfully!')
      e.target.reset()
    } catch (error) {
      toast.error('Failed to post job')
      console.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Job Title" required />
      <textarea name="description" placeholder="Job Description" required />
      <input name="budget" type="number" placeholder="Budget" required />
      <input name="category" placeholder="Category" required />
      <input name="skills" placeholder="Skills Required" required />
      <button type="submit">Post Job</button>
    </form>
  )
}
```

### Update a Job

```javascript
import { jobsAPI } from '@/services/api'
import toast from 'react-hot-toast'

export function UpdateJob({ jobId, currentJob }) {
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await jobsAPI.update(jobId, {
        title: e.target.title.value,
        description: e.target.description.value,
        budget: parseFloat(e.target.budget.value),
        status: e.target.status.value
      })
      toast.success('Job updated!')
    } catch (error) {
      toast.error('Failed to update job')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" defaultValue={currentJob.title} />
      <textarea name="description" defaultValue={currentJob.description} />
      <input name="budget" type="number" defaultValue={currentJob.budget} />
      <select name="status" defaultValue={currentJob.status}>
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <button type="submit">Update</button>
    </form>
  )
}
```

### Get My Posted Jobs

```javascript
import { useEffect, useState } from 'react'
import { jobsAPI } from '@/services/api'

export function MyJobs() {
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    loadMyJobs()
  }, [])

  const loadMyJobs = async () => {
    try {
      const response = await jobsAPI.getMyJobs()
      setJobs(response.data)
    } catch (error) {
      console.error('Failed to load jobs:', error)
    }
  }

  return (
    <div>
      <h2>My Jobs</h2>
      {jobs.map(job => (
        <div key={job.id} className="border p-4 mb-4">
          <h3>{job.title}</h3>
          <p>Budget: ${job.budget}</p>
          <p>Status: {job.status}</p>
        </div>
      ))}
    </div>
  )
}
```

---

## Applications

### Apply for a Job

```javascript
import { applicationsAPI } from '@/services/api'
import toast from 'react-hot-toast'

export function ApplyForm({ jobId }) {
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await applicationsAPI.create({
        job_id: jobId,
        cover_letter: e.target.letter.value,
        proposed_price: parseFloat(e.target.price.value)
      })
      toast.success('Application submitted!')
      e.target.reset()
    } catch (error) {
      toast.error('Failed to submit application')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea 
        name="letter" 
        placeholder="Cover letter" 
        required 
      />
      <input 
        name="price" 
        type="number" 
        placeholder="Proposed price" 
        required 
      />
      <button type="submit">Apply</button>
    </form>
  )
}
```

### View Job Applications (For Job Creator)

```javascript
import { useEffect, useState } from 'react'
import { applicationsAPI } from '@/services/api'

export function JobApplications({ jobId }) {
  const [applications, setApplications] = useState([])

  useEffect(() => {
    loadApplications()
  }, [jobId])

  const loadApplications = async () => {
    try {
      const response = await applicationsAPI.getJobApplications(jobId)
      setApplications(response.data)
    } catch (error) {
      console.error('Failed to load applications:', error)
    }
  }

  const updateStatus = async (appId, status) => {
    try {
      await applicationsAPI.update(appId, { status })
      loadApplications()
    } catch (error) {
      console.error('Failed to update application:', error)
    }
  }

  return (
    <div>
      {applications.map(app => (
        <div key={app.id} className="border p-4 mb-4">
          <p>{app.cover_letter}</p>
          <p>Proposed: ${app.proposed_price}</p>
          <p>Status: {app.status}</p>
          <button onClick={() => updateStatus(app.id, 'accepted')}>
            Accept
          </button>
          <button onClick={() => updateStatus(app.id, 'rejected')}>
            Reject
          </button>
        </div>
      ))}
    </div>
  )
}
```

### My Applications

```javascript
import { useEffect, useState } from 'react'
import { applicationsAPI } from '@/services/api'

export function MyApplications() {
  const [applications, setApplications] = useState([])

  useEffect(() => {
    loadMyApplications()
  }, [])

  const loadMyApplications = async () => {
    try {
      const response = await applicationsAPI.getMyApplications()
      setApplications(response.data)
    } catch (error) {
      console.error('Failed to load applications:', error)
    }
  }

  return (
    <div>
      {applications.map(app => (
        <div key={app.id} className="border p-4 mb-4">
          <p>Job ID: {app.job_id}</p>
          <p>Proposed: ${app.proposed_price}</p>
          <p>Status: {app.status}</p>
        </div>
      ))}
    </div>
  )
}
```

---

## Messages

### Send a Message

```javascript
import { messagesAPI } from '@/services/api'
import toast from 'react-hot-toast'

export function SendMessage({ recipientId }) {
  const handleSend = async (e) => {
    e.preventDefault()
    
    try {
      await messagesAPI.send({
        receiver_id: recipientId,
        content: e.target.message.value
      })
      toast.success('Message sent!')
      e.target.reset()
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  return (
    <form onSubmit={handleSend}>
      <textarea 
        name="message" 
        placeholder="Type your message..." 
        required 
      />
      <button type="submit">Send</button>
    </form>
  )
}
```

### View Conversation

```javascript
import { useEffect, useState } from 'react'
import { messagesAPI } from '@/services/api'

export function Chat({ userId }) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    loadConversation()
  }, [userId])

  const loadConversation = async () => {
    try {
      const response = await messagesAPI.getConversation(userId)
      setMessages(response.data)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id} className="mb-2">
          <p className={msg.sender_id === userId ? 'text-left' : 'text-right'}>
            {msg.content}
          </p>
          <small>{new Date(msg.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  )
}
```

---

## Profiles

### View User Profile

```javascript
import { useEffect, useState } from 'react'
import { profilesAPI } from '@/services/api'

export function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      const response = await profilesAPI.get(userId)
      setUser(response.data)
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  if (!user) return <div>Loading...</div>

  return (
    <div>
      <h2>{user.full_name}</h2>
      <p>@{user.username}</p>
      <p>{user.bio}</p>
      <p>Skills: {user.skills}</p>
      <p>Hourly Rate: ${user.hourly_rate}/hr</p>
    </div>
  )
}
```

### Update My Profile

```javascript
import { profilesAPI } from '@/services/api'
import toast from 'react-hot-toast'

export function EditProfile() {
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await profilesAPI.update({
        full_name: e.target.full_name.value,
        bio: e.target.bio.value,
        skills: e.target.skills.value,
        hourly_rate: parseFloat(e.target.rate.value)
      })
      toast.success('Profile updated!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="full_name" placeholder="Full Name" />
      <textarea name="bio" placeholder="Bio" />
      <input name="skills" placeholder="Skills (comma separated)" />
      <input name="rate" type="number" placeholder="Hourly Rate" />
      <button type="submit">Save Changes</button>
    </form>
  )
}
```

---

## Notifications

### Get Notifications

```javascript
import { useEffect, useState } from 'react'
import { notificationsAPI } from '@/services/api'

export function NotificationsList() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.get()
      setNotifications(response.data.notifications)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  return (
    <div>
      {notifications.map(notif => (
        <div key={notif.id} className="border p-2 mb-2">
          <p>{notif.message}</p>
          <button onClick={() => markAsRead(notif.id)}>
            Mark as read
          </button>
        </div>
      ))}
    </div>
  )
}
```

---

## Job Completion

### Mark Job as Complete

```javascript
import { jobCompletionAPI } from '@/services/api'
import toast from 'react-hot-toast'

export function CompleteJob({ jobId }) {
  const handleComplete = async (e) => {
    e.preventDefault()

    try {
      await jobCompletionAPI.complete({
        job_id: jobId,
        completion_notes: e.target.notes.value,
        rating: parseInt(e.target.rating.value)
      })
      toast.success('Job marked as complete!')
    } catch (error) {
      toast.error('Failed to complete job')
    }
  }

  return (
    <form onSubmit={handleComplete}>
      <textarea 
        name="notes" 
        placeholder="Completion notes..." 
        required 
      />
      <select name="rating" required>
        <option value="">Rate this job</option>
        <option value="5">Excellent</option>
        <option value="4">Good</option>
        <option value="3">Average</option>
        <option value="2">Poor</option>
        <option value="1">Terrible</option>
      </select>
      <button type="submit">Complete Job</button>
    </form>
  )
}
```

### View Completed Jobs

```javascript
import { useEffect, useState } from 'react'
import { jobCompletionAPI } from '@/services/api'

export function CompletedJobs() {
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    loadCompleted()
  }, [])

  const loadCompleted = async () => {
    try {
      const response = await jobCompletionAPI.getMyCompleted()
      setJobs(response.data.completed_jobs)
    } catch (error) {
      console.error('Failed to load completed jobs:', error)
    }
  }

  return (
    <div>
      {jobs.map(job => (
        <div key={job.id} className="border p-4 mb-4">
          <h3>{job.title}</h3>
          <p>{job.completion_data?.completion_notes}</p>
          <p>Rating: {job.completion_data?.rating}/5</p>
        </div>
      ))}
    </div>
  )
}
```

---

## Error Handling Pattern

```javascript
import { useState } from 'react'
import toast from 'react-hot-toast'

export function Example() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      // API call here
    } catch (err) {
      const message = err.response?.data?.detail || 'An error occurred'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Loading...' : 'Click Me'}
      </button>
    </div>
  )
}
```

---

## Notes

- All API calls require authentication except: list jobs, get job detail, list users, get user profile
- Tokens are automatically added to all requests by the API service
- Use `try/catch` for error handling
- Show loading states for better UX
- Use `react-hot-toast` for notifications

## Next Steps

1. Copy these examples into your components
2. Adjust to match your UI/styling
3. Test with `http://localhost:8000/docs`
4. Start building your features!