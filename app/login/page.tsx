"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { DiscordLoginButton } from "@/components/discord-login-button"
import { logActivity } from "@/lib/activity-logger"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login, user } = useAuth()

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username || !password) {
      setError("Username and password are required")
      return
    }

    setIsLoading(true)

    try {
      const success = await login(username, password)

      if (success) {
        // Log the login activity
        logActivity(username, "login", "User logged in")

        // Redirect to home page
        window.location.href = "/"
      } else {
        setError("Invalid username or password")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
            Welcome Back
          </h1>
          <p className="text-gray-400">Sign in to your NEXUS account</p>
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
                placeholder="Enter your username"
              />
            </div>

            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="font-medium text-[#00ff9d]">
                  Password
                </label>
                <Link href="#" className="text-sm text-[#00c6ed] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
                placeholder="Enter your password"
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
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
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
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#00c6ed] hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
