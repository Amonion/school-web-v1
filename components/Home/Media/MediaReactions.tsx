'use client'
import React from 'react'
import { MessageCircle, ThumbsUp, ThumbsDown, Play, Pause } from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Media } from '@/src/zustand/post/UserPost'
import CommentStore from '@/src/zustand/post/Comment'
import { formatCount } from '@/lib/helpers'
import UserPostStore from '@/src/zustand/post/UserPost'
import { PostStore } from '@/src/zustand/post/Post'
import { usePathname } from 'next/navigation'

interface MediaReactionsProps {
  media: Media
  isDesktop?: boolean
}

const MediaReactions: React.FC<MediaReactionsProps> = ({
  media,
  isDesktop,
}) => {
  const { postForm } = PostStore()
  const { userPostForm } = UserPostStore()
  const pathname = usePathname()
  const { setShowGlassComment, togglePlay, isPlaying, showActions, progress } =
    CommentStore()

  const actionVariants: Variants = {
    hidden: {
      x: 100,
      opacity: 0,
      rotate: 10,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
    visible: {
      x: 0,
      opacity: 1,
      rotate: 0,
      transition: { type: 'spring', stiffness: 120, damping: 10 },
    },
    exit: {
      x: 100,
      opacity: 0,
      rotate: 10,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  }

  const fadeVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  return (
    <>
      {media.type.includes('video') && showActions && !isDesktop && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            togglePlay(!isPlaying)
          }}
          className="actionIconWrapper absoluteCenter backdrop-blur-sm"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
      )}

      <AnimatePresence>
        {showActions && (
          <motion.div
            className={`${
              isDesktop ? '' : ''
            } absolute z-20 bottom-20 right-4 flex flex-col items-center gap-4`}
            variants={actionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <button
              className={`text-white relative backdrop-blur-sm actionIconWrapper ${
                postForm.liked ? 'text-[var(--custom)]' : ''
              }`}
            >
              {pathname === '/home' && postForm.likes > 0 ? (
                <div className="actionText">{formatCount(postForm.likes)}</div>
              ) : (
                userPostForm.likes > 0 && (
                  <div className="actionText">
                    {formatCount(userPostForm.likes)}
                  </div>
                )
              )}
              <ThumbsUp
                size={20}
                color={postForm.liked ? '#da3986' : '#FFFFFF'}
              />
            </button>
            <button
              className={`text-white relative backdrop-blur-sm actionIconWrapper ${
                postForm.hated ? 'text-[var(--custom)]' : ''
              }`}
            >
              {pathname === '/home' && postForm.hates > 0 ? (
                <div className="actionText">{formatCount(postForm.hates)}</div>
              ) : (
                userPostForm.hates > 0 && (
                  <div className="actionText">
                    {formatCount(userPostForm.hates)}
                  </div>
                )
              )}
              <ThumbsDown
                size={20}
                color={postForm.hated ? '#da3986' : '#FFFFFF'}
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowGlassComment(true)
              }}
              className={`text-white relative backdrop-blur-sm actionIconWrapper`}
            >
              {pathname === '/home' && postForm.replies > 0 ? (
                <div className="actionText">
                  {formatCount(postForm.replies)}
                </div>
              ) : (
                userPostForm.replies > 0 && (
                  <div className="actionText">
                    {formatCount(userPostForm.replies)}
                  </div>
                )
              )}
              <MessageCircle size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {media.type.includes('video') && !isDesktop && (
        <AnimatePresence>
          {showActions && (
            <motion.div
              className="absolute bottom-0 backdrop-blur-sm left-0 right-0 px-4 pb-3 flex flex-col gap-2 text-white bg-gradient-to-t from-black/60 to-transparent"
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="w-full rounded-full bg-white overflow-hidden">
                <div
                  style={{ width: `${progress}%` }}
                  className="h-1 bg-[var(--custom)]"
                ></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  )
}

export default MediaReactions
