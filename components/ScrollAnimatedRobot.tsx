'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const Robot3D = dynamic(() => import('./Robot3D'), {
  ssr: false,
  loading: () => <div className="robot-loading" />
})

export default function ScrollAnimatedRobot() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Show robot on first two sections and a bit more
      const shouldShow = scrollTop < windowHeight * 2.5
      setIsVisible(shouldShow)

      // Calculate progress for robot movement between sections
      // Start moving when scrolled 30% of first screen, complete when entering second section
      const startPoint = windowHeight * 0.3
      const endPoint = windowHeight * 1.2

      let progress = 0
      if (scrollTop >= startPoint) {
        progress = Math.min((scrollTop - startPoint) / (endPoint - startPoint), 1)
      }

      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Call once to set initial position
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="scroll-animated-robot">
      <Robot3D scrollProgress={scrollProgress} />
    </div>
  )
}
