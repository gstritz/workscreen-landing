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
  const primaryColor = branding.primaryColor || '#4f56f5'
  const secondaryColor = branding.secondaryColor || '#8b5cf6'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Convert hex to RGB for CSS variables
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 79, g: 86, b: 245 }
  }

  const primaryRgb = hexToRgb(primaryColor)
  const secondaryRgb = hexToRgb(secondaryColor)

  return (
    <header
      className="sticky top-0 z-50 header-clean"
      style={{
        '--primary-r': primaryRgb.r,
        '--primary-g': primaryRgb.g,
        '--primary-b': primaryRgb.b,
        '--secondary-r': secondaryRgb.r,
        '--secondary-g': secondaryRgb.g,
        '--secondary-b': secondaryRgb.b,
      } as React.CSSProperties & {
        '--primary-r': number
        '--primary-g': number
        '--primary-b': number
        '--secondary-r': number
        '--secondary-g': number
        '--secondary-b': number
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="flex items-center justify-between gap-3 sm:gap-4 transition-all duration-300"
          style={{
            paddingTop: isScrolled ? '1rem' : '1.5rem',
            paddingBottom: isScrolled ? '1rem' : '1.5rem',
          }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            {branding.logoUrl && (
              <img
                src={branding.logoUrl}
                alt={firmName}
                className="h-8 sm:h-10 w-auto transition-all duration-300"
                style={{
                  filter: isScrolled ? 'opacity(0.9)' : 'opacity(1)',
                }}
              />
            )}
            <h1 
              className="text-lg sm:text-xl font-semibold transition-colors duration-300"
              style={{ 
                color: primaryColor,
                letterSpacing: '-0.01em'
              }}
            >
              {firmName}
            </h1>
          </div>
          
          {/* WorkChat Branding */}
          <div className="workchat-badge-clean">
            <span className="workchat-text-clean">Powered by</span>
            <span className="workchat-brand-clean">WorkChat</span>
          </div>
        </div>
      </div>
    </header>
  )
}
