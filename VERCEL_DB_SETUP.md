# Vercel Database Setup Guide

## Step-by-Step: Set Up PostgreSQL in Vercel

### Step 1: Create Vercel Postgres Database

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: **workchat**

2. **Create Database**
   - Click on **Storage** tab (or go to: Settings → Storage)
   - Click **Create Database**
   - Select **Postgres**
   - Choose a name (e.g., `workchat-db`)
   - Select a region (closest to your users)
   - Click **Create**

3. **Get Connection String**
   - After creation, Vercel will show you the connection string
   - It looks like: `postgres://default:password@host:5432/verceldb`
   - **Copy this connection string** - you'll need it in the next step

### Step 2: Add DATABASE_URL to Environment Variables

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to: **Settings** → **Environment Variables**
2. Click **Add New**
3. Name: `DATABASE_URL`
4. Value: Paste the connection string from Step 1
5. Environments: Select all (Production, Preview, Development)
6. Click **Save**

**Option B: Via Vercel CLI**
```bash
# Add to production
printf "postgres://your-connection-string\nn\n" | vercel env add DATABASE_URL production

# Add to preview
printf "postgres://your-connection-string\nn\n" | vercel env add DATABASE_URL preview

# Add to development
printf "postgres://your-connection-string\nn\n" | vercel env add DATABASE_URL development
```

### Step 3: Update Prisma Schema

✅ **Already done!** The schema has been updated to use PostgreSQL.

The schema now uses:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 4: Run Migrations

**Option A: Via Vercel CLI (Recommended)**
```bash
# Make sure you're in the project directory
cd "/Users/gabrielstiritz/Desktop/Code Projects/Employment Chat"

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
```

**Option B: Via Vercel Dashboard**
1. Go to your project → **Settings** → **Deployments**
2. Or use Vercel's built-in migration runner if available

**Option C: Via API/Function**
You can also create a migration endpoint that runs on first deployment.

### Step 5: Generate Prisma Client

After migrations, generate the Prisma client:
```bash
npx prisma generate
```

This is usually done automatically during `npm install` in Vercel builds.

### Step 6: Test the Connection

**Test locally:**
```bash
# Pull env vars
vercel env pull .env.local

# Test connection
npx prisma db pull
```

**Test in production:**
```bash
# Seed the test questionnaire
curl https://workchat.law/api/seed
```

### Step 7: Seed Test Data

After migrations are complete, create the Jones Law test questionnaire:

```bash
# Via API endpoint (recommended)
curl https://workchat.law/api/seed

# Or via script (if running locally with production DB)
DATABASE_URL="your-production-url" npx tsx scripts/create-joneslaw-simple.ts
```

## What Gets Stored

The database stores:

1. **Questionnaires** (questionnaire configs)
   - Subdomain, title, description
   - Full questionnaire structure (fields, logic, screens)
   - Law firm info (name, email)
   - Branding (logo, colors)

2. **Responses** (chat/response data)
   - Session ID
   - All answers to questions
   - Status (in progress, completed, abandoned)
   - Metadata (IP, user agent, timestamps)

3. **Files** (uploaded documents)
   - File metadata (name, size, type, URL)
   - Linked to responses

## Troubleshooting

**"Cannot connect to database"**
- Verify `DATABASE_URL` is set correctly in Vercel
- Check that the database is created and active
- Ensure the connection string is correct

**"Migration failed"**
- Make sure you've run `npx prisma migrate deploy`
- Check database permissions
- Verify the schema is updated to PostgreSQL

**"Prisma Client not generated"**
- Run `npx prisma generate` locally
- Vercel should auto-generate during build, but you can add it to `package.json` scripts

## Quick Checklist

- [ ] Vercel Postgres database created
- [ ] `DATABASE_URL` added to Vercel environment variables (all environments)
- [ ] Prisma schema updated to PostgreSQL ✅ (already done)
- [ ] Migrations run: `npx prisma migrate deploy`
- [ ] Prisma client generated: `npx prisma generate`
- [ ] Test connection works
- [ ] Seed test questionnaire: `curl https://workchat.law/api/seed`

## Next Steps After Setup

1. **Verify it works:**
   ```bash
   curl https://workchat.law/api/seed
   ```

2. **Access test questionnaire:**
   - Visit: `https://joneslaw.workchat.law` (after wildcard domain is added)

3. **Create more questionnaires:**
   - Use the API: `POST /api/questionnaires`
   - Or use the import script with Typeform JSON
