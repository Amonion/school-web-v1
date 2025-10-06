'use client'
import Image from 'next/image'
import Link from 'next/link'
import { truncateString } from '@/lib/helpers'
import { NavStore } from '@/src/zustand/notification/Navigation'
import SchoolStore from '@/src/zustand/school/School'

export default function SchoolDropList() {
  const { searchedText, headerHeight } = NavStore()
  const { searchedSchoolResult, loading } = SchoolStore()
  return (
    <div style={{ top: headerHeight }} className="absolute z-30 w-full left-0">
      {loading && (
        <div className="flex absolute top-0 left-0 z-40 items-center h-5 justify-center flex-wrap w-full">
          <i
            className={`bi mt-[10px]  bi-opencollective loading  text-md text-[var(--custom-color)]`}
          ></i>
        </div>
      )}

      {searchedSchoolResult.length > 0 && searchedText.length > 0 && (
        <div className=" bg-[var(--primary)] overflow-auto max-h-[300px] border border-[var(--border)]">
          {searchedSchoolResult.slice(0, 5).map((item, index) => (
            <Link
              href={`/home`}
              key={index}
              className="py-3 block px-3 border-b border-b-[var(--border)]"
            >
              <div className="flex items-start">
                {(item.picture || item.logo) && (
                  <Image
                    style={{
                      height: '50px',
                      width: '80px',
                      objectFit: 'cover',
                    }}
                    src={
                      item.picture ? String(item.picture) : String(item.logo)
                    }
                    loading="lazy"
                    sizes="100vw"
                    className="mr-3 mt-1 object-cover"
                    width={0}
                    height={0}
                    alt={`${item.name}`}
                  />
                )}
                <div>
                  <div className="account_name">
                    {truncateString(item.name, 150)}
                  </div>
                  {item.username && (
                    <div className="post_username ">@{item.username}</div>
                  )}
                </div>
              </div>
              {/* <div className="mb-auto xs:pt-0 flex items-center flex-wrap">
                <div
                  className="text-[15px] line-clamp-2 overflow-ellipsis"
                  dangerouslySetInnerHTML={{
                    __html: item.intro,
                  }}
                ></div>
              </div> */}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
