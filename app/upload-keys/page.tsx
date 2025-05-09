"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { isAdmin } from "@/lib/admin"

export default function UploadKeysPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    keyCode: "",
    gameId: "",
    isPremium: false,
  })
  const [message, setMessage] = useState({ type: "", text: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isLoading && user) {
        try {
          const adminStatus = await isAdmin(user.username)
          setIsAdminUser(adminStatus)

          if (!adminStatus) {
            // If not admin, redirect to homepage
            window.location.href = "/"
          }
        } catch (error) {
          console.error("Error checking admin status:", error)
          setIsAdminUser(false)
          // If error, redirect to homepage
          window.location.href = "/"
        } finally {
          setIsCheckingAdmin(false)
        }
      } else if (!isLoading && !user) {
        // If not logged in, redirect to login
        window.location.href = "/login"
      }
    }

    checkAdminStatus()
  }, [user, isLoading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: "", text: "" })

    try {
      // Validate form data
      if (!formData.title || !formData.description || !formData.keyCode) {
        setMessage({ type: "error", text: "All fields are required" })
        setIsSubmitting(false)
        return
      }

      // Generate a unique ID for the key
      const keyId = `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

      // Create the key object
      const newKey = {
        id: keyId,
        title: formData.title,
        description: formData.description,
        keyCode: formData.keyCode,
        author: user?.username || "Unknown",
        createdAt: new Date().toISOString(),
        imageUrl: "/placeholder.svg",
        isPremium: formData.isPremium,
        isNexusTeam: true,
        game: formData.gameId
          ? {
              id: Number.parseInt(formData.gameId),
              name: "Game Name", // This would be fetched from the database in a real app
              imageUrl: "/placeholder.svg",
            }
          : undefined,
      }

      // In a real app, you would save this to a database
      // For now, we'll just save it to localStorage
      const existingKeys = JSON.parse(localStorage.getItem("nexus_keys") || "[]")
      const updatedKeys = [newKey, ...existingKeys]
      localStorage.setItem("nexus_keys", JSON.stringify(updatedKeys))

      // Send webhook notification if configured
      try {
        const webhookUrl = localStorage.getItem("nexus_webhook_url")
        if (webhookUrl) {
          const webhookData = {
            content: "New key uploaded!",
            embeds: [
              {
                title: formData.title,
                description: formData.description,
                author: {
                  name: user?.username || "Unknown",
                },
                fields: [
                  {
                    name: "Game",
                    value: formData.gameId ? "Game #" + formData.gameId : "No game specified",
                    inline: true,
                  },
                  {
                    name: "Premium",
                    value: formData.isPremium ? "Yes" : "No",
                    inline: true,
                  },
                ],
                url: `${window.location.origin}/key-generator/${keyId}`,
                color: 3066993, // Green color
              },
            ],
          }

          fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(webhookData),
          }).catch((error) => console.error("Error sending webhook:", error))
        }
      } catch (error) {
        console.error("Error with webhook:", error)
      }

      // Show success message
      setMessage({ type: "success", text: "Key uploaded successfully!" })

      // Reset form
      setFormData({
        title: "",
        description: "",
        keyCode: "",
        gameId: "",
        isPremium: false,
      })
    } catch (error) {
      console.error("Error uploading key:", error)
      setMessage({ type: "error", text: "An error occurred while uploading the key. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || isCheckingAdmin) {
    return (
      <div className="container mx-auto px-5 py-16">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#00ff9d]"></div>
        </div>
      </div>
    )
  }

  if (!isAdminUser) {
    return null // This will be handled by the useEffect redirect
  }

  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff]">
          Upload Key
        </h1>

        <div className="rounded-lg border border-[#00ff9d]/20 bg-[#1a1a1a] p-8">
          {message.text && (
            <div
              className={`mb-6 rounded p-4 ${
                message.type === "error" ? "bg-red-900/30 text-red-200" : "bg-green-900/30 text-green-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="title" className="mb-2 block font-medium text-[#00ff9d]">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
                placeholder="Enter key title"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="mb-2 block font-medium text-[#00ff9d]">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
                placeholder="Enter key description"
              ></textarea>
            </div>

            <div className="mb-4">
              <label htmlFor="keyCode" className="mb-2 block font-medium text-[#00ff9d]">
                Key Code
              </label>
              <textarea
                id="keyCode"
                name="keyCode"
                value={formData.keyCode}
                onChange={handleChange}
                rows={8}
                className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
                placeholder="Enter key code"
              ></textarea>
            </div>

            <div className="mb-4">
              <label htmlFor="gameId" className="mb-2 block font-medium text-[#00ff9d]">
                Game ID (Optional)
              </label>
              <input
                type="text"
                id="gameId"
                name="gameId"
                value={formData.gameId}
                onChange={handleChange}
                className="w-full rounded border border-white/10 bg-[#050505] px-4 py-3 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
                placeholder="Enter game ID"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPremium"
                  checked={formData.isPremium}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-white/10 bg-[#050505] text-[#00ff9d] focus:ring-[#00ff9d]"
                />
                <span className="ml-2 text-white">Premium Key</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] px-4 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00ff9d]/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-[#050505]"></div>
                  Uploading...
                </span>
              ) : (
                <span>
                  <i className="fas fa-upload mr-2"></i> Upload Key
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
