"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { isInDST, getTimezoneInfo } from "@/lib/api-utils"

interface DSTData {
  isDST: boolean
  dstStatus: string
  standardOffset: string
  daylightOffset: string
  nextTransition: string
  loading: boolean
}

interface DSTInfoProps {
  timezone: string
}

export default function DSTInfo({ timezone }: DSTInfoProps) {
  const [dstData, setDstData] = useState<DSTData>({
    isDST: false,
    dstStatus: "Loading...",
    standardOffset: "",
    daylightOffset: "",
    nextTransition: "",
    loading: true,
  })

  useEffect(() => {
    const calculateDST = () => {
      try {
        if (!timezone || timezone === "Loading..." || timezone === "Unknown") {
          setDstData((prev) => ({
            ...prev,
            loading: true,
          }))
          return
        }

        const isDST = isInDST(timezone)
        const tzInfo = getTimezoneInfo(timezone)

        // Calculate standard and daylight offsets
        const now = new Date()
        const januaryDate = new Date(now.getFullYear(), 0, 15)
        const julyDate = new Date(now.getFullYear(), 6, 15)

        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })

        const getOffset = (date: Date) => {
          const parts = formatter.formatToParts(date)
          const tzDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            Number.parseInt(parts.find((p) => p.type === "hour")?.value || "0"),
            Number.parseInt(parts.find((p) => p.type === "minute")?.value || "0"),
            Number.parseInt(parts.find((p) => p.type === "second")?.value || "0"),
          )
          return (date.getTime() - tzDate.getTime()) / (1000 * 60 * 60)
        }

        const januaryOffset = getOffset(januaryDate)
        const julyOffset = getOffset(julyDate)

        const standardOffset = Math.min(januaryOffset, julyOffset)
        const daylightOffset = Math.max(januaryOffset, julyOffset)

        const formatOffset = (offset: number) => {
          const sign = offset >= 0 ? "+" : ""
          const hours = Math.floor(Math.abs(offset))
          const minutes = Math.round((Math.abs(offset) - hours) * 60)
          return `UTC${sign}${hours}:${String(minutes).padStart(2, "0")}`
        }

        setDstData({
          isDST,
          dstStatus: isDST ? "Daylight Saving Time Active" : "Standard Time",
          standardOffset: formatOffset(standardOffset),
          daylightOffset: formatOffset(daylightOffset),
          nextTransition: isDST ? "Spring Forward (March)" : "Fall Back (November)",
          loading: false,
        })
      } catch (error) {
        console.error("[v0] DST calculation failed:", error)
        setDstData((prev) => ({
          ...prev,
          loading: false,
          dstStatus: "Unable to determine DST",
        }))
      }
    }

    if (timezone) {
      calculateDST()
    }
  }, [timezone])

  if (dstData.loading) {
    return null
  }

  return (
    <motion.div
      className="mt-6 p-4 bg-card rounded-lg border border-border"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">DST Status</p>
          <p className="text-sm font-semibold text-foreground">{dstData.dstStatus}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Standard Time</p>
          <p className="text-sm font-semibold text-foreground">{dstData.standardOffset}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Daylight Time</p>
          <p className="text-sm font-semibold text-foreground">{dstData.daylightOffset}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Next Transition</p>
          <p className="text-sm font-semibold text-foreground">{dstData.nextTransition}</p>
        </div>
      </div>
    </motion.div>
  )
}
