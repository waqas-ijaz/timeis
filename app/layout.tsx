import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import FaviconUpdater from "@/components/favicon-updater"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "time.is - Exact time for any timezone",
  description: "Check the exact time with atomic clock accuracy. Auto-detect your location and timezone.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <FaviconUpdater />
        {children}
      </body>
    </html>
  )
}
