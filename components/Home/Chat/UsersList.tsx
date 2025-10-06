import { useEffect } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import FriendStore from '@/src/zustand/chat/Friend'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import FriendsList from './FriendsList'

export default function UsersList() {
  const { getFriends } = FriendStore()
  const { user, bioUser } = AuthStore()
  const { setMessage } = MessageStore()

  useEffect(() => {
    if (
      user &&
      bioUser &&
      bioUser.bioUserUsername &&
      bioUser.bioUserDisplayName === '..s'
    ) {
      getFriends(
        `/user-messages/friends/?accountUsername=${user.username}&username=${bioUser.bioUserUsername}&isFriends=true`,
        setMessage
      )
    }
  }, [user, bioUser?.bioUserUsername])

  return (
    <>
      <div
        className={`rounded-[20px] bg-[var(--secondary)] mb-10 h-[40px] mt-5 w-full flex items-center px-2`}
      >
        <input
          type="search"
          // onChange={(e) => setSearchedText(e.target.value)}
          className={`bg-[var(--secondary)] border-none outline-none flex-1`}
          placeholder={`Search friend or conversation...`}
        />
        <i className="bi bi-search common-icon cursor-pointer"></i>
      </div>

      <FriendsList />
    </>
  )
}
