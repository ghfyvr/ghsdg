"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"

export function UserThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // Load user theme preferences
      const userTheme = localStorage.getItem(`nexus_theme_${user.username}`)
      if (userTheme) {
        const theme = JSON.parse(userTheme)

        // Apply theme to CSS variables
        document.documentElement.style.setProperty("--primary", theme.primaryColor || "#00ff9d")
        document.documentElement.style.setProperty("--secondary", theme.secondaryColor || "#00b8ff")
        document.documentElement.style.setProperty("--accent", theme.secondaryColor || "#00a2ff")
      }
    }
  }, [user])

  return <>{children}</>
}
