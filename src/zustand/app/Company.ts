import { create } from 'zustand'
import apiRequest from '@/lib/axios'

export interface Company {
  _id: string
  name: string
  domain: string
  finalInstruction: string
  email: string
  documents: string
  phone: string
  allowSignUp: boolean
  headquaters: string
  newVersion: string
  newVersionLink: string
}

export const CompanyEmpty = {
  _id: '',
  name: '',
  domain: '',
  finalInstruction: '',
  email: '',
  documents: '',
  phone: '',
  allowSignUp: false,
  headquaters: '',
  newVersion: '',
  newVersionLink: '',
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: Company[]
  company: Company
}

interface CompanyState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  results: Company[]
  loading: boolean
  error: string | null
  successs?: string | null
  selectedItems: Company[]
  searchResult: Company[]
  searchedResults: Company[]
  isAllChecked: boolean
  companyForm: Company
  setForm: (key: keyof Company, value: Company[keyof Company]) => void
  resetForm: () => void
  updateItem: (
    url: string,
    updatedItem: FormData,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getCompany: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
}

const CompanyStore = create<CompanyState>((set) => ({
  links: null,
  count: 0,
  page_size: 0,
  results: [],
  loading: false,
  error: null,
  selectedItems: [],
  searchResult: [],
  searchedResults: [],
  isAllChecked: false,
  companyForm: CompanyEmpty,
  setForm: (key, value) =>
    set((state) => ({
      companyForm: {
        ...state.companyForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      companyForm: CompanyEmpty,
    }),

  updateItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
    })
    const data = response.data
    if (data) {
      set({ companyForm: data.company, loading: false })
    }
  },

  getCompany: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'GET',
      setMessage,
    })
    const data = response.data
    if (data) {
      set({ loading: false, companyForm: data.company })
    }
  },
}))

export default CompanyStore
