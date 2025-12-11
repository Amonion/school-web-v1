'use client'
import Image from 'next/image'
import { truncateString } from '@/lib/helpers'
import { NavStore } from '@/src/zustand/notification/Navigation'
import AccountStore from '@/src/zustand/Trace/Account'

export default function AccountDropList() {
  const { searchedText, headerHeight } = NavStore()
  const { searchedAccountResult, loading } = AccountStore()
  return (
    <div style={{ top: headerHeight }} className="absolute z-30 w-full left-0">
      {loading && (
        <div className="flex absolute top-0 left-0 z-40 items-center h-5 justify-center flex-wrap w-full">
          <i
            className={`bi mt-[10px]  bi-opencollective loading  text-md text-[var(--custom-color)]`}
          ></i>
        </div>
      )}

      {searchedAccountResult.length > 0 && searchedText.length > 0 && (
        <div className=" bg-[var(--primary)] overflow-auto max-h-[300px] border border-[var(--border)]">
          {searchedAccountResult.slice(0, 5).map((item, index) => (
            <div key={index} className="py-3 px-3">
              <div className="flex items-start">
                <Image
                  style={{ height: '40px', width: '40px', objectFit: 'cover' }}
                  src={String(item.picture)}
                  loading="lazy"
                  sizes="100vw"
                  className="rounded-full mr-3 mt-1 object-cover"
                  width={0}
                  height={0}
                  alt={`${item.displayName}`}
                />
                <div>
                  <div className="account_name">
                    {truncateString(item.displayName, 150)}
                  </div>
                  <div className="post_username ">@{item.username}</div>
                </div>
              </div>
              <div className="mb-auto xs:pt-0 flex items-center flex-wrap">
                <div
                  className="text-[15px] line-clamp-2 overflow-ellipsis"
                  dangerouslySetInnerHTML={{
                    __html: item.intro,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
