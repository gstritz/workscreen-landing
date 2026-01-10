import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { extractSubdomain } from '@/lib/questionnaire/subdomain'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const hostname = request.headers.get('host') || ''
    const subdomain = extractSubdomain(hostname)

    // Also check query parameter as fallback
    const querySubdomain = request.nextUrl.searchParams.get('subdomain')

    const targetSubdomain = subdomain || querySubdomain

    if (!targetSubdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 }
      )
    }

    const questionnaire = await prisma.questionnaire.findUnique({
      where: {
        subdomain: targetSubdomain,
        isActive: true,
      },
    })

    if (!questionnaire) {
      return NextResponse.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ questionnaire })
  } catch (error) {
    console.error('Error fetching questionnaire by subdomain:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questionnaire' },
      { status: 500 }
    )
  }
}
