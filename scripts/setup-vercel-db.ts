/**
 * Script to help set up Vercel Postgres database
 * This script checks the connection and can run migrations
 * 
 * Usage:
 *   1. Set DATABASE_URL in environment
 *   2. Run: npx tsx scripts/setup-vercel-db.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log('🔍 Checking database connection...\n')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful!\n')

    // Check if tables exist
    const questionnaireCount = await prisma.questionnaire.count()
    console.log(`📊 Questionnaires in database: ${questionnaireCount}`)
    
    const responseCount = await prisma.response.count()
    console.log(`📊 Responses in database: ${responseCount}\n`)

    if (questionnaireCount === 0) {
      console.log('💡 Tip: Run the seed endpoint to create test questionnaire:')
      console.log('   curl https://workchat.law/api/seed\n')
    }

    console.log('✅ Database is ready to use!')
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message)
    
    if (error.code === 'P1001') {
      console.log('\n⚠️  Cannot connect to database!')
      console.log('   Make sure DATABASE_URL is set correctly.')
      console.log('   For Vercel: Get connection string from Storage → Postgres')
    } else if (error.code === 'P3005') {
      console.log('\n⚠️  Database schema is not up to date!')
      console.log('   Run migrations: npx prisma migrate deploy')
    } else {
      console.error('\nFull error:', error)
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()
