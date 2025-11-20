export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const timezone = searchParams.get("timezone") || "UTC"

  console.log("[v0] Calculating time for timezone:", timezone)
  const now = new Date()

  // Get the time in the specified timezone using Intl API
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const parts = formatter.formatToParts(now)
  const tzDate = new Date(
    Number.parseInt(parts.find((p) => p.type === "year")?.value || "2024"),
    Number.parseInt(parts.find((p) => p.type === "month")?.value || "1") - 1,
    Number.parseInt(parts.find((p) => p.type === "day")?.value || "1"),
    Number.parseInt(parts.find((p) => p.type === "hour")?.value || "0"),
    Number.parseInt(parts.find((p) => p.type === "minute")?.value || "0"),
    Number.parseInt(parts.find((p) => p.type === "second")?.value || "0"),
  )

  // Calculate UTC offset
  const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }))
  const offsetMs = tzDate.getTime() - utcDate.getTime()
  const offsetHours = Math.floor(offsetMs / (1000 * 60 * 60))
  const offsetMinutes = Math.floor((Math.abs(offsetMs) % (1000 * 60 * 60)) / (1000 * 60))
  const sign = offsetHours >= 0 ? "+" : "-"
  const utcOffset = `UTC${sign}${Math.abs(offsetHours).toString().padStart(2, "0")}:${offsetMinutes.toString().padStart(2, "0")}`

  return Response.json({
    success: true,
    unixtime: Math.floor(now.getTime() / 1000),
    datetime: now.toISOString(),
    utc_offset: utcOffset,
    timezone: timezone,
    dst: false,
    accuracy: "Accurate (Server-side calculation)",
  })
}
