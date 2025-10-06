'use client'
import React from 'react'
import { Media } from '@/src/zustand/post/UserPost'
import { Post } from '@/src/zustand/post/Post'
import MobileMediaViewer from '@/components/Home/Media/MobileMediaViewer'
import DesktopMediaViewer from './DesktopMediaViewer'

interface MediaHolderProps {
  isMobile: boolean
  postForm: Post
  selectedMedia: Media | null
  closeFullScreen: () => void
  handleTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void
  handleTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void
  goToPrevious: () => void
  goToNext: () => void
}

const MediaHolder: React.FC<MediaHolderProps> = ({
  isMobile,
  postForm,
  selectedMedia,
  closeFullScreen,
  handleTouchStart,
  handleTouchEnd,
  goToPrevious,
  goToNext,
}) => {
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

export default MediaHolder
