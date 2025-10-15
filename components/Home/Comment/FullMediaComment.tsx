'use client'
import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import { ImageIcon, Send, Smile } from 'lucide-react'
import CommentStore, { CommentEmpty } from '@/src/zustand/post/Comment'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { v4 as uuidv4 } from 'uuid'
import CommentList from './CommentList'
import Picker from '@emoji-mart/react'
import { useTheme } from '@/context/ThemeProvider'
import data from '@emoji-mart/data'

interface FullMediaCommentSectionProps {
  isDesktop?: boolean
}

const FullMediaCommentSection: React.FC<FullMediaCommentSectionProps> = ({
  isDesktop,
}) => {
  const {
    showGlassComments,
    commentForm,
    activeComment,
    mainPost,
    resetForm,
    postItem,
    setTempComment,
    setMediaHeight,
    setShowGlassComment,
  } = CommentStore()
  const [commentText, setCommentText] = useState('')
  const [commentImage, setCommentImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | string>('')
  const { setMessage } = MessageStore()
  const { user } = AuthStore()
  const { theme } = useTheme()
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const coverRef = useRef<HTMLDivElement | null>(null)
  const y = useMotionValue(0)
  const commentRef = useRef<HTMLDivElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setFile(file)
      setCommentImage(url)
    }
  }

  const submitComment = async () => {
    if (!user) return
    if (!file && commentText.length === 0) {
      setMessage('Your comment is empty and cannot be submitted.', false)
      return
    }

    const uniqueId = uuidv4()

    const formData = {
      to: 'users',
      content: commentText,
      editId: '',
      postId: commentForm._id ? commentForm._id : mainPost._id,
      uniqueId: uniqueId,
      replyToId:
        activeComment.level >= 4
          ? activeComment.replyToId
          : activeComment._id
          ? activeComment._id
          : mainPost._id,
      level:
        activeComment._id === ''
          ? 1
          : activeComment.level >= 4
          ? 3
          : activeComment.level,
      postType: 'comment',
      replyTo: activeComment.displayName,
      user: activeComment.displayName,
      sender: {
        picture: user?.picture,
        displayName: user?.displayName,
        username: user?.username,
        _id: user?._id,
        isVerified: user?.isVerified,
      },
      createdAt: new Date().toISOString(),
      commentMedia: file ? file : undefined,
    }

    setTempComment({
      ...CommentEmpty,
      _id: uniqueId,
      username: user.username,
      userId: user._id,
      uniqueId: uniqueId,
      level:
        activeComment._id === ''
          ? 1
          : activeComment.level >= 4
          ? 3
          : activeComment.level,
      displayName: user.displayName,
      postId: activeComment.postId ? activeComment.postId : mainPost._id,
      replyToId:
        activeComment.level >= 4
          ? activeComment.replyToId
          : activeComment._id
          ? activeComment._id
          : mainPost._id,
      content: commentText,
      replyTo: activeComment.displayName,
      user: activeComment.displayName,
      commentMedia: file ? file : '',
      picture: String(user.picture),
      createdAt: new Date(),
    })

    setCommentText('')
    setFile('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    postItem('/posts/comments', formData)
  }

  const addEmoji = (emoji: { native: string }) => {
    setCommentText((prev) => prev + emoji.native)
  }

  useEffect(() => {
    if (showGlassComments) {
      setMediaHeight('30vh')
      y.set(0)
    } else {
      setMediaHeight('100vh')
    }
  }, [showGlassComments, y])

  useEffect(() => {
    const unsubscribe = y.on('change', (latestY) => {
      if (typeof latestY !== 'number') return

      const minHeight = 30
      const maxHeight = 100
      const dragRatio = Math.min(Math.max(latestY / 300, 0), 1)
      const newHeight = minHeight + (maxHeight - minHeight) * dragRatio
      if (showGlassComments) {
        setMediaHeight(`${newHeight}vh`)
      }
    })

    return () => unsubscribe()
  }, [y, showGlassComments])

  return (
    <AnimatePresence>
      {showGlassComments && (
        <>
          <motion.div
            ref={coverRef}
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation()
              setShowGlassComment(false)
            }}
          />

          <motion.div
            ref={commentRef}
            className={`${
              isDesktop ? '-translate-x-1/2 w-[600px]' : 'left-0 right-0 w-full'
            } fixed bottom-0 z-50 bg-[var(--primary)] rounded-t-2xl flex flex-col h-[100vh] max-h-[70%]`}
            style={{ y }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150) setShowGlassComment(false)
            }}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-2 mb-3" />

            <CommentList />

            <div
              className={`border-t border-[var(--border)] p-2 sm:p-3 bg-[var(--secondary)]/60 backdrop-blur-md`}
            >
              {activeComment.username && (
                <div className="flex w-full flex-wrap items-center mb-1 px-2">
                  <div className="">Replying to</div>
                  <div className="ml-2 text-[var(--custom)]">
                    {activeComment.displayName}
                  </div>
                  <div onClick={resetForm} className="ml-auto cursor-pointer">
                    Clear
                  </div>
                </div>
              )}
              <div className="flex items-end gap-2">
                <label className="cursor-pointer bg-[var(--secondary)] p-2 rounded-full hover:bg-black/50 transition flex-shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <ImageIcon size={22} className="text-[var(--custom)]" />
                </label>

                <div
                  className={`flex-1 flex items-end bg-[var(--secondary)] rounded-[25px] px-2`}
                >
                  <Smile
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className="text-[var(--custom)] mr-2 mb-2"
                  />
                  <textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    ref={textareaRef}
                    onChange={(e) => {
                      setCommentText(e.target.value)
                      e.target.style.height = 'auto'
                      e.target.style.height = `${Math.min(
                        e.target.scrollHeight,
                        120
                      )}px` // 120px max height
                    }}
                    rows={1}
                    className="flex-1 bg-transparent text-white text-sm  py-2 placeholder-gray-400 outline-none  resize-none overflow-y-auto max-h-[120px]"
                  />
                </div>

                <button
                  onClick={submitComment}
                  disabled={!commentText.trim() && !commentImage}
                  className={`p-2 rounded-full flex-shrink-0 transition ${
                    commentText.trim() || commentImage
                      ? 'bg-[var(--custom)] hover:bg-[var(--custom)]'
                      : 'bg-[var(--secondary)] cursor-not-allowed'
                  }`}
                >
                  <Send size={18} className="text-white" />
                </button>
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="w-full absolute bottom-[70px] mt-2 h-[200px] overflow-y-scroll"
                  >
                    <Picker
                      data={data}
                      onEmojiSelect={addEmoji}
                      theme={`${theme}`}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default FullMediaCommentSection
