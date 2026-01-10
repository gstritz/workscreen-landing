import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WorkChat - Stop Screening Employment Cases Manually',
  description: 'WorkChat filters potential clients before they reach your inbox. Get a branded intake link that qualifies inquiries — so you only spend time on cases you can actually take.',
  other: {
    'content-language': 'en',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="content-language" content="en" />
        <meta name="google" content="notranslate" />
      </head>
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
