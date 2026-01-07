'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import CustomBtn from '@/components/CustomBtn'
import FriendStore from '@/src/zustand/chat/Friend'

const NoFriends = () => {
  const router = useRouter()
  const { friendsResults } = FriendStore()

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="my-5 text-xl text-[var(--textSecondary)] font-semibold text-center">
          {friendsResults.length
            ? 'Enjoying Schooling Social?'
            : ' You have no friends'}
        </div>
        <Image
          src={'/images/socialize.svg'}
          loading="lazy"
          sizes="100vw"
          className="h-full max-h-[60%] max-w-[200px] w-auto object-contain"
          width={0}
          height={0}
          alt="Schooling Social Logo"
        />
        <div className="flex items-center w-full my-10 gap-5 justify-center">
          <div className="md:hidden">
            <div
              onClick={() => router.back()}
              className="flex items-center gap-1 custom_btn"
            >
              <i className="bi bi-arrow-left"></i>
              Go Back
            </div>
          </div>
          {friendsResults.length ? (
            <div className="flex justify-center">
              <CustomBtn label="Download The App" loading={false} />
            </div>
          ) : (
            <Link href={`/home/trace/accounts`}>
              <CustomBtn label="Search Friends" loading={false} />
            </Link>
          )}
        </div>
      </div>
    </>
  )
}

export default NoFriends
