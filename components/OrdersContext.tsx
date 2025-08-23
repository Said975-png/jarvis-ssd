'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type OrderStatus = 'pending' | 'confirmed' | 'rejected'

export interface OrderItem {
  id: string
  name: string
  subtitle: string
  price: string
  currency: string
}

export interface Order {
  id: string
  userId: string
  userEmail: string
  items: OrderItem[]
  customerInfo: {
    fullName: string
    phone: string
    siteDescription: string
    referenceLink?: string
  }
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

interface OrdersContextType {
  orders: Order[]
  getUserOrders: (userId: string) => Order[]
  getAllOrders: () => Order[]
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  getOrder: (orderId: string) => Order | undefined
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Загрузка заказов из localStorage при инициализации
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOrders = localStorage.getItem('jarvis_orders')
      console.log('Загрузка заказов из localStorage:', savedOrders)
      if (savedOrders) {
        try {
          const parsedOrders = JSON.parse(savedOrders)
          console.log('Заказы успешно загружены:', parsedOrders)
          setOrders(parsedOrders)
        } catch (error) {
          console.error('Error loading orders from localStorage:', error)
        }
      } else {
        console.log('Заказы в localStorage не найдены')
      }
      setIsInitialized(true)
    }
  }, [])

  // Сохранение заказов в localStorage при изменении (только после иници��лизации)
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      console.log('Сохранение заказов в localStorage:', orders)
      localStorage.setItem('jarvis_orders', JSON.stringify(orders))
    }
  }, [orders, isInitialized])

  const getUserOrders = (userId: string): Order[] => {
    return orders.filter(order => order.userId === userId)
  }

  const getAllOrders = (): Order[] => {
    console.log('getAllOrders() вызван, текущие заказы:', orders)
    return orders
  }

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    }

    console.log('OrdersContext: создание нового заказа:', newOrder)
    setOrders(prevOrders => {
      const updatedOrders = [...prevOrders, newOrder]
      console.log('OrdersContext: обновленный список заказов:', updatedOrders)
      // Принудительно сохраняем в localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('jarvis_orders', JSON.stringify(updatedOrders))
        console.log('OrdersContext: принудительное сохранение в localStorage')
      }
      return updatedOrders
    })
    return orderId
  }

  const updateOrderStatus = (orderId: string, status: OrderStatus): void => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      )
    )
  }

  const getOrder = (orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId)
  }

  return (
    <OrdersContext.Provider
      value={{
        orders,
        getUserOrders,
        getAllOrders,
        createOrder,
        updateOrderStatus,
        getOrder,
      }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider')
  }
  return context
}
