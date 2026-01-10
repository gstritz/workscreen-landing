import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

// GET /api/questionnaires/[id] - Get questionnaire by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id
    const questionnaire = await prisma.questionnaire.findUnique({
      where: {
        id: id,
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
    console.error('Error fetching questionnaire:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questionnaire' },
      { status: 500 }
    )
  }
}

// PUT /api/questionnaires/[id] - Update questionnaire
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id
    const body = await request.json()

    // Check if questionnaire exists
    const existing = await prisma.questionnaire.findUnique({
      where: { id: id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (body.typeformJSON) {
      const { parseTypeformJSON } = await import('@/lib/questionnaire/parser')
      updateData.config = parseTypeformJSON(body.typeformJSON)
    }

    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.lawFirmEmail !== undefined) updateData.lawFirmEmail = body.lawFirmEmail
    if (body.lawFirmName !== undefined) updateData.lawFirmName = body.lawFirmName
    if (body.branding !== undefined) updateData.branding = body.branding
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    // Update questionnaire
    const questionnaire = await prisma.questionnaire.update({
      where: { id: id },
      data: updateData,
    })

    return NextResponse.json({ questionnaire })
  } catch (error) {
    console.error('Error updating questionnaire:', error)
    return NextResponse.json(
      { error: 'Failed to update questionnaire' },
      { status: 500 }
    )
  }
}
