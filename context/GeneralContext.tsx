'use client'
import { initializeSound } from '@/lib/sound'
import useSocket from '@/src/useSocket'
import { ChatContent, ChatStore } from '@/src/zustand/chat/Chat'
import FriendStore, { Friend } from '@/src/zustand/chat/Friend'
import { MessageStore } from '@/src/zustand/notification/Message'
import SchoolStore from '@/src/zustand/school/School'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import OfficeStore from '@/src/zustand/utility/Office'
import axios from 'axios'
import {
  createContext,
  useEffect,
  useContext,
  ReactNode,
  useMemo,
  useState,
} from 'react'

const GeneralContext = createContext<{
  socket: ReturnType<typeof useSocket> | null
}>({
  socket: null,
})

interface GeneralProviderProps {
  children: ReactNode
}

type response = {
  friend: Friend
  connection: string
  totalUnread: number
  isFriends: boolean
  userId: string
  ids: number[]
  username: string
  pending: boolean
  chat: ChatContent
  chats: ChatContent[]
}

export const GeneralProvider = ({ children }: GeneralProviderProps) => {
  const socket = useSocket()
  const { setIp, setBaseUrl, setMessage, baseURL } = MessageStore()
  const { getSavedFriends, getFriends, updatePendingFriendsChat } =
    FriendStore()
  const { user } = AuthStore()
  const { getSchoolNotifications } = SchoolStore()
  const { officeForm } = OfficeStore()
  const { connection, updatePendingChat } = ChatStore()
  const [chat, setChat] = useState<ChatContent | null>(null)

  useEffect(() => {
    initializeSound()
    getSavedFriends()
    const url =
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_PROD_API_URL
        : process.env.NEXT_PUBLIC_DEV_API_URL
    setBaseUrl(String(url))
  }, [])

  useEffect(() => {
    if (user) {
      getFriends(
        `/chats/friends?username=${user.username}&page=1&page_size=40`,
        setMessage
      )
    }
  }, [user])

  useEffect(() => {
    //***********GET AND STORE IP ***********//
    const getIp = async () => {
      try {
        const response = await axios.get(`${baseURL}user-ip`)
        const { ip } = response.data
        setIp(ip)
        localStorage.setItem('ip', ip)
        updateUserPresence(ip, true)
      } catch (error) {
        console.error('Error fetching user location:', error)
      }
    }

    //***********GET AND STORE IP ***********//
    const handleEnter = () => {
      if (baseURL) {
        const retrievedIp = localStorage.getItem('ip')
        if (
          retrievedIp !== null &&
          retrievedIp !== undefined &&
          retrievedIp !== 'undefined'
        ) {
          updateUserPresence(retrievedIp, true)
        } else {
          getIp()
        }
      }
    }

    const handleExit = () => {
      const retrievedIp = localStorage.getItem('ip')
      if (
        retrievedIp !== null &&
        retrievedIp !== undefined &&
        retrievedIp !== 'undefined'
      ) {
        updateUserPresence(retrievedIp, false)
      }
    }

    window.addEventListener('beforeunload', handleExit)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') handleEnter()
    })

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handleExit()
    })

    return () => {
      window.removeEventListener('beforeunload', handleExit)
      document.removeEventListener('visibilitychange', handleExit)
    }
  }, [baseURL, socket])

  ///////////////GET SCHOOL NOTIFICATIONS///////////////
  useEffect(() => {
    if (!officeForm) return
    if (!officeForm.username) return
    getSchoolNotifications(
      `/schools/notifications/?username=${officeForm.username}`,
      setMessage
    )
  }, [officeForm])

  useEffect(() => {
    if (!socket) return

    if (user) {
      socket.on(`updatePendingChat${user.username}`, (data: response) => {
        updatePendingChat(data.chat)
        setChat(data.chat)
        updatePendingFriendsChat(data.friend)
        FriendStore.setState((prev) => {
          return {
            friendForm: {
              ...prev.friendForm,
              isFriends: data.isFriends,
            },
          }
        })
      })

      socket.on(`updateChatToDelivered${user.username}`, (data: response) => {
        updatePendingChat(data.chat)
        updatePendingFriendsChat(data.friend)
      })

      socket.on(`updateCheckedChats${user.username}`, (data: response) => {
        for (let i = 0; i < data.chats.length; i++) {
          const el = data.chats[i]
          updatePendingChat(el)
        }
      })
    }

    return () => {
      socket.off(`updateCheckedChats${user?.username}`)
      socket.off(`updateChatToDelivered${user?.username}`)
      socket.off(`updatePendingChat${connection}`)
    }
  }, [user, socket])

  useEffect(() => {
    if (!socket) return
    if (chat) {
      socket.emit(`message`, { to: 'deliveredChat', chat })
    }
    return () => {
      socket.off(`deliveredChat${user?.username}`)
    }
  }, [chat, socket])

  const updateUserPresence = async (ip: string, online: boolean) => {
    try {
      const data = {
        ip: ip,
        username: user?.username,
        userId: user?._id,
        bioUserId: user?.bioUserId,
        online: online,
        visitedAt: new Date(),
      }

      const formData = {
        data: data,
        to: 'users',
        action: 'visit',
      }

      socket?.emit('message', formData)
    } catch (error) {
      console.error('Error fetching user location:', error)
    }
  }

  const value = useMemo(() => ({ socket }), [socket])

  return (
    <GeneralContext.Provider value={value}>{children}</GeneralContext.Provider>
  )
}

export const useGeneralContext = () => useContext(GeneralContext)
