import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check if maintenance mode is enabled
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true' || process.env.MAINTENANCE_MODE === '1'

  if (isMaintenanceMode) {
    const isExcluded =
      pathname.startsWith('/maintenance') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.includes('.') // Exclude static files (e.g. icon.svg, images)

    if (!isExcluded) {
      return NextResponse.redirect(new URL('/maintenance', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths to enforce maintenance redirect,
     * excluding core system and static asset paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
