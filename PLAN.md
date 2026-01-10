# Questionnaire App - Implementation Plan

## Overview
A dynamic questionnaire application for law firm intake screening. Questionnaires are programmatically configured, displayed to users, responses saved to a database, and answers delivered to the law firm via email.

**Key Requirements:**
- No authentication required
- **Branded subdomain support** (e.g., `sanfordlaw.workchat.law`)
- Programmatic questionnaire configuration
- Dynamic form rendering based on configuration
- Database storage of all responses
- Email delivery to law firm
- Support for conditional logic/routing
- File upload support (paystubs)
- Custom branding per subdomain (logo, colors, firm name)

---

## Architecture

### Tech Stack
- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (recommended: Vercel Postgres, Supabase, or PlanetScale)
- **Email:** Resend (already integrated)
- **File Storage:** Vercel Blob Storage or AWS S3 (for paystubs)
- **ORM:** Prisma (recommended) or Drizzle

---

## Database Schema

### 1. Questionnaires Table
Stores questionnaire configurations (can be imported from Typeform JSON or created programmatically).

```typescript
Questionnaire {
  id: string (UUID, primary key)
  subdomain: string (unique) // e.g., "sanfordlaw" for sanfordlaw.workchat.law
  title: string
  description?: string
  config: JSON // Full questionnaire structure (fields, logic, screens)
  lawFirmEmail: string // Where to send responses
  lawFirmName: string
  branding: JSON // { logoUrl?, primaryColor?, secondaryColor?, favicon? }
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 2. Responses Table
Stores individual questionnaire responses.

```typescript
Response {
  id: string (UUID, primary key)
  questionnaireId: string (foreign key)
  sessionId: string // Unique session identifier
  answers: JSON // All field answers keyed by field ref/id
  metadata: JSON // IP address, user agent, timestamps, etc.
  status: enum ('in_progress', 'completed', 'abandoned')
  submittedAt: timestamp?
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 3. Files Table
Stores uploaded files (paystubs, etc.).

```typescript
File {
  id: string (UUID, primary key)
  responseId: string (foreign key)
  fieldRef: string // Which field this file belongs to
  fileName: string
  fileUrl: string // URL to stored file
  fileSize: number
  mimeType: string
  uploadedAt: timestamp
}
```

---

## API Endpoints

### 1. Questionnaire Management

#### `GET /api/questionnaires`
- List all active questionnaires
- Returns: `{ questionnaires: Questionnaire[] }`

#### `GET /api/questionnaires/[id]`
- Get questionnaire configuration by ID
- Returns: `{ questionnaire: Questionnaire }`

#### `GET /api/questionnaires/by-subdomain?subdomain=[subdomain]`
- Get questionnaire by subdomain (used by middleware)
- Returns: `{ questionnaire: Questionnaire }`

#### `POST /api/questionnaires`
- Create/import new questionnaire (admin endpoint - can be protected with API key)
- Body: Typeform JSON or custom format
- Returns: `{ questionnaire: Questionnaire }`

#### `PUT /api/questionnaires/[id]`
- Update questionnaire configuration
- Returns: `{ questionnaire: Questionnaire }`

### 2. Response Management

#### `POST /api/responses`
- Start a new response session
- Body: `{ questionnaireId: string }`
- Returns: `{ responseId: string, sessionId: string }`

#### `PUT /api/responses/[responseId]`
- Save/update response answers (auto-save)
- Body: `{ answers: Record<string, any> }`
- Returns: `{ success: boolean }`

#### `POST /api/responses/[responseId]/submit`
- Submit completed response
- Body: `{ answers: Record<string, any> }`
- Actions:
  1. Save final answers to database
  2. Mark response as 'completed'
  3. Send email to law firm
  4. Attach uploaded files to email
- Returns: `{ success: boolean, message: string }`

#### `GET /api/responses/[responseId]`
- Get response by ID (for resuming)
- Returns: `{ response: Response }`

### 3. File Upload

#### `POST /api/upload`
- Upload file (paystub, etc.)
- Body: FormData with file
- Query: `responseId`, `fieldRef`
- Returns: `{ fileId: string, fileUrl: string }`

---

## Subdomain Routing & Branding

### How Branded Subdomains Work

Each law firm gets a unique subdomain (e.g., `sanfordlaw.workchat.law`). When a user visits this subdomain:

1. **DNS Resolution:** `sanfordlaw.workchat.law` resolves to your Vercel deployment
2. **Middleware Detection:** Next.js middleware extracts the subdomain from the `Host` header
3. **Database Lookup:** System queries database for questionnaire with matching subdomain
4. **Branded Experience:** Questionnaire renders with firm's custom branding (logo, colors, name)
5. **Seamless UX:** User sees a fully branded experience without any `/questionnaire/[id]` in the URL

**Benefits:**
- Professional branded URLs for each firm
- Easy to share: just `firmname.workchat.law`
- No need to remember questionnaire IDs
- Custom branding per firm
- SEO-friendly (each firm has their own domain)

### Subdomain Detection Middleware
**File:** `src/middleware.ts`

Next.js middleware that:
1. Extracts subdomain from request hostname
2. Looks up questionnaire by subdomain
3. Injects questionnaire/branding data into request headers
4. Handles root domain (workchat.law) → landing page
5. Handles unknown subdomains → 404 or redirect

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const subdomain = extractSubdomain(hostname)
  
  if (subdomain && subdomain !== 'www') {
    // Look up questionnaire by subdomain
    const questionnaire = await getQuestionnaireBySubdomain(subdomain)
    
    if (questionnaire) {
      // Add to headers for use in pages
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-questionnaire-id', questionnaire.id)
      requestHeaders.set('x-subdomain', subdomain)
      
      return NextResponse.next({
        request: { headers: requestHeaders }
      })
    }
  }
  
  // Default: continue to landing page or 404
  return NextResponse.next()
}
```

### Branding Configuration
Each questionnaire can have:
- **Logo URL:** Custom firm logo
- **Primary Color:** Brand color for buttons, links
- **Secondary Color:** Accent color
- **Favicon:** Custom favicon
- **Firm Name:** Displayed in header/footer

---

## Frontend Components

### 1. Questionnaire Router
**Route:** `/` (root path on subdomain)

When user visits `sanfordlaw.workchat.law`:
- Middleware detects subdomain
- Fetches questionnaire configuration by subdomain
- Renders questionnaire with custom branding
- Initializes response session
- Handles navigation between questions
- Implements conditional logic/routing
- Auto-saves progress
- Handles file uploads

**Alternative Route:** `/questionnaire/[id]` (for direct ID access, optional)

### 2. Question Components

#### `QuestionRenderer.tsx`
- Renders different question types based on field type:
  - `short_text` → Text input
  - `email` → Email input
  - `long_text` → Textarea
  - `multiple_choice` → Radio buttons or checkboxes
  - `yes_no` → Yes/No buttons
  - `statement` → Info screen with continue button
  - `file_upload` → File upload component

#### `WelcomeScreen.tsx`
- Displays welcome message
- Start button

#### `ThankYouScreen.tsx`
- Displays thank you message
- Can include personalized message with field references

### 3. Logic Engine

#### `QuestionnaireLogic.ts`
- Processes conditional logic from questionnaire config
- Determines next question based on current answers
- Handles field references (e.g., `{{field:01F5GPZ3HMGRHHB9ZHQ80C021F}}`)
- Implements jump conditions (is, is_not, always, and, or)

### 4. State Management

Use React Context or Zustand for:
- Current questionnaire config
- Current response state
- Answers object
- Current question index
- Navigation history

---

## Email Integration

### Email Template
When a response is submitted, send formatted email to law firm:

**Subject:** `New Intake Submission - [Questionnaire Title] - [Respondent Name]`

**Body Structure:**
```
New Intake Submission Received

