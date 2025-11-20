"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ComparisonCity {
  timezone: string
  time: string
  date: string
  utcOffset: string
}

interface CityComparisonProps {
  currentTimezone: string
  currentTime: string
  currentDate: string
  currentUtcOffset: string
}

const MAJOR_CITIES = [
  { name: "New York", timezone: "America/New_York" },
  { name: "London", timezone: "Europe/London" },
  { name: "Tokyo", timezone: "Asia/Tokyo" },
  { name: "Sydney", timezone: "Australia/Sydney" },
  { name: "Dubai", timezone: "Asia/Dubai" },
  { name: "Singapore", timezone: "Asia/Singapore" },
  { name: "Hong Kong", timezone: "Asia/Hong_Kong" },
  { name: "Paris", timezone: "Europe/Paris" },
  { name: "Mumbai", timezone: "Asia/Kolkata" },
  { name: "São Paulo", timezone: "America/Sao_Paulo" },
]

export default function CityComparison({
  currentTimezone,
  currentTime,
  currentDate,
  currentUtcOffset,
}: CityComparisonProps) {
  const [comparisonCities, setComparisonCities] = useState<ComparisonCity[]>([])
  const [selectedCity, setSelectedCity] = useState<string>("")

  const addCity = (timezone: string) => {
    if (!comparisonCities.find((c) => c.timezone === timezone)) {
      const now = new Date()
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })

      const dateFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "short",
        month: "short",
        day: "numeric",
      })

      setComparisonCities([
        ...comparisonCities,
        {
          timezone,
          time: formatter.format(now),
          date: dateFormatter.format(now),
          utcOffset: calculateUtcOffset(timezone),
        },
      ])
      setSelectedCity("")
    }
  }

  const removeCity = (timezone: string) => {
    setComparisonCities(comparisonCities.filter((c) => c.timezone !== timezone))
  }

  const calculateUtcOffset = (timezone: string): string => {
    const now = new Date()
    const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }))
    const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }))
    const offset = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60)
    const sign = offset >= 0 ? "+" : ""
    return `UTC${sign}${offset}`
  }

  if (comparisonCities.length === 0) {
    return (
      <motion.div
        className="mt-12 p-6 bg-card rounded-lg border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold mb-4 text-foreground">Compare Cities</h2>
        <div className="flex gap-2">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm"
          >
            <option value="">Select a city to compare...</option>
            {MAJOR_CITIES.map((city) => (
              <option key={city.timezone} value={city.timezone}>
                {city.name}
              </option>
            ))}
          </select>
          <Button onClick={() => selectedCity && addCity(selectedCity)} size="sm">
            Add
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="mt-12 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Compare Cities</h2>
        <div className="flex gap-2">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-md text-foreground text-sm"
          >
            <option value="">Add another city...</option>
            {MAJOR_CITIES.map((city) => (
              <option key={city.timezone} value={city.timezone}>
                {city.name}
              </option>
            ))}
          </select>
          <Button onClick={() => selectedCity && addCity(selectedCity)} size="sm">
            Add
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {comparisonCities.map((city) => (
            <motion.div
              key={city.timezone}
              className="p-4 bg-card rounded-lg border border-border"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground">{city.timezone.split("/")[1]}</p>
                  <p className="text-2xl font-mono font-bold text-foreground">{city.time}</p>
                </div>
                <button
                  onClick={() => removeCity(city.timezone)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>{city.date}</p>
                <p>{city.utcOffset}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
