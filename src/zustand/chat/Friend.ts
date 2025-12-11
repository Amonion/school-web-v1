import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'
import {
  clearTable,
  initDB,
  updatePendingFriendMessageStatus,
} from '@/lib/indexDB'
import { PreviewFile } from './Chat'
import { User } from '../user/User'

export const saveOrUpdateFriendInDB = async (friend: Friend) => {
  const db = await initDB()
  await db.put('friends', {
    ...friend,
    updatedAt: new Date().toISOString(),
  })
}

export const getAllFriendsFromDB = async (): Promise<Friend[]> => {
  const db = await initDB()
  return db.getAll('friends')
}

interface UnreadMessage {
  username: string
  unread: number
}

export interface Friend {
  senderDisplayName: string
  senderUsername: string
  senderPicture: string
  receiverDisplayName: string
  receiverUsername: string
  receiverPicture: string
  content: string
  status: string
  media: PreviewFile[]
  connection: string
  createdAt: Date | null
  timeNumber: number
  isFriends: boolean
  unreadMessages?: UnreadMessage[]
  updatedAt?: Date
  totalUnread?: number
  isOnline?: boolean
  isActive?: boolean
  isChecked?: boolean
}

export const FriendEmpty = {
  senderDisplayName: '',
  senderUsername: '',
  senderPicture: '',
  receiverDisplayName: '',
  receiverUsername: '',
  receiverPicture: '',
  content: '',
  media: [],
  status: '',
  connection: '',
  createdAt: null,
  timeNumber: 0,
  totalUnread: 0,
  isFriends: false,
  isOnline: false,
}

interface FetchChatResponse {
  count: number
  message: string
  page_size: number
  totalUnread: number
  results: Friend[]
}

interface FriendState {
  count: number
  current: number
  totalUnread: number
  page_size: number
  friendsResults: Friend[]
  friendForm: Friend
  loading: boolean
  selectedItems: Friend[]
  searchResult: Friend[]
  isAllChecked: boolean
  getFriends: (url: string) => Promise<void>
  getSavedFriends: (user: User) => Promise<void>
  setProcessedResults: (data: Friend[]) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: Friend[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    refreshUrl?: string
  ) => Promise<void>
  selectFriends: (id: string) => void
  updateFriendsChat: (chats: Friend) => void
  updatePendingFriendsChat: (data: Friend) => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchChats: (url: string) => void
}

