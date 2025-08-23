'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
}

interface UserContextType {
  user: User | null
  login: (userData: Omit<User, 'id'>) => void
  logout: () => void
  isAuthenticated: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Загрузка пользователя из localStorage при инициализации
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('jarvis_user')
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (error) {
          console.error('Error loading user from localStorage:', error)
        }
      }
    }
  }, [])

  // Сохранение пользователя в localStorage при изменении
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('jarvis_user', JSON.stringify(user))
      } else {
        localStorage.removeItem('jarvis_user')
      }
    }
  }, [user])

  const login = (userData: Omit<User, 'id'>) => {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newUser: User = {
      id: userId,
      ...userData
    }
    setUser(newUser)
  }

  const logout = () => {
    setUser(null)
  }

  const isAuthenticated = user !== null

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
