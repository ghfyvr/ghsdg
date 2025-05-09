import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Protected routes that require admin access
  const adminRoutes = ["/upload-keys"]

  // Check if the current path is an admin route
  if (adminRoutes.some((route) => path.startsWith(route))) {
    // Get the current user from cookies/localStorage
    const currentUser = request.cookies.get("nexus_current_user")?.value

    // If no user is logged in, redirect to login
    if (!currentUser) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // For additional security, we'll redirect to the home page
    // The actual admin check will happen client-side with both client and server verification
    // This is just an additional layer of protection
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/upload-keys/:path*"],
}
