'use client'

import { useState, useEffect } from 'react'

interface BrandedHeaderProps {
  questionnaire: {
    lawFirmName: string
    branding?: {
      logoUrl?: string
      primaryColor?: string
      secondaryColor?: string
      firmName?: string
    }
  }
}

export default function BrandedHeader({ questionnaire }: BrandedHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const branding = questionnaire.branding || {}
  const firmName = branding.firmName || questionnaire.lawFirmName
  const primaryColor = branding.primaryColor || '#4f56f5' // Default primary color

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b transition-all duration-300 ${
        isScrolled ? 'shadow-md border-gray-200' : 'border-gray-100'
      }`}
      style={{
        borderBottomColor: isScrolled ? undefined : primaryColor + '20',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex items-center gap-3 sm:gap-4">
          {branding.logoUrl && (
            <img
              src={branding.logoUrl}
              alt={firmName}
              className="h-8 sm:h-10 w-auto transition-all duration-300"
            />
          )}
          <h1
            className="text-lg sm:text-xl font-bold transition-colors duration-300"
            style={{ color: primaryColor }}
          >
            {firmName}
          </h1>
        </div>
      </div>
    </header>
  )
}
