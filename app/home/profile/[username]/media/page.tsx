'use client'
import React, { useEffect } from 'react'
import CommentStore from '@/src/zustand/post/Comment'
import { Post } from '@/src/zustand/post/Post'
import UserPostStore from '@/src/zustand/post/UserPost'

const MediaGrid: React.FC = () => {
  const { currentPage, page_size, sort, setShowActions, getComments } =
    CommentStore()
  const {
    userMediaResults,
    isMobile,
    currentIndex,
    selectedUserMedia,
    setSelectedUserMedia,
    setCurrentIndex,
    setFitMode,
    setIsMobile,
  } = UserPostStore()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!selectedUserMedia || isMobile) return
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
  }, [selectedUserMedia, isMobile])

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

  const handleMouseEnter = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!isMobile) e.currentTarget.play()
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!isMobile) {
      e.currentTarget.pause()
      e.currentTarget.currentTime = 0
    }
  }

  const setMainPost = (index: number) => {
    let comment: Post | undefined
    UserPostStore.setState((prev) => {
      comment = prev.postResults.find(
        (item) => item._id === userMediaResults[index].postId
      )

      return {
        userPostForm: prev.postResults.find(
          (item) => item._id === userMediaResults[index].postId
        ),
      }
    })
    CommentStore.setState({ mainPost: comment })
    if (userMediaResults[index].postId) {
      getComments(
        `/posts/comments?page=${currentPage}&ordering=${sort}&page_size=${page_size}&postType=comment&postId=${userMediaResults[index].postId}&level=1`
      )
    }
  }

  const openFullScreen = (index: number) => {
    setMainPost(index)
    setSelectedUserMedia(userMediaResults[index])
    setCurrentIndex(index)
    setFitMode(false)
  }

  const closeFullScreen = () => {
    setSelectedUserMedia(null)
    setFitMode(false)
  }

  const goToPrevious = () => {
    const newIndex =
      (currentIndex - 1 + userMediaResults.length) % userMediaResults.length

    setMainPost(newIndex)
    setSelectedUserMedia(userMediaResults[newIndex])
    setCurrentIndex(newIndex)
    setFitMode(false)
  }

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % userMediaResults.length
    setMainPost(newIndex)
    setSelectedUserMedia(userMediaResults[newIndex])
    setCurrentIndex(newIndex)
    setFitMode(false)
  }

  return (
    <div className="container sm:pb-2">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-1">
        {userMediaResults.map((item, index) => (
          <div
            key={index}
            className="relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
            onClick={() => openFullScreen(index)}
          >
            {item.type.includes('image') ? (
              <img
                src={item.src}
                alt={item.content}
                className="w-full h-full object-cover"
              />
            ) : item.backgroundColor ? (
              <div
                key={index}
                style={{
                  backgroundColor: item.backgroundColor,
                  backgroundImage: item?.preview
                    ? `url(${item.preview})`
                    : undefined,
                  backgroundSize: item?.preview ? 'cover' : undefined,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
                className={`w-full h-full relative px-1 text-center  flex justify-center items-center`}
              >
                <div
                  className="text-white line-clamp-3 overflow-ellipsis relative my-auto text-[12px] leading-[20px] z-10"
                  dangerouslySetInnerHTML={{
                    __html: item.content,
                  }}
                ></div>
              </div>
            ) : (
              <video
                src={item.src}
                poster={item.preview}
                className="w-full h-full object-cover"
                muted
                loop
                preload="metadata"
                playsInline
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
            )}

            {item.type.includes('video') && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MediaGrid
