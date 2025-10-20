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

export default function Moments() {
  const {
    moments,
    activeMomentIndex,
    activeMoment,
    openMomentModal,
    userHasMoment,
  } = MomentStore()
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
          {!userHasMoment && (
            <Link
              href={`/home/moment/create-moment`}
              className="story bg-[var(--primary)] relative flex flex-col justify-between p-1 cursor-pointer"
            >
              <div className="absolute z-0 w-full h-2/3 top-0 left-0">
                {user && (
                  <Image
                    src={String(user?.picture)}
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
          )}

          {moments.map((moment, idx) => (
            <div
              key={moment._id}
              onClick={() => openMomentModal(idx)}
              className="story"
            >
              {moment.media.length > 0 && moment.media[0].preview ? (
                <Image
                  src={moment?.media[0].preview}
                  alt={moment?.username}
                  fill
                  className="object-cover w-full h-full"
                />
              ) : (
                moment.media && (
                  <div
                    style={{
                      backgroundColor: moment.media[0].backgroundColor,

                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                    }}
                    className={`w-full h-full relative px-1 text-center rounded-[5px] overflow-hidden flex justify-center items-center`}
                  >
                    <div
                      className={`text-white line-clamp-3 overflow-ellipsis relative my-auto text-[12px] leading-[20px] z-10`}
                    >
                      {moment.media[0].content}
                    </div>
                  </div>
                )
              )}
              <div className="absolute top-3 left-1 flex items-center gap-1">
                <div
                  className={`w-7 h-7 min-w-7 relative rounded-full overflow-hidden border-1 ${
                    moment.media && moment.media[0].isViewed
                      ? 'border-[var(--custom)]'
                      : 'border-white/30'
                  }`}
                >
                  <Image
                    src={moment.picture}
                    alt={moment.username}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-white text-sm line-clamp-1 max-w-[6rem]">
                  {moment.displayName ?? moment.username}
                </div>
              </div>
            </div>
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
