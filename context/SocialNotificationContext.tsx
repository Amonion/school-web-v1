'use client'
import { playPopSound } from '@/lib/sound'
import useSocket from '@/src/useSocket'
import { MessageStore } from '@/src/zustand/notification/Message'
import {
  SocialNotification,
  SocialNotificationStore,
} from '@/src/zustand/notification/SocialNotification'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { usePathname } from 'next/navigation'
import { createContext, useEffect, useContext, ReactNode, useMemo } from 'react'

const SocialNotificationContext = createContext<{
  socket: ReturnType<typeof useSocket> | null
}>({
  socket: null,
})

interface SocialNotificationProviderProps {
  children: ReactNode
}

interface NotificationData {
  socialNotification: SocialNotification
  unreadNotifications: number
}

export const SocialNotificationProvider = ({
  children,
}: SocialNotificationProviderProps) => {
  const socket = useSocket()
  const { socialNotifications, readNotifications, getNotifications } =
    SocialNotificationStore()
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { user } = AuthStore()

  useEffect(() => {
    if (pathname === '/home/notifications' && user && socialNotifications) {
      const notes = socialNotifications.filter((e) => e.unread === true)
      if (notes.length > 0) {
        const noteIds = notes.map((note) => note._id)
        const form = new FormData()
        form.append('ids', JSON.stringify(noteIds))
        readNotifications(
          `/notifications/social/read/?username=${user?.username}`,
          form,
          setMessage
        )
      }
    }
  }, [pathname, user?._id, socialNotifications.length])

  useEffect(() => {
    if (user) {
      getNotifications(
        `/notifications/social/?page_size=20&page=1&ordering=-createdAt&receiverUsername=${user?.username}&senderUsername=${user?.username}`,
        setMessage
      )
    }
  }, [user?._id])

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
  }, [socket, user?._id])

  const value = useMemo(() => ({ socket }), [socket])

  return (
    <SocialNotificationContext.Provider value={value}>
      {children}
    </SocialNotificationContext.Provider>
  )
}

export const useSocialNotificationContext = () =>
  useContext(SocialNotificationContext)
