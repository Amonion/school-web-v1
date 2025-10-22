import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'
import { initDB, updatePendingMessageStatus } from '@/lib/indexDB'

export const saveOrUpdateMessageInDB = async (message: ChatContent) => {
  const db = await initDB()
  await db.put('messages', {
    ...message,
    createdAt: new Date().toISOString(),
  })
}

export const getMessagesByConnection = async (
  connection: string
): Promise<ChatContent[]> => {
  const db = await initDB()
  const index = db.transaction('messages').store.index('connection')
  return index.getAll(connection)
}

interface FetchChatResponse {
  count: number
  unread: number
  message: string
  page_size: number
  results: ChatContent[]
}

interface FetchUserResponse {
  count: number
  message: string
  page_size: number
  data: ChatUserForm
}

interface ChatState {
  chatContentResults: ChatContent[]
  chatResults: Chat[]
  connection: string
  count: number
  current: number
  favChatContentResults: ChatContent[]
  favChatResults: Chat[]
  isAllChecked: boolean
  isFriends: boolean
  loading: boolean
  moveUp: boolean
  newCount: number
  page_size: number
  repliedChat: RepliedChatContent | null
  searchResult: ChatContent[]
  selectedFavItems: ChatContent[]
  selectedItems: ChatContent[]
  senderUsername: string
  successs?: string | null
  unread: number
  chatUserForm: ChatUserForm
  getSavedChats: (url: string) => Promise<void>
  getChats: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getFavChats: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  addChats: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  addFavChats: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getChatUser: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  addSearchedChats: (url: string, createdAt: Date) => Promise<void>
  addFavSearchedChats: (url: number, createdAt: Date) => Promise<void>
  setProcessedResults: (data: ChatContent[]) => void
  processMoreResults: (data: ChatContent[]) => void
  setProcessedFavResults: (data: Chat[]) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: ChatContent[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (data: socketResponse) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    refreshUrl?: string
  ) => Promise<void>

  updatePendingChat: (chats: ChatContent) => void
  selectChats: (id: string) => void
  setConnection: (connection: string) => void
  addNewChat: (saved: ChatContent) => void
  updateChats: (chat: ChatContent[], message?: string) => void
  selectFavChats: (id: number) => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchChats: (url: string) => void
  pendingReadIds: React.MutableRefObject<Set<string>>
  resetPendingReadIds: () => void
}

export interface ChatUserForm {
  username: string
  displayName: string
  picture: string
  _id: string
}

export const ChatUserFormEmpty = {
  username: '',
  displayName: '',
  picture: '',
  _id: '',
}

export const ChatContentEmpty = {
  _id: '',
  connection: '',
  content: '',
  isSent: false,
  isRead: false,
  deletedUsername: '',
  repliedChat: null,
  isSavedUsernames: '',
  isReadUsernames: '',
  isPinned: false,
  from: '',
  senderUsername: '',
  senderPicture: '',
  media: [],
  day: '',
  receiverUsername: '',
  receiverPicture: '',
  status: '',
  unread: 0,
  unreadCount: 0,
  unreadReceiver: 0,
  unreadUser: 0,
  senderTime: new Date(),
  createdAt: new Date(),
  time: new Date(),
  receiverTime: new Date(),
}

