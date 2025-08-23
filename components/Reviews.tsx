'use client'

import { useEffect, useRef, useState } from 'react'
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
    text: "Создала сайт с Jarvis Intercoma для своего магазина одежды. Работать стало легче: бот помогает клиентам выбирать стиль, отвечает на вопросы, а я только пол��чаю заказы. Очень довольна!",
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
    text: "Создала интернет-магазин с помощью Jarvis. Весь проц��сс автоматизирован, а бот отвечает на вопросы клиентов в любое время дня и ночи.",
    author: "Алексеева Л.",
    location: "Казань, Freelance"
  },
  {
    id: 5,
    rating: 5,
    text: "Решил попробовать Jarvis для создания сайта магазина бытовой техники. Результат впечатлил: бот быстро и точно помогает клиентам выбрать товар.",
    author: "Шарипов М.",
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
    author: "Зах��рова Т.",
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
    text: "С Jarvis сайт для моего магазина одежды стал суперудобным. Бот помогает клиентам найти нужный товар и офор��ить заказ без проблем.",
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
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    const scrollSpeed = 0.8

    const animate = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += scrollSpeed

        // Проверяем достигли ли половины контента (начало второго набора)
        const halfWidth = scrollContainer.scrollWidth / 2
        if (scrollContainer.scrollLeft >= halfWidth) {
          scrollContainer.scrollLeft = 0
        }
      }
      animationId = requestAnimationFrame(animate)
    }

    // Запускаем анимацию с задержкой для загрузки DOM
    const timer = setTimeout(() => {
      animationId = requestAnimationFrame(animate)
    }, 1000)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(animationId)
    }
  }, [isMounted])

  // Дублируем отзывы для бесконечной прокрутки
  const duplicatedReviews = [...reviews, ...reviews]

  return (
    <section className="reviews-section">
      <div className="reviews-bg">
        <div className="reviews-grid-overlay" />
      </div>
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
