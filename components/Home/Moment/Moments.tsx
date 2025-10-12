'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { MomentStore } from '@/src/zustand/post/Moment'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'

export default function Moments() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const [itemIdx, setItemIdx] = useState(0)
  const { moments, setShowMoment, getMoments } = MomentStore()
  const { setMessage } = MessageStore()
  const { user } = AuthStore()

  useEffect(() => {
    if (user) {
      getMoments(
        `/posts/moments/?myId=${
          user._id
        }&page_size=20&page=${1}&ordering=-createdAt`,
        setMessage
      )
    }
  }, [])

  const openStory = (idx: number) => {
    setOpenIdx(idx)
    setItemIdx(0)
    document.body.style.overflow = 'hidden'
  }

  const closeViewer = () => {
    setOpenIdx(null)
    setItemIdx(0)
    document.body.style.overflow = ''
  }

  const nextItem = useCallback(() => {
    if (openIdx === null) return
    const story = moments[openIdx]
    if (itemIdx < story.media.length - 1) {
      setItemIdx((i) => i + 1)
    } else if (openIdx < moments.length - 1) {
      setOpenIdx((i) => (i as number) + 1)
      setItemIdx(0)
    } else {
      closeViewer()
    }
  }, [openIdx, itemIdx])

  const prevItem = useCallback(() => {
    if (openIdx === null) return
    if (itemIdx > 0) {
      setItemIdx((i) => i - 1)
    } else if (openIdx > 0) {
      const prev = moments[openIdx - 1]
      setOpenIdx(openIdx - 1)
      setItemIdx(prev.media.length - 1)
    }
  }, [openIdx, itemIdx])

  const StoryViewer = () => {
    if (openIdx === null) return null
    const story = moments[openIdx]
    const item = story.media[itemIdx]

    return (
      <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center">
        <button
          onClick={closeViewer}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/40 text-white"
        >
          <X />
        </button>

        <button
          onClick={prevItem}
          className="absolute left-4 p-2 bg-black/30 text-white rounded-full hidden sm:flex"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={nextItem}
          className="absolute right-4 p-2 bg-black/30 text-white rounded-full hidden sm:flex"
        >
          <ChevronRight />
        </button>

        <div className="max-w-[900px] w-full max-h-[90vh] relative">
          {item.type === 'image' ? (
            <div className="relative w-full h-[70vh] bg-black">
              <Image
                src={item.src}
                alt={story.displayName ?? story.username}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <video
              src={item.src}
              poster={item.preview}
              autoPlay
              muted
              playsInline
              className="w-full h-[70vh] object-contain bg-black"
              onEnded={() => nextItem()}
            />
          )}
          <div className="absolute bottom-4 left-4 flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/60">
              {story.picture ? (
                <Image
                  src={story.picture}
                  alt={story.username}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-600" />
              )}
            </div>
            <div>
              <div className="font-semibold">
                {story.displayName ?? story.username}
              </div>
              <div className="text-xs text-white/70">Posted a story</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="text-base text-[var(--text-secondary)] mt-4 px-2 sm:px-0">
        Beautiful Moments
      </div>

      <div className="w-full overflow-x-auto py-2 mb-2">
        <div className="flex gap-3 px-2 md:px-0">
          <div
            onClick={() => setShowMoment(true)}
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
          </div>

          {moments.map((moment, idx) => (
            <div
              key={moment._id}
              onClick={() => openStory(idx)}
              className="story"
            >
              {moment.media && moment.media[0].preview ? (
                <Image
                  src={moment?.media[0].preview}
                  alt={moment?.username}
                  fill
                  className="object-cover"
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
                    <div className="text-white line-clamp-3 overflow-ellipsis relative my-auto text-[12px] leading-[20px] z-10">
                      {moment.media[0].content}
                    </div>
                  </div>
                )
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-3 left-1 flex items-center gap-1">
                <div
                  className={`w-7 h-7 relative rounded-full overflow-hidden border-1 ${
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

      {openIdx !== null && <StoryViewer />}
    </>
  )
}
