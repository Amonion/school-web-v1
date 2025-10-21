import FriendStore, { Friend } from '@/src/zustand/chat/Friend'
import { AuthStore } from '@/src/zustand/user/AuthStore'
// import UsersList from '../Chat/UsersList'
import Image from 'next/image'
import { formatRelativeDate } from '@/lib/helpers'
import { useRouter } from 'next/navigation'

interface EachFriendProps {
  friend: Friend
}

export default function EachFriend({ friend }: EachFriendProps) {
  const { user } = AuthStore()
  const router = useRouter()

  const selectFriend = () => {
    FriendStore.setState((prev) => {
      const chat = prev.friendsResults.find(
        (item) => item.connection === friend.connection
      )
      return {
        friendForm: chat,
      }
    })
    router.push(
      `/friends/chat/${
        user?.username === friend.receiverUsername
          ? friend.senderUsername
          : friend.receiverUsername
      }`
    )
  }
  return (
    <li
      onClick={() => selectFriend()}
      className="flex w-full items-start cursor-pointer"
    >
      <div className="rounded-full w-12 h-12 relative overflow-hidden">
        <Image
          src={
            user?.username === friend.senderUsername
              ? friend.receiverPicture
              : friend.senderPicture
          }
          alt="Media"
          fill
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1 pl-2">
        <div className="flex w-full items-center mb-1">
          <div className="font-semibold line-clamp-1 overflow-ellipsis text-[var(--text-secondary)] mr-auto">
            {user?.username === friend.senderUsername
              ? friend.receiverDisplayName
              : friend.senderDisplayName}
          </div>
          <div className="text-[12px] ml-2 block">
            {formatRelativeDate(String(friend.createdAt))}
          </div>
        </div>
        <div className="flex items-end w-full">
          <div
            className="text-sm mr-auto line-clamp-1 overflow-ellipsis"
            dangerouslySetInnerHTML={{
              __html: friend.content,
            }}
          />
          {friend.status}
          <div className="ml-1 text-[12px]">
            {friend.status === 'pending' ? (
              <i className="bi bi-clock-history"></i>
            ) : friend.status === 'sent' ? (
              <i className="bi bi-check2"></i>
            ) : friend.status === 'delivered' ? (
              <i className="bi bi-clock-history"></i>
            ) : (
              <i className="bi bi-clock-history"></i>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}
