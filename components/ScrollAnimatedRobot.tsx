'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const Robot3D = dynamic(() => import('./Robot3D'), {
  ssr: false,
  loading: () => <div className="robot-loading" />
})

export default function ScrollAnimatedRobot() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [currentSection, setCurrentSection] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight

      // Determine current section (0 = hero, 1 = advantages, 2 = pricing, 3 = ai-consultant, 4 = reviews)
      const section = Math.floor(scrollTop / windowHeight)
      setCurrentSection(Math.min(section, 4))

      // Calculate progress for robot movement between sections
      let progress = 0

      if (scrollTop < windowHeight) {
        // Hero section - no movement yet
        progress = 0
      } else if (scrollTop < windowHeight * 2) {
        // Moving from hero to advantages section
        progress = (scrollTop - windowHeight * 0.5) / (windowHeight * 0.8)
        progress = Math.max(0, Math.min(progress, 1))
      } else if (scrollTop < windowHeight * 3) {
        // Moving from advantages to pricing section
        const secondToThirdProgress = (scrollTop - windowHeight * 1.5) / (windowHeight * 0.8)
        progress = 1 + Math.max(0, Math.min(secondToThirdProgress, 1))
      } else if (scrollTop < windowHeight * 4) {
        // Moving from pricing to ai-consultant section
        const thirdToFourthProgress = (scrollTop - windowHeight * 2.5) / (windowHeight * 0.8)
        progress = 2 + Math.max(0, Math.min(thirdToFourthProgress, 1))
      } else {
        // Moving from ai-consultant to reviews section
        const fourthToFifthProgress = (scrollTop - windowHeight * 3.5) / (windowHeight * 0.8)
        progress = 3 + Math.max(0, Math.min(fourthToFifthProgress, 1))
      }

      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Call once to set initial position
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="scroll-animated-robot" style={{
      opacity: isVisible ? 1 : 0
    }}>
      <Robot3D scrollProgress={scrollProgress} currentSection={currentSection} />
    </div>
  )
}
