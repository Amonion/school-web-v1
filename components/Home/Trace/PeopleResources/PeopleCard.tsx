import Image from 'next/image'

import { forwardRef } from 'react'

import { truncateString } from '@/lib/helpers'
import { BioUserSchoolInfo } from '@/src/zustand/user/BioUserSchoolInfo'

interface PeopleCardProps {
  user: BioUserSchoolInfo
}

const PeopleCard = forwardRef<HTMLDivElement, PeopleCardProps>(
  ({ user }, ref) => {
    // const intro =
    //   'Hi, lets socialize and exchange ideas to acheive something great.'

    return (
      <>
        <div ref={ref} className="post_card user cursor-pointer w-full">
          <div className="flex items-start mb-1">
            <div className="w-10 h-10 rounded-full mr-3 mt-1 overflow-hidden">
              <Image
                style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                src={
                  user.bioUserPicture
                    ? String(user.bioUserPicture)
                    : '/images/avatar.jpg'
                }
                loading="lazy"
                sizes="100vw"
                className=" object-cover"
                width={0}
                height={0}
                alt={`${user.bioUserDisplayName}`}
              />
            </div>
            <div>
              <div className="account_name">
                {truncateString(user.bioUserDisplayName, 150)}
              </div>
              <div className="post_username ">@{user.bioUserUsername}</div>
            </div>
          </div>

          {/* <div className="p-1 rounded-[5px] cursor-pointer mb-2 text-[14px] sm:text-[16px] ">
            <div
              dangerouslySetInnerHTML={{
                __html: user.bioUserIntro
                  ? truncateString(user.bioUserIntro, 100)
                  : intro,
              }}
            ></div>
          </div> */}
          <div className="flex items-center">
            <div className="flex items-center mr-3">
              <div className="w-5 h-3 mr-1 overflow-hidden">
                {user.schoolCountryFlag && (
                  <Image
                    style={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'cover',
                    }}
                    src={String(user.schoolCountryFlag)}
                    loading="lazy"
                    sizes="100vw"
                    className=" object-cover"
                    width={0}
                    height={0}
                    alt={`${user.bioUserDisplayName}`}
                  />
                )}
              </div>
              {user.schoolCountrySymbol}
            </div>
            <div className="flex items-center">
              {user.schoolLogo && (
                <Image
                  style={{ height: 'auto', width: 20, objectFit: 'contain' }}
                  src={String(user.schoolLogo)}
                  loading="lazy"
                  sizes="100vw"
                  className="mr-1"
                  width={0}
                  height={0}
                  alt={`${user.bioUserDisplayName}`}
                />
              )}
              <div
                className={`overflow-ellipsis line-clamp-1 ${
                  user.inSchool ? 'text-[var(--custom)]' : ''
                }`}
              >
                {user.schoolName}
              </div>
            </div>
          </div>

          {/* <PostStat post={post} /> */}
        </div>
      </>
    )
  }
)

PeopleCard.displayName = 'PeopleCard'

export default PeopleCard
