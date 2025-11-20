"use client"

import { useEffect } from "react"

export default function FaviconUpdater() {
  useEffect(() => {
    const updateFavicon = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 64
      canvas.height = 64

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const now = new Date()
      const hours = now.getHours() % 12
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()

      ctx.fillStyle = "#0f172a"
      ctx.fillRect(0, 0, 64, 64)

      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(32, 32, 30, 0, Math.PI * 2)
      ctx.stroke()

      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 1
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6 - Math.PI / 2
        const x1 = 32 + Math.cos(angle) * 28
        const y1 = 32 + Math.sin(angle) * 28
        const x2 = 32 + Math.cos(angle) * 24
        const y2 = 32 + Math.sin(angle) * 24
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      const hourAngle = ((hours + minutes / 60) * Math.PI) / 6 - Math.PI / 2
      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(32, 32)
      ctx.lineTo(32 + Math.cos(hourAngle) * 12, 32 + Math.sin(hourAngle) * 12)
      ctx.stroke()

      const minuteAngle = ((minutes + seconds / 60) * Math.PI) / 30 - Math.PI / 2
      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(32, 32)
      ctx.lineTo(32 + Math.cos(minuteAngle) * 18, 32 + Math.sin(minuteAngle) * 18)
      ctx.stroke()

      const secondAngle = (seconds * Math.PI) / 30 - Math.PI / 2
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(32, 32)
      ctx.lineTo(32 + Math.cos(secondAngle) * 20, 32 + Math.sin(secondAngle) * 20)
      ctx.stroke()

      ctx.fillStyle = "#e2e8f0"
      ctx.beginPath()
      ctx.arc(32, 32, 3, 0, Math.PI * 2)
      ctx.fill()

      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement
      if (link) {
        link.href = canvas.toDataURL()
      }
    }

    updateFavicon()
    const interval = setInterval(updateFavicon, 1000)

    return () => clearInterval(interval)
  }, [])

  return null
}
