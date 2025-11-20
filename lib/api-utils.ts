const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // ms

const LOCATION_APIS = [
  {
    name: "ip-api.com",
    url: "https://ip-api.com/json/?fields=status,country,countryCode,state,city,lat,lon,timezone",
    parse: (data: any) => ({
      city: data.city || "Unknown",
      country: data.country || "Unknown",
      state: data.state || "",
      timezone: data.timezone || "UTC",
      latitude: data.lat || 0,
      longitude: data.lon || 0,
    }),
    isSuccess: (data: any) => data.status === "success",
  },
  {
    name: "geoip-db.com",
    url: "https://geoip-db.com/json/",
    parse: (data: any) => ({
      city: data.city || "Unknown",
      country: data.country_name || "Unknown",
      state: data.state || "",
      timezone: data.timezone || "UTC",
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
    }),
    isSuccess: (data: any) => data.country_code !== undefined,
  },
  {
    name: "ipwho.is",
    url: "https://ipwho.is/",
    parse: (data: any) => {
      const timezone = data.timezone || "UTC"
      console.log("[v0] ipwho.is response timezone:", timezone, "full data:", data)
      return {
        city: data.city || "Unknown",
        country: data.country || "Unknown",
        state: data.region || "",
        timezone: timezone,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
      }
    },
    isSuccess: (data: any) => data.success === true,
  },
]

// Retry logic for API calls
async function retryFetch(url: string, options?: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, { ...options, timeout: 5000 })
    if (!response.ok && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return retryFetch(url, options, retries - 1)
    }
    return response
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return retryFetch(url, options, retries - 1)
    }
    throw error
  }
}

export async function fetchLocationData() {
  for (const api of LOCATION_APIS) {
    try {
      console.log(`[v0] Trying location API: ${api.name}`)
      const response = await retryFetch(api.url)
      const data = await response.json()

      if (api.isSuccess(data)) {
        console.log(`[v0] Successfully fetched location from ${api.name}`)
        const parsed = api.parse(data)
        console.log("[v0] Parsed location data:", parsed)
        return parsed
      }
    } catch (error) {
      console.warn(`[v0] ${api.name} failed:`, error)
      continue
    }
  }

  console.error("[v0] All location APIs failed, using fallback")
  return {
    city: "Unknown",
    country: "Unknown",
    state: "",
    timezone: "UTC",
    latitude: 0,
    longitude: 0,
  }
}

// Fetch sunrise/sunset data with error handling
export async function fetchSunriseSunset(latitude: number, longitude: number) {
  try {
    if (!latitude || !longitude) {
      throw new Error("Invalid coordinates")
    }

    const response = await retryFetch(
      `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`,
    )
    const data = await response.json()

    if (data.status !== "OK") {
      throw new Error(`API returned status: ${data.status}`)
    }

    return {
      sunrise: new Date(data.results.sunrise),
      sunset: new Date(data.results.sunset),
      civilTwilight: {
        begin: new Date(data.results.civil_twilight_begin),
        end: new Date(data.results.civil_twilight_end),
      },
      nauticalTwilight: {
        begin: new Date(data.results.nautical_twilight_begin),
        end: new Date(data.results.nautical_twilight_end),
      },
      astronomicalTwilight: {
        begin: new Date(data.results.astronomical_twilight_begin),
        end: new Date(data.results.astronomical_twilight_end),
      },
      dayLength: data.results.day_length,
    }
  } catch (error) {
    console.error("[v0] Sunrise/sunset fetch failed:", error)
    return null
  }
}

// Get timezone info with validation
export function getTimezoneInfo(timezone: string) {
  try {
    if (!timezone || timezone === "Loading..." || timezone === "Unknown") {
      throw new Error("Invalid timezone")
    }

    const now = new Date()

    // Validate timezone by attempting to format
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

    const utcOffset = Math.round((now.getTime() - tzDate.getTime()) / 60000)
    const hours = Math.floor(Math.abs(utcOffset) / 60)
    const minutes = Math.abs(utcOffset) % 60
    const sign = utcOffset <= 0 ? "+" : "-"
    const utcOffsetStr = `UTC${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`

    return {
      timezone,
      utcOffset: utcOffsetStr,
      isDST: isInDST(timezone),
    }
  } catch (error) {
    console.error("[v0] Timezone info error:", error)
    return {
      timezone: "UTC",
      utcOffset: "UTC+00:00",
      isDST: false,
    }
  }
}

// Check if timezone is currently in DST with error handling
export function isInDST(timezone: string): boolean {
  try {
    if (!timezone || timezone === "Loading..." || timezone === "Unknown") {
      return false
    }

    const now = new Date()
    const jan = new Date(now.getFullYear(), 0, 1)
    const jul = new Date(now.getFullYear(), 6, 1)

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })

    const janOffset = getTimezoneOffset(jan, formatter)
    const julOffset = getTimezoneOffset(jul, formatter)
    const nowOffset = getTimezoneOffset(now, formatter)

    return Math.abs(nowOffset - janOffset) > Math.abs(nowOffset - julOffset)
  } catch (error) {
    console.error("[v0] DST check failed:", error)
    return false
  }
}

function getTimezoneOffset(date: Date, formatter: Intl.DateTimeFormat): number {
  try {
    const parts = formatter.formatToParts(date)
    const tzDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      Number.parseInt(parts.find((p) => p.type === "hour")?.value || "0"),
      Number.parseInt(parts.find((p) => p.type === "minute")?.value || "0"),
      Number.parseInt(parts.find((p) => p.type === "second")?.value || "0"),
    )
    return Math.round((date.getTime() - tzDate.getTime()) / 60000)
  } catch {
    return 0
  }
}

export async function fetchExactTime(timezone: string) {
  try {
    if (!timezone || timezone === "Loading..." || timezone === "Unknown") {
      throw new Error("Invalid timezone")
    }

    const response = await fetch(`/api/time?timezone=${encodeURIComponent(timezone)}`)

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`)
    }

    const data = await response.json()

    if (data.success && data.unixtime) {
      console.log("[v0] Fetched exact time from server for timezone:", timezone)
      return {
        unixtime: data.unixtime,
        datetime: new Date(data.unixtime * 1000),
        timezone: data.timezone,
        utcOffset: data.utc_offset,
        isDST: data.dst,
        accuracy: data.accuracy,
      }
    }

    throw new Error("Invalid response from server")
  } catch (error) {
    console.warn("[v0] Time fetch failed, falling back to local time:", error)
    return null
  }
}
