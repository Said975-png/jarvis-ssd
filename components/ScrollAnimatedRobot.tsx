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
      const documentHeight = document.documentElement.scrollHeight - windowHeight
      
      // Calculate progress between 0 and 1
      const progress = Math.min(scrollTop / windowHeight, 1)
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="scroll-animated-robot">
      <Robot3D scrollProgress={scrollProgress} />
    </div>
  )
}
