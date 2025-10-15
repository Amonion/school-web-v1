'use client'
import { getFileType } from '@/lib/helpers'
import {
  Moment,
  MomentMedia,
  MomentMediaEmpty,
  MomentStore,
} from '@/src/zustand/post/Moment'
import {
  Edit,
  ImageIcon,
  Palette,
  Plus,
  Send,
  Smile,
  Trash,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Picker from '@emoji-mart/react'
import { useTheme } from '@/context/ThemeProvider'
import data from '@emoji-mart/data'
import axios from 'axios'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { usePersonalNotificationContext } from '@/context/HomeContext/PersonalNotificationContext'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import Spinner from '@/components/LoadingAnimations/Spinner'
import { usePathname, useRouter } from 'next/navigation'

interface MomentResponse {
  data: Moment
  message: string
}

export default function CreateMoment() {
  const {
    editingIndex,
    momentMedia,
    isEditing,
    moments,
    setIsEditing,
    setShowMoment,
  } = MomentStore()
  const { socket } = usePersonalNotificationContext()
  const { setMessage, baseURL } = MessageStore()
  const [percents, setPercents] = useState(0)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [momentMedias, addMomentMedia] = useState<MomentMedia[]>([])
  const [isColor, setIsColor] = useState(false)
  const [loading, setLoading] = useState(false)
  const [canSend, setCanSend] = useState(false)
  const [canAdd, setCanAdd] = useState(false)
  const [editingMoment, setEditingMoment] = useState(false)
  const [editingMomentId, setEditingMomentId] = useState('')
  const { user } = AuthStore()
  const { setAlert } = AlartStore()
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const colors = [
    '#da3986',
    '#1877F2',
    '#00BFA6',
    '#FF6F00',
    '#F44336',
    'linear-gradient(135deg, #8A2387, #E94057, #F27121)',
  ]

  useEffect(() => {
    const moment = MomentStore.getState().moments.find(
      (item) => item.username === user?.username
    )
    if (moment) {
      addMomentMedia(moment?.media)
      setCanSend(true)
      setEditingMoment(true)
      setEditingMomentId(moment._id)
    }
  }, [pathname, moments])

  useEffect(() => {
    if (momentMedia?.content || momentMedia?.src) {
      setCanAdd(true)
    } else if (!momentMedia?.content && !momentMedia?.src) {
      setCanAdd(false)
    }
    if (momentMedias.length > 0) {
      setCanSend(true)
    } else {
      setCanSend(false)
    }
  }, [momentMedia])

  useEffect(() => {
    if (!socket) return

    socket.on(`moment_${user?.username}`, (data: MomentResponse) => {
      setLoading(false)
      router.push('/home')
      MomentStore.setState((prev) => ({
        moments: [data.data, ...prev.moments],
      }))
      setMessage(data.message, true)
      setShowMoment(false)
      setEditingMoment(false)
    })

    socket.on(`update_moment_${user?.username}`, (data: MomentResponse) => {
      setLoading(false)

      MomentStore.setState((prev) => {
        return {
          isPlaying: true,
          moments: prev.moments.map((item) =>
            item.username === data.data.username ? data.data : item
          ),
        }
      })

      setMessage(data.message, true)
      setShowMoment(false)
      setEditingMoment(false)
    })

    return () => {
      setLoading(false)
      socket.off(`moment_${user?.username}`)
      socket.off(`update_moment_${user?.username}`)
    }
  }, [socket])

  const addEmoji = (emoji: { native: string }) => {
    MomentStore.setState((prev) => {
      return {
        momentMedia: {
          ...prev.momentMedia,
          content: prev.momentMedia.content + emoji.native,
        },
      }
    })
  }

  const selectColor = (color: string) => {
    MomentStore.setState((prev) => {
      return {
        momentMedia: {
          ...prev.momentMedia,
          backgroundColor: color,
        },
      }
    })
    setIsColor(false)
  }

  const getMediaDuration = (): number => {
    let duration = 5

    if (momentMedia.type.includes('video')) {
      duration = Math.min(Math.max(momentMedia.duration, 5), 15)
    } else {
      const textLength = momentMedia.content?.length || 0

      if (textLength <= 0) duration = 5
      else if (textLength <= 100) duration = 6
      else if (textLength <= 200) duration = 8
      else duration = 12
    }
    return duration
  }

  const addMomemt = async () => {
    if (!canAdd) {
      setMessage(
        'Please write or upload content of your moment to share',
        false
      )
      return
    }
    if (isEditing) {
      const duration = getMediaDuration()
      addMomentMedia((prev) => {
        return prev.map((item, index) =>
          editingIndex === index
            ? { ...momentMedia, duration, createdAt: new Date().toISOString() }
            : item
        )
      })
      setIsEditing(false, '', 0)
    } else {
      const duration = getMediaDuration()
      addMomentMedia((prev) => {
        return [
          ...prev,
          { ...momentMedia, duration, createdAt: new Date().toISOString() },
        ]
      })
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    MomentStore.setState((prev) => {
      return {
        momentMedia: {
          ...prev.momentMedia,
          src: '',
          type: '',
          content: '',
          preview: '',
        },
      }
    })
  }

  const editMoment = (index: number) => {
    const m = momentMedias[index]
    MomentStore.setState((prev) => {
      return {
        isEditing: true,
        editingIndex: index,
        momentMedia: {
          ...prev.momentMedia,
          src: m.src,
          preview: m.preview,
          type: m.type,
          content: m.content,
          backgroundColor: m.backgroundColor,
        },
      }
    })
  }

  const submitMoment = async () => {
    if (socket) {
      const formData = {
        to: editingMoment ? 'updateMoment' : 'moment',
        id: editingMomentId,
        displayName: user?.displayName,
        username: user?.username,
        picture: user?.picture,
        media: momentMedias,
      }

      setLoading(true)
      socket.emit('message', formData)
    } else {
      setMessage(`Sorry, something went wrong, refresh and try again.`, false)
    }
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const file = event.target.files[0]
      const type = getFileType(file)
      await uploadFile(file, type)
    }
  }

  const removeMoment = (index: number) => {
    addMomentMedia((prev) => {
      return prev.filter((_, int) => int !== index)
    })
  }

  const uploadFile = async (file: File, type: string) => {
    try {
      setLoading(true)

      let localThumbUrl = ''
      let videoDuration = 0

      if (type.includes('video')) {
        localThumbUrl = await new Promise<string>((resolve, reject) => {
          const video = document.createElement('video')
          video.src = URL.createObjectURL(file)
          video.crossOrigin = 'anonymous'
          video.preload = 'metadata'
          video.muted = true
          video.playsInline = true

          const canvas = document.createElement('canvas')

          video.onloadedmetadata = () => {
            videoDuration = video.duration
            video.currentTime = Math.min(1, video.duration / 2)
          }

          video.onseeked = () => {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
            resolve(canvas.toDataURL('image/jpeg'))
          }

          video.onerror = () => reject('Error generating local thumbnail.')
        })
      }

      MomentStore.setState((prev) => {
        return {
          momentMedia: {
            ...prev.momentMedia,
            type,
            src: '',
            preview: type.includes('video')
              ? localThumbUrl
              : URL.createObjectURL(file),
            isViewed: false,
            content: momentMedia.content,
            ...(type.includes('video') && { duration: videoDuration }),
          },
        }
      })

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
            setPercents(percent)
          }
        },
      })

      const publicFileUrl = fileUploadUrl.split('?')[0]
      let publicThumbUrl = localThumbUrl

      if (type.includes('video')) {
        const blob = await (await fetch(localThumbUrl)).blob()
        const thumbFileName = file.name.replace(/\.[^/.]+$/, '') + '-thumb.jpg'
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

        // setMomentMedia((prev) => ({
        //   ...prev,
        //   src: publicFileUrl,
        //   preview: publicThumbUrl,
        //   duration: videoDuration,
        // }))

        MomentStore.setState((prev) => {
          return {
            momentMedia: {
              ...prev.momentMedia,
              src: publicFileUrl,
              preview: publicThumbUrl,
              duration: videoDuration,
            },
          }
        })
      } else {
        // setMomentMedia((prev) => ({
        //   ...prev,
        //   src: publicFileUrl,
        // }))
        MomentStore.setState((prev) => {
          return {
            momentMedia: {
              ...prev.momentMedia,
              src: publicFileUrl,
            },
          }
        })
      }

      setPercents(0)
      return publicFileUrl
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFile = async (index: number, source: string) => {
    try {
      const fileKey = source.split('.com/')[1]
      await axios.post(`${baseURL}s3-delete-file`, { fileKey })
      addMomentMedia((prevFiles) => prevFiles.filter((_, i) => i !== index))
    } catch (error) {
      console.error('Failed to delete file from S3:', error)
    }
  }

  const clearMoment = () => {
    for (let i = 0; i < momentMedias.length; i++) {
      const el = momentMedias[i]
      if (el.src) {
        handleRemoveFile(i, el.src)
      }
    }
    setShowMoment(false)
    // setMomentMedia(MomentMediaEmpty)
    MomentStore.setState({
      momentMedia: MomentMediaEmpty,
    })
  }

  const handleCloseMoment = () => {
    if (canAdd || canSend) {
      setAlert(
        'Warning',
        'You have changes in your moment that you have not shared, do you want to discard it?',
        true,
        () => clearMoment()
      )
    } else {
      setShowMoment(false)
      MomentStore.setState({
        momentMedia: MomentMediaEmpty,
      })
    }
  }

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (canSend) {
        handleCloseMoment()
      }
      event.preventDefault()
      event.returnValue = ''
    }
    const handlePageHide = (event: BeforeUnloadEvent) => {
      if (canSend) {
        handleCloseMoment()
      }
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [])

  return (
    <>
      <div className="w-full flex flex-col flex-1 sm:pt-3 min-h-full">
        {/* <div className="w-full py-5 flex flex-col"> */}
        <div
          style={{
            backgroundColor: momentMedia.backgroundColor,
            backgroundImage: momentMedia?.preview
              ? `url(${momentMedia.preview})`
              : undefined,
            backgroundSize: momentMedia?.preview ? 'cover' : undefined,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
          className={`w-full sm:min-h-[400px] min-h-[250px] text-white relative  overflow-hidden flex flex-col pb-1 px-2 items-center text-xl`}
        >
          {momentMedias.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 p-3">
              {momentMedias.map((item, index) => (
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
                  className={`w-full h-[110px] relative px-1 text-center border border-white rounded-[5px] overflow-hidden flex justify-center items-center`}
                >
                  <div className="text-white textShadow line-clamp-3 overflow-ellipsis relative my-auto text-[12px] leading-[20px] z-10">
                    {item.content}
                  </div>
                  <div className="absolute flex items-center bottom-1 right-0">
                    <Edit
                      onClick={() => editMoment(index)}
                      size={14}
                      className="mr-3 cursor-pointer textShadow"
                    />
                    <Trash
                      onClick={() => removeMoment(index)}
                      size={14}
                      className="cursor-pointer textShadow"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center px-2 relative my-auto z-10">
            {momentMedia.content ? momentMedia.content : 'Share Your Moment'}
          </div>
          {percents > 0 && (
            <div className="rounded-full z-10 w-full h-1 bg-[var(--primary)] border border-[var(--border)]">
              <div
                style={{ width: `${percents}%` }}
                className="t h-full bg-[var(--success)]"
              ></div>
            </div>
          )}
        </div>
        <div className={`mt-auto bg-[var(--primary)] relative p-2 sm:p-3`}>
          {isColor && (
            <div className="flex absolute -top-7 left-0">
              {colors.map((color, index) => (
                <div
                  onClick={() => selectColor(color)}
                  className="w-5 h-5 cursor-pointer rounded-full mr-3"
                  style={{ backgroundColor: color }}
                  key={index}
                ></div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <label className="cursor-pointer mb-2">
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <ImageIcon size={22} className="text-[var(--custom)]" />
            </label>
            <Palette
              onClick={() => setIsColor(!isColor)}
              size={22}
              className="cursor-pointer mb-2"
            />
            <div
              className={`flex-1 flex items-end bg-[var(--secondary)] rounded-[25px] px-2`}
            >
              <Smile
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="text-[var(--custom)] cursor-pointer mr-2 mb-2"
              />
              <textarea
                placeholder="Add a comment..."
                value={momentMedia.content}
                ref={textareaRef}
                onChange={(e) => {
                  MomentStore.setState((prev) => {
                    return {
                      momentMedia: {
                        ...prev.momentMedia,
                        content: e.target.value,
                      },
                    }
                  })
                  e.target.style.height = 'auto'
                  e.target.style.height = `${Math.min(
                    e.target.scrollHeight,
                    120
                  )}px`
                }}
                rows={1}
                className="flex-1 bg-transparent  py-2 placeholder-gray-400 outline-none  resize-none overflow-y-auto max-h-[120px]"
              />
            </div>

            {loading ? (
              <Spinner size={20} />
            ) : canAdd ? (
              <button onClick={addMomemt} className={`mb-2`}>
                <Plus
                  size={18}
                  className={`${canAdd ? 'text-[var(--custom)]' : ''}`}
                />
              </button>
            ) : (
              momentMedias.length > 0 && (
                <button
                  onClick={submitMoment}
                  disabled={!canSend}
                  className={`mb-2`}
                >
                  <Send size={18} className={`text-[var(--custom)]`} />
                </button>
              )
            )}
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
        {/* </div> */}
      </div>
    </>
  )
}
