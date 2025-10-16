'use client'
import React, { useEffect, useRef, useState } from 'react'
import CommentStore from '@/src/zustand/post/Comment'
import { Media } from '@/src/zustand/post/UserPost'
import { Post } from '@/src/zustand/post/Post'
import { motion } from 'framer-motion'
import MediaReactions from '../Media/MediaReactions'
import FullMediaCommentSection from './FullMediaComment'

interface MobileMediaViewProps {
  media: Media
  postForm: Post
  onClose: () => void
  onTouchStart?: (e: React.TouchEvent<HTMLDivElement>) => void
  onTouchEnd?: (e: React.TouchEvent<HTMLDivElement>) => void
}

const MobileMediaView: React.FC<MobileMediaViewProps> = ({
  media,
  postForm,
  onClose,
  onTouchStart,
  onTouchEnd,
}) => {
  const {
    setShowActions,
    setProgress,
    showGlassComments,
    mediaHeight,
    isPlaying,
    mainPost,
    showActions,
  } = CommentStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowActions(false)
    }, 10000)
    setShowActions(true)
    return () => clearTimeout(timer)
  }, [mainPost])

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
    const video = videoRef.current
    if (!video) return
    const current = (video.currentTime / video.duration) * 100
    setProgress(current)
  }

  return (
    <>
      <div className="flex z-40 bg-black fixed left-0 top-0 w-full h-[100vh]">
        <motion.div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={() => setShowActions(!showActions)}
          className={`w-full ${
            showGlassComments ? 'py-3' : ''
          } relative top-0 left-0 transition-all duration-150`}
          style={{ height: mediaHeight }}
        >
          <button
            onClick={onClose}
            className="z-10 top-4 right-4 absolute actionIconWrapper"
          >
            ✕
          </button>

          <div
            className={`w-full h-full relative flex items-center justify-center`}
          >
            {media.type.includes('image') ? (
              <img
                src={media.src}
                alt={media.content || ''}
                className={` w-full h-full object-contain transition-all duration-300`}
              />
            ) : media.type.includes('video') ? (
              <video
                ref={videoRef}
                src={media.src}
                poster={media.preview}
                className={`w-full h-full object-contain bg-black transition-all duration-300`}
                autoPlay
                loop
                playsInline
                onTimeUpdate={handleTimeUpdate}
              />
            ) : (
              <div
                style={{
                  backgroundColor: media.backgroundColor,
                }}
                className="absolute w-full flex justify-center items-center text-center z-0 inset-0 h-full"
              >
                <div
                  className="z-10 relative text-white"
                  dangerouslySetInnerHTML={{
                    __html: postForm.content,
                  }}
                />
              </div>
            )}

            {postForm._id && !showGlassComments && (
              <div className="absolute bottom-0 pb-14 left-0 px-4 text-white w-full">
                <div className="flex items-center relative mb-2 gap-2 z-10">
                  <img
                    src={postForm.picture}
                    alt={postForm.username}
                    className="w-10 h-10 rounded-full object-cover border border-white"
                  />
                  <span className="font-semibold text-base">
                    {postForm.username}
                  </span>
                </div>
                {!media.backgroundColor && (
                  <div
                    className="text-sm z-10 relative text-gray-200 line-clamp-2 break-words"
                    dangerouslySetInnerHTML={{
                      __html: postForm.content,
                    }}
                  />
                )}
                <div className="absolute w-full z-0 inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
            )}

            {!showGlassComments && <MediaReactions media={media} />}
          </div>
        </motion.div>
      </div>
      <FullMediaCommentSection />
    </>
  )
}

export default MobileMediaView
