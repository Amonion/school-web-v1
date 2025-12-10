import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: News[]
  data: News
}

export interface News {
  _id: string
  placeId: string
  title: string
  priority: string
  content: string
  author: string
  publishedAt: Date | null | number
  createdAt: Date | null | number
  isPublished: boolean
  state: string
  country: string
  views: number
  shares: number
  comments: number
  bookmarks: number
  likes: number
  replies: number
  tags: string[]
  continent: string
  picture: string | File | null
  video: string | File | null
  videoUrl: string
  category: string
  subtitle: string
  source: string
  bookmarked: boolean
  liked: boolean
  isFeatured: boolean
  isMain: boolean
  seoTitle: string
  seoDescription: string
  isChecked?: boolean
  isActive?: boolean
}

export const NewsEmpty = {
  _id: '',
  placeId: '',
  title: '',
  priority: '',
  content: '',
  author: '',
  publishedAt: null,
  createdAt: null,
  isPublished: false,
  state: '',
  country: '',
  views: 0,
  replies: 0,
  comments: 0,
  shares: 0,
  bookmarks: 0,
  likes: 0,
  tags: [],
  continent: '',
  picture: '',
  video: '',
  videoUrl: '',
  category: '',
  subtitle: '',
  source: '',
  bookmarked: false,
  liked: false,
  isFeatured: false,
  isMain: false,
  seoTitle: '',
  seoDescription: '',
}

interface NewsState {
  count: number
  page_size: number
  news: News[]
  featuredNews: News[]
  loading: boolean
  selectedItems: News[]
  searchedNews: News[]
  isAllChecked: boolean
  newsForm: News
  setForm: (key: keyof News, value: News[keyof News]) => void
  resetForm: () => void
  getFeaturedNews: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getItems: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getANews: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
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
  updateNews: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postItem: (
    url: string,
    data: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchNews: (url: string) => void
}

const NewsStore = create<NewsState>((set) => ({
  count: 0,
  page_size: 0,
  news: [],
  featuredNews: [],
  loading: false,
  selectedItems: [],
  searchedNews: [],
  isAllChecked: false,
  newsForm: NewsEmpty,
  setForm: (key, value) =>
    set((state) => ({
      newsForm: {
        ...state.newsForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      newsForm: NewsEmpty,
    }),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: News) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        news: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  getItems: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: NewsStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        NewsStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getFeaturedNews: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: NewsStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ featuredNews: data.results })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getANews: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: NewsStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ newsForm: data.data })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      news: state.news.map((item: News) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchNews: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url, {
      setLoading: NewsStore.getState().setLoading,
    })
    const results = response?.data.results
    if (results) {
      set({ searchedNews: results })
    }
  }, 1000),

  massDelete: async (
    url,
    selectedItems,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedItems,
      setMessage,
      setLoading: NewsStore.getState().setLoading,
    })
    const data = response?.data
    console.log(data)
    if (data) {
      NewsStore.getState().setProcessedResults(data)
    }
  },

  deleteItem: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading,
    })
    const data = response?.data
    if (data) {
      NewsStore.getState().setProcessedResults(data)
    }
  },

  updateNews: async (url, updatedItem, setMessage, redirect) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: NewsStore.getState().setLoading,
    })
    if (response?.data) {
      NewsStore.getState().setProcessedResults(response.data)
    }
    if (redirect) redirect()
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: NewsStore.getState().setLoading,
    })
    if (response?.status !== 404 && response?.data) {
      NewsStore.getState().setProcessedResults(response.data)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.news[index]?.isActive
      const updatedResults = state.news.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        news: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.news.map((tertiary, idx) =>
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
        news: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked = state.news.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.news.map((item) => ({
        ...item,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        news: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default NewsStore
