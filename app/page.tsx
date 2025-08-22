import Hero from '@/components/Hero'
import Advantages from '@/components/Advantages'
import Pricing from '@/components/Pricing'
import ScrollAnimatedRobot from '@/components/ScrollAnimatedRobot'
import './globals.css'

export default function Home() {
  return (
    <>
      <ScrollAnimatedRobot />
      <main className="min-h-screen">
        <Hero />
        <Advantages />
        <Pricing />
      </main>
    </>
  )
}
