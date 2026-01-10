import { NextRequest, NextResponse } from 'next/server'
import { extractSubdomain } from './lib/questionnaire/subdomain'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const subdomain = extractSubdomain(hostname)

  // If we have a subdomain, add it to headers for use in pages
  // The actual lookup will happen in the page component
  if (subdomain) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-subdomain', subdomain)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Default: continue to normal routing (landing page, API routes, etc.)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
