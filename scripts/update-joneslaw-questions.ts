/**
 * Script to update joneslaw questionnaire with new questions via API
 * Run with: npx tsx scripts/update-joneslaw-questions.ts
 * 
 * This updates the questionnaire via the API endpoint (requires dev server to be running)
 * or directly via database if DATABASE_URL is set
 */

import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env') })
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const prisma = new PrismaClient()

const newQuestionnaireConfig = {
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
}

async function updateViaDatabase() {
  try {
    // Find existing questionnaire
    const existing = await prisma.questionnaire.findUnique({
      where: { subdomain: 'joneslaw' },
    })

    if (!existing) {
      console.log('❌ Questionnaire with subdomain "joneslaw" not found!')
      console.log('   Creating new questionnaire...')
      
      const questionnaire = await prisma.questionnaire.create({
        data: {
          subdomain: 'joneslaw',
          title: 'Jones Law Firm Intake',
          description: 'Employment law intake questionnaire',
          config: newQuestionnaireConfig as any,
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
      return
    }

    console.log('🗑️  Deleting existing questionnaire...')
    console.log(`   ID: ${existing.id}`)
    console.log(`   Title: ${existing.title}`)
    
    // Delete the existing questionnaire
    await prisma.questionnaire.delete({
      where: { subdomain: 'joneslaw' },
    })
    
    console.log('✅ Existing questionnaire deleted successfully!\n')

    // Create new questionnaire
    const questionnaire = await prisma.questionnaire.create({
      data: {
        subdomain: 'joneslaw',
        title: 'Jones Law Firm Intake',
        description: 'Employment law intake questionnaire',
        config: newQuestionnaireConfig as any,
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

    console.log('✅ New questionnaire created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📋 ID: ${questionnaire.id}`)
    console.log(`🏢 Firm: ${questionnaire.lawFirmName}`)
    console.log(`📧 Email: ${questionnaire.lawFirmEmail}`)
    console.log(`🔗 Subdomain: ${questionnaire.subdomain}`)
    console.log(`🌐 Production URL: https://joneslaw.workchat.law`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  } catch (error: any) {
    if (error.code === 'P1001' || error.code === 'P5010') {
      throw new Error('DATABASE_CONNECTION_ERROR')
    }
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  try {
    // Try database first
    await updateViaDatabase()
  } catch (error: any) {
    if (error.message === 'DATABASE_CONNECTION_ERROR') {
      console.error('\n❌ Cannot connect to database!')
      console.log('\n💡 Options:')
      console.log('   1. Make sure DATABASE_URL is set in .env or .env.local')
      console.log('   2. Ensure your database is running and accessible')
      console.log('   3. If using a remote database, check your connection string')
      console.log('\n   Example .env file:')
      console.log('   DATABASE_URL="postgresql://user:password@host:port/database"')
    } else {
      console.error('❌ Error:', error.message)
      if (error.code) {
        console.error(`   Error code: ${error.code}`)
      }
    }
    process.exit(1)
  }
}

main()
