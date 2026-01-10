/**
 * Script to create joneslaw test questionnaire
 * Run with: npx tsx scripts/create-joneslaw-questionnaire.ts
 */

import { readFileSync } from 'fs'
import { join } from 'path'

async function createJonesLawQuestionnaire() {
  try {
    // Read the Typeform JSON file
    const jsonPath = join(process.cwd(), '..', 'typeform_Ua7Xxq48_backup.json')
    console.log('Reading Typeform JSON from:', jsonPath)
    
    const jsonContent = readFileSync(jsonPath, 'utf-8')
    const typeformJSON = JSON.parse(jsonContent)

    // API URL - use localhost for dev
    const apiUrl = process.env.API_URL || 'http://localhost:3000'
    console.log(`Creating questionnaire via ${apiUrl}...`)

    const response = await fetch(`${apiUrl}/api/questionnaires`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add API key if configured
        ...(process.env.ADMIN_API_KEY && { 'x-api-key': process.env.ADMIN_API_KEY }),
      },
      body: JSON.stringify({
        subdomain: 'joneslaw',
        lawFirmEmail: 'intakes@joneslaw.com',
        lawFirmName: 'Jones Law Firm',
        typeformJSON: typeformJSON,
        branding: {
          firmName: 'Jones Law Firm',
          primaryColor: '#1e40af', // Blue
          secondaryColor: '#3b82f6',
          logoUrl: undefined, // Can add logo URL later
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Error creating questionnaire:', error)
      
      if (response.status === 409) {
        console.log('\n⚠️  Questionnaire with subdomain "joneslaw" already exists!')
        console.log('   You can update it or use a different subdomain.')
      } else if (response.status === 500) {
        console.log('\n⚠️  Server error. Make sure:')
        console.log('   1. Database is set up and DATABASE_URL is configured')
        console.log('   2. Prisma migrations have been run: npx prisma migrate dev')
        console.log('   3. Development server is running: npm run dev')
      }
      
      process.exit(1)
    }

    const data = await response.json()
    console.log('\n✅ Questionnaire created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📋 ID: ${data.questionnaire.id}`)
    console.log(`🏢 Firm: ${data.questionnaire.lawFirmName}`)
    console.log(`📧 Email: ${data.questionnaire.lawFirmEmail}`)
    console.log(`🔗 Subdomain: ${data.questionnaire.subdomain}`)
    console.log(`🌐 URL: http://${data.questionnaire.subdomain}.localhost:3000`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n📝 Next steps:')
    console.log('   1. Add to /etc/hosts: 127.0.0.1 joneslaw.localhost')
    console.log('   2. Visit: http://joneslaw.localhost:3000')
    console.log('   3. Or access via subdomain when deployed')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    
    if (error.code === 'ENOENT') {
      console.log('\n⚠️  Typeform JSON file not found!')
      console.log('   Expected location: ../typeform_Ua7Xxq48_backup.json')
      console.log('   Make sure the file exists or update the path in the script.')
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️  Cannot connect to API!')
      console.log('   Make sure the development server is running:')
      console.log('   npm run dev')
    }
    
    process.exit(1)
  }
}

createJonesLawQuestionnaire()
