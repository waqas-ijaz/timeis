"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const MAJOR_CITIES = [
  {
    name: "New York",
    state: "New York",
    country: "United States",
    timezone: "America/New_York",
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    name: "Los Angeles",
    state: "California",
    country: "United States",
    timezone: "America/Los_Angeles",
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    name: "London",
    state: "England",
    country: "United Kingdom",
    timezone: "Europe/London",
    latitude: 51.5074,
    longitude: -0.1278,
  },
  {
    name: "Paris",
    state: "Île-de-France",
    country: "France",
    timezone: "Europe/Paris",
    latitude: 48.8566,
    longitude: 2.3522,
  },
  { name: "Tokyo", state: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", latitude: 35.6762, longitude: 139.6503 },
  {
    name: "Sydney",
    state: "New South Wales",
    country: "Australia",
    timezone: "Australia/Sydney",
    latitude: -33.8688,
    longitude: 151.2093,
  },
  {
    name: "Dubai",
    state: "Dubai",
    country: "United Arab Emirates",
    timezone: "Asia/Dubai",
    latitude: 25.2048,
    longitude: 55.2708,
  },
  {
    name: "Singapore",
    state: "Singapore",
    country: "Singapore",
    timezone: "Asia/Singapore",
    latitude: 1.3521,
    longitude: 103.8198,
  },
  {
    name: "Hong Kong",
    state: "Hong Kong",
    country: "Hong Kong",
    timezone: "Asia/Hong_Kong",
    latitude: 22.3193,
    longitude: 114.1694,
  },
  {
    name: "Bangkok",
    state: "Bangkok",
    country: "Thailand",
    timezone: "Asia/Bangkok",
    latitude: 13.7563,
    longitude: 100.5018,
  },
  {
    name: "Mumbai",
    state: "Maharashtra",
    country: "India",
    timezone: "Asia/Kolkata",
    latitude: 19.076,
    longitude: 72.8777,
  },
  { name: "Delhi", state: "Delhi", country: "India", timezone: "Asia/Kolkata", latitude: 28.7041, longitude: 77.1025 },
  {
    name: "Moscow",
    state: "Moscow",
    country: "Russia",
    timezone: "Europe/Moscow",
    latitude: 55.7558,
    longitude: 37.6173,
  },
  {
    name: "Istanbul",
    state: "Istanbul",
    country: "Turkey",
    timezone: "Europe/Istanbul",
    latitude: 41.0082,
    longitude: 28.9784,
  },
  { name: "Cairo", state: "Cairo", country: "Egypt", timezone: "Africa/Cairo", latitude: 30.0444, longitude: 31.2357 },
  {
    name: "São Paulo",
    state: "São Paulo",
    country: "Brazil",
    timezone: "America/Sao_Paulo",
    latitude: -23.5505,
    longitude: -46.6333,
  },
  {
    name: "Mexico City",
    state: "Mexico City",
    country: "Mexico",
    timezone: "America/Mexico_City",
    latitude: 19.4326,
    longitude: -99.1332,
  },
  {
    name: "Toronto",
    state: "Ontario",
    country: "Canada",
    timezone: "America/Toronto",
    latitude: 43.6532,
    longitude: -79.3832,
  },
  {
    name: "Berlin",
    state: "Berlin",
    country: "Germany",
    timezone: "Europe/Berlin",
    latitude: 52.52,
    longitude: 13.405,
  },
  {
    name: "Amsterdam",
    state: "North Holland",
    country: "Netherlands",
    timezone: "Europe/Amsterdam",
    latitude: 52.3676,
    longitude: 4.9041,
  },
]

interface CityGridProps {
  onCitySelect?: (
    cityName: string,
    timezone: string,
    country: string,
    state: string,
    latitude: number,
    longitude: number,
  ) => void
  selectedCity?: string | null
}

export default function CityGrid({ onCitySelect, selectedCity }: CityGridProps) {
  const [cities, setCities] = useState<typeof MAJOR_CITIES>([])

  useEffect(() => {
    setCities(MAJOR_CITIES)
  }, [])

  const handleCityClick = (city: (typeof MAJOR_CITIES)[0]) => {
    if (onCitySelect) {
      onCitySelect(city.name, city.timezone, city.country, city.state, city.latitude, city.longitude)
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-12 md:py-20 border-t border-border">
      <h2 className="text-lg font-semibold mb-6 text-foreground">Major Cities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {cities.map((city, index) => (
          <motion.button
            key={city.name}
            onClick={() => handleCityClick(city)}
            className={`px-4 py-3 rounded border transition-all text-left ${
              selectedCity === city.name
                ? "bg-foreground text-background border-foreground"
                : "border-border text-foreground hover:bg-muted hover:border-foreground"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-sm font-medium">
              Time in {city.name}, {city.state}, {city.country}
            </div>
            <div className="text-xs opacity-75 mt-1">now</div>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
