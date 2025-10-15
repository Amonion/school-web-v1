'use client'
import Image from 'next/image'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { formatCount, formatRelativeDate } from '@/lib/helpers'
import { MessageStore } from '@/src/zustand/notification/Message'
import NewsStore from '@/src/zustand/news/News'
import { Eye, Heart, MessageCircle } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectFade, Autoplay } from 'swiper/modules'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import Link from 'next/link'

const HomeNews: React.FC = () => {
  const url = '/news/feed'
  const { getFeaturedNews, featuredNews } = NewsStore()
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const pathname = usePathname()

  useEffect(() => {
    if (featuredNews.length === 0 && user) {
      const params = `?country=${user.country}&state=${user.state}`
      getFeaturedNews(`${url}${params}`, setMessage)
    }
  }, [pathname])

  // if (featuredNews.length === 0) return null

  return (
    <div className="w-full overflow-hidden">
      {featuredNews.length > 0 && (
        <Swiper
          modules={[EffectFade, Autoplay]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
          }}
          speed={1500}
          className="relative h-64 sm:h-80"
        >
          {featuredNews.map((item, idx) => (
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute right-1 top-2 rounded-[25px] bg-black/50 text-white py-1 px-2 text-[12px] items-center flex">
                  {formatRelativeDate(String(item?.publishedAt))}
                </div>
                <div className="absolute bottom-0 p-2 sm:p-5 pr-7">
                  <Link
                    href={`/news/${item._id}`}
                    className="text-lg text-white sm:text-xl sm:font-semibold mb-1"
                  >
                    {item.title}
                  </Link>
                  <Link
                    href={`/news/${item._id}`}
                    className="text-gray-300 line-clamp-1 overflow-ellipsis leading-[25px]"
                    dangerouslySetInnerHTML={{
                      __html: item.subtitle,
                    }}
                  />
                </div>
                <div
                  className={`text-white absolute z-20 bottom-5 right-2 sm:right-4 flex flex-col items-center gap-4`}
                >
                  <span className="actionIndicator">
                    <Eye size={18} />
                    {item.views > 0 && (
                      <div className="">{formatCount(item.views)}</div>
                    )}
                  </span>
                  <span className="actionIndicator">
                    <Heart size={18} />
                    {item.views > 0 && (
                      <div className="shadow-sm">{formatCount(item.likes)}</div>
                    )}
                  </span>
                  <span className="actionIndicator">
                    <MessageCircle size={18} />
                    {item.views > 0 && (
                      <div className="">{formatCount(item.replies)}</div>
                    )}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  )
}

export default HomeNews
