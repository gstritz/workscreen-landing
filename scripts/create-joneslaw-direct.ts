/**
 * Direct script to create joneslaw questionnaire in database
 * Run with: npx tsx scripts/create-joneslaw-direct.ts
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseTypeformJSON } from '../src/lib/questionnaire/parser'

const prisma = new PrismaClient()

async function createJonesLawQuestionnaire() {
  try {
    // Read the Typeform JSON file
    const jsonPath = '/Users/gabrielstiritz/Desktop/typeform_Ua7Xxq48_backup.json'
    console.log('Reading Typeform JSON from:', jsonPath)
    
    const jsonContent = readFileSync(jsonPath, 'utf-8')
    const typeformJSON = JSON.parse(jsonContent)

    // Parse the Typeform JSON
    const config = parseTypeformJSON(typeformJSON)

    // Check if joneslaw already exists
    const existing = await prisma.questionnaire.findUnique({
      where: { subdomain: 'joneslaw' },
    })

    if (existing) {
      console.log('⚠️  Questionnaire with subdomain "joneslaw" already exists!')
      console.log(`   ID: ${existing.id}`)
      console.log(`   Title: ${existing.title}`)
      console.log('\n   To update it, delete it first or use a different subdomain.')
      process.exit(0)
    }

    // Create the questionnaire
    const questionnaire = await prisma.questionnaire.create({
      data: {
        subdomain: 'joneslaw',
        title: config.title || 'Jones Law Firm Intake',
        description: config.description,
        config: config as any,
        lawFirmEmail: 'intakes@joneslaw.com',
        lawFirmName: 'Jones Law Firm',
        branding: {
          firmName: 'Jones Law Firm',
          primaryColor: '#1e40af', // Blue
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
    console.log(`🌐 Local URL: http://joneslaw.localhost:3000`)
    console.log(`🌐 Production URL: https://joneslaw.workchat.law`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n📝 Next steps:')
    console.log('   1. Add to /etc/hosts (for local testing):')
    console.log('      127.0.0.1 joneslaw.localhost')
    console.log('   2. Start dev server: npm run dev')
    console.log('   3. Visit: http://joneslaw.localhost:3000')
    console.log('\n   Or access via subdomain when deployed to production!')
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    
    if (error.code === 'ENOENT') {
      console.log('\n⚠️  Typeform JSON file not found!')
      console.log('   Expected location: ../../typeform_Ua7Xxq48_backup.json')
      console.log('   Make sure the file exists or update the path.')
    } else if (error.code === 'P1001') {
      console.log('\n⚠️  Cannot connect to database!')
      console.log('   Make sure DATABASE_URL is set in .env file')
      console.log('   Example: DATABASE_URL="postgresql://user:password@host:port/database"')
    } else if (error.code === 'P2002') {
      console.log('\n⚠️  Subdomain "joneslaw" already exists!')
      console.log('   Use a different subdomain or delete the existing one.')
    } else {
      console.error('\nFull error:', error)
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createJonesLawQuestionnaire()
