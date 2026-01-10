'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import QuestionnaireRenderer from '@/components/questionnaire/QuestionnaireRenderer'
import { QuestionnaireConfig, Branding } from '@/types/questionnaire'

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

export default function QuestionnaireByIdPage() {
  const params = useParams()
  const questionnaireId = (params?.id as string) || ''
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchQuestionnaire() {
      try {
        // Try by ID first
        let response = await fetch(`/api/questionnaires/${questionnaireId}`)
        
        // If that fails, try to get by subdomain (if we can determine it)
        if (!response.ok) {
          // For joneslaw, try subdomain route as fallback
          if (questionnaireId === 'b057c878-4418-4843-b6a3-1d2a60a3b2aa') {
            response = await fetch('/api/questionnaires/by-subdomain?subdomain=joneslaw')
          }
        }
        
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

    if (questionnaireId) {
      fetchQuestionnaire()
    }
  }, [questionnaireId])

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
