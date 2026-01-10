import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export const dynamic = 'force-dynamic'

// GET /api/responses/[id] - Get response by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await prisma.response.findUnique({
      where: { id: params.id },
      include: {
        questionnaire: {
          select: {
            id: true,
            title: true,
            subdomain: true,
          },
        },
        files: true,
      },
    })

    if (!response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error fetching response:', error)
    return NextResponse.json(
      { error: 'Failed to fetch response' },
      { status: 500 }
    )
  }
}

// PUT /api/responses/[id] - Update response (auto-save)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { answers, metadata } = body

    // Check if response exists
    const existing = await prisma.response.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (answers !== undefined) {
      updateData.answers = answers
    }

    if (metadata !== undefined) {
      // Merge with existing metadata
      updateData.metadata = {
        ...(existing.metadata as any),
        ...metadata,
      }
    }

    // Update response
    const response = await prisma.response.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, response })
  } catch (error) {
    console.error('Error updating response:', error)
    return NextResponse.json(
      { error: 'Failed to update response' },
      { status: 500 }
    )
  }
}
