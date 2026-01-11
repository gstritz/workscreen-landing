/**
 * Seed endpoint to create test questionnaire
 * Call this after deployment to create the joneslaw test questionnaire
 * GET /api/seed - Creates joneslaw questionnaire if it doesn't exist
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET(request: NextRequest) {
  try {
    // Check if joneslaw already exists
    const existing = await prisma.questionnaire.findUnique({
      where: { subdomain: 'joneslaw' },
    })

    if (existing) {
      return NextResponse.json({
        message: 'Jones Law questionnaire already exists',
        questionnaire: {
          id: existing.id,
          subdomain: existing.subdomain,
          url: 'https://joneslaw.workchat.law',
        },
      })
    }

    // Create a test questionnaire with different questions
    const questionnaire = await prisma.questionnaire.create({
      data: {
        subdomain: 'joneslaw',
        title: 'Jones Law Firm Intake',
        description: 'Employment law intake questionnaire',
        config: {
          title: 'Jones Law Firm Intake',
          fields: [
            {
              id: 'contact_name',
              ref: 'contact_name',
              title: 'What is your full legal name?',
              type: 'short_text',
              properties: {
                description: 'Please enter your name as it appears on legal documents',
              },
              validations: { required: true },
            },
            {
              id: 'contact_email',
              ref: 'contact_email',
              title: 'What is your email address?',
              type: 'email',
              properties: {
                description: 'We will use this to contact you about your case',
              },
              validations: { required: true },
            },
            {
              id: 'contact_phone',
              ref: 'contact_phone',
              title: 'What is your best phone number?',
              type: 'phone_number',
              properties: {},
              validations: { required: true },
            },
            {
              id: 'employment_status',
              ref: 'employment_status',
              title: 'What is your current employment status?',
              type: 'multiple_choice',
              properties: {
                choices: [
                  { id: 'currently_employed', label: 'Currently Employed' },
                  { id: 'recently_terminated', label: 'Recently Terminated' },
                  { id: 'on_leave', label: 'On Leave' },
                  { id: 'never_employed', label: 'Never Employed by This Employer' },
                ],
              },
              validations: { required: true },
            },
            {
              id: 'incident_date',
              ref: 'incident_date',
              title: 'When did the incident or issue first occur?',
              type: 'date',
              properties: {
                description: 'Please provide the approximate date',
              },
              validations: { required: true },
            },
            {
              id: 'severity_rating',
              ref: 'severity_rating',
              title: 'How would you rate the severity of this issue?',
              type: 'rating',
              properties: {
                steps: 5,
                start_at_one: true,
                labels: {
                  left: 'Minor',
                  right: 'Severe',
                },
              },
              validations: { required: true },
            },
            {
              id: 'has_witnesses',
              ref: 'has_witnesses',
              title: 'Are there any witnesses to the incident?',
              type: 'yes_no',
              properties: {},
              validations: { required: true },
            },
            {
              id: 'witness_details',
              ref: 'witness_details',
              title: 'Please provide details about the witnesses',
              type: 'long_text',
              properties: {
                description: 'Include names and contact information if available',
              },
              validations: { required: false },
            },
            {
              id: 'has_documents',
              ref: 'has_documents',
              title: 'Do you have any relevant documents or evidence?',
              type: 'yes_no',
              properties: {},
              validations: { required: true },
            },
            {
              id: 'case_priority',
              ref: 'case_priority',
              title: 'How urgent is your situation?',
              type: 'dropdown',
              properties: {
                choices: [
                  { id: 'very_urgent', label: 'Very Urgent - Immediate Action Needed' },
                  { id: 'urgent', label: 'Urgent - Within a Week' },
                  { id: 'moderate', label: 'Moderate - Within a Month' },
                  { id: 'not_urgent', label: 'Not Urgent - Just Gathering Information' },
                ],
              },
              validations: { required: true },
            },
            {
              id: 'detailed_description',
              ref: 'detailed_description',
              title: 'Please provide a detailed description of what happened',
              type: 'long_text',
              properties: {
                description: 'Include dates, locations, people involved, and any other relevant details',
              },
              validations: { required: true },
            },
            {
              id: 'previous_legal_action',
              ref: 'previous_legal_action',
              title: 'Have you taken any previous legal action regarding this matter?',
              type: 'yes_no',
              properties: {},
              validations: { required: true },
            },
            {
              id: 'additional_info',
              ref: 'additional_info',
              title: 'Is there anything else you would like us to know?',
              type: 'long_text',
              properties: {},
              validations: { required: false },
            },
          ],
          welcome_screens: [
            {
              id: 'welcome',
              ref: 'welcome',
              title: 'Welcome to Jones Law Firm',
              properties: {
                description: 'We specialize in employment law matters. This questionnaire will help us understand your situation and determine how we can best assist you. The process takes about 5-10 minutes.',
                show_button: true,
                button_text: 'Begin Questionnaire',
              },
            },
          ],
          thankyou_screens: [
            {
              id: 'thankyou',
              ref: 'thankyou',
              title: 'Thank You for Your Submission!',
              properties: {
                description: 'We have received your information and our team will review it carefully. You can expect to hear from us within 1-2 business days. If this is an urgent matter, please call us directly at (555) 123-4567.',
                show_button: false,
              },
            },
          ],
        },
        lawFirmEmail: 'intakes@joneslaw.com',
        lawFirmName: 'Jones Law Firm',
        branding: {
          firmName: 'Jones Law Firm',
          primaryColor: '#1e40af',
          secondaryColor: '#3b82f6',
        },
        isActive: true,
      },
    })

    return NextResponse.json({
      message: 'Jones Law questionnaire created successfully',
      questionnaire: {
        id: questionnaire.id,
        subdomain: questionnaire.subdomain,
        url: 'https://joneslaw.workchat.law',
      },
    })
  } catch (error: any) {
    console.error('Error seeding questionnaire:', error)
    return NextResponse.json(
      {
        error: 'Failed to create questionnaire',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
