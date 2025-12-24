import { create } from 'zustand'
import apiRequest from '@/lib/axios'
import _debounce from 'lodash/debounce'
import { AxiosError } from 'axios'
import { addRecordsToDB, clearTable, initDB } from '@/lib/indexDB'

export const getExamsFromDB = async <T>(
  table: string,
  limit: number,
  page: number
): Promise<T[]> => {
  const db = await initDB()

  const allItems = await db.getAll(table)

  // 🔥 sort internally (assume createdAt exists)
  const sorted = allItems.sort(
    (a: Exam, b: Exam) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const start = (page - 1) * limit
  const end = start + limit

  return sorted.slice(start, end) as T[]
}

export interface Exam {
  _id: string
  title: string
  instruction: string
  continents: string[]
  countries: string[]
  states: string[]
  academicLevels: string[]
  subtitle: string
  type: string
  name: string
  picture: string
  logo: string
  bioUserUsername: string
  participants: number
  comments: number
  subjects: string
  country: string
  state: string
  area: string
  priority: string
  isPublished: boolean
  randomize: boolean
  simultaneous: boolean
  showResult: boolean
  isEditable?: boolean
  eligibility: boolean
  publishedAt: Date | null | number
  createdAt: Date | number | string
  duration: number
  questions: number
  questionsPerPage: number
  optionsPerQuestion: number
  status: string
  isChecked?: boolean
  isActive?: boolean
}

export const ExamEmpty = {
  _id: '',
  title: '',
  instruction: '',
  continents: [],
  countries: [],
  states: [],
  academicLevels: [],
  subtitle: '',
  type: '',
  name: '',
  picture: '',
  logo: '',
  country: '',
  state: '',
  area: '',
  bioUserUsername: '',
  priority: '',
  participants: 0,
  comments: 0,
  subjects: '',
  isPublished: false,
  randomize: false,
  simultaneous: false,
  showResult: false,
  eligibility: false,
  publishedAt: null,
  createdAt: '',
  duration: 0,
  questions: 0,
  questionsPerPage: 0,
  optionsPerQuestion: 0,
  status: '',
}

interface FetchResponse {
  message: string
  count: number
  attempt: number
  page_size: number
  results: Exam[]
  data: Exam
  exam: Exam
}

interface ExamState {
  count: number
  attempt: number
  currentPage: number
  page_size: number
  exams: Exam[]
  searchedExams: Exam[]
  loading: boolean
  selectedItems: Exam[]
  searchResult: Exam[]
  searchedExamResults: Exam[]
  hasMoreSearch: boolean
  hasMore: boolean
  isAllChecked: boolean
  examForm: Exam
  setForm: (key: keyof Exam, value: Exam[keyof Exam]) => void
  resetForm: () => void
  getSavedExams: () => Promise<void>
  getExams: (url: string) => Promise<void>
  getExam: (
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
  deleteExam: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  postItem: (
    url: string,
    updatedItem: FormData,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleResults: () => void
  clearSearchedExams: () => void
  searchExams: (url: string) => void
  addMoreSearchItems: (url: string) => void
  getMoreExams: (url: string) => void
  getMoreSavedExams: () => void
  getQueryExams: (url: string) => void
}

const ExamStore = create<ExamState>((set) => ({
  count: 0,
  attempt: 0,
  currentPage: 1,
  page_size: 20,
  exams: [],
  searchedExams: [],
  loading: false,
  hasMoreSearch: true,
  hasMore: true,
  selectedItems: [],
  searchResult: [],
  searchedExamResults: [],
  isAllChecked: false,
  examForm: ExamEmpty,
  setForm: (key, value) =>
    set((state) => ({
      examForm: {
        ...state.examForm,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      examForm: ExamEmpty,
    }),

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  clearSearchedExams: () => {
    set({
      searchedExamResults: [],
    })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: Exam) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        exams: updatedResults,
      })
    }
  },

  getSavedExams: async () => {
    try {
      const response = await getExamsFromDB<Exam>('exams', 20, 1)
      if (response) {
        ExamStore.setState({ exams: response })
      }
      ExamStore.getState().getExams(
        `/competitions/exams/?page_size=40&page=1&ordering=-createdAt`
      )
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  getExams: async (url) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      const data = response?.data
      if (data) {
        set({ currentPage: 2 })
        clearTable('exams')
        const fetchedExams = data.results
        const savedExams = ExamStore.getState().exams
        const first20 = fetchedExams.slice(0, 20)
        const next20 = fetchedExams.slice(20, 40)

        if (savedExams.length > 0) {
          set((prev) => {
            return {
              exams:
                prev.exams.length >= 20
                  ? [...prev.exams]
                  : [...prev.exams, ...next20],
            }
          })
        } else {
          set({ exams: first20 })
        }
        set((prev) => {
          return {
            hasMore: fetchedExams.length >= prev.page_size,
          }
        })
        addRecordsToDB('exams', fetchedExams)
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  getExamTable: async (url) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      const data = response?.data
      if (data) {
        ExamStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  getMoreSavedExams: async () => {
    try {
      set({ loading: true })
      const page = ExamStore.getState().currentPage
      const page_size = ExamStore.getState().page_size
      const response = await getExamsFromDB<Exam>('exams', 20, page)
      if (response) {
        set((prev) => {
          const existingIds = new Set(prev.exams.map((e) => e._id))
          const filtered = response.filter((e) => !existingIds.has(e._id))
          return {
            exams: [...prev.exams, ...filtered],
          }
        })
      }
      ExamStore.getState().getMoreExams(
        `/competitions/exams/?page_size=${page_size}&page=${
          page + 1
        }&ordering=-createdAt`
      )
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    } finally {
      set({ loading: false })
    }
  },

  getMoreExams: async (url) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      const data = response?.data
      if (data) {
        addRecordsToDB('exams', data.results)
      }
      set((prev) => {
        return {
          currentPage: prev.currentPage + 1,
          hasMore: data.results.length >= prev.page_size,
        }
      })
    } catch (error: unknown) {
      console.error('Failed to fetch staff:', error)
    }
  },

  getExam: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: ExamStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({
          examForm: data.data,
          loading: false,
          attempt: data.attempt ? data.attempt : 0,
        })
      }
    } catch (error: unknown) {
      console.error(error)
      setMessage('Failed to fetch exam:', false)
    }
  },

  addMoreSearchItems: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: ExamStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            searchedExams: [...prev.searchedExams, ...data.results],
            loading: false,
            hasMoreSearch: data.results.length === prev.page_size,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getQueryExams: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: ExamStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            searchedExams: data.results,
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
      exams: state.exams.map((item: Exam) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchExams: _debounce(async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url)
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: Exam) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedExamResults: updatedResults })
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        set({ loading: false })
      } else {
        set({ loading: false })
      }
    }
  }, 1000),

  massDelete: async (url, selectedItems, setMessage) => {
    set({
      loading: true,
    })
    const response = await apiRequest<FetchResponse>(url, {
      method: 'PATCH',
      body: selectedItems,
      setMessage,
      setLoading: ExamStore.getState().setLoading,
    })
    if (response) {
    }
  },

  deleteExam: async (url, setMessage) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'DELETE',
      setMessage,
    })
    const data = response?.data
    if (data) {
      ExamStore.getState().setProcessedResults(data)
    }
  },

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
      setLoading: ExamStore.getState().setLoading,
    })
    if (response?.status !== 404 && response?.data) {
      set({ loading: false })
      ExamStore.getState().setProcessedResults(response.data)
    } else {
      set({ loading: false })
    }
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
      setLoading: ExamStore.getState().setLoading,
    })
    if (response?.status !== 404 && response?.data) {
      set({ loading: false })
      ExamStore.getState().setProcessedResults(response.data)
    } else {
      set({ loading: false })
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.exams[index]?.isActive
      const updatedResults = state.exams.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        exams: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.exams.map((tertiary, idx) =>
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
        exams: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.exams.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.exams.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        exams: updatedResults,
        selectedItems: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default ExamStore
