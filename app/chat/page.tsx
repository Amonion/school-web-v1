'use client'
import ChatBody from '@/components/Chat/ChatBody'
import ChatEditor from '@/components/Chat/ChatEditor'
import ChatHead from '@/components/Chat/ChatHead'
import useSocket from '@/src/useSocket'
import { ChatStore, PreviewFile } from '@/src/zustand/chat/Chat'
import FriendStore from '@/src/zustand/chat/Friend'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { Plus, Smile } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MessageStore } from '@/src/zustand/notification/Message'
import { formatDateToDDMMYY, getPdfPageCount } from '@/lib/helpers'
import ChatActions from '@/components/Chat/ChatActions'
import NoFriends from '@/components/Chat/NoFriends'

const Chats = () => {
  const { updateFriendsChat, friendForm } = FriendStore()
  const socket = useSocket()
  const {
    chats,
    activeChat,
    repliedChat,
    connection,
    chatUserForm,
    unseenChatIds,
    unseenCheckIds,
    username,
    postChat,
    getSavedChats,
    updateChatsToRead,
    getChats,
    setConnection,
    addNewChat,
  } = ChatStore()
  const { user } = AuthStore()
  const [text, setText] = useState('')
  const { setMessage } = MessageStore()
  //   const [files, setFiles] = useState<FileType[]>([])
  // const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isOptions, setOptions] = useState(false)
  const pathname = usePathname()
  const [files, setFiles] = useState<PreviewFile[]>([])

  useEffect(() => {
    return () => {
      ChatStore.setState({
        current: 2,
        newCount: 0,
        connection: '',
      })
    }
  }, [])

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
  }, [unseenChatIds.length])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (unseenCheckIds.length > 0) {
        checkChatStatus()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [unseenCheckIds.length])

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
      ChatStore.setState({
        unseenChatIds: [],
      })
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
      ChatStore.setState({
        unseenCheckIds: [],
      })
    }
  }

  const setConnectionKey = (id1: string, id2: string) => {
    const participants = [id1, id2].sort()
    return participants.join('')
  }

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newList = [...prev]

      const fileToRemove = newList[index]
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl)
      }

      newList.splice(index, 1)
      return newList
    })
  }

  const serializeFiles = async (files: File[]) => {
    const serialized = await Promise.all(
      files.map(async (file, index) => {
        const buffer = await file.arrayBuffer()
        const blob = new Blob([buffer], { type: file.type })
        const previewUrl = URL.createObjectURL(blob)

        return {
          index,
          file,
          name: file.name,
          type: file.type,
          size: file.size,
          status: 'pending', // will become "uploaded" later
          blob,
          previewUrl, // for local preview
          url: '', // ✅ empty now, to be filled with bucket URL later
        } as PreviewFile
      })
    )

    return serialized
  }

  const handleSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return

    setOptions(false)

    const filesArray = Array.from(selectedFiles)

    const newFiles: PreviewFile[] = await Promise.all(
      filesArray.map(async (file, index) => {
        const url = URL.createObjectURL(file)

        const type = file.type.startsWith('video')
          ? 'video'
          : file.type.startsWith('image')
          ? 'image'
          : file.type.startsWith('audio')
          ? 'audio'
          : 'other'

        const name = file.name.replace(/\.[^/.]+$/, '')
        const size = +(file.size / (1024 * 1024)).toFixed(2)
        const status = 'pending'
        let pages = 0

        if (file.type === 'application/pdf') {
          try {
            pages = await getPdfPageCount(file)
          } catch (error) {
            console.error('Error getting PDF pages:', error)
          }
        }

        return {
          index,
          file,
          url,
          previewUrl: url,
          name,
          type,
          status,
          size,
          pages,
        } as PreviewFile
      })
    )

    // preserve existing indices, append new ones correctly
    setFiles((prev) => {
      const baseIndex = prev.length
      const indexedFiles = newFiles.map((f, i) => ({
        ...f,
        index: baseIndex + i,
      }))
      return [...prev, ...indexedFiles]
    })
  }

  const postMessage = async () => {
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
        updatedAt: new Date(),
        timeNumber: timeNumber,
        media: await serializeFiles(
          files.map((f) => f.file).filter((f): f is File => f instanceof File)
        ),
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
        updatedAt: new Date(),
        media: files,
        isFriends: friendForm.isFriends,
        isOnline: false,
      }

      const saved = {
        connection: connection,
        content: form.content,
        repliedChat: form.repliedChat,
        senderUsername: String(user?.username),
        media: await serializeFiles(
          files.map((f) => f.file).filter((f): f is File => f instanceof File)
        ),
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
      if (files.length > 0) {
        postChat('/chats', form, setMessage)
      } else {
        socket.emit('message', form)
      }
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
      {/* <div className="fixed bottom-[55px] sm:bottom-0 sm:pt-[0px] pt-[120px] inset-0 sm:relative sm:h-[85vh] sm:rounded-[10px] bg-[var(--secondary)] flex flex-col"> */}
      {username ? (
        <div className="flex-1 sm:relative w-full sm:h-[100vh] sm:overflow-hidden overflow-auto relative sm:pb-1 flex flex-col">
          <div className="sticky z-30 left-0 py-2 top-0 w-full bg-[var(--primary)] mb-2 h-[65px]">
            <ChatHead />
          </div>

          {files.length > 0 && (
            <div
              className={`grid ${
                files.length === 1
                  ? 'w-[300px]'
                  : files.length > 1
                  ? 'grid-cols-2'
                  : ''
              } absoluteCenter z-40 p-3 rounded-[10px] overflow-hidden bg-[var(--primary)] gap-2 mb-3`}
            >
              {files.map((item, index) => (
                <div
                  key={index}
                  className="relative group rounded-lg overflow-hidden"
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.previewUrl}
                      alt={item.url}
                      className="w-full h-h-[300px] object-cover"
                    />
                  ) : (
                    item.type === 'video' && (
                      <video
                        src={item.previewUrl}
                        className="w-full h-h-[300px] object-cover"
                        muted
                        onLoadedMetadata={(e) =>
                          (files[index].duration = e.currentTarget.duration)
                        }
                      />
                    )
                  )}

                  {/* 🔹 Type icon (image/video/file) */}
                  <div className="absolute top-1 left-1 bg-black/60 text-white rounded-full h-6 w-6 flex items-center justify-center text-[10px]">
                    {item.type === 'image' ? (
                      <i className="bi bi-image"></i> // 🖼️ Image icon
                    ) : item.type === 'video' ? (
                      <i className="bi bi-camera-video"></i> // 🎥 Video icon
                    ) : (
                      <i className="bi bi-file-earmark"></i> // 📄 File icon
                    )}
                  </div>

                  {/* ❌ Remove button */}
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    onClick={() => removeFile(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 sm:px-0 px-1 relative">
            <ChatBody />
          </div>

          {activeChat.timeNumber > 0 && <ChatActions e={activeChat} />}

          <div className="w-full fixed sm:sticky bottom-0 left-0 flex items-end bg-[var(--primary)] py-1 px-2">
            <div className="flex flex-1 relative flex-col">
              <div className="flex items-end bg-[var(--secondary)] rounded-[25px] px-2">
                {isOptions && (
                  <div
                    className={`rounded-[10px] bg-[var(--primary)] overflow-hidden border border-[var(--border)] z-20 absolute left-1 bottom-14 mb-2`}
                  >
                    <label className="flex relative hover:bg-[var(--secondary)] items-center p-3 cursor-pointer">
                      <i className="bi bi-images text-lg mr-3"></i>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleSelectFiles}
                      />
                      Upload Images & Videos
                    </label>

                    <label className="flex relative hover:bg-[var(--secondary)] items-center p-3 cursor-pointer">
                      <i className="bi bi-music-note-beamed text-lg mr-3"></i>
                      <input
                        type="file"
                        accept=".mp3"
                        className="hidden"
                        onChange={handleSelectFiles}
                      />
                      Upload Sound
                    </label>

                    <label className="flex relative  hover:bg-[var(--secondary)] items-center p-3 cursor-pointer">
                      <i className="bi bi-filetype-doc text-lg mr-3"></i>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.xlsx,.txt"
                        className="hidden"
                        onChange={handleSelectFiles}
                      />
                      Upload Documents
                    </label>
                  </div>
                )}

                <Plus
                  onClick={() => setOptions(!isOptions)}
                  className="mb-[10px] cursor-pointer"
                />
                <ChatEditor
                  value={text}
                  onChange={(content) => setText(content)}
                />
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
              </div>
            </div>
          </div>
        </div>
      ) : (
        <NoFriends />
      )}
    </>
  )
}

export default Chats
