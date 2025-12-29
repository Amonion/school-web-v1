import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'
import { User } from '../user/User'
import { addRecordsToDB, getRecordsFromDB } from '@/lib/indexDB'

interface FetchAccountResponse {
  count: number
  message: string
  page_size: number
  results: User[]
  id: string
  isFollowed: boolean
}

interface AccountState {
  count: number
  page_size: number
  accounts: User[]
  loading: boolean
  hasMoreSearch: boolean
  searchedAccountResult: User[]
  searchResult: User[]
  searchedAccounts: User[]
  isAllChecked: boolean
  getSavedAccounts: (user: User) => Promise<void>
  getAccounts: (url: string) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    refreshUrl?: string
  ) => Promise<void>
  clearSearchedItem: () => void
  setSearchedAccountResult: () => void
  searchAccount: (url: string) => void
  getQueryAccounts: (url: string) => void
}

export const AccountStore = create<AccountState>((set, get) => ({
  count: 0,
  page_size: 20,
  accounts: [],
  loading: false,
  hasMoreSearch: true,
  selectedAccounts: [],
  searchResult: [],
  searchedAccounts: [],
  searchedAccountResult: [],
  isAllChecked: false,

  setSearchedAccountResult: () => {
    set((prev) => {
      return {
        hasMoreSearch: prev.searchedAccountResult.length > prev.page_size,
        searchedAccounts: prev.searchedAccountResult,
        searchedAccountResult: [],
      }
    })
  },

  clearSearchedItem: () => {
    set({ searchedAccountResult: [] })
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  getSavedAccounts: async (user) => {
    try {
      const accounts = await getRecordsFromDB<User>('accounts', 20, 1)
      if (accounts.length > 0) {
        set({ accounts: accounts })
      }
      get().getAccounts(
        `/users/accounts/?myId=${user._id}&_id[ne]=${user._id}&page_size=40&page=1`
      )
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getAccounts: async (url: string) => {
    try {
      const response = await apiRequest<FetchAccountResponse>(url)
      const data = response?.data
      if (data) {
        const fetchedAccounts = data.results
        const savedAccounts = AccountStore.getState().accounts
        const first20Fetched = fetchedAccounts.slice(0, 20)
        if (savedAccounts.length > 0 && savedAccounts.length < 20) {
          set((prev) => {
            const existingIds = new Set(prev.accounts.map((a) => a._id))
            const filtered = first20Fetched.filter(
              (a) => !existingIds.has(a._id)
            )

            return {
              accounts: [...prev.accounts, ...filtered],
            }
          })
        } else if (savedAccounts.length === 0) {
          set({ accounts: first20Fetched })
        }
        addRecordsToDB('accounts', data.results)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getQueryAccounts: async (url: string) => {
    try {
      const response = await apiRequest<FetchAccountResponse>(url)
      const { results } = response?.data
      if (results) {
        set((prev) => {
          return {
            searchedAccounts: results,
            hasMoreSearch: prev.searchedAccountResult.length === prev.page_size,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  searchAccount: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchAccountResponse>(url)
      const { results } = response?.data
      if (results) {
        const updatedResults = results.map((item: User) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedAccountResult: updatedResults })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  }, 1000),

  updateItem: async (url, updatedItem) => {
    const response = await apiRequest<FetchAccountResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
    })
    const data = response.data
    if (data) {
      set((prev) => {
        const updatedAccounts = prev.accounts.map((item) =>
          item._id === data.id ? { ...item, followed: data.isFollowed } : item
        )
        const account = updatedAccounts.find((item) => item._id === data.id)
        if (account) {
          addRecordsToDB('accounts', [account])
        }
        return {
          accounts: updatedAccounts,
        }
      })
    }
  },
}))
