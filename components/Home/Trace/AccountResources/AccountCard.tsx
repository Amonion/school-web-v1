import Image from 'next/image'
import { forwardRef } from 'react'
import { truncateString } from '@/lib/helpers'
import Link from 'next/link'
import { User } from '@/src/zustand/user/User'

interface AccountCardProps {
  user: User
}

const AccountCard = forwardRef<HTMLDivElement, AccountCardProps>(
  ({ user }, ref) => {
    const intro =
      'Hi, lets socialize and exchange ideas to acheive something great.'

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
                src={String(user.picture)}
                loading="lazy"
                sizes="100vw"
                className=" object-cover"
                width={0}
                height={0}
                alt={`${user.displayName}`}
              />
            </Link>
            <Link href={`/home/profile/${user.username}`}>
              <div className="account_name">
                {truncateString(user.displayName, 150)}
              </div>
              <div className="post_username ">@{user.username}</div>
            </Link>
          </div>
          <div className="p-1 rounded-[5px] cursor-pointer mb-2 text-[14px] sm:text-[16px] ">
            <div
              dangerouslySetInnerHTML={{
                __html: user.intro ? truncateString(user.intro, 100) : intro,
              }}
            ></div>
          </div>

          {/* <PostStat post={post} /> */}
        </div>
      </>
    )
  }
)

AccountCard.displayName = 'AccountCard'

export default AccountCard
