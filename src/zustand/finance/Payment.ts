import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Payment[]
  data: Payment
}

export interface Payment {
  _id: string
  name: string
  title: string
  durationName: string
  duration: number
  amount: number
  charge: number
  logo: string | File | null
  description: string
  placeId: string
  country: string
  countryFlag: string
  countrySymbol: string
  currency: string
  currencySymbol: string
  isChecked?: boolean
  isActive?: boolean
}

export const PaymentEmpty = {
  _id: '',
  name: '',
  title: '',
  durationName: '',
  amount: 0,
  duration: 0,
  charge: 0,
  logo: '',
  description: '',
  placeId: '',
  country: '',
  countryFlag: '',
  countrySymbol: '',
  currency: '',
  currencySymbol: '',
}

interface PaymentState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  results: Payment[]
  quickPayments: Payment[]
  loading: boolean
  error: string | null
  successs?: string | null
  selectedItems: Payment[]
  searchedPositions: Payment[]
  isAllChecked: boolean
  formData: Payment
  setForm: (key: keyof Payment, value: Payment[keyof Payment]) => void
  resetForm: () => void
  getPayments: (url: string) => Promise<void>
  getQuickPayments: (url: string) => Promise<void>
  getAPayment: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: Payment[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  postItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchPosition: (url: string) => void
}

const PaymentStore = create<PaymentState>((set) => ({
  links: null,
  count: 0,
  page_size: 0,
  results: [],
  loading: false,
  error: null,
  selectedItems: [],
  searchedPositions: [],
  quickPayments: [],
  isAllChecked: false,
  formData: PaymentEmpty,
  setForm: (key, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [key]: value,
      },
    })),

  resetForm: () =>
    set({
      formData: PaymentEmpty,
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Payment) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        results: updatedResults,
      })
    }
  },

  getAPayment: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: PaymentStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ formData: data.data })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getPayments: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: PaymentStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        PaymentStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getQuickPayments: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: PaymentStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ quickPayments: data.results })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      results: state.results.map((item: Payment) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchPosition: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url)

    const results = response?.data.results
    if (results) {
      const updatedResults = results.map((item: Payment) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))
      set({ searchedPositions: updatedResults })
    }
  }, 1000),

  massDelete: async (
    url: string,
    selectedItems: Payment[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedItems,
      setMessage,
      setLoading: PaymentStore.getState().setLoading,
    })
    if (response) {
      console.log(response)
    }
  },

  deleteItem: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      setMessage,
      setLoading: PaymentStore.getState().setLoading,
    })
    if (response) {
      console.log(response)
    }
  },

  updateItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: PaymentStore.getState().setLoading,
    })
    if (response?.data) {
      PaymentStore.getState().setProcessedResults(response.data)
    }
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: PaymentStore.getState().setLoading,
    })
    if (response?.status !== 404 && response?.data) {
      PaymentStore.getState().setProcessedResults(response.data)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.results[index]?.isActive
      const updatedResults = state.results.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        results: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.results.map((tertiary, idx) =>
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
        results: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.results.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.results.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        results: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default PaymentStore
