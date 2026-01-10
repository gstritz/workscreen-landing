/**
 * Simple script to create joneslaw questionnaire without Typeform JSON
 * Run with: npx tsx scripts/create-joneslaw-simple.ts
 * 
 * This creates a basic questionnaire for testing purposes
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createJonesLawQuestionnaire() {
  try {
    // Check if joneslaw already exists
    const existing = await prisma.questionnaire.findUnique({
      where: { subdomain: 'joneslaw' },
    })

    if (existing) {
      console.log('✅ Questionnaire with subdomain "joneslaw" already exists!')
      console.log(`   ID: ${existing.id}`)
      console.log(`   Title: ${existing.title}`)
      console.log(`   Access at: https://joneslaw.workchat.law`)
      process.exit(0)
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

    console.log('\n✅ Questionnaire created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📋 ID: ${questionnaire.id}`)
    console.log(`🏢 Firm: ${questionnaire.lawFirmName}`)
    console.log(`📧 Email: ${questionnaire.lawFirmEmail}`)
    console.log(`🔗 Subdomain: ${questionnaire.subdomain}`)
    console.log(`🌐 Production URL: https://joneslaw.workchat.law`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    
    if (error.code === 'P1001') {
      console.log('\n⚠️  Cannot connect to database!')
      console.log('   Make sure DATABASE_URL is set in environment variables')
    } else if (error.code === 'P2002') {
      console.log('\n⚠️  Subdomain "joneslaw" already exists!')
    } else {
      console.error('\nFull error:', error)
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createJonesLawQuestionnaire()
