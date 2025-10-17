'use client'
import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MomentStore } from '@/src/zustand/post/Moment'
import MomentProgressBar from './MomentProgressBar'
import MomentActions from './MomentActions'

interface MobileMomentViewProps {
  onTouchStart?: (e: React.TouchEvent<HTMLDivElement>) => void
  onTouchEnd?: (e: React.TouchEvent<HTMLDivElement>) => void
}

const MobileMomentView: React.FC<MobileMomentViewProps> = ({
  onTouchStart,
  onTouchEnd,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)
  const {
    moments,
    activeMoment,
    isPlaying,
    activeMomentIndex,
    activeMomentMedia,
    activeMomentMediaIndex,
    openMomentModal,
    changeActiveMomentMedia,
  } = MomentStore()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isPlaying && started) {
      video.pause()
    } else {
      video.play()
    }
  }, [isPlaying])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.play()
    setStarted(true)
  }, [])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleTimeUpdate = () => {
    // const video = videoRef.current
    // if (!video) return
    // const current = (video.currentTime / video.duration) * 100
    // setProgress(current)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, currentTarget } = e
    const width = currentTarget.clientWidth
    const mediaLength = activeMoment.media.length
    const momentLength = moments.length

    if (clientX < width / 2) {
      if (activeMomentMediaIndex > 0) {
        changeActiveMomentMedia(activeMomentMediaIndex - 1, activeMomentIndex)
      } else if (activeMomentIndex > 0) {
        openMomentModal(activeMomentIndex - 1)
      }
    } else {
      if (activeMomentMediaIndex + 1 < mediaLength) {
        changeActiveMomentMedia(activeMomentMediaIndex + 1, activeMomentIndex)
      } else if (activeMomentIndex + 1 < momentLength) {
        openMomentModal(activeMomentIndex + 1)
      }
    }
  }

  return (
    <>
      <motion.div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={handleClick}
        className={`fixed left-0 top-0 inset-0 touch-none overflow-hidden w-full h-[100vh] z-40 transition-all duration-150`}
      >
        <MomentProgressBar />
        <div className="flex z-20 top-4 w-full right-0 px-3 items-center absolute">
          <div className="flex items-center text-white relative mb-2 gap-2 mr-auto">
            <img
              src={activeMoment.picture}
              alt={activeMoment.username}
              className="w-10 h-10 rounded-full object-cover border border-white"
            />
            <span className="font-semibold textShadow text-base">
              {activeMoment.displayName}
            </span>
          </div>
          <MomentActions />
        </div>

        <div
          className={`w-full h-full relative flex items-center justify-center`}
        >
          {activeMomentMedia.type.includes('image') ? (
            <img
              src={activeMomentMedia.src}
              alt={activeMomentMedia.content || ''}
              className={`bg-black w-full h-full object-contain transition-all duration-300`}
            />
          ) : activeMomentMedia.type.includes('video') ? (
            <video
              ref={videoRef}
              src={activeMomentMedia.src}
              poster={activeMomentMedia.preview}
              className={`w-full h-full object-contain bg-black transition-all duration-300`}
              autoPlay
              loop
              playsInline
              onTimeUpdate={handleTimeUpdate}
            />
          ) : (
            <div
              style={{
                backgroundColor: activeMomentMedia.backgroundColor,
              }}
              className="absolute w-full z-0 inset-0 h-full"
            />
          )}

          <div className="absolute overflow-auto px-2 left-0 z-10 top-0 flex h-full w-full justify-center items-center">
            <div
              className={`${
                activeMomentMedia.src ? 'textShadow' : ''
              } md:text-lg text-center text-white break-words`}
              dangerouslySetInnerHTML={{
                __html: activeMomentMedia.content,
              }}
            />
          </div>

          {activeMoment._id && (
            <div className="absolute top-0 pt-7 left-0 px-4 text-white w-full"></div>
          )}
        </div>
      </motion.div>
    </>
  )
}

export default MobileMomentView
