/**
 * Logs user activity to localStorage
 * @param username The username of the user
 * @param action The action being performed
 * @param details Additional details about the action
 */
export function logActivity(username: string, action: string, details: string) {
  try {
    const logs = JSON.parse(localStorage.getItem("nexus_activity_logs") || "[]")

    logs.unshift({
      username,
      action,
      details,
      timestamp: new Date().toISOString(),
    })

    // Keep only the last 100 logs to prevent localStorage from getting too large
    const trimmedLogs = logs.slice(0, 100)

    localStorage.setItem("nexus_activity_logs", JSON.stringify(trimmedLogs))

    // If there's a webhook URL, send the notification for script uploads
    if (action === "upload_script") {
      const webhookUrl = localStorage.getItem("nexus_webhook_url")
      if (webhookUrl) {
        // Extract game name and script info from details
        const scriptInfo = details.split(":")[1]?.trim() || "Unknown script"
        const gameMatch = scriptInfo.match(/for\s+(.+?)(?:\s+by|\s*$)/)
        const gameName = gameMatch ? gameMatch[1] : "Unknown game"

        // Send webhook notification
        fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: null,
            embeds: [
              {
                title: "New Script Uploaded",
                description: scriptInfo,
                color: 3066993,
                fields: [
                  {
                    name: "Game Name",
                    value: gameName,
                    inline: true,
                  },
                  {
                    name: "Uploaded By",
                    value: username,
                    inline: true,
                  },
                  {
                    name: "Page Link",
                    value: `${window.location.origin}/scripts`,
                  },
                ],
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        }).catch((error) => {
          console.error("Error sending webhook notification:", error)
        })
      }
    }
  } catch (error) {
    console.error("Error logging activity:", error)
  }
}
