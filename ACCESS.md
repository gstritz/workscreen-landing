# How to Access the Jones Law Questionnaire

## Option 1: Direct Access by ID (Easiest)

The questionnaire ID is: `b057c878-4418-4843-b6a3-1d2a60a3b2aa`

**Access it at:**
- http://localhost:3000/questionnaire/b057c878-4418-4843-b6a3-1d2a60a3b2aa

This works immediately without any setup!

## Option 2: Subdomain Access (Production-like)

1. **Add to /etc/hosts:**
   ```bash
   sudo echo "127.0.0.1 joneslaw.localhost" >> /etc/hosts
   ```

2. **Access at:**
   - http://joneslaw.localhost:3000

## Option 3: Test API Directly

**Get questionnaire:**
```bash
curl http://localhost:3000/api/questionnaires/by-subdomain?subdomain=joneslaw
```

**Or by ID:**
```bash
curl http://localhost:3000/api/questionnaires/b057c878-4418-4843-b6a3-1d2a60a3b2aa
```

## Server Status

The dev server should be running. Check:
- http://localhost:3000

If you see the landing page, the server is running!

## Quick Test

1. **Start server** (if not running):
   ```bash
   npm run dev
   ```

2. **Open in browser:**
   - http://localhost:3000/questionnaire/b057c878-4418-4843-b6a3-1d2a60a3b2aa

3. **You should see:**
   - Welcome screen
   - All questions from the Typeform
   - Progress bar
   - Submit button at the end

## Troubleshooting

- **"Cannot GET /"**: Server might not be running - check terminal
- **"Questionnaire not found"**: Check database connection
- **Port 3000 in use**: Change port in package.json or kill process on port 3000
