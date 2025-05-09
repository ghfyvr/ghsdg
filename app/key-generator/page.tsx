"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import { isAdmin } from "@/lib/admin"
import { useRouter } from "next/navigation"

type Key = {
  id: string
  title: string
  description: string
  keyCode: string
  author: string
  createdAt: string
  imageUrl: string
  likes: string[]
  dislikes: string[]
  isPremium?: boolean
  isNexusTeam?: boolean
}

export default function KeyGeneratorPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [keys, setKeys] = useState<Key[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [userIsAdmin, setUserIsAdmin] = useState(false)

  useEffect(() => {
    // Load keys from localStorage
    const storedKeys = JSON.parse(localStorage.getItem("nexus_keys") || "[]")

    // Mark keys from Nexus Team members
    const markNexusTeamKeys = async () => {
      const markedKeys = await Promise.all(
        storedKeys.map(async (key: Key) => {
          const isNexusTeam = await isAdmin(key.author)
          return { ...key, isNexusTeam }
        }),
      )

      // Save back to localStorage with the new properties
      localStorage.setItem("nexus_keys", JSON.stringify(markedKeys))
      setKeys(markedKeys)
      setIsLoading(false)
    }

    markNexusTeamKeys()

    // Check if user is admin
    if (user) {
      const checkAdminStatus = async () => {
        const adminStatus = await isAdmin(user.username)
        setUserIsAdmin(adminStatus)
      }
      checkAdminStatus()
    }
  }, [user])

  // Filter keys based on search
  const filteredKeys = keys.filter((key) => {
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        key.title.toLowerCase().includes(searchLower) ||
        key.description.toLowerCase().includes(searchLower) ||
        key.author.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  // Sort keys based on the requirements
  const sortedKeys = [...filteredKeys].sort((a, b) => {
    // If searching, prioritize Nexus Team, Premium, and most liked
    if (searchTerm) {
      // First priority: Nexus Team keys
      if (a.isNexusTeam && !b.isNexusTeam) return -1
      if (!a.isNexusTeam && b.isNexusTeam) return 1

      // Second priority: Premium keys
      if (a.isPremium && !b.isPremium) return -1
      if (!a.isPremium && b.isPremium) return 1

      // Third priority: Most liked
      return b.likes.length - a.likes.length
    }

    // If not searching, sort by newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const handleLikeDislike = (keyId: string, action: "like" | "dislike") => {
    if (!user) return

    // Create a copy of all keys
    const allKeys = [...keys]
    const keyIndex = allKeys.findIndex((k) => k.id === keyId)

    if (keyIndex === -1) return

    const key = allKeys[keyIndex]

    // Remove user from both arrays first
    key.likes = key.likes.filter((id) => id !== user.id)
    key.dislikes = key.dislikes.filter((id) => id !== user.id)

    // Add user to the appropriate array
    if (action === "like") {
      key.likes.push(user.id)
    } else {
      key.dislikes.push(user.id)
    }

    // Update state and localStorage
    setKeys(allKeys)
    localStorage.setItem("nexus_keys", JSON.stringify(allKeys))
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

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
          Key Generator
        </h1>

        <div className="flex gap-4">
          {user && userIsAdmin && (
            <Link
              href="/upload-keys"
              className="inline-flex items-center rounded bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] px-4 py-2 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00ff9d]/20"
            >
              <i className="fas fa-upload mr-2"></i> Upload Key
            </Link>
          )}
        </div>
      </div>

      <div className="mb-8">
        <label htmlFor="search" className="mb-2 block text-sm font-medium text-[#00c6ed]">
          Search Keys
        </label>
        <div className="relative">
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border border-white/10 bg-[#050505] pl-10 pr-4 py-3 text-white transition-all focus:border-[#00c6ed] focus:outline-none focus:ring-1 focus:ring-[#00c6ed]"
            placeholder="Search by title, description, or author..."
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

      {sortedKeys.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-8 text-center">
          <div className="mb-4 text-5xl text-[#00ff9d]">
            <i className="fas fa-key"></i>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">No Keys Available</h2>
          <p className="mb-6 text-gray-400">
            {searchTerm
              ? "No keys match your search criteria. Try adjusting your search."
              : user && userIsAdmin
                ? "Be the first to upload a key to the NEXUS platform!"
                : "Keys will be available soon. Check back later!"}
          </p>
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm("")}
              className="inline-flex items-center rounded bg-[#00c6ed] px-6 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00c6ed]/20"
            >
              <i className="fas fa-times mr-2"></i> Clear Search
            </button>
          ) : user && userIsAdmin ? (
            <Link
              href="/upload-keys"
              className="inline-flex items-center rounded bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] px-6 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00ff9d]/20"
            >
              <i className="fas fa-upload mr-2"></i> Upload Key
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedKeys.map((key) => (
            <div
              key={key.id}
              className={`rounded-lg border overflow-hidden transition-all hover:shadow-lg ${
                key.isNexusTeam
                  ? "border-[#00ff9d] bg-[#1a1a1a]/90 hover:shadow-[#00ff9d]/5"
                  : key.isPremium
                    ? "border-[#BA55D3] bg-[#1a1a1a]/90 hover:shadow-[#BA55D3]/5"
                    : "border-white/10 bg-[#1a1a1a] hover:shadow-[#00c6ed]/5"
              }`}
            >
              <div className="relative h-40 w-full">
                <Image
                  src={key.imageUrl || "/placeholder.svg"}
                  alt={key.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  quality={100}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0a] to-transparent p-2">
                  <span className="text-xs font-medium text-gray-300">Premium Key</span>
                </div>
                {key.isNexusTeam && (
                  <div className="absolute top-2 right-2 rounded bg-[#00ff9d] px-2 py-1 text-xs font-bold text-[#050505]">
                    <span>
                      <i style={{ color: "var(--secondary)" }} className="fas fa-user-shield"></i> Nexus Team
                    </span>
                  </div>
                )}
                {key.isPremium && !key.isNexusTeam && (
                  <div className="absolute top-2 right-2 rounded bg-[#BA55D3] px-2 py-1 text-xs font-bold text-white">
                    PREMIUM
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="mb-2">
                  <h2 className="text-xl font-bold text-white">{key.title}</h2>
                </div>
                <p className="mb-3 text-sm text-gray-400">
                  By {key.author} • {new Date(key.createdAt).toLocaleDateString()}
                </p>
                <p className="mb-4 text-gray-300 line-clamp-3">{key.description}</p>

                <div className="mb-4 flex items-center gap-4">
                  <button
                    onClick={() => handleLikeDislike(key.id, "like")}
                    className={`flex items-center gap-1 ${user && key.likes.includes(user.id) ? "text-green-400" : "text-gray-400 hover:text-green-400"}`}
                    disabled={!user}
                  >
                    <i className="fas fa-thumbs-up"></i>
                    <span>{key.likes.length}</span>
                  </button>

                  <button
                    onClick={() => handleLikeDislike(key.id, "dislike")}
                    className={`flex items-center gap-1 ${user && key.dislikes.includes(user.id) ? "text-red-400" : "text-gray-400 hover:text-red-400"}`}
                    disabled={!user}
                  >
                    <i className="fas fa-thumbs-down"></i>
                    <span>{key.dislikes.length}</span>
                  </button>
                </div>

                <Link
                  href={`/key-generator/${key.id}`}
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
