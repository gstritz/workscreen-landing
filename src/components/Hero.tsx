'use client'

import { useState, FormEvent } from 'react'

export default function Hero() {
  const [email, setEmail] = useState('')
  const [firmName, setFirmName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !firmName.trim()) {
      setSubmitStatus('error')
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
        body: JSON.stringify({
          email,
          firmName,
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setEmail('')
        setFirmName('')
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
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-24 md:py-32 lg:py-40">
      {/* Decorative background elements */}
      <div className="absolute inset-0 gradient-mesh opacity-50"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">
            Stop Screening Employment Cases{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              Manually
            </span>
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            WorkChat filters potential clients before they reach your inbox. You get a branded intake link that qualifies inquiries — so you only spend time on cases you can actually take.
          </p>
          <div className="animate-slide-up max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={firmName}
                  onChange={(e) => {
                    setFirmName(e.target.value)
                    if (submitStatus === 'error') setSubmitStatus('idle')
                  }}
                  placeholder="Firm name"
                  className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-gray-900 font-medium"
                  required
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (submitStatus === 'error') setSubmitStatus('idle')
                  }}
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-gray-900 font-medium"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl shadow-premium hover:shadow-premium-lg transform hover:scale-105 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10">
                  {isSubmitting ? 'Submitting...' : 'Get Early Access'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </form>
            {submitStatus === 'success' && (
              <p className="mt-4 text-green-600 font-semibold">Thanks! We'll be in touch soon.</p>
            )}
            {submitStatus === 'error' && (
              <p className="mt-4 text-red-600 font-semibold">Please enter a valid firm name and email address.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
