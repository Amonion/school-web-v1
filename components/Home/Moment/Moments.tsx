'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { MomentEmpty, MomentStore } from '@/src/zustand/post/Moment'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import MobileMomentView from './MobileMomentViewer'
import CommentStore from '@/src/zustand/post/Comment'
import DesktopMomentViewer from './DesktopMomentViewer'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import EachMoment from './EachMoment'

export default function Moments() {
  const { moments, activeMomentIndex, activeMoment, openMomentModal } =
    MomentStore()
  const { isMobile } = CommentStore()
  const { user } = AuthStore()
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)
  const pathname = usePathname()

  useEffect(() => {
    MomentStore.setState({ activeMoment: MomentEmpty })
  }, [pathname])

  useEffect(() => {
    MomentStore.setState((prev) => {
      const index = prev.moments.findIndex(
        (item) => item.username === user?.username
      )
      return { userHasMoment: index >= 0 }
    })
  }, [moments])

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.targetTouches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndY.current = e.changedTouches[0].clientY
    const swipeDistance = touchStartY.current - touchEndY.current

    if (swipeDistance > 50 && activeMomentIndex + 1 < moments.length) {
      openMomentModal(activeMomentIndex + 1)
    } else if (swipeDistance < -50 && activeMomentIndex > 0) {
      openMomentModal(activeMomentIndex - 1)
    }
  }

  return (
    <>
      <div className="text-base text-[var(--text-secondary)] mt-4 px-2 sm:px-0">
        Beautiful Moments
      </div>

      <div className="w-full overflow-x-auto py-2 mb-2">
        <div className="flex gap-2 sm:gap-3 px-2 md:px-0">
          <Link
            href={`/home/moment/create-moment`}
            className="story bg-[var(--primary)] relative flex flex-col justify-between p-1 cursor-pointer"
          >
            <div className="absolute z-0 w-full h-2/3 top-0 left-0">
              {user && (
                <Image
                  src={
                    user.picture ? String(user?.picture) : '/images/avatar.jpg'
                  }
                  alt={user?.username}
                  fill
                  className="object-cover"
                />
              )}
              <div className="w-10 z-10 absolute left-[50%] -bottom-5 translate-x-[-50%] h-10 border-[var(--border)] rounded-full bg-[var(--secondary)] flex items-center justify-center text-[var(--custom)] border">
                <Plus size={20} />
              </div>
            </div>

            <span className="text-[12px] mt-auto">Share moments</span>
          </Link>

          {moments.map((moment, idx) => (
            <EachMoment
              key={idx}
              moment={moment}
              idx={idx}
              openMomentModal={openMomentModal}
            />
          ))}
        </div>
      </div>

      {activeMoment._id && isMobile && (
        <MobileMomentView
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
        />
      )}

      {activeMoment._id && !isMobile && <DesktopMomentViewer />}
    </>
  )
}
