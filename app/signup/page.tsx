"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DiscordLoginButton } from "@/components/discord-login-button"
import { logActivity } from "@/lib/activity-logger"

export default function SignupPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signup, user } = useAuth()

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate inputs
    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Check if username is blacklisted
    const blacklistedUsernames = JSON.parse(localStorage.getItem("nexus_blacklisted_usernames") || "[]")
    if (blacklistedUsernames.some((banned: string) => banned.toLowerCase() === username.toLowerCase())) {
      setError("This username is not available")
      return
    }

    setIsLoading(true)

    try {
      const success = await signup(username, email, password)

      if (success) {
        // Log the signup activity
        logActivity(username, "signup", "New user registered")

        // Redirect to scripts page
        window.location.href = "/scripts"
      } else {
        setError("Username or email already exists")
      }
    } catch (error) {
      console.error("Signup error:", error)
      setError("An error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
            Create Account
          </h1>
          <p className="text-gray-400">Join the NEXUS community</p>
        </div>

        <div className="rounded-lg border-l-4 border-[#00ff9d] bg-[#1a1a1a] p-8">
          {error && (
            <div className="mb-6 rounded bg-red-900/30 p-4 text-red-200">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="username" className="mb-2 block font-medium text-[#00ff9d]">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
                placeholder="Choose a username"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="mb-2 block font-medium text-[#00ff9d]">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="mb-2 block font-medium text-[#00ff9d]">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
                placeholder="Create a password"
              />
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
                placeholder="Confirm your password"
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
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-white/10"></div>
            <div className="mx-4 text-sm text-gray-400">OR</div>
            <div className="flex-1 border-t border-white/10"></div>
          </div>

          <DiscordLoginButton />

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-[#00c6ed] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
