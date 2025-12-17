'use client'
import { playPopSound } from '@/lib/sound'
import useSocket from '@/src/useSocket'
import {
  SocialNotification,
  SocialNotificationStore,
} from '@/src/zustand/notification/SocialNotification'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { BioUser } from '@/src/zustand/user/BioUser'
import { BioUserSchoolInfo } from '@/src/zustand/user/BioUserSchoolInfo'
import { BioUserState } from '@/src/zustand/user/BioUserState'
import { createContext, useEffect, useContext, ReactNode, useMemo } from 'react'

const UserContext = createContext<{
  socket: ReturnType<typeof useSocket> | null
}>({
  socket: null,
})

interface UserProviderProps {
  children: ReactNode
}

interface NotificationData {
  socialNotification: SocialNotification
  bioUserState: BioUserState
  bioUser: BioUser
  bioUserSchoolInfo: BioUserSchoolInfo
  unreadNotifications: number
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const socket = useSocket()
  const { user, bioUser } = AuthStore()

  useEffect(() => {
    if (!user || !socket) return
    //////////////PERSONAL NOTIFICATION//////////////
    socket.on(
      `social_notification_${user?.username}`,
      (data: NotificationData) => {
        playPopSound()

        if (data.socialNotification) {
          SocialNotificationStore.setState((prev) => {
            const notes = [data.socialNotification, ...prev.socialNotifications]
            return {
              socialNotifications: notes,
              unreadNotifications: data.unreadNotifications,
            }
          })
        }
      }
    )

    //////////////STATE UPDATE//////////////
    return () => {
      socket?.off(`social_notification_${user.username}`)
    }
  }, [socket, user])

  useEffect(() => {
    if (!bioUser || !socket) return

    socket.on(`update_state_${bioUser._id}`, (data: NotificationData) => {
      if (data.bioUserState) {
        AuthStore.getState().setBioUserState(data.bioUserState)
      }
      if (data.bioUser) {
        AuthStore.getState().setBioUser(data.bioUser)
      }
      if (data.bioUserSchoolInfo) {
        AuthStore.getState().setBioUserSchoolInfo(data.bioUserSchoolInfo)
      }
    })

    return () => {
      socket?.off(`update_state_${bioUser._id}`)
    }
  }, [socket, bioUser])

  const value = useMemo(() => ({ socket }), [socket])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUserContext = () => useContext(UserContext)
