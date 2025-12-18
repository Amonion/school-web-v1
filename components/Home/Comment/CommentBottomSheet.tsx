'use client'
import { v4 as uuidv4 } from 'uuid'
import { useEffect, useRef, useState } from 'react'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { motion, AnimatePresence } from 'framer-motion'
import { Smile } from 'lucide-react'
import CommentBox from './CommentsBox'
import { MessageStore } from '@/src/zustand/notification/Message'
import CommentStore, { CommentEmpty } from '@/src/zustand/post/Comment'
import { useTheme } from '@/context/ThemeProvider'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { Media } from '@/src/zustand/post/UserPost'
import ChatEditor from '@/components/Chat/ChatEditor'

const CommentBottomSheet = () => {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<Media[]>([])
  const { setMessage } = MessageStore()
  const {
    loading,
    showComments,
    commentForm,
    mainPost,
    activeComment,
    resetForm,
    postItem,
    setShowComment,
    setTempComment,
  } = CommentStore()
  const [isMobile, setIsMobile] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const { user } = AuthStore()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const submitComment = async () => {
    if (!user) return
    if (files.length === 0 && text.length === 0) {
      setMessage('Your comment is empty and cannot be submitted.', false)
      return
    }

    const uniqueId = uuidv4()

    const formData = {
      to: 'users',
      content: text,
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
      commentMedia: files.length > 0 ? files[0].src : undefined,
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
      content: text,
      replyTo: activeComment.displayName,
      user: activeComment.displayName,
      commentMedia: files.length > 0 ? files[0].src : '',
      picture: String(user.picture),
      createdAt: new Date(),
    })

    setText('')
    setFiles([])
    postItem('/comments', formData)
  }

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e)
  }

  const addEmoji = (emoji: { native: string }) => {
    setText((prev) => prev + emoji.native)
  }

  return (
    <>
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation()
                setShowComment(false)
              }}
            />
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className={`${
                !isMobile
                  ? 'w-full bottom-0 justify-center flex'
                  : 'right-0 w-full'
              } fixed bottom-0 z-40 left-0 flex flex-col max-h-[70vh]`}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setShowComment(false)
              }}
            >
              <div className="custom_container">
                <div className="flex flex-1">
                  <div className="w-[270px] xl:w-[300px] hidden sm:flex"></div>
                  <div className="flex flex-col sm:ml-5 relative flex-1 md:mr-5 bg-[var(--primary)] border border-[var(--border)] rounded-t-2xl">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-2 mb-3 cursor-pointer" />

                    <CommentBox />
                    <div className="w-full bg-[var(--primary)] z-10 sticky bottom-0 left-0 mt-auto py-2 sm:px-[10px] px-[5px] ">
                      {activeComment.username && (
                        <div className="flex w-full flex-wrap items-center mb-1 px-2">
                          <div className="">Replying to</div>
                          <div className="ml-2 text-[var(--custom)]">
                            {activeComment.displayName}
                          </div>
                          <div
                            onClick={resetForm}
                            className="ml-auto cursor-pointer"
                          >
                            Clear
                          </div>
                        </div>
                      )}
                      <div className="flex items-end">
                        <div className="flex flex-1 bg-[var(--secondary)] rounded-[25px] px-2 flex-col mx-2">
                          <div className="flex items-end">
                            {!loading && (
                              <>
                                <Smile
                                  onClick={() =>
                                    setShowEmojiPicker((prev) => !prev)
                                  }
                                  className="text-[var(--custom)] mr-2 mb-[10px]"
                                />
                                <label className="relative mr-2 mb-2">
                                  <i className="bi bi-images text-lg text-[var(--custom)]"></i>
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={uploadFile}
                                  />
                                </label>
                              </>
                            )}
                            <ChatEditor
                              value={text}
                              onChange={(content) => setText(content)}
                              submitComment={submitComment}
                            />
                            {loading ? (
                              <div className="commentBtn">
                                <i className="bi bi-opencollective activeLoader"></i>
                              </div>
                            ) : (
                              <>
                                {(files.length > 0 ||
                                  text.replace(/<[^>]*>/g, '').trim().length >
                                    0) && (
                                  <div className="commentBtn">
                                    <i
                                      onClick={submitComment}
                                      className="bi bi-send text-[20px] text-[var(--custom)] rotate-45 inline-block cursor-pointer"
                                    />
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-end"></div>

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
                  </div>
                  <div className="w-[270px] xl:w-[300px] hidden md:block"></div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default CommentBottomSheet
