'use client'

import { useState, useEffect } from 'react'
import { X, User, Phone, FileText, Link, CheckCircle } from 'lucide-react'
import { useCart } from './CartContext'
import { useOrders } from './OrdersContext'
import { useUser } from './UserContext'

export default function OrderForm() {
  const {
    items,
    isOrderFormOpen,
    setIsOrderFormOpen,
    clearCart
  } = useCart()

  const { createOrder } = useOrders()
  const { user, isAuthenticated } = useUser()

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    siteDescription: '',
    referenceLink: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Блокировка скролла когда форма заказа открыта
  useEffect(() => {
    if (isOrderFormOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
    }

    // Cleanup функция для восстановления скролла
    return () => {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
    }
  }, [isOrderFormOpen])

  if (!isOrderFormOpen) return null

  // Проверяем авторизацию пользователя
  if (!isAuthenticated || !user) {
    return (
      <div className="order-form-overlay" onClick={() => setIsOrderFormOpen(false)}>
        <div className="order-form-modal" onClick={(e) => e.stopPropagation()}>
          <div className="order-form-header">
            <h2 className="order-form-title">Необходима авторизация</h2>
            <button
              className="order-form-close"
              onClick={() => setIsOrderFormOpen(false)}
              aria-label="Закрыть форму"
            >
              <X className="close-icon" />
            </button>
          </div>
          <div className="order-form-content">
            <div className="auth-required">
              <User className="auth-icon-large" />
              <h3 className="auth-title">Войдите в систему</h3>
              <p className="auth-message">
                Для оформления заказа необходимо войти в систему или зарегистрироваться.
              </p>
              <button
                className="auth-action-button"
                onClick={() => setIsOrderFormOpen(false)}
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Имитация отправки заказа
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Создаем заказ в системе
      const orderData = {
        userId: user.id,
        userEmail: user.email,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          subtitle: item.subtitle,
          price: item.price,
          currency: item.currency
        })),
        customerInfo: {
          fullName: formData.fullName,
          phone: formData.phone,
          siteDescription: formData.siteDescription,
          referenceLink: formData.referenceLink
        },
        status: 'pending'
      }

      console.log('Создание заказа - данные пользователя:', user)
      console.log('Создание заказа - данные заказа:', orderData)

      const orderId = createOrder(orderData)

      console.log('Заказ создан успешно:', {
        orderId,
        orderData,
        timestamp: new Date().toISOString()
      })

      setIsSubmitting(false)
      setIsSuccess(true)

      // Очищаем корзину после успешной отправки
      setTimeout(() => {
        clearCart()
        setIsSuccess(false)
        setIsOrderFormOpen(false)
        setFormData({
          fullName: '',
          phone: '',
          siteDescription: '',
          referenceLink: ''
        })
      }, 3000)
    } catch (error) {
      console.error('Ошибка при создании заказа:', error)
      setIsSubmitting(false)
      alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.')
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOrderFormOpen(false)
      setIsSuccess(false)
    }
  }

  return (
    <div className="order-form-overlay" onClick={handleClose}>
      <div className="order-form-modal" onClick={(e) => e.stopPropagation()}>
        {isSuccess ? (
          <div className="order-success">
            <CheckCircle className="success-icon" />
            <h2 className="success-title">Заказ отправлен!</h2>
            <p className="success-message">
              Мы получили ваш заказ и свяжемся с вами в ближайшее время для обсуждения деталей проекта.
            </p>
            <div className="success-items">
              <h3 className="success-items-title">Выбранные тарифы:</h3>
              {items.map((item) => (
                <div key={item.id} className="success-item">
                  {item.name} - {item.price} {item.currency}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="order-form-header">
              <h2 className="order-form-title">Оформление заказа</h2>
              <button
                className="order-form-close"
                onClick={handleClose}
                aria-label="Закрыть форму"
                disabled={isSubmitting}
              >
                <X className="close-icon" />
              </button>
            </div>

            <div className="order-form-content">
              <div className="selected-items">
                <h3 className="selected-items-title">Выбранные тарифы:</h3>
                <div className="selected-items-list">
                  {items.map((item) => (
                    <div key={item.id} className="selected-item">
                      <span className="selected-item-name">{item.name}</span>
                      <span className="selected-item-price">{item.price} {item.currency}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form className="order-form" onSubmit={handleSubmit}>
                <div className="form-section">
                  <h4 className="form-section-title">Контактная информация</h4>
                  
                  <div className="form-group">
                    <label htmlFor="fullName" className="form-label">
                      <User className="label-icon" />
                      ФИО *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Введите ваше полное имя"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      <Phone className="label-icon" />
                      Номер телефона *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="+998 90 123 45 67"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4 className="form-section-title">Детали проекта</h4>
                  
                  <div className="form-group">
                    <label htmlFor="siteDescription" className="form-label">
                      <FileText className="label-icon" />
                      Описание сайта *
                    </label>
                    <textarea
                      id="siteDescription"
                      name="siteDescription"
                      value={formData.siteDescription}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder="Опишите, какой сайт вы хотите: назначение, основные функции, целевая аудитория..."
                      rows={4}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="referenceLink" className="form-label">
                      <Link className="label-icon" />
                      Ссылка на понравившийся сайт
                    </label>
                    <input
                      type="url"
                      id="referenceLink"
                      name="referenceLink"
                      value={formData.referenceLink}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="https://example.com (если есть сайт, который вам нравится)"
                      disabled={isSubmitting}
                    />
                    <p className="form-hint">
                      Если у вас есть сайт, дизайн которого вам нравится, укажите ссылку - это поможет нам лучше понять ваши предпочтения
                    </p>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="submit-spinner"></span>
                        Отправляем заказ...
                      </>
                    ) : (
                      'Отправить заказ'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
