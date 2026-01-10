# Questionnaire App Setup Guide

## Prerequisites

1. **Database**: Set up a PostgreSQL database (Vercel Postgres, Supabase, or PlanetScale recommended)
2. **Environment Variables**: Configure all required environment variables
3. **Domain Setup**: Configure wildcard subdomain in Vercel

## Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@workchat.law
EMAIL_TO=your-email@example.com

# Optional: Admin API Key
ADMIN_API_KEY=your_secret_api_key
```

## Database Setup

1. **Run Prisma migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

## Creating a Questionnaire

### Option 1: Via API (Recommended)

```bash
curl -X POST http://localhost:3000/api/questionnaires \
  -H "Content-Type: application/json" \
  -d '{
    "subdomain": "sanfordlaw",
    "lawFirmEmail": "intakes@sanfordlawfirm.com",
    "lawFirmName": "Sanford Law Firm",
    "typeformJSON": { ... },
    "branding": {
      "logoUrl": "https://example.com/logo.png",
      "primaryColor": "#2563eb",
      "firmName": "Sanford Law Firm"
    }
  }'
```

### Option 2: Import Typeform JSON

Use the provided Typeform JSON file and import it via the API.

## Subdomain Configuration

### Vercel Setup

1. In Vercel dashboard, go to your project settings
2. Add domain: `workchat.law`
3. Add wildcard domain: `*.workchat.law`
4. Configure DNS:
   - A record for root domain pointing to Vercel
   - CNAME record for `*.workchat.law` pointing to Vercel

### Local Development

For local development with subdomains:

1. Edit `/etc/hosts` (Mac/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
   ```
   127.0.0.1 sanfordlaw.localhost
   127.0.0.1 testfirm.localhost
   ```

2. Access via: `http://sanfordlaw.localhost:3000`

## Testing

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Create a test questionnaire:**
   - Use the API endpoint or import script

3. **Access questionnaire:**
   - Via subdomain: `http://subdomain.localhost:3000`
   - Or via ID: `http://localhost:3000/questionnaire/[id]`

## File Uploads

Currently, file uploads are saved to `public/uploads` in development.

For production:
1. Set up Vercel Blob Storage or AWS S3
2. Update `/api/upload/route.ts` to use cloud storage
3. Configure storage credentials in environment variables

## Customization Per Law Firm

Each questionnaire can be customized:

1. **Different Questions**: Import different Typeform JSON per firm
2. **Branding**: Custom logo, colors, firm name
3. **Email Recipient**: Each firm gets responses at their email
4. **Subdomain**: Each firm gets unique branded URL

## API Endpoints

- `GET /api/questionnaires` - List all questionnaires
- `GET /api/questionnaires/[id]` - Get questionnaire by ID
- `GET /api/questionnaires/by-subdomain?subdomain=xxx` - Get by subdomain
- `POST /api/questionnaires` - Create new questionnaire
- `PUT /api/questionnaires/[id]` - Update questionnaire
- `POST /api/responses` - Create response session
- `GET /api/responses/[id]` - Get response
- `PUT /api/responses/[id]` - Update response (auto-save)
- `POST /api/responses/[id]/submit` - Submit response
- `POST /api/upload` - Upload file

## Next Steps

1. Set up database and run migrations
2. Import your first questionnaire
3. Configure subdomain in Vercel
4. Test the full flow
5. Set up file storage for production
6. Customize branding per firm
