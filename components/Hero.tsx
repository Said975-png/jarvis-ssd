'use client'

import { useState, useEffect } from 'react'
import { Zap, MessageCircle, BarChart3, Target, ShoppingCart, User, UserPlus } from 'lucide-react'

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section className="hero-section">
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
              <a href="#services" className="nav-link">Услуги</a>
              <a href="#about" className="nav-link">О нас</a>
              <a href="#contact" className="nav-link">Контакты</a>

              <div className="nav-actions">
                <button className="cart-button" aria-label="Корзина">
                  <ShoppingCart className="cart-icon" />
                  <span className="cart-count">0</span>
                </button>
                <button className="auth-button login-button">
                  <User className="auth-icon" />
                  <span>Вход</span>
                </button>
                <button className="auth-button register-button">
                  <UserPlus className="auth-icon" />
                  <span>Ре��истрация</span>
                </button>
              </div>
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
              <a href="#services" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Услуги</a>
              <a href="#about" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>О нас</a>
              <a href="#contact" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Контакты</a>
              <button className="mobile-cta-button" onClick={() => setIsMobileMenuOpen(false)}>Начать</button>
            </div>
          </nav>

          {/* Main hero content */}
          <div className="hero-main">
            <div className="hero-badge">
              <span className="badge-text">
                <Zap className="badge-icon" />
                ИИ-решения
              </span>
            </div>
            
            <h1 className="hero-title">
              Мы создаем <span className="gradient-text">умные</span>
              <br />
              интернет-магазины
            </h1>
            
            <p className="hero-description">
              JARVIS создает современные сайты с ИИ-ассистентами, которые превращают
              обычные интернет-магазины в умные, клиентоориентированные платформы.
              Увеличьте продажи с автоматической поддержкой, персонализированными рекомендациями и умными взаимодействиями.
            </p>

            <div className="hero-actions">
              <button className="primary-button">
                <span>Начать проект</span>
                <svg className="button-arrow" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="secondary-button">
                Наши работы
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">ИИ-магазинов</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">300%</span>
                <span className="stat-label">Рост продаж</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">ИИ-поддержка</span>
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
          <div className="card-text">ИИ-чат поддержка</div>
        </div>
        <div className="floating-card card-2">
          <div className="card-icon">
            <BarChart3 className="icon" />
          </div>
          <div className="card-text">Аналитика и отчеты</div>
        </div>
        <div className="floating-card card-3">
          <div className="card-icon">
            <Target className="icon" />
          </div>
          <div className="card-text">Умные рекомендации</div>
        </div>
      </div>
    </section>
  )
}