Questionnaire: [Title]
Submitted: [Timestamp]
Session ID: [sessionId]

--- RESPONDENT INFORMATION ---
First Name: [answer]
Last Name: [answer]
Phone: [answer]
Email: [answer]
...

--- RESPONSES ---
[Question Title]: [Answer]
[Question Title]: [Answer]
...

--- ATTACHMENTS ---
[If files uploaded, list them with download links]
```

**Implementation:**
- Use Resend API (already integrated)
- Format answers in readable format
- Attach files or include download links
- Support HTML email for better formatting

---

## File Upload Handling

### Storage Options
1. **Vercel Blob Storage** (recommended for Vercel deployment)
   - Easy integration
   - Built-in CDN
   - Pay-per-use

2. **AWS S3** (alternative)
   - More control
   - Better for large files

### Implementation
- Upload files to storage service
- Store metadata in database
- Include file URLs in email
- Set file size limits (e.g., 10MB max)
- Validate file types (images, PDFs)

---

## Conditional Logic Implementation

### Logic Types from Typeform JSON
1. **Jump Logic:** Skip to specific question based on answer
2. **Field References:** Replace `{{field:ref}}` in text with actual answer
3. **Conditions:** 
   - `is` / `is_not` - exact match
   - `always` - always execute
   - `and` / `or` - logical operators

### Implementation Strategy
```typescript
function getNextQuestion(
  currentQuestion: Field,
  answers: Record<string, any>,
  allFields: Field[],
  logic: Logic[]
): Field | null {
  // Find logic rules for current question
  const relevantLogic = logic.find(l => l.ref === currentQuestion.ref)
  
  if (!relevantLogic) {
    // No logic, go to next question in sequence
    return getNextSequentialQuestion(currentQuestion, allFields)
  }
  
  // Evaluate conditions
  for (const action of relevantLogic.actions) {
    if (evaluateCondition(action.condition, answers)) {
      return findFieldById(action.details.to.value, allFields)
    }
  }
  
  // Default: next sequential
  return getNextSequentialQuestion(currentQuestion, allFields)
}
```

---

## Implementation Phases

### Phase 1: Core Infrastructure
1. Set up database (Prisma schema)
2. Create database tables (including subdomain field)
3. Set up file storage service
4. Create basic API endpoints structure
5. **Set up subdomain routing middleware**
6. **Configure Vercel for wildcard subdomains**

### Phase 2: Questionnaire Engine
1. Create questionnaire parser (Typeform JSON → internal format)
2. Build question renderer components
3. Implement basic navigation (sequential)
4. Add welcome/thank you screens
5. **Implement subdomain lookup and routing**
6. **Add branding component (logo, colors)**

### Phase 3: Logic & Routing
1. Implement conditional logic engine
2. Add field reference replacement
3. Test complex routing scenarios

### Phase 4: Response Management
1. Implement response session creation
2. Add auto-save functionality
3. Build response submission endpoint
4. Add response retrieval (for resuming)

### Phase 5: File Upload
1. Set up file storage
2. Create upload endpoint
3. Integrate file upload component
4. Add file validation

### Phase 6: Email Integration
1. Create email template
2. Format questionnaire responses
3. Attach files to email
4. Send email on submission

### Phase 7: Frontend Polish
1. Add progress indicator
2. Improve mobile responsiveness
3. Add loading states
4. Error handling and validation
5. Accessibility improvements

### Phase 8: Testing & Deployment
1. Test with sample questionnaire
2. Load testing
3. Security review
4. Deploy to production

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Email (already exists)
RESEND_API_KEY=...
EMAIL_FROM=...
EMAIL_TO=...

# File Storage
BLOB_READ_WRITE_TOKEN=... # For Vercel Blob
# OR
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...

# Subdomain Configuration
ROOT_DOMAIN=workchat.law  # Your root domain
WILDCARD_DOMAIN=*.workchat.law  # For Vercel wildcard subdomain

# Optional: Admin API Key for questionnaire management
ADMIN_API_KEY=...
```

