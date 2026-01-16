/**
 * Security Headers Configuration
 * 
 * Centralized security headers configuration for protecting against:
 * - Clickjacking (X-Frame-Options)
 * - MIME sniffing (X-Content-Type-Options)
 * - XSS attacks (Content-Security-Policy)
 * - SSL stripping (Strict-Transport-Security)
 * - Data leakage (Referrer-Policy)
 * - Feature abuse (Permissions-Policy)
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Apply security headers to response
 * @param request - The incoming request
 * @returns Response with security headers applied
 */
export function applySecurityHeaders(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers)
  
  // Create response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Apply all security headers
  const headers = getSecurityHeaders()
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

/**
 * Get all security headers as an object
 * @returns Object with header name and value pairs
 */
export function getSecurityHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    // ========================================
    // 1. X-Frame-Options - Prevent Clickjacking
    // ========================================
    // Prevents your site from being embedded in iframes
    'X-Frame-Options': 'DENY',

    // ========================================
    // 2. X-Content-Type-Options - Prevent MIME Sniffing
    // ========================================
    // Forces browser to respect declared content types
    'X-Content-Type-Options': 'nosniff',

    // ========================================
    // 3. X-XSS-Protection - Legacy XSS Filter
    // ========================================
    // Enables browser's XSS filter (legacy, but still useful)
    'X-XSS-Protection': '1; mode=block',

    // ========================================
    // 4. Referrer-Policy - Control Referrer Information
    // ========================================
    // Only sends origin (not full URL with query params) to external sites
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // ========================================
    // 5. Permissions-Policy - Restrict Browser Features
    // ========================================
    // Disables unnecessary browser features
    'Permissions-Policy': [
      'camera=()',           // No camera access
      'microphone=()',       // No microphone access
      'geolocation=()',      // No geolocation access
      'interest-cohort=()',  // No FLoC (privacy)
      'payment=()',          // No payment request API
      'usb=()',              // No USB access
    ].join(', '),

    // ========================================
    // 7. Content-Security-Policy - Prevent XSS
    // ========================================
    'Content-Security-Policy': getContentSecurityPolicy(),
  }

  // ========================================
  // 6. Strict-Transport-Security (HSTS) - Force HTTPS
  // ========================================
  // Only apply in production when you have valid SSL certificate
  if (process.env.NODE_ENV === 'production') {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
  }

  return headers
}

/**
 * Build Content Security Policy directive
 * Most important header - controls what resources can be loaded
 * @returns CSP string
 */
function getContentSecurityPolicy(): string {
  const cspDirectives = [
    // Default: Only allow resources from same origin
    "default-src 'self'",
    
    // Scripts: Allow same origin + Next.js requirements
    // 'unsafe-eval' needed for Next.js dev mode
    // 'unsafe-inline' needed for Next.js inline scripts
    process.env.NODE_ENV === 'production'
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    
    // Styles: Allow same origin + inline styles (for Tailwind, styled-components, etc.)
    "style-src 'self' 'unsafe-inline'",
    
    // Images: Allow same origin + data URIs + Supabase storage + Unsplash
    "img-src 'self' data: https: blob:",
    
    // Fonts: Allow same origin + data URIs
    "font-src 'self' data:",
    
    // Connect (API calls): Allow same origin + Supabase + Web3Forms
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.web3forms.com`,
    
    // Frames: Disallow all iframes (prevent clickjacking)
    "frame-src 'none'",
    
    // Frame ancestors: Prevent this site from being framed
    "frame-ancestors 'none'",
    
    // Objects: Disallow plugins (Flash, etc.)
    "object-src 'none'",
    
    // Base URI: Restrict base tag to same origin
    "base-uri 'self'",
    
    // Form actions: Allow forms to submit to same origin + Web3Forms
    "form-action 'self' https://api.web3forms.com",
    
    // Upgrade insecure requests (HTTP → HTTPS) in production
    ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
  ]

  return cspDirectives.join('; ')
}
