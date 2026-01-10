'use client'

import { useState, FormEvent } from 'react'

interface FormData {
  firmName: string
  email: string
}

interface FormErrors {
  firmName?: string
  email?: string
}

export default function SignupForm() {
  const [formData, setFormData] = useState<FormData>({
    firmName: '',
    email: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.firmName.trim()) {
      newErrors.firmName = 'Firm name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          firmName: '',
          email: '',
        })
        // Track conversion event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'form_submission', {
            event_category: 'engagement',
            event_label: 'early_access_request',
          })
        }
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="signup" className="relative py-20 md:py-28 bg-gradient-to-br from-white via-primary-50/20 to-blue-50/30 overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-20"></div>
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Get{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Early Access
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-primary-400 mx-auto rounded-full mb-6"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're onboarding plaintiff employment firms now. Enter your information and we'll set up your branded WorkChat link.
          </p>
        </div>

        {submitStatus === 'success' && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-lg">
            <p className="text-green-800 font-semibold text-lg flex items-center">
              <span className="text-2xl mr-3">✓</span>
              Thank you! We've received your request. We'll be in touch soon to set up your WorkChat link.
            </p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 rounded-xl shadow-lg">
            <p className="text-red-800 font-semibold text-lg flex items-center">
              <span className="text-2xl mr-3">×</span>
              Something went wrong. Please try again or contact us directly at contact@workchat.law
            </p>
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-premium-lg border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="firmName" className="block text-sm font-semibold text-gray-900 mb-2">
                Firm name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firmName"
                value={formData.firmName}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, firmName: e.target.value }))
                  if (errors.firmName) {
                    setErrors(prev => ({ ...prev, firmName: undefined }))
                  }
                }}
                className={`w-full px-5 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 text-gray-900 font-medium ${
                  errors.firmName ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                required
              />
              {errors.firmName && (
                <p className="mt-1 text-sm text-red-600">{errors.firmName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }))
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: undefined }))
                  }
                }}
                className={`w-full px-5 py-3.5 border-2 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 text-gray-900 font-medium ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-5 px-8 rounded-xl text-lg transition-all duration-300 shadow-premium hover:shadow-premium-lg transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Request Early Access'
                )}
              </span>
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
