// 'use client'
// import Image from 'next/image'
// import { useEffect, useRef, useState } from 'react'
// import {
//   formatDateToDDMMYY,
//   handleRemoveFile,
//   getExtension,
//   handleFileUpload,
// } from '@/lib/helpers'
// import { useParams, usePathname } from 'next/navigation'
// import { Smile } from 'lucide-react'
// import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
// import { User, UserStore } from '@/src/zustand/user/User'
// import { useGeneralContext } from '@/context/GeneralContext'
// import { AuthStore } from '@/src/zustand/user/AuthStore'
// import { MessageStore } from '@/src/zustand/notification/Message'
// import { ChatContent, ChatStore, FileType } from '@/src/zustand/chat/Chat'
// import ChatEditor from '@/components/Chat/ChatEditor'
// import FriendStore from '@/src/zustand/chat/Friend'
// // import ChatBody from '@/components/Chat/ChatBody'

// type response = {
//   message: string
//   key: string
//   totalUnread: number
//   receiverId: string
//   userId: string
//   username: string
//   data: ChatContent
//   chats: ChatContent[]
// }

// const UserChat = () => {
//   const chatContainerRef = useRef<HTMLDivElement | null>(null)
//   const { userForm, loading } = UserStore()
//   const { addFriendsChat } = FriendStore()
//   const { socket } = useGeneralContext()
//   const {
//     chatResults,
//     getChats,
//     current,
//     chatContentResults,
//     unread,
//     moveUp,
//     repliedChat,
//     isFriends,
//     addNewChat,
//     updateChats,
//   } = ChatStore()
//   const { user } = AuthStore()
//   const { _id } = useParams()
//   const { username } = useParams()
//   const [text, setText] = useState('')
//   const [connection, setConnection] = useState('')
//   const { baseURL, setMessage, online } = MessageStore()
//   const [files, setFiles] = useState<FileType[]>([])
//   // const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [isOptions, setOptions] = useState(false)
//   const [isNearBottom, setIsNearBottom] = useState(false)
//   const [isLoading, setLoading] = useState(false)
//   const [percents, setPercents] = useState<number[]>([])
//   const pathname = usePathname()
//   const pendingReadIds = useRef<Set<string>>(new Set())

//   useEffect(() => {
//     if (!moveUp) return

//     const container = chatContainerRef.current
//     if (container) {
//       setTimeout(() => {
//         container.scrollTop = 0
//         ChatStore.setState({
//           moveUp: false,
//         })
//       }, 1000)
//     }
//   }, [moveUp])

//   useEffect(() => {
//     return () => {
//       ChatStore.setState({
//         current: 2,
//         newCount: 0,
//       })
//     }
//   }, [])

//   //////////////SCROLL DOWN ON NEW CHAT WHEN CLOSE TO BOTTOM//////////////////
//   useEffect(() => {
//     const container = chatContainerRef.current
//     if (!container) return

//     const handleScroll = () => {
//       const distanceFromBottom =
//         container.scrollHeight - container.scrollTop - container.clientHeight

//       setIsNearBottom(distanceFromBottom < 150)
//     }

//     container.addEventListener('scroll', handleScroll)
//     handleScroll()

//     return () => {
//       container.removeEventListener('scroll', handleScroll)
//     }
//   }, [])
//   //************SCROLL DOWN ON NEW CHAT WHEN CLOSE TO BOTTOM***************//

//   //////////////SCROLL DOWN ON NEW CHAT//////////////////
//   useEffect(() => {
//     const container = chatContainerRef.current
//     if (!container) return

//     const isUserNearBottom = () => {
//       return (
//         container.scrollHeight - container.scrollTop - container.clientHeight <
//         200
//       )
//     }

//     const scrollToBottom = () => {
//       container.scrollTop = container.scrollHeight
//     }

//     const shouldScroll = isUserNearBottom()

//     if (shouldScroll) {
//       scrollToBottom()
//     }

//     const mediaElements = container.querySelectorAll('img, video')
//     let pending = 0

