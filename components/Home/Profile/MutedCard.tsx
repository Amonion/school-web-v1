import Image from 'next/image'
import { forwardRef } from 'react'
import Link from 'next/link'
import SocialStore, { SocialUser } from '@/src/zustand/post/Social'
import { AuthStore } from '@/src/zustand/user/AuthStore'

interface MutedCardProps {
  social: SocialUser
}

const MutedCard = forwardRef<HTMLDivElement, MutedCardProps>(
  ({ social }, ref) => {
    const { unmuteUser } = SocialStore()
    const { user } = AuthStore()

    const unmuteAccount = () => {
      unmuteUser(`/posts/mute/${social.accountUserId}`, {
        userId: user?._id,
        accountUsername: social.accountUsername,
        accountUserId: social.accountUserId,
      })
    }

    return (
      <>
        <div ref={ref} className="post_card user cursor-pointer w-full">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full mr-3 mt-1 overflow-hidden">
              <Image
                style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                src={String(social.accountPicture)}
                loading="lazy"
                sizes="100vw"
                className=" object-cover"
                width={0}
                height={0}
                alt={`${social.accountDisplayName}`}
              />
            </div>
            <Link href={`/home/profile/${social.accountUsername}`}>
              <div className="account_name">{social.accountDisplayName}</div>
              <div className="post_username ">@{social.accountUsername}</div>
            </Link>
            <div
              onClick={unmuteAccount}
              className={`ml-auto mt-auto text-white bg-[var(--custom-color)]  border-[var(--custom)] flex items-center border rounded-[25px] cursor-pointer  sm:text-[16px] text-sm px-3 py-[1px] sm:py-[2px] sm:px-5`}
            >
              <div className="flex">
                {/* {loading && (
                        <i className={`bi bi-opencollective loading sm`}></i>
                      )} */}
              </div>
              Unmute
            </div>
          </div>

          {/* <PostStat post={post} /> */}
        </div>
      </>
    )
  }
)

MutedCard.displayName = 'MutedCard'

export default MutedCard
