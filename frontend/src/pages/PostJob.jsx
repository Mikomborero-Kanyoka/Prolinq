import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { ChevronLeft, Eye, Save, CheckCircle, AlertCircle, Plus, X, HelpCircle } from 'lucide-react'

const PostJob = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
    defaultValues: {
      title: '',
      job_type: '',
      category: '',
      description: '',
      location: '',
      experience_level: 'mid',
      salary_min: '',
      salary_max: '',
      salary_period: 'year',
      salary_currency: 'USD',
      is_remote: false,
      is_hybrid: false,
      required_skills: [],
      years_of_experience: '',
      education_level: '',
      experience_required: '',
      qualifications: '',
      responsibilities: '',
      benefits: '',
      application_deadline: '',
      number_of_positions: '1',
      application_method: 'prolinq',
      external_url: ''
    }
  })

  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [formCompletion, setFormCompletion] = useState(0)

  const formValues = watch()

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft()
    }, 30000) // Auto-save every 30 seconds

    return () => clearTimeout(timer)
  }, [formValues, skills])

  // Calculate form completion percentage
  useEffect(() => {
    calculateFormCompletion()
  }, [formValues, skills])

  const calculateFormCompletion = () => {
    const requiredFields = [
      'title',
      'job_type',
      'category',
      'description',
      'location',
      'experience_level'
    ]
    
    const completedFields = requiredFields.filter(
      field => formValues[field] && formValues[field].toString().trim() !== ''
    ).length

    const completion = Math.round((completedFields / requiredFields.length) * 100)
    setFormCompletion(completion)
  }

  const saveDraft = async () => {
    try {
      setIsSaving(true)
      // In a real app, you'd save this to the backend
      localStorage.setItem('jobDraft', JSON.stringify({
        ...formValues,
        skills,
        savedAt: new Date().toISOString()
      }))
      setLastSaved(new Date())
      toast.success('Draft saved automatically')
    } catch (error) {
      console.error('Error saving draft:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const newSkill = skillInput.trim()
      if (newSkill && !skills.includes(newSkill)) {
        setSkills([...skills, newSkill])
        setSkillInput('')
      }
    }
  }

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  // Check user role
  if (user && user.primary_role === 'talent') {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Only employers and clients can post jobs. If you're looking for work, please browse available jobs as a freelancer.
            </p>
            <button
              onClick={() => navigate('/jobs')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Browse Jobs
            </button>
          </div>
        </div>
      </div>
    )
  }

  const onSubmit = async (data) => {
    try {
      const jobData = {
        title: data.title,
        description: data.description,
        category: data.category,
        job_type: data.job_type,
        location: data.location,
        skills_required: skills.join(',') || null,
        experience_required: data.experience_required || null,
        qualifications: data.qualifications || null,
        responsibilities: data.responsibilities || null,
        benefits: data.benefits || null,
        experience_level: data.experience_level,
        education_level: data.education_level || null,
        budget_min: data.salary_min ? parseFloat(data.salary_min) : null,
        budget_max: data.salary_max ? parseFloat(data.salary_max) : null,
        budget_currency: data.salary_currency || 'USD',
        is_remote: data.is_remote === true || false,
        is_hybrid: data.is_hybrid === true || false,
        deadline: data.application_deadline || null,
        years_of_experience: data.years_of_experience ? parseInt(data.years_of_experience) : null,
        positions: parseInt(data.number_of_positions) || 1,
        application_method: data.application_method,
        external_url: data.application_method === 'external' ? data.external_url : null
      }
      
      const response = await api.post('/jobs/', jobData)
      toast.success('Job posted successfully!')
      localStorage.removeItem('jobDraft')
      navigate(`/jobs/${response.data.id}`)
    } catch (error) {
      console.error('Job creation error:', error.response?.data)
      let errorMsg = 'Failed to post job'
      
      if (Array.isArray(error.response?.data?.detail)) {
        errorMsg = error.response.data.detail
          .map(err => `${err.loc?.[1]}: ${err.msg}`)
          .join(', ')
      } else if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail
      }
      
      toast.error(errorMsg)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 pt-28 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6 transition"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>

        {/* Progress Indicator */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">Form Completion</p>
            <p className="text-sm font-bold text-blue-600">{formCompletion}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${formCompletion}%` }}
            />
          </div>
          {lastSaved && (
            <p className="text-xs text-gray-500 mt-3">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Section 1: Basic Information */}
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 pb-4 border-b-2 border-blue-500 mb-6">
                Basic Information
              </h2>

              {/* Job Title */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-500">
                    {formValues.title?.length || 0}/100
                  </span>
                </div>
                <input
                  {...register('title', { 
                    required: 'Job title is required',
                    maxLength: { value: 100, message: 'Maximum 100 characters' }
                  })}
                  type="text"
                  maxLength={100}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Senior React Developer"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Job Type & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('job_type', { required: 'Job type is required' })}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.job_type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select job type</option>
                    <option value="full_time">💼 Full Time</option>
                    <option value="part_time">⏰ Part Time</option>
                    <option value="contract">📋 Contract</option>
                    <option value="freelance">🎯 Freelance</option>
                    <option value="gig">⚡ Gig</option>
                  </select>
                  {errors.job_type && (
                    <p className="mt-2 text-sm text-red-600">{errors.job_type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select category</option>
                    <option value="Web Development">💻 Web Development</option>
                    <option value="Mobile Development">📱 Mobile Development</option>
                    <option value="Design">🎨 Design</option>
                    <option value="Writing">✍️ Writing</option>
                    <option value="Marketing">📈 Marketing</option>
                    <option value="Data Science">📊 Data Science</option>
                    <option value="Other">📦 Other</option>
                  </select>
                  {errors.category && (
                    <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Job Details */}
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 pb-4 border-b-2 border-blue-500 mb-6">
                Job Details
              </h2>

              {/* Description */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-500">
                    {formValues.description?.length || 0}/5000
                  </span>
                </div>
                <textarea
                  {...register('description', { 
                    required: 'Description is required',
                    minLength: { value: 20, message: 'Minimum 20 characters' },
                    maxLength: { value: 5000, message: 'Maximum 5000 characters' }
                  })}
                  rows={6}
                  maxLength={5000}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe the job responsibilities, requirements, and what you're looking for..."
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Location & Remote/Hybrid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('location', { required: 'Location is required' })}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select location</option>
                    <option value="Harare">Harare</option>
                    <option value="Bulawayo">Bulawayo</option>
                    <option value="Gweru">Gweru</option>
                    <option value="Mutare">Mutare</option>
                    <option value="Kwekwe">Kwekwe</option>
                    <option value="Kadoma">Kadoma</option>
                    <option value="Masvingo">Masvingo</option>
                    <option value="Chitungwiza">Chitungwiza</option>
                  </select>
                  {errors.location && (
                    <p className="mt-2 text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>

                <div className="space-y-3 pt-6">
                  <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      {...register('is_remote')}
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                    />
                    <span className="ml-3 text-sm text-gray-700">Remote available</span>
                  </label>
                  <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      {...register('is_hybrid')}
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                    />
                    <span className="ml-3 text-sm text-gray-700">Hybrid</span>
                  </label>
                </div>
              </div>

              {/* Experience Level */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('experience_level')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="entry">🌱 Entry Level</option>
                  <option value="mid">📈 Mid Level</option>
                  <option value="senior">⭐ Senior</option>
                  <option value="lead">👑 Lead</option>
                </select>
              </div>

              {/* Salary Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Min
                  </label>
                  <input
                    {...register('salary_min')}
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Max
                  </label>
                  <input
                    {...register('salary_max')}
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period
                  </label>
                  <select
                    {...register('salary_period')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="hour">Per Hour</option>
                    <option value="month">Per Month</option>
                    <option value="year">Per Year</option>
                    <option value="project">Per Project</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    {...register('salary_currency')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="USD">USD</option>
                    <option value="ZWL">ZWL</option>
                    <option value="GBP">GBP</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Requirements */}
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 pb-4 border-b-2 border-blue-500 mb-6">
                Requirements
              </h2>

              {/* Required Skills */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Add skill and press Enter..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newSkill = skillInput.trim()
                      if (newSkill && !skills.includes(newSkill)) {
                        setSkills([...skills, newSkill])
                        setSkillInput('')
                      }
                    }}
                    className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border border-blue-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Required */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Experience Required
                  </label>
                  <span className="text-xs text-gray-500">
                    {formValues.experience_required?.length || 0}/2000
                  </span>
                </div>
                <textarea
                  {...register('experience_required')}
                  rows={4}
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder="Describe the experience requirements for this role (e.g., 3+ years of web development experience)..."
                />
              </div>

              {/* Qualifications */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Qualifications
                  </label>
                  <span className="text-xs text-gray-500">
                    {formValues.qualifications?.length || 0}/2000
                  </span>
                </div>
                <textarea
                  {...register('qualifications')}
                  rows={4}
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder="List required qualifications, certifications, or education (e.g., Bachelor's degree in Computer Science, AWS certification)..."
                />
              </div>

              {/* Responsibilities */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Responsibilities
                  </label>
                  <span className="text-xs text-gray-500">
                    {formValues.responsibilities?.length || 0}/2000
                  </span>
                </div>
                <textarea
                  {...register('responsibilities')}
                  rows={4}
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder="List key responsibilities and duties (e.g., Develop responsive web applications, Collaborate with design team)..."
                />
              </div>

              {/* Benefits */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Benefits
                  </label>
                  <span className="text-xs text-gray-500">
                    {formValues.benefits?.length || 0}/2000
                  </span>
                </div>
                <textarea
                  {...register('benefits')}
                  rows={4}
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  placeholder="Describe benefits, perks, and compensation details (e.g., Health insurance, Remote work options, Professional development budget)..."
                />
              </div>

              {/* Years of Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('years_of_experience')}
                    type="number"
                    min="0"
                    max="60"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="e.g., 5"
                  />
                </div>

                {/* Education Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Education Level
                  </label>
                  <select
                    {...register('education_level')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Not specified</option>
                    <option value="high_school">🎓 High School</option>
                    <option value="associate">📚 Associate Degree</option>
                    <option value="bachelor">🎓 Bachelor's Degree</option>
                    <option value="master">👨‍🎓 Master's Degree</option>
                    <option value="phd">📖 PhD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Application Settings */}
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 pb-4 border-b-2 border-blue-500 mb-6">
                Application Settings
              </h2>

              {/* Application Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline
                  </label>
                  <input
                    {...register('application_deadline')}
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Number of Positions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Positions
                  </label>
                  <input
                    {...register('number_of_positions')}
                    type="number"
                    min="1"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="1"
                  />
                </div>
              </div>

              {/* How to Apply */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How to Apply
                </label>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer hover:bg-gray-50 p-3 rounded border border-transparent">
                    <input
                      {...register('application_method')}
                      type="radio"
                      value="prolinq"
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <span className="ml-3 text-sm text-gray-700">Through ProLinq platform</span>
                  </label>
                  <label className="flex items-center cursor-pointer hover:bg-gray-50 p-3 rounded border border-transparent">
                    <input
                      {...register('application_method')}
                      type="radio"
                      value="external"
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <span className="ml-3 text-sm text-gray-700">External URL</span>
                  </label>

                  {formValues.application_method === 'external' && (
                    <div className="mt-3 pl-8">
                      <input
                        {...register('external_url')}
                        type="url"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="https://example.com/apply"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-8 bg-gray-50 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </button>

              <button
                type="button"
                onClick={saveDraft}
                disabled={isSaving}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition disabled:opacity-50"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSaving ? 'Saving...' : 'Save as Draft'}
              </button>

              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
              >
                <Eye className="w-5 h-5 mr-2" />
                Preview
              </button>

              <button
                type="submit"
                className="flex items-center justify-center flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Post Job
              </button>
            </div>
          </form>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Job Preview</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{formValues.title || 'Job Title'}</h4>
                <p className="text-gray-600 mt-2">{formValues.location}</p>
                {(formValues.is_remote || formValues.is_hybrid) && (
                  <div className="flex gap-2 mt-2">
                    {formValues.is_remote && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                        Remote
                      </span>
                    )}
                    {formValues.is_hybrid && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                        Hybrid
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Description</h5>
                <p className="text-gray-700 whitespace-pre-wrap">{formValues.description}</p>
              </div>

              {skills.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Required Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formValues.experience_required && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Experience Required</h5>
                  <p className="text-gray-700 whitespace-pre-wrap">{formValues.experience_required}</p>
                </div>
              )}

              {formValues.qualifications && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Qualifications</h5>
                  <p className="text-gray-700 whitespace-pre-wrap">{formValues.qualifications}</p>
                </div>
              )}

              {formValues.responsibilities && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Responsibilities</h5>
                  <p className="text-gray-700 whitespace-pre-wrap">{formValues.responsibilities}</p>
                </div>
              )}

              {formValues.benefits && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Benefits</h5>
                  <p className="text-gray-700 whitespace-pre-wrap">{formValues.benefits}</p>
                </div>
              )}

              {(formValues.salary_min || formValues.salary_max) && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Salary Range</h5>
                  <p className="text-gray-700">
                    {formValues.salary_currency} {formValues.salary_min} - {formValues.salary_max} / {formValues.salary_period}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostJob
