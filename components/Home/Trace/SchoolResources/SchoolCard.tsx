import { forwardRef } from 'react'
import { useRouter } from 'next/navigation'

import Link from 'next/link'
import Image from 'next/image'
import SchoolCardInfo from './SchoolCardInfo'
import SchoolStore, { School } from '@/src/zustand/school/School'
import { useTheme } from '@/context/ThemeProvider'

interface SchoolCardProps {
  school: School
}

const SchoolCard = forwardRef<HTMLDivElement, SchoolCardProps>(
  ({ school }, ref) => {
    const { theme } = useTheme()
    const router = useRouter()

    // const intro =
    //   "Hi, lets socialize and exchange ideas to acheive something great.";

    const moveToPost = (username: string) => {
      SchoolStore.setState({
        schoolData: school,
      })
      router.push(`/home/school/${username}`)
    }

    return (
      <>
        <div
          onClick={() => moveToPost(school.username)}
          ref={ref}
          className="post_card school w-full xs:flex"
        >
          <Link
            href={`/home/school/${school.username}`}
            className="w-full h-[150px] xs:h-[120px] xs:w-[170px] xs:rounded-[10px] rounded-[5px] block overflow-hidden"
          >
            <Image
              style={{ height: '100%', objectFit: 'cover' }}
              src={
                school.picture
                  ? String(school.picture)
                  : school.logo
                  ? String(school.logo)
                  : theme === 'dark'
                  ? '/images/DLogoback.png'
                  : '/images/Logoback.png'
              }
              loading="lazy"
              sizes="100vw"
              className="w-full h-full object-cover"
              width={0}
              height={0}
              alt={`${school.username}`}
            />
          </Link>
          <div className="flex flex-1 flex-wrap xs:px-[10px]">
            <div className="flex flex-wrap w-full mb-3 cursor-default">
              <Link
                href={`/home/school/${school.username}`}
                className="w-[60px] h-[60px] xs:w-12 xs:h-12 mt-[-25px] xs:mt-0 xs:ml-0 ml-[10px] bg-[var(--secondary)] rounded-full overflow-hidden mr-3"
              >
                <Image
                  style={{ height: '100%', objectFit: 'cover' }}
                  src={
                    school.picture
                      ? String(school.picture)
                      : school.logo
                      ? String(school.logo)
                      : '/images/cap.png'
                  }
                  loading="lazy"
                  sizes="100vw"
                  className="w-full h-full object-cover"
                  width={0}
                  height={0}
                  alt={`${school.username}`}
                />
              </Link>
              <div className="flex-1">
                <div className="pt-1 xs:pt-0 flex items-center flex-wrap">
                  <Link
                    href={`/home/school/${school.username}`}
                    className="account_name mr-2"
                  >
                    {school.name}
                  </Link>
                  {school.isVerified && (
                    <i className="bi bi-shield-check verify_icon"></i>
                  )}
                  {school.username && (
                    <Link
                      href={`/home/school/${school.username}`}
                      className="post_username "
                    >
                      @{school.username}
                    </Link>
                  )}
                </div>
                <div className="flex-wrap items-center justify-between xs:flex hidden">
                  <SchoolCardInfo school={school} />
                </div>
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center justify-between xs:hidden">
              <SchoolCardInfo school={school} />
            </div>
            <div className="p-1 rounded-[5px] cursor-pointer mb-2 text-[16px] text-[var(--text-title-color)]">
              <div
                dangerouslySetInnerHTML={{
                  __html: 'Peace, Unity and Progress.',
                }}
              ></div>
            </div>

            <div className="flex justify-between text-sm flex-wrap items-center w-full">
              <div className="flex items-center flex-wrap mr-4">
                <div className="flex mr-4 items-center">
                  <i className="bi bi-bank mr-1"></i> 14
                </div>
                <div className="flex mr-4 items-center">
                  <i className="bi bi-distribute-horizontal mr-1"></i>
                  14
                </div>
                <div className="flex items-center">
                  <i className="bi bi-people mr-1"></i> 14.2K
                </div>
              </div>
              <div className="">
                {new Date(String(school.createdAt)).getFullYear()}
              </div>
            </div>
          </div>
          {/* <PostStat post={post} /> */}
        </div>
      </>
    )
  }
)
SchoolCard.displayName = 'SchoolCard'

export default SchoolCard
