"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { fetchGameDetailsById, fetchGameDetailsByName } from "@/app/actions/fetch-game-details"
import { scriptCategories } from "@/lib/categories"
import { validateScript } from "@/lib/script-validation"

type GameSearchResult = {
  gameId: string
  name: string
  imageUrl: string
  link: string
  stats: {
    likes: string
    playing: string
  }
}

type GameDetails = {
  name: string
  imageUrl: string
  gameId: string
}

export default function UploadScriptsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [scriptTitle, setScriptTitle] = useState("")
  const [scriptDescription, setScriptDescription] = useState("")
  const [scriptCode, setScriptCode] = useState("")
  const [gameId, setGameId] = useState("")
  const [gameName, setGameName] = useState("")
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null)
  const [isLoadingGame, setIsLoadingGame] = useState(false)
  const [gameError, setGameError] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [message, setMessage] = useState({ type: "", text: "" })
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [searchMethod, setSearchMethod] = useState<"id" | "name">("id")
  const [gameSearchResults, setGameSearchResults] = useState<GameSearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [isNexusTeamMember, setIsNexusTeamMember] = useState(false)
  const [uploadAsTeam, setUploadAsTeam] = useState(false)
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [adminCheckComplete, setAdminCheckComplete] = useState(false)
  const categoriesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push("/login")
    } else {
      // Check if user is banned
      const userData = JSON.parse(localStorage.getItem(`nexus_user_${user.username}`) || "{}")
      if (userData.isBanned) {
        setMessage({
          type: "error",
          text: "Your account has been banned. You cannot upload scripts.",
        })
        return
      }

      // Check if user is admin
      const checkAdminStatus = async () => {
        try {
          const adminStatus = await isAdmin(user.username)
          setUserIsAdmin(adminStatus)
        } catch (error) {
          console.error("Error checking admin status:", error)
          setUserIsAdmin(false)
        } finally {
          setAdminCheckComplete(true)
        }
      }

      checkAdminStatus()
    }
  }, [user, isLoading, router])

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

  const handleFetchGameDetailsById = async () => {
    if (!gameId) {
      setGameError("Please enter a game ID")
      return
    }

    setIsLoadingGame(true)
    setGameError("")
    setGameDetails(null)
    setShowSearchResults(false)

    try {
      const result = await fetchGameDetailsById(gameId)

      if (result.success) {
        setGameDetails(result.data)
        // Update the game name field
        setGameName(result.data.name)
      } else {
        setGameError(result.error)
      }
    } catch (error) {
      console.error("Error fetching game details:", error)
      setGameError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoadingGame(false)
    }
  }

  const handleSearchGamesByName = async () => {
    if (!gameName) {
      setGameError("Please enter a game name")
      return
    }

    setIsLoadingGame(true)
    setGameError("")
    setGameDetails(null)
    setGameSearchResults([])

    try {
      const result = await fetchGameDetailsByName(gameName)

      if (result.success) {
        setGameSearchResults(result.data)
        setShowSearchResults(true)
      } else {
        setGameError(result.error)
      }
    } catch (error) {
      console.error("Error searching games:", error)
      setGameError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoadingGame(false)
    }
  }

  const handleSelectGame = (game: GameSearchResult) => {
    setGameDetails({
      name: game.name,
      imageUrl: game.imageUrl,
      gameId: game.gameId,
    })
    setGameId(game.gameId)
    setShowSearchResults(false)
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })
    setValidationErrors([])

    // Check if user is banned
    if (user) {
      const userData = JSON.parse(localStorage.getItem(`nexus_user_${user.username}`) || "{}")
      if (userData.isBanned) {
        setMessage({
          type: "error",
          text: "Your account has been banned. You cannot upload scripts.",
        })
        return
      }
    }

    if (!scriptTitle || !scriptDescription || !scriptCode) {
      setMessage({ type: "error", text: "Script title, description, and code are required" })
      return
    }

    if (!gameDetails) {
      setMessage({ type: "error", text: "Please fetch valid game details before submitting" })
      return
    }

    if (selectedCategories.length === 0) {
      setMessage({ type: "error", text: "Please select at least one category" })
      return
    }

    // Validate script
    const errors = validateScript(scriptCode)
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    // Create a script object
    const script = {
      id: Date.now().toString(),
      title: scriptTitle,
      description: scriptDescription,
      code: scriptCode,
      author: uploadAsTeam && isNexusTeamMember ? "Nexus Team" : user?.username,
      createdAt: new Date().toISOString(),
      game: {
        id: Date.now(),
        gameId: gameDetails.gameId,
        name: gameDetails.name,
        imageUrl: gameDetails.imageUrl,
      },
      categories: selectedCategories,
      likes: [], // Initialize empty likes array
      dislikes: [], // Initialize empty dislikes array
      views: 0, // Initialize views counter
      isNexusTeam: uploadAsTeam && isNexusTeamMember,
    }

    // Get existing scripts from localStorage or initialize empty array
    const existingScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")

    // Add new script
    existingScripts.push(script)

    // Save back to localStorage
    localStorage.setItem("nexus_scripts", JSON.stringify(existingScripts))

    // Show success message
    setMessage({ type: "success", text: "Script uploaded successfully!" })

    // Reset form
    setScriptTitle("")
    setScriptDescription("")
    setScriptCode("")
    setGameId("")
    setGameName("")
    setGameDetails(null)
    setSelectedCategories([])
    setValidationErrors([])
    setGameSearchResults([])
    setShowSearchResults(false)
    setUploadAsTeam(false)

    // Redirect to scripts page after a delay
    setTimeout(() => {
      router.push("/scripts")
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#00ff9d]"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff3e3e] to-[#ff0000]">
          Upload Script
        </h1>

        {message.text && (
          <div
            className={`mb-6 rounded p-4 ${
              message.type === "error" ? "bg-red-900/30 text-red-200" : "bg-green-900/30 text-green-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="mb-6 rounded border border-red-500/20 bg-red-900/10 p-4">
            <h3 className="mb-2 font-bold text-red-300">Script Validation Errors:</h3>
            <ul className="list-inside list-disc text-red-200">
              {validationErrors.map((error, index) => (
                <li key={index} className="mb-1">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-lg border-l-4 border-[#ff3e3e] bg-[#1a1a1a] p-8">
          <div className="mb-6">
            <label htmlFor="scriptTitle" className="mb-2 block font-medium text-[#ff3e3e]">
              Script Title
            </label>
            <input
              type="text"
              id="scriptTitle"
              value={scriptTitle}
              onChange={(e) => setScriptTitle(e.target.value)}
              className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e] hover:border-[#ff3e3e]/50"
              placeholder="Enter a title for your script"
            />
          </div>

          {isNexusTeamMember && (
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadAsTeam}
                  onChange={() => setUploadAsTeam(!uploadAsTeam)}
                  className="h-4 w-4 rounded border-white/10 bg-[#050505] text-[#00a2ff]"
                />
                <span className="text-white">
                  Upload as{" "}
                  <span>
                    <i style={{ color: "var(--secondary)" }} className="fas fa-user-shield"></i> Nexus Team
                  </span>
                </span>
              </label>
              <p className="mt-1 text-xs text-gray-400">This script will be marked as an official Nexus Team script</p>
            </div>
          )}

          <div className="mb-6">
            <label className="mb-2 block font-medium text-[#ff3e3e]">Game Search</label>

            <div className="mb-4 flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setSearchMethod("id")
                  setShowSearchResults(false)
                }}
                className={`flex-1 rounded px-4 py-2 ${
                  searchMethod === "id"
                    ? "bg-[#00c6ed] text-[#050505] font-semibold"
                    : "bg-[#050505] text-white border border-white/10"
                }`}
              >
                Search by ID
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMethod("name")
                  setShowSearchResults(false)
                }}
                className={`flex-1 rounded px-4 py-2 ${
                  searchMethod === "name"
                    ? "bg-[#00c6ed] text-[#050505] font-semibold"
                    : "bg-[#050505] text-white border border-white/10"
                }`}
              >
                Search by Name
              </button>
            </div>

            {searchMethod === "id" ? (
              <div className="mb-4">
                <label htmlFor="gameId" className="mb-2 block text-sm font-medium text-gray-300">
                  Game ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="gameId"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    className="flex-1 rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00c6ed] focus:outline-none focus:ring-1 focus:ring-[#00c6ed]"
                    placeholder="Enter Roblox game ID"
                  />
                  <button
                    type="button"
                    onClick={handleFetchGameDetailsById}
                    disabled={isLoadingGame}
                    className="rounded bg-[#00c6ed] px-4 py-3 font-semibold text-[#050505] transition-all hover:bg-[#00b8ff] disabled:opacity-50"
                  >
                    {isLoadingGame ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#050505]/20 border-t-[#050505]"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      "Fetch Game"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <label htmlFor="gameName" className="mb-2 block text-sm font-medium text-gray-300">
                  Game Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="gameName"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    className="flex-1 rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00c6ed] focus:outline-none focus:ring-1 focus:ring-[#00c6ed]"
                    placeholder="Enter Roblox game name"
                  />
                  <button
                    type="button"
                    onClick={handleSearchGamesByName}
                    disabled={isLoadingGame}
                    className="rounded bg-[#00c6ed] px-4 py-3 font-semibold text-[#050505] transition-all hover:bg-[#00b8ff] disabled:opacity-50"
                  >
                    {isLoadingGame ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#050505]/20 border-t-[#050505]"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      "Search Game"
                    )}
                  </button>
                </div>
              </div>
            )}

            {gameError && <p className="mt-1 text-sm text-red-400">{gameError}</p>}

            {/* Game search results */}
            {showSearchResults && gameSearchResults.length > 0 && (
              <div className="mt-4 max-h-80 overflow-y-auto rounded border border-white/10 bg-[#050505] p-2">
                <h3 className="mb-2 px-2 text-sm font-medium text-gray-300">Search Results</h3>
                <div className="space-y-2">
                  {gameSearchResults.map((game) => (
                    <div
                      key={game.gameId}
                      className="flex cursor-pointer items-center gap-3 rounded p-2 transition-all hover:bg-[#1a1a1a]"
                      onClick={() => handleSelectGame(game)}
                    >
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                        <img
                          src={game.imageUrl || "/placeholder.svg"}
                          alt={game.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{game.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>
                            <i className="fas fa-thumbs-up mr-1"></i> {game.stats.likes}
                          </span>
                          <span>
                            <i className="fas fa-user mr-1"></i> {game.stats.playing}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {gameDetails && (
            <div className="mb-6 rounded border border-white/10 bg-[#050505] p-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded">
                  <img
                    src={gameDetails.imageUrl || "/placeholder.svg"}
                    alt={gameDetails.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-white">{gameDetails.name}</h3>
                  <p className="text-sm text-gray-400">Game ID: {gameDetails.gameId}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="mb-2 block font-medium text-[#ff3e3e]">Categories</label>
            <div className="relative" ref={categoriesRef}>
              <button
                type="button"
                onClick={() => setShowCategories(!showCategories)}
                className="w-full flex justify-between items-center rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00c6ed] focus:outline-none focus:ring-1 focus:ring-[#00c6ed]"
              >
                <span>
                  {selectedCategories.length === 0
                    ? "Select Categories"
                    : `${selectedCategories.length} ${selectedCategories.length === 1 ? "Category" : "Categories"} Selected`}
                </span>
                <i className={`fas fa-chevron-${showCategories ? "up" : "down"} text-gray-400`}></i>
              </button>

              {showCategories && (
                <div className="absolute z-10 mt-1 w-full rounded border border-white/10 bg-[#050505] py-1 shadow-lg max-h-60 overflow-y-auto">
                  {scriptCategories.map((category) => (
                    <div
                      key={category.id}
                      className="px-4 py-2 hover:bg-[#1a1a1a] cursor-pointer flex items-center"
                      onClick={() => handleCategoryToggle(category.id)}
                    >
                      <div
                        className={`mr-2 flex h-4 w-4 items-center justify-center rounded border ${
                          selectedCategories.includes(category.id) ? "border-[#ff3e3e] bg-[#ff3e3e]" : "border-white/30"
                        }`}
                      >
                        {selectedCategories.includes(category.id) && (
                          <i className="fas fa-check text-xs text-[#050505]"></i>
                        )}
                      </div>
                      <span className={selectedCategories.includes(category.id) ? "text-[#ff3e3e]" : "text-white"}>
                        {category.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-400">Select all that apply</p>
          </div>

          <div className="mb-6">
            <label htmlFor="scriptDescription" className="mb-2 block font-medium text-[#ff3e3e]">
              Description
            </label>
            <textarea
              id="scriptDescription"
              value={scriptDescription}
              onChange={(e) => setScriptDescription(e.target.value)}
              className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e] hover:border-[#ff3e3e]/50"
              rows={3}
              placeholder="Describe what your script does"
              maxLength={500}
            />
            <p className="mt-1 text-right text-xs text-gray-400">{scriptDescription.length}/500 characters</p>
          </div>

          <div className="mb-6">
            <label htmlFor="scriptCode" className="mb-2 block font-medium text-[#ff3e3e]">
              Script Code
            </label>
            <textarea
              id="scriptCode"
              value={scriptCode}
              onChange={(e) => setScriptCode(e.target.value)}
              className="font-mono w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#ff3e3e] focus:outline-none focus:ring-1 focus:ring-[#ff3e3e] hover:border-[#ff3e3e]/50"
              rows={10}
              placeholder="-- Paste your Lua script here"
            />
            <p className="mt-1 text-xs text-gray-400">
              Script must be under 1000 lines and contain at least one of these keywords: loadstring, local, or luarmor.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 rounded bg-gradient-to-r from-[#ff3e3e] to-[#ff0000] px-4 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#ff3e3e]/20 hover:scale-105 transform duration-300"
            >
              <i className="fas fa-upload mr-2"></i> Upload Script
            </button>
            <Link
              href="/scripts"
              className="rounded border border-white/10 bg-[#050505] px-4 py-3 font-semibold text-white transition-all hover:bg-[#1a1a1a]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

async function isAdmin(username: string): Promise<boolean> {
  // Replace with your actual admin check logic (e.g., fetching from a database)
  // This is just a placeholder
  return username === "Nexus"
}
