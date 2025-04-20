import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/membership',
  '/customers', 
  '/credit',
  '/services',
  '/staff',
  '/reports',
];

// Special case for reports - only admins can access
const adminOnlyPaths = [
  '/reports'
];

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the pathname from the URL
  const path = req.nextUrl.pathname;

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(prefix => path.startsWith(prefix));
  const isAdminPath = adminOnlyPaths.some(prefix => path.startsWith(prefix));

  // If path is protected and no session, redirect to login
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }

  // For admin paths, check if user has admin role - we'll read this from user metadata
  if (isAdminPath && session) {
    const user = session.user;
    const isAdmin = user.user_metadata?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/membership/:path*',
    '/customers/:path*',
    '/credit/:path*',
    '/services/:path*',
    '/staff/:path*',
    '/reports/:path*',
  ],
}; 