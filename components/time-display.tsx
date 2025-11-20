"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import TimezoneSearch from "./timezone-search"
import SunriseSunset from "./sunrise-sunset"
import CityComparison from "./city-comparison"
import DSTInfo from "./dst-info"
import { fetchLocationData, getTimezoneInfo, fetchExactTime } from "@/lib/api-utils"

interface LocationData {
  city: string
  country: string
  state?: string
  timezone: string
  latitude: number
  longitude: number
}

interface TimeData {
  time: string
  date: string
  timezone: string
  utcOffset: string
  accuracy: string
  dayOfWeek: string
}

interface TimeDisplayProps {
  onCitySelect?: (
    cityName: string,
    timezone: string,
    country: string,
    state?: string,
    latitude?: number,
    longitude?: number,
  ) => void
  selectedCity?: string | null
  selectedCountry?: string | null
  selectedState?: string | null
  selectedLatitude?: number | null
  selectedLongitude?: number | null
  selectedTimezone?: string | null
}

export default function TimeDisplay({
  onCitySelect,
  selectedCity,
  selectedCountry,
  selectedState,
  selectedLatitude,
  selectedLongitude,
  selectedTimezone: propSelectedTimezone,
}: TimeDisplayProps) {
  const [timeData, setTimeData] = useState<TimeData>({
    time: "00:00:00",
    date: "Loading...",
    timezone: "Loading...",
    utcOffset: "UTC+0",
    accuracy: "Calculating...",
    dayOfWeek: "",
  })
  const [location, setLocation] = useState<LocationData | null>(null)
  const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null)
  const [displayCity, setDisplayCity] = useState<string | null>(null)
  const [displayCountry, setDisplayCountry] = useState<string | null>(null)
  const [displayState, setDisplayState] = useState<string | null>(null)
  const [displayLatitude, setDisplayLatitude] = useState<number | null>(null)
  const [displayLongitude, setDisplayLongitude] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiTime, setApiTime] = useState<number | null>(null)
  const [apiTimeOffset, setApiTimeOffset] = useState<number>(0)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const fetchLocation = async () => {
      const locationData = await fetchLocationData()
      setLocation(locationData)
    }
    fetchLocation()
  }, [])

  useEffect(() => {
    if (selectedCity) {
      setDisplayCity(selectedCity)
      setDisplayCountry(selectedCountry || location?.country || "Unknown")
      setDisplayState(selectedState || location?.state || "")
      setDisplayLatitude(selectedLatitude || location?.latitude || null)
      setDisplayLongitude(selectedLongitude || location?.longitude || null)
    }
  }, [selectedCity, selectedCountry, selectedState, selectedLatitude, selectedLongitude, location])

  useEffect(() => {
    if (propSelectedTimezone) {
      setSelectedTimezone(propSelectedTimezone)
    }
  }, [propSelectedTimezone])

  const handleTimezoneSelect = (timezone: string) => {
    setSelectedTimezone(timezone)
    setDisplayCity(null)
  }

  useEffect(() => {
    const fetchAndSetTime = async () => {
      const tz = selectedTimezone || location?.timezone || "UTC"
      const exactTime = await fetchExactTime(tz)

      if (exactTime) {
        console.log("[v0] Fetched exact time from API for timezone:", tz)
        setApiTime(exactTime.unixtime * 1000) // Convert to milliseconds
        setApiTimeOffset(0)
        setTimeData((prev) => ({
          ...prev,
          timezone: tz,
          utcOffset: exactTime.utcOffset || prev.utcOffset,
          accuracy: "Accurate (API)",
        }))
      } else {
        console.log("[v0] Using local time calculation for timezone:", tz)
        setApiTime(null)
        const tzInfo = getTimezoneInfo(tz)
        setTimeData((prev) => ({
          ...prev,
          timezone: tz,
          utcOffset: tzInfo.utcOffset,
          accuracy: "Using local time",
        }))
      }
    }

    if (location || selectedTimezone) {
      fetchAndSetTime()
    }
  }, [location, selectedTimezone])

  useEffect(() => {
    const updateClock = () => {
      const tz = selectedTimezone || location?.timezone || "UTC"

      let now: Date
      if (apiTime !== null) {
        now = new Date(apiTime + apiTimeOffset)
        setApiTimeOffset((prev) => prev + 100) // Update every 100ms
      } else {
        now = new Date()
      }

      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })

      const timeStr = formatter.format(now)

      const dateFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      const dateStr = dateFormatter.format(now)

      setTimeData((prev) => ({
        ...prev,
        time: timeStr,
        date: dateStr,
      }))

      animationFrameRef.current = requestAnimationFrame(updateClock)
    }

    if (location || selectedTimezone) {
      setLoading(false)
      updateClock()
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [location, selectedTimezone, apiTime])

  return (
    <section className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <TimezoneSearch onSelect={handleTimezoneSelect} />
      </motion.div>

      <motion.div
        className="space-y-6 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="space-y-2">
          <h1 className="text-lg md:text-xl font-semibold text-muted-foreground">
            Time in {displayCity || location?.city || "Unknown"}, {displayState ? `${displayState}, ` : ""}
            {displayCountry || location?.country || "Unknown"} now
          </h1>
          <p className="text-sm text-muted-foreground">Your clock is {timeData.accuracy}</p>
        </div>

        <motion.div
          className="text-6xl md:text-8xl font-black tracking-tight font-mono text-foreground"
          key={timeData.time}
          initial={{ opacity: 0.5, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {timeData.time}
        </motion.div>

        <div className="space-y-2">
          <p className="text-lg md:text-xl font-semibold text-foreground">{timeData.date}</p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Timezone: {timeData.timezone}</span>
            <span>UTC Offset: {timeData.utcOffset}</span>
          </div>
        </div>

        <DSTInfo timezone={timeData.timezone} />
      </motion.div>

      {(location || displayLatitude) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <SunriseSunset
            latitude={displayLatitude || location?.latitude || 0}
            longitude={displayLongitude || location?.longitude || 0}
            timezone={selectedTimezone || location?.timezone}
          />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <CityComparison
          currentTimezone={timeData.timezone}
          currentTime={timeData.time}
          currentDate={timeData.date}
          currentUtcOffset={timeData.utcOffset}
        />
      </motion.div>
    </section>
  )
}
