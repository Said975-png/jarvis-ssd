'use client'

import { useState, useEffect } from 'react'
import { Lock, Package, Clock, CheckCircle, XCircle, Eye, User, Mail, Phone, FileText, Link as LinkIcon } from 'lucide-react'
import { useOrders, Order, OrderStatus } from '@/components/OrdersContext'

const ADMIN_PASSWORD = 'Laky06451'

export default function AdminPage() {
  const { getAllOrders, updateOrderStatus } = useOrders()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    // Проверяем аутентификацию из localStorage
    if (typeof window !== 'undefined') {
      const adminAuth = localStorage.getItem('admin_authenticated')
      if (adminAuth === 'true') {
        setIsAuthenticated(true)
      }
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      const allOrders = getAllOrders()
      console.log('Админ-панель: загружено заказов:', allOrders.length, allOrders)
      setOrders(allOrders)
    }
  }, [isAuthenticated, getAllOrders])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_authenticated', 'true')
      }
      setPassword('')
    } else {
      alert('Неверный пароль')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_authenticated')
    }
  }

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    console.log('handleStatusUpdate начат для заказа:', orderId, 'новый статус:', newStatus)
    updateOrderStatus(orderId, newStatus)
    const refreshedOrders = getAllOrders()
    console.log('handleStatusUpdate: обновленные заказы после updateOrderStatus:', refreshedOrders)
    setOrders(refreshedOrders)
    if (selectedOrder && selectedOrder.id === orderId) {
      const updatedOrder = refreshedOrders.find(order => order.id === orderId)
      if (updatedOrder) {
        setSelectedOrder(updatedOrder)
      }
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="status-icon" />
      case 'confirmed':
        return <CheckCircle className="status-icon" />
      case 'rejected':
        return <XCircle className="status-icon" />
    }
  }

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'Ожидает подтверждения'
      case 'confirmed':
        return 'Подтверждено'
      case 'rejected':
        return 'Отклонено'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <div className="login-header">
            <Lock className="login-icon" />
            <h1 className="login-title">Админ-панель</h1>
            <p className="login-subtitle">Введите пароль для доступа</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                className="login-input"
                required
              />
            </div>
            <button type="submit" className="login-button">
              Войти
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="header-content">
          <h1 className="admin-title">Админ-панель</h1>
          <div className="header-actions">
            <span className="orders-count">{orders.length} заказов</span>
            <button
              onClick={() => {
                console.log('=== ОТЛАДКА АДМИН-ПАНЕЛИ ===')
                console.log('localStorage jarvis_orders:', typeof window !== 'undefined' ? localStorage.getItem('jarvis_orders') : 'undefined')
                const allOrders = getAllOrders()
                console.log('getAllOrders() результат:', allOrders)
                setOrders(allOrders)
                console.log('Состояние orders после обновления:', orders)
                console.log('==========================')
              }}
              className="refresh-button"
            >
              Обновить
            </button>
            <button
              onClick={() => {
                // Создаем тестовый заказ
                const testOrder = {
                  userId: 'test_user_123',
                  userEmail: 'test@example.com',
                  items: [{
                    id: 'test_item',
                    name: 'Тестовый тариф',
                    subtitle: 'Для проверки',
                    price: '100',
                    currency: '$'
                  }],
                  customerInfo: {
                    fullName: 'Тестовый Пользователь',
                    phone: '+998901234567',
                    siteDescription: 'Тестовое описание сайта'
                  },
                  status: 'pending' as const
                }
                const orderId = updateOrderStatus ? (() => {
                  const id = `order_${Date.now()}_test`
                  const now = new Date().toISOString()
                  const newOrder = {
                    ...testOrder,
                    id,
                    createdAt: now,
                    updatedAt: now
                  }
                  setOrders(prev => [...prev, newOrder])
                  return id
                })() : 'test_order'
                console.log('Создан тестовый заказ:', orderId)
              }}
              className="test-button"
            >
              Тест
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('jarvis_orders')
                  setOrders([])
                  console.log('localStorage очищен')
                }
              }}
              className="clear-button"
            >
              Очистить
            </button>
            <button onClick={handleLogout} className="logout-button">
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="orders-section">
          <div className="section-header">
            <h2 className="section-title">Управление заказами</h2>
          </div>

          {orders.length === 0 ? (
            <div className="empty-orders">
              <Package className="empty-icon" />
              <p className="empty-text">Заказов пока нет</p>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div key={order.id} className="admin-order-card">
                  <div className="order-header">
                    <div className="order-id">#{order.id.split('_')[1]}</div>
                    <div className={`order-status status-${order.status}`}>
                      {getStatusIcon(order.status)}
                      <span>{getStatusText(order.status)}</span>
                    </div>
                  </div>

                  <div className="order-summary">
                    <div className="customer-info">
                      <p className="customer-name">{order.customerInfo.fullName}</p>
                      <p className="customer-email">{order.userEmail}</p>
                      <p className="customer-phone">{order.customerInfo.phone}</p>
                    </div>
                    
                    <div className="order-items-summary">
                      <p className="items-count">{order.items.length} тариф(ов)</p>
                      <p className="order-date">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="view-button"
                    >
                      <Eye className="button-icon" />
                      Подробнее
                    </button>
                    
                    {order.status === 'pending' && (
                      <div className="status-actions">
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                          className="confirm-button"
                        >
                          <CheckCircle className="button-icon" />
                          Подтвердить
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'rejected')}
                          className="reject-button"
                        >
                          <XCircle className="button-icon" />
                          Отклонить
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Заказ #{selectedOrder.id.split('_')[1]}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="order-details">
                <div className="detail-section">
                  <h4 className="detail-title">
                    <User className="detail-icon" />
                    Информация о клиенте
                  </h4>
                  <div className="detail-content">
                    <p><strong>Имя:</strong> {selectedOrder.customerInfo.fullName}</p>
                    <p><strong>Email:</strong> {selectedOrder.userEmail}</p>
                    <p><strong>Телефон:</strong> {selectedOrder.customerInfo.phone}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="detail-title">
                    <FileText className="detail-icon" />
                    Описание проекта
                  </h4>
                  <div className="detail-content">
                    <p>{selectedOrder.customerInfo.siteDescription}</p>
                    {selectedOrder.customerInfo.referenceLink && (
                      <p>
                        <strong>Ссылка-пример:</strong>{' '}
                        <a
                          href={selectedOrder.customerInfo.referenceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="reference-link"
                        >
                          {selectedOrder.customerInfo.referenceLink}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="detail-title">
                    <Package className="detail-icon" />
                    Выбранные тарифы
                  </h4>
                  <div className="detail-content">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="selected-tariff">
                        <div className="tariff-info">
                          <span className="tariff-name">{item.name}</span>
                          <span className="tariff-subtitle">{item.subtitle}</span>
                        </div>
                        <span className="tariff-price">{item.price} {item.currency}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h4 className="detail-title">Статус заказа</h4>
                  <div className="status-management">
                    <div className={`current-status status-${selectedOrder.status}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span>{getStatusText(selectedOrder.status)}</span>
                    </div>
                    
                    {selectedOrder.status === 'pending' && (
                      <div className="status-buttons">
                        <button
                          onClick={() => handleStatusUpdate(selectedOrder.id, 'confirmed')}
                          className="confirm-button"
                        >
                          <CheckCircle className="button-icon" />
                          Подтвердить заказ
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(selectedOrder.id, 'rejected')}
                          className="reject-button"
                        >
                          <XCircle className="button-icon" />
                          Отклонить заказ
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <div className="timestamps">
                    <p><strong>Создан:</strong> {new Date(selectedOrder.createdAt).toLocaleString('ru-RU')}</p>
                    <p><strong>Обновлен:</strong> {new Date(selectedOrder.updatedAt).toLocaleString('ru-RU')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
