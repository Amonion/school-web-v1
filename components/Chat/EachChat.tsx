'use client'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
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
  const { selectChats, chats, selectedItems } = ChatStore()
  const { user } = AuthStore()
  const { username } = useParams()
  const optionsRef = useRef<HTMLDivElement | null>(null)
  const firstCardRef = useRef<HTMLDivElement | null>(null)
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const isSender = e.senderUsername === user?.username

  const setIsActive = (id: string) => {
    ChatStore.setState((prev) => {
      const updatedChats = prev.chats.map((c) =>
        c._id === id ? { ...c, isActive: true } : c
      )
      return { chats: updatedChats }
    })
  }

  const selectItem = (id: string) => {
    if (selectedItems.length > 0) {
      selectChats(id)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const chatId = Number(entry.target.getAttribute('data-id'))
            const chat = chats.find(
              (c) =>
                c.timeNumber === chatId &&
                c.receiverUsername === user?.username &&
                c.status !== 'read'
            )
            if (chat) {
              ChatStore.setState((prev) => {
                const updatedIds = new Set([
                  ...prev.unseenChatIds,
                  Number(chat.timeNumber),
                ])
                return {
                  unseenChatIds: Array.from(updatedIds),
                }
              })
            }

            const userChat = chats.find(
              (c) => c.timeNumber === chatId && c.status !== 'read'
            )
            if (userChat) {
              ChatStore.setState((prev) => {
                const updatedIds = new Set([
                  ...prev.unseenCheckIds,
                  Number(userChat.timeNumber),
                ])
                return {
                  unseenCheckIds: Array.from(updatedIds),
                }
              })
            }
          }
        })
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    )

    // Observe all chat elements
    Object.values(messageRefs.current).forEach((el) => {
      if (el) observer.observe(el)
    })

    // Clean up observer
    return () => {
      Object.values(messageRefs.current).forEach((el) => {
        if (el) observer.unobserve(el)
      })
    }
  }, [chats, user])

  return (
    <div
      onClick={() => selectItem(String(e._id))}
      className={` ${e.isChecked ? 'selected' : ''} ${
        e.isAlert ? 'cursor-pointer' : 'cursor-default'
      } ${isGroupEnd ? 'mb-3' : 'mb-1'} full_chat_wrapper`}
      ref={(el) => {
        if (el) {
          messageRefs.current[String(e.timeNumber)] = el
          if (isFirst) {
            firstCardRef.current = el
          }
        }
      }}
      data-id={e.timeNumber}
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
            onClick={() => selectChats(String(e.repliedChat?.senderUsername))}
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
                    e.status === 'read' && (
                      <i
                        className={`bi text-[15px] bi-check2-all text-[var(--custom)]`}
                      ></i>
                    )
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
