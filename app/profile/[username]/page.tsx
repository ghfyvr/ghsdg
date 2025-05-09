"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"
import { scriptCategories } from "@/lib/categories"
import { isAdmin } from "@/lib/admin"
import { AdminPanel } from "@/components/admin-panel"

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
}

type UserProfile = {
  username: string
  email?: string
  emailVerified?: boolean
  createdAt: string
  profilePicture?: string
  bio?: string
}

export default function ProfilePage() {
  const { username } = useParams()
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null)
  const [userScripts, setUserScripts] = useState<Script[]>([])
  const [isLoadingScripts, setIsLoadingScripts] = useState(true)
  const [activeTab, setActiveTab] = useState<"scripts" | "stats">("scripts")
  const [isUserAdmin, setIsUserAdmin] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [bio, setBio] = useState("")
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false)

  // Add profile picture upload functionality
  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB")
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("File must be an image")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfilePicture(event.target.result as string)

        // Save the profile picture immediately
        if (profileUser) {
          const updatedProfile = {
            ...profileUser,
            profilePicture: event.target.result as string,
          }
          localStorage.setItem(`nexus_profile_${username}`, JSON.stringify(updatedProfile))
          setProfileUser(updatedProfile)
        }
      }
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (!isLoading) {
      // Check if this is the user's own profile
      if (user && username === user.username) {
        setIsOwnProfile(true)

        // Load user profile from localStorage or create if it doesn't exist
        const userProfileData = localStorage.getItem(`nexus_profile_${username}`)

        if (userProfileData) {
          const parsedProfile = JSON.parse(userProfileData)
          setProfileUser(parsedProfile)
          setBio(parsedProfile.bio || "")
          setProfilePicture(parsedProfile.profilePicture || null)
        } else {
          // Create a new profile for the user
          const newProfile = {
            username: user.username,
            email: user.email,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            bio: "",
            profilePicture: null,
          }

          localStorage.setItem(`nexus_profile_${username}`, JSON.stringify(newProfile))
          setProfileUser(newProfile)
        }
      } else {
        // Load other user's profile
        const userProfileData = localStorage.getItem(`nexus_profile_${username}`)

        if (userProfileData) {
          const parsedProfile = JSON.parse(userProfileData)
          setProfileUser(parsedProfile)
          setBio(parsedProfile.bio || "")
          setProfilePicture(parsedProfile.profilePicture || null)
        } else {
          // Try to find user data from user storage
          const userData = localStorage.getItem(`nexus_user_${username}`)

          if (userData) {
            const parsedUserData = JSON.parse(userData)
            const newProfile = {
              username: username as string,
              email: parsedUserData.email,
              emailVerified: parsedUserData.emailVerified,
              createdAt: parsedUserData.createdAt || new Date().toISOString(),
              bio: "",
              profilePicture: null,
            }

            localStorage.setItem(`nexus_profile_${username}`, JSON.stringify(newProfile))
            setProfileUser(newProfile)
          } else {
            // User not found
            router.push("/404")
          }
        }
      }

      // Check if user is admin
      const checkAdminStatus = async () => {
        try {
          // Check if the profile user is admin
          const profileAdminStatus = await isAdmin(username as string)
          setIsUserAdmin(profileAdminStatus)

          // Check if the current user is admin
          if (user) {
            const currentUserAdminStatus = await isAdmin(user.username)
            setCurrentUserIsAdmin(currentUserAdminStatus)
          }
        } catch (error) {
          console.error("Error checking admin status:", error)
        }
      }

      checkAdminStatus()
    }
  }, [username, user, isLoading, router])

  useEffect(() => {
    // Load scripts from localStorage
    const storedScripts = JSON.parse(localStorage.getItem("nexus_scripts") || "[]")

    // Filter scripts by the profile user
    const filteredScripts = storedScripts.filter((script: Script) => script.author === username)

    setUserScripts(filteredScripts)
    setIsLoadingScripts(false)
  }, [username])

  // Calculate user stats
  const totalScripts = userScripts.length
  const totalViews = userScripts.reduce((sum, script) => sum + (script.views || 0), 0)

  const saveProfile = () => {
    if (!profileUser || !isOwnProfile) return

    const updatedProfile = {
      ...profileUser,
      bio,
      profilePicture,
    }

    localStorage.setItem(`nexus_profile_${username}`, JSON.stringify(updatedProfile))
    setProfileUser(updatedProfile)
    setIsEditingProfile(false)
  }

  if (isLoading || isLoadingScripts || !profileUser) {
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
      <div className="mx-auto max-w-4xl">
        {/* Profile Header */}
        <div className="mb-8 rounded-lg border-l-4 border-[#00ff9d] bg-[#1a1a1a] p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            {/* Update the profile header section to include profile picture upload */}
            <div className="relative">
              {profilePicture ? (
                <div className="h-24 w-24 overflow-hidden rounded-full">
                  <img
                    src={profilePicture || "/placeholder.svg"}
                    alt={profileUser.username}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-4xl font-bold text-[#0a0a0a]">
                  {profileUser.username.charAt(0).toUpperCase()}
                </div>
              )}

              {isOwnProfile && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 rounded-full bg-[#00ff9d] p-2 text-[#050505] hover:bg-[#00e68a]"
                >
                  <i className="fas fa-camera"></i>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureUpload}
                  />
                </button>
              )}
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start">
                <h1 className="mb-2 text-3xl font-bold text-white">{profileUser.username}</h1>
                {isUserAdmin && (
                  <span className="ml-2 rounded bg-[#00ff9d]/20 px-2 py-0.5 text-xs text-[#00ff9d]">
                    <i className="fas fa-shield-alt mr-1 text-[#00a2ff]"></i> NEXUS TEAM
                  </span>
                )}
              </div>
              <p className="text-gray-400">Member since {new Date(profileUser.createdAt).toLocaleDateString()}</p>
              {profileUser.email && (
                <p className="mt-1 flex items-center justify-center md:justify-start">
                  <span className={profileUser.emailVerified ? "text-green-400" : "text-yellow-400"}>
                    {profileUser.email}
                  </span>
                  {profileUser.emailVerified ? (
                    <span className="ml-2 rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                      <i className="fas fa-check-circle mr-1"></i> Verified
                    </span>
                  ) : (
                    <span className="ml-2 rounded bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                      <i className="fas fa-exclamation-circle mr-1"></i> Unverified
                    </span>
                  )}
                </p>
              )}

              {isEditingProfile ? (
                <div className="mt-3">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write something about yourself..."
                    className="w-full rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all focus:border-[#00ff9d] focus:outline-none"
                    rows={3}
                    maxLength={200}
                  />
                  <div className="mt-2 flex justify-between">
                    <p className="text-xs text-gray-400">{bio.length}/200</p>
                    <div className="flex gap-2">
                      <button
                        onClick={saveProfile}
                        className="rounded bg-[#00ff9d] px-3 py-1 text-xs font-medium text-[#050505]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="rounded bg-gray-700 px-3 py-1 text-xs font-medium text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {profileUser.bio ? (
                    <div className="mt-3 text-gray-300">
                      <p>{profileUser.bio}</p>
                      {isOwnProfile && (
                        <button
                          onClick={() => setIsEditingProfile(true)}
                          className="mt-2 text-xs text-[#00c6ed] hover:underline"
                        >
                          <i className="fas fa-edit mr-1"></i> Edit Bio
                        </button>
                      )}
                    </div>
                  ) : isOwnProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="mt-3 text-sm text-[#00c6ed] hover:underline"
                    >
                      <i className="fas fa-plus-circle mr-1"></i> Add Bio
                    </button>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
        {/* Admin Panel - Show only if current user is admin and viewing someone else's profile */}
        {user && currentUserIsAdmin && user.username !== username && <AdminPanel username={username as string} />}

        {/* Tabs */}
        <div className="mb-6 flex border-b border-white/10">
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === "scripts" ? "border-b-2 border-[#00ff9d] text-[#00ff9d]" : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("scripts")}
          >
            <i className="fas fa-code mr-2"></i> Scripts
          </button>
          <button
            className={`px-6 py-3 font-medium ${
              activeTab === "stats" ? "border-b-2 border-[#00ff9d] text-[#00ff9d]" : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("stats")}
          >
            <i className="fas fa-chart-bar mr-2"></i> Stats
          </button>
        </div>

        {/* Content */}
        {activeTab === "scripts" ? (
          <>
            {userScripts.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-8 text-center">
                <div className="mb-4 text-5xl text-[#00ff9d]">
                  <i className="fas fa-code"></i>
                </div>
                <h2 className="mb-2 text-xl font-bold text-white">No Scripts Uploaded</h2>
                <p className="mb-6 text-gray-400">
                  {isOwnProfile
                    ? "You haven't uploaded any scripts yet."
                    : `${profileUser.username} hasn't uploaded any scripts yet.`}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/upload-scripts"
                    className="inline-flex items-center rounded bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] px-6 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00ff9d]/20"
                  >
                    <i className="fas fa-upload mr-2"></i> Upload Your First Script
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userScripts.map((script) => (
                  <div
                    key={script.id}
                    className="rounded-lg border border-white/10 bg-[#1a1a1a] overflow-hidden transition-all hover:border-[#00ff9d]/30 hover:shadow-lg hover:shadow-[#00ff9d]/5"
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
                      </div>
                    )}
                    <div className="p-6">
                      <div className="mb-2">
                        <h2 className="text-xl font-bold text-white">{script.title}</h2>
                      </div>
                      <p className="mb-3 text-sm text-gray-400">{new Date(script.createdAt).toLocaleDateString()}</p>
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
          </>
        ) : (
          <div className="rounded-lg border border-white/10 bg-[#1a1a1a] p-8">
            <h2 className="mb-6 text-xl font-bold text-white">
              {isOwnProfile ? "Your Statistics" : `${profileUser.username}'s Statistics`}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-[#050505] p-4 text-center">
                <div className="mb-2 text-3xl text-[#00ff9d]">{totalScripts}</div>
                <div className="text-sm text-gray-400">Total Scripts</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#050505] p-4 text-center">
                <div className="mb-2 text-3xl text-[#00c6ed]">{totalViews || 0}</div>
                <div className="text-sm text-gray-400">Total Views</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