const FriendStore = create<FriendState>((set) => ({
  count: 1,
  current: 2,
  totalUnread: 0,
  page_size: 0,
  friendsResults: [],
  friendForm: FriendEmpty,
  loading: false,
  error: null,
  selectedItems: [],
  searchResult: [],
  isAllChecked: false,

  setProcessedResults: (results) => {
    set((prev) => {
      if (results.length) {
      }
      const combined = [...results, ...prev.friendsResults]
      const unique = combined.filter(
        (chat, index, self) =>
          index === self.findIndex((c) => c.connection === chat.connection)
      )

      unique.sort((a, b) => b.timeNumber - a.timeNumber)
      return {
        loading: false,
        friendsResults: unique,
      }
    })
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  updateFriendsChat: async (friendChat) => {
    set((prev) => {
      const existingIndex = prev.friendsResults.findIndex(
        (item) => item.connection === friendChat.connection
      )

      const updatedFriends = [...prev.friendsResults]

      if (existingIndex >= 0) {
        updatedFriends[existingIndex] = {
          ...updatedFriends[existingIndex],
          ...friendChat,
          isOnline: updatedFriends[existingIndex].isOnline,
        }

        const [movedItem] = updatedFriends.splice(existingIndex, 1)
        updatedFriends.unshift(movedItem)
      } else {
        updatedFriends.unshift(friendChat)
      }

      saveOrUpdateFriendInDB(friendChat).catch(console.error)

      return {
        friendsResults: updatedFriends,
      }
    })
  },

  updatePendingFriendsChat: async (data) => {
    set((prev) => {
      const friends = prev.friendsResults.map((item) => {
        if (item.connection === data.connection) {
          return {
            ...item,
            status: data.status,
            updatedAt: data.updatedAt,
            unreadMessages: data.unreadMessages,
          }
        }
        return { ...item }
      })

      saveOrUpdateFriendInDB(data).catch(console.error)

      updatePendingFriendMessageStatus(
        data.connection,
        data.status,
        data.isFriends
      )
      return { friendsResults: friends }
    })
  },

  getSavedFriends: async (user) => {
    try {
      const friends = await getAllFriendsFromDB()
      if (friends) {
        set({ friendsResults: friends })
      }
      FriendStore.getState().getFriends(
        `/chats/friends?username=${user.username}&page=1&page_size=40`
      )
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getFriends: async (url) => {
    try {
      const response = await apiRequest<FetchChatResponse>(url, {
        setLoading: FriendStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        FriendStore.getState().setProcessedResults(data.results)
        const results = data.results
        set((prev) => {
          if (results.length === 0) {
            clearTable('friends')
            return {
              friendsResults: [],
            }
          } else {
            const combined = [...results, ...prev.friendsResults]
            const unique = combined.filter(
              (chat, index, self) =>
                index ===
                self.findIndex((c) => c.connection === chat.connection)
            )
            unique.sort((a, b) => b.timeNumber - a.timeNumber)
            return {
              friendsResults: unique,
            }
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      friendsResults: state.friendsResults.map((item: Friend) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchChats: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchChatResponse>(url)
      if (response) {
        const { results } = response?.data
        set({ searchResult: results })
      }
    } catch (error: unknown) {
      console.log(error)
      set({
        loading: false,
      })
    }
  }, 1000),

  massDelete: async (url, selectedItems, setMessage) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchChatResponse>(url, {
      method: 'POST',
      body: selectedItems,
      setMessage,
    })

    const data = response?.data
    if (data) {
      const ids = ['']
      set((state) => {
        const selectedUpdatedChats = state.friendsResults
          .filter((chat) => !ids.includes(chat.connection))
          .map((chat) => {
            return {
              ...chat,
              isAlert: false,
            }
          })

        return {
          friendsResults: selectedUpdatedChats,
          loading: false,
          selectedItems: [],
        }
      })
    } else {
      set({
        loading: false,
      })
    }
  },

  deleteItem: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchChatResponse>(url, {
      method: 'POST',
      setMessage,
    })
    if (response) {
    }
  },

  toggleActive: (index: number) => {
    // set((state) => {
    //   const isCurrentlyActive = state.friendsResults[index]?.isActive;
    //   const updatedResults = state.friendsResults.map((tertiary, idx) => ({
    //     ...tertiary,
    //     isActive: idx === index ? !isCurrentlyActive : false,
    //   }));
    //   return {
    //     friendsResults: updatedResults,
    //   };
    // });
    console.log(index)
  },

  toggleChecked: (index: number) => {
    // set((state) => {
    //   const updatedResults = state.friendsResults.map((tertiary, idx) =>
    //     idx === index
    //       ? { ...tertiary, isChecked: !tertiary.isChecked }
    //       : tertiary
    //   );
    //   const isAllChecked = updatedResults.every(
    //     (tertiary) => tertiary.isChecked
    //   );
    //   const updatedSelectedItems = updatedResults.filter(
    //     (tertiary) => tertiary.isChecked
    //   );
    //   return {
    //     friendsResults: updatedResults,
    //     selectedItems: updatedSelectedItems,
    //     isAllChecked: isAllChecked,
    //   };
    // });
    console.log(index)
  },

  selectFriends: (connection: string) => {
    set((state) => {
      const updatedResults = state.friendsResults.map((chat) => {
        const isChecked =
          chat.connection === connection ? !chat.isChecked : chat.isChecked
        return {
          ...chat,
          isChecked,
          isAlert: state.selectedItems.length < 2 && !isChecked ? true : false,
        }
      })
      const updatedSelectedItems = updatedResults.filter(
        (chat) => chat.isChecked
      )
      const newUpdatedResults = updatedResults.map((chat) => {
        return {
          ...chat,
          isAlert: updatedSelectedItems.length === 0 ? false : true,
        }
      })
      //   const isAllChecked =
      //     allChats.length > 0 && updatedSelectedItems.length === allChats.length;
      return {
        searchResult: [],
        friendsResults: newUpdatedResults,
        selectedItems: updatedSelectedItems,
        // isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.friendsResults.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.friendsResults.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      // const updatedSelectedItems = isAllChecked ? updatedResults : [];

      return {
        friendsResults: updatedResults,
        // selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default FriendStore
