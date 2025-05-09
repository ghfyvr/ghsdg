"use client"

import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
          Welcome to NEXUS
        </h1>

        <p className="mb-10 text-xl text-gray-300">
          The ultimate platform for script sharing with a cyberpunk aesthetic
        </p>

        {user ? (
          <div className="mb-12 rounded-lg border border-[#00ff9d]/20 bg-[#050505] p-6 text-left">
            <h2 className="mb-4 text-2xl font-bold text-[#00ff9d]">Welcome back, {user.username}!</h2>
            <p className="mb-4 text-gray-300">You are now logged in. You can access all features of NEXUS.</p>
            <Link
              href="/scripts"
              className="inline-flex items-center rounded bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] px-6 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00ff9d]/20"
            >
              <i className="fas fa-code mr-2"></i> Browse Scripts
            </Link>
          </div>
        ) : (
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center rounded bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] px-6 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00ff9d]/20"
            >
              <i className="fas fa-user-plus mr-2"></i> Create Account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded border border-[#00c6ed] bg-transparent px-6 py-3 font-semibold text-[#00c6ed] transition-all hover:bg-[#00c6ed]/10"
            >
              <i className="fas fa-sign-in-alt mr-2"></i> Login
            </Link>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-[#0a0a0a] p-6 transition-all hover:border-[#00ff9d]/30 hover:shadow-lg hover:shadow-[#00ff9d]/5">
            <i className="fas fa-code mb-4 text-4xl text-[#00ff9d]"></i>
            <h3 className="mb-2 text-xl font-bold text-white">Premium Scripts</h3>
            <p className="text-gray-400">Access high-quality scripts with our cyberpunk platform.</p>
          </div>

          <div className="rounded-lg border border-white/5 bg-[#0a0a0a] p-6 transition-all hover:border-[#00c6ed]/30 hover:shadow-lg hover:shadow-[#00c6ed]/5">
            <i className="fas fa-shield-alt mb-4 text-4xl text-[#00c6ed]"></i>
            <h3 className="mb-2 text-xl font-bold text-white">Secure Execution</h3>
            <p className="text-gray-400">Run scripts safely with our trusted execution environment.</p>
          </div>

          <div className="rounded-lg border border-white/5 bg-[#0a0a0a] p-6 transition-all hover:border-[#00b8ff]/30 hover:shadow-lg hover:shadow-[#00b8ff]/5">
            <i className="fas fa-users mb-4 text-4xl text-[#00b8ff]"></i>
            <h3 className="mb-2 text-xl font-bold text-white">Community</h3>
            <p className="text-gray-400">Join our growing community of developers and enthusiasts.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
