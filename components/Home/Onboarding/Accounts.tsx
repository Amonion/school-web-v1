'use client'
import { useEffect } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import { UserStore } from '@/src/zustand/user/User'
import SearchedUser from '../Trace/PeopleResources/SearchedUsers'
const Accounts = () => {
  const { setMessage } = MessageStore()
  const { users, getUsers } = UserStore()

  useEffect(() => {
    getUsers(`/users/?page_size=20`, setMessage)
  }, [])

  return (
    <div className="welcome_slide">
      <div className="title">FOLLOW </div>
      <div className="text-sm">AT LEAST</div>
      <div className="intro_title">TWO USERS</div>

      <div className="w-full h-auto overflow-auto max-h-[400px]">
        {users.map((item, index) => (
          <SearchedUser key={index} user={item} index={index} />
        ))}
      </div>
    </div>
  )
}

export default Accounts
