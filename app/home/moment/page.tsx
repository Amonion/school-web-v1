'use client'
import React, { useEffect, useRef, useState } from 'react'
import {
  MomentEmpty,
  MomentMediaEmpty,
  MomentStore,
} from '@/src/zustand/post/Moment'

const Moment = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)
  const {
    activeMomentIndex,
    moments,
    isPlaying,
    activeMoment,
    activeMomentMedia,
    openMomentModal,
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

  const navigate = (direction: string) => {
    if (direction === 'next' && activeMomentIndex + 1 < moments.length) {
      openMomentModal(activeMomentIndex + 1)
    } else if (direction === 'prev' && activeMomentIndex > 0) {
      openMomentModal(activeMomentIndex - 1)
    }
  }

  const onClose = () => {
    MomentStore.setState({
      activeMoment: MomentEmpty,
      activeMomentMedia: MomentMediaEmpty,
      activeMomentIndex: 0,
      activeMomentMediaIndex: 0,
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] w-full border border-[var(--border)] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* <MomentProgressBar /> */}
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
          {/* <MomentActions /> */}
        </div>

        {activeMomentMedia.type.includes('image') ? (
          <img
            src={activeMomentMedia.src}
            alt={activeMomentMedia.content}
            className="w-full max-h-full object-contain"
          />
        ) : activeMomentMedia.type.includes('video') ? (
          <video
            src={activeMomentMedia.src}
            poster={activeMomentMedia.preview}
            className="w-full max-h-[90vh] object-contain"
            autoPlay
            loop
            controls
          />
        ) : (
          <div
            style={{
              backgroundColor: activeMomentMedia.backgroundColor,
            }}
            className="relative w-full z-0 inset-0 h-[90vh]"
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

        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate('prev')
          }}
          className="absolute z-20 left-4 top-[30%] w-12 h-12 flex justify-center items-center text-white text-4xl bg-black/40 hover:bg-black/60 rounded-full p-2 transition"
        >
          &#10094;
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate('next')
          }}
          className="absolute z-20 right-4 top-[30%] w-12 h-12 flex justify-center items-center text-white text-4xl bg-black/40 hover:bg-black/60 rounded-full p-2 transition"
        >
          &#10095;
        </button>
      </div>
    </div>
  )
}

export default Moment
