"use client"

import { useRef } from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import { scriptCategories } from "@/lib/categories"
import { isAdmin } from "@/lib/admin"

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
  isPremium?: boolean
  isNexusTeam?: boolean
  isHidden?: boolean
}

export default function ScriptsPage() {
  const { user } = useAuth()
  const [scripts, setScripts] = useState<Script[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCategories, setShowCategories] = useState(false)
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const categoriesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load scripts from localStorage
    const storedScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")

    // Check if current user is admin
    if (user) {
      const checkAdminStatus = async () => {
        const adminStatus = await isAdmin(user.username)
        setUserIsAdmin(adminStatus)

        // If user is not admin, filter out hidden scripts
        if (!adminStatus) {
          const visibleScripts = storedScripts.filter((script: Script) => !script.isHidden)
          setScripts(visibleScripts)
        } else {
          setScripts(storedScripts)
        }

        setIsLoading(false)
      }
      checkAdminStatus()
    } else {
      // For non-logged in users, filter out hidden scripts
      const visibleScripts = storedScripts.filter((script: Script) => !script.isHidden)
      setScripts(visibleScripts)
      setIsLoading(false)
    }
  }, [user])

  // Close categories dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setShowCategories(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [categoriesRef])

  // Filter scripts based on search and category
  const filteredScripts = scripts.filter((script) => {
    // Filter by category if selected
    if (selectedCategory && (!script.categories || !script.categories.includes(selectedCategory))) {
      return false
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        script.title.toLowerCase().includes(searchLower) ||
        script.description.toLowerCase().includes(searchLower) ||
        script.author.toLowerCase().includes(searchLower) ||
        script.game.name.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  // Sort scripts based on the requirements
  const sortedScripts = [...filteredScripts].sort((a, b) => {
    // If searching, prioritize Nexus Team, Premium, and most visited
    if (searchTerm) {
      // First priority: Nexus Team scripts
      if (a.isNexusTeam && !b.isNexusTeam) return -1
      if (!a.isNexusTeam && b.isNexusTeam) return 1

      // Second priority: Premium scripts
      if (a.isPremium && !b.isPremium) return -1
      if (!a.isPremium && b.isPremium) return 1

      // Third priority: Most visited
      return (b.views || 0) - (a.views || 0)
    }

    // If not searching, sort by newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Function to organize scripts into rows with special placement
  const organizeScriptsIntoRows = (scripts: Script[]) => {
    if (!searchTerm) {
      // If not searching, just return the scripts sorted by newest
      return scripts
    }

    // When searching, organize with special placement
    const nexusTeamScripts = scripts.filter((script) => script.isNexusTeam)
    const premiumScripts = scripts.filter((script) => script.isPremium && !script.isNexusTeam)
    const regularScripts = scripts.filter((script) => !script.isNexusTeam && !script.isPremium)

    // Sort regular scripts by views
    regularScripts.sort((a, b) => (b.views || 0) - (a.views || 0))

    // Organize into rows with special placement
    const organizedScripts: Script[] = []
    const maxRows = Math.max(
      Math.ceil(nexusTeamScripts.length / 1),
      Math.ceil(premiumScripts.length / 1),
      Math.ceil(regularScripts.length / 1),
    )

    for (let i = 0; i < maxRows; i++) {
      // Add one Nexus Team script per row if available
      if (i < nexusTeamScripts.length) {
        organizedScripts.push(nexusTeamScripts[i])
      }

      // Add one Premium script per row if available
      if (i < premiumScripts.length) {
        organizedScripts.push(premiumScripts[i])
      }

      // Add one regular script per row if available
      if (i < regularScripts.length) {
        organizedScripts.push(regularScripts[i])
      }
    }

    return organizedScripts
  }

  const organizedScripts = organizeScriptsIntoRows(sortedScripts)

  if (isLoading) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#00ff9d]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
          Available Scripts
        </h1>

        {user && (
          <Link
            href="/upload-scripts"
            className="inline-flex items-center rounded bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] px-4 py-2 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00ff9d]/20"
          >
            <i className="fas fa-upload mr-2"></i> Upload Script
          </Link>
        )}
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="search" className="mb-2 block text-sm font-medium text-[#00c6ed]">
            Search Scripts
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border border-white/10 bg-[#050505] pl-10 pr-4 py-3 text-white transition-all focus:border-[#00c6ed] focus:outline-none focus:ring-1 focus:ring-[#00c6ed]"
              placeholder="Search by title, description, author, or game..."
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        <div ref={categoriesRef}>
          <label className="mb-2 block text-sm font-medium text-[#00c6ed]">Filter by Category</label>
          <div className="relative">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="w-full flex justify-between items-center rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00c6ed] focus:outline-none focus:ring-1 focus:ring-[#00c6ed]"
            >
              <span>
                {selectedCategory ? scriptCategories.find((c) => c.id === selectedCategory)?.name : "All Categories"}
              </span>
              <i className={`fas fa-chevron-${showCategories ? "up" : "down"} text-gray-400`}></i>
            </button>

            {showCategories && (
              <div className="absolute z-10 mt-1 w-full rounded border border-white/10 bg-[#050505] py-1 shadow-lg">
                <button
                  onClick={() => {
                    setSelectedCategory(null)
                    setShowCategories(false)
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-[#1a1a1a] ${!selectedCategory ? "text-[#00c6ed]" : "text-white"}`}
                >
                  All Categories
                </button>
                {scriptCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setShowCategories(false)
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-[#1a1a1a] ${selectedCategory === category.id ? "text-[#00c6ed]" : "text-white"}`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {organizedScripts.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-8 text-center">
          <div className="mb-4 text-5xl text-[#00ff9d]">
            <i className="fas fa-code"></i>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">No Scripts Available</h2>
          <p className="mb-6 text-gray-400">
            {searchTerm || selectedCategory
              ? "No scripts match your search criteria. Try adjusting your filters."
              : user
                ? "Be the first to upload a script to the NEXUS platform!"
                : "Sign up to upload scripts to the NEXUS platform!"}
          </p>
          {searchTerm || selectedCategory ? (
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory(null)
              }}
              className="inline-flex items-center rounded bg-[#00c6ed] px-6 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00c6ed]/20"
            >
              <i className="fas fa-times mr-2"></i> Clear Filters
            </button>
          ) : user ? (
            <Link
              href="/upload-scripts"
              className="inline-flex items-center rounded bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] px-6 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00ff9d]/20"
            >
              <i className="fas fa-upload mr-2"></i> Upload Script
            </Link>
          ) : (
            <Link
              href="/signup"
              className="inline-flex items-center rounded bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] px-6 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00ff9d]/20"
            >
              <i className="fas fa-user-plus mr-2"></i> Sign Up
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizedScripts.map((script) => (
            <div
              key={script.id}
              className={`rounded-lg border overflow-hidden transition-all hover:shadow-lg ${
                script.isNexusTeam
                  ? "border-[#00ff9d] bg-[#1a1a1a]/90 hover:shadow-[#00ff9d]/5"
                  : script.isPremium
                    ? "border-[#BA55D3] bg-[#1a1a1a]/90 hover:shadow-[#BA55D3]/5"
                    : "border-white/10 bg-[#1a1a1a] hover:shadow-[#00c6ed]/5"
              }`}
            >
              {script.game && (
                <div className="relative h-40 w-full">
                  <Image
                    src={script.game.imageUrl || "/placeholder.svg"}
                    alt={script.game.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    quality={100}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] to-transparent p-2">
                    <span className="text-xs font-medium text-gray-300">{script.game.name}</span>
                  </div>
                  {script.isNexusTeam && (
                    <div className="absolute top-2 right-2 rounded bg-[#00ff9d] px-2 py-1 text-xs font-bold text-[#050505]">
                      <span>
                        <i style={{ color: "var(--secondary)" }} className="fas fa-user-shield"></i> Nexus Team
                      </span>
                    </div>
                  )}
                  {script.isPremium && !script.isNexusTeam && (
                    <div className="absolute top-2 right-2 rounded bg-[#BA55D3] px-2 py-1 text-xs font-bold text-white">
                      PREMIUM
                    </div>
                  )}
                </div>
              )}
              <div className="p-6">
                <div className="mb-2">
                  <h2 className="text-xl font-bold text-white">{script.title}</h2>
                </div>
                <p className="mb-3 text-sm text-gray-400">
                  By{" "}
                  <Link href={`/profile/${script.author}`} className="hover:underline">
                    {script.author}
                  </Link>{" "}
                  • {new Date(script.createdAt).toLocaleDateString()}
                </p>
                {script.categories && script.categories.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {script.categories.map((categoryId) => {
                      const category = scriptCategories.find((c) => c.id === categoryId)
                      return (
                        category && (
                          <span
                            key={categoryId}
                            className="rounded bg-[#00c6ed]/10 px-2 py-0.5 text-xs font-medium text-[#00c6ed]"
                          >
                            {category.name}
                          </span>
                        )
                      )
                    })}
                  </div>
                )}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[#00c6ed] font-medium">
                    <i className="fas fa-eye"></i>
                    <span>{script.views || 0}</span>
                  </div>
                </div>
                <p className="mb-4 text-gray-300 line-clamp-3">{script.description}</p>
                <Link
                  href={`/scripts/${script.id}`}
                  className="inline-flex items-center text-sm font-medium text-[#00ff9d] hover:underline"
                >
                  View Details <i className="fas fa-arrow-right ml-2"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
