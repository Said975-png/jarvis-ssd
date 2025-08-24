'use client'

import { useEffect } from 'react'
import { X, ShoppingCart, Trash2 } from 'lucide-react'
import { useCart } from './CartContext'

export default function CartModal() {
  const {
    items,
    removeItem,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    setIsOrderFormOpen
  } = useCart()

  // Блокировка скролла когда корзина открыта
  useEffect(() => {
    if (isCartOpen) {
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
  }, [isCartOpen])

  if (!isCartOpen) return null

  const handleOrderClick = () => {
    if (items.length === 0) return
    setIsCartOpen(false)
    setIsOrderFormOpen(true)
  }

  return (
    <div className="cart-modal-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-modal-header">
          <div className="cart-modal-title-section">
            <ShoppingCart className="cart-modal-icon" />
            <h2 className="cart-modal-title">Корзина</h2>
            <span className="cart-items-count">({items.length})</span>
          </div>
          <button
            className="cart-modal-close"
            onClick={() => setIsCartOpen(false)}
            aria-label="Закрыть корзину"
          >
            <X className="close-icon" />
          </button>
        </div>

        <div className="cart-modal-content">
          {items.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart className="empty-cart-icon" />
              <h3 className="empty-cart-title">Корзина пуста</h3>
              <p className="empty-cart-text">
                Добавьте тарифы для создания вашего идеального сайта
              </p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <div className="cart-item-header">
                        <h3 className="cart-item-name">{item.name}</h3>
                        <p className="cart-item-subtitle">{item.subtitle}</p>
                      </div>
                      <div className="cart-item-price">
                        <span className="price-amount">{item.price}</span>
                        <span className="price-currency">{item.currency}</span>
                      </div>
                      <p className="cart-item-description">{item.description}</p>
                    </div>
                    
                    <button
                      className="cart-item-remove"
                      onClick={() => removeItem(item.id)}
                      aria-label="Удалить из корзины"
                    >
                      <Trash2 className="remove-icon" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="cart-actions">
                  <button
                    className="clear-cart-button"
                    onClick={clearCart}
                  >
                    Очистить корзину
                  </button>
                  <button
                    className="order-button"
                    onClick={handleOrderClick}
                  >
                    Оформить заказ
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