//     const handleLoad = () => {
//       pending--
//       if (pending <= 0 && shouldScroll) {
//         scrollToBottom()
//       }
//     }

//     mediaElements.forEach((el) => {
//       const media = el as HTMLImageElement | HTMLVideoElement

//       if (media.tagName === 'IMG') {
//         const img = media as HTMLImageElement
//         if (!img.complete) {
//           pending++
//           img.addEventListener('load', handleLoad)
//           img.addEventListener('error', handleLoad)
//         }
//       } else if (media.tagName === 'VIDEO') {
//         const video = media as HTMLVideoElement
//         if (video.readyState < 3) {
//           pending++
//           video.addEventListener('loadeddata', handleLoad)
//           video.addEventListener('error', handleLoad)
//         }
//       }
//     })

//     if (pending === 0 && shouldScroll) {
//       scrollToBottom()
//     }

//     return () => {
//       mediaElements.forEach((el) => {
//         const media = el as HTMLImageElement | HTMLVideoElement
//         media.removeEventListener('load', handleLoad)
//         media.removeEventListener('error', handleLoad)
//         media.removeEventListener('loadeddata', handleLoad)
//       })
//     }
//   }, [chatContentResults.length])
//   //***********SCROLL DOWN ON NEW CHAT****************//

//   //////////////ALLOW FIRST SCROLL DOWN ON CHAT LOAD//////////////////
//   useEffect(() => {
//     const container = chatContainerRef.current
//     if (!container || current !== 2) return

//     const mediaElements = container.querySelectorAll('img, video')
//     let pending = 0

//     const scrollToBottom = () => {
//       container.scrollTop = container.scrollHeight
//     }

//     const handleMediaLoad = () => {
//       pending--
//       if (pending <= 0) {
//         scrollToBottom()
//       }
//     }

//     mediaElements.forEach((media) => {
//       if (media.tagName === 'IMG') {
//         const img = media as HTMLImageElement
//         if (!img.complete) {
//           pending++
//           img.addEventListener('load', handleMediaLoad)
//           img.addEventListener('error', handleMediaLoad)
//         }
//       } else if (media.tagName === 'VIDEO') {
//         const video = media as HTMLVideoElement
//         if (video.readyState < 3) {
//           pending++
//           video.addEventListener('loadeddata', handleMediaLoad)
//           video.addEventListener('error', handleMediaLoad)
//         }
//       }
//     })

//     // ✨ Key fix: small delay to wait for DOM updates
//     if (pending === 0) {
//       setTimeout(() => {
//         scrollToBottom()
//       }, 100) // 100ms is enough
//     }

//     return () => {
//       mediaElements.forEach((media) => {
//         media.removeEventListener('load', handleMediaLoad)
//         media.removeEventListener('error', handleMediaLoad)
//         media.removeEventListener('loadeddata', handleMediaLoad)
//       })
//     }
//   }, [chatResults, chatContentResults, current, pathname])
//   //***********ALLOW FIRST SCROLL DOWN ON CHAT LOAD****************//

//   //////////////FETCH OLDER CHATS WHEN USER SCROLL UP//////////////////
//   useEffect(() => {
//     const container = chatContainerRef.current
//     if (!container) return

//     const handleScroll = () => {
//       if (container.scrollTop === 0 && user) {
//         handleFetchOlderChats(user)
//       }
//     }

//     container.addEventListener('scroll', handleScroll)

//     if (username && user) {
//       const key = setConnectionKey(String(username), String(user?.username))
//       setConnection(key)

//       getChats(
//         `/user-messages/user-chats/?connection=${key}&page_size=10&page=1&ordering=-createdAt&deletedUsername[ne]=${user.username}&username=${user.username}`,
//         setMessage
//       )
//     }

//     return () => container.removeEventListener('scroll', handleScroll)
//   }, [username, user])
//   //***********FETCH OLDER CHATS WHEN USER SCROLL UP****************//

//   //////////////LISTEN TO SENT & RECEIVED CHAT//////////////////
//   useEffect(() => {
//     if (!socket) return

