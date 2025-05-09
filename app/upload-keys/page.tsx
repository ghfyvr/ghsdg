"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { isAdmin } from "@/lib/admin"
import Link from "next/link"

export default function UploadKeysPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [keyTitle, setKeyTitle] = useState("")
  const [keyDescription, setKeyDescription] = useState("")
  const [keyCode, setKeyCode] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [message, setMessage] = useState({ type: "", text: "" })
  const [userIsAdmin, setUserIsAdmin] = useState(false)
  const [adminCheckComplete, setAdminCheckComplete] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push("/login")
    } else {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 2MB" })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "File must be an image" })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })

    if (!keyTitle || !keyDescription || !keyCode) {
      setMessage({ type: "error", text: "Key title, description, and code are required" })
      return
    }

    if (!imageUrl) {
      setMessage({ type: "error", text: "Please upload an image for the key" })
      return
    }

    try {
      setIsUploading(true)

      // Create a key object
      const key = {
        id: `key-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: keyTitle,
        description: keyDescription,
        keyCode: keyCode,
        author: user?.username,
        createdAt: new Date().toISOString(),
        imageUrl: imageUrl,
        likes: [], // Initialize empty likes array
        dislikes: [], // Initialize empty dislikes array
        isPremium: isPremium,
        isNexusTeam: true, // Since only admins can upload keys
      }

      // Get existing keys from localStorage or initialize empty array
      const existingKeys = JSON.parse(localStorage.getItem("nexus_keys") || "[]")

      // Add new key
      existingKeys.push(key)

      // Save back to localStorage
      localStorage.setItem("nexus_keys", JSON.stringify(existingKeys))

      // Show success message
      setMessage({ type: "success", text: "Key uploaded successfully!" })

      // Reset form
      setKeyTitle("")
      setKeyDescription("")
      setKeyCode("")
      setImageUrl("")
      setIsPremium(false)

      // Reset file input
      const fileInput = document.getElementById("keyImage") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }

      // Redirect to key generator page after a delay
      setTimeout(() => {
        router.push("/key-generator")
      }, 2000)
    } catch (error) {
      console.error("Error uploading key:", error)
      setMessage({ type: "error", text: "An error occurred while uploading the key" })
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading || !adminCheckComplete) {
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

  if (!userIsAdmin) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
            Upload Key
          </h1>

          <div className="rounded-lg border-l-4 border-red-500 bg-[#1a1a1a] p-8 text-center">
            <div className="mb-4 text-5xl text-red-400">
              <i className="fas fa-lock"></i>
            </div>
            <h2 className="mb-2 text-xl font-bold text-white">Admin Access Required</h2>
            <p className="mb-6 text-gray-400">Only administrators can upload keys to the NEXUS platform.</p>
            <Link
              href="/key-generator"
              className="inline-flex items-center rounded bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] px-6 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00ff9d]/20"
            >
              <i className="fas fa-arrow-left mr-2"></i> Back to Keys
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
          Upload Key
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

        <form onSubmit={handleSubmit} className="rounded-lg border-l-4 border-[#00ff9d] bg-[#1a1a1a] p-8">
          <div className="mb-6">
            <label htmlFor="keyTitle" className="mb-2 block font-medium text-[#00ff9d]">
              Key Title
            </label>
            <input
              type="text"
              id="keyTitle"
              value={keyTitle}
              onChange={(e) => setKeyTitle(e.target.value)}
              className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
              placeholder="Enter a title for your key"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="keyImage" className="mb-2 block font-medium text-[#00ff9d]">
              Key Image
            </label>
            <div className="mb-2">
              <input type="file" id="keyImage" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <label
                htmlFor="keyImage"
                className="flex cursor-pointer items-center justify-center rounded border border-dashed border-white/20 bg-[#050505] p-4 transition-all hover:border-[#00ff9d]/50"
              >
                <div className="text-center">
                  <i className="fas fa-upload mb-2 text-2xl text-[#00ff9d]"></i>
                  <p className="text-sm text-gray-400">Click to upload key image (max 2MB)</p>
                </div>
              </label>
            </div>

            {imageUrl && (
              <div className="mt-4 rounded border border-white/10 bg-[#050505] p-2">
                <div className="relative h-40 w-full overflow-hidden rounded">
                  <img src={imageUrl || "/placeholder.svg"} alt="Key preview" className="h-full w-full object-cover" />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="rounded bg-red-500/20 px-3 py-1 text-xs text-red-300 transition-all hover:bg-red-500/30"
                  >
                    <i className="fas fa-times mr-1"></i> Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="keyDescription" className="mb-2 block font-medium text-[#00ff9d]">
              Description
            </label>
            <textarea
              id="keyDescription"
              value={keyDescription}
              onChange={(e) => setKeyDescription(e.target.value)}
              className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
              rows={3}
              placeholder="Describe what this key is for"
              maxLength={500}
            />
            <p className="mt-1 text-right text-xs text-gray-400">{keyDescription.length}/500 characters</p>
          </div>

          <div className="mb-6">
            <label htmlFor="keyCode" className="mb-2 block font-medium text-[#00ff9d]">
              Key Code
            </label>
            <textarea
              id="keyCode"
              value={keyCode}
              onChange={(e) => setKeyCode(e.target.value)}
              className="font-mono w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
              rows={5}
              placeholder="Enter the key code or link"
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPremium}
                onChange={() => setIsPremium(!isPremium)}
                className="h-4 w-4 rounded border-white/10 bg-[#050505] text-[#BA55D3]"
              />
              <span className="text-white">Mark as Premium Key</span>
            </label>
            <p className="mt-1 text-xs text-gray-400">Premium keys will be highlighted with special styling</p>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full rounded bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] px-4 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00ff9d]/20 disabled:opacity-50"
          >
            {isUploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#050505]/20 border-t-[#050505]"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              <>
                <i className="fas fa-upload mr-2"></i> Upload Key
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
