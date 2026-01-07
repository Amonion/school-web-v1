import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { ChatStore } from '@/src/zustand/chat/Chat'

export default function ChatHead() {
  const { chatUserForm } = ChatStore()
  const { username } = useParams()
  const router = useRouter()

  return (
    <>
      <div className="flex-1 relative flex items-center px-2">
        <div className="w-8 cursor-pointer flex bg-[var(--secondary)] h-8 rounded-full justify-center items-center mr-2">
          <i
            className="bi bi-arrow-left common-icon cursor-pointer"
            onClick={() => router.back()}
          ></i>
        </div>
        <div className="flex items-center flex-1 cursor-default ">
          {
            <Link
              href={`/home/profile/${chatUserForm.username}`}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mr-3"
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
          }
          <div className="flex-1">
            <div className="flex items-center">
              <Link
                href={`/home/profile/${chatUserForm.username}`}
                className="account_name line-clamp-1 overflow-ellipsis"
              >
                {chatUserForm.displayName}
              </Link>
              {chatUserForm.isVerified && (
                <i className="bi bi-shield-check verify_icon ml-2"></i>
              )}
            </div>
            <div className="flex items-center">
              <Link
                href={`/home/profile/${chatUserForm.username}`}
                className="post_username mr-7"
              >
                @{chatUserForm.username}
              </Link>
              <div className="flex ml-auto items-center">
                <Link
                  href={`/home/friends/chat/${username}/favourites`}
                  className="round secondary"
                >
                  <i className="bi bi-heart-fill text-[10px] mt-[2px] leading-none cursor-pointer text-red-600"></i>
                </Link>

                <i className="bi bi-people text-xl md:hidden cursor-pointer ml-2"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
