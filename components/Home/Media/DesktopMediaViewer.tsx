'use client'
import React, { useEffect, useRef, useState } from 'react'
import MediaCommentSection from '../Comment/FullMediaComment'
import CommentStore from '@/src/zustand/post/Comment'
import MediaReactions from './MediaReactions'
import { Media } from '@/src/zustand/post/UserPost'

interface DesktopMediaViewerProps {
  media: Media
  onClose: () => void
  goToPrevious: () => void
  goToNext: () => void
}

const DesktopMediaViewer: React.FC<DesktopMediaViewerProps> = ({
  media,
  onClose,
  goToPrevious,
  goToNext,
}) => {
  const { setShowActions, isPlaying, mainPost } = CommentStore()
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

  //   const handleTimeUpdate = () => {
  //     const video = videoRef.current
  //     if (!video) return
  //     const current = (video.currentTime / video.duration) * 100
  //     setProgress(current)
  //   }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-[90vh] w-full border border-[var(--border)] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {media.type.includes('image') ? (
          <img
            src={media.src}
            alt={media.content}
            className="w-full max-h-full object-contain"
          />
        ) : (
          <video
            src={media.src}
            poster={media.preview}
            className="w-full max-h-[90vh] object-contain"
            autoPlay
            loop
            controls
          />
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 font-bold text-white w-10 h-10 bg-black/50 rounded-full p-2 hover:bg-black/70 transition"
        >
          ✕
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            goToPrevious()
          }}
          className="absolute left-4 top-[30%] w-12 h-12 flex justify-center items-center text-white text-4xl bg-black/40 hover:bg-black/60 rounded-full p-2 transition"
        >
          &#10094;
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            goToNext()
          }}
          className="absolute right-4 top-[30%] w-12 h-12 flex justify-center items-center text-white text-4xl bg-black/40 hover:bg-black/60 rounded-full p-2 transition"
        >
          &#10095;
        </button>
        <MediaReactions media={media} isDesktop={true} />
      </div>
      <MediaCommentSection isDesktop={true} />
    </div>
  )
}

export default DesktopMediaViewer
