import { create } from 'zustand'
import apiRequest from '@/lib/axios'

interface FetchMomentResponse {
  count: number
  message: string
  page_size: number
  results: Moment[]
}

export interface MomentMedia {
  type: string
  src: string
  preview: string
  content: string
  backgroundColor: string
  isViewed: boolean
}
export const MomentMediaEmpty = {
  type: '',
  backgroundColor: '#da3986',
  src: '',
  preview: '',
  content: '',
  isViewed: false,
}

export interface Moment {
  media: MomentMedia[]
  _id: string
  username: string
  displayName: string
  picture: string
  createdAt: Date | null
}

export const MomentEmpty = {
  media: [],
  _id: '',
  username: '',
  displayName: '',
  picture: '',
  createdAt: null,
}

interface MomentState {
  count: number
  page_size: number
  currentPage: number
  moments: Moment[]
  loading: boolean
  moment: Moment
  hasMore: boolean
  isPlaying: boolean
  showMoment: boolean
  setShowMoment: (state: boolean) => void
  setForm: (key: keyof Moment, value: Moment[keyof Moment]) => void
  resetForm: () => void
  getMoments: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchMomentResponse) => void
  deleteMoment: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  postItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
}

export const MomentStore = create<MomentState>((set) => ({
  count: 0,
  page_size: 20,
  currentPage: 1,
  moments: [],
  moment: MomentEmpty,
  loading: false,
  hasMore: false,
  showMoment: false,
  isPlaying: true,
  setForm: (key, value) =>
    set((state) => ({
      moment: {
        ...state.moment,
        [key]: value,
      },
    })),

  resetForm: () =>
    set({
      moment: MomentEmpty,
    }),

  setShowMoment: (state) =>
    set({
      showMoment: state,
    }),

  setProcessedResults: ({ count, results }: FetchMomentResponse) => {
    set({
      loading: false,
      count,
      moments: results,
    })
  },

  getMoments: async (url, setMessage) => {
    try {
      const response = await apiRequest<FetchMomentResponse>(url, {
        setMessage,
      })
      const data = response?.data
      if (data) {
        console.log(data)
        MomentStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  postItem: async (url, updatedItem, setMessage) => {
    set({ loading: true })
    const response = await apiRequest<FetchMomentResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
    })
    const data = response?.data
    if (data) {
      MomentStore.getState().setProcessedResults(data)
    }
  },

  deleteMoment: async (url, setMessage) => {
    set({ loading: true })
    const response = await apiRequest<FetchMomentResponse>(url, {
      method: 'DELETE',
      setMessage,
    })
    const data = response?.data
    if (data) {
      MomentStore.getState().setProcessedResults(data)
    }
  },
}))
