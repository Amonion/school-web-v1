'use client'
import Link from 'next/link'
import Image from 'next/image'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { RelativeTime } from './RelativeTime'
import { useTheme } from '@/context/ThemeProvider'
import SchoolFriendStore from '@/src/zustand/chat/SchoolFriend'

const SchoolFriendsList: React.FC = () => {
  const { friendsResults } = SchoolFriendStore()
  const { user } = AuthStore()
  const { theme } = useTheme()
  return (
    <>
      <div className="flex-1 overflow-y-auto chat_scrollbar pr-2">
        {friendsResults.map((item, index) => (
          <div
            key={index}
            className="flex relative border-b-[1px] border-b-[var(--border-color)] py-[10px]"
          >
            <Link
              href={`/home/friends/chat/${
                item.username === user?.username
                  ? item.receiverUsername
                  : item.username
              }`}
              className="relative flex  mr-2"
            >
              <div className="profile_pix">
                <Image
                  style={{ height: '100%', objectFit: 'cover' }}
                  className="object-cover "
                  src={
                    item.userId === user?._id
                      ? item.receiverPicture
                      : item.picture
                  }
                  loading="lazy"
                  alt="username"
                  sizes="100vw"
                  height={50}
                  width={50}
                />
              </div>
              <span className="w-3 h-3 rounded-full bg-[var(--success)] absolute bottom-[-2px] right-[0px]"></span>
            </Link>
            <Link
              href={`/home/friends/chat/${
                item.username === user?.username
                  ? item.receiverUsername
                  : item.username
              }`}
              className="flex-1 cursor-pointer"
            >
              <div className="text-title-color w-full flex items-end mb-1">
                {item.userId === user?._id
                  ? item.receiverUsername
                  : item.username}{' '}
                <RelativeTime date={item.createdAt} />
              </div>
              {item.content.replace(/<[^>]*>/g, '').trim().length > 0 && (
                <p className="text-sm line-clamp-1 overflow-ellipsis">
                  {item.content.replace(/<[^>]*>/g, '')}
                </p>
              )}
            </Link>
            <div className="w-6 h-6 bg-[var(--secondary)] flex justify-center items-center rounded-full absolute top-[5px] right-0">
              <i className="bi bi-three-dots cursor-pointer"></i>
            </div>
            {item.unread > 0 && (
              <span className="w-5 h-5 text-[12px] text-white flex justify-center items-center rounded-full bg-[var(--custom-color)] absolute bottom-2 right-0">
                {item.unread > 9 ? `9+` : item.unread}
              </span>
            )}
          </div>
        ))}

        {friendsResults.length === 0 && (
          <div className="w-full pb-5 flex flex-col">
            <div className="text-center mb-5">You have no school mate yet.</div>
            <Image
              style={{
                maxHeight: '70vh',
                height: 'auto',
                width: '100%',
                maxWidth: '400px',
              }}
              className="mb-5 max-h-[70vh] mx-auto"
              src={`${
                theme === 'light' ? '/images/meet.png' : '/images/meetDark.png'
              }`}
              loading="lazy"
              alt="username"
              sizes="100vw"
              height={0}
              width={0}
            />
            <div className="flex justify-center text-center">
              Your school mates will be automatically added once they are
              verified.
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default SchoolFriendsList
