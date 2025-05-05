import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import LandingLayout from "./landing-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sports Emissions Dashboard",
  description: "Track and analyze sports travel emissions",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={inter.className}>
          <LandingLayout>
            {children}
          </LandingLayout>
      </body>
    </html>
  )
}