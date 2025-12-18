import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import _debounce from 'lodash/debounce'
import { User } from '../user/User'
import { initDB } from '@/lib/indexDB'

export const getGiveawayFromDB = async (
  limit: number,
  page: number
): Promise<Weekend[]> => {
  const db = await initDB()
  const allPosts = await db.getAll('giveaway')
  const start = (page - 1) * limit
  const end = start + limit
  return allPosts.slice(start, end)
}

export interface Weekend {
  _id: string
  title: string
  instruction: string
  country: string
  continent: string
  levels: string
  question: string
  priority: string
  answer: string
  price: number
  video: string
  isPublished: boolean
  isMain: boolean
  isFeatured: boolean
  picture: string | File
  state: string
  area: string
  bioUserUsername: string
  publishedAt: Date | null
  endAt: Date | null
  startAt: Date | null | string
  duration: number
  category: string
  createdAt: Date | null
  status: string
  likes: number
  bookmarks: number
  views: number
  comments: number
  shares: number
  isChecked?: boolean
  isActive?: boolean
}

export const WeekendEmpty = {
  _id: '',
  title: '',
  instruction: '',
  country: '',
  continent: '',
  levels: '',
  question: '',
  priority: '',
  answer: '',
  price: 0,
  video: '',
  picture: '',
  state: '',
  area: '',
  isMain: false,
  isFeatured: false,
  isPublished: false,
  bioUserUsername: '',
  publishedAt: null,
  duration: 0,
  likes: 0,
  bookmarks: 0,
  views: 0,
  comments: 0,
  shares: 0,
  category: '',
  createdAt: null,
  startAt: null,
  endAt: null,
  status: '',
}

interface FetchResponse {
  message: string
  count: number
  attempt: number
  page_size: number
  results: Weekend[]
  data: Weekend
  weekend: Weekend
}

interface WeekendState {
  count: number
  page_size: number
  weekends: Weekend[]
  giveaways: Weekend[]
  searchedWeekends: Weekend[]
  loading: boolean
  selectedItems: Weekend[]
  searchedWeekendResults: Weekend[]
  hasMoreSearch: boolean
  isAllChecked: boolean
  weekendForm: Weekend
  setForm: (key: keyof Weekend, value: Weekend[keyof Weekend]) => void
  resetForm: () => void
  getWeekends: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getGiveaways: (url: string) => Promise<void>
  getSavedGiveaways: (user: User) => Promise<void>
  getAWeekend: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  massDelete: (
    url: string,
    selectedItems: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateWeekend: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  createWeekend: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  clearSearchedWeekends: () => void
  searchWeekends: (url: string) => void
  getQueryWeekends: (url: string) => void
}

const WeekendStore = create<WeekendState>((set) => ({
  count: 0,
  page_size: 20,
  weekends: [],
  giveaways: [],
  searchedWeekends: [],
  loading: false,
  hasMoreSearch: true,
  selectedItems: [],
  searchedWeekendResults: [],
  isAllChecked: false,
  weekendForm: WeekendEmpty,
  setForm: (key, value) =>
    set((state) => ({
      weekendForm: {
        ...state.weekendForm,
        [key]: value,
      },
    })),

  resetForm: () =>
    set({
      weekendForm: WeekendEmpty,
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  clearSearchedWeekends: () => {
    set({
      searchedWeekendResults: [],
    })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Weekend) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        weekends: updatedResults,
      })
    }
  },

  getSavedGiveaways: async (user) => {
    try {
      const giveaways = await getGiveawayFromDB(20, 1)
      if (giveaways.length > 0) {
        set({ giveaways })
      }
      WeekendStore.getState().getGiveaways(
        `/weekends/giveaway/?subscriberId=${user?._id}&country=${user.country}&state=${user.state}&area=${user.area}&page_size=40&page=1`
      )
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getGiveaways: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      const data = response?.data
      if (data) {
        const storedGiveaway = WeekendStore.getState().giveaways
        if (storedGiveaway.length === 0) {
          set({ giveaways: data.results })
        }
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getWeekends: async (url: string) => {
    try {
      set({ loading: true })
      const response = await apiRequest<FetchResponse>(url)
      const data = response?.data
      if (data) {
        WeekendStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  getAWeekend: async (url: string) => {
    try {
      set({ loading: true })
      const response = await apiRequest<FetchResponse>(url)
      const data = response?.data
      if (data) {
        set({
          weekendForm: data.data,
        })
      }
    } catch (error: unknown) {
      console.error(error)
    } finally {
      set({ loading: false })
    }
  },

  getQueryWeekends: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            searchedWeekends: data.results,
            loading: false,
            hasMoreSearch: data.results.length === prev.page_size,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      weekends: state.weekends.map((item: Weekend) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchWeekends: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: Weekend) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedWeekendResults: updatedResults })
      }
    } catch (error: unknown) {
      console.log(error)
      set({ loading: false })
    }
  }, 1000),

  massDelete: async (url, selectedItems, setMessage) => {
    try {
      set({ loading: true })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: selectedItems,
        setMessage,
      })
      if (response) {
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: true })
    }
  },

  deleteItem: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        method: 'DELETE',
        setMessage,
      })
      const data = response?.data
      if (data) {
        WeekendStore.getState().setProcessedResults(data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  updateWeekend: async (url, updatedItem, setMessage, redirect) => {
    try {
      set({ loading: true })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
      })
      if (response?.data) {
        WeekendStore.getState().setProcessedResults(response.data)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  createWeekend: async (url, updatedItem, setMessage, redirect) => {
    try {
      set({ loading: true })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: updatedItem,
        setMessage,
      })
      if (response?.data) {
        WeekendStore.getState().setProcessedResults(response.data)
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.weekends[index]?.isActive
      const updatedResults = state.weekends.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        weekends: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.weekends.map((tertiary, idx) =>
        idx === index
          ? { ...tertiary, isChecked: !tertiary.isChecked }
          : tertiary
      )

      const isAllChecked = updatedResults.every(
        (tertiary) => tertiary.isChecked
      )
      const updatedSelectedItems = updatedResults.filter(
        (tertiary) => tertiary.isChecked
      )

      return {
        weekends: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.weekends.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.weekends.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        weekends: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default WeekendStore
