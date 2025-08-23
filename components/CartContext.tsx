'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  subtitle: string
  price: string
  currency: string
  description: string
  features: string[]
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
  getTotalItems: () => number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  isOrderFormOpen: boolean
  setIsOrderFormOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)

  // Отладка инициализации корзины
  React.useEffect(() => {
    console.log('CartProvider инициализирован')
  }, [])

  const addItem = (item: CartItem) => {
    setItems(prevItems => {
      // Проверяем, есть ли товар уже в корзине
      const existingItem = prevItems.find(existingItem => existingItem.id === item.id)
      if (existingItem) {
        // Если товар уже есть, не добавляем дубликат
        return prevItems
      }
      // Добавляем новый товар
      return [...prevItems, item]
    })
  }

  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId))
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalItems = () => {
    return items.length
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        getTotalItems,
        isCartOpen,
        setIsCartOpen,
        isOrderFormOpen,
        setIsOrderFormOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
