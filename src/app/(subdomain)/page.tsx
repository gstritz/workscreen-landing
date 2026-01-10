'use client'

import { useEffect, useState } from 'react'
import QuestionnaireRenderer from '@/components/questionnaire/QuestionnaireRenderer'
import { QuestionnaireConfig, Branding } from '@/types/questionnaire'

// Force dynamic rendering - this page depends on subdomain which is only available at runtime
export const dynamic = 'force-dynamic'
export const dynamicParams = true

interface Questionnaire {
  id: string
  subdomain: string
  title: string
  description?: string
  config: QuestionnaireConfig
  lawFirmEmail: string
  lawFirmName: string
  branding?: Branding
  isActive: boolean
}

export default function SubdomainQuestionnairePage() {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchQuestionnaire() {
      try {
        // Get subdomain from current hostname
        const hostname = window.location.hostname
        const subdomain = hostname.split('.')[0]

        // Skip if on localhost or root domain
        if (hostname === 'localhost' || !hostname.includes('.')) {
          setError('Invalid subdomain')
          setLoading(false)
          return
        }

        // Fetch questionnaire by subdomain
        const response = await fetch(`/api/questionnaires/by-subdomain?subdomain=${subdomain}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Questionnaire not found')
          } else {
            setError('Failed to load questionnaire')
          }
          setLoading(false)
          return
        }

        const data = await response.json()
        setQuestionnaire(data.questionnaire)
      } catch (err) {
        console.error('Error fetching questionnaire:', err)
        setError('Failed to load questionnaire')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestionnaire()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading questionnaire...</p>
        </div>
      </div>
    )
  }

  if (error || !questionnaire) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Questionnaire Not Found</h1>
          <p className="text-gray-600">{error || 'The questionnaire you are looking for does not exist.'}</p>
        </div>
      </div>
    )
  }

  return (
    <QuestionnaireRenderer
      questionnaire={questionnaire}
    />
  )
}
