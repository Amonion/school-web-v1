'use client'
import React, { useEffect, useRef, useState } from 'react'
import MediaCommentSection from '../Comment/FullMediaComment'
import CommentStore from '@/src/zustand/post/Comment'
import MediaReactions from './MediaReactions'
import { Media } from '@/src/zustand/post/UserPost'
import { Post } from '@/src/zustand/post/Post'

interface MobileMediaViewerProps {
  media: Media
  postForm: Post
  onClose: () => void
  onTouchStart?: (e: React.TouchEvent<HTMLDivElement>) => void
  onTouchEnd?: (e: React.TouchEvent<HTMLDivElement>) => void
}

const MobileMediaViewer: React.FC<MobileMediaViewerProps> = ({
  media,
  postForm,
  onClose,
  onTouchStart,
  onTouchEnd,
}) => {
  const {
    setShowActions,
    setProgress,
    fitMode,
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

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return
    const current = (video.currentTime / video.duration) * 100
    setProgress(current)
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black flex items-center justify-center z-40 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => setShowActions(!showActions)}
      >
        <button
          onClick={onClose}
          className="z-10 top-4 right-4 absolute actionIconWrapper"
        >
          ✕
        </button>

        <div className="w-full h-full relative bg-black flex items-center justify-center">
          {media.type.includes('image') ? (
            <img
              src={media.src}
              alt={media.content || ''}
              className={`w-full h-full ${
                fitMode ? 'object-contain bg-black' : 'object-cover'
              } transition-all duration-300`}
            />
          ) : (
            <video
              ref={videoRef}
              src={media.src}
              poster={media.preview}
              className={`w-full h-full ${
                fitMode ? 'object-contain bg-black' : 'object-cover'
              } transition-all duration-300`}
              autoPlay
              loop
              playsInline
              onTimeUpdate={handleTimeUpdate}
            />
          )}

          {postForm._id && (
            <div className="absolute bottom-0 pb-7 left-0 px-4 text-white w-full">
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
              <div
                className="text-sm z-10 relative text-gray-200 line-clamp-2 break-words"
                dangerouslySetInnerHTML={{
                  __html: postForm.content,
                }}
              />
              <div className="absolute w-full z-0 inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
          )}

          <MediaReactions media={media} />
        </div>
      </div>
      <MediaCommentSection />
    </>
  )
}

export default MobileMediaViewer