//     if (user) {
//       socket.on(`createdChat${connection}`, (data: response) => {
//         if (data.message === 'online') {
//           updateChats([data.data], data.message)
//         } else {
//           addNewChat(data.data)
//         }

//         if (data.data.receiverUsername === user.username) {
//           pendingReadIds.current.add(data.data._id)
//         }
//       })
//     }

//     return () => {
//       setLoading(false)
//       socket.off(`createdChat${connection}`)
//     }
//   }, [user, socket])
//   //***********LISTEN TO SENT & RECEIVED CHAT****************//

//   const handleFetchOlderChats = async (user: User) => {
//     const container = chatContainerRef.current
//     if (!container) return

//     const prevScrollHeight = container.scrollHeight
//     const key = setConnectionKey(String(username), String(user.username))

//     await ChatStore.getState().addChats(
//       `/user-messages/user-chats/?connection=${key}&page_size=10&ordering=-createdAt&username=${user.username}&deletedUsername[ne]=${user.username}`,
//       setMessage
//     )

//     requestAnimationFrame(() => {
//       const newScrollHeight = container.scrollHeight
//       const scrollDiff = newScrollHeight - prevScrollHeight

//       container.scrollTop = scrollDiff
//     })
//   }

//   const setConnectionKey = (id1: string, id2: string) => {
//     const participants = [id1, id2].sort()
//     return participants.join('')
//   }

//   const scrollDown = () => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTo({
//         top: chatContainerRef.current.scrollHeight,
//         behavior: 'smooth',
//       })
//     }
//   }

//   const removeFile = async (index: number, source: string) => {
//     handleRemoveFile(index, source, baseURL, setFiles)
//   }

//   const getPdfPageCount = async (file: File | undefined): Promise<number> => {
//     GlobalWorkerOptions.workerSrc =
//       'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js'

//     const fileExtension = file?.name.split('.').pop()?.toLowerCase()

//     if (fileExtension !== 'pdf') {
//       return 0
//     }

//     if (typeof window === 'undefined') throw new Error('Client-side only')

//     if (file) {
//       try {
//         const pdf = await getDocument(URL.createObjectURL(file)).promise
//         return pdf.numPages
//       } catch (error) {
//         console.error('Error getting PDF page count:', error)
//         return 0
//       }
//     } else {
//       return 0
//     }
//   }

//   const getMediaDuration = async (
//     files: FileList | File[] | undefined | null
//   ): Promise<number> => {
//     return new Promise((resolve, reject) => {
//       if (typeof window === 'undefined') return reject('No window')
//       if (!files || files.length === 0) return resolve(0)

//       const file = files[0]
//       const type = file.type

//       const isMedia = type.startsWith('audio') || type.startsWith('video')

//       if (!isMedia) return resolve(0)

//       const url = URL.createObjectURL(file)
//       const media = document.createElement(
//         type.startsWith('audio') ? 'audio' : 'video'
//       )

//       media.preload = 'metadata'
//       media.onloadedmetadata = () => {
//         URL.revokeObjectURL(url)
//         resolve(media.duration)
//       }
//       media.onerror = () => reject('Could not load media duration.')
//       media.src = url
//     })
//   }

//   const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     setOptions(false)
//     const filePages = await getPdfPageCount(e.target.files?.[0])
//     const duration = await getMediaDuration(e.target.files)
//     await handleFileUpload(
//       e,
//       baseURL,
//       setFiles,
//       setPercents,
//       setLoading,
//       filePages,
//       duration
//     )
//   }

//   const postMessage = () => {
//     if (text.trim().length === 0 && files.length === 0) {
//       setMessage(`No message to send to `, false)
//       return
//     }
//     if (socket) {
//       const form = {
//         to: 'chat',
//         action: 'post',
//         content: text,
//         day: formatDateToDDMMYY(new Date()),
//         connection: connection,
//         repliedChat: repliedChat,
//         username: user?.username,
//         picture: user?.picture,
//         userId: user?._id,
//         receiverUsername: userForm.username,
//         receiverPicture: userForm.picture,
//         receiverId: _id,
//         senderTime: new Date().toISOString(),
//         time: new Date().getTime(),
//         media: files,
//       }

