'use client'

import { useState, useEffect } from 'react'
import { Zap, MessageCircle, BarChart3, Target } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import Robot3D for better performance
const Robot3D = dynamic(() => import('./Robot3D'), {
  ssr: false,
  loading: () => <div className="robot-loading" />
})

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section className="hero-section">
      {/* Animated background */}
      <div className="hero-bg">
        <div
          className="mouse-gradient"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(14, 165, 233, 0.15), transparent 40%)`
          }}
        />
        <div className="grid-overlay" />

        {/* 3D Robot Background */}
        <Robot3D />
      </div>

      {/* Content */}
      <div className={`hero-content ${isLoaded ? 'loaded' : ''}`}>
        <div className="hero-container">
          {/* Navigation */}
          <nav className="hero-nav">
            <div className="nav-logo">
              <span className="logo-text">JARVIS</span>
            </div>

            {/* Desktop Navigation */}
            <div className="nav-links desktop-nav">
              <a href="#services" className="nav-link">Services</a>
              <a href="#about" className="nav-link">About</a>
              <a href="#contact" className="nav-link">Contact</a>
              <button className="cta-button">Get Started</button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
              <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
              <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
            </button>

            {/* Mobile Navigation */}
            <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
              <a href="#services" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Services</a>
              <a href="#about" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>About</a>
              <a href="#contact" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
              <button className="mobile-cta-button" onClick={() => setIsMobileMenuOpen(false)}>Get Started</button>
            </div>
          </nav>

          {/* Main hero content */}
          <div className="hero-main">
            <div className="hero-badge">
              <span className="badge-text">
                <Zap className="badge-icon" />
                AI-Powered Solutions
              </span>
            </div>
            
            <h1 className="hero-title">
              We Create <span className="gradient-text">Intelligent</span>
              <br />
              E-commerce Experiences
            </h1>
            
            <p className="hero-description">
              JARVIS builds cutting-edge websites with AI assistants that transform 
              online stores into intelligent, customer-focused experiences. 
              Boost sales with automated support, personalized recommendations, and smart interactions.
            </p>

            <div className="hero-actions">
              <button className="primary-button">
                <span>Start Your Project</span>
                <svg className="button-arrow" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="secondary-button">
                View Our Work
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">AI-Powered Stores</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">300%</span>
                <span className="stat-label">Average Sales Increase</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">AI Assistant Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="floating-elements">
        <div className="floating-card card-1">
          <div className="card-icon">
            <MessageCircle className="icon" />
          </div>
          <div className="card-text">AI Chat Support</div>
        </div>
        <div className="floating-card card-2">
          <div className="card-icon">
            <BarChart3 className="icon" />
          </div>
          <div className="card-text">Analytics & Insights</div>
        </div>
        <div className="floating-card card-3">
          <div className="card-icon">
            <Target className="icon" />
          </div>
          <div className="card-text">Smart Recommendations</div>
        </div>
      </div>
    </section>
  )
}
