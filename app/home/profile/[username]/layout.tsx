'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCount, formatDate } from '@/lib/helpers'
import pluralize from 'pluralize'
import { UserStore } from '@/src/zustand/user/User'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { useTheme } from '@/context/ThemeProvider'
import PictureDisplay from '@/components/Home/Media/PictureDisplay'
import ProfileBottomSheet from '@/components/Home/Profile/ProfileBottomSheet'
import UserPostStore from '@/src/zustand/post/UserPost'
import UserMediaHolder from '@/components/Home/Media/UserMediaHolder'
import { MessageCircle } from 'lucide-react'
import FriendStore, { FriendEmpty } from '@/src/zustand/chat/Friend'
import { ChatStore } from '@/src/zustand/chat/Chat'

const Profile = ({ children }: { children: React.ReactNode }) => {
  const { username } = useParams()
  const { user } = AuthStore()
  const { page_size, currentPage, getPosts } = UserPostStore()
  const { getUser, setShowProfileSheet, userForm, updateMyUser, loading } =
    UserStore()
  const { setMessage } = MessageStore()
  const [showFollow, setShowFollow] = useState(false)
  const [tab, setTab] = useState('posts')
  const [intro, setIntro] = useState('Write an intro about yourself...')
  const pathname = usePathname()
  const { theme } = useTheme()
  const router = useRouter()
  const { getSavedChats, setConnection, connection } = ChatStore()

  const urls = ['comments', 'exams', 'media']

  const followAccount = () => {
    updateMyUser(
      `/users/follow/${username}`,
      { user: userForm, followerId: user?._id },
      setMessage
    )
  }

  const findPosts = async () => {
    getPosts(
      `/posts/user/?username=${username}&myId=${user?._id}&ordering=-createdAt&postType=main&page_size=${page_size}&page=${currentPage}`,
      setMessage
    )
  }

  const findFriend = FriendStore.getState().friendsResults.find(
    (item) => item.connection === connection
  )

  const selectFriend = () => {
    ChatStore.setState({
      chats: [],
      username: userForm.username,
      chatUserForm: {
        username: userForm.username,
        picture: String(userForm.picture),
        displayName: userForm.displayName,
        _id: '',
        isFriends: findFriend?.isFriends,
      },
    })
    getSavedChats(connection)

    FriendStore.setState((prev) => {
      const friend = prev.friendsResults.find(
        (item) => item.connection === connection
      )
      return {
        friendForm: friend ? friend : { ...FriendEmpty },
      }
    })

    router.push(`/chat`)
  }

  const setConnectionKey = (id1: string, id2: string) => {
    const participants = [id1, id2].sort()
    return participants.join('')
  }

  useEffect(() => {
    if (username && user) {
      findPosts()
    }
  }, [username, user, pathname])

  useEffect(() => {
    if (userForm.intro) {
      setIntro(userForm.intro)
    } else {
      if (user?.username !== username) {
        setIntro('My intro is not available now...')
      } else {
        setIntro('Write an intro about yourself...')
      }
    }

    if (user?.username !== username) {
      setShowFollow(true)
    } else {
      setShowFollow(false)
    }
  }, [userForm])

  useEffect(() => {
    if (username && user) {
      getUser(`/users/${username}`, setMessage)
      // getUserDetail(`/users/userinfo/${username}`, setMessage);
    }
  }, [username, pathname, user])

  useEffect(() => {
    const key = setConnectionKey(String(username), String(user?.username))
    setConnection(key)
    if (urls.every((word) => !pathname.includes(word))) {
      setTab('posts')
    }
    if (pathname.includes('comments')) {
      setTab('comments')
    }
    if (pathname.includes('media')) {
      setTab('media')
    }
  }, [pathname])

  return (
    <div className="relative">
      <div className="pb-[55px] sm:pb-0">
        <div className="w-full bg-[var(--white)] overflow-hidden pb-0 mb-2">
          <div className="w-full overflow-hidden relative h-[200px] xs:h-[250px]  bg-[var(--white)]">
            <div className="absolute right-1 top-1 rounded-[25px] bg-black/50 text-white py-1 px-2 text-[12px] items-center flex">
              {formatDate(String(user?.createdAt))}
            </div>
            {userForm.media ? (
              <PictureDisplay
                source={String(userForm.media)}
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
                    {userForm?.picture ? (
                      <PictureDisplay source={String(userForm.picture)} />
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
                      {userForm.displayName}
                    </div>
                    {userForm.isVerified && (
                      <i className="bi bi-shield-check text-[var(--custom)] mr-2"></i>
                    )}
                    <div className="post_username mr-2">
                      @{userForm.username}{' '}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center mb-2 flex-wrap">
              <div className="flex mr-[12px]">
                <div className="text-[var(--text-title-color)] mr-1">
                  {formatCount(Number(userForm?.followers))}{' '}
                </div>{' '}
                {pluralize('Follower', Number(userForm?.followers))}
              </div>
              <div className="flex mr-auto">
                <div className="text-[var(--text-title-color)] mr-1">
                  {' '}
                  {formatCount(Number(userForm?.followings))}{' '}
                </div>{' '}
                Following
                <div className="mr-2"></div>
              </div>
              {showFollow ? (
                <div className="flex items-center">
                  <div
                    className="mr-3 text-lg cursor-pointer"
                    onClick={() => selectFriend()}
                  >
                    <MessageCircle />
                  </div>
                  <div
                    onClick={followAccount}
                    className={`${
                      userForm.followed
                        ? 'border-[var(--border)]'
                        : 'text-white bg-[var(--custom-color)]  border-[var(--custom)]'
                    } flex items-center border rounded-[25px] cursor-pointer  sm:text-[16px] text-sm px-3 py-[1px] sm:py-[2px] sm:px-5`}
                  >
                    <div className="flex">
                      {loading && (
                        <i className={`bi bi-opencollective loading sm`}></i>
                      )}
                    </div>
                    {userForm.followed ? 'Unfollow' : 'Follow'}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div
                    onClick={() => setShowProfileSheet(true)}
                    className="cursor-pointer flex justify-center items-center w-8 h-8 rounded-full bg-[var(--white-gray)]"
                  >
                    <i
                      // onClick={() => toggleActive(post._id)}
                      className="bi bi-three-dots-vertical"
                    ></i>
                  </div>
                </div>
              )}
            </div>

            <div className="relative mb-3 w-full">
              <div className="intro_input">
                <div dangerouslySetInnerHTML={{ __html: intro }}></div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between border-b border-b-transparent">
              <Link
                href={`/home/profile/${username}`}
                className={`profile_tab ${tab === 'posts' ? 'active' : ''}`}
              >
                <div className="text-[var(--text-title-color)] mb-1">
                  {formatCount(Number(userForm?.posts))}{' '}
                </div>
                <div className="text">
                  {pluralize('Post', Number(userForm?.posts))}
                </div>
              </Link>
              <Link
                href={`/home/profile/${username}/comments`}
                className={`profile_tab ${tab === 'comments' ? 'active' : ''}`}
              >
                <div className="text-[var(--text-title-color)] mb-1">
                  {formatCount(Number(userForm?.comments))}{' '}
                </div>
                <div className="text">
                  {' '}
                  {pluralize('Reply', Number(userForm?.comments))}
                </div>
              </Link>
              <Link
                href={`/home/profile/${username}/media`}
                className={`profile_tab ${tab === 'media' ? 'active' : ''}`}
              >
                <div className="text-[var(--text-title-color)] mb-1">
                  {formatCount(userForm.postMedia)}
                </div>
                <div className="text">Media</div>
              </Link>
              {/* <div className="profile_tab ">
                <div className="text-[var(--text-title-color)] mb-1">0</div>
                <div className="text">Media</div>
              </div> */}
            </div>
          </div>
        </div>
        {children}
      </div>
      <div className="fixed z-40 flex justify-center bottom-0 left-0 w-full">
        <div className="custom_container">
          <div className="flex w-full relative">
            <div className="w-[270px] xl:w-[300px] hidden sm:flex"></div>
            <div className="sm:ml-5 relative flex-1 md:mr-5 border-l border-l-[var(--border)] border-r border-r-[var(--border)]">
              <ProfileBottomSheet />
            </div>
            <div className="w-[270px] xl:w-[300px] hidden md:block"></div>
          </div>
        </div>
      </div>
      <UserMediaHolder />
    </div>
  )
}

export default Profile
