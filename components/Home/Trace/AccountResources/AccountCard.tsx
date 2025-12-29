import Image from 'next/image'
import { forwardRef } from 'react'
import Link from 'next/link'
import { User } from '@/src/zustand/user/User'
import { MessageCircle } from 'lucide-react'
import { ChatStore } from '@/src/zustand/chat/Chat'
import FriendStore, { FriendEmpty } from '@/src/zustand/chat/Friend'
import { useRouter } from 'next/navigation'

interface AccountCardProps {
  user: User
}

const AccountCard = forwardRef<HTMLDivElement, AccountCardProps>(
  ({ user }, ref) => {
    const { getSavedChats, connection } = ChatStore()
    const router = useRouter()

    const intro =
      'Hi, lets socialize and exchange ideas to acheive something great.'

    const findFriend = FriendStore.getState().friendsResults.find(
      (item) => item.connection === connection
    )

    const selectFriend = () => {
      ChatStore.setState({
        chats: [],
        username: user.username,
        chatUserForm: {
          username: user.username,
          picture: String(user.picture),
          displayName: user.displayName,
          _id: '',
          isFriends: findFriend?.isFriends,
        },
      })
      getSavedChats(connection)

      FriendStore.setState((prev) => {
        const friend = prev.friendsResults.find(
          (item) => item.connection === connection
        )
        return {
          friendForm: friend ? friend : { ...FriendEmpty },
        }
      })

      router.push(`/chat`)
    }
    return (
      <>
        <div ref={ref} className="post_card user cursor-pointer w-full">
          <div className="flex items-start">
            <Link
              href={`/home/profile/${user.username}`}
              className="w-10 h-10 rounded-full mr-3 mt-1 overflow-hidden"
            >
              <Image
                style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                src={user.picture ? String(user.picture) : '/images/avatar.jpg'}
                loading="lazy"
                sizes="100vw"
                className=" object-cover"
                width={0}
                height={0}
                alt={`${user.displayName}`}
              />
            </Link>
            <Link href={`/home/profile/${user.username}`}>
              <div className="account_name line-clamp-1 overflow-ellipsis">
                {user.displayName}
              </div>
              <div className="post_username ">@{user.username}</div>
            </Link>
            <div className="flex items-center ml-auto">
              <div
                className="mr-3 text-lg cursor-pointer"
                onClick={() => selectFriend()}
              >
                <MessageCircle />
              </div>
              <div
                // onClick={followAccount}
                className={`${
                  user.followed
                    ? 'border-[var(--border)]'
                    : 'text-white bg-[var(--custom-color)]  border-[var(--custom)]'
                } flex items-center border rounded-[25px] cursor-pointer  sm:text-[16px] text-sm px-3 py-[1px] sm:py-[2px] sm:px-5`}
              >
                {/* <div className="flex">
                  {loading && (
                    <i className={`bi bi-opencollective loading sm`}></i>
                  )}
                </div> */}
                {user.followed ? 'Unfollow' : 'Follow'}
              </div>
            </div>
          </div>
          <div className="p-1 rounded-[5px] cursor-pointer mb-2 text-[14px] sm:text-[16px] ">
            <div
              className="line-clamp-2 overflow-ellipsis"
              dangerouslySetInnerHTML={{
                __html: user.intro ? user.intro : intro,
              }}
            ></div>
          </div>
        </div>
      </>
    )
  }
)

AccountCard.displayName = 'AccountCard'

export default AccountCard
