'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, Star, Mail, Headphones, Clock } from 'lucide-react'
import { useCart } from './CartContext'

const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic',
    subtitle: 'Стартовое решение',
    price: '2 500 000',
    currency: 'сум',
    description: 'Идеально для небольших проектов и стартапов',
    features: [
      'До 5 страниц сайта',
      'Современный дизайн',
      'Адаптивная верстка',
      'SEO оптимизация',
      'Техподдержка email'
    ],
    highlighted: false,
    badge: null,
    color: 'from-gray-600 to-gray-700'
  },
  {
    id: 'pro',
    name: 'Pro',
    subtitle: 'Лучший выбор',
    price: '4 000 000',
    currency: 'сум',
    description: 'Лучший выбор для растущего бизнеса',
    features: [
      'Все из Basic',
      'До 15 страниц сайта',
      'ИИ ассистент интеграция',
      'Продвинутая аналитика',
      'Приоритетная поддержка'
    ],
    highlighted: true,
    badge: 'Лучший выбор',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'max',
    name: 'Max',
    subtitle: 'Премиум решение',
    price: '5 000 000',
    currency: 'сум',
    description: 'Максимум возможностей для крупного бизнеса',
    features: [
      'Все из Pro',
      'Безлимитные страницы',
      'ДЖАРВИС ИИ полная версия',
      'Индивидуальные решения',
      'VIP поддержка 24 часа в сутки'
    ],
    highlighted: false,
    badge: null,
    color: 'from-purple-500 to-pink-500'
  }
]

export default function Pricing() {
  const [visibleCards, setVisibleCards] = useState<string[]>([])
  const sectionRef = useRef<HTMLElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const planId = entry.target.getAttribute('data-plan-id')
          if (entry.isIntersecting && planId) {
            setVisibleCards(prev => [...new Set([...prev, planId])])
          }
        })
      },
      { threshold: 0.3 }
    )

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="pricing-section" id="pricing">
      <div className="pricing-container">
        <div className="pricing-header">
          <h2 className="pricing-title">
            Выберите свой <span className="gradient-text">тариф</span>
          </h2>
          <p className="pricing-subtitle">
            Гибкие решения для любого масштаба бизнеса
          </p>
        </div>

        <div className="pricing-grid">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.id}
              ref={(el) => cardRefs.current[index] = el}
              data-plan-id={plan.id}
              className={`pricing-card ${visibleCards.includes(plan.id) ? 'visible' : ''} ${plan.highlighted ? 'highlighted' : ''}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {plan.badge && (
                <div className="pricing-badge">
                  <Star className="badge-star" />
                  {plan.badge}
                </div>
              )}
              
              <div className="pricing-card-header">
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-subtitle">{plan.subtitle}</p>
                <div className="plan-price">
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-currency">{plan.currency}</span>
                </div>
                <p className="plan-description">{plan.description}</p>
              </div>

              <div className="pricing-card-body">
                <ul className="features-list">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="feature-item">
                      <Check className="feature-check" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pricing-card-footer">
                <button className={`pricing-button ${plan.highlighted ? 'primary' : 'secondary'}`}>
                  <span>Выбрать план</span>
                  <svg className="button-arrow" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {plan.highlighted && (
                <div className="pricing-glow"></div>
              )}
            </div>
          ))}
        </div>

        <div className="pricing-footer">
          <div className="support-info">
            <div className="support-item">
              <Mail className="support-icon" />
              <div className="support-text">
                <span className="support-label">Email поддержка</span>
                <span className="support-detail">support@jarvis.uz</span>
              </div>
            </div>
            <div className="support-item">
              <Headphones className="support-icon" />
              <div className="support-text">
                <span className="support-label">Техническая поддержка</span>
                <span className="support-detail">Помощь в настройк��</span>
              </div>
            </div>
            <div className="support-item">
              <Clock className="support-icon" />
              <div className="support-text">
                <span className="support-label">Время ответа</span>
                <span className="support-detail">До 2 часов</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
