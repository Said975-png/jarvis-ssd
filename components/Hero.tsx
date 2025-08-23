'use client'

import { useState, useEffect } from 'react'
import { Zap, MessageCircle, BarChart3, Target, ShoppingCart, User, UserPlus } from 'lucide-react'

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isContractPanelOpen, setIsContractPanelOpen] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    console.log('Mobile menu state changed:', isMobileMenuOpen);
  }, [isMobileMenuOpen])

  // Ensure menu is closed on component mount
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [])

  // Handle escape key and click outside to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (isMobileMenuOpen && target && !target.closest('.mobile-menu-button') && !target.closest('.mobile-nav')) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isMobileMenuOpen])

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
              <a href="#contact" className="nav-link">��онтакты</a>

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
                  <span>Регистрация</span>
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-button"
              onClick={() => {
                const newState = !isMobileMenuOpen;
                console.log('Mobile menu toggle:', { from: isMobileMenuOpen, to: newState });
                setIsMobileMenuOpen(newState);
              }}
              aria-label="Toggle mobile menu"
              type="button"
            >
              <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
              <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
              <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
            </button>

            {/* Mobile Navigation */}
            <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
              <a href="#services" className="mobile-nav-link" onClick={() => {
                console.log('Mobile nav link clicked - closing menu');
                setIsMobileMenuOpen(false);
              }}>Услуги</a>
              <a href="#about" className="mobile-nav-link" onClick={() => {
                console.log('Mobile nav link clicked - closing menu');
                setIsMobileMenuOpen(false);
              }}>О нас</a>
              <a href="#contact" className="mobile-nav-link" onClick={() => {
                console.log('Mobile nav link clicked - closing menu');
                setIsMobileMenuOpen(false);
              }}>Контакты</a>

              <div className="mobile-nav-actions">
                <button className="mobile-nav-button cart-button" onClick={() => setIsMobileMenuOpen(false)}>
                  <ShoppingCart className="mobile-nav-icon" />
                  <span>Моя корзина</span>
                  <span className="mobile-cart-count">0</span>
                </button>
                <button className="mobile-nav-button auth-button login" onClick={() => setIsMobileMenuOpen(false)}>
                  <User className="mobile-nav-icon" />
                  <span>Войти в аккаунт</span>
                </button>
                <button className="mobile-nav-button auth-button register" onClick={() => setIsMobileMenuOpen(false)}>
                  <UserPlus className="mobile-nav-icon" />
                  <span>Создать аккаунт</span>
                </button>
              </div>
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
              интернет-магази��ы
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
