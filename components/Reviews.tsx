'use client'

import { useEffect, useRef } from 'react'
import { Star } from 'lucide-react'

const reviews = [
  {
    id: 1,
    rating: 5,
    text: "Я не разбираюсь в сайтах, но в Jarvis всё объяснили простыми словами. Сделал магазин, подключил оплату, и теперь я продаю в 3 странах. Рекомендую!",
    author: "Умид А.",
    location: "Ташкент, Freelance"
  },
  {
    id: 2,
    rating: 5,
    text: "Создала сайт с Jarvis Intercoma для своего магазина одежды. Работать ста��о легче: бот помогает клиентам выбирать стиль, отвечает на вопросы, а я только получаю заказы. Очень довольна!",
    author: "Алимова М.",
    location: "Чебоксары, Freelance"
  },
  {
    id: 3,
    rating: 5,
    text: "Сделала сайт для своего бутика с Jarvis. Удобно и быстро, клиенты довольны. Бот помогает им найти нужные товары, даже ночью.",
    author: "Романова И.",
    location: "Уфа, Freelance"
  },
  {
    id: 4,
    rating: 5,
    text: "Создала интернет-магазин с помощью Jarvis. Весь процесс автоматизирован, а бот отвечает на вопросы клиентов в любое время дня и ночи.",
    author: "Алексеева Л.",
    location: "Казань, Freelance"
  },
  {
    id: 5,
    rating: 5,
    text: "Решил попробовать Jarvis для создания сайта магазина бытовой техники. Результат впечатлил: бот быстро и точно помогает клиентам выбрать товар.",
    author: "��арипов М.",
    location: "Бухара, Freelance"
  },
  {
    id: 6,
    rating: 5,
    text: "Мой магазин ювелирных изделий стал более удобным благодаря Jarvis. Бот помогает клиентам выбрать подходящие украшения и отвечает на все вопросы.",
    author: "Васильева О.",
    location: "Набережные Челны, Freelance"
  },
  {
    id: 7,
    rating: 5,
    text: "Создала сайт для своего магазина с Jarvis. Клиенты часто обращаются за помощью, и бот всегда подскажет им нужную информацию.",
    author: "Захарова Т.",
    location: "Самара, Freelance"
  },
  {
    id: 8,
    rating: 5,
    text: "Сайт для онлайн-магазина с Jarvis стал отличным решением. Бот быстро помогает покупателям, что существенно увеличило количество заказов.",
    author: "Розенбаум В.",
    location: "Санкт-Петербург, Freelance"
  },
  {
    id: 9,
    rating: 5,
    text: "С Jarvis сайт для моего магаз��на одежды стал суперудобным. Бот помогает клиентам найти нужный товар и оформить заказ без проблем.",
    author: "Петрова М.",
    location: "Нижний Новгород, Freelance"
  },
  {
    id: 10,
    rating: 5,
    text: "Заказал сайт от Jarvis Intercoma онлайн-магазин с ИИ Джарвисом, и не пожалел! Всё сделали быстро, магазин сразу начал приносить заказы. Особенно понравилось, что бот отвечает клиентам мгновенно, даже ночью.",
    author: "Карим",
    location: "Ташкент, Freelance"
  },
  {
    id: 11,
    rating: 5,
    text: "Мне сделали сайт с Jarvis Intercoma под мою студию украшений. Красиво, удобно, и всё автоматизировано. Теперь я занимаюсь только заказами, а не сижу целый день в переписках с клиентами.",
    author: "Мадина Р.",
    location: "Ташкент, Freelance"
  },
  {
    id: 12,
    rating: 5,
    text: "Создала магазин косметики с Jarvis. Бот идеально консультирует клиентов по уходу за кожей, подбирает продукты по типу кожи. Продажи выросли в 4 раза!",
    author: "Елена К.",
    location: "Москва, Freelance"
  }
]

export default function Reviews() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    const scrollSpeed = 0.5

    const animate = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += scrollSpeed
        
        // Когда доходим до конца, возвращаемся в начало для бесконечной прокрутки
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0
        }
      }
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    // Останавливаем анимацию при наведении
    const handleMouseEnter = () => cancelAnimationFrame(animationId)
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate)
    }

    scrollContainer.addEventListener('mouseenter', handleMouseEnter)
    scrollContainer.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      cancelAnimationFrame(animationId)
      scrollContainer?.removeEventListener('mouseenter', handleMouseEnter)
      scrollContainer?.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // Дублируем отзывы для бесконечной прокрутки
  const duplicatedReviews = [...reviews, ...reviews]

  return (
    <section className="reviews-section">
      <div className="reviews-container">
        <div className="reviews-header">
          <h2 className="reviews-title">Наши отзывы</h2>
          <p className="reviews-subtitle">
            Истории успеха наших клиентов со всего мира
          </p>
        </div>
        
        <div 
          ref={scrollRef}
          className="reviews-scroll-container"
        >
          <div className="reviews-track">
            {duplicatedReviews.map((review, index) => (
              <div key={`${review.id}-${index}`} className="review-card">
                <div className="review-stars">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="review-star" />
                  ))}
                </div>
                <p className="review-text">"{review.text}"</p>
                <div className="review-author">
                  <div className="review-author-name">{review.author}</div>
                  <div className="review-author-location">{review.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
