'use client'
// import { playPopSound } from '@/lib/sound'
import useSocket from '@/src/useSocket'
import {
  ChatContent,
  ChatStore,
  saveOrUpdateMessageInDB,
} from '@/src/zustand/chat/Chat'
import FriendStore, { Friend } from '@/src/zustand/chat/Friend'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import {
  createContext,
  useEffect,
  useContext,
  ReactNode,
  useMemo,
  useState,
} from 'react'

const ChatContext = createContext<{
  socket: ReturnType<typeof useSocket> | null
}>({
  socket: null,
})

interface ChatProviderProps {
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

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const socket = useSocket()
  const {
    friendsResults,
    updateFriendsChat,
    getSavedFriends,
    updatePendingFriendsChat,
  } = FriendStore()
  const { user } = AuthStore()
  const { connection, updatePendingChat } = ChatStore()
  const [chat, setChat] = useState<ChatContent | null>(null)

  useEffect(() => {
    if (friendsResults.length === 0 && user) {
      getSavedFriends(user)
    }
  }, [user?._id])

  useEffect(() => {
    if (!socket) return

    if (user) {
      socket.on(`addCreatedChat${user.username}`, (data: response) => {
        updateFriendsChat({ ...data.friend })
      })

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

      socket.on(`updateChatWithFile${user.username}`, (data: response) => {
        if (data.chat) {
          saveOrUpdateMessageInDB(data.chat)
          ChatStore.setState((prev) => {
            return {
              chats: prev.chats.map((item) =>
                item.timeNumber === data.chat.timeNumber ? data.chat : item
              ),
            }
          })
        }
      })
    }

    return () => {
      socket.off(`addCreatedChat${user?.username}`)
      socket.off(`updateChatWithFile${user?.username}`)
      socket.off(`updateCheckedChats${user?.username}`)
      socket.off(`updateChatToDelivered${user?.username}`)
      socket.off(`updatePendingChat${connection}`)
    }
  }, [user?._id, socket])

  useEffect(() => {
    if (!socket) return
    if (chat) {
      socket.emit(`message`, { to: 'deliveredChat', chat })
    }
    return () => {
      socket.off(`deliveredChat${user?.username}`)
    }
  }, [chat, socket])

  const value = useMemo(() => ({ socket }), [socket])

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChatContext = () => useContext(ChatContext)
