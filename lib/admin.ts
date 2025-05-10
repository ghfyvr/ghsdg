import { isAdminServer } from "@/lib/admin-utils"

// Define the admin token constant
const ADMIN_TOKEN_KEY =
  "nexus_admin_token_Do_Not_Share_Leave_Console_Do_Not_Copy----_____-----3258ujaefhih328v6ha fhhag nFB@&F WDHB G#T*&HAF< #GQY* AKJFEB@*F ASLQ#*R(sdfb3ut93"

// Client-side function that calls the server function
export async function isAdmin(username: string | undefined): Promise<boolean> {
  // First check for admin token in localStorage
  try {
    const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (adminToken) {
      return true
    }
  } catch (error) {
    // Ignore errors when accessing localStorage (might be in SSR context)
  }

  // If no username provided, return false
  if (!username) return false

  try {
    // Special case for "nexus" or "volt" usernames
    const lowercaseUsername = username.toLowerCase()
    if (lowercaseUsername === "nexus" || lowercaseUsername === "volt") {
      return true
    }

    return await isAdminServer(username)
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}
