"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"

export function UserThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [themeLoaded, setThemeLoaded] = useState(false)

  // Apply theme function
  const applyTheme = (primaryColor: string, secondaryColor: string) => {
    // Apply theme to CSS variables
    document.documentElement.style.setProperty("--primary-color", primaryColor)
    document.documentElement.style.setProperty("--secondary-color", secondaryColor)

    // Apply to elements that use these colors
    const elementsWithPrimary = document.querySelectorAll(
      '[class*="from-[#00ff9d]"], [class*="border-[#00ff9d]"], [class*="text-[#00ff9d]"], [class*="ring-[#00ff9d]"], [class*="focus:border-[#00ff9d]"], [class*="focus:ring-[#00ff9d]"], [class*="hover:shadow-[#00ff9d]"]',
    )
    const elementsWithSecondary = document.querySelectorAll(
      '[class*="to-[#00b8ff]"], [class*="border-[#00b8ff]"], [class*="text-[#00b8ff]"], [class*="ring-[#00b8ff]"], [class*="focus:border-[#00b8ff]"], [class*="focus:ring-[#00b8ff]"], [class*="hover:shadow-[#00b8ff]"]',
    )

    // Apply primary color
    elementsWithPrimary.forEach((element) => {
      const classList = element.className.split(" ")

      classList.forEach((className, index) => {
        if (className.includes("from-[#00ff9d]")) {
          classList[index] = className.replace("from-[#00ff9d]", `from-[${primaryColor}]`)
        }
        if (className.includes("border-[#00ff9d]")) {
          classList[index] = className.replace("border-[#00ff9d]", `border-[${primaryColor}]`)
        }
        if (className.includes("text-[#00ff9d]")) {
          classList[index] = className.replace("text-[#00ff9d]", `text-[${primaryColor}]`)
        }
        if (className.includes("ring-[#00ff9d]")) {
          classList[index] = className.replace("ring-[#00ff9d]", `ring-[${primaryColor}]`)
        }
        if (className.includes("focus:border-[#00ff9d]")) {
          classList[index] = className.replace("focus:border-[#00ff9d]", `focus:border-[${primaryColor}]`)
        }
        if (className.includes("focus:ring-[#00ff9d]")) {
          classList[index] = className.replace("focus:ring-[#00ff9d]", `focus:ring-[${primaryColor}]`)
        }
        if (className.includes("hover:shadow-[#00ff9d]")) {
          classList[index] = className.replace("hover:shadow-[#00ff9d]", `hover:shadow-[${primaryColor}]`)
        }
      })

      element.className = classList.join(" ")
    })

    // Apply secondary color
    elementsWithSecondary.forEach((element) => {
      const classList = element.className.split(" ")

      classList.forEach((className, index) => {
        if (className.includes("to-[#00b8ff]")) {
          classList[index] = className.replace("to-[#00b8ff]", `to-[${secondaryColor}]`)
        }
        if (className.includes("border-[#00b8ff]")) {
          classList[index] = className.replace("border-[#00b8ff]", `border-[${secondaryColor}]`)
        }
        if (className.includes("text-[#00b8ff]")) {
          classList[index] = className.replace("text-[#00b8ff]", `text-[${secondaryColor}]`)
        }
        if (className.includes("ring-[#00b8ff]")) {
          classList[index] = className.replace("ring-[#00b8ff]", `ring-[${secondaryColor}]`)
        }
        if (className.includes("focus:border-[#00b8ff]")) {
          classList[index] = className.replace("focus:border-[#00b8ff]", `focus:border-[${secondaryColor}]`)
        }
        if (className.includes("focus:ring-[#00b8ff]")) {
          classList[index] = className.replace("focus:ring-[#00b8ff]", `focus:ring-[${secondaryColor}]`)
        }
        if (className.includes("hover:shadow-[#00b8ff]")) {
          classList[index] = className.replace("hover:shadow-[#00b8ff]", `hover:shadow-[${secondaryColor}]`)
        }
      })

      element.className = classList.join(" ")
    })

    // Apply to gradient buttons and text
    const gradientElements = document.querySelectorAll('[class*="bg-gradient-to-r"]')
    gradientElements.forEach((element) => {
      const style = document.createElement("style")
      style.textContent = `
        .custom-gradient-${user?.username} {
          background-image: linear-gradient(to right, ${primaryColor}, ${secondaryColor}) !important;
        }
      `
      document.head.appendChild(style)

      element.classList.add(`custom-gradient-${user?.username}`)
    })
  }

  useEffect(() => {
    if (user && !themeLoaded) {
      // Load user theme preferences
      const userTheme = localStorage.getItem(`nexus_theme_${user.username}`)
      if (userTheme) {
        try {
          const theme = JSON.parse(userTheme)
          const primaryColor = theme.primaryColor || "#00ff9d"
          const secondaryColor = theme.secondaryColor || "#00b8ff"

          // Apply the theme
          applyTheme(primaryColor, secondaryColor)

          // Create a style element for global CSS variables
          const styleElement = document.createElement("style")
          styleElement.textContent = `
            :root {
              --primary-color: ${primaryColor};
              --secondary-color: ${secondaryColor};
            }
            
            .bg-gradient-primary {
              background-image: linear-gradient(to right, ${primaryColor}, ${secondaryColor}) !important;
            }
            
            .text-gradient-primary {
              background-image: linear-gradient(to right, ${primaryColor}, ${secondaryColor}) !important;
              -webkit-background-clip: text !important;
              color: transparent !important;
            }
          `
          document.head.appendChild(styleElement)

          setThemeLoaded(true)
        } catch (error) {
          console.error("Error parsing theme:", error)
        }
      }
    }
  }, [user, themeLoaded])

  return <>{children}</>
}
