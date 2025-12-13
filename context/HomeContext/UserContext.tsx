'use client'
import { playPopSound } from '@/lib/sound'
import useSocket from '@/src/useSocket'
import { MessageStore } from '@/src/zustand/notification/Message'
import {
  SocialNotification,
  SocialNotificationStore,
} from '@/src/zustand/notification/SocialNotification'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { BioUserStore } from '@/src/zustand/user/BioUser'
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
  unreadNotifications: number
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const socket = useSocket()
  const { getMyBioUser } = BioUserStore()
  const { setMessage } = MessageStore()
  const { user } = AuthStore()

  useEffect(() => {
    if (user && user.bioUserId) {
      getMyBioUser(`/biousers/${user?.bioUserId}`, setMessage)
    }
  }, [user])

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

  const value = useMemo(() => ({ socket }), [socket])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUserContext = () => useContext(UserContext)
