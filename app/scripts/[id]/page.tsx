"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import { scriptCategories } from "@/lib/categories"
import { ReportModal } from "@/components/report-modal"
import { isAdmin } from "@/lib/admin"

// Function to escape HTML to prevent XSS
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

type Game = {
  id: number
  gameId?: string
  name: string
  imageUrl: string
}

type Script = {
  id: string
  title: string
  description: string
  code: string
  author: string
  createdAt: string
  game: Game
  categories?: string[]
  likes?: string[]
  dislikes?: string[]
  views?: number
  isNexusTeam?: boolean
  isPremium?: boolean
}

export default function ScriptDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [script, setScript] = useState<Script | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [authorIsAdmin, setAuthorIsAdmin] = useState(false)

  useEffect(() => {
    // Load scripts from localStorage
    const storedScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")
    const foundScript = storedScripts.find((s: Script) => s.id === id)

    if (foundScript) {
      // Check if we should count a view (rate limiting)
      const shouldCountView = checkShouldCountView(id as string)

      if (shouldCountView) {
        // Increment view count
        const updatedScript = {
          ...foundScript,
          views: (foundScript.views || 0) + 1,
        }

        // Update the script in localStorage
        const updatedScripts = storedScripts.map((s: Script) => (s.id === id ? updatedScript : s))
        localStorage.setItem("nexus_scripts", JSON.stringify(updatedScripts))
        setScript(updatedScript)

        // Set the view timestamp for rate limiting
        setViewTimestamp(id as string)
      } else {
        setScript(foundScript)
      }

      // Check if author is admin
      const checkAuthorAdmin = async () => {
        if (foundScript.author) {
          const isAuthorAdmin = await isAdmin(foundScript.author)
          setAuthorIsAdmin(isAuthorAdmin)

          // If author is admin, mark script as Nexus Team
          if (isAuthorAdmin && !foundScript.isNexusTeam) {
            const nexusTeamScript = { ...foundScript, isNexusTeam: true }
            const nexusUpdatedScripts = storedScripts.map((s: Script) => (s.id === id ? nexusTeamScript : s))
            localStorage.setItem("nexus_scripts", JSON.stringify(nexusUpdatedScripts))
            setScript(nexusTeamScript)
          }
        }
      }

      checkAuthorAdmin()
    } else {
      setError("Script not found")
    }

    setIsLoading(false)
  }, [id])

  // Function to check if we should count a view (rate limiting)
  const checkShouldCountView = (scriptId: string) => {
    const viewTimestamps = JSON.parse(localStorage.getItem("nexus_view_timestamps") || "{}")
    const lastViewTime = viewTimestamps[scriptId]

    if (!lastViewTime) {
      return true
    }

    // Check if 60 seconds have passed since the last view
    const now = Date.now()
    return now - lastViewTime > 60000 // 60 seconds in milliseconds
  }

  // Function to set the view timestamp for rate limiting
  const setViewTimestamp = (scriptId: string) => {
    const viewTimestamps = JSON.parse(localStorage.getItem("nexus_view_timestamps") || "{}")
    viewTimestamps[scriptId] = Date.now()
    localStorage.setItem("nexus_view_timestamps", JSON.stringify(viewTimestamps))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#00ff9d]"></div>
        </div>
      </div>
    )
  }

  if (error || !script) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-8 text-center">
          <div className="mb-4 text-5xl text-red-400">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">Script Not Found</h2>
          <p className="mb-6 text-gray-400">The script you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/scripts"
            className="inline-flex items-center rounded bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] px-6 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00ff9d]/20"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to Scripts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <Link href="/scripts" className="mb-8 inline-flex items-center text-[#00c6ed] hover:underline">
        <i className="fas fa-arrow-left mr-2"></i> Back to Scripts
      </Link>

      {script.game && (
        <div className="mb-8 overflow-hidden rounded-lg border border-[#00c6ed]/30">
          <div className="relative h-48 w-full md:h-64">
            <Image
              src={script.game.imageUrl || "/placeholder.svg"}
              alt={script.game.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={100}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="mb-2 inline-block rounded bg-[#00c6ed]/20 px-3 py-1 text-sm font-medium text-[#00c6ed]">
                {script.game.name}
              </span>
              <h1 className="text-3xl font-bold text-white">{script.title}</h1>
            </div>
            {script.isNexusTeam && (
              <div className="absolute top-4 right-4 rounded bg-[#00ff9d] px-3 py-1 text-sm font-bold text-[#050505]">
                <span>
                  <i style={{ color: "var(--secondary)" }} className="fas fa-user-shield"></i> Nexus Team
                </span>
              </div>
            )}
            {script.isPremium && !script.isNexusTeam && (
              <div className="absolute top-4 right-4 rounded bg-[#BA55D3] px-3 py-1 text-sm font-bold text-white">
                PREMIUM
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col gap-6 md:flex-row">
        <div className="w-full md:w-2/3">
          {!script.game && (
            <h1 className="mb-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
              {script.title}
            </h1>
          )}

          <div className="mb-6 flex items-center gap-3">
            <Link href={`/profile/${script.author}`} className="flex items-center gap-3 hover:underline">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-[#0a0a0a]">
                {script.author.charAt(0).toUpperCase()}
              </div>
              <span className={`text-gray-300 ${authorIsAdmin ? "text-[#00ff9d]" : ""}`}>
                {script.author} {authorIsAdmin && <i className="fas fa-shield-alt ml-1 text-xs text-[#00a2ff]"></i>}
              </span>
            </Link>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400 text-sm">
              {new Date(script.createdAt).toLocaleDateString()} at {new Date(script.createdAt).toLocaleTimeString()}
            </span>
          </div>

          {script.categories && script.categories.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {script.categories.map((categoryId) => {
                const category = scriptCategories.find((c) => c.id === categoryId)
                return (
                  category && (
                    <span
                      key={categoryId}
                      className="rounded bg-[#00c6ed]/10 px-3 py-1 text-sm font-medium text-[#00c6ed]"
                    >
                      {category.name}
                    </span>
                  )
                )
              })}
            </div>
          )}

          <div className="rounded-lg border-l-4 border-[#00c6ed] bg-[#1a1a1a] p-6">
            <h2 className="mb-3 text-xl font-bold text-white">Description</h2>
            <p className="text-gray-300 whitespace-pre-line">{script.description}</p>
          </div>

          <div className="mt-4 rounded-lg border-l-4 border-[#00ff9d] bg-[#1a1a1a] p-6">
            <h2 className="mb-3 text-xl font-bold text-white">Script Code</h2>
            <div className="relative">
              <div className="font-mono text-sm text-gray-300 whitespace-pre-wrap overflow-auto max-h-[300px]">
                {escapeHtml(script.code)}
              </div>
              <button
                className="absolute right-0 top-0 rounded bg-[#1a1a1a] p-2 text-[#00ff9d] transition-all hover:bg-[#2a2a2a]"
                onClick={() => {
                  navigator.clipboard.writeText(script.code)
                  alert("Script copied to clipboard!")
                }}
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Actions</h2>

            <button
              className="mb-3 w-full rounded border border-[#00ff9d] bg-[rgba(0,255,157,0.1)] px-4 py-3 text-[#00ff9d] transition-all hover:bg-[rgba(0,255,157,0.2)]"
              onClick={() => {
                navigator.clipboard.writeText(script.code)
                alert("Script copied to clipboard!")
              }}
            >
              <i className="fas fa-copy mr-2"></i> Copy Script
            </button>

            <button
              className="mb-3 w-full rounded border border-[#00c6ed] bg-[rgba(0,198,237,0.1)] px-4 py-3 text-[#00c6ed] transition-all hover:bg-[rgba(0,198,237,0.2)]"
              onClick={() => {
                const blob = new Blob([script.code], { type: "text/plain" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `${script.title.replace(/\s+/g, "-").toLowerCase()}.lua`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              }}
            >
              <i className="fas fa-download mr-2"></i> Download Script
            </button>

            <button
              className="w-full rounded border border-red-500 bg-[rgba(239,68,68,0.1)] px-4 py-3 text-red-500 transition-all hover:bg-[rgba(239,68,68,0.2)]"
              onClick={() => setIsReportModalOpen(true)}
            >
              <i className="fas fa-flag mr-2"></i> Report Script
            </button>
          </div>

          <div className="mt-4 rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
            <h2 className="mb-4 text-xl font-bold text-white">Statistics</h2>

            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-xl text-[#00c6ed] font-semibold">
                <i className="fas fa-eye"></i>
                <span>Views: {script.views}</span>
              </div>
            </div>
          </div>

          {script.game && (
            <div className="mt-4 rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
              <h2 className="mb-4 text-xl font-bold text-white">Game Information</h2>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded">
                  <Image
                    src={script.game.imageUrl || "/placeholder.svg"}
                    alt={script.game.name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                    quality={100}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-white">{script.game.name}</h3>
                  {script.game.gameId && <p className="text-xs text-gray-400">Game ID: {script.game.gameId}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        scriptId={script.id}
        scriptTitle={script.title}
        reportedBy={user ? user.username : "Anonymous"}
      />
    </div>
  )
}
