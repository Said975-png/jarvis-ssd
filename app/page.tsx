import Hero from '@/components/Hero'
import Advantages from '@/components/Advantages'
import Pricing from '@/components/Pricing'
import AIConsultant from '@/components/AIConsultant'
import Reviews from '@/components/Reviews'
import ScrollAnimatedRobot from '@/components/ScrollAnimatedRobot'
import JarvisChat from '@/components/JarvisChat'
import Footer from '@/components/Footer'
import './globals.css'

export default function Home() {
  return (
    <>
      <ScrollAnimatedRobot />
      <main className="min-h-screen">
        <Hero />
        <Advantages />
        <Pricing />
        <AIConsultant />
        <Reviews />
      </main>
      <JarvisChat />
    </>
  )
}