export const ChatStore = create<ChatState>((set) => ({
  chatContentResults: [],
  chatResults: [],
  connection: '',
  count: 0,
  current: 0,
  chatUserForm: ChatUserFormEmpty,
  favChatContentResults: [],
  favChatResults: [],
  isAllChecked: false,
  isFriends: false,
  loading: false,
  moveUp: false,
  newCount: 0,
  page_size: 0,
  pendingReadIds: { current: new Set<string>() },
  repliedChat: null,
  searchResult: [],
  selectedFavItems: [],
  selectedItems: [],
  senderUsername: '',
  unread: 0,

  resetPendingReadIds: () => {
    set((state) => {
      state.pendingReadIds.current.clear()
      return { pendingReadIds: state.pendingReadIds }
    })
  },

  processMoreResults: (results) => {
    set({
      loading: false,
      chatContentResults: results,
    })
  },

  setProcessedResults: (newResults) => {
    set((prev) => {
      const combined = [...prev.chatContentResults, ...newResults]

      // Remove duplicates based on `timeNumber`
      const unique = combined.filter(
        (chat, index, self) =>
          index === self.findIndex((c) => c.timeNumber === chat.timeNumber)
      )

      // Sort by timeNumber (optional but recommended)
      unique.sort((a, b) => a.timeNumber - b.timeNumber)

      return {
        loading: false,
        chatContentResults: unique,
      }
    })
  },

  setProcessedFavResults: (results) => {
    set({
      loading: false,
      favChatResults: results,
    })
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setConnection: (connection: string) => {
    set({ connection: connection })
  },

  getChatUser: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchUserResponse>(url, {
        setMessage,
      })
      const data = response?.data
      if (data) {
        set({
          chatUserForm: data.data,
          loading: false,
        })
      }
    } catch (error: unknown) {
      if (error) return
    }
  },

  getChats: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchChatResponse>(url, {
        setMessage,
        setLoading: ChatStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        ChatStore.getState().setProcessedResults(data.results)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getSavedChats: async (connection) => {
    try {
      const chats = await getMessagesByConnection(connection)
      if (chats) {
        ChatStore.getState().setProcessedResults(chats)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getFavChats: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchChatResponse>(url, {
        setMessage,
        setLoading: ChatStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  addChats: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const current = ChatStore.getState().current
    if (ChatStore.getState().newCount === ChatStore.getState().count) {
      return
    }

    try {
      const response = await apiRequest<FetchChatResponse>(
        `${url}&page=${current}`,
        { setMessage, setLoading: ChatStore.getState().setLoading }
      )
      const data = response?.data
      if (data) {
        set((state) => {
          return {
            count: data.count,
            current: state.current + 1,
          }
        })
        ChatStore.getState().processMoreResults(data.results)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  addNewChat: async (saved: ChatContent) => {
    ChatStore.setState((prev) => {
      const newChat = saved
      const chatDay = newChat.day
      const updatedResults = [...prev.chatResults]
      const chats = [...prev.chatContentResults]
      const updateChats = [...chats, newChat]
      const groupIndex = updatedResults.findIndex(
        (group) => group.day === chatDay
      )

      if (groupIndex !== -1) {
        updatedResults[groupIndex].chats.push(newChat)
      } else {
        updatedResults.push({
          day: chatDay,
          chats: [newChat],
        })
      }

      saveOrUpdateMessageInDB(saved)

      return {
        senderUsername: updateChats[updateChats.length - 1].senderUsername,
        chatResults: updatedResults,
        chatContentResults: updateChats,
      }
    })
  },

  updatePendingChat: async (newChat) => {
    updatePendingMessageStatus(
      newChat.connection,
      Number(newChat.timeNumber),
      newChat.status
    )

    ChatStore.setState((prev) => {
      const updatedResults = prev.chatContentResults.map((chat) =>
        chat.timeNumber === newChat.timeNumber ? newChat : chat
      )
      return { chatContentResults: updatedResults }
    })
  },

  updateChats: async (chats: ChatContent[], message = '') => {
    ChatStore.setState((prev) => {
      const newChats = chats
      const updatedResults: Chat[] = [...prev.chatResults]

      let shouldUpdate = false

      if (message === 'online') {
        updatedResults.forEach((group) => {
          group.chats = group.chats.map((chat) => {
            const replacement = newChats.find(
              (newChat) => Number(newChat.timeNumber) === chat.timeNumber
            )
            if (replacement) {
              shouldUpdate = true
              return replacement
            }
            return chat
          })
        })
      } else {
        updatedResults.forEach((group) => {
          group.chats = group.chats.map((chat) => {
            const replacement = newChats.find(
              (newChat) => newChat._id === chat._id
            )
            if (replacement) {
              shouldUpdate = true
              return replacement
            }
            return chat
          })
        })
      }

      if (shouldUpdate) {
        return { chatResults: updatedResults }
      }

      return prev
    })
  },

  addFavChats: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const current = ChatStore.getState().current
    if (ChatStore.getState().newCount === ChatStore.getState().count) {
      return
    }

    try {
      const response = await apiRequest<FetchChatResponse>(
        `${url}&page=${current}`,
        { setMessage, setLoading: ChatStore.getState().setLoading }
      )
      const data = response?.data
      if (data) {
        set((state) => {
          return {
            count: data.count,
            current: state.current + 1,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  addSearchedChats: async (id: string, createdAt: Date) => {
    try {
      const response = await apiRequest<FetchChatResponse>(
        `/user-messages/add-searched/?chatId=${id}&oldest=${new Date(
          createdAt
        ).getTime()}`,
        {
          setLoading: ChatStore.getState().setLoading,
        }
      )

      const data = response?.data
      if (data) {
        set((state) => {
          return {
            count: data.count,
            current: state.current + 1,
            searchResult: [],
            moveUp: true,
          }
        })
        ChatStore.getState().selectChats(String(data.results[0]._id))
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  addFavSearchedChats: async (id, createdAt) => {
    try {
      const response = await apiRequest<FetchChatResponse>(
        `/user-messages/add-searched/?chatId=${id}&oldest=${new Date(
          createdAt
        ).getTime()}`,
        {
          setLoading: ChatStore.getState().setLoading,
        }
      )
      const data = response?.data
      if (data) {
        set((state) => {
          return {
            count: data.count,
            current: state.current + 1,
            searchResult: [],
            moveUp: true,
          }
        })
        ChatStore.getState().selectFavChats(data.results[0].timeNumber)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      chatResults: state.chatResults.map((item: Chat) => ({
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
      set({ loading: false })
    }
  }, 1000),

  massDelete: async (
    url: string,
    selectedItems: ChatContent[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchChatResponse>(url, {
      method: 'POST',
      body: selectedItems,
      setMessage,
      setLoading: ChatStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      const ids = [0]
      set((state) => {
        const selectedUpdatedChats = state.chatResults.map((group) => ({
          ...group,
          chats: group.chats
            .filter((chat) => !ids.includes(chat.timeNumber))
            .map((chat) => {
              return {
                ...chat,
                isAlert: false,
              }
            }),
        }))

        return {
          chatResults: selectedUpdatedChats,
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

  deleteItem: async (data: socketResponse) => {
    ChatStore.setState((prev) => {
      const chatDay = data.day
      const updatedResults = [...prev.chatResults]
      const updatedFavResults = [...prev.favChatResults]
      const groupIndex = updatedResults.findIndex(
        (group) => group.day === chatDay
      )
      const groupFavIndex = updatedFavResults.findIndex(
        (group) => group.day === chatDay
      )

      if (groupIndex !== -1) {
        const updatedChats = updatedResults[groupIndex].chats.filter(
          (chat) => chat._id !== data.id
        )

        if (updatedChats.length > 0) {
          updatedResults[groupIndex].chats = updatedChats
        } else {
          updatedResults.splice(groupIndex, 1)
        }
      }

      if (groupFavIndex !== -1) {
        const updatedChats = updatedFavResults[groupFavIndex].chats.filter(
          (chat) => chat._id !== data.id
        )

        if (updatedChats.length > 0) {
          updatedFavResults[groupFavIndex].chats = updatedChats
        } else {
          updatedFavResults.splice(groupFavIndex, 1)
        }
      }

      return { chatResults: updatedResults, favChatResults: updatedFavResults }
    })
  },

  updateItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<FetchChatResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: ChatStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
      const chats = data.results
      if (url.includes('unsave')) {
        set((state) => {
          const updatedChatResults = state.favChatResults.map((group) => ({
            ...group,
            chats: group.chats.filter(
              (chat) => !chats.some((c) => c._id === chat._id)
            ),
          }))

          return {
            favChatResults: updatedChatResults,
            loading: false,
            selectedFavItems: [],
          }
        })
      } else {
        set((state) => {
          const updatedChatResults = state.chatResults.map((group) => ({
            ...group,
            chats: group.chats.map((chat) => {
              const updatedChat = chats.find((c) => c._id === chat._id)
              return updatedChat ? { ...updatedChat, isAlert: false } : chat
            }),
          }))

          return {
            chatResults: updatedChatResults,
            loading: false,
            selectedItems: [],
          }
        })
      }
    }
  },

  toggleActive: (index: number) => {
    console.log(index)
  },

  toggleChecked: (index: number) => {
    console.log(index)
  },

  selectChats: (_id: string) => {
    set((state) => {
      const chatExists = state.chatResults.some((group) =>
        group.chats.some((chat) => chat._id === _id)
      )

      if (!chatExists) {
        const oldestCreatedAt = (() => {
          let oldest: Date | null = null

          ChatStore.getState().chatResults.forEach((group) => {
            group.chats.forEach((chat) => {
              const chatDate = new Date(chat.timeNumber)
              if (!oldest || chatDate < oldest) {
                oldest = chatDate
              }
            })
          })

          return oldest
        })()

        if (oldestCreatedAt) {
          ChatStore.getState().addSearchedChats(_id, oldestCreatedAt)
        }
        return {}
      }

      const updatedResults = state.chatResults.map((group) => ({
        ...group,
        chats: group.chats.map((chat) => {
          const isChecked = chat._id === _id ? !chat.isChecked : chat.isChecked
          return {
            ...chat,
            isChecked,
            isAlert:
              state.selectedItems.length < 2 && !isChecked ? true : false,
          }
        }),
      }))

      const allChats = updatedResults.flatMap((group) => group.chats)
      const updatedSelectedItems = allChats.filter((chat) => chat.isChecked)

      const newUpdatedResults = updatedResults.map((group) => ({
        ...group,
        chats: group.chats.map((chat) => ({
          ...chat,
          isAlert: updatedSelectedItems.length === 0 ? false : true,
        })),
      }))

      const isAllChecked =
        allChats.length > 0 && updatedSelectedItems.length === allChats.length

      return {
        searchResult: [],
        chatResults: newUpdatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  selectFavChats: (timeNumber) => {
    set((state) => {
      const chatExists = state.favChatResults.some((group) =>
        group.chats.some((chat) => chat.timeNumber === timeNumber)
      )

      if (!chatExists) {
        const oldestCreatedAt = (() => {
          let oldest: Date | null = null

          ChatStore.getState().favChatResults.forEach((group) => {
            group.chats.forEach((chat) => {
              const chatDate = new Date(chat.timeNumber)
              if (!oldest || chatDate < oldest) {
                oldest = chatDate
              }
            })
          })

          return oldest
        })()

        if (oldestCreatedAt) {
          ChatStore.getState().addFavSearchedChats(timeNumber, oldestCreatedAt)
        }
        return {}
      }

      const updatedResults = state.favChatResults.map((group) => ({
        ...group,
        chats: group.chats.map((chat) => {
          const isChecked =
            chat.timeNumber === timeNumber ? !chat.isChecked : chat.isChecked
          return {
            ...chat,
            isChecked,
            isAlert:
              state.selectedFavItems.length < 2 && !isChecked ? true : false,
          }
        }),
      }))

      const allChats = updatedResults.flatMap((group) => group.chats)
      const updatedSelectedItems = allChats.filter((chat) => chat.isChecked)

      const newUpdatedResults = updatedResults.map((group) => ({
        ...group,
        chats: group.chats.map((chat) => ({
          ...chat,
          isAlert: updatedSelectedItems.length === 0 ? false : true,
        })),
      }))

      const isAllChecked =
        allChats.length > 0 && updatedSelectedItems.length === allChats.length

      return {
        searchResult: [],
        favChatResults: newUpdatedResults,
        selectedFavItems: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.chatResults.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.chatResults.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      // const updatedSelectedItems = isAllChecked ? updatedResults : [];

      return {
        chatResults: updatedResults,
        // selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export interface Chat {
  day: string
  chats: ChatContent[]
}

export const Chat = {
  day: '',
  chats: [],
}

export interface FileType {
  type: string
  source: string
  name: string
  size: number
  duration: number
  pages: number
}

export interface ChatContent {
  connection: string
  content: string
  senderUsername: string
  media: FileType[]
  day: string
  receiverUsername: string
  status: string
  timeNumber: number
  deletedUsername?: string
  repliedChat?: RepliedChatContent | null
  isPinned?: boolean
  unread?: number
  unreadCount?: number
  unreadReceiver?: number
  unreadUser?: number
  senderTime?: Date
  receiverTime?: Date
  isSavedUsernames?: string[]
  _id?: string
  isChecked?: boolean
  isActive?: boolean
  isAlert?: boolean
}

export interface RepliedChatContent {
  content: string
  senderUsername: string
  media: FileType[]
  receiverUsername: string
  senderTime?: Date
  receiverTime?: Date
  _id?: string
}

export interface socketResponse {
  key: string
  id: string
  day: string
  chat: ChatContent
  chats: ChatContent[]
}
