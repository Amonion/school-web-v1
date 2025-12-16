'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import WeekendStore, { Weekend } from '@/src/zustand/exam/Weekend'
import { CountdownCellExam } from '../CountDownCell'
import { formatMoney, getRemainingTime } from '@/lib/helpers'

export default function FeaturedGiveaways() {
  const { giveaways } = WeekendStore()
  const [featuredGiveaways, setFeaturedGiveaways] = useState<Weekend[]>([])

  useEffect(() => {
    const filt = giveaways.filter((item) => item.isFeatured)
    setFeaturedGiveaways(filt)
  }, [giveaways])

  return (
    <>
      <div className="text-lg mt-4 px-2 sm:px-0">Featured Giveaways</div>

      <div className="w-full overflow-x-auto py-2 mb-4">
        <div className="flex gap-2 px-2 md:px-0">
          {featuredGiveaways.map((item, idx) => (
            <div key={idx} className="w-[250px] flex-shrink-0">
              <div className="w-full h-[200px] mb-2 relative">
                <Image
                  src={String(item.picture)}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {item.startAt && (
                  <div className="absolute right-1 top-2 rounded-[25px] bg-black/50 text-white text-[12px] items-center flex">
                    <CountdownCellExam
                      startingTime={getRemainingTime(item.startAt)}
                    />
                  </div>
                )}
                <div className="absolute flex flex-col items-start bottom-0 p-1">
                  <Link
                    href={`/news/${item._id}`}
                    className="text-white sm:font-semibold mb-1 leading-5"
                  >
                    {item.title}
                  </Link>
                  {item.price && (
                    <div className=" text-white py-1">
                      ₦{formatMoney(item.price)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
