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
import { AuthStore } from '@/src/zustand/user/AuthStore'

interface MediaReactionsProps {
  media: Media
  isDesktop?: boolean
}

const MediaReactions: React.FC<MediaReactionsProps> = ({
  media,
  isDesktop,
}) => {
  const { postForm } = PostStore()
  const { user } = AuthStore()
  const { userPostForm } = UserPostStore()
  const pathname = usePathname()
  const {
    setShowGlassComment,
    updateComment,
    togglePlay,
    isPlaying,
    showActions,
    progress,
  } = CommentStore()

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

  const toggleLike = () => {
    handleLike(true)
    PostStore.setState((prev) => {
      return {
        postForm: {
          ...prev.postForm,
          liked: !prev.postForm.liked,
          likes: prev.postForm.liked
            ? prev.postForm.likes - 1
            : prev.postForm.likes + 1,
          hated: prev.postForm.hated ? false : prev.postForm.hated,
          hates: prev.postForm.hated
            ? prev.postForm.hates - 1
            : prev.postForm.hates,
        },
      }
    })
  }

  const toggleHate = () => {
    handleLike(true)
    PostStore.setState((prev) => {
      return {
        postForm: {
          ...prev.postForm,
          hated: !prev.postForm.hated,
          hates: prev.postForm.hated
            ? prev.postForm.hates - 1
            : prev.postForm.hates + 1,
          liked: prev.postForm.liked ? false : prev.postForm.liked,
          likes: prev.postForm.liked
            ? prev.postForm.likes - 1
            : prev.postForm.likes,
        },
      }
    })
  }

  const handleLike = async (status: boolean) => {
    updateComment(`/posts/${status ? 'like' : 'hate'}`, {
      id: media.postId,
      userId: user?._id,
    })
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

      {pathname === '/home' ? (
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
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <button
                onClick={toggleLike}
                className={`text-white relative textShadow ${
                  postForm.liked ? 'text-[var(--custom)]' : ''
                }`}
              >
                <ThumbsUp
                  size={20}
                  className={`${
                    postForm.liked
                      ? 'fill-current text-[var(--custom)]'
                      : 'text-white'
                  }`}
                  color={postForm.liked ? '#da3986' : '#FFFFFF'}
                />
                {postForm.likes > 0 && (
                  <div className="text-[12px] mt-1">
                    {formatCount(postForm.likes)}
                  </div>
                )}
              </button>
              <button
                onClick={toggleHate}
                className={`text-white relative textShadow ${
                  postForm.hated ? 'text-[var(--custom)]' : ''
                }`}
              >
                <ThumbsDown
                  size={20}
                  className={`${
                    postForm.hated || userPostForm.hated
                      ? 'fill-current text-[var(--custom)]'
                      : 'text-white'
                  }`}
                  color={postForm.hated ? '#da3986' : '#FFFFFF'}
                />
                {postForm.hates > 0 && (
                  <div className="text-[12px] mt-1">
                    {formatCount(postForm.hates)}
                  </div>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowGlassComment(true)
                }}
                className={`text-white relative textShadow`}
              >
                <MessageCircle size={20} />
                {postForm.replies > 0 && (
                  <div className="text-[12px] mt-1">
                    {formatCount(postForm.replies)}
                  </div>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
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
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <button
                onClick={toggleLike}
                className={`text-white relative textShadow ${
                  postForm.liked ? 'text-[var(--custom)]' : ''
                }`}
              >
                <ThumbsUp
                  size={20}
                  className={`${
                    postForm.liked || userPostForm.liked
                      ? 'fill-current text-[var(--custom)]'
                      : 'text-white'
                  }`}
                  color={postForm.liked ? '#da3986' : '#FFFFFF'}
                />
                {pathname === '/home' && postForm.likes > 0 ? (
                  <div className="text-[12px] mt-1">
                    {formatCount(postForm.likes)}
                  </div>
                ) : (
                  userPostForm.likes > 0 && (
                    <div className="text-[12px] mt-1">
                      {formatCount(userPostForm.likes)}
                    </div>
                  )
                )}
              </button>
              <button
                onClick={toggleHate}
                className={`text-white relative textShadow ${
                  postForm.hated ? 'text-[var(--custom)]' : ''
                }`}
              >
                <ThumbsDown
                  size={20}
                  className={`${
                    postForm.hated || userPostForm.hated
                      ? 'fill-current text-[var(--custom)]'
                      : 'text-white'
                  }`}
                  color={postForm.hated ? '#da3986' : '#FFFFFF'}
                />
                {pathname === '/home' && postForm.hates > 0 ? (
                  <div className="text-[12px] mt-1">
                    {formatCount(postForm.hates)}
                  </div>
                ) : (
                  userPostForm.hates > 0 && (
                    <div className="text-[12px] mt-1">
                      {formatCount(userPostForm.hates)}
                    </div>
                  )
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowGlassComment(true)
                }}
                className={`text-white relative textShadow`}
              >
                <MessageCircle size={20} />
                {pathname === '/home' && postForm.replies > 0 ? (
                  <div className="text-[12px] mt-1">
                    {formatCount(postForm.replies)}
                  </div>
                ) : (
                  userPostForm.replies > 0 && (
                    <div className="text-[12px] mt-1">
                      {formatCount(userPostForm.replies)}
                    </div>
                  )
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}

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
