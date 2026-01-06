import type React from "react"
import type { Metadata } from "next"

import "./globals.css"
import { Oxanium, Source_Code_Pro, Source_Serif_4 } from 'next/font/google'
import Providers from "./providers"

// Initialize fonts
const oxanium = Oxanium({ 
  subsets: ['latin'], 
  weight: ["200","300","400","500","600","700","800"],
  variable: '--font-oxanium'
})
const sourceCodePro = Source_Code_Pro({ 
  subsets: ['latin'], 
  weight: ["200","300","400","500","600","700","800","900"],
  variable: '--font-source-code-pro'
})
const sourceSerif4 = Source_Serif_4({ 
  subsets: ['latin'], 
  weight: ["200","300","400","500","600","700","800","900"],
  variable: '--font-source-serif-4'
})

export const metadata: Metadata = {
  title: "Blingo GitHub Analyzer - Open Source Intelligence",
  description:
    "Get instant insights on GitHub repositories. Analyze stars, pull requests, version updates, and discover cool facts about your favorite open source projects.",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${oxanium.variable} ${sourceCodePro.variable} ${sourceSerif4.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
