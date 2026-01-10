import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// POST /api/responses - Create new response session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { questionnaireId } = body

    if (!questionnaireId) {
      return NextResponse.json(
        { error: 'questionnaireId is required' },
        { status: 400 }
      )
    }

    // Verify questionnaire exists and is active
    const questionnaire = await prisma.questionnaire.findUnique({
      where: {
        id: questionnaireId,
        isActive: true,
      },
    })

    if (!questionnaire) {
      return NextResponse.json(
        { error: 'Questionnaire not found or inactive' },
        { status: 404 }
      )
    }

    // Generate unique session ID
    const sessionId = randomUUID()

    // Get client metadata
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referrer = request.headers.get('referer') || null

    // Create response
    const response = await prisma.response.create({
      data: {
        questionnaireId,
        sessionId,
        answers: {},
        metadata: {
          ipAddress,
          userAgent,
          referrer,
          startedAt: new Date().toISOString(),
        },
        status: 'IN_PROGRESS',
      },
    })

    return NextResponse.json({
      responseId: response.id,
      sessionId: response.sessionId,
    })
  } catch (error) {
    console.error('Error creating response:', error)
    return NextResponse.json(
      { error: 'Failed to create response' },
      { status: 500 }
    )
  }
}
