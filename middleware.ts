/**
 * Next.js Middleware Entry Point
 * 
 * This file MUST be named 'middleware.ts' and located in the project root.
 * This is a Next.js requirement and cannot be changed.
 * 
 * The actual security logic is organized in src/lib/security/headers.ts
 */

import type { NextRequest } from 'next/server'
import { applySecurityHeaders, securityHeadersConfig } from '@/lib/security/headers'

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
 */
export const config = securityHeadersConfig