//       if (online) {
//         socket.emit('message', form)
//         setFiles([])
//         setText('')
//       } else {
//         const saved = {
//           _id: form.senderTime,
//           connection: connection,
//           content: form.content,
//           isSent: false,
//           isRead: false,
//           deletedUsername: '',
//           repliedChat: form.repliedChat,
//           isSavedUsernames: [],
//           isReadUsernames: [],
//           isPinned: false,
//           isFriends: isFriends,
//           userId: String(user?._id),
//           username: String(user?.username),
//           picture: String(user?.picture),
//           media: form.media,
//           day: form.day,
//           receiverUsername: form.receiverUsername,
//           receiverPicture: String(form.receiverPicture),
//           message: 'online',
//           from: 'friends',
//           unread: 0,
//           unreadCount: 0,
//           unreadReceiver: 0,
//           unreadUser: 0,
//           receiverId: String(form.receiverId),
//           senderTime: new Date(),
//           createdAt: new Date(),
//           time: new Date(),
//           timeNumber: new Date().getTime(),
//           receiverTime: new Date(),
//         }

//         addFriendsChat(saved)

//         addNewChat(saved)

//         const pending = JSON.parse(
//           localStorage.getItem('pendingMessages') || '[]'
//         )
//         form.action = `online`
//         localStorage.setItem(
//           'pendingMessages',
//           JSON.stringify([...pending, form])
//         )
//         setFiles([])
//         setText('')
//       }

//       ChatStore.setState(() => {
//         return {
//           repliedChat: null,
//         }
//       })
//     } else {
//       setMessage(`Sorry, something went wrong, refresh and try again.`, false)
//     }
//   }

//   return (
//     <>
//       <div
//         ref={chatContainerRef}
//         className="flex-1 sm:px-[5px] overflow-auto chat_scrollbar"
//       >
//         {/* <ChatBody /> */}
//         {/* <ChatBody socket={socket} pendingReadIds={pendingReadIds} /> */}
//       </div>

//       <div className="w-full mt-auto relative flex items-end bg-[var(--primary)] py-1 pr-[20px] pl-[10px]">
//         {!isNearBottom && unread > 0 && (
//           <div
//             onClick={scrollDown}
//             className="cursor-pointer w-[20px] h-[20px] border border-[var(--border)] text-[10px] text-white rounded-full flex items-center justify-center bg-[var(--custom)] absolute left-[10px] top-[-40px]"
//           >
//             {unread < 100 ? unread : '99+'}
//           </div>
//         )}

//         {!isNearBottom && (
//           <div
//             onClick={scrollDown}
//             className="cursor-pointer w-8 h-8 border border-[var(--border)] rounded-full flex items-center justify-center bg-[var(--primary)] absolute right-[10px] top-[-40px]"
//           >
//             <i className="bi bi-arrow-down"></i>
//           </div>
//         )}
//         <div className="flex flex-1 flex-col mr-2">
//           <ChatEditor value={text} onChange={(content) => setText(content)} />
//           {files.length > 0 && (
//             <div className="flex flex-wrap gap-2 mt-2">
//               {files.map((file, index) => (
//                 <div key={index} className="w-11">
//                   <div className="relative w-11 h-11 overflow-hidden rounded-[5px] mb-[-10px]">
//                     <button
//                       onClick={() => removeFile(index, file.source)}
//                       className="absolute top-1 right-1 z-20 bg-[var(--white-gray)] text-white rounded-full p-1 w-3 h-3 flex items-center justify-center text-xs"
//                     >
//                       ✕
//                     </button>

