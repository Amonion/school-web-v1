'use client'
import React, { useRef, useEffect } from 'react'
import PostStore from '@/src/zustand/post/UserPost'
import CommentStore from '@/src/zustand/post/Comment'
import { Post } from '@/src/zustand/post/Post'
import UserPostStore from '@/src/zustand/post/UserPost'
import DesktopMediaViewer from './DesktopMediaViewer'
import MobileMediaView from '../Comment/MobileMediaView'

const UserMediaHolder: React.FC = () => {
  const { currentPage, page_size, showComments, setShowActions, getComments } =
    CommentStore()
  const {
    userMediaResults,
    isMobile,
    currentIndex,
    userPostForm,
    selectedUserMedia,
    setSelectedUserMedia,
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

  const setMainPost = (index: number) => {
    let comment: Post | undefined
    PostStore.setState((prev) => {
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
        `/comments?page=${currentPage}&page_size=${page_size}&postId=${userMediaResults[index].postId}&level=1`
      )
    }
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
      {selectedUserMedia && isMobile && (
        <MobileMediaView
          media={selectedUserMedia}
          postForm={userPostForm}
          onClose={closeFullScreen}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
      )}

      {selectedUserMedia && !isMobile && (
        <DesktopMediaViewer
          media={selectedUserMedia}
          onClose={closeFullScreen}
          goToPrevious={goToPrevious}
          goToNext={goToNext}
        />
      )}
    </>
  )
}

export default UserMediaHolder
