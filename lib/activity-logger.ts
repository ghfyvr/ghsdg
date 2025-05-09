type ActivityAction =
  | "login"
  | "signup"
  | "upload_script"
  | "upload_key"
  | "ban"
  | "unban"
  | "view_script"
  | "download_key"
  | "report"
  | "admin_action"

interface ActivityLog {
  timestamp: string
  username: string
  action: ActivityAction
  details: string
  ip?: string
  userAgent?: string
}

export function logActivity(username: string, action: ActivityAction, details: string) {
  try {
    // Create log entry
    const logEntry: ActivityLog = {
      timestamp: new Date().toISOString(),
      username,
      action,
      details,
      userAgent: navigator.userAgent,
    }

    // Get existing logs
    const existingLogs: ActivityLog[] = JSON.parse(localStorage.getItem("nexus_activity_logs") || "[]")

    // Add new log at the beginning (most recent first)
    existingLogs.unshift(logEntry)

    // Keep only the last 1000 logs to prevent localStorage from getting too large
    const trimmedLogs = existingLogs.slice(0, 1000)

    // Save back to localStorage
    localStorage.setItem("nexus_activity_logs", JSON.stringify(trimmedLogs))

    // Send webhook if it's a script upload or key upload
    if (action === "upload_script" || action === "upload_key") {
      sendWebhook(logEntry)
    }

    return true
  } catch (error) {
    console.error("Error logging activity:", error)
    return false
  }
}

export function sendWebhook(logEntry: ActivityLog) {
  const webhookUrl = localStorage.getItem("nexus_webhook_url")

  if (!webhookUrl) return

  try {
    // Format the message based on the action type
    let content = ""

    if (logEntry.action === "upload_script") {
      // Parse the details to get script info
      const detailsParts = logEntry.details.split(" | ")
      const scriptTitle = detailsParts[0].replace("Script: ", "")
      const gameInfo = detailsParts[1] || "Unknown Game"
      const scriptId = detailsParts[2] || ""

      content = `
**New Script Uploaded**
Game: ${gameInfo}
Script Uploaded By: ${logEntry.username}
Script Title: ${scriptTitle}
Page Link: ${window.location.origin}/scripts/${scriptId}
      `
    } else if (logEntry.action === "upload_key") {
      // Parse the details to get key info
      const detailsParts = logEntry.details.split(" | ")
      const keyTitle = detailsParts[0].replace("Key: ", "")
      const keyId = detailsParts[1] || ""

      content = `
**New Key Uploaded**
Key Uploaded By: ${logEntry.username}
Key Title: ${keyTitle}
Page Link: ${window.location.origin}/key-generator/${keyId}
      `
    } else {
      // Generic message for other actions
      content = `
**${logEntry.action.replace("_", " ")}**
User: ${logEntry.username}
Details: ${logEntry.details}
Time: ${new Date(logEntry.timestamp).toLocaleString()}
      `
    }

    // Send the webhook
    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    }).catch((error) => {
      console.error("Error sending webhook:", error)
    })
  } catch (error) {
    console.error("Error formatting webhook message:", error)
  }
}
