import Image from 'next/image'
import { forwardRef } from 'react'
import { truncateString } from '@/lib/helpers'
import { BioUserSchoolInfo } from '@/src/zustand/user/BioUserSchoolInfo'

interface SearchedPeopleCardProps {
  user: BioUserSchoolInfo
}

const SearchedPeopleCard = forwardRef<HTMLDivElement, SearchedPeopleCardProps>(
  ({ user }, ref) => {
    return (
      <>
        <div ref={ref} className="post_card user cursor-pointer w-full">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full mr-3 mt-1 overflow-hidden">
              <Image
                style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                src={String(user.bioUserPicture)}
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
        </div>
      </>
    )
  }
)

SearchedPeopleCard.displayName = 'SearchedPeopleCard'

export default SearchedPeopleCard
