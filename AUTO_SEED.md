# Auto-Create Jones Law Test Questionnaire

## Answer: No, deployments do NOT auto-create questionnaires

Questionnaires must be created manually. However, I've added a seed endpoint to make it easy.

## Quick Solution: Use the Seed Endpoint

After deployment, call this endpoint to create the Jones Law test questionnaire:

```bash
# Production
curl https://workchat.law/api/seed

# Local
curl http://localhost:3000/api/seed
```

This will:
- ✅ Check if `joneslaw` questionnaire already exists
- ✅ Create it if it doesn't exist
- ✅ Return the questionnaire details

## What Gets Created

The seed endpoint creates a basic test questionnaire with:
- **Subdomain:** `joneslaw`
- **Firm:** Jones Law Firm
- **Email:** `intakes@joneslaw.com`
- **Questions:** Name, Email, Phone, Issue Type, Description
- **Welcome & Thank You screens**

## Alternative: Manual Creation

You can also create it manually:

1. **Via API:**
   ```bash
   curl -X POST https://workchat.law/api/questionnaires \
     -H "Content-Type: application/json" \
     -d '{
       "subdomain": "joneslaw",
       "lawFirmEmail": "intakes@joneslaw.com",
       "lawFirmName": "Jones Law Firm"
     }'
   ```

2. **Via Script:**
   ```bash
   npx tsx scripts/create-joneslaw-simple.ts
   ```

## Recommendation

After each deployment to a new environment:
1. Run migrations: `npx prisma migrate deploy`
2. Seed the test questionnaire: `curl https://workchat.law/api/seed`

Or set up a Vercel deployment hook to call the seed endpoint automatically.
