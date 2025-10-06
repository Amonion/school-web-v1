import { useEffect } from 'react'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { MessageStore } from '@/src/zustand/notification/Message'
import FriendStore from '@/src/zustand/chat/Friend'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import UsersList from '../Chat/UsersList'

export default function AsideFriends() {
  const { asideNav, toggleAsideVNav } = NavStore()

  const { getFriends } = FriendStore()
  const { user, bioUser } = AuthStore()
  const { setMessage } = MessageStore()

  useEffect(() => {
    if (user && bioUser && bioUser.bioUserDisplayName === 'dd') {
      getFriends(
        `/user-messages/friends/?accountUsername=${user.username}&username=${bioUser.bioUserUsername}&isFriends=true`,
        setMessage
      )
    }
  }, [user?.username, bioUser?.bioUserUsername])

  return (
    <div
      onClick={toggleAsideVNav}
      className={` ${asideNav ? 'right-0' : 'right-[-100%]'} v_nav aside`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        className="v_nav_card aside"
      >
        <UsersList />
      </div>
    </div>
  )
}
