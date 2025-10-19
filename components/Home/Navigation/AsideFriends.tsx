import { NavStore } from '@/src/zustand/notification/Navigation'
import FriendStore from '@/src/zustand/chat/Friend'
import { AuthStore } from '@/src/zustand/user/AuthStore'
// import UsersList from '../Chat/UsersList'
import Image from 'next/image'
import { formatRelativeDate } from '@/lib/helpers'
import { useRouter } from 'next/navigation'

export default function AsideFriends() {
  const { asideNav, toggleAsideVNav } = NavStore()
  const { friendsResults } = FriendStore()
  const { user } = AuthStore()
  const router = useRouter()
  return (
    <div
      onClick={toggleAsideVNav}
      className={` ${asideNav ? 'right-0' : 'right-[-100%]'} v_nav aside`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        className="v_nav_card aside"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="v_nav_card news"
        >
          <div
            className={`rounded-[20px] bg-[var(--primary)] mt-3 mb-5 h-[40px] w-full flex items-center px-3`}
          >
            <i className="bi bi-sliders cursor-pointer mr-3"></i>
            <input
              type="search"
              // onChange={(e) => setSearchedText(e.target.value)}
              className={`bg-transparent border-none outline-none flex-1`}
              placeholder={`Search friends or conversation...`}
            />
            <i className="bi bi-search common-icon cursor-pointer"></i>
          </div>
          <ul className="m-0 p-0">
            {friendsResults.map((friend, index) => (
              <li
                onClick={() =>
                  router.push(
                    `/friends/chat/${
                      user?.username === friend.receiverUsername
                        ? friend.senderUsername
                        : friend.receiverUsername
                    }`
                  )
                }
                key={index}
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
                    <div className="ml-1 text-[12px]">
                      {friend.status === 'pending' ? (
                        <i className="bi bi-clock-history"></i>
                      ) : friend.status === 'sent' ? (
                        <i className="bi bi-clock-history"></i>
                      ) : friend.status === 'delivered' ? (
                        <i className="bi bi-clock-history"></i>
                      ) : (
                        <i className="bi bi-clock-history"></i>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
