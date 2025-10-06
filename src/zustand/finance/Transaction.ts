import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Transaction[]
  wallet: Wallet
}

export interface Transaction {
  userId: string
  username: string
  email: string
  picture: string
  name: string
  status: boolean
  title: string
  amount: number
  charge: number
  logo: string
  description: string
  country: string
  countryFlag: string
  countrySymbol: string
  currency: string
  currencySymbol: string
  createdAt: Date | null
  isChecked?: boolean
  isActive?: boolean
}
export const TransactionEmpty = {
  userId: '',
  username: '',
  email: '',
  picture: '',
  name: '',
  status: false,
  title: '',
  amount: 0,
  charge: 0,
  logo: '',
  description: '',
  country: '',
  countryFlag: '',
  countrySymbol: '',
  currency: '',
  currencySymbol: '',
  createdAt: null,
}

export interface Wallet {
  _id: string
  username: string
  userId: string
  bioId: string
  picture: string
  balance: number
  spent: number
  received: number

  country: string
  countryFlag: string
  countrySymbol: string
  currency: string
  currencySymbol: string
  createdAt: Date | null
}

export const WalletEmpty = {
  _id: '',
  username: '',
  userId: '',
  bioId: '',
  picture: '',
  balance: 0,
  spent: 0,
  received: 0,

  country: '',
  countryFlag: '',
  countrySymbol: '',
  currency: '',
  currencySymbol: '',
  createdAt: null,
}

interface TransactionState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  transactions: Transaction[]
  loading: boolean
  error: string | null
  successs?: string | null
  selectedItems: Transaction[]
  searchedPositions: Transaction[]
  isAllChecked: boolean
  transactionForm: Transaction
  walletForm: Wallet
  setForm: (
    key: keyof Transaction,
    value: Transaction[keyof Transaction]
  ) => void
  resetForm: () => void
  getTransactions: (url: string) => Promise<void>
  getAWallet: (url: string) => Promise<void>
  getAPayment: (url: string) => Promise<void>
  setProcessedResults: (data: FetchResponse) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedItems: Transaction[],
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
  createTransaction: (
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

const TransactionStore = create<TransactionState>((set) => ({
  links: null,
  count: 0,
  page_size: 0,
  transactions: [],
  loading: false,
  error: null,
  selectedItems: [],
  searchedPositions: [],
  isAllChecked: false,
  walletForm: WalletEmpty,
  transactionForm: TransactionEmpty,
  setForm: (key, value) =>
    set((state) => ({
      walletForm: {
        ...state.walletForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      walletForm: WalletEmpty,
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Transaction) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        transactions: updatedResults,
      })
    }
  },

  getTransactions: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: TransactionStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        TransactionStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getAPayment: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: TransactionStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({ transactionForm: data.results[0] })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getAWallet: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: TransactionStore.getState().setLoading,
      })
      const data = response?.data
      if (data.wallet) {
        set({ walletForm: data.wallet })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      transactions: state.transactions.map((item: Transaction) => ({
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
      const updatedResults = results.map((item: Transaction) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))
      set({ searchedPositions: updatedResults })
    }
  }, 1000),

  massDelete: async (
    url: string,
    selectedItems: Transaction[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: selectedItems,
        setMessage,
        setLoading: TransactionStore.getState().setLoading,
      })
    } catch (error) {
      console.log(error)
    }
  },

  deleteItem: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      await apiRequest<FetchResponse>(url, {
        method: 'DELETE',
        setMessage,
        setLoading: TransactionStore.getState().setLoading,
      })
    } catch (error) {
      console.log(error)
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
      setLoading: TransactionStore.getState().setLoading,
    })
    if (response?.data) {
      TransactionStore.getState().setProcessedResults(response.data)
    }
  },

  createTransaction: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      set({ loading: true, error: null })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: updatedItem,
        setMessage,
      })
      const data = response.data
      if (data) {
        TransactionStore.getState().setProcessedResults(data)
      }
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.transactions[index]?.isActive
      const updatedResults = state.transactions.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        transactions: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.transactions.map((tertiary, idx) =>
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
        state.transactions.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.transactions.map((place) => ({
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

export default TransactionStore
