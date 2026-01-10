# How to Add Wildcard Domain *.workchat.law

## Steps

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Or: https://vercel.com/gabriels-projects-d517488e

2. **Select Your Project**
   - Click on: **workchat** (or **workscreen-landing** if that's the project name)

3. **Go to Settings**
   - Click on **Settings** in the top navigation
   - Or go directly to: Settings → Domains

4. **Add Domain**
   - Click the **Add Domain** button
   - In the domain input field, type: `*.workchat.law`
   - Click **Add** or **Continue**

5. **Verify DNS**
   - Vercel will show you the DNS records needed
   - Since your nameservers are already pointed to Vercel, this should be automatic
   - Wait for verification (usually takes a few minutes)

## Alternative: Via Project Settings URL

Direct link format (replace with your actual project):
```
https://vercel.com/gabriels-projects-d517488e/workchat/settings/domains
```

## What This Enables

Once the wildcard domain is added:
- ✅ `joneslaw.workchat.law` will work
- ✅ `anyfirm.workchat.law` will work
- ✅ Any subdomain will automatically route to your app
- ✅ Your middleware will detect the subdomain and show the appropriate questionnaire

## Verification

After adding, you can verify it's working:
```bash
vercel domains ls
```

You should see both:
- `workchat.law`
- `*.workchat.law`

## Troubleshooting

**If you don't see the option to add wildcard:**
- Make sure you're the project owner or have admin access
- Try refreshing the page
- Check that `workchat.law` is already added first

**If DNS verification fails:**
- Ensure nameservers are correctly pointed to Vercel
- Wait a few minutes for DNS propagation
- Check GoDaddy DNS settings
