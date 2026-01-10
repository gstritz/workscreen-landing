/**
 * Quick setup script for SQLite testing
 * This creates a local SQLite database for testing
 * Run: npx tsx scripts/setup-sqlite-test.ts
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

console.log('🔧 Setting up SQLite for testing...\n')

// Backup original schema
const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma')
const originalSchema = readFileSync(schemaPath, 'utf-8')

// Create SQLite version
const sqliteSchema = originalSchema.replace(
  /datasource db \{[^}]+\}/,
  `datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}`
)

writeFileSync(schemaPath, sqliteSchema)
console.log('✅ Updated schema.prisma to use SQLite')

try {
  // Run migrations
  console.log('\n📦 Running migrations...')
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' })
  
  console.log('\n✅ Database setup complete!')
  console.log('\n📝 Next steps:')
  console.log('   1. Run: npx tsx scripts/create-joneslaw-direct.ts')
  console.log('   2. Start dev server: npm run dev')
  console.log('   3. Visit: http://joneslaw.localhost:3000')
} catch (error) {
  console.error('\n❌ Error setting up database:', error)
  // Restore original schema
  writeFileSync(schemaPath, originalSchema)
  process.exit(1)
}
