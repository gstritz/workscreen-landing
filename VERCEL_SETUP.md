# Vercel Configuration Checklist

## ⚠️ Security Note
This file contains API keys. **Do not commit sensitive keys to public repositories.** Consider using a password manager or secure notes for production keys.

## ✅ Already Done
- [x] Nameservers pointed to Vercel from GoDaddy
- [x] Resend API key obtained

## 🔧 Required Vercel Dashboard Configuration

### 1. Add Domains in Vercel Dashboard

Go to your project → **Settings** → **Domains**

Add these domains:
1. **Root domain**: `workchat.law`
2. **Wildcard subdomain**: `*.workchat.law`

**Note**: Since nameservers are already pointed to Vercel, DNS records will be automatically configured. You don't need to manually add A or CNAME records in GoDaddy.

### 2. Environment Variables

Go to your project → **Settings** → **Environment Variables**

Add these **required** variables:

```env
# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@host:port/database

# Email Service (REQUIRED)
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=noreply@workchat.law
EMAIL_TO=your-email@example.com
```

**⚠️ Important**: Replace `your-email@example.com` with the actual email where you want to receive form submissions.

**Optional** (for API authentication):
```env
ADMIN_API_KEY=your_secret_api_key_here
```

### 3. Database Setup

**Important**: You need a PostgreSQL database for production. Options:

1. **Vercel Postgres** (Recommended - easiest integration)
   - Go to Vercel dashboard → **Storage** → **Create Database** → **Postgres**
   - Copy the connection string to `DATABASE_URL`
   - Run migrations: `npx prisma migrate deploy` (or set up in Vercel)

2. **Supabase** (Free tier available)
   - Create project at supabase.com
   - Get connection string from Settings → Database
   - Add to `DATABASE_URL`

3. **PlanetScale** (MySQL, requires schema changes)
   - Not recommended unless you want to switch from PostgreSQL

### 4. Email Setup (Resend)

1. ✅ **API Key**: Get your API key from [resend.com](https://resend.com) and add it to Vercel environment variables
2. Verify the domain `workchat.law` in Resend:
   - Go to [resend.com/domains](https://resend.com/domains)
   - Add domain `workchat.law`
   - Add the DNS records Resend provides to your domain (or via Vercel DNS if using Vercel's nameservers)
   - Wait for verification (usually takes a few minutes)
3. Add `RESEND_API_KEY` to Vercel environment variables:
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key from resend.com
   - Environments: Select all (Production, Preview, Development)

### 5. Verify Build Settings

Your `vercel.json` is already configured correctly. No changes needed.

## 🚀 After Configuration

1. **Redeploy** your project (or push a new commit to trigger deployment)
2. **Test the root domain**: Visit `https://workchat.law` (should show landing page)
3. **Test a subdomain**: Create a questionnaire with subdomain, then visit `https://subdomain.workchat.law`

## 📋 Quick Checklist

- [ ] Domain `workchat.law` added in Vercel
- [ ] Wildcard domain `*.workchat.law` added in Vercel
- [ ] `DATABASE_URL` environment variable set
- [ ] `RESEND_API_KEY` environment variable set
- [ ] `EMAIL_FROM` environment variable set (should be `noreply@workchat.law`)
- [ ] `EMAIL_TO` environment variable set
- [ ] Database migrations run (if using Vercel Postgres, can run via Vercel CLI or dashboard)
- [ ] Domain verified in Resend (for email sending)
- [ ] Project redeployed after adding environment variables

## 🔍 Troubleshooting

**If subdomains don't work:**
- Verify `*.workchat.law` is added in Vercel domains
- Check that nameservers are correctly pointed
- Wait for DNS propagation (can take up to 48 hours, usually much faster)

**If build fails:**
- Check environment variables are set correctly
- Verify `DATABASE_URL` is accessible
- Check build logs in Vercel dashboard

**If emails don't send:**
- Verify `RESEND_API_KEY` is correct
- Check domain is verified in Resend
- Ensure `EMAIL_FROM` matches verified domain
