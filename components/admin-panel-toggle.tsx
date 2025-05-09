"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { isAdmin } from "@/lib/admin"
import Link from "next/link"

export function AdminPanelToggle() {
  const { user } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const adminStatus = await isAdmin(user.username)
          setIsAdminUser(adminStatus)

          // If admin, load activity logs
          if (adminStatus) {
            const logs = JSON.parse(localStorage.getItem("nexus_activity_logs") || "[]")
            setActivityLogs(logs.slice(0, 10)) // Show only the 10 most recent logs
          }
        } catch (error) {
          console.error("Error checking admin status:", error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [user])

  if (isLoading || !isAdminUser) return null

  return (
    <>
      {/* Admin Toggle Button */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="fixed top-4 right-4 z-50 flex items-center justify-center rounded-full bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] p-2 shadow-lg transition-all hover:shadow-[#00ff9d]/20"
        title="Admin Panel"
      >
        <i className={`fas ${isPanelOpen ? "fa-times" : "fa-shield-alt"} text-[#050505]`}></i>
      </button>

      {/* Admin Panel */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pt-16 pb-8 px-4 bg-black/80 overflow-y-auto">
          <div className="w-full max-w-4xl bg-[#1a1a1a] rounded-lg border-l-4 border-[#00ff9d] shadow-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] mb-6">
                NEXUS Admin Dashboard
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-[#00c6ed] mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/upload-keys"
                      className="bg-[#00ff9d] text-[#050505] font-medium py-2 px-4 rounded text-center hover:bg-[#00e68a] transition-colors"
                      onClick={(e) => {
                        e.preventDefault()
                        window.location.href = "/upload-keys"
                      }}
                    >
                      <i className="fas fa-key mr-2"></i> Upload Key
                    </Link>
                    <Link
                      href="/upload-scripts"
                      className="bg-[#00c6ed] text-[#050505] font-medium py-2 px-4 rounded text-center hover:bg-[#00b8ff] transition-colors"
                    >
                      <i className="fas fa-code mr-2"></i> Upload Script
                    </Link>
                    <button
                      className="bg-yellow-500 text-[#050505] font-medium py-2 px-4 rounded text-center hover:bg-yellow-600 transition-colors"
                      onClick={() => {
                        localStorage.removeItem("nexus_activity_logs")
                        setActivityLogs([])
                        alert("Activity logs cleared!")
                      }}
                    >
                      <i className="fas fa-trash-alt mr-2"></i> Clear Logs
                    </button>
                    <button
                      className="bg-purple-500 text-white font-medium py-2 px-4 rounded text-center hover:bg-purple-600 transition-colors"
                      onClick={() => {
                        const release = prompt("Enter release notes for the next update:")
                        if (release) {
                          const releases = JSON.parse(localStorage.getItem("nexus_releases") || "[]")
                          releases.unshift({
                            version: `1.${releases.length + 1}.0`,
                            date: new Date().toISOString(),
                            notes: release,
                            author: user?.username,
                          })
                          localStorage.setItem("nexus_releases", JSON.stringify(releases))
                          alert("Release notes added!")
                        }
                      }}
                    >
                      <i className="fas fa-rocket mr-2"></i> Add Release
                    </button>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-[#00c6ed] mb-3">Platform Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1a1a1a] p-3 rounded border border-white/5">
                      <div className="text-2xl font-bold text-[#00ff9d]">
                        {JSON.parse(localStorage.getItem("nexus_scripts") || "[]").length}
                      </div>
                      <div className="text-xs text-gray-400">Total Scripts</div>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded border border-white/5">
                      <div className="text-2xl font-bold text-[#00c6ed]">
                        {JSON.parse(localStorage.getItem("nexus_keys") || "[]").length}
                      </div>
                      <div className="text-xs text-gray-400">Total Keys</div>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded border border-white/5">
                      <div className="text-2xl font-bold text-yellow-500">
                        {Object.keys(localStorage).filter((key) => key.startsWith("nexus_user_")).length}
                      </div>
                      <div className="text-xs text-gray-400">Registered Users</div>
                    </div>
                    <div className="bg-[#1a1a1a] p-3 rounded border border-white/5">
                      <div className="text-2xl font-bold text-red-500">
                        {JSON.parse(localStorage.getItem("nexus_banned_ips") || "[]").length}
                      </div>
                      <div className="text-xs text-gray-400">Banned IPs</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/10 mb-6">
                <h3 className="text-lg font-semibold text-[#00c6ed] mb-3">Recent Activity Logs</h3>
                {activityLogs.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="text-xs text-gray-400 uppercase">
                        <tr>
                          <th className="px-2 py-2 text-left">Time</th>
                          <th className="px-2 py-2 text-left">User</th>
                          <th className="px-2 py-2 text-left">Action</th>
                          <th className="px-2 py-2 text-left">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityLogs.map((log, index) => (
                          <tr key={index} className="border-t border-white/5">
                            <td className="px-2 py-2 text-gray-300">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="px-2 py-2 text-gray-300">{log.username}</td>
                            <td className="px-2 py-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  log.action === "upload_script"
                                    ? "bg-green-900/30 text-green-300"
                                    : log.action === "upload_key"
                                      ? "bg-blue-900/30 text-blue-300"
                                      : log.action === "login"
                                        ? "bg-yellow-900/30 text-yellow-300"
                                        : log.action === "signup"
                                          ? "bg-purple-900/30 text-purple-300"
                                          : log.action === "ban"
                                            ? "bg-red-900/30 text-red-300"
                                            : "bg-gray-900/30 text-gray-300"
                                }`}
                              >
                                {log.action.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-gray-300">{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No activity logs found.</p>
                )}
              </div>

              <div className="bg-[#0a0a0a] rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-[#00c6ed] mb-3">Webhook Settings</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    id="webhook-url"
                    placeholder="Enter Discord webhook URL"
                    className="flex-1 rounded border border-white/10 bg-[#050505] px-4 py-2 text-white transition-all focus:border-[#00ff9d] focus:outline-none focus:ring-1 focus:ring-[#00ff9d]"
                    defaultValue={localStorage.getItem("nexus_webhook_url") || ""}
                  />
                  <button
                    className="bg-[#00ff9d] text-[#050505] font-medium py-2 px-4 rounded text-center hover:bg-[#00e68a] transition-colors"
                    onClick={() => {
                      const webhookUrl = (document.getElementById("webhook-url") as HTMLInputElement).value
                      localStorage.setItem("nexus_webhook_url", webhookUrl)
                      alert("Webhook URL saved!")
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="bg-[#00c6ed] text-[#050505] font-medium py-2 px-4 rounded text-center hover:bg-[#00b8ff] transition-colors"
                    onClick={() => {
                      const webhookUrl = localStorage.getItem("nexus_webhook_url")
                      if (!webhookUrl) {
                        alert("Please save a webhook URL first!")
                        return
                      }

                      // Send a test message
                      fetch(webhookUrl, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          content: "This is a test message from NEXUS Admin Panel!",
                        }),
                      })
                        .then((response) => {
                          if (response.ok) {
                            alert("Test message sent successfully!")
                          } else {
                            alert("Failed to send test message. Check your webhook URL.")
                          }
                        })
                        .catch((error) => {
                          alert("Error sending test message: " + error.message)
                        })
                    }}
                  >
                    Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
