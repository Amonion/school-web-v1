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
  const friendState = FriendStore((state) =>
    state.friendsResults.find((f) => f.connection === friend.connection)
  )
  const currentFriend = friendState ?? friend
  const { user } = AuthStore()
  const router = useRouter()
  const isSender = friend.senderUsername === user?.username

  const selectFriend = () => {
    FriendStore.setState(() => ({
      friendForm: currentFriend,
    }))
    router.push(
      `/friends/chat/${
        user?.username === currentFriend.receiverUsername
          ? currentFriend.senderUsername
          : currentFriend.receiverUsername
      }`
    )
  }

  return (
    <li
      onClick={selectFriend}
      className="flex w-full items-start cursor-pointer"
    >
      <div className="rounded-full w-12 h-12 relative overflow-hidden">
        <Image
          src={
            isSender
              ? currentFriend.receiverPicture
              : currentFriend.senderPicture
          }
          alt="Media"
          fill
          className="object-cover w-full h-full"
        />
      </div>

      <div className="flex-1 pl-2">
        <div className="flex w-full items-center mb-1">
          <div className="font-semibold line-clamp-1 text-[var(--text-secondary)] mr-auto">
            {isSender
              ? currentFriend.receiverDisplayName
              : currentFriend.senderDisplayName}
          </div>
          <div className="text-[12px] ml-2 block">
            {formatRelativeDate(String(currentFriend.createdAt))}
          </div>
        </div>

        <div className="flex items-end w-full">
          <div
            className="text-sm mr-auto line-clamp-1"
            dangerouslySetInnerHTML={{ __html: currentFriend.content }}
          />
          {isSender && (
            <div className="ml-1 text-[12px]">
              {currentFriend.status === 'pending' ? (
                <i className="bi bi-clock-history"></i>
              ) : currentFriend.status === 'sent' ? (
                <i className="bi bi-check2"></i>
              ) : currentFriend.status === 'delivered' ? (
                <i className="bi bi-check2-all"></i>
              ) : (
                <i className="bi bi-clock-history"></i>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
