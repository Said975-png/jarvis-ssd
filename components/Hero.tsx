'use client'

import { useState, useEffect } from 'react'
import { Zap, MessageCircle, BarChart3, Target, ShoppingCart, User, UserPlus, X } from 'lucide-react'

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isContractPanelOpen, setIsContractPanelOpen] = useState(false)
  const [isFeaturesPanelOpen, setIsFeaturesPanelOpen] = useState(false)

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

  // Lock scroll when panels are open
  useEffect(() => {
    if (isContractPanelOpen || isFeaturesPanelOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
    }
  }, [isContractPanelOpen, isFeaturesPanelOpen])

  // Handle escape key for panels
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isContractPanelOpen) {
          setIsContractPanelOpen(false)
        }
        if (isFeaturesPanelOpen) {
          setIsFeaturesPanelOpen(false)
        }
      }
    }

    if (isContractPanelOpen || isFeaturesPanelOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isContractPanelOpen, isFeaturesPanelOpen])

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
              обычные интернет-магазины в умные, клиентоориентиров��нные платформы.
              Увеличьте продажи с автоматической поддержкой, персонализированными рекомендациями и умными взаимодействиями.
            </p>

            <div className="hero-actions">
              <button className="primary-button" onClick={() => setIsContractPanelOpen(true)}>
                <span>Процесс договора</span>
                <svg className="button-arrow" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="secondary-button" onClick={() => setIsFeaturesPanelOpen(true)}>
                Узнать больше
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

      {/* Contract Process Panel */}
      {isContractPanelOpen && (
        <div className="contract-panel-overlay" onClick={() => setIsContractPanelOpen(false)}>
          <div className="contract-panel" onClick={(e) => e.stopPropagation()}>
            <div className="contract-panel-header">
              <h2 className="contract-panel-title">Процесс работы с нами</h2>
              <button
                className="contract-panel-close"
                onClick={() => setIsContractPanelOpen(false)}
                aria-label="Закрыть панель"
              >
                <X className="close-icon" />
              </button>
            </div>

            <div className="contract-panel-content">
              <div className="contract-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3 className="step-title">Создание макета</h3>
                  <p className="step-description">
                    Сначала мы создаем детальный макет вашего проекта. Это включает в себя дизайн всех страниц, структуру сайта и техническое задание. На этом этапе вы видите как будет выглядеть коне��ный результат.
                  </p>
                </div>
              </div>

              <div className="contract-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3 className="step-title">Согласование и предоплата</h3>
                  <p className="step-description">
                    Если макет и техническое решение вас устраивает, мы заключаем договор и получаем предоплату 50 процентов от стоимости проекта. Это позволяет нам приступить к разработке с полной уверенностью.
                  </p>
                </div>
              </div>

              <div className="contract-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3 className="step-title">Разработка проекта</h3>
                  <p className="step-description">
                    Приступаем к программированию и созданию вашего проекта. Макет корректируется и дорабатывается в процессе работы для достижения наилучшего результата. Мы не меняем макет по несколько раз без весомых ос��ований.
                  </p>
                </div>
              </div>

              <div className="contract-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3 className="step-title">Тестирование и доработки</h3>
                  <p className="step-description">
                    Проводим полное тестирование функционала, проверяем адаптивность на всех устройствах, оптимизируем скорость загрузки. Исправляем выявленные ошибки и дорабатываем детали по вашим пожеланиям.
                  </p>
                </div>
              </div>

              <div className="contract-step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h3 className="step-title">Сдача проекта</h3>
                  <p className="step-description">
                    После завершения разработки и получения окончательного платежа мы передаем вам готовый проект. Предоставляем инструкции по использованию, помогаем с размещением на хостинге и даем гарантию на исправление ошибок.
                  </p>
                </div>
              </div>

              <div className="contract-step">
                <div className="step-number">6</div>
                <div className="step-content">
                  <h3 className="step-title">Поддержка и развитие</h3>
                  <p className="step-description">
                    Предлагаем техническую поддержку проекта, обновления и добавление новых функций. Помогаем масштабировать ваш бизнес с помощью дополнительных ИИ решений и интеграций.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JARVIS Features Panel */}
      {isFeaturesPanelOpen && (
        <div className="features-panel-overlay" onClick={() => setIsFeaturesPanelOpen(false)}>
          <div className="features-panel" onClick={(e) => e.stopPropagation()}>
            <div className="features-panel-header">
              <h2 className="features-panel-title">Возможности ДЖАРВИС</h2>
              <button
                className="features-panel-close"
                onClick={() => setIsFeaturesPanelOpen(false)}
                aria-label="Закрыть панель"
              >
                <X className="close-icon" />
              </button>
            </div>

            <div className="features-panel-content">
              <div className="feature-item">
                <div className="feature-content">
                  <h3 className="feature-title">Умный помощник продаж</h3>
                  <p className="feature-description">
                    ДЖАРВИС анализирует поведение каждого клиента в реальном времени и предлагает именно те товары, которые им нужны. Он понимает предпочтения покупателей лучше, чем они сами, изучая их историю покупок и поисковые запросы.
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-content">
                  <h3 className="feature-title">Общение как с живым консультантом</h3>
                  <p className="feature-description">
                    Наш ИИ общается с клиентами естественно и дружелюбно, отвечает на любые вопросы о товарах, помогает с выбором размера, цвета, характеристик. Клиенты даже не замечают, что говорят с роботом - настолько живое и понятное общение.
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-content">
                  <h3 className="feature-title">Персональные рекомендации</h3>
                  <p className="feature-description">
                    ДЖАРВИС создает уникальный профиль каждого покупателя и предлагает товары, которые идеально подходят именно ему. Система учитывает сезон, праздники, предыдущие покупки и даже настроение клиента по его сообщениям.
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-content">
                  <h3 className="feature-title">Увеличение продаж в 3 раза</h3>
                  <p className="feature-description">
                    Магазины с ДЖАРВИС показывают фантастические результаты. Продажи вырастают в среднем на 300 процентов. Клиенты покупают больше, возвращаются чаще и рекомендуют магазин друзьям. Средний чек увеличивается в 2 или 4 раза.
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-content">
                  <h3 className="feature-title">Мгновенная поддержка 24 часа в сутки</h3>
                  <p className="feature-description">
                    ДЖАРВИС никогда не спит, не устает и не берет выходные. Он отвечает клиентам мгновенно в любое время дня и ночи, обрабатывает сотни обращений одновременно и никогда не теряет терпение даже с самыми сложными покупателями.
                  </p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-content">
                  <h3 className="feature-title">Простая интеграция и быстрый запуск</h3>
                  <p className="feature-description">
                    Подключение ДЖАРВИС к вашему магазину занимает всего несколько дней. Никаких сложных настроек. Система сама изучает ваш ассортимент, цены и особенности бизнеса. Через неделю вы уже видите первые результаты роста продаж.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
