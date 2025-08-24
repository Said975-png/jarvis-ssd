import Hero from '@/components/Hero'
import Advantages from '@/components/Advantages'
import Pricing from '@/components/Pricing'
import AIConsultant from '@/components/AIConsultant'
import Reviews from '@/components/Reviews'
import JarvisChat from '@/components/JarvisChat'
import Footer from '@/components/Footer'
import CartModal from '@/components/CartModal'
import OrderForm from '@/components/OrderForm'
import './globals.css'

export default function Home() {
  return (
    <>
      <main className="min-h-screen">
        <Hero />
        <Advantages />
        <Pricing />
        <AIConsultant />
        <Reviews />
      </main>
      <Footer />
      <JarvisChat />
      <CartModal />
      <OrderForm />
    </>
  )
}
