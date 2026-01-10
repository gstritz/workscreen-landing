# WorkScreen Landing Page

A single-page landing page for WorkScreen - a lead screening tool for plaintiff-side employment lawyers. Built with Next.js, TypeScript, and Tailwind CSS, deployed on Vercel.

## Features

- Single-page scroll-based layout
- Responsive mobile-first design
- Form submission with email notifications via Resend API
- Analytics tracking with Vercel Analytics
- Rate limiting on form submissions
- Form validation and error handling

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Resend API key (for email functionality)
- Vercel account (for deployment)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:
   ```env
   RESEND_API_KEY=your_resend_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_TO=your-email@example.com
   ```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `EMAIL_TO`
4. Deploy

Vercel will automatically detect Next.js and configure the build settings.

## Environment Variables

- `RESEND_API_KEY` - Your Resend API key (get one at [resend.com](https://resend.com))
- `EMAIL_FROM` - The sender email address (must be verified in Resend)
- `EMAIL_TO` - Your email address where form submissions will be sent

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── submit-form/
│   │   │       └── route.ts    # Form submission API endpoint
│   │   ├── layout.tsx           # Root layout with analytics
│   │   ├── page.tsx             # Main landing page
│   │   └── globals.css          # Global styles
│   └── components/
│       ├── Hero.tsx
│       ├── Problem.tsx
│       ├── Solution.tsx
│       ├── HowItWorks.tsx
│       ├── Screening.tsx
│       ├── Customization.tsx
│       ├── Pricing.tsx
│       ├── SignupForm.tsx
│       └── Footer.tsx
```

## Form Fields

The signup form collects:
- Firm name (required)
- Contact name (required)
- Email (required)
- States where they practice (multi-select, required)
- Case types they handle (checkboxes, required):
  - Discrimination (Title VII, ADA, ADEA, state law)
  - Wrongful termination
  - Retaliation / Whistleblower
  - Sexual harassment
  - Wage and hour / FLSA
  - FMLA / Leave violations
  - Non-compete / Trade secrets
  - Other (with text field)

## Analytics

Vercel Analytics is automatically enabled and tracks:
- Page views
- Form submissions (conversion events)

## Rate Limiting

Form submissions are rate-limited to 5 submissions per hour per IP address to prevent abuse.

## License

Private project - All rights reserved
