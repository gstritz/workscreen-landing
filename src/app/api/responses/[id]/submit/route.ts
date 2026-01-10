import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { Resend } from 'resend'
import { replaceFieldReferences } from '@/lib/questionnaire/parser'

export const dynamic = 'force-dynamic'

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(apiKey)
}

// POST /api/responses/[id]/submit - Submit completed response
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { answers } = body

    // Get response with questionnaire
    const response = await prisma.response.findUnique({
      where: { id: params.id },
      include: {
        questionnaire: true,
        files: true,
      },
    })

    if (!response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      )
    }

    if (response.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Response already submitted' },
        { status: 400 }
      )
    }

    // Update response with final answers and mark as completed
    const updatedResponse = await prisma.response.update({
      where: { id: params.id },
      data: {
        answers: answers || response.answers,
        status: 'COMPLETED',
        submittedAt: new Date(),
        metadata: {
          ...(response.metadata as any),
          completedAt: new Date().toISOString(),
        },
      },
    })

    // Send email to law firm
    try {
      await sendEmailToLawFirm(updatedResponse, response.questionnaire, response.files)
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Don't fail the request if email fails - response is already saved
    }

    return NextResponse.json({
      success: true,
      message: 'Response submitted successfully',
      responseId: updatedResponse.id,
    })
  } catch (error) {
    console.error('Error submitting response:', error)
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    )
  }
}

/**
 * Format and send email to law firm
 */
async function sendEmailToLawFirm(
  response: any,
  questionnaire: any,
  files: any[]
) {
  const resend = getResend()
  const answers = response.answers as Record<string, any>
  const config = questionnaire.config as any

  // Get respondent name (supports both full name and separate first/last)
  const fullName = answers['fullname'] || 
                   answers['fullName'] ||
                   answers['full_name'] ||
                   null
  
  const firstName = answers['01F5GPZ3HMGRHHB9ZHQ80C021F'] || 
                    answers['firstname'] || 
                    answers['firstName'] ||
                    null
  const lastName = answers['0b08c677-50f6-40c1-95e5-19b14fdfd9c2'] || 
                   answers['lastname'] || 
                   answers['lastName'] ||
                   null

  // Use full name if available, otherwise combine first and last
  const respondentName = fullName || 
                        (firstName && lastName ? `${firstName} ${lastName}`.trim() : firstName || lastName || 'Unknown')

  // Build email content
  let emailContent = `New Intake Submission Received\n\n`
  emailContent += `Questionnaire: ${questionnaire.title}\n`
  emailContent += `Submitted: ${new Date(response.submittedAt).toLocaleString()}\n`
  emailContent += `Session ID: ${response.sessionId}\n\n`
  emailContent += `--- RESPONDENT INFORMATION ---\n`

  // Format answers in readable format
  if (config.fields && Array.isArray(config.fields)) {
    config.fields.forEach((field: any) => {
      const answer = answers[field.ref] || answers[field.id]
      if (answer !== undefined && answer !== null && answer !== '') {
        let answerText = String(answer)
        
        // Handle arrays (multiple choice)
        if (Array.isArray(answer)) {
          answerText = answer.join(', ')
        }
        
        // Replace field references in question title
        const questionTitle = replaceFieldReferences(field.title || '', answers)
        
        emailContent += `${questionTitle}: ${answerText}\n`
      }
    })
  } else {
    // Fallback: just list all answers
    Object.entries(answers).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        emailContent += `${key}: ${value}\n`
      }
    })
  }

  // Add file attachments info
  if (files && files.length > 0) {
    emailContent += `\n--- ATTACHMENTS ---\n`
    files.forEach((file) => {
      emailContent += `${file.fileName}: ${file.fileUrl}\n`
    })
  }

  // Send email
  const emailFrom = process.env.EMAIL_FROM || 'noreply@workchat.law'
  
  await resend.emails.send({
    from: emailFrom,
    to: questionnaire.lawFirmEmail,
    subject: `New Intake Submission - ${questionnaire.title} - ${respondentName}`,
    text: emailContent,
  })
}
