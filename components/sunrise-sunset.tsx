"use client"

import { useEffect, useState } from "react"
import { fetchSunriseSunset } from "@/lib/api-utils"

interface SunriseSunsetData {
  sunrise: string
  sunset: string
  dayLength: string
  loading: boolean
  error: string | null
}

interface SunriseSunsetProps {
  latitude: number
  longitude: number
  timezone?: string
}

export default function SunriseSunset({ latitude, longitude, timezone = "UTC" }: SunriseSunsetProps) {
  const [data, setData] = useState<SunriseSunsetData>({
    sunrise: "Loading...",
    sunset: "Loading...",
    dayLength: "Loading...",
    loading: true,
    error: null,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchSunriseSunset(latitude, longitude)

        if (result) {
          const sunriseTime = result.sunrise.toLocaleTimeString("en-US", {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })

          const sunsetTime = result.sunset.toLocaleTimeString("en-US", {
            timeZone: timezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })

          const dayLengthMs = result.dayLength * 1000
          const hours = Math.floor(dayLengthMs / (1000 * 60 * 60))
          const minutes = Math.floor((dayLengthMs % (1000 * 60 * 60)) / (1000 * 60))

          setData({
            sunrise: sunriseTime,
            sunset: sunsetTime,
            dayLength: `${hours}h ${minutes}m`,
            loading: false,
            error: null,
          })
        } else {
          throw new Error("Failed to fetch sunrise/sunset data")
        }
      } catch (error) {
        console.error("[v0] Sunrise/sunset fetch failed:", error)
        setData((prev) => ({
          ...prev,
          loading: false,
          error: "Unable to fetch sunrise/sunset times",
        }))
      }
    }

    if (latitude && longitude) {
      fetchData()
    }
  }, [latitude, longitude, timezone])

  if (data.error) {
    return null
  }

  return (
    <div className="grid grid-cols-3 gap-4 mt-8 p-4 bg-card rounded-lg border border-border">
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-1">Sunrise</p>
        <p className="text-lg font-semibold text-foreground">{data.sunrise}</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-1">Sunset</p>
        <p className="text-lg font-semibold text-foreground">{data.sunset}</p>
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-1">Day Length</p>
        <p className="text-lg font-semibold text-foreground">{data.dayLength}</p>
      </div>
    </div>
  )
}
