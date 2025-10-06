import { useEffect, useRef, useState } from 'react'
import { Upload, Smile, Save, Plus } from 'lucide-react'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { getFileType } from '@/lib/helpers'
import axios from 'axios'
import Image from 'next/image'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { useTheme } from '@/context/ThemeProvider'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import PostEditor from '../Editor/PostEditor'
import { Poll, Post, PostStore } from '@/src/zustand/post/Post'
import { usePersonalNotificationContext } from '@/context/HomeContext/PersonalNotificationContext'

type file = {
  type: string
  source: string
  preview: string
  width: number
  height: number
}

interface PostBoxProps {
  _id?: string
  postType?: string
}

const PostBox: React.FC<PostBoxProps> = () => {
  const [polls, addPoll] = useState<Poll[]>([])
  const [files, setFiles] = useState<file[]>([])
  const [text, setText] = useState('')
  const [pollText, setPollText] = useState('')
  // const [postType, setPostType] = useState(type);
  const [onPoll, setOnPoll] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [percents, setPercents] = useState<number[]>([])
  const [pollPercent, setPollPercent] = useState(0)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const { togglePostBox } = NavStore()
  const { theme } = useTheme()
  const { setMessage, baseURL } = MessageStore()
  const { setAlert } = AlartStore()
  const { postForm } = PostStore()
  const { user } = AuthStore()
  const { socket } = usePersonalNotificationContext()
  const [pollPicture, setPollPicture] = useState<string | null>(null)

  interface Response {
    data: Post
    message: string
  }

  const playSound = () => {
    const audio = new Audio('/sounds/pop.wav')
    audio.play().catch((error) => console.error('Error playing sound:', error))
  }

  useEffect(() => {
    if (!socket) return

    socket.on(`post_${user?.username}`, (data: Response) => {
      togglePostBox()
      setLoading(false)
      PostStore.setState((prev) => ({
        postResults: [{ ...data.data, viewed: true }, ...prev.postResults],
      }))

      setMessage(data.message, true)
      playSound()
    })

    return () => {
      setLoading(false)
      socket.off(`post_${user?.username}`)
    }
  }, [socket])

  const postMessage = () => {
    if (socket) {
      const formData = {
        to: 'post',
        content: text,
        editId: postForm._id,
        postType: 'main',
        polls: polls,
        users: [user?.username],
        sender: {
          picture: user?.picture,
          displayName: user?.displayName,
          username: user?.username,
          _id: user?._id,
          isVerified: user?.isVerified,
        },
        createdAt: new Date().toISOString(),
        media: files,
      }

      if (
        formData.media.length === 0 &&
        formData.polls.length === 0 &&
        !formData.content
      ) {
        setMessage('Your post is empty and cannot be submitted.', false)
        return
      }
      setLoading(true)
      socket.emit('message', formData)
    } else {
      setMessage(`Sorry, something went wrong, refresh and try again.`, false)
    }
  }

  const clearInput = () => {
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const el = files[i]
        handleRemoveFile(i, el.source)
        if (i === files.length - 1) {
        }
      }
    }
    if (text) {
      setText('')
    }
    togglePostBox()
  }

  const closeBox = () => {
    if (files.length > 0 || text !== '') {
      setAlert(
        'Warning',
        'You have unsaved changes in your message box, are you sure you want to discard them?',
        true,
        () => {
          clearInput()
        }
      )
    } else {
      togglePostBox()
    }
  }

  const addEmoji = (emoji: { native: string }) => {
    setText((prev) => prev + emoji.native)
  }

  const handleAddPoll = () => {
    if (pollText.trim().length === 0) {
      setMessage(`Cannot add poll with empty text.`, false)
      return
    }
    const poll: Poll = {
      text: pollText,
      index: polls.length,
      picture: pollPicture ? pollPicture : '',
      percent: 0,
      userId: '',
    }
    addPoll((prev) => [...prev, poll])
    setPollPicture(``)
    setPollText(``)
    setPollPercent(0)
  }

  const handleRemoveFile = async (index: number, source: string) => {
    try {
      const fileKey = source.split('.com/')[1]
      await axios.post(`${baseURL}s3-delete-file`, { fileKey })
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
    } catch (error) {
      console.error('Failed to delete file from S3:', error)
    }
  }

  const voteFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      try {
        setLoading(true)
        const { data } = await axios.post(`${baseURL}s3-presigned-url`, {
          fileName: file.name,
          fileType: file.type,
        })

        const { uploadUrl } = data
        await axios.put(uploadUrl, file, {
          headers: { 'Content-Type': file.type },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              )
              setPollPercent(percent)
            }
          },
        })

        const cleanUrl = uploadUrl.split('?')[0]
        setPollPicture(() => {
          setLoading(false)
          return cleanUrl
        })
        return uploadUrl
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const files = event.target.files
      for (let i = 0; i < files.length; i++) {
        const el = files[i]
        const type = getFileType(el)
        await uploadFile(el, i, type)
      }
    }
  }

  const uploadFile = async (file: File, index: number, type: string) => {
    try {
      setLoading(true)

      const getMediaDimensions = (): Promise<{
        width: number
        height: number
      }> =>
        new Promise((resolve, reject) => {
          if (type.includes('image')) {
            const img = new window.Image()
            img.onload = () => resolve({ width: img.width, height: img.height })
            img.onerror = reject
            img.src = URL.createObjectURL(file)
          } else if (type.includes('video')) {
            const video = document.createElement('video')
            video.preload = 'metadata'
            video.onloadedmetadata = () => {
              URL.revokeObjectURL(video.src)
              resolve({ width: video.videoWidth, height: video.videoHeight })
            }
            video.onerror = reject
            video.src = URL.createObjectURL(file)
          } else {
            resolve({ width: 0, height: 0 })
          }
        })

      const { width, height } = await getMediaDimensions()

      const { data: filePresign } = await axios.post(
        `${baseURL}s3-presigned-url`,
        {
          fileName: file.name,
          fileType: file.type,
        }
      )

      const { uploadUrl: fileUploadUrl } = filePresign

      await axios.put(fileUploadUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            )
            setPercents((prev) => {
              const updated = [...prev]
              updated[index] = percent
              return updated
            })
          }
        },
      })

      const publicFileUrl = fileUploadUrl.split('?')[0]
      let publicThumbUrl = publicFileUrl

      if (type.includes('video')) {
        const video = document.createElement('video')
        video.src = URL.createObjectURL(file)
        video.crossOrigin = 'anonymous'
        video.preload = 'metadata'
        video.muted = true // required for some browsers
        video.playsInline = true

        const canvas = document.createElement('canvas')

        await new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            video.currentTime = Math.min(1, video.duration / 2) // Seek to 1s or halfway
          }

          video.onseeked = () => {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            const ctx = canvas.getContext('2d')
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

            canvas.toBlob(async (blob) => {
              if (!blob) return reject('Failed to create thumbnail blob.')

              const thumbFileName =
                file.name.replace(/\.[^/.]+$/, '') + '-thumb.jpg'

              const { data: thumbPresign } = await axios.post(
                `${baseURL}s3-presigned-url`,
                {
                  fileName: thumbFileName,
                  fileType: 'image/jpeg',
                }
              )

              const { uploadUrl: thumbUploadUrl } = thumbPresign

              await axios.put(thumbUploadUrl, blob, {
                headers: { 'Content-Type': 'image/jpeg' },
              })

              publicThumbUrl = thumbUploadUrl.split('?')[0]
              resolve(true)
            }, 'image/jpeg')
          }

          video.onerror = () => reject('Error loading video for thumbnail.')
        })
      }

      setFiles((prevs) => {
        const updated = [...prevs]
        updated[index] = {
          type,
          source: publicFileUrl,
          preview: publicThumbUrl,
          width,
          height,
        }
        return updated
      })

      return publicFileUrl
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div
        onClick={closeBox}
        className="w-full fixed h-[100vh] bg-black bg-opacity-30 flex items-end justify-center overflow-hidden z-[40]"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="bg-[var(--primary)] p-3 shadow-lg w-full max-w-[600px]"
        >
          <PostEditor value={text} onChange={(content) => setText(content)} />

          {onPoll && (
            <>
              {polls.map((poll, index) => (
                <div key={index} className="poll_tile">
                  {poll.picture && (
                    <div className="relative h-[40px] w-[50px] min-w-[50px] overflow-hidden mr-2">
                      <Image
                        src={String(poll.picture)}
                        alt="Selected Image"
                        layout="fill"
                        objectFit="cover"
                        className=" rounded-[5px]"
                      />
                    </div>
                  )}
                  <div className="flex-1">{poll.text}</div>
                  <div className="poll_percent">{poll.percent}%</div>
                </div>
              ))}

              <div className="w-full flex relative">
                <div className="mr-4 min-w-[50px] flex flex-col">
                  <label className="relative mb-1 overflow-hidden bg-[var(--white-gray)] h-[40px] w-full  rounded-[5px] flex justify-center items-center cursor-pointer">
                    <Upload className="post_box_icon no active" />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={voteFileUpload}
                    />
                    {pollPicture && (
                      <Image
                        src={pollPicture}
                        alt="Selected Image"
                        layout="fill"
                        objectFit="cover"
                        className="absolute top-0 left-0 w-full h-full rounded-[5px] opacity-80"
                      />
                    )}
                  </label>
                  {pollPercent > 0 && (
                    <progress
                      value={pollPercent}
                      max="100"
                      className="w-full  rounded-[3px] h-[3px] overflow-hidden"
                    />
                  )}
                </div>
                <input
                  value={pollText}
                  onChange={(e) => setPollText(e.target.value)}
                  type="text"
                  placeholder="Enter poll option"
                  className="input_field mr-3"
                />
                <div className="flex items-center cursor-pointer rounded-[5px] justify-center min-w-[40px] bg-[var(--white-gray)]">
                  <Plus
                    onClick={handleAddPoll}
                    className="post_box_icon no active"
                  />
                </div>
              </div>
            </>
          )}

          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="w-full mt-2 h-[200px] overflow-y-scroll"
            >
              <Picker
                data={data}
                onEmojiSelect={addEmoji}
                theme={`${theme}`}
                style={{ width: '100%' }}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {files.map((file, index) => (
              <div key={index} className="w-20">
                <div className="relative w-20 h-20 overflow-hidden rounded-[5px] mb-[-10px]">
                  <button
                    onClick={() => handleRemoveFile(index, file.source)}
                    className="absolute top-1 right-1 z-20 bg-[var(--white-gray)] text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>

                  {file.type.includes('image') ? (
                    file.source ? (
                      <Image
                        src={file.source}
                        alt="Media"
                        width={0}
                        sizes="100vw"
                        height={0}
                        style={{ width: '100%', height: '100%' }}
                        objectFit="cover"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex justify-center items-center">
                        <i className="bi bi-image text-xl text-[var(--custom-color)]"></i>
                      </div>
                    )
                  ) : file.type.includes('video') ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <Image
                        src={file.preview}
                        alt="Media"
                        width={0}
                        sizes="100vw"
                        height={0}
                        style={{ width: '100%', height: '100%' }}
                        objectFit="cover"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-700">
                      <i className="bi bi-play-circle text-xl text-[var(--custom-color)]"></i>
                    </div>
                  )}
                </div>
                {percents.length > 0 && (
                  <progress
                    value={percents[index]}
                    max="100"
                    className="w-full rounded-[3px] h-[3px] overflow-hidden"
                  />
                )}
              </div>
            ))}
          </div>

          {loading ? (
            <>
              <div className="flex items-center mt-4 flex-wrap">
                <button className="custom_btn">
                  <i className="bi bi-opencollective loading  text-md"></i>
                  ...Processing
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center flex-wrap">
                <Smile
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className="post_box_icon active"
                />

                <i
                  onClick={() => setOnPoll((e) => !e)}
                  className="bi bi-border-width post_box_icon active"
                ></i>

                <label className="relative mr-auto">
                  <Upload className="post_box_icon active" />
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                <div className="flex items-center sm:ml-auto">
                  <Save className="post_box_icon active" />
                  {/* <Send className="post_box_icon active" /> */}

                  <button onClick={postMessage} className="custom_btn">
                    Post
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default PostBox
