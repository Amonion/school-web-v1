import Image from 'next/image'
import { forwardRef } from 'react'
import { SocialUser } from '@/src/interface/user/interface'
import Link from 'next/link'
import SocialStore from '@/src/zustand/users/Social'

interface FollowerCardProps {
  user: SocialUser
}

const FollowerCard = forwardRef<HTMLDivElement, FollowerCardProps>(
  ({ user }, ref) => {
    const { followUser } = SocialStore()
    const followAccount = () => {
      followUser(`/users/follow/${user.userId}`, {
        followerId: user?._id,
      })
    }

    return (
      <>
        <div ref={ref} className="post_card user cursor-pointer w-full">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full mr-3 mt-1 overflow-hidden">
              <Image
                style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                src={String(user.followerPicture)}
                loading="lazy"
                sizes="100vw"
                className=" object-cover"
                width={0}
                height={0}
                alt={`${user.displayName}`}
              />
            </div>
            <Link href={`/home/profile/${user.followerUsername}`}>
              <div className="account_name">{user.followerDisplayName}</div>
              <div className="post_username ">@{user.followerUsername}</div>
            </Link>
            {!user.followed && (
              <div
                onClick={followAccount}
                className={`ml-auto mt-auto text-white bg-[var(--custom-color)]  border-[var(--custom)] flex items-center border rounded-[25px] cursor-pointer  sm:text-[16px] text-sm px-3 py-[1px] sm:py-[2px] sm:px-5`}
              >
                <div className="flex">
                  {/* {loading && (
                        <i className={`bi bi-opencollective loading sm`}></i>
                      )} */}
                </div>
                Follow
              </div>
            )}
          </div>

          {/* <PostStat post={post} /> */}
        </div>
      </>
    )
  }
)

FollowerCard.displayName = 'FollowerCard'

export default FollowerCard
