"use client"

// Function to load and apply user theme
export function loadUserTheme() {
  // Check if we're in the browser
  if (typeof window === "undefined") return

  // Get current user from localStorage
  const currentUserStr = localStorage.getItem("nexus_current_user")
  if (!currentUserStr) return

  try {
    const currentUser = JSON.parse(currentUserStr)
    const username = currentUser.username

    // Get user theme
    const userThemeStr = localStorage.getItem(`nexus_theme_${username}`)
    if (!userThemeStr) return

    const userTheme = JSON.parse(userThemeStr)
    const primaryColor = userTheme.primaryColor || "#00ff9d"
    const secondaryColor = userTheme.secondaryColor || "#00b8ff"

    // Apply theme to CSS variables
    document.documentElement.style.setProperty("--primary-color", primaryColor)
    document.documentElement.style.setProperty("--secondary-color", secondaryColor)

    // Add a class to the body to indicate theme is loaded
    document.body.classList.add("theme-loaded")

    console.log("Theme loaded for user:", username)
  } catch (error) {
    console.error("Error loading user theme:", error)
  }
}

// Run on page load
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", loadUserTheme)

  // Also run immediately in case the DOM is already loaded
  if (document.readyState === "complete" || document.readyState === "interactive") {
    loadUserTheme()
  }
}
