'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ChatStore } from '@/src/zustand/chat/Chat'
import EachChat from './EachChat'
import FriendStore from '@/src/zustand/chat/Friend'

const ChatBody = () => {
  const { chats, chatUserForm, loading } = ChatStore()
  const { friendForm } = FriendStore()

  return (
    <>
      <div className="flex flex-1 flex-col mb-auto ">
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
