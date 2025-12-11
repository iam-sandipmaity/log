import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Repository Activity Log - Sandip Maity',
  description: 'A clean, unified timeline of development progress across all projects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
