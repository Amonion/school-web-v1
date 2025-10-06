import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

import { Media } from '../post/Post'

export interface Ad {
  _id: string
  category: string
  charge: number
  quantity: number
  area: string
  approved: boolean
  status: string
  picture: File | null | string
  media: Media[]
  displayName: string
  username: string
  tags: string[]
  areas: string[]
  states: string[]
  countries: string[]
  period: string
  description: string
  state: string
  durationName: string
  amount: number
  duration: number
  distribution: string
  country: string
  currency: string
  currencySymbol: string
  countrySymbol: string
  placeId: string
  publishedAt: Date
  onReview: boolean
  isEditing: boolean
  isChecked?: boolean
  isActive?: boolean
}

export const AdEmpty = {
  _id: '',
  category: '',
  picture: '',
  approved: false,
  charge: 0,
  state: '',
  status: '',
  period: '',
  area: '',
  tags: [],
  areas: [],
  states: [],
  countries: [],
  media: [],
  displayName: '',
  username: '',
  description: '',
  amount: 0,
  duration: 1,
  quantity: 1,
  distribution: '',
  durationName: '',
  country: '',
  currency: '',
  currencySymbol: '',
  countrySymbol: '',
  placeId: '',
  isEditing: false,
  onReview: false,
  publishedAt: new Date(),
}

export interface AdGraph {
  day: string
  editing: number
  online: number
  reviews: number
}

export interface AdResult {
  adStats: AdStat
  isEditing: AdStat
  onReview: AdStat
  online: AdStat
  adPercentageChange: number
  editingPercentageChange: number
  onlinePercentageChange: number
  reviewPercentageChange: number
  currency: string
  lineData: AdGraph[]
}

export interface AdStat {
  totalAds: number
  totalAmount: number
  totalDuration: number
}

export const adStatEmpty = {
  totalAds: 0,
  totalAmount: 0,
  totalDuration: 0,
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Ad[]
  data: Ad
  result: AdResult
}

interface AdState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page: number
  page_size: number
  adStage: number
  currency: string
  adPercentageChange: number
  editingPercentageChange: number
  onlinePercentageChange: number
  reviewPercentageChange: number
  itemResults: Ad[]
  loadingAds: boolean
  adStat: AdStat
  onlineStat: AdStat
  editingStat: AdStat
  reviewingStat: AdStat
  lineData: AdGraph[]
  draftAd: boolean
  error: string | null
  successs?: string | null
  selectedItems: Ad[]
  searchedItems: Ad[]
  isAllChecked: boolean
  itemFormData: Ad
  setItemForm: (key: keyof Ad, value: Ad[keyof Ad]) => void
  resetForm: () => void
  getAds: (url: string) => Promise<void>
  getAd: (url: string) => Promise<void>
  getDraftAd: (url: string) => Promise<void>
  getAdStats: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setAdStage: (stage: number) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: Ad[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postItem: (
    url: string,
    data: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchItem: (url: string) => void
}

const AdStore = create<AdState>((set) => ({
  links: null,
  count: 0,
  page_size: 10,
  adStage: 1,
  page: 1,
  adPercentageChange: 0,
  editingPercentageChange: 0,
  onlinePercentageChange: 0,
  reviewPercentageChange: 0,
  lineData: [],
  currency: '',
  itemResults: [],
  adStat: adStatEmpty,
  onlineStat: adStatEmpty,
  editingStat: adStatEmpty,
  reviewingStat: adStatEmpty,
  loadingAds: false,
  error: null,
  selectedItems: [],
  searchedItems: [],
  isAllChecked: false,
  draftAd: false,
  itemFormData: AdEmpty,
  setItemForm: (key, value) =>
    set((state) => ({
      itemFormData: {
        ...state.itemFormData,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      itemFormData: AdEmpty,
    }),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Ad) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        itemResults: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loadingAds: loadState })
  },
  setAdStage: (stage: number) => {
    set({ adStage: stage })
  },

  getAds: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: AdStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        AdStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getDraftAd: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: AdStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            itemFormData: data.data ? data.data : prev.itemFormData,
            draftAd: data.data ? true : false,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getAdStats: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: AdStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            adStat: data.result ? data.result.adStats : prev.adStat,
            adPercentageChange: data.result.adPercentageChange,
            editingStat: data.result ? data.result.isEditing : prev.editingStat,
            editingPercentageChange: data.result.editingPercentageChange,
            onlineStat: data.result ? data.result.online : prev.onlineStat,
            onlinePercentageChange: data.result.onlinePercentageChange,
            reviewingStat: data.result
              ? data.result.onReview
              : prev.reviewingStat,
            reviewPercentageChange: data.result.reviewPercentageChange,
            currency: data.result.currency,
            lineData: data.result.lineData,
          }
        })
        console.log(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getAd: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: AdStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            itemFormData: data.data ? data.data : prev.itemFormData,
            draftAd: data.data ? true : false,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      itemResults: state.itemResults.map((item: Ad) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchItem: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url, {
      setLoading: AdStore.getState().setLoading,
    })
    const results = response?.data.results
    if (results) {
      set({ searchedItems: results })
    }
  }, 1000),

  massDelete: async (
    url: string,
    selectedItems: Ad[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      setMessage,
      body: selectedItems,
    })
    if (response) {
      console.log(response)
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
      AdStore.getState().setProcessedResults(data)
    }
  },

  updateItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => {
    try {
      set({ loadingAds: true, error: null })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: AdStore.getState().setLoading,
      })
      const data = response.data.data
      if (data) {
        set((prev) => {
          const updatedAds = prev.itemResults.map((item) =>
            item._id === data._id ? data : item
          )
          return { itemFormData: data, itemResults: updatedAds }
        })
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loadingAds: false, error: null })
    }
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => {
    try {
      set({ loadingAds: true, error: null })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: updatedItem,
        setMessage,
      })
      const data = response.data.data
      if (data) {
        set({ itemFormData: data })
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loadingAds: false })
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.itemResults[index]?.isActive
      const updatedResults = state.itemResults.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        itemResults: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.itemResults.map((tertiary, idx) =>
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
        itemResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.itemResults.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.itemResults.map((Ad) => ({
        ...Ad,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        itemResults: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default AdStore
