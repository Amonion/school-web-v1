'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import {
  formatDateToDDMMYY,
  handleRemoveFile,
  getExtension,
  handleFileUpload,
} from '@/lib/helpers'
import { useParams, usePathname } from 'next/navigation'
import { Smile } from 'lucide-react'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import { UserStore } from '@/src/zustand/user/User'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { MessageStore } from '@/src/zustand/notification/Message'
import { ChatStore, FileType } from '@/src/zustand/chat/Chat'
import ChatEditor from '@/components/Chat/ChatEditor'
import FriendStore from '@/src/zustand/chat/Friend'
import ChatBody from '@/components/Chat/ChatBody'
import Spinner from '@/components/LoadingAnimations/Spinner'
import useSocket from '@/src/useSocket'

const UserChat = () => {
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const { loading } = UserStore()
  const { updateFriendsChat, friendForm } = FriendStore()
  const socket = useSocket()
  const {
    chats,
    moveUp,
    repliedChat,
    connection,
    chatUserForm,
    unseenChatIds,
    unseenCheckIds,
    getSavedChats,
    updateChatsToRead,
    getChats,
    setConnection,
    addNewChat,
  } = ChatStore()
  const { user } = AuthStore()
  const { username } = useParams()
  const [text, setText] = useState('')
  const { baseURL, setMessage } = MessageStore()
  const [files, setFiles] = useState<FileType[]>([])
  // const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setLoading] = useState(false)
  const [isOptions, setOptions] = useState(false)
  const [percents, setPercents] = useState<number[]>([])
  const pathname = usePathname()

  useEffect(() => {
    if (!moveUp) return

    const container = chatContainerRef.current
    if (container) {
      setTimeout(() => {
        container.scrollTop = 0
        ChatStore.setState({
          moveUp: false,
        })
      }, 1000)
    }
  }, [moveUp])

  useEffect(() => {
    return () => {
      ChatStore.setState({
        current: 2,
        newCount: 0,
      })
    }
  }, [])

  //////////////SCROLL DOWN ON NEW CHAT WHEN CLOSE TO BOTTOM//////////////////
  // useEffect(() => {
  //   const container = chatContainerRef.current
  //   if (!container) return

  //   const handleScroll = () => {
  //     const distanceFromBottom =
  //       container.scrollHeight - container.scrollTop - container.clientHeight

  //     setIsNearBottom(distanceFromBottom < 150)
  //   }

  //   container.addEventListener('scroll', handleScroll)
  //   handleScroll()

  //   return () => {
  //     container.removeEventListener('scroll', handleScroll)
  //   }
  // }, [])
  //************SCROLL DOWN ON NEW CHAT WHEN CLOSE TO BOTTOM***************//

  //////////////SCROLL DOWN ON NEW CHAT//////////////////
  // useEffect(() => {
  //   const container = chatContainerRef.current
  //   if (!container) return

  //   const isUserNearBottom = () => {
  //     return (
  //       container.scrollHeight - container.scrollTop - container.clientHeight <
  //       200
  //     )
  //   }

  //   console.log('New chat detected')

  //   const scrollToBottom = () => {
  //     container.scrollTop = container.scrollHeight
  //   }

  //   const shouldScroll = isUserNearBottom()

  //   console.log('scrolling is: ', isUserNearBottom)

  //   if (shouldScroll) {
  //     scrollToBottom()
  //   }

  //   const mediaElements = container.querySelectorAll('img, video')
  //   let pending = 0

  //   const handleLoad = () => {
  //     pending--
  //     if (pending <= 0 && shouldScroll) {
  //       scrollToBottom()
  //     }
  //   }

  //   mediaElements.forEach((el) => {
  //     const media = el as HTMLImageElement | HTMLVideoElement

  //     if (media.tagName === 'IMG') {
  //       const img = media as HTMLImageElement
  //       if (!img.complete) {
  //         pending++
  //         img.addEventListener('load', handleLoad)
  //         img.addEventListener('error', handleLoad)
  //       }
  //     } else if (media.tagName === 'VIDEO') {
  //       const video = media as HTMLVideoElement
  //       if (video.readyState < 3) {
  //         pending++
  //         video.addEventListener('loadeddata', handleLoad)
  //         video.addEventListener('error', handleLoad)
  //       }
  //     }
  //   })

  //   if (pending === 0 && shouldScroll) {
  //     scrollToBottom()
  //   }

  //   return () => {
  //     mediaElements.forEach((el) => {
  //       const media = el as HTMLImageElement | HTMLVideoElement
  //       media.removeEventListener('load', handleLoad)
  //       media.removeEventListener('error', handleLoad)
  //       media.removeEventListener('loadeddata', handleLoad)
  //     })
  //   }
  // }, [chats.length])
  //***********SCROLL DOWN ON NEW CHAT****************//

  //////////////ALLOW FIRST SCROLL DOWN ON CHAT LOAD//////////////////
  // useEffect(() => {
  //   const container = chatContainerRef.current
  //   if (!container) return

  //   const mediaElements = container.querySelectorAll('img, video')
  //   let pending = 0

  //   const scrollToBottom = () => {
  //     container.scrollTop = container.scrollHeight
  //   }

  //   console.log('scrolling down: ', container.scrollHeight)

  //   const handleMediaLoad = () => {
  //     pending--
  //     if (pending <= 0) {
  //       scrollToBottom()
  //     }
  //   }

  //   mediaElements.forEach((media) => {
  //     if (media.tagName === 'IMG') {
  //       const img = media as HTMLImageElement
  //       if (!img.complete) {
  //         pending++
  //         img.addEventListener('load', handleMediaLoad)
  //         img.addEventListener('error', handleMediaLoad)
  //       }
  //     } else if (media.tagName === 'VIDEO') {
  //       const video = media as HTMLVideoElement
  //       if (video.readyState < 3) {
  //         pending++
  //         video.addEventListener('loadeddata', handleMediaLoad)
  //         video.addEventListener('error', handleMediaLoad)
  //       }
  //     }
  //   })

  //   if (pending === 0) {
  //     setTimeout(() => {
  //       scrollToBottom()
  //     }, 100)
  //   }

  //   return () => {
  //     mediaElements.forEach((media) => {
  //       media.removeEventListener('load', handleMediaLoad)
  //       media.removeEventListener('error', handleMediaLoad)
  //       media.removeEventListener('loadeddata', handleMediaLoad)
  //     })
  //   }
  // }, [chats, current, pathname])
  //***********ALLOW FIRST SCROLL DOWN ON CHAT LOAD****************//

  //////////////FETCH OLDER CHATS WHEN USER SCROLL UP//////////////////
  // useEffect(() => {
  //   const container = chatContainerRef.current
  //   if (!container) return

  //   const handleScroll = () => {
  //     if (container.scrollTop === 0 && user) {
  //       handleFetchOlderChats(user)
  //     }
  //   }

  //   container.addEventListener('scroll', handleScroll)

  //   if (username && user) {
  //     const key = setConnectionKey(String(username), String(user?.username))
  //     setConnection(key)
  //     getSavedChats(key)
  //     getChats(
  //       `/chats/?connection=${key}&page_size=10&page=1&ordering=-createdAt&deletedUsername[ne]=${user.username}&username=${user.username}`,
  //       setMessage
  //     )
  //   }

  //   return () => container.removeEventListener('scroll', handleScroll)
  // }, [username, user, pathname])
  //***********FETCH OLDER CHATS WHEN USER SCROLL UP****************//

  useEffect(() => {
    if (username && user) {
      const key = setConnectionKey(String(username), String(user?.username))
      setConnection(key)
      getSavedChats(key)
      getChats(
        `/chats/?connection=${key}&page_size=40&page=1&ordering=-createdAt&deletedUsername[ne]=${user.username}&username=${user.username}`,
        setMessage
      )
    }
  }, [username, user, pathname])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (unseenChatIds.length > 0) {
        updateChatStatus()
        updateChatsToRead(unseenChatIds, connection)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [unseenChatIds])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (unseenCheckIds.length > 0) {
        checkChatStatus()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [unseenCheckIds])

  const updateChatStatus = () => {
    if (socket) {
      const form = {
        to: 'read',
        ids: unseenChatIds,
        senderUsername: chatUserForm.username,
        receiverUsername: user?.username,
        connection: connection,
      }

      socket.emit('message', form)
    }
  }

  const checkChatStatus = () => {
    if (socket) {
      const form = {
        to: 'checkRead',
        ids: unseenCheckIds,
        senderUsername: user?.username,
        connection: connection,
      }

      socket.emit('message', form)
    }
  }

  const setConnectionKey = (id1: string, id2: string) => {
    const participants = [id1, id2].sort()
    return participants.join('')
  }

  const removeFile = async (index: number, source: string) => {
    handleRemoveFile(index, source, baseURL, setFiles)
  }

  const getPdfPageCount = async (file: File | undefined): Promise<number> => {
    GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js'

    const fileExtension = file?.name.split('.').pop()?.toLowerCase()

    if (fileExtension !== 'pdf') {
      return 0
    }

    if (typeof window === 'undefined') throw new Error('Client-side only')

    if (file) {
      try {
        const pdf = await getDocument(URL.createObjectURL(file)).promise
        return pdf.numPages
      } catch (error) {
        console.error('Error getting PDF page count:', error)
        return 0
      }
    } else {
      return 0
    }
  }

  const getMediaDuration = async (
    files: FileList | File[] | undefined | null
  ): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return reject('No window')
      if (!files || files.length === 0) return resolve(0)

      const file = files[0]
      const type = file.type

      const isMedia = type.startsWith('audio') || type.startsWith('video')

      if (!isMedia) return resolve(0)

      const url = URL.createObjectURL(file)
      const media = document.createElement(
        type.startsWith('audio') ? 'audio' : 'video'
      )

      media.preload = 'metadata'
      media.onloadedmetadata = () => {
        URL.revokeObjectURL(url)
        resolve(media.duration)
      }
      media.onerror = () => reject('Could not load media duration.')
      media.src = url
    })
  }

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filePages = await getPdfPageCount(e.target.files?.[0])
    const duration = await getMediaDuration(e.target.files)
    await handleFileUpload(
      e,
      baseURL,
      setFiles,
      setPercents,
      setLoading,
      filePages,
      duration
    )
  }

  const postMessage = () => {
    if (text.trim().length === 0 && files.length === 0) {
      setMessage(`No message to send to `, false)
      return
    }

    if (socket) {
      const timeNumber = new Date().getTime()

      const form = {
        to: 'chat',
        action: 'post',
        content: text,
        day: formatDateToDDMMYY(new Date()),
        connection: connection,
        repliedChat: repliedChat,
        isFriends: friendForm.isFriends,
        senderDisplayName: String(user?.displayName),
        senderUsername: String(user?.username),
        senderPicture: String(user?.picture),
        receiverUsername: chatUserForm.username,
        receiverPicture: String(chatUserForm.picture),
        receiverDisplayName: chatUserForm.displayName,
        senderTime: new Date().toISOString(),
        time: new Date().getTime(),
        timeNumber: timeNumber,
        media: files,
      }

      const friendChat = {
        content: text,
        connection: connection,
        senderDisplayName: String(user?.displayName),
        senderUsername: String(user?.username),
        senderPicture: String(user?.picture),
        receiverUsername: chatUserForm.username,
        receiverPicture: String(chatUserForm.picture),
        receiverDisplayName: chatUserForm.displayName,
        status: 'pending',
        senderTime: new Date().toISOString(),
        timeNumber: timeNumber,
        createdAt: new Date(),
        media: files,
        isFriends: friendForm.isFriends,
        isOnline: false,
      }

      const saved = {
        connection: connection,
        content: form.content,
        repliedChat: form.repliedChat,
        senderUsername: String(user?.username),
        media: form.media,
        day: form.day,
        receiverUsername: form.receiverUsername,
        status: 'pending',
        senderTime: new Date(),
        createdAt: new Date(),
        timeNumber: timeNumber,
        receiverTime: new Date(),
      }

      if (
        !friendForm.isFriends &&
        chats.length > 0 &&
        user?.username === chats[0].receiverUsername
      ) {
        FriendStore.setState((prev) => {
          return {
            friendForm: { ...prev.friendForm, isFriends: true },
          }
        })
      }

      updateFriendsChat(friendChat)
      addNewChat(saved)
      socket.emit('message', form)
      setFiles([])
      setText('')

      ChatStore.setState(() => {
        return {
          repliedChat: null,
        }
      })
    } else {
      setMessage(`Sorry, something went wrong, refresh and try again.`, false)
    }
  }

  return (
    <>
      <div className="flex-1 sm:px-0 px-1 relative">
        <ChatBody />
      </div>

      <div className="w-full sticky bottom-0 left-0 flex items-end bg-[var(--primary)] py-1 px-2">
        <div className="flex flex-1 relative flex-col">
          <div className="flex items-end bg-[var(--secondary)] rounded-[25px] px-2">
            <div
              className={`${
                isOptions ? 'flex' : 'hidden'
              } sm:relative sm:left-auto sm:top-auto sm:flex  absolute left-2 -top-8 mb-2 items-center`}
            >
              <label className="relative mr-3 cursor-pointer">
                <i className="bi bi-images text-lg"></i>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={uploadFile}
                />
              </label>
              <label className="relative mr-3 cursor-pointer">
                <i className="bi bi-music-note-beamed text-lg"></i>
                <input
                  type="file"
                  accept=".mp3"
                  className="hidden"
                  onChange={uploadFile}
                />
              </label>
              <label className="relative  cursor-pointer">
                <i className="bi bi-filetype-doc text-lg"></i>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.xlsx,.txt"
                  className="hidden"
                  onChange={uploadFile}
                />
              </label>
            </div>
            <i
              onClick={() => setOptions(!isOptions)}
              className="bi bi-three-dots-vertical sm:hidden mb-[10px] cursor-pointer"
            ></i>
            <ChatEditor value={text} onChange={(content) => setText(content)} />
            {loading || isLoading ? (
              <Spinner size={30} />
            ) : (
              <div className="flex items-center mb-3">
                <Smile className="w-5 h-5 cursor-pointer text-[var(--custom)] ml-2" />
                {(files.length > 0 ||
                  text.replace(/<[^>]*>/g, '').trim().length > 0) && (
                  <i
                    onClick={postMessage}
                    className="bi bi-send ml-2 text-[var(--custom)] rotate-45 inline-block cursor-pointer"
                  />
                )}
              </div>
            )}
          </div>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {files.map((file, index) => (
                <div key={index} className="w-11">
                  <div className="relative w-11 h-11 overflow-hidden rounded-[5px] mb-[-10px]">
                    <button
                      onClick={() => removeFile(index, file.source)}
                      className="absolute top-1 right-1 z-20 bg-[var(--white-gray)] text-white rounded-full p-1 w-3 h-3 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>

                    {file.type === 'picture' ? (
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
                    ) : file.type === 'video' ? (
                      <div className="flex items-center justify-center w-full h-full">
                        <video
                          src={file.source}
                          className="w-full h-full object-cover rounded-lg"
                          muted
                          loop
                          playsInline
                        ></video>
                      </div>
                    ) : file.type === 'document' ? (
                      <Image
                        src={getExtension(
                          file.source
                            .substring(file.source.lastIndexOf('.'))
                            .slice(1)
                        )}
                        alt="Media"
                        width={0}
                        sizes="100vw"
                        height={0}
                        style={{ width: '100%', height: '100%' }}
                        objectFit="cover"
                        className="object-cover w-full h-full"
                      />
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
          )}
        </div>
      </div>
    </>
  )
}

export default UserChat
