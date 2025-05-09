"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignupPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [message, setMessage] = useState<{ type: "success" | "error" | null; text: string | null }>({
    type: null,
    text: null,
  })

  const validateUsername = (username: string): string | null => {
    if (username.length < 3 || username.length > 20) {
      return "Username must be between 3-20 characters"
    }
    return null
  }

  const validatePassword = (password: string, username: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters"
    }

    const bannedPasswords = ["12345678", "87654321"]
    if (bannedPasswords.includes(password)) {
      return "This password is not allowed"
    }

    if (username && password.toLowerCase().includes(username.toLowerCase())) {
      return "Password cannot contain your username"
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    setMessage({ type: null, text: null })

    try {
      if (!username || !password || !confirmPassword) {
        setError("All fields are required")
        return
      }

      // Validate username
      const usernameError = validateUsername(username)
      if (usernameError) {
        setError(usernameError)
        return
      }

      // Check if username is blacklisted
      const blacklistedUsernames = JSON.parse(localStorage.getItem("nexus_blacklisted_usernames") || "[]")
      if (blacklistedUsernames.some((banned: string) => banned.toLowerCase() === username.toLowerCase())) {
        setError("This username is not available. Please choose a different one.")
        return
      }

      // Validate password
      const passwordError = validatePassword(password, username)
      if (passwordError) {
        setError(passwordError)
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }

      // Check if username exists (case-insensitive)
      const allStoredKeys = Object.keys(localStorage)
      for (const key of allStoredKeys) {
        if (key.startsWith("nexus_user_")) {
          const storedUsername = key.replace("nexus_user_", "")
          if (storedUsername.toLowerCase() === username.toLowerCase()) {
            setError("Username already exists. Please choose a different one.")
            return
          }
        }
      }

      // Create new user
      const userData = {
        username,
        password,
        createdAt: new Date().toISOString(),
      }

      localStorage.setItem(`nexus_user_${username}`, JSON.stringify(userData))

      // Auto-login the user
      localStorage.setItem("nexus_current_user", username)

      // Show success message
      setMessage({ type: "success", text: "Account created successfully! Redirecting..." })

      // Redirect to scripts page and force refresh
      setTimeout(() => {
        window.location.href = "/scripts"
      }, 1500)
    } catch (error) {
      console.error("Signup error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-5 py-12">
      <div className="mx-auto max-w-md rounded-lg border-l-4 border-[#00ff9d] bg-[#1a1a1a] p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-white">Create an Account</h1>

        {error && <div className="mb-4 rounded bg-red-900/30 p-3 text-sm text-red-200">{error}</div>}
        {message.type === "success" && (
          <div className="mb-4 rounded bg-green-900/30 p-3 text-sm text-green-200">{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="mb-2 block font-medium text-[#00ff9d]">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
            />
            <p className="mt-1 text-xs text-gray-400">Username must be between 3-20 characters</p>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="mb-2 block font-medium text-[#00ff9d]">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
            />
            <p className="mt-1 text-xs text-gray-400">
              Password must be at least 8 characters and cannot contain your username
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="mb-2 block font-medium text-[#00ff9d]">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] px-4 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00ff9d]/20 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#050505]/20 border-t-[#050505]"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-[#00c6ed] hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
