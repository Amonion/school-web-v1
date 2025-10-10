'use client'
import React, { useRef, useEffect } from 'react'
import CommentStore from '@/src/zustand/post/Comment'
import { Post, PostStore } from '@/src/zustand/post/Post'
import MobileMediaViewer from './MobileMediaViewer'
import DesktopMediaViewer from './DesktopMediaViewer'

const HomeMediaHolder: React.FC = () => {
  const {
    currentPage,
    page_size,
    isMobile,
    showComments,
    setFitMode,
    setIsMobile,
    setShowActions,
    getComments,
  } = CommentStore()
  const {
    mediaResults,
    currentIndex,
    selectedMedia,
    postForm,
    setSelectedMedia,
    setCurrentIndex,
  } = PostStore()

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
        <MobileMediaViewer
          media={selectedMedia}
          postForm={postForm}
          onClose={closeFullScreen}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
      )}

      {selectedMedia && !isMobile && (
        <DesktopMediaViewer
          media={selectedMedia}
          onClose={closeFullScreen}
          goToPrevious={goToPrevious}
          goToNext={goToNext}
        />
      )}
    </>
  )
}

export default HomeMediaHolder
