'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { formatCount } from '@/lib/helpers'
import pluralize from 'pluralize'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import SchoolStore from '@/src/zustand/school/School'
import { MessageStore } from '@/src/zustand/notification/Message'
import { useTheme } from '@/context/ThemeProvider'
import PictureDisplay from '@/components/Home/Media/PictureDisplay'
import ApplicationBottomSheet from '@/components/School/ApplicationBottomSheet'
import MessageForm from '@/components/School/MessageForm'
import { validateInputs } from '@/lib/validation'

const SchoolLayout = ({ children }: { children: React.ReactNode }) => {
  const { username } = useParams()
  const { user, bioUser, bioUserState } = AuthStore()
  const {
    getSchool,
    updateItem,
    setApplication,
    apply,
    setApplicationForm,
    showApplicationForm,
    showApplication,
    schoolData,
    loading,
  } = SchoolStore()
  const {
    messageContent,
    messageGreetings,
    messageTitle,
    setMessageTitle,
    setMessage,
  } = MessageStore()
  const [intro, setIntro] = useState('Write an intro about yourself...')
  const pathname = usePathname()
  const { theme } = useTheme()
  const [userRegistration, setUserRegistration] = useState('')
  const followAccount = (username: string) => {
    updateItem(
      `/users/follow/${username}`,
      { user: schoolData, followerId: user?._id },
      setMessage
    )
  }

  useEffect(() => {
    const query = window.location.search
    const user = new URLSearchParams(query).get('user')
    if (bioUserState && user && schoolData) {
      const index = bioUserState.offices.findIndex(
        (item) => item.username === schoolData.username
      )

      if (user === 'student' && schoolData.studentRegistration && index < 0) {
        setUserRegistration('Student')
      } else if (
        user === 'staff' &&
        schoolData.staffRegistration &&
        index < 0
      ) {
        setUserRegistration('Staff')
      }
      setMessageTitle(`${user} application ${schoolData.name}`)
    }
  }, [schoolData])

  useEffect(() => {
    if (schoolData.description) {
      setIntro(schoolData.description)
    } else {
      setIntro('Peace, Unity and Progress.')
    }
  }, [schoolData])

  useEffect(() => {
    if (schoolData.username !== String(username) && bioUserState) {
      getSchool(
        `/schools/${String(username)}?bioUserId=${bioUserState.bioUserId}`
      )
    }
  }, [username])

  const cancelApplication = () => {
    apply(
      `/schools/cancel/${schoolData._id}?username=${bioUser?.bioUserUsername}&bioUserId=${bioUser?._id}`,
      {},
      setMessage,
      () => setApplication(false)
    )
  }

  const handleSubmit = () => {
    const form = {
      bioUserId: bioUser?._id,
      userRegistration: userRegistration,
      content: messageContent,
      greetings: messageGreetings,
      title: messageTitle,
    }

    if (userRegistration === 'Staff') {
      const inputsToValidate = [
        {
          name: 'content',
          value: messageContent,
          rules: { blank: true, minLength: 3 },
          field: 'Content',
        },
        {
          name: 'greetings',
          value: messageGreetings,
          rules: { blank: true },
          field: 'Greetings',
        },
        {
          name: 'title',
          value: messageTitle,
          rules: { blank: true, maxSize: 10 },
          field: 'Title',
        },
      ]

      const { messages } = validateInputs(inputsToValidate)
      const getFirstNonEmptyMessage = (
        messages: Record<string, string>
      ): string | null => {
        for (const key in messages) {
          if (messages[key].trim() !== '') {
            return messages[key]
          }
        }
        return null
      }

      const firstNonEmptyMessage = getFirstNonEmptyMessage(messages)
      if (firstNonEmptyMessage) {
        setMessage(firstNonEmptyMessage, false)
        return
      }
    }

    apply(`/schools/apply/${schoolData._id}`, form, setMessage, () => {
      setApplicationForm(false)
      setApplication(false)
    })
  }

  return (
    <div className="pb-[55px] sm:pb-0">
      <div className="w-full bg-[var(--white)] overflow-hidden pb-0 mb-2">
        <div className="w-full overflow-hidden relative h-[200px] xs:h-[250px]  bg-[var(--white)]">
          {schoolData.media ? (
            <PictureDisplay
              source={String(schoolData.media)}
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
                  {schoolData?.logo ? (
                    <PictureDisplay source={String(schoolData.logo)} />
                  ) : (
                    <Image
                      src="/images/cap.png"
                      loading="lazy"
                      sizes="100vw"
                      className="w-full h-full object-contain"
                      width={100}
                      height={100}
                      alt="Default Avatar"
                    />
                  )}
                </div>
              </div>
              <div className="mt-2 flex-1 items-center flex flex-wrap">
                <div className="flex flex-wrap items-center mr-auto">
                  <div className="text-lg font-semibold text-[var(--text-secondary)] mr-2">
                    {schoolData.name}
                  </div>
                  {schoolData.isVerified && (
                    <i className="bi bi-shield-check text-[var(--custom)] mr-2"></i>
                  )}
                  {schoolData.username && (
                    <div className="post_username mr-2">
                      @{schoolData.username}{' '}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center mb-2 flex-wrap">
            <div className="flex mr-[12px]">
              <div className="text-[var(--text-title-color)] mr-1">
                {formatCount(Number(schoolData?.followers))}{' '}
              </div>{' '}
              {pluralize('Follower', Number(schoolData?.followers))}
            </div>
            <div className="flex mr-auto">
              <div className="text-[var(--text-title-color)] mr-1">0</div>{' '}
              Following
              <div className="mr-2"></div>
            </div>
            {schoolData.isVerified && (
              <div className="flex items-center">
                {/* <Link
                  className="mr-3 text-lg"
                  href={`/home/chat/friends/${schoolData.username}`}
                >
                  <i className="bi bi-info-circle text-[15px]"></i>
                </Link> */}
                <Link
                  className="mr-3 text-lg"
                  href={`/home/chat/friends/${schoolData.username}`}
                >
                  <i className="bi bi-envelope text-[15px]"></i>
                </Link>
                {userRegistration && (
                  <>
                    {!schoolData.isApplied ? (
                      <div
                        onClick={() => {
                          if (!bioUserState?.isVerified) {
                            setMessage(
                              `To apply, you have to verify your account`,
                              false
                            )
                            return
                          }
                          setApplication(!showApplication)
                        }}
                        className={` mr-3 text-white bg-[var(--custom-color)] border-[var(--custom)] flex items-center border rounded-[25px] cursor-pointer  sm:text-[16px] text-sm px-3 py-[1px] sm:py-[2px] sm:px-5`}
                      >
                        Apply
                      </div>
                    ) : (
                      <div
                        onClick={cancelApplication}
                        className={` mr-3 text-white bg-[var(--custom-color)] border-[var(--custom)] flex items-center border rounded-[25px] cursor-pointer  sm:text-[16px] text-sm px-3 py-[1px] sm:py-[2px] sm:px-5`}
                      >
                        Cancel
                      </div>
                    )}
                  </>
                )}
                <div
                  onClick={() => followAccount(schoolData.username)}
                  className={`${
                    schoolData.isFollowed
                      ? 'border-[var(--border)]'
                      : 'text-white bg-[var(--custom-color)]  border-[var(--custom)]'
                  } flex items-center border rounded-[25px] cursor-pointer  sm:text-[16px] text-sm px-3 py-[1px] sm:py-[2px] sm:px-5`}
                >
                  <div className="flex">
                    {loading && (
                      <i className={`bi bi-opencollective loading sm`}></i>
                    )}
                  </div>
                  {schoolData.isFollowed ? 'Unfollow' : 'Follow'}
                </div>
              </div>
            )}
          </div>

          <div className="relative mb-3 w-full">
            <div className="intro_input line-clamp-2 overflow-ellipsis">
              <div dangerouslySetInnerHTML={{ __html: intro }}></div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between border-b border-b-transparent">
            <Link
              href={`/home/school/${username}`}
              className={`profile_tab ${
                pathname === `/home/school/${username}` ? 'active' : ''
              }`}
            >
              <div className="text-[var(--text-title-color)] mb-1">
                {formatCount(Number(schoolData?.posts))}{' '}
              </div>
              <div className="text">
                {pluralize('Post', Number(schoolData?.posts))}
              </div>
            </Link>
            <Link
              href={`/home/school/${username}/comments`}
              className={`profile_tab ${
                pathname === `/home/school/${username}/comments` ? 'active' : ''
              }`}
            >
              <div className="text-[var(--text-title-color)] mb-1">
                {formatCount(Number(schoolData?.comments))}{' '}
              </div>
              <div className="text">
                {' '}
                {pluralize('Reply', Number(schoolData?.comments))}
              </div>
            </Link>
            <Link
              href={`/home/school/${username}/exams`}
              className={`profile_tab ${
                pathname === `/home/school/${username}/exams` ? 'active' : ''
              }`}
            >
              <div className="text-[var(--text-title-color)] mb-1">0</div>
              <div className="text">Exams</div>
            </Link>
            <div className="profile_tab ">
              <div className="text-[var(--text-title-color)] mb-1">0</div>
              <div className="text">Media</div>
            </div>
          </div>
        </div>
      </div>

      {children}

      <ApplicationBottomSheet />

      {showApplicationForm && bioUser && (
        <MessageForm
          sender={{
            address: bioUser.residentAddress,
            area: bioUser.residentArea,
            state: bioUser.residentState,
            country: bioUser.residentCountry,
            name: bioUser.bioUserDisplayName,
          }}
          receiver={{
            address: bioUser.residentAddress,
            area: bioUser.residentArea,
            state: bioUser.residentState,
            country: bioUser.residentCountry,
            name: bioUser.bioUserDisplayName,
          }}
          referrence="The Management"
          buttonName="Submit Application"
          handleSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default SchoolLayout
