'use client'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Moment, MomentStore, saveMomentsToDB } from '@/src/zustand/post/Moment'

interface EachMomentProps {
  moment: Moment
  idx: number
  openMomentModal: (idx: number) => void
}

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

const EachMoment: React.FC<EachMomentProps> = ({
  moment,
  idx,
  openMomentModal,
}) => {
  const [validMedia, setValidMedia] = useState(moment.media)
  const prevMediaRef = useRef(moment.media)
  const { updateMoment } = MomentStore()
  const filterExpiredMedia = () => {
    const now = Date.now()

    return moment.media.filter((media) => {
      const createdAt = new Date(media.createdAt).getTime()
      return now - createdAt < TWENTY_FOUR_HOURS
    })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const filtered = filterExpiredMedia()
      if (filtered.length !== prevMediaRef.current.length) {
        prevMediaRef.current = filtered
        setValidMedia(filtered)
        updateMoment(`/posts/moments/${moment._id}`, { media: filtered })
        MomentStore.setState((prev) => {
          const mts = prev.moments.map((item) => {
            if (item._id === moment._id) {
              const updatedMoment = { ...moment, media: filtered }
              return updatedMoment
            } else {
              return item
            }
          })
          saveMomentsToDB(mts)
          return { moments: mts }
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [moment])

  if (validMedia.length === 0) return null

  const firstMedia = validMedia[0]

  return (
    <div onClick={() => openMomentModal(idx)} className="story">
      {firstMedia.type.includes('image') ? (
        <Image
          src={firstMedia.src}
          alt={moment.username}
          fill
          className="object-cover w-full h-full"
        />
      ) : firstMedia.type.includes('video') ? (
        <Image
          src={firstMedia.preview}
          alt={moment.username}
          fill
          className="object-cover w-full h-full"
        />
      ) : (
        <div
          style={{
            backgroundColor: firstMedia.backgroundColor,
          }}
          className="w-full h-full relative px-1 text-center rounded-[5px] overflow-hidden flex justify-center items-center"
        >
          <div className="text-white line-clamp-3 text-[12px] leading-[20px]">
            {firstMedia.content}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-3 left-1 flex items-center gap-1">
        <div
          className={`w-7 h-7 relative rounded-full overflow-hidden border ${
            firstMedia.isViewed ? 'border-[var(--custom)]' : 'border-white/30'
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
  )
}

export default EachMoment
