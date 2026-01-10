'use client'

import { useEffect, useState } from 'react'

// Force dynamic rendering for subdomain detection
export const dynamic = 'force-dynamic'
export const runtime = 'edge'
import Hero from '@/components/Hero'
import Problem from '@/components/Problem'
import Solution from '@/components/Solution'
import HowItWorks from '@/components/HowItWorks'
import Screening from '@/components/Screening'
import Customization from '@/components/Customization'
import Pricing from '@/components/Pricing'
import SignupForm from '@/components/SignupForm'
import Footer from '@/components/Footer'
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

export default function Home() {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubdomain, setIsSubdomain] = useState(false)

  useEffect(() => {
    async function checkSubdomain() {
      try {
        // Get subdomain from current hostname
        const hostname = window.location.hostname
        const subdomain = hostname.split('.')[0]

        // Skip if on localhost or root domain
        if (hostname === 'localhost' || !hostname.includes('.')) {
          setLoading(false)
          return
        }

        // Check if this looks like a subdomain (not www)
        if (subdomain && subdomain !== 'www' && hostname.includes('workchat.law')) {
          setIsSubdomain(true)
          
          // Fetch questionnaire by subdomain
          const response = await fetch(`/api/questionnaires/by-subdomain?subdomain=${subdomain}`)
          
          if (response.ok) {
            const data = await response.json()
            if (data.questionnaire) {
              setQuestionnaire(data.questionnaire)
            } else {
              console.warn('No questionnaire in response:', data)
            }
          } else {
            const errorData = await response.json().catch(() => ({}))
            console.error('Failed to fetch questionnaire:', response.status, errorData)
          }
        } else {
          // Not a subdomain, show landing page
          setLoading(false)
        }
      } catch (err) {
        console.error('Error checking subdomain:', err)
      } finally {
        setLoading(false)
      }
    }

    checkSubdomain()
  }, [])

  // If loading subdomain check, show loading state
  if (loading && isSubdomain) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading questionnaire...</p>
        </div>
      </div>
    )
  }

  // If subdomain and questionnaire found, show questionnaire
  if (isSubdomain && questionnaire) {
    return (
      <QuestionnaireRenderer
        questionnaire={questionnaire}
      />
    )
  }

  // If subdomain but no questionnaire, show error
  if (isSubdomain && !questionnaire) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Questionnaire Not Found</h1>
          <p className="text-gray-600">The questionnaire you are looking for does not exist.</p>
        </div>
      </div>
    )
  }

  // Default: show landing page
  return (
    <main className="min-h-screen">
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <Screening />
      <Customization />
      <Pricing />
      <SignupForm />
      <Footer />
    </main>
  )
}
