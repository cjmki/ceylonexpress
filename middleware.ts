/**
 * Next.js Middleware Entry Point
 * 
 * This file MUST be named 'middleware.ts' and located in the project root.
 * This is a Next.js requirement and cannot be changed.
 * 
 * The actual security logic is organized in src/lib/security/headers.ts
 */

import type { NextRequest } from 'next/server'
import { applySecurityHeaders } from '@/lib/security/headers'

/**
 * Middleware function - automatically called by Next.js on every request
 * Applies security headers to protect against common web vulnerabilities
 */
export function middleware(request: NextRequest) {
  return applySecurityHeaders(request)
}

/**
 * Middleware configuration
 * Defines which routes should have the middleware applied
 * 
 * NOTE: This config MUST be defined inline (not imported) for Next.js to properly analyze it
 */
export const config = {
  // Apply middleware to all routes except:
  // - Next.js internal routes (_next/static, _next/image)
  // - Static files (favicon.ico, etc.)
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (sitemap.xml, robots.txt, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
