import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'

export interface IDocument {
  _id: string
  picture: string | File | null
  name: string
  tempDoc: string
  required: boolean
  description: string
  country: string
  countryFlag: string
  placeId: string
  isChecked?: boolean
  isActive?: boolean
}

export const DocumentEmpty = {
  _id: '',
  picture: '',
  name: '',
  tempDoc: '',
  required: false,
  description: '',
  country: '',
  countryFlag: '',
  placeId: '',
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: IDocument[]
  data: IDocument
}

interface DocumentState {
  count: number
  page_size: number
  documents: IDocument[]
  loading: boolean
  selectedItems: IDocument[]
  searched: IDocument[]
  isAllChecked: boolean
  isForm: boolean
  documentForm: IDocument
  setForm: (key: keyof IDocument, value: IDocument[keyof IDocument]) => void
  resetForm: (s: IDocument) => void
  showForm: (s: boolean) => void
  getDocuments: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getDocument: (
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
  updateItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  postItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  searchDocument: (url: string) => void
}

const DocumentStore = create<DocumentState>((set) => ({
  count: 0,
  page_size: 0,
  documents: [],
  loading: false,
  selectedItems: [],
  searched: [],
  isAllChecked: false,
  isForm: false,
  documentForm: DocumentEmpty,
  setForm: (key, value) =>
    set((state) => ({
      documentForm: {
        ...state.documentForm,
        [key]: value,
      },
    })),

  resetForm: (DocumentEmpty) => set({ documentForm: DocumentEmpty }),
  showForm: (loadState: boolean) => {
    set({ isForm: loadState })
  },
  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: IDocument) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        documents: updatedResults,
      })
    }
  },

  getDocuments: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: DocumentStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        DocumentStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  getDocument: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: DocumentStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({
          documentForm: data.data,
          loading: false,
        })
      }
    } catch (error: unknown) {
      console.log(error, setMessage)
    }
  },

  reshuffleResults: async () => {
    set((state) => ({
      documents: state.documents.map((item: IDocument) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchDocument: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url)

    const results = response?.data.results
    if (results) {
      const updatedResults = results.map((item: IDocument) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))
      set({ searched: updatedResults })
    }
  }, 1000),

  massDelete: async (url, selectedItems, setMessage) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      setMessage,
      body: selectedItems,
    })
    if (response) {
    }
  },

  deleteItem: async (url, setMessage) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      setMessage,
    })
    const data = response?.data

    if (data) {
      DocumentStore.getState().setProcessedResults(data)
    }
  },

  updateItem: async (url, updatedItem, setMessage, redirect) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: updatedItem,
      setMessage,
      setLoading: DocumentStore.getState().setLoading,
    })
    if (response?.data) {
      DocumentStore.getState().setProcessedResults(response.data)
    }
    if (redirect) redirect()
  },

  postItem: async (url, updatedItem, setMessage, redirect) => {
    set({ loading: true })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: updatedItem,
      setMessage,
      setLoading: DocumentStore.getState().setLoading,
    })
    if (response?.data) {
      DocumentStore.getState().setProcessedResults(response.data)
    }
    if (redirect) redirect()
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.documents[index]?.isActive
      const updatedResults = state.documents.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        documents: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.documents.map((tertiary, idx) =>
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
        documents: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.documents.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.documents.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        documents: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default DocumentStore