## Vercel Configuration for Subdomains

### 1. Domain Setup
In Vercel dashboard:
1. Add root domain: `workchat.law`
2. Add wildcard domain: `*.workchat.law`
3. Configure DNS records:
   - A record for root domain
   - CNAME record for `*.workchat.law` → Vercel

### 2. vercel.json Update
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "host",
          "value": "(?<subdomain>.*)\\.workchat\\.law"
        }
      ],
      "destination": "/"
    }
  ]
}
```

---

## Security Considerations

1. **Rate Limiting:** Already implemented for form submissions
2. **File Upload Validation:** 
   - File type whitelist
   - File size limits
   - Virus scanning (optional)
3. **SQL Injection:** Use parameterized queries (Prisma handles this)
4. **XSS Prevention:** Sanitize user inputs in email templates
5. **CORS:** Configure appropriately for API endpoints
6. **Session Management:** Use secure session IDs

---

## Data Flow

### User Journey
1. User visits `sanfordlaw.workchat.law` (branded subdomain)
2. Middleware detects subdomain and looks up questionnaire
3. Frontend receives questionnaire config with branding
4. Creates new response session
5. Renders first question (welcome screen or first field) with custom branding
6. User answers questions
7. Answers auto-saved periodically
8. Logic engine determines next question
9. User completes questionnaire
10. Submits response
11. Backend saves to database
12. Email sent to law firm
13. Thank you screen displayed with firm branding

### Admin Journey (Questionnaire Setup)
1. Admin imports Typeform JSON via API
2. System parses and validates structure
3. Admin specifies subdomain (e.g., "sanfordlaw")
4. Admin configures branding (logo, colors, etc.)
5. Questionnaire saved to database with subdomain
6. Admin receives branded URL: `sanfordlaw.workchat.law`
7. Admin shares branded link with clients
8. System automatically routes subdomain to questionnaire

---

## File Structure

```
src/
├── middleware.ts                     # Subdomain detection & routing
├── app/
│   ├── api/
│   │   ├── questionnaires/
│   │   │   ├── route.ts              # GET, POST
│   │   │   ├── by-subdomain/
│   │   │   │   └── route.ts          # GET by subdomain
│   │   │   └── [id]/
│   │   │       └── route.ts           # GET, PUT
│   │   ├── responses/
│   │   │   ├── route.ts              # POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts          # GET, PUT
│   │   │       └── submit/
│   │   │           └── route.ts      # POST
│   │   └── upload/
│   │       └── route.ts              # POST
│   ├── (subdomain)/                  # Route group for subdomain pages
│   │   └── page.tsx                  # Questionnaire page (root path)
│   └── page.tsx                      # Landing page (root domain)
├── components/
│   ├── questionnaire/
│   │   ├── QuestionnaireRenderer.tsx
│   │   ├── QuestionRenderer.tsx
│   │   ├── WelcomeScreen.tsx
│   │   ├── ThankYouScreen.tsx
│   │   ├── FileUpload.tsx
│   │   ├── ProgressBar.tsx
│   │   └── BrandedHeader.tsx         # Header with custom branding
│   └── ...
├── lib/
│   ├── db/
│   │   ├── schema.ts                 # Prisma schema
│   │   └── client.ts                 # DB client
│   ├── questionnaire/
│   │   ├── parser.ts                 # Parse Typeform JSON
│   │   ├── logic.ts                  # Logic engine
│   │   ├── subdomain.ts              # Subdomain utilities
│   │   └── types.ts                  # TypeScript types
│   ├── email/
│   │   └── template.ts               # Email formatting
│   └── storage/
│       └── upload.ts                 # File upload handler
└── types/
    └── questionnaire.ts              # Shared types
```

---

## Next Steps

1. **Choose Database:** Set up PostgreSQL (Vercel Postgres recommended)
2. **Set up Prisma:** Initialize Prisma with schema
3. **Create Base Types:** Define TypeScript interfaces for questionnaire structure
4. **Build Parser:** Create function to convert Typeform JSON to internal format
5. **Start with Simple Flow:** Implement sequential question flow first
6. **Add Logic Later:** Implement conditional routing after basic flow works

---

## Notes

- The Typeform JSON structure is complex but well-defined
- Field references (e.g., `{{field:01F5GPZ3HMGRHHB9ZHQ80C021F}}`) need to be replaced dynamically
- Logic rules can be nested and complex - start simple, iterate
- File uploads are critical for this use case (paystubs)
- Email formatting should be readable and professional
- Consider adding analytics to track completion rates, drop-off points
