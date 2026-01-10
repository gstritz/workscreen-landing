/**
 * Check if questionnaire exists
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkQuestionnaire() {
  try {
    // Check by ID
    const byId = await prisma.questionnaire.findUnique({
      where: { id: 'b057c878-4418-4843-b6a3-1d2a60a3b2aa' },
    })

    // Check by subdomain
    const bySubdomain = await prisma.questionnaire.findUnique({
      where: { subdomain: 'joneslaw' },
    })

    console.log('By ID:', byId ? 'Found' : 'Not found')
    if (byId) {
      console.log('  Title:', byId.title)
      console.log('  Subdomain:', byId.subdomain)
    }

    console.log('\nBy Subdomain:', bySubdomain ? 'Found' : 'Not found')
    if (bySubdomain) {
      console.log('  ID:', bySubdomain.id)
      console.log('  Title:', bySubdomain.title)
    }

    // List all questionnaires
    const all = await prisma.questionnaire.findMany({
      select: {
        id: true,
        subdomain: true,
        title: true,
        isActive: true,
      },
    })

    console.log('\nAll questionnaires:')
    all.forEach((q) => {
      console.log(`  ${q.id} - ${q.subdomain} - ${q.title} (${q.isActive ? 'active' : 'inactive'})`)
    })
  } catch (error: any) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkQuestionnaire()