//                     {file.type === 'picture' ? (
//                       file.source ? (
//                         <Image
//                           src={file.source}
//                           alt="Media"
//                           width={0}
//                           sizes="100vw"
//                           height={0}
//                           style={{ width: '100%', height: '100%' }}
//                           objectFit="cover"
//                           className="object-cover w-full h-full"
//                         />
//                       ) : (
//                         <div className="w-full h-full bg-gray-700 flex justify-center items-center">
//                           <i className="bi bi-image text-xl text-[var(--custom-color)]"></i>
//                         </div>
//                       )
//                     ) : file.type === 'video' ? (
//                       <div className="flex items-center justify-center w-full h-full">
//                         <video
//                           src={file.source}
//                           className="w-full h-full object-cover rounded-lg"
//                           muted
//                           loop
//                           playsInline
//                         ></video>
//                       </div>
//                     ) : file.type === 'document' ? (
//                       <Image
//                         src={getExtension(
//                           file.source
//                             .substring(file.source.lastIndexOf('.'))
//                             .slice(1)
//                         )}
//                         alt="Media"
//                         width={0}
//                         sizes="100vw"
//                         height={0}
//                         style={{ width: '100%', height: '100%' }}
//                         objectFit="cover"
//                         className="object-cover w-full h-full"
//                       />
//                     ) : (
//                       <div className="flex items-center justify-center w-full h-full bg-gray-700">
//                         <i className="bi bi-play-circle text-xl text-[var(--custom-color)]"></i>
//                       </div>
//                     )}
//                   </div>
//                   {percents.length > 0 && (
//                     <progress
//                       value={percents[index]}
//                       max="100"
//                       className="w-full rounded-[3px] h-[3px] overflow-hidden"
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//         <div className="flex items-end">
//           {loading || isLoading ? (
//             <div className="flex justify-center items-center w-6 h-6">
//               <i className="bi bi-opencollective activeLoader"></i>
//             </div>
//           ) : (
//             <>
//               <div className="relative flex items-end">
//                 {isOptions && (
//                   <div className="absolute right-0 bottom-[0px] flex items-center bg-[var(--primary)] px-2 py-1 rounded-[5px] border border-[var(--border)]">
//                     <label className="relative px-2 cursor-pointer">
//                       <i className="bi bi-images text-lg"></i>
//                       <input
//                         type="file"
//                         multiple
//                         accept="image/*,video/*"
//                         className="hidden"
//                         onChange={uploadFile}
//                       />
//                     </label>
//                     <label className="relative px-2 cursor-pointer">
//                       <i className="bi bi-music-note-beamed text-lg"></i>
//                       <input
//                         type="file"
//                         accept=".mp3"
//                         className="hidden"
//                         onChange={uploadFile}
//                       />
//                     </label>
//                     <label className="relative px-2 cursor-pointer">
//                       <i className="bi bi-filetype-doc text-lg"></i>
//                       <input
//                         type="file"
//                         accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.xlsx,.txt"
//                         className="hidden"
//                         onChange={uploadFile}
//                       />
//                     </label>

//                     <label className="relative px-2 cursor-pointer">
//                       <Smile className="w-5 h-5" />
//                       <input
//                         type="file"
//                         multiple
//                         accept="image/*,video/*"
//                         className="hidden"
//                         onChange={uploadFile}
//                       />
//                     </label>
//                     <i
//                       onClick={() => setOptions((e) => !e)}
//                       className="bi cursor-pointer text-lg text-[var(--custom)] absolute right-0 top-[-25px] bi-x-circle"
//                     ></i>
//                   </div>
//                 )}
//                 <i
//                   onClick={() => setOptions((e) => !e)}
//                   className="bi bi-plus-circle text-[20px] text-[var(--custom)] mr-2 cursor-pointer"
//                 ></i>
//               </div>
//               {(files.length > 0 ||
//                 text.replace(/<[^>]*>/g, '').trim().length > 0) && (
//                 <i
//                   onClick={postMessage}
//                   className="bi bi-send text-[20px] text-[var(--custom)] rotate-45 inline-block cursor-pointer"
//                 />
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   )
// }

// export default UserChat
const Friends: React.FC = () => {
  return (
    <>
      <div className="w-full flex flex-col bg-[var(--primary)] py-2 px-3 sm:rounded-xl h-[100vh]">
        {/* <UsersList /> */}
      </div>
    </>
  )
}

export default Friends
