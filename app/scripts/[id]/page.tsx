"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import Image from "next/image"
import { logActivity } from "@/lib/activity-logger"

type Script = {
  id: string
  title: string
  description: string
  code: string
  author: string
  createdAt: string
  game: {
    id: number
    gameId: string
    name: string
    imageUrl: string
  }
  categories: string[]
  likes: string[]
  dislikes: string[]
  views: number
  isNexusTeam?: boolean
}

export default function ScriptDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [script, setScript] = useState<Script | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  useEffect(() => {
    const loadScript = () => {
      try {
        // Get all scripts from localStorage
        const scripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")

        // Find the script with the matching ID
        const foundScript = scripts.find((s: Script) => s.id === id)

        if (foundScript) {
          // Increment view count
          foundScript.views = (foundScript.views || 0) + 1

          // Save back to localStorage
          localStorage.setItem("nexus_scripts", JSON.stringify(scripts))

          // Set the script state
          setScript(foundScript)

          // Log the view
          if (user) {
            logActivity(user.username, "view_script", `Viewed script: ${foundScript.title}`)
          }
        } else {
          setError("Script not found")
        }
      } catch (error) {
        console.error("Error loading script:", error)
        setError("An error occurred while loading the script")
      } finally {
        setIsLoading(false)
      }
    }

    loadScript()
  }, [id, user])

  const handleCopyCode = () => {
    if (script) {
      navigator.clipboard.writeText(script.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLikeDislike = (action: "like" | "dislike") => {
    if (!user || !script) return

    // Check if user is banned
    const userData = JSON.parse(localStorage.getItem(`nexus_user_${user.username}`) || "{}")
    if (userData.isBanned) {
      alert("Your account has been banned. You cannot like or dislike scripts.")
      return
    }

    // Get all scripts from localStorage
    const scripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")

    // Find the script with the matching ID
    const scriptIndex = scripts.findIndex((s: Script) => s.id === id)

    if (scriptIndex !== -1) {
      // Remove user from both arrays first
      scripts[scriptIndex].likes = scripts[scriptIndex].likes.filter((userId: string) => userId !== user.id)
      scripts[scriptIndex].dislikes = scripts[scriptIndex].dislikes.filter((userId: string) => userId !== user.id)

      // Add user to the appropriate array
      if (action === "like") {
        scripts[scriptIndex].likes.push(user.id)
      } else {
        scripts[scriptIndex].dislikes.push(user.id)
      }

      // Save back to localStorage
      localStorage.setItem("nexus_scripts", JSON.stringify(scripts))

      // Update the script state
      setScript(scripts[scriptIndex])
    }
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
        <div className="rounded-lg border border-red-500/20 bg-red-900/10 p-8 text-center">
          <div className="mb-4 text-5xl text-red-400">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">Script Not Found</h2>
          <p className="mb-6 text-gray-400">The script you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/scripts"
            className="inline-flex items-center rounded bg-[#00c6ed] px-6 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00c6ed]/20"
          >
            <i className="fas fa-arrow-left mr-2"></i> Back to Scripts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Link
              href="/scripts"
              className="mb-2 inline-flex items-center text-sm font-medium text-[#00c6ed] hover:underline"
            >
              <i className="fas fa-arrow-left mr-2"></i> Back to Scripts
            </Link>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
              {script.title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center rounded border border-white/10 bg-[#050505] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#1a1a1a]"
            >
              <i className="fas fa-flag mr-2 text-red-400"></i> Report
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-[#0a0a0a]">
                    {script.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-white">{script.author}</div>
                    <div className="text-sm text-gray-400">{new Date(script.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {script.isNexusTeam && (
                  <div className="rounded bg-[#00ff9d] px-3 py-1 text-sm font-bold text-[#050505]">
                    <i className="fas fa-shield-alt mr-1"></i> Nexus Team
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h2 className="mb-2 text-lg font-medium text-[#00c6ed]">Description</h2>
                <p className="text-gray-300">{script.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="mb-2 text-lg font-medium text-[#00c6ed]">Script Code</h2>
                <div className="relative">
                  <div className="max-h-96 overflow-y-auto rounded border border-white/10 bg-[#050505] p-4 font-mono text-sm text-gray-300">
                    <pre className="whitespace-pre-wrap">{script.code}</pre>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="absolute right-2 top-2 rounded bg-[#1a1a1a] p-2 text-gray-400 transition-all hover:bg-[#2a2a2a] hover:text-white"
                    title="Copy code"
                  >
                    {copied ? <i className="fas fa-check"></i> : <i className="fas fa-copy"></i>}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLikeDislike("like")}
                    className={`flex items-center gap-1 ${
                      user && script.likes.includes(user.id) ? "text-green-400" : "text-gray-400 hover:text-green-400"
                    }`}
                    disabled={!user}
                  >
                    <i className="fas fa-thumbs-up text-lg"></i>
                    <span className="text-sm font-medium">{script.likes.length}</span>
                  </button>

                  <button
                    onClick={() => handleLikeDislike("dislike")}
                    className={`flex items-center gap-1 ${
                      user && script.dislikes.includes(user.id) ? "text-red-400" : "text-gray-400 hover:text-red-400"
                    }`}
                    disabled={!user}
                  >
                    <i className="fas fa-thumbs-down text-lg"></i>
                    <span className="text-sm font-medium">{script.dislikes.length}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 text-gray-400">
                  <i className="fas fa-eye"></i>
                  <span className="text-sm">{script.views} views</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
              <h2 className="mb-4 text-lg font-medium text-[#00c6ed]">Game Information</h2>

              <div className="mb-4 overflow-hidden rounded">
                <Image
                  src={script.game.imageUrl || "/placeholder.svg"}
                  alt={script.game.name}
                  width={300}
                  height={150}
                  className="h-32 w-full object-cover"
                />
              </div>

              <h3 className="mb-1 font-medium text-white">{script.game.name}</h3>
              <p className="mb-4 text-sm text-gray-400">Game ID: {script.game.gameId}</p>

              <a
                href={`https://www.roblox.com/games/${script.game.gameId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-[#00c6ed] hover:underline"
              >
                View on Roblox <i className="fas fa-external-link-alt ml-1"></i>
              </a>
            </div>

            <div className="mt-6 rounded-lg border border-white/10 bg-[#1a1a1a] p-6">
              <h2 className="mb-4 text-lg font-medium text-[#00c6ed]">Categories</h2>

              <div className="flex flex-wrap gap-2">
                {script.categories.map((categoryId) => {
                  // Find category name from the ID
                  const categoryName = getCategoryName(categoryId)
                  return (
                    <span
                      key={categoryId}
                      className="rounded-full bg-[#050505] px-3 py-1 text-xs font-medium text-gray-300"
                    >
                      {categoryName}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get category name from ID
function getCategoryName(categoryId: string): string {
  const categories = [
    { id: "combat", name: "Combat" },
    { id: "movement", name: "Movement" },
    { id: "esp", name: "ESP" },
    { id: "utility", name: "Utility" },
    { id: "gui", name: "GUI" },
    { id: "farm", name: "Farming" },
    { id: "exploit", name: "Exploit" },
    { id: "misc", name: "Miscellaneous" },
  ]

  const category = categories.find((c) => c.id === categoryId)
  return category ? category.name : categoryId
}
