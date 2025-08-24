'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Clock, Users, TrendingUp, Star, CheckCircle2, ArrowRight, Bot, UserCheck, Target, Zap } from 'lucide-react'

const chatMessages = [
  {
    id: 1,
    type: 'user',
    message: 'Ищу подарок для жены на годовщину. Бюджет до 50 000 рублей.',
    timestamp: '14:32'
  },
  {
    id: 2,
    type: 'ai',
    message: 'Какой прекрасный повод! 🎉 Учитывая ваш бюджет, могу предложить несколько вариантов. Что предпочитает ваша супруга: украшения, парфюм, технику или что-то уникальное?',
    timestamp: '14:32'
  },
  {
    id: 3,
    type: 'user',
    message: 'Она любит украшения, особенно кольца с камнями.',
    timestamp: '14:33'
  },
  {
    id: 4,
    type: 'ai',
    message: 'Отличный выбор! У нас есть коллекция колец с сапфирами от 35 000₽ и изумрудами от 42 000₽. Также рекомендую обратить внимание на кольцо с танзанитом - очень редкий камень, 48 000₽. Какой камень она предпочитает?',
    timestamp: '14:33'
  },
  {
    id: 5,
    type: 'user',
    message: 'Сапфиры - её любимые!',
    timestamp: '14:34'
  },
  {
    id: 6,
    type: 'ai',
    message: 'Идеально! У нас есть кольцо с синим сапфиром 2 карата в платиновой оправе за 45 000₽. Могу организовать примерку или доставку курьером с возможностью возврата. Хотите посмотреть фото?',
    timestamp: '14:34'
  }
]


const statistics = [
  {
    icon: TrendingUp,
    value: '+67%',
    label: 'Рост конверсии',
    description: 'Увеличение продаж благодаря персонализированным рекомендациям'
  },
  {
    icon: Clock,
    value: '24/7',
    label: 'Круглосуточно',
    description: 'Обслуживание клиентов без выходных и перерывов'
  },
  {
    icon: Users,
    value: '∞',
    label: 'Клиентов одновременно',
    description: 'Неограниченная пропускная способность'
  },
  {
    icon: Target,
    value: '94%',
    label: 'Точность рекомендаций',
    description: 'ИИ анализирует предпочтения и историю покупок'
  }
]

export default function AIConsultant() {
  const [visibleMessages, setVisibleMessages] = useState<number>(0)
  const [isTyping, setIsTyping] = useState(false)
  const [visibleStats, setVisibleStats] = useState<number[]>([])
  const sectionRef = useRef<HTMLElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  // Анимация появления сообщений в чате
  useEffect(() => {
    if (visibleMessages < chatMessages.length) {
      const timer = setTimeout(() => {
        setIsTyping(true)
        setTimeout(() => {
          setVisibleMessages(prev => prev + 1)
          setIsTyping(false)
        }, 1500)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [visibleMessages])

  // Автоматическая прокрутка к последнему сообщению
  useEffect(() => {
    if (chatMessagesRef.current && (visibleMessages > 0 || isTyping)) {
      const container = chatMessagesRef.current
      setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        })
      }, 300)
    }
  }, [visibleMessages, isTyping])

  // Intersection Observer для элементов
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement
            
            if (element === chatRef.current && visibleMessages === 0) {
              setVisibleMessages(1)
            }

            if (element === statsRef.current) {
              statistics.forEach((_, index) => {
                setTimeout(() => {
                  setVisibleStats(prev => [...prev, index])
                }, index * 150)
              })
            }
          }
        })
      },
      { threshold: 0.3, rootMargin: '-50px' }
    )

    const currentChatRef = chatRef.current
    const currentStatsRef = statsRef.current

    if (currentChatRef) observer.observe(currentChatRef)
    if (currentStatsRef) observer.observe(currentStatsRef)

    return () => {
      if (currentChatRef) observer.unobserve(currentChatRef)
      if (currentStatsRef) observer.unobserve(currentStatsRef)
    }
  }, [])

  return (
    <section ref={sectionRef} className="ai-consultant-section">
      <div className="ai-consultant-container">
        {/* Header */}
        <div className="ai-consultant-header">
          <div className="consultant-badge">
            <Bot className="badge-icon" />
            <span className="badge-text">ИИ-Консультант ДЖАРВИС</span>
          </div>
          
          <h2 className="ai-consultant-title">
            ДЖАРВИС заменяет <span className="gradient-text">целую команду</span> продавцов-консультантов
          </h2>
          
          <p className="ai-consultant-subtitle">
            Персональный ИИ-помощник работает 24/7, общается с клиентами, отвечает на вопросы 
            и предлагает товары на основе индивидуальных предпочтений и истории покупок
          </p>
        </div>

        {/* Chat Demo */}
        <div ref={chatRef} className="chat-demo-container">
          <div className="chat-demo-header">
            <div className="chat-indicator">
              <div className="status-dot online" />
              <span>ДЖАРВИС онлайн</span>
            </div>
            <div className="chat-info">
              <MessageCircle className="chat-icon" />
              <span>Живая демонстрация общения</span>
            </div>
          </div>
          
          <div ref={chatMessagesRef} className="chat-messages" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {chatMessages.slice(0, visibleMessages).map((msg, index) => (
              <div
                key={msg.id}
                className={`message ${msg.type === 'ai' ? 'ai-message' : 'user-message'} message-${index}`}
              >
                <div className="message-avatar">
                  {msg.type === 'ai' ? <Bot size={16} /> : <UserCheck size={16} />}
                </div>
                <div className="message-content">
                  <div className="message-text">{msg.message}</div>
                  <div className="message-time">{msg.timestamp}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message ai-message typing-message">
                <div className="message-avatar">
                  <Bot size={16} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>


        {/* Statistics */}
        <div ref={statsRef} className="stats-section">
          <h3 className="stats-title">Результаты внедрения ДЖАРВИС</h3>
          
          <div className="stats-grid">
            {statistics.map((stat, index) => (
              <div 
                key={index} 
                className={`stat-card ${visibleStats.includes(index) ? 'visible' : ''}`}
              >
                <div className="stat-icon">
                  <stat.icon />
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-description">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
