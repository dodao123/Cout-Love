import { NextRequest, NextResponse } from 'next/server';

// Completely disable middleware due to Edge Runtime crypto issues
export function middleware(request: NextRequest) {
  console.log('Middleware disabled - allowing all requests');
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};