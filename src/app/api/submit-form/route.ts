import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface FormData {
  firmName: string
  contactName: string
  email: string
  states: string[]
  caseTypes: string[]
  otherCaseType: string
}

// Simple rate limiting - store in memory (for production, use Redis or similar)
const submissions = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const MAX_SUBMISSIONS = 5 // Max 5 submissions per hour per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const userSubmissions = submissions.get(ip) || []
  
  // Remove old submissions outside the window
  const recentSubmissions = userSubmissions.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  )
  
  if (recentSubmissions.length >= MAX_SUBMISSIONS) {
    return false
  }
  
  recentSubmissions.push(now)
  submissions.set(ip, recentSubmissions)
  return true
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIP || 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body: FormData = await request.json()

    // Validate email (always required)
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate firm name (required)
    if (!body.firmName || !body.firmName.trim()) {
      return NextResponse.json(
        { error: 'Firm name is required' },
        { status: 400 }
      )
    }

    // Format email content
    const emailContent = `
New WorkScreen Early Access Request

Firm Name: ${body.firmName}
Email: ${body.email}

---
Submitted at: ${new Date().toISOString()}
IP Address: ${clientIP}
    `.trim()

    // Send email using Resend
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const emailFrom = process.env.EMAIL_FROM || 'noreply@workchat.law'
    const emailTo = process.env.EMAIL_TO

    if (!emailTo) {
      console.error('EMAIL_TO is not set')
      return NextResponse.json(
        { error: 'Email recipient not configured' },
        { status: 500 }
      )
    }

    await resend.emails.send({
      from: emailFrom,
      to: emailTo,
      subject: `New WorkScreen Early Access Request from ${body.firmName}`,
      text: emailContent,
    })

    return NextResponse.json(
      { message: 'Form submitted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error submitting form:', error)
    return NextResponse.json(
      { error: 'Failed to submit form. Please try again.' },
      { status: 500 }
    )
  }
}
