import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})
export const metadata: Metadata = {
  title: "WantAResume",
  description: "Resume builder",
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
