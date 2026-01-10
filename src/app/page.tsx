'use client'

import Hero from '@/components/Hero'
import Problem from '@/components/Problem'
import Solution from '@/components/Solution'
import HowItWorks from '@/components/HowItWorks'
import Screening from '@/components/Screening'
import Customization from '@/components/Customization'
import Pricing from '@/components/Pricing'
import SignupForm from '@/components/SignupForm'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <Screening />
      <Customization />
      <Pricing />
      <SignupForm />
      <Footer />
    </main>
  )
}
