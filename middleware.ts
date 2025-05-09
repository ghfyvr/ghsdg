import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Protected routes that require admin access
  const adminRoutes = ["/upload-keys"]

  // Check if the current path is an admin route
  if (adminRoutes.some((route) => path.startsWith(route))) {
    // Get the current user from cookies
    const currentUserCookie = request.cookies.get("nexus_current_user")?.value

    // If no user is logged in, redirect to login
    if (!currentUserCookie) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      // Parse the user data
      const currentUser = JSON.parse(currentUserCookie)

      // Check if user is admin directly in middleware
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Query the database to check if user is admin
      const { data, error } = await supabase
        .from("users")
        .select("is_admin")
        .eq("username", currentUser.username)
        .single()

      if (error || !data || !data.is_admin) {
        // If not admin, redirect to homepage
        return NextResponse.redirect(new URL("/", request.url))
      }

      // If admin, allow access
      return NextResponse.next()
    } catch (error) {
      console.error("Error in middleware:", error)
      // If there's an error, redirect to login
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/upload-keys/:path*"],
}
