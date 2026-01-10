# Jones Law Questionnaire - Setup Complete! ✅

## Questionnaire Created

- **Subdomain:** joneslaw
- **Firm Name:** Jones Law Firm
- **Email:** intakes@joneslaw.com
- **Database ID:** b057c878-4418-4843-b6a3-1d2a60a3b2aa

## Access the Questionnaire

### Local Development

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Visit the questionnaire:**
   - http://joneslaw.localhost:3000

   (The /etc/hosts entry should already be set up)

### Production

Once deployed, access via:
- https://joneslaw.workchat.law

## Test the Questionnaire

1. The questionnaire includes all questions from your Typeform JSON
2. It supports:
   - Welcome screens
   - All field types (text, multiple choice, file upload, etc.)
   - Conditional logic/routing
   - Thank you screen
   - Auto-save functionality

3. When a user completes it:
   - Response is saved to database
   - Email is sent to intakes@joneslaw.com
   - User sees thank you screen

## Customize

You can update the questionnaire:

```bash
# Update via API
curl -X PUT http://localhost:3000/api/questionnaires/b057c878-4418-4843-b6a3-1d2a60a3b2aa \
  -H "Content-Type: application/json" \
  -d '{
    "branding": {
      "primaryColor": "#your-color",
      "logoUrl": "https://your-logo-url.com/logo.png"
    }
  }'
```

## Database

Currently using SQLite for local testing (`prisma/dev.db`).

For production, switch back to PostgreSQL:
1. Update `prisma/schema.prisma` datasource to PostgreSQL
2. Set `DATABASE_URL` environment variable
3. Run migrations on production database
