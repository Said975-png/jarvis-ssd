'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const Robot3D = dynamic(() => import('./Robot3D'), {
  ssr: false,
  loading: () => <div className="robot-loading" />
})

export default function ScrollAnimatedRobot() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight

      // Calculate progress for robot movement between sections
      // Start moving when scrolled 20% of first screen, complete at 80%
      const startPoint = windowHeight * 0.2
      const endPoint = windowHeight * 0.8

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

  return (
    <div className="scroll-animated-robot">
      <Robot3D scrollProgress={scrollProgress} />
    </div>
  )
}
