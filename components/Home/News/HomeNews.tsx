'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { formatCount, formatRelativeDate } from '@/lib/helpers'
import { MessageStore } from '@/src/zustand/notification/Message'
import NewsStore from '@/src/zustand/news/News'
import { Eye, Heart, MessageCircle } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectFade, Navigation, Autoplay } from 'swiper/modules'

const HomeNews: React.FC = () => {
  const url = '/news'
  const { getItems, results } = NewsStore()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const pathname = usePathname()

  useEffect(() => {
    const params = `?page_size=${page_size}&page=1&ordering=${sort}`
    getItems(`${url}${params}`, setMessage)
  }, [pathname])

  const displayResults = results.slice(0, 5)
  if (displayResults.length === 0) return null

  return (
    <div className="w-full overflow-hidden shadow-xl">
      <Swiper
        modules={[EffectFade, Navigation, Autoplay]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        speed={1500}
        navigation={true}
        className="relative h-64 sm:h-80"
      >
        {displayResults.map((item, idx) => (
          <SwiperSlide key={idx}>
            <div className="relative w-full h-full">
              {item.picture && (
                <Image
                  src={String(item.picture)}
                  alt={item.title}
                  fill
                  className="object-cover brightness-75"
                  priority={idx === 0}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute right-1 top-1 rounded-[25px] bg-black/50 text-white py-1 px-2 text-[12px] items-center flex">
                {formatRelativeDate(String(item?.publishedAt))}
              </div>
              <div className="absolute bottom-0 p-5">
                <h2 className="text-lg sm:text-xl font-semibold mb-1">
                  {item.title}
                </h2>
                <p
                  className="text-sm text-gray-200 line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html: item.content,
                  }}
                />
              </div>
              <div
                className={` absolute z-20 bottom-5 right-4 flex flex-col items-center gap-4`}
              >
                <button className="actionIndicator">
                  <Eye size={18} />
                  <div className="">{formatCount(14500)}</div>
                </button>
                <button className="actionIndicator">
                  <Heart size={18} />
                  <div className="shadow-sm">{formatCount(14500)}</div>
                </button>
                <button className="actionIndicator">
                  <MessageCircle size={18} />
                  <div className="">{formatCount(14500)}</div>
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default HomeNews
