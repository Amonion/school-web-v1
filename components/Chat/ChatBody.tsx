'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ChatStore } from '@/src/zustand/chat/Chat'
import EachChat from './EachChat'
import FriendStore from '@/src/zustand/chat/Friend'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

const ChatBody = () => {
  const { chats, chatUserForm, loading, unread } = ChatStore()
  const { friendForm } = FriendStore()
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const pathname = usePathname()
  const [isNearBottom, setIsNearBottom] = useState(false)

  useEffect(() => {
    const scrollToBottom = () => {
      const container = chatContainerRef.current
      if (container) {
        container.scrollTop = container.scrollHeight
        setIsNearBottom(true)
      }
    }

    const timer = setTimeout(() => {
      scrollToBottom()
    }, 100)

    return () => clearTimeout(timer)
  }, [chats, pathname])

  //  const handleFetchOlderChats = async (user: User) => {
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

  const scrollDown = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }

  useEffect(() => {
    const observeScroll = () => {
      const container = chatContainerRef.current
      if (container) {
        setIsNearBottom(container.scrollTop >= 100)
        if (container.scrollTop === 0) {
          console.log('Scrolled to top')
        }
      }
    }
    const container = chatContainerRef.current
    if (container) {
      container.addEventListener('scroll', observeScroll)
      return () => {
        container.removeEventListener('scroll', observeScroll)
      }
    }
  }, [])

  return (
    <>
      <div
        style={{
          maxHeight: `calc(100vh - 120px)`,
        }}
        ref={chatContainerRef}
        className="flex relative flex-1 flex-col mb-auto overflow-auto chat_scrollbar"
      >
        {chats.length === 0 && !loading && (
          <div className="w-full flex-1 flex flex-col items-center px-[10px] mt-10">
            <Link
              href={`/home/profile/${chatUserForm.username}`}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mb-5"
            >
              <Image
                style={{ height: '100%', objectFit: 'cover' }}
                src={`${chatUserForm.picture || '/avatar.png'}`}
                loading="lazy"
                sizes="100vw"
                className="w-full h-full object-cover"
                width={0}
                height={0}
                alt={`${chatUserForm.username}`}
              />
            </Link>

            <div className="text-center max-w-[400px] text-lg leading-[25px]">
              <span className="text-[var(--custom)]">
                {chatUserForm.username}
              </span>{' '}
              would not see your message as friends. Both of you will be friends
              when{' '}
              <span className="text-[var(--custom)]">
                {chatUserForm.username}
              </span>{' '}
              sees your message in notifications and reply you.
            </div>
          </div>
        )}

        {chats.map((chat, index) => {
          const prevChat = chats[index - 1]
          const nextChat = chats[index + 1]

          const showDate = index === 0 || chat.day !== prevChat.day

          const isSameSenderAsPrev =
            prevChat && prevChat.senderUsername === chat.senderUsername
          const isSameSenderAsNext =
            nextChat && nextChat.senderUsername === chat.senderUsername

          const isGroupStart = !isSameSenderAsPrev
          const isGroupEnd = !isSameSenderAsNext

          return (
            <div key={chat.timeNumber} className={`w-full flex flex-col`}>
              {showDate && (
                <div className="mx-auto my-3 rounded-[25px] py-1 px-3 bg-[var(--primary)]">
                  {chat.day}
                </div>
              )}
              <EachChat
                e={chat}
                isFirst={index === 0}
                isGroupStart={isGroupStart}
                isGroupEnd={isGroupEnd}
                index={index}
              />
            </div>
          )
        })}

        {!friendForm.isFriends && chats.length > 0 && (
          <div className="w-full flex flex-col items-center px-[10px] mt-10">
            <div className="text-center max-w-[400px] text-lg leading-[25px]">
              <span className="text-[var(--custom)]">
                {chatUserForm.username}
              </span>{' '}
              will not see you as friend until you send a reply.{' '}
            </div>
          </div>
        )}

        {!isNearBottom && unread > 0 && (
          <div
            onClick={scrollDown}
            className="cursor-pointer w-[20px] h-[20px] border border-[var(--border)] text-[10px] text-white rounded-full flex items-center justify-center bg-[var(--custom)] absolute left-[10px] top-[-40px]"
          >
            {unread < 100 ? unread : '99+'}
          </div>
        )}
      </div>
      {!isNearBottom && (
        <div
          onClick={scrollDown}
          className="cursor-pointer w-8 h-8 border border-[var(--border)] rounded-full flex items-center justify-center bg-[var(--primary)] absolute right-[10px] bottom-[40px]"
        >
          <i className="bi bi-arrow-down"></i>
        </div>
      )}
    </>
  )
}

export default ChatBody
