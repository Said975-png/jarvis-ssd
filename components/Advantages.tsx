'use client'

import { useState, useEffect, useRef } from 'react'
import { Brain, Zap, Target, TrendingUp, Users, Shield } from 'lucide-react'

const advantages = [
  {
    icon: Brain,
    title: "AI-Powered Intelligence",
    description: "Advanced machine learning algorithms that understand customer behavior and provide personalized experiences for each visitor.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Zap,
    title: "Lightning Fast Performance",
    description: "Optimized for speed with 99.9% uptime guarantee. Your customers get instant responses and seamless interactions.",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Target,
    title: "Precision Targeting",
    description: "Smart recommendation engine that increases conversion rates by up to 40% through intelligent product suggestions.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: TrendingUp,
    title: "Sales Growth Analytics",
    description: "Real-time insights and detailed analytics help you understand what drives sales and optimize your strategy.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Users,
    title: "24/7 Customer Support",
    description: "AI assistant handles customer queries round the clock, reducing response time and improving satisfaction.",
    color: "from-indigo-500 to-blue-500"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level security with SSL encryption, GDPR compliance, and advanced fraud protection for your peace of mind.",
    color: "from-red-500 to-rose-500"
  }
]

export default function Advantages() {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const sectionRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0')
          if (entry.isIntersecting) {
            setVisibleItems(prev => [...new Set([...prev, index])])
          }
        })
      },
      { threshold: 0.3 }
    )

    itemRefs.current.forEach((item) => {
      if (item) observer.observe(item)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="advantages-section" id="advantages">
      <div className="advantages-bg">
        <div className="advantages-grid-overlay" />
      </div>
      
      <div className="advantages-container">
        <div className="advantages-header">
          <h2 className="advantages-title">
            Why Choose <span className="gradient-text">JARVIS</span>
          </h2>
          <p className="advantages-subtitle">
            Powerful AI-driven solutions that transform your e-commerce business
          </p>
        </div>

        <div className="advantages-grid">
          {advantages.map((advantage, index) => {
            const Icon = advantage.icon
            return (
              <div
                key={index}
                ref={(el) => itemRefs.current[index] = el}
                data-index={index}
                className={`advantage-card ${visibleItems.includes(index) ? 'visible' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`advantage-icon bg-gradient-to-br ${advantage.color}`}>
                  <Icon className="icon" />
                </div>
                <h3 className="advantage-title">{advantage.title}</h3>
                <p className="advantage-description">{advantage.description}</p>
                <div className="advantage-glow"></div>
              </div>
            )
          })}
        </div>

        <div className="advantages-cta">
          <button className="primary-button">
            <span>Get Started Today</span>
            <svg className="button-arrow" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="cta-text">
            <span className="cta-label">Join 500+ successful businesses</span>
            <span className="cta-subtext">Start your AI-powered transformation today</span>
          </div>
        </div>
      </div>
    </section>
  )
}
