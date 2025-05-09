"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState, useRef } from "react"

export default function Header() {
  const { user, logout } = useAuth()
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLLIElement>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (user) {
      // Load user profile picture if available
      const userProfileData = localStorage.getItem(`nexus_profile_${user.username}`)
      if (userProfileData) {
        const parsedProfile = JSON.parse(userProfileData)
        setProfilePicture(parsedProfile.profilePicture || null)
      }
    }
  }, [user])

  // Handle dropdown mouse events with delay
  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
      dropdownTimeoutRef.current = null
    }
    setDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false)
    }, 300) // 300ms delay before closing
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current)
      }
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/90 py-4 backdrop-blur">
      <div className="container mx-auto flex flex-col items-center justify-between px-5 md:flex-row">
        <Link href="/" className="mb-5 flex items-center text-3xl font-bold tracking-tighter rgb-gradient-text md:mb-0">
          NEXUS<span className="text-white">.</span>
        </Link>
        <nav>
          <ul className="flex flex-wrap justify-center gap-2">
            <li>
              <Link
                href="/"
                className="flex items-center rounded px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[rgba(0,255,157,0.1)] hover:text-[#00ff9d] hover:after:scale-x-100"
              >
                <i className="fas fa-home mr-2"></i> Home
              </Link>
            </li>
            <li>
              <Link
                href="/scripts"
                className="flex items-center rounded px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[rgba(0,255,157,0.1)] hover:text-[#00ff9d] hover:after:scale-x-100"
              >
                <i className="fas fa-code mr-2"></i> Scripts
              </Link>
            </li>
            <li>
              <Link
                href="/key-generator"
                className="flex items-center rounded px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[rgba(0,255,157,0.1)] hover:text-[#00ff9d] hover:after:scale-x-100"
              >
                <i className="fas fa-key mr-2"></i> Key
              </Link>
            </li>
            <li>
              <a
                href="https://discord.gg/ZWCqcuxAv3"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center rounded px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[rgba(0,255,157,0.1)] hover:text-[#00ff9d] hover:after:scale-x-100 relative group"
              >
                <i className="fab fa-discord mr-2 text-[#5865F2]"></i>
                <span className="relative">
                  Discord
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-[#5865F2] to-[#00ff9d] transition-all duration-300 group-hover:w-full"></span>
                </span>
              </a>
            </li>
            <li>
              <Link
                href="/premium-key"
                className="flex items-center rounded px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[rgba(0,255,157,0.1)] hover:text-[#00ff9d] hover:after:scale-x-100"
              >
                <i className="fas fa-crown mr-2"></i> Premium Key
              </Link>
            </li>
            <li>
              <Link
                href="/executors"
                className="flex items-center rounded px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[rgba(0,255,157,0.1)] hover:text-[#00ff9d] hover:after:scale-x-100"
              >
                <i className="fas fa-terminal mr-2"></i> Executors
              </Link>
            </li>
            {user ? (
              <li
                ref={dropdownRef}
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex items-center gap-2 rounded px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[rgba(0,255,157,0.1)]">
                  {profilePicture ? (
                    <div className="h-8 w-8 overflow-hidden rounded-full">
                      <img
                        src={profilePicture || "/placeholder.svg"}
                        alt={user.username}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0a0a0a]">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{user.username}</span>
                  <i className="fas fa-chevron-down ml-1 text-xs"></i>
                </button>
                <div
                  className={`absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded border border-white/10 bg-[#0a0a0a] py-1 shadow-lg ${
                    dropdownOpen ? "block" : "hidden"
                  }`}
                >
                  <Link
                    href={`/profile/${user.username}`}
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-white hover:bg-[rgba(0,255,157,0.1)] hover:text-[#00ff9d]"
                  >
                    <i className="fas fa-user mr-2"></i> My Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-white hover:bg-[rgba(0,255,157,0.1)] hover:text-[#00ff9d]"
                  >
                    <i className="fas fa-cog mr-2"></i> Settings
                  </Link>
                  <Link
                    href="/upload-scripts"
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-white hover:bg-[rgba(0,255,157,0.1)] hover:text-[#00ff9d]"
                  >
                    <i className="fas fa-upload mr-2"></i> Upload Scripts
                  </Link>
                  <button
                    onClick={logout}
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-white hover:bg-[rgba(255,0,0,0.1)] hover:text-red-400"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i> Logout
                  </button>
                </div>
              </li>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className="flex items-center rounded rgb-button px-5 py-2.5 text-sm font-medium text-white transition-all"
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i> Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="flex items-center rounded rgb-button px-5 py-2.5 text-sm font-medium text-white transition-all"
                  >
                    <i className="fas fa-user-plus mr-2"></i> Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
