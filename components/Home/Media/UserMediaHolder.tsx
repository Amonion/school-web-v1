'use client'
import React, { useRef, useEffect } from 'react'
import PostStore from '@/src/zustand/post/UserPost'
import MediaViewer from '@/components/Home/Media/MobileMediaViewer'
import CommentStore from '@/src/zustand/post/Comment'
import { Post } from '@/src/zustand/post/Post'
import MediaReactions from '@/components/Home/Media/MediaReactions'
import MediaCommentSection from '@/components/Home/Comment/FullMediaComment'
import UserPostStore from '@/src/zustand/post/UserPost'

const MediaHolder: React.FC = () => {
  const { currentPage, page_size, showComments, setShowActions, getComments } =
    CommentStore()
  const {
    mediaResults,
    isMobile,
    currentIndex,
    selectedMedia,
    setSelectedMedia,
    setCurrentIndex,
    setFitMode,
    setIsMobile,
  } = UserPostStore()

  const touchStartY = useRef(0)
  const touchEndY = useRef(0)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!selectedMedia || isMobile) return
      if (e.key === 'ArrowLeft') {
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        goToNext()
      } else if (e.key === 'Escape') {
        closeFullScreen()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedMedia, isMobile])

  useEffect(() => {
    if (!isMobile) {
      setShowActions(true)
    } else {
      const timer = setTimeout(() => {
        setShowActions(false)
      }, 10000)
      setShowActions(true)
      return () => clearTimeout(timer)
    }
  }, [isMobile])

  const setMainPost = (index: number) => {
    let comment: Post | undefined
    PostStore.setState((prev) => {
      comment = prev.postResults.find(
        (item) => item._id === mediaResults[index].postId
      )
      return {
        postForm: prev.postResults.find(
          (item) => item._id === mediaResults[index].postId
        ),
      }
    })
    CommentStore.setState({ mainPost: comment })
    if (mediaResults[index].postId) {
      getComments(
        `/posts/comments?page=${currentPage}&page_size=${page_size}&postType=comment&postId=${mediaResults[index].postId}&level=1`
      )
    }
  }

  const closeFullScreen = () => {
    setSelectedMedia(null)
    setFitMode(false)
  }

  const goToPrevious = () => {
    const newIndex =
      (currentIndex - 1 + mediaResults.length) % mediaResults.length

    setMainPost(newIndex)
    setSelectedMedia(mediaResults[newIndex])
    setCurrentIndex(newIndex)
    setFitMode(false)
  }

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % mediaResults.length
    setMainPost(newIndex)
    setSelectedMedia(mediaResults[newIndex])
    setCurrentIndex(newIndex)
    setFitMode(false)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.targetTouches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndY.current = e.changedTouches[0].clientY
    const swipeDistance = touchStartY.current - touchEndY.current
    if (showComments) {
      return
    }
    if (swipeDistance > 50) {
      goToNext()
    } else if (swipeDistance < -50) {
      goToPrevious()
    }
  }

  return (
    <>
      {selectedMedia && isMobile && (
        <MediaViewer
          media={selectedMedia}
          onClose={closeFullScreen}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
      )}

      {selectedMedia && !isMobile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={closeFullScreen}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.type.includes('image') ? (
              <img
                src={selectedMedia.src}
                alt={selectedMedia.content}
                className="w-full max-h-full object-contain"
              />
            ) : (
              <video
                src={selectedMedia.src}
                poster={selectedMedia.preview}
                className="w-full max-h-full object-contain"
                autoPlay
                loop
                controls
              />
            )}

            <button
              onClick={closeFullScreen}
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
            <MediaReactions media={selectedMedia} isDesktop={true} />
          </div>
          <MediaCommentSection isDesktop={true} />
        </div>
      )}
    </>
  )
}

export default MediaHolder
