import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { parseTypeformJSON } from '@/lib/questionnaire/parser'
import { validateSubdomain, sanitizeSubdomain } from '@/lib/questionnaire/subdomain'

export const dynamic = 'force-dynamic'

// GET /api/questionnaires - List all active questionnaires
export async function GET(request: NextRequest) {
  try {
    const questionnaires = await prisma.questionnaire.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        subdomain: true,
        title: true,
        lawFirmName: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ questionnaires })
  } catch (error) {
    console.error('Error fetching questionnaires:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questionnaires' },
      { status: 500 }
    )
  }
}

// POST /api/questionnaires - Create new questionnaire
export async function POST(request: NextRequest) {
  try {
    // Optional: Add API key authentication here
    // const apiKey = request.headers.get('x-api-key')
    // if (apiKey !== process.env.ADMIN_API_KEY) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()

    // Extract required fields
    const {
      subdomain,
      lawFirmEmail,
      lawFirmName,
      typeformJSON,
      branding,
      title,
      description,
    } = body

    // Validate required fields
    if (!subdomain || !lawFirmEmail || !lawFirmName) {
      return NextResponse.json(
        {
          error: 'Missing required fields: subdomain, lawFirmEmail, lawFirmName',
        },
        { status: 400 }
      )
    }

    // Sanitize and validate subdomain
    const sanitizedSubdomain = sanitizeSubdomain(subdomain)
    if (!validateSubdomain(sanitizedSubdomain)) {
      return NextResponse.json(
        { error: 'Invalid subdomain format' },
        { status: 400 }
      )
    }

    // Check if subdomain already exists
    const existing = await prisma.questionnaire.findUnique({
      where: { subdomain: sanitizedSubdomain },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Subdomain already exists' },
        { status: 409 }
      )
    }

    // Parse Typeform JSON if provided
    let config
    if (typeformJSON) {
      config = parseTypeformJSON(typeformJSON)
    } else {
      // Create minimal config if no JSON provided
      config = {
        title: title || 'Untitled Questionnaire',
        description: description,
        fields: [],
        settings: {},
      }
    }

    // Create questionnaire
    const questionnaire = await prisma.questionnaire.create({
      data: {
        subdomain: sanitizedSubdomain,
        title: config.title || title || lawFirmName + ' Intake',
        description: description || config.description,
        config: config as any,
        lawFirmEmail,
        lawFirmName,
        branding: branding || {},
        isActive: true,
      },
    })

    return NextResponse.json(
      {
        questionnaire,
        message: `Questionnaire created! Access it at: ${sanitizedSubdomain}.workchat.law`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating questionnaire:', error)
    return NextResponse.json(
      { error: 'Failed to create questionnaire' },
      { status: 500 }
    )
  }
}
