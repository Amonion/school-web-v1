'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ChatStore } from '@/src/zustand/chat/Chat'
import EachChat from './EachChat'
import FriendStore from '@/src/zustand/chat/Friend'

const ChatBody = () => {
  const { chatContentResults, chatUserForm, loading } = ChatStore()
  const { friendForm } = FriendStore()
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
    <>
      <div className="flex flex-1 flex-col mb-auto ">
        {chatContentResults.length === 0 && !loading && (
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

        {chatContentResults.map((chat, index) => {
          const prevChat = chatContentResults[index - 1]
          const nextChat = chatContentResults[index + 1]

          const showDate =
            index === 0 ||
            new Date(chat.day).toDateString() !==
              new Date(prevChat.day).toDateString()

          const isSameSenderAsPrev =
            prevChat && prevChat.senderUsername === chat.senderUsername
          const isSameSenderAsNext =
            nextChat && nextChat.senderUsername === chat.senderUsername

          const isGroupStart = !isSameSenderAsPrev // First message in a sender's sequence
          const isGroupEnd = !isSameSenderAsNext

          return (
            <div key={chat._id} className={`w-full flex flex-col`}>
              {showDate && (
                <div className="mx-auto mb-2 rounded-[25px] py-1 px-3 bg-[var(--primary)]">
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

        {!friendForm.isFriends && chatContentResults.length > 0 && (
          <div className="w-full flex flex-col items-center px-[10px] mt-10">
            <div className="text-center max-w-[400px] text-lg leading-[25px]">
              <span className="text-[var(--custom)]">
                {chatUserForm.username}
              </span>{' '}
              will not see you as friend until you send a reply.
            </div>
          </div>
        )}

        {/* {repliedChat && (
          <>
            {repliedChat && (
              <RepliedChat
                repliedChat={repliedChat}
                user={user}
                username={String(username)}
                inner={false}
                onClose={() => startSetRepliedChat(null)}
              />
            )}
          </>
        )} */}
      </div>
    </>
  )
}

export default ChatBody
