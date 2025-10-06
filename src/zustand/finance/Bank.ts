import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

export interface Bank {
  _id: string
  category: string
  picture: string | null | File
  name: string
  description: string
  username: string
  continent: string
  country: string
  countryFlag: string
  placeId: string
  isChecked?: boolean
  isActive?: boolean
}

export const BankEmpty = {
  _id: '',
  category: '',
  picture: '',
  name: '',
  description: '',
  username: '',
  continent: '',
  country: '',
  countryFlag: '',
  placeId: '',
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Bank[]
}

interface BankState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  banks: Bank[]
  loadingBanks: boolean
  error: string | null
  successs?: string | null
  selectedItems: Bank[]
  searchedItems: Bank[]
  isAllChecked: boolean
  itemFormData: Bank
  setBankForm: (key: keyof Bank, value: Bank[keyof Bank]) => void
  resetBankForm: () => void
  getBanks: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setBank: (item: Bank) => Promise<void>
  getBank: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: Bank[],
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
    setMessage: (message: string, isError: boolean) => void
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
  searchItem: (url: string) => void
}

const BankStore = create<BankState>((set) => ({
  links: null,
  count: 0,
  page_size: 0,
  banks: [],
  loadingBanks: false,
  error: null,
  selectedItems: [],
  searchedItems: [],
  isAllChecked: false,
  itemFormData: BankEmpty,
  setBankForm: (key, value) =>
    set((state) => ({
      itemFormData: {
        ...state.itemFormData,
        [key]: value,
      },
    })),
  resetBankForm: () =>
    set({
      itemFormData: BankEmpty,
    }),

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Bank) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        count,
        page_size,
        banks: updatedResults,
      })
    }
  },

  setLoading: (loadState: boolean) => {
    set({ loadingBanks: loadState })
  },

  getBanks: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: BankStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        BankStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  setBank: async (item: Bank) => {
    set({
      itemFormData: { ...BankStore.getState().itemFormData, ...item },
    })
  },

  getBank: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: BankStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({
          itemFormData: { ...BankStore.getState().itemFormData, ...data },
          loadingBanks: false,
        })
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      banks: state.banks.map((item: Bank) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchItem: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url, {
      setLoading: BankStore.getState().setLoading,
    })
    const results = response?.data.results
    if (results) {
      set({ searchedItems: results })
    }
  }, 1000),

  massDelete: async (
    url: string,
    selectedItems: Bank[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      body: selectedItems,
      setMessage,
    })
    if (response) {
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
      BankStore.getState().setProcessedResults(data)
    }
  },

  updateItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loadingBanks: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: BankStore.getState().setLoading,
    })
    if (response?.status !== 404 && response?.data) {
      BankStore.getState().setProcessedResults(response.data)
    }
  },

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loadingBanks: true, error: null })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: BankStore.getState().setLoading,
    })
    const result = response?.data
    if (result) {
      BankStore.getState().setProcessedResults(response?.data)
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.banks[index]?.isActive
      const updatedResults = state.banks.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        banks: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.banks.map((tertiary, idx) =>
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
        banks: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.banks.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.banks.map((Bank) => ({
        ...Bank,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        banks: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default BankStore
