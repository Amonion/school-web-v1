import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import Image from 'next/image'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface AdMedia {
  source: string
  type: string
}

interface AdCarouselProps {
  items: AdMedia[]
}

const AdCarousel: React.FC<AdCarouselProps> = ({ items }) => {
  return (
    <Swiper
      className="overflow-hidden aspect-[16/9] rounded-[10px] w-full"
      modules={[Pagination, Navigation, Autoplay]}
      slidesPerView={1}
      pagination={{ clickable: true }}
      loop={items.length > 1}
      speed={1500}
      autoplay={{
        delay: 5000, // 3 seconds
        disableOnInteraction: false,
      }}
    >
      {items.map((item, index) => (
        <SwiperSlide key={index}>
          <div className="w-full relative overflow-hidden rounded-[10px] mb-3 aspect-[16/9] flex justify-center bg-[var(--secondary)] ">
            {item.type.includes('image') ? (
              <Image
                src={item.source}
                alt={`Ad Media`}
                fill
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <video
                src={item.source}
                autoPlay
                muted
                loop
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover bg-[var(--secondary)]"
              />
            )}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default AdCarousel
