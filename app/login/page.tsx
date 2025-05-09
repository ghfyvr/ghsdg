"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  // Check for error from query params
  const errorParam = searchParams.get("error")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!username || !password) {
      setError("Username and password are required")
      setIsLoading(false)
      return
    }

    try {
      const success = await login(username, password)

      if (success) {
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
    <div className="container mx-auto px-5 py-12">
      <div className="mx-auto max-w-md rounded-lg border-l-4 border-[#00ff9d] bg-[#1a1a1a] p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-white">Login to NEXUS</h1>

        {(error || errorParam) && (
          <div className="mb-4 rounded bg-red-900/30 p-3 text-sm text-red-200">
            {error || getErrorMessage(errorParam as string)}
          </div>
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
                <span>Logging in...</span>
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#00c6ed] hover:underline">
            Sign Up
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/api/discord/login"
            className="inline-flex items-center rounded bg-[#5865F2] px-4 py-2 font-semibold text-white transition-all hover:bg-[#4752C4]"
          >
            <i className="fab fa-discord mr-2"></i> Login with Discord
          </Link>
        </div>
      </div>
    </div>
  )
}

function getErrorMessage(error: string): string {
  switch (error) {
    case "missing_code":
      return "Authorization code is missing. Please try again."
    case "authentication_failed":
      return "Discord authentication failed. Please try again."
    default:
      return "An error occurred during login. Please try again."
  }
}
