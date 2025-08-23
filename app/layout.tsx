import type { Metadata } from 'next'
import { UserProvider } from '@/components/UserContext'
import { OrdersProvider } from '@/components/OrdersContext'
import { CartProvider } from '@/components/CartContext'

export const metadata: Metadata = {
  title: 'JARVIS - AI-Powered E-commerce Solutions',
  description: 'We create intelligent websites with AI assistants for online stores. Boost sales with automated support, personalized recommendations, and smart interactions.',
  keywords: 'AI, e-commerce, online store, artificial intelligence, web development, JARVIS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <OrdersProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </OrdersProvider>
        </UserProvider>
      </body>
    </html>
  )
}
