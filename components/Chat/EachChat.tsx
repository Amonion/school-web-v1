'use client'
import Image from 'next/image'
import { useRef } from 'react'
import { useParams } from 'next/navigation'
import { formatTimeTo12Hour, getExtension } from '@/lib/helpers'
import AudioMessage from './Audio'
import pluralize from 'pluralize'
import MediaDisplay from './MediaDisplay'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { ChatContent, ChatStore } from '@/src/zustand/chat/Chat'
import ChatActions from './ChatActions'

type ChatContentProps = {
  e: ChatContent
  isFirst: boolean
  isGroupStart: boolean
  isGroupEnd: boolean
  index: number
}

const EachChat = ({ e, isFirst, isGroupEnd }: ChatContentProps) => {
  const { selectChats, selectedItems } = ChatStore()
  const { user } = AuthStore()
  const { username } = useParams()
  const optionsRef = useRef<HTMLDivElement | null>(null)
  const firstCardRef = useRef<HTMLDivElement | null>(null)
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const isSender = e.senderUsername === user?.username

  const setIsActive = (id: string) => {
    ChatStore.setState((prev) => {
      let willBeActive = false
      for (const group of prev.chatResults) {
        const chat = group.chats.find((c) => c._id === id)
        if (chat) {
          willBeActive = !chat.isActive
          break
        }
      }
      const updatedResults = prev.chatResults.map((group) => ({
        ...group,
        chats: group.chats.map((chat) => ({
          ...chat,
          isActive: chat._id === id ? willBeActive : false,
        })),
      }))
      return { chatResults: updatedResults }
    })
  }

  const selectItem = (id: string) => {
    if (selectedItems.length > 0) {
      selectChats(id)
    }
  }

  //--------------------MARK READ CHATS----------------------//

  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       let hasNew = false

  //       entries.forEach((entry) => {
  //         const messageId = (entry.target as HTMLElement).dataset.id
  //         if (
  //           messageId &&
  //           entry.isIntersecting &&
  //           !observedChats.current.has(messageId)
  //         ) {
  //           const chat = allMessages.find((c) => c._id === messageId)
  //           if (chat && chat.receiverUsername === user?.username) {
  //             observedChats.current.set(messageId, chat)
  //             hasNew = true

  //             if (pendingReadIds.current.has(messageId)) {
  //               const form = {
  //                 to: 'read',
  //                 ids: [messageId],
  //                 receiverId: user?._id,
  //                 receiverUsername: user?.username,
  //                 username: chat.username,
  //                 isRead: true,
  //               }
  //               socket?.emit('message', form)
  //               pendingReadIds.current.delete(messageId)
  //             }
  //           }
  //         }
  //       })

  //       if (hasNew && user && socket) {
  //         if (debounceTimeout.current) {
  //           clearTimeout(debounceTimeout.current)
  //         }

  //         debounceTimeout.current = setTimeout(() => {
  //           const chatsToSend = Array.from(observedChats.current.values())
  //           if (chatsToSend.length > 0) {
  //             const unreadChatIds = chatsToSend
  //               .filter(
  //                 (e) =>
  //                   !e.isRead &&
  //                   e.receiverUsername === user.username &&
  //                   e.isFriends
  //               )
  //               .map((e) => e._id)
  //             if (unreadChatIds.length > 0) {
  //               const form = {
  //                 to: 'read',
  //                 ids: unreadChatIds,
  //                 connection: connection,
  //                 username: username,
  //                 receiverUsername: user?.username,
  //                 receiverMainId: user?.userId,
  //                 isRead: true,
  //               }
  //               socket.emit('message', form)
  //               observedChats.current.clear()
  //             }
  //           }
  //         }, 1000)
  //       }
  //     },
  //     {
  //       threshold: 0.5,
  //     }
  //   )

  //   Object.values(messageRefs.current).forEach((el) => {
  //     if (el) observer.observe(el)
  //   })

  //   return () => {
  //     observer.disconnect()
  //     if (debounceTimeout.current) {
  //       clearTimeout(debounceTimeout.current)
  //     }
  //   }
  // }, [chatResults, user, socket])

  return (
    <div
      onClick={() => selectItem(String(e._id))}
      className={` ${e.isChecked ? 'selected' : ''} ${
        e.isAlert ? 'cursor-pointer' : 'cursor-default'
      } ${isGroupEnd ? 'mb-3' : 'mb-1'} full_chat_wrapper`}
      ref={(el) => {
        if (el) {
          messageRefs.current[String(e._id)] = el
          if (isFirst) {
            firstCardRef.current = el
          }
        }
      }}
      data-id={e._id}
      // ref={isFirst ? firstCardRef : messageRefs}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        className={` ${isSender ? 'sender' : 'receiver'} ${
          e.media[0] && e.media[0].type === 'audio' ? 'audio' : ''
        } ${
          e.media[0] &&
          (e.media[0].type === 'picture' || e.media[0].type === 'video')
            ? 'media'
            : ''
        } chat_wrapper cursor-default`}
      >
        {e.repliedChat && e.repliedChat !== null && (
          <div
            onClick={() => selectChats(String(e.repliedChat?.username))}
            className={`${
              isSender ? 'bg-[var(--secondary)]' : 'bg-[var(--custom-dark)]'
            } flex  rounded-[10px] py-[1px] px-[5px] cursor-pointer w-full mb-2`}
          >
            {/* <RepliedChat
                          repliedChat={e.repliedChat}
                          chat={e}
                          user={user}
                          username={String(username)}
                          inner={true}
                        /> */}
          </div>
        )}
        {e.media.length > 0 && (
          <>
            {e.media[0].type === 'document' ? (
              <div className="flex items-start mb-2">
                <Image
                  style={{ height: '40px', objectFit: 'contain' }}
                  src={getExtension(e.media[0].source)}
                  loading="lazy"
                  sizes="100vw"
                  className="w-auto h-auto object-contain mr-3"
                  width={0}
                  height={0}
                  alt={`"/files/file.png"`}
                />
                <div className="flex-col flex flex-1 mr-2">
                  <div className="flex items-start mb-1 justify-between">
                    {e.media[0].name && (
                      <div className="text-[var(--text-secondary)] mr-2 line-clamp-1 overflow-hidden text-ellipsis">
                        {e.media[0].name}
                      </div>
                    )}
                  </div>
                  <div className="flex mb-auto text-[12px] uppercase">
                    {e.media[0].source
                      .substring(e.media[0].source.lastIndexOf('.'))
                      .slice(1)}{' '}
                    . {(e.media[0].size / (1024 * 1024)).toFixed(2)} MB{' '}
                    {e.media[0].pages > 0 &&
                      `. ${e.media[0].pages} ${pluralize(
                        'Page',
                        e.media[0].pages
                      )}`}
                  </div>
                </div>
                <a
                  href={e.media[0].source}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${
                    username === e.senderUsername
                      ? 'border-white text-white'
                      : 'border-[var(--text-primary)]'
                  } cursor-pointer ml-auto min-w-8 w-8 h-8 border rounded-full flex items-center justify-center`}
                >
                  <i className="bi bi-download"></i>
                </a>
              </div>
            ) : e.media[0].type === 'audio' ? (
              <AudioMessage
                src={e.media[0].source}
                isSender={isSender}
                name={e.media[0].name}
              />
            ) : (
              <MediaDisplay sources={e.media} />
            )}
          </>
        )}

        <div className="mb-1">
          <div dangerouslySetInnerHTML={{ __html: e.content }}></div>
        </div>
        <div className="flex leading-[15px] justify-between w-full items-center text-[11px]">
          <div className="flex items-end">
            {isSender ? (
              <>
                {formatTimeTo12Hour(e.senderTime ?? null)}
                <div className="flex ml-3 text-[10px]">
                  {e.status === 'pending' ? (
                    <i className="bi bi-clock-history"></i>
                  ) : e.status === 'delivered' ? (
                    <i className={`bi text-[15px] bi-check2-all`}></i>
                  ) : (
                    <i className="bi bi-check2 text-[15px]"></i>
                  )}
                </div>
              </>
            ) : (
              formatTimeTo12Hour(e.receiverTime ?? null)
            )}
          </div>

          <div className="relative" ref={optionsRef}>
            {e.isActive && <ChatActions e={e} />}

            <i
              onClick={() => setIsActive(String(e._id))}
              className="bi bi-three-dots-vertical text-sm cursor-pointer"
            ></i>
          </div>
        </div>
        {e.isSavedUsernames?.includes(String(user?.username)) && (
          <>
            {isSender ? (
              <div className="round absolute left-0 bottom-[-15px]">
                <i className="bi bi-heart-fill text-[10px] mt-[2px] leading-none cursor-pointer text-red-600"></i>
              </div>
            ) : (
              <div className="round absolute left-[10px] bottom-[-15px]  ">
                <i className="bi bi-heart-fill text-[10px] mt-[1px] leading-none cursor-pointer text-red-600"></i>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default EachChat
