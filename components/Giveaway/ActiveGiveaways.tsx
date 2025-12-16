'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import WeekendStore, { Weekend } from '@/src/zustand/exam/Weekend'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { formatMoney } from '@/lib/helpers'

export default function ActiveGiveaways() {
  const { asideNav, toggleAsideVNav } = NavStore()
  const { giveaways } = WeekendStore()
  const [activeGiveaways, setActiveGiveaways] = useState<Weekend[]>([])

  useEffect(() => {
    const filt = giveaways.filter((item) => item.isMain)
    setActiveGiveaways(filt)
  }, [giveaways])

  return (
    <div
      onClick={toggleAsideVNav}
      className={` ${asideNav ? 'right-0' : 'right-[-100%]'} v_nav news`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        className="v_nav_card news"
      >
        <div
          className={`rounded-[20px] bg-[var(--primary)] mt-3 mb-3 h-[40px] w-full flex items-center px-3`}
        >
          <i className="bi bi-sliders cursor-pointer mr-3"></i>
          <input
            type="search"
            // onChange={(e) => setSearchedText(e.target.value)}
            className={`bg-transparent border-none outline-none flex-1`}
            placeholder={`Search giveaways...`}
          />
          <i className="bi bi-search common-icon cursor-pointer"></i>
        </div>
        <div className="t">
          <div className="text-lg mb-2">Active Giveaways</div>

          {activeGiveaways.map((item, index) => (
            <div key={index} className="mb-4 flex">
              <div className="w-[120px] h-[70px] overflow-hidden">
                {item.picture && (
                  <Image
                    src={String(item.picture)}
                    alt="Media"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-full h-full object-cover  overflow-clip"
                  />
                )}
              </div>
              <Link
                href={`/news/${item._id}`}
                className="flex-1 flex flex-col pl-2"
              >
                <div className="line-clamp-2 text-sm overflow-ellipsis ">
                  {item.question}
                </div>
                <div className="text-[12px] ml-auto mt-auto text-[var(--text-secondary)]">
                  ₦{formatMoney(item.price)}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
