'use client'

import { useState, useEffect, useRef } from 'react'
import { Brain, Zap, Target, TrendingUp, Users, Shield } from 'lucide-react'

const advantages = [
  {
    icon: Brain,
    title: "ИИ-интеллект",
    description: "Продвинутые алгоритмы машинного обучения, которые понимают поведение клиентов и предоставляют персонализированный опыт для каждого посетителя.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Zap,
    title: "Молниеносная скорость",
    description: "Оптимизированы для скорости с гарантией 99.9% доступности. Ваши клиенты получают мгновенные ответы и бесшовные взаимодействия.",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Target,
    title: "Точное таргетирование",
    description: "Умная система рекомендаций, которая увеличивает конверсию до 40% благодаря интеллектуальным предложениям товаров.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: TrendingUp,
    title: "Аналитика роста продаж",
    description: "Аналитика в реальном времени и подробная статистика помогают понять, что движет продажами и оптимизировать стратегию.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Users,
    title: "Поддержка 24/7",
    description: "ИИ-ассистент обрабатывает запросы клиентов круглосуточно, сокращая время ответа и повышая удовлетворенность.",
    color: "from-indigo-500 to-blue-500"
  },
  {
    icon: Shield,
    title: "Корпоративная безопасность",
    description: "Безопасность банковского уровня с SSL шифрованием, соответствие GDPR и продвинутая за��ита от мошенничества для вашего спокойствия.",
    color: "from-red-500 to-rose-500"
  }
]

export default function Advantages() {
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

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
      {/* Animated background */}
      <div className="hero-bg">
        <div
          className="mouse-gradient"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(14, 165, 233, 0.15), transparent 40%)`
          }}
        />
        <div className="grid-overlay" />
      </div>

      <div className="advantages-container">
        <div className="advantages-header">
          <h2 className="advantages-title">
            Почему выбирают <span className="gradient-text">JARVIS</span>
          </h2>
          <p className="advantages-subtitle">
            Мощные ИИ-решения, которые трансформируют ваш интернет-бизнес
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
            <span>Начать сегодня</span>
            <svg className="button-arrow" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="cta-text">
            <span className="cta-label">Присоединяйтесь к 500+ успешным компаниям</span>
            <span className="cta-subtext">Начните свою ИИ-трансформацию сегодня</span>
          </div>
        </div>
      </div>
    </section>
  )
}
