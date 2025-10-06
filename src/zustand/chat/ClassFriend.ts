import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'
import { Chat, ChatContent } from '@/src/zustand/chat/Chat'

interface FetchChatResponse {
  count: number
  message: string
  page_size: number
  results: ChatContent[]
}

interface FetchChat {
  count: number
  message: string
  page_size: number
  data: ChatContent
}

interface ChatState {
  links: { next: string | null; previous: string | null } | null
  count: number
  current: number
  newCount: number
  page_size: number
  friendsResults: ChatContent[]
  loading: boolean
  error: string | null
  successs?: string | null
  selectedItems: ChatContent[]
  searchResult: ChatContent[]
  isAllChecked: boolean

  getFriends: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>

  setProcessedResults: (data: ChatContent[]) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: ChatContent[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    refreshUrl?: string
  ) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    refreshUrl?: string
  ) => Promise<void>

  groupNewChatsByDay: (chats: ChatContent[], oldChats: Chat[]) => Chat[]
  groupChatsByDay: (chats: ChatContent[]) => Chat[]
  selectFriends: (id: string) => void
  addFriendsChat: (chats: ChatContent) => void
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchChats: (url: string) => void
}

const ClassFriendStore = create<ChatState>((set) => ({
  links: null,
  count: 1,
  current: 2,
  newCount: 0,
  page_size: 0,
  friendsResults: [],
  loading: false,
  error: null,
  selectedItems: [],
  searchResult: [],
  isAllChecked: false,
  setProcessedResults: (results) => {
    set({
      loading: false,
      friendsResults: results,
    })
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  groupChatsByDay(chats: ChatContent[]): Chat[] {
    const grouped: Record<string, ChatContent[]> = {}

    chats.forEach((chat) => {
      if (!grouped[chat.day]) {
        grouped[chat.day] = []
      }
      grouped[chat.day].push(chat)
    })

    return Object.entries(grouped)
      .map(([day, chats]) => ({
        day,
        chats: chats.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
      }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
  },

  groupNewChatsByDay(newChats: ChatContent[], oldGrouped: Chat[]): Chat[] {
    const oldChats = oldGrouped.flatMap((group) => group.chats)
    const combinedChats = [...newChats, ...oldChats]

    const uniqueChatsMap = new Map<string, ChatContent>()

    combinedChats.forEach((chat) => {
      uniqueChatsMap.set(chat._id, chat)
    })

    const uniqueChats = Array.from(uniqueChatsMap.values())
    set({
      newCount: uniqueChats.length,
    })
    const grouped: Record<string, ChatContent[]> = {}

    uniqueChats.forEach((chat) => {
      if (!grouped[chat.day]) {
        grouped[chat.day] = []
      }
      grouped[chat.day].push(chat)
    })

    return Object.entries(grouped)
      .map(([day, chats]) => ({
        day,
        chats: chats.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
      }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
  },

  addFriendsChat: async (saved: ChatContent) => {
    ClassFriendStore.setState((prev) => {
      const oldFriends = [...prev.friendsResults]
      let exists = false

      const updatedFriends = oldFriends.map((friend) => {
        if (friend.connection === saved.connection) {
          exists = true
          return saved
        }
        return friend
      })

      if (!exists) {
        updatedFriends.push(saved)
      }

      return {
        friendsResults: updatedFriends,
      }
    })
  },

  getFriends: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchChatResponse>(url, {
        setMessage,
        setLoading: ClassFriendStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        ClassFriendStore.getState().setProcessedResults(data.results)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      friendsResults: state.friendsResults.map((item: ChatContent) => ({
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
        error: 'Failed to search items',
        loading: false,
      })
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
    })

    const data = response?.data
    if (data) {
      const ids = ['']
      set((state) => {
        const selectedUpdatedChats = state.friendsResults
          .filter((chat) => !ids.includes(chat._id))
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

  updateItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true, error: null })
    const response = await apiRequest<FetchChat>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: ClassFriendStore.getState().setLoading,
    })
    const data = response?.data
    if (data) {
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

  selectFriends: (_id: string) => {
    set((state) => {
      const updatedResults = state.friendsResults.map((chat) => {
        const isChecked = chat._id === _id ? !chat.isChecked : chat.isChecked
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

export default ClassFriendStore
