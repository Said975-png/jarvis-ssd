'use client'

import { Mail, Phone, MapPin, Bot, ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer-section">
      <div className="footer-bg">
        <div className="footer-grid-overlay" />
      </div>

      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-column company-info">
            <div className="footer-logo">
              <Bot className="logo-icon" />
              <span className="logo-text">ДЖАРВИС</span>
            </div>
            <p className="company-description">
              Революционная ИИ-платформа для создания интеллектуальных интернет-магазинов 
              с персональным ИИ-консультантом ДЖАРВИС
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Telegram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.09-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.864 3.488"/>
                </svg>
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="footer-column">
            <h3 className="footer-heading">Услуги</h3>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">Создание интернет-магазина</a></li>
              <li><a href="#" className="footer-link">Интеграция ИИ-консультанта</a></li>
              <li><a href="#" className="footer-link">Настройка оплаты</a></li>
              <li><a href="#" className="footer-link">SEO-оптимизация</a></li>
              <li><a href="#" className="footer-link">Техническая поддержка</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-column">
            <h3 className="footer-heading">Компания</h3>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">О нас</a></li>
              <li><a href="#" className="footer-link">Портфолио</a></li>
              <li><a href="#" className="footer-link">Отзывы клиентов</a></li>
              <li><a href="#" className="footer-link">Блог</a></li>
              <li><a href="#" className="footer-link">Карьера</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-column">
            <h3 className="footer-heading">Контакты</h3>
            <div className="contact-info">
              <div className="contact-item">
                <Phone className="contact-icon" />
                <span>+998 90 123 45 67</span>
              </div>
              <div className="contact-item">
                <Mail className="contact-icon" />
                <span>info@jarvis-ai.uz</span>
              </div>
              <div className="contact-item">
                <MapPin className="contact-icon" />
                <span>Ташкент, Узбекистан</span>
              </div>
            </div>
          </div>
        </div>


        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; 2024 ДЖАРВИС ИИ. Все права защищены.</p>
            </div>
            <div className="legal-links">
              <a href="#" className="legal-link">Политика конфиденциальности</a>
              <a href="#" className="legal-link">Условия использования</a>
              <a href="#" className="legal-link">Договор оферты</a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop} aria-label="Наверх">
          <ArrowUp className="scroll-icon" />
        </button>
      )}
    </footer>
  )
}
