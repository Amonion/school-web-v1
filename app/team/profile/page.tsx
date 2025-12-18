'use client'
import Image from 'next/image'
import { formatCount, formatDate } from '@/lib/helpers'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { useTheme } from '@/context/ThemeProvider'
import PictureDisplay from '@/components/Home/Media/PictureDisplay'
import UserMediaHolder from '@/components/Home/Media/UserMediaHolder'

const StaffProfile = () => {
  const { user, staff, bioUser } = AuthStore()
  const { theme } = useTheme()

  return (
    <div className="relative">
      <div className="pb-[55px] sm:pb-0">
        <div className="w-full bg-[var(--white)] overflow-hidden pb-0 mb-2">
          <div className="w-full overflow-hidden relative h-[200px] xs:h-[400px] bg-[var(--white)]">
            <div className="absolute right-1 top-1 rounded-[25px] bg-black/50 text-white py-1 px-2 text-[12px] items-center flex">
              {formatDate(String(user?.createdAt))}
            </div>
            {bioUser?.bioUserMedia ? (
              <PictureDisplay
                source={String(bioUser.bioUserMedia)}
                displayCover={true}
              />
            ) : (
              <PictureDisplay
                source={
                  theme === 'dark'
                    ? '/images/DLogoback.png'
                    : '/images/Logoback.png'
                }
                displayCover={true}
              />
            )}
          </div>
          <div className="px-[10px] ">
            <div className="flex flex-wrap mb-3 justify-between w-full">
              <div className="flex w-full">
                <div className="relative w-[74px] flex items-center justify-center min:w-[70px] h-[74px] mr-5 mt-[-35px] rounded-full border-2 border-[var(--custom-color)]">
                  <div className="bg-[var(--white-gray)] w-[70px] h-[70px] border-2 border-white rounded-full overflow-hidden relative">
                    {bioUser?.bioUserPicture ? (
                      <PictureDisplay source={String(bioUser.bioUserPicture)} />
                    ) : (
                      <Image
                        src="/images/avatar.png"
                        loading="lazy"
                        sizes="100vw"
                        className="w-full h-full object-cover"
                        width={100}
                        height={100}
                        alt="Default Avatar"
                      />
                    )}
                  </div>
                </div>
                <div className="mt-2 flex-1 items-center flex flex-wrap">
                  <div className="flex flex-wrap items-center mr-auto">
                    <div className="account_name mr-2">
                      {bioUser?.bioUserDisplayName}
                    </div>
                    {bioUser?.isVerified && (
                      <i className="bi bi-shield-check text-[var(--custom)] mr-2"></i>
                    )}
                    <div className="post_username mr-2">
                      @{bioUser?.bioUserUsername}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center mb-2 flex-wrap">
              <div className="flex mr-[12px]">
                Position
                <div className="text-[var(--text-title-color)] ml-1">
                  {staff?.position}
                </div>
              </div>
              <div className="flex mr-auto">
                Salary
                <div className="text-[var(--text-title-color)] ml-1">
                  {formatCount(Number(staff?.salary))}
                </div>
              </div>
            </div>

            <div className="relative mb-3 w-full">
              <div className="intro_input">
                <div
                  dangerouslySetInnerHTML={{ __html: String(staff?.duties) }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UserMediaHolder />
    </div>
  )
}

export default StaffProfile
