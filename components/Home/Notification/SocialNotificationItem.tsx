'use client'
import Spinner from '@/components/LoadingAnimations/Spinner'
import { formatDateToDDMMYY, formatTimeTo12Hour } from '@/lib/helpers'
import { ChatStore } from '@/src/zustand/chat/Chat'
import FriendStore from '@/src/zustand/chat/Friend'
import { MessageStore } from '@/src/zustand/notification/Message'
import { SocialNotification } from '@/src/zustand/notification/SocialNotification'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { User, UserStore } from '@/src/zustand/user/User'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { MutableRefObject } from 'react'

interface NotificationItemProps {
  item: SocialNotification
  isLast?: boolean
  lastCardRef?: MutableRefObject<HTMLDivElement | null>
}

export default function SocialNotificationItem({
  item,
  isLast = false,
  lastCardRef,
}: NotificationItemProps) {
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const { getUser, loading } = UserStore()
  const { friendForm, getFriend } = FriendStore()
  const { getSavedChats } = ChatStore()
  const router = useRouter()
  const setConnectionKey = (id1: string, id2: string) => {
    const participants = [id1, id2].sort()
    return participants.join('')
  }
  const connection = setConnectionKey(
    String(user?.username),
    item.senderUsername
  )

  const move = () => {
    if (!user) return
    getFriend(`/chats/friends/${item.senderUsername}?connection=${connection}`)
    getUser(
      `/users/${item.senderUsername}?userId=${user._id}`,
      setMessage,
      (e) => selectFriend(e)
    )
  }

  const selectFriend = (userForm: User) => {
    ChatStore.setState({
      chats: [],
      username: userForm.username,
      chatUserForm: {
        username: userForm.username,
        picture: String(userForm.picture),
        displayName: userForm.displayName,
        isVerified: userForm.isVerified,
        bioUserId: userForm.bioUserId,
        _id: '',
        isFriends: friendForm.isFriends,
      },
    })
    getSavedChats(connection)
    router.push(`/chat`)
  }

  return (
    <div
      onClick={move}
      ref={isLast ? lastCardRef : undefined}
      className={`cursor-pointer flex items-start mb-2 relative`}
    >
      {loading && (
        <div className="inset-0 absolute flex justify-center items-center z-10">
          <Spinner size={30} />{' '}
        </div>
      )}
      {/* Avatar */}
      <div className="w-[40px] h-[40px] min-w-[40px] mr-2 rounded-full overflow-hidden">
        {item.senderUsername === 'Schooling' ? (
          <Image
            src="/images/active-icon.png"
            alt="system"
            sizes="100vw"
            width={40}
            height={40}
          />
        ) : (
          <Image
            className="object-cover"
            src={
              item.senderUsername === user?.username
                ? item.receiverPicture
                : item.senderPicture
            }
            alt="user"
            sizes="100vw"
            width={40}
            height={40}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 py-2 px-[10px] bg-[var(--white)] rounded">
        <div className="flex mb-2 flex-wrap items-end justify-between">
          <div className="uppercase line-clamp-1 text-[var(--text-secondary)] mr-2">
            {item.title}
          </div>

          <div className="text-[12px] whitespace-nowrap">
            {formatTimeTo12Hour(item.createdAt)}
            {formatDateToDDMMYY(item.createdAt)}
          </div>
        </div>

        <div className="mb-1">
          {item.greetings} {user?.username}
        </div>

        <div
          className="text-sm sm:text-base"
          dangerouslySetInnerHTML={{ __html: item.content }}
        />
      </div>
    </div>
  )
}
