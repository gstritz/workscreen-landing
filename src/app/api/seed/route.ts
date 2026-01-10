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

    // Create a simple test questionnaire
    const questionnaire = await prisma.questionnaire.create({
      data: {
        subdomain: 'joneslaw',
        title: 'Jones Law Firm Intake',
        description: 'Employment law intake questionnaire',
        config: {
          title: 'Jones Law Firm Intake',
          fields: [
            {
              id: 'name',
              ref: 'name',
              title: 'What is your full name?',
              type: 'short_text',
              properties: {},
              validations: { required: true },
            },
            {
              id: 'email',
              ref: 'email',
              title: 'What is your email address?',
              type: 'email',
              properties: {},
              validations: { required: true },
            },
            {
              id: 'phone',
              ref: 'phone',
              title: 'What is your phone number?',
              type: 'phone_number',
              properties: {},
              validations: { required: true },
            },
            {
              id: 'issue',
              ref: 'issue',
              title: 'What employment issue are you experiencing?',
              type: 'multiple_choice',
              properties: {
                choices: [
                  { id: 'discrimination', label: 'Discrimination' },
                  { id: 'wrongful_termination', label: 'Wrongful Termination' },
                  { id: 'wage_hour', label: 'Wage and Hour Violations' },
                  { id: 'harassment', label: 'Harassment' },
                  { id: 'retaliation', label: 'Retaliation' },
                  { id: 'other', label: 'Other' },
                ],
              },
              validations: { required: true },
            },
            {
              id: 'description',
              ref: 'description',
              title: 'Please describe your situation',
              type: 'long_text',
              properties: {},
              validations: { required: true },
            },
          ],
          welcome_screens: [
            {
              id: 'welcome',
              ref: 'welcome',
              title: 'Welcome to Jones Law Firm',
              properties: {
                description: 'Please answer a few questions about your employment situation so we can better assist you.',
                show_button: true,
                button_text: 'Get Started',
              },
            },
          ],
          thankyou_screens: [
            {
              id: 'thankyou',
              ref: 'thankyou',
              title: 'Thank You!',
              properties: {
                description: 'We have received your information and will be in touch soon.',
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
