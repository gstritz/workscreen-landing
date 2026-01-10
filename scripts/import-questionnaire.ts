/**
 * Script to import a Typeform JSON questionnaire
 * Usage: npx tsx scripts/import-questionnaire.ts <subdomain> <lawFirmEmail> <lawFirmName> <typeformJsonPath>
 */

import { readFileSync } from 'fs'
import { join } from 'path'

async function importQuestionnaire() {
  const args = process.argv.slice(2)
  
  if (args.length < 4) {
    console.error('Usage: npx tsx scripts/import-questionnaire.ts <subdomain> <lawFirmEmail> <lawFirmName> <typeformJsonPath>')
    process.exit(1)
  }

  const [subdomain, lawFirmEmail, lawFirmName, jsonPath] = args

  try {
    // Read Typeform JSON file
    const jsonContent = readFileSync(jsonPath, 'utf-8')
    const typeformJSON = JSON.parse(jsonContent)

    // Import questionnaire via API
    const apiUrl = process.env.API_URL || 'http://localhost:3000'
    const response = await fetch(`${apiUrl}/api/questionnaires`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add API key if configured
        ...(process.env.ADMIN_API_KEY && { 'x-api-key': process.env.ADMIN_API_KEY }),
      },
      body: JSON.stringify({
        subdomain,
        lawFirmEmail,
        lawFirmName,
        typeformJSON,
        branding: {
          firmName: lawFirmName,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Error importing questionnaire:', error)
      process.exit(1)
    }

    const data = await response.json()
    console.log('✅ Questionnaire imported successfully!')
    console.log(`📋 ID: ${data.questionnaire.id}`)
    console.log(`🔗 URL: ${subdomain}.workchat.law`)
    console.log(`📧 Email: ${lawFirmEmail}`)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

importQuestionnaire()
