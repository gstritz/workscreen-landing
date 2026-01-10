# Quick Start - Create Jones Law Test Questionnaire

## Option 1: Using SQLite (Quickest for Testing)

For local testing, you can use SQLite instead of PostgreSQL:

1. **Update Prisma schema** (temporarily):
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. **Run migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Create the questionnaire:**
   ```bash
   npx tsx scripts/create-joneslaw-direct.ts
   ```

## Option 2: Using PostgreSQL (Production-like)

1. **Set up a PostgreSQL database:**
   - Local: Install PostgreSQL and create a database
   - Cloud: Use Vercel Postgres, Supabase, or PlanetScale (free tiers available)

2. **Configure DATABASE_URL in .env:**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/questionnaire_db"
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Create the questionnaire:**
   ```bash
   npx tsx scripts/create-joneslaw-direct.ts
   ```

## Option 3: Using Vercel Postgres (Recommended for Production)

1. **Create Vercel Postgres database:**
   - Go to Vercel dashboard
   - Create a new Postgres database
   - Copy the connection string

2. **Add to .env:**
   ```env
   DATABASE_URL="postgres://..."
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Create the questionnaire:**
   ```bash
   npx tsx scripts/create-joneslaw-direct.ts
   ```

## After Creating the Questionnaire

1. **Add to /etc/hosts for local testing:**
   ```bash
   sudo echo "127.0.0.1 joneslaw.localhost" >> /etc/hosts
   ```

2. **Start the dev server:**
   ```bash
   npm run dev
   ```

3. **Visit:**
   - http://joneslaw.localhost:3000

## Troubleshooting

- **"Cannot connect to database"**: Make sure DATABASE_URL is set and database is running
- **"Migration failed"**: Make sure database exists and user has permissions
- **"Subdomain already exists"**: Delete existing questionnaire or use different subdomain
