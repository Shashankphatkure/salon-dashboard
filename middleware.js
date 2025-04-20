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
  '/invoice',
  '/appointments',
  '/book-appointment'
];

// Special case for reports - only admins can access
const adminOnlyPaths = [
  '/reports'
];

// Auth related paths that should be excluded from session checks
const authPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password'
];

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Get the pathname from the URL
  const path = req.nextUrl.pathname;
  
  // Redirect home page to book-appointment
  if (path === '/' || path === '') {
    return NextResponse.redirect(new URL('/book-appointment', req.url));
  }

  // Check if the path requires protection
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  );
  
  // Check if the path is for admin only
  const isAdminOnlyPath = adminOnlyPaths.some(adminPath => 
    path.startsWith(adminPath)
  );

  // Skip auth check for auth-related paths
  const isAuthPath = authPaths.some(authPath => 
    path === authPath
  );

  if (!isProtectedPath || isAuthPath) {
    return res;
  }

  // Get the user's session
  const { data: { session } } = await supabase.auth.getSession();

  // If no session and trying to access protected route, redirect to login
  if (!session && isProtectedPath) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirectedFrom', path);
    return NextResponse.redirect(redirectUrl);
  }

  // Check admin access for admin-only paths
  if (isAdminOnlyPath) {
    const { data: { user } } = await supabase.auth.getUser();
    // Get user role from metadata or custom claims
    const userRole = user?.user_metadata?.role || 'user';
    
    if (userRole !== 'admin') {
      // Redirect non-admins trying to access admin-only paths
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
  
  return res;
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/membership/:path*',
    '/customers/:path*',
    '/credit/:path*',
    '/services/:path*',
    '/staff/:path*',
    '/reports/:path*',
    '/auth/:path*',
    '/invoice/:path*',
    '/appointments/:path*',
    '/book-appointment/:path*',
  ],
}; 