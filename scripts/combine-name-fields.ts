/**
 * Script to combine first and last name fields into a single full name field
 * Run with: npx tsx scripts/combine-name-fields.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function combineNameFields() {
  try {
    // Get the joneslaw questionnaire
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { subdomain: 'joneslaw' },
    })

    if (!questionnaire) {
      console.error('Questionnaire not found!')
      process.exit(1)
    }

    const config = questionnaire.config as any
    const fields = config.fields || []

    // Find first name and last name fields
    const firstNameFieldIndex = fields.findIndex(
      (f: any) => f.ref === '01F5GPZ3HMGRHHB9ZHQ80C021F' || 
                  f.id === 'eSkCkkNcAaDj' ||
                  (f.title && f.title.toLowerCase().includes("first name"))
    )

    const lastNameFieldIndex = fields.findIndex(
      (f: any) => f.ref === '0b08c677-50f6-40c1-95e5-19b14fdfd9c2' || 
                  f.id === 'eiXTmvAeLZqh' ||
                  (f.title && f.title.toLowerCase().includes("last name"))
    )

    if (firstNameFieldIndex === -1 || lastNameFieldIndex === -1) {
      console.error('Could not find first or last name fields!')
      console.log('First name index:', firstNameFieldIndex)
      console.log('Last name index:', lastNameFieldIndex)
      process.exit(1)
    }

    const firstNameField = fields[firstNameFieldIndex]
    const lastNameField = fields[lastNameFieldIndex]

    // Create combined full name field
    const fullNameField = {
      id: firstNameField.id, // Keep first name ID for compatibility
      ref: 'fullname', // New ref for full name
      title: "What's your full name?",
      type: 'short_text',
      properties: {},
      validations: {
        required: true,
      },
    }

    // Replace first name field with full name
    fields[firstNameFieldIndex] = fullNameField

    // Remove last name field
    fields.splice(lastNameFieldIndex, 1)

    // Update any field references in other questions
    // Replace {{field:01F5GPZ3HMGRHHB9ZHQ80C021F}} and {{field:0b08c677-50f6-40c1-95e5-19b14fdfd9c2}} with {{field:fullname}}
    fields.forEach((field: any) => {
      if (field.title) {
        field.title = field.title
          .replace(/\{\{field:01F5GPZ3HMGRHHB9ZHQ80C021F\}\}/g, '{{field:fullname}}')
          .replace(/\{\{field:0b08c677-50f6-40c1-95e5-19b14fdfd9c2\}\}/g, '{{field:fullname}}')
          // Also replace common patterns like "firstName, nice to meet you" with just the name
          .replace(/{{field:01F5GPZ3HMGRHHB9ZHQ80C021F}}, nice to meet you! What is your \*last\* name\?/g, 'What is your full name?')
      }
    })

    // Update welcome and thank you screens
    if (config.welcome_screens) {
      config.welcome_screens.forEach((screen: any) => {
        if (screen.title) {
          screen.title = screen.title
            .replace(/\{\{field:01F5GPZ3HMGRHHB9ZHQ80C021F\}\}/g, '{{field:fullname}}')
            .replace(/\{\{field:0b08c677-50f6-40c1-95e5-19b14fdfd9c2\}\}/g, '{{field:fullname}}')
        }
      })
    }

    if (config.thankyou_screens) {
      config.thankyou_screens.forEach((screen: any) => {
        if (screen.title) {
          screen.title = screen.title
            .replace(/\{\{field:01F5GPZ3HMGRHHB9ZHQ80C021F\}\}/g, '{{field:fullname}}')
            .replace(/\{\{field:0b08c677-50f6-40c1-95e5-19b14fdfd9c2\}\}/g, '{{field:fullname}}')
        }
      })
    }

    // Update the questionnaire
    await prisma.questionnaire.update({
      where: { id: questionnaire.id },
      data: {
        config: config,
      },
    })

    console.log('✅ Successfully combined first and last name fields into full name!')
    console.log(`   Removed ${lastNameField.title}`)
    console.log(`   Combined into: ${fullNameField.title}`)
  } catch (error: any) {
    console.error('Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

combineNameFields()
