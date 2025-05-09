import { isAdminServer } from "@/lib/admin-utils"

// Client-side function that calls the server function
export async function isAdmin(username: string | undefined): Promise<boolean> {
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
