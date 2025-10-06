import React from 'react'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import Image from 'next/image'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface AdMedia {
  source: string
  url: string
}

interface PaymentCarouselProps {
  items: AdMedia[]
}

const PaymentCarousel: React.FC<PaymentCarouselProps> = ({ items }) => {
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
          <Link
            href={item.url}
            className="w-full relative overflow-hidden rounded-[10px] mb-3 aspect-[16/9] flex justify-center bg-[var(--secondary)] "
          >
            <Image
              src={item.source}
              alt={`Ad Media`}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default PaymentCarousel
