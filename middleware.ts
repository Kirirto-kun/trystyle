import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of protected routes that cannot be used as store slugs
const PROTECTED_ROUTES = [
  'dashboard',
  'admin', 
  'store-admin',
  'login',
  'register',
  'widget',
  'api',
  '_next',
  'static',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml'
]

// Check if a path segment is a protected route
function isProtectedRoute(path: string): boolean {
  const segment = path.split('/')[1]
  return PROTECTED_ROUTES.includes(segment)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Add iframe headers for widget route
  if (pathname.startsWith('/widget')) {
    const response = NextResponse.next()
    // Allow embedding in iframes
    response.headers.set('X-Frame-Options', 'ALLOWALL')
    response.headers.set('Content-Security-Policy', "frame-ancestors *")
    return response
  }
  
  // Skip middleware for protected routes, API routes, and static files
  if (isProtectedRoute(pathname) || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Handle potential store slug routes (single segment paths like /macho)
  const pathSegments = pathname.split('/').filter(Boolean)
  
  // Only handle single-segment paths that could be store slugs
  if (pathSegments.length === 1) {
    const slug = pathSegments[0]
    
    // If it's not a protected route, it might be a store slug
    // The actual validation will happen in the page component
    return NextResponse.next()
  }

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