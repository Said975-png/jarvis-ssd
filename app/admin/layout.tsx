import { UserProvider } from '@/components/UserContext'
import { OrdersProvider } from '@/components/OrdersContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      <OrdersProvider>
        {children}
      </OrdersProvider>
    </UserProvider>
  )
}
