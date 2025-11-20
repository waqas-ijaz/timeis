"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import TimeDisplay from "@/components/time-display"
import CityGrid from "@/components/city-grid"
import TimezoneLinks from "@/components/timezone-links"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedLatitude, setSelectedLatitude] = useState<number | null>(null)
  const [selectedLongitude, setSelectedLongitude] = useState<number | null>(null)
  const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleCitySelect = (
    cityName: string,
    timezone: string,
    country: string,
    state?: string,
    latitude?: number,
    longitude?: number,
  ) => {
    setSelectedCity(cityName)
    setSelectedCountry(country)
    setSelectedState(state || "")
    setSelectedLatitude(latitude || null)
    setSelectedLongitude(longitude || null)
    setSelectedTimezone(timezone)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <TimeDisplay
        onCitySelect={handleCitySelect}
        selectedCity={selectedCity}
        selectedCountry={selectedCountry}
        selectedState={selectedState}
        selectedLatitude={selectedLatitude}
        selectedLongitude={selectedLongitude}
        selectedTimezone={selectedTimezone}
      />
      <CityGrid onCitySelect={handleCitySelect} selectedCity={selectedCity} />
      <TimezoneLinks />
    </main>
  )
}
