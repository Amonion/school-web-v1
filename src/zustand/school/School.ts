import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'
import { AuthStore } from '../user/AuthStore'
import { AcademicLevel } from './Academic'
import { BioUserState } from '../user/BioUserState'

interface FetchResponse {
  message: string
  count: number
  page_size: number
  results: School[]
  data: School
  schoolPositions: SchoolPosition[]
  staff: SchoolStaff
  bioUserState: BioUserState
  unreadStaffs: number
  unreadStudents: number
  unreadMessages: number
  unreadNotifications: number
}

export interface Position {
  arm: string
  isChecked: boolean
}
export interface StaffPosition {
  arm: string
  name: string
  index: number
}

export interface SchoolPosition {
  _id: string
  officeUsername: string
  officeName: string
  positionsIndex: number
  positionName: string
  positionDivisions: Position[]
}

export interface Session {
  name: string
  index: number | null
  divisions: string[]
}

export interface SchoolStaff {
  level: number
  bioUserId: string
  bioUserPicture: string
  bioUserUsername: string
  position: string
  school: string
  schoolId: string
  schoolUsername: string
}

export const SchoolStaffEmpty = {
  level: 0,
  bioUserId: '',
  bioUserPicture: '',
  bioUserUsername: '',
  position: '',
  school: '',
  schoolId: '',
  schoolUsername: '',
}

export interface Grade {
  name: string
  remark: string
  min: number
  max: number
}

export interface School {
  _id: string
  placeId: string
  country: string
  countrySymbol: string
  state: string
  area: string
  name: string
  ownerUsername: string
  userId: string
  bioId: string
  staffRegistration: boolean
  studentRegistration: boolean
  username: string
  grading: Grade[]
  academicSession: Session
  phone: string
  address: string
  email: string
  description: string
  levels: AcademicLevel[]
  institutions: string[]
  idCard: File | string | null
  document: File | string | null
  logo: File | string | null
  media: File | string | null
  continent: string
  landmark: string
  logoPreview: string
  mediaPreview: string
  countryFlag: string
  currency: string
  officeId: string
  currencySymbol: string
  resultPointSystem: number
  createdAt: Date | null
  followers: number
  following: number
  posts: number
  comments: number
  isApproved: boolean
  isApplied: boolean
  isVerified: boolean
  isFollowed: boolean
  isChecked?: boolean
  isActive?: boolean
}

export const SchoolEmpty = {
  _id: '',
  placeId: '',
  country: '',
  countrySymbol: '',
  state: '',
  area: '',
  name: '',
  ownerUsername: '',
  academicSession: { name: '', index: null, divisions: [] },
  studentRegistration: false,
  staffRegistration: false,
  grading: [
    { name: 'A', min: 70, max: 100, remark: 'Excelent' },
    { name: 'B', min: 60, max: 69.99, remark: 'Very Good' },
  ],
  userId: '',
  bioId: '',
  username: '',
  phone: '',
  address: '',
  email: '',
  description: '',
  levels: [],
  institutions: [],
  idCard: '',
  document: '',
  logo: '',
  media: '',
  mediaPreview: '',
  logoPreview: '',
  officeId: '',
  picture: '',
  continent: '',
  landmark: '',
  countryFlag: '',
  currency: '',
  currencySymbol: '',
  resultPointSystem: 0,
  createdAt: null,
  followers: 0,
  following: 0,
  posts: 0,
  comments: 0,
  isApproved: false,
  isApplied: false,
  isVerified: false,
  isFollowed: false,
}

interface SchoolState {
  links: { next: string | null; previous: string | null } | null
  count: number
  page_size: number
  unreadStaffs: number
  unreadStudents: number
  unreadMessages: number
  unreadNotifications: number
  selectedLevel: number | null
  selectedLevelName: string
  selectedClassLevel: number | null
  schoolResults: School[]
  schoolPositions: SchoolPosition[]
  staffPositions: StaffPosition[]
  staff: SchoolStaff
  loading: boolean
  showApplicationForm: boolean
  showApplication: boolean
  error: string | null
  successs?: string | null
  selectedSchools: School[]
  searchedSchools: School[]
  searchedSchoolResult: School[]
  isAllChecked: boolean
  hasMoreSearch: boolean
  allSchools: boolean
  schoolData: School
  sessionIndex: number | null
  setForm: (key: keyof School, value: School[keyof School]) => void
  resetForm: () => void
  setAllSchools: () => void
  getSchools: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getSchoolNotifications: (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  getSchool: (url: string) => Promise<void>
  getStaff: (url: string) => Promise<void>
  increaseLevel: (levelIndex: number) => void
  decreaseLevel: (levelIndex: number) => void
  setProcessedResults: (data: FetchResponse) => void
  setSchoolForm: (username: string) => void
  setLoading?: (loading: boolean) => void
  massDelete: (
    url: string,
    selectedSchools: School[],
    setMessage: (message: string, isError: boolean) => void
  ) => Promise<void>
  deleteItem: (
    url: string,
    setMessage: (message: string, isError: boolean) => void,
    setLoading?: (loading: boolean) => void
  ) => Promise<void>

  apply: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  updateItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  addGradeToStore: (grade: Grade) => void
  removeGrade: (index: number) => void
  postItem: (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => Promise<void>
  toggleChecked: (index: number) => void
  toggleActive: (index: number) => void
  toggleAllSelected: () => void
  reshuffleSchools: () => void
  clearSearchedSchools: () => void
  setSearchedSchoolResult: () => void
  searchSchool: (url: string) => void
  selectClass: (level: number, classLevel: number, levelName: string) => void
  setSessionIndex: (index: number) => void
  setApplicationForm: (status: boolean) => void
  setApplication: (status: boolean) => void
  addMoreSearchItems: (url: string) => void
  getQuerySchools: (url: string) => void
}

const SchoolStore = create<SchoolState>((set) => ({
  links: null,
  count: 0,
  page_size: 20,
  unreadStaffs: 0,
  unreadStudents: 0,
  unreadMessages: 0,
  unreadNotifications: 0,
  selectedLevel: null,
  selectedLevelName: '',
  selectedClassLevel: null,
  schoolResults: [],
  schoolPositions: [],
  loading: false,
  showApplicationForm: false,
  showApplication: false,
  hasMoreSearch: true,
  error: null,
  selectedSchools: [],
  staffPositions: [],
  searchedSchools: [],
  searchedSchoolResult: [],
  isAllChecked: false,
  allSchools: false,
  schoolData: SchoolEmpty,
  staff: SchoolStaffEmpty,
  sessionIndex: null,
  setForm: (key, value) =>
    set((state) => ({
      schoolData: {
        ...state.schoolData,
        [key]: value,
      },
    })),
  resetForm: () =>
    set({
      schoolData: SchoolEmpty,
    }),

  setApplicationForm: (status: boolean) => {
    set({ showApplicationForm: status })
  },

  setApplication: (status: boolean) => {
    set({ showApplication: status })
  },

  setLoading: (loadState: boolean) => {
    set({ loading: loadState })
  },

  increaseLevel: (levelIndex) =>
    set((state) => {
      const updatedLevels = [...state.schoolData.levels]
      updatedLevels[levelIndex].maxLevel += 1
      return { schoolData: { ...state.schoolData, levels: updatedLevels } }
    }),

  decreaseLevel: (levelIndex) =>
    set((state) => {
      const updatedLevels = [...state.schoolData.levels]
      if (updatedLevels[levelIndex].maxLevel > 1) {
        updatedLevels[levelIndex].maxLevel -= 1
      }
      return { schoolData: { ...state.schoolData, levels: updatedLevels } }
    }),

  selectClass: (level, classLevel, levelName) =>
    set({
      selectedLevel: level,
      selectedClassLevel: classLevel,
      selectedLevelName: levelName,
    }),

  setSessionIndex: (index: number) => {
    set({ sessionIndex: index })
  },

  setSchoolForm: (username: string) => {
    set((prev) => {
      const matchedSchool = prev.searchedSchools.find(
        (school) => school.username === username
      )
      return { schoolData: matchedSchool }
    })
  },

  clearSearchedSchools: () => {
    set({ searchedSchoolResult: [] })
  },

  setSearchedSchoolResult: () => {
    set((prev) => {
      return {
        searchedSchools: prev.searchedSchoolResult,
        searchedSchoolResult: [],
      }
    })
  },

  setAllSchools: () => {
    set((state) => {
      const isCurrentlyActive = state.allSchools
      const updatedResults = state.schoolResults.map((tertiary) => ({
        ...tertiary,
        isChecked: isCurrentlyActive ? tertiary.isChecked : false,
      }))
      return {
        allSchools: !state.allSchools,
        schoolResults: updatedResults,
        selectedSchools: !state.allSchools ? [] : state.selectedSchools,
      }
    })
  },

  setProcessedResults: ({ count, page_size, results }: FetchResponse) => {
    if (results) {
      const updatedResults = results.map((item: School) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))

      set({
        loading: false,
        count,
        page_size,
        schoolResults: updatedResults,
      })
    }
  },

  getSchools: async (
    url: string,
    setMessage: (message: string, isError: boolean) => void
  ) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setMessage,
        setLoading: SchoolStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        SchoolStore.getState().setProcessedResults(data)
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getSchool: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: SchoolStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({
          schoolData: data.data,
          loading: false,
          schoolPositions: data.schoolPositions,
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getSchoolNotifications: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: SchoolStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set({
          unreadStaffs: data.unreadStaffs,
          unreadStudents: data.unreadStudents,
          unreadMessages: data.unreadMessages,
          unreadNotifications: data.unreadNotifications,
          loading: false,
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getStaff: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: SchoolStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            staff: data.staff ? data.staff : { ...prev.staff },
            loading: false,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  addMoreSearchItems: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: SchoolStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            searchedSchools: [...prev.searchedSchools, ...data.results],
            loading: false,
            hasMoreSearch: data.results.length === prev.page_size,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  getQuerySchools: async (url: string) => {
    try {
      const response = await apiRequest<FetchResponse>(url, {
        setLoading: SchoolStore.getState().setLoading,
      })
      const data = response?.data
      if (data) {
        set((prev) => {
          return {
            searchedSchools: data.results,
            loading: false,
            hasMoreSearch: data.results.length === prev.page_size,
          }
        })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  reshuffleSchools: async () => {
    set((state) => ({
      schoolResults: state.schoolResults.map((item: School) => ({
        ...item,
        isChecked: false,
        isActive: false,
      })),
    }))
  },

  searchSchool: _debounce(async (url: string) => {
    const response = await apiRequest<FetchResponse>(url)

    const results = response?.data.results
    if (results) {
      const updatedResults = results.map((item: School) => ({
        ...item,
        isChecked: false,
        isActive: false,
      }))
      set({ searchedSchoolResult: updatedResults })
    }
  }, 1000),

  massDelete: async (
    url: string,
    selectedSchools: School[],
    setMessage: (message: string, isError: boolean) => void
  ) => {
    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: selectedSchools,
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
      SchoolStore.getState().setProcessedResults(data)
    }
  },

  updateItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => {
    try {
      set({ loading: true })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: SchoolStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        if (data.bioUserState) {
          AuthStore.getState().setBioUserState(data.bioUserState)
        }
        // if (data.schoolPositions) {
        //   set({ schoolPositions: data.schoolPositions })
        // }
        set({ schoolData: data.data })
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  apply: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => {
    try {
      set({ loading: true })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'PATCH',
        body: updatedItem,
        setMessage,
        setLoading: SchoolStore.getState().setLoading,
      })
      const data = response.data
      if (data) {
        set({ schoolData: data.data })
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  addGradeToStore: (newGrade) =>
    set((state) => ({
      schoolData: {
        ...state.schoolData,
        grading: [...state.schoolData.grading, newGrade],
      },
    })),

  removeGrade: (index: number) =>
    set((state) => ({
      schoolData: {
        ...state.schoolData,
        grading: state.schoolData.grading.filter((_, i) => i !== index),
      },
    })),

  postItem: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    setMessage: (message: string, isError: boolean) => void,
    redirect?: () => void
  ) => {
    try {
      set({ loading: true })
      const response = await apiRequest<FetchResponse>(url, {
        method: 'POST',
        body: updatedItem,
        setMessage,
        setLoading: SchoolStore.getState().setLoading,
      })

      const data = response.data
      if (data) {
        AuthStore.getState().setBioUserState(data.bioUserState)
        set({ schoolData: data.data })
      }
      if (redirect) redirect()
    } catch (error) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  toggleActive: (index: number) => {
    set((state) => {
      const isCurrentlyActive = state.schoolResults[index]?.isActive
      const updatedResults = state.schoolResults.map((tertiary, idx) => ({
        ...tertiary,
        isActive: idx === index ? !isCurrentlyActive : false,
      }))
      return {
        schoolResults: updatedResults,
      }
    })
  },

  toggleChecked: (index: number) => {
    set((state) => {
      const updatedResults = state.schoolResults.map((tertiary, idx) =>
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
        schoolResults: updatedResults,
        selectedSchools: updatedSelectedItems,
        isAllChecked: isAllChecked,
        allSchools: isAllChecked,
      }
    })
  },

  toggleAllSelected: () => {
    set((state) => {
      const isAllChecked =
        state.schoolResults.length === 0 ? false : !state.isAllChecked
      const updatedResults = state.schoolResults.map((place) => ({
        ...place,
        isChecked: isAllChecked,
      }))

      const updatedSelectedItems = isAllChecked ? updatedResults : []

      return {
        schoolResults: updatedResults,
        selectedSchools: updatedSelectedItems,
        isAllChecked,
      }
    })
  },
}))

export default SchoolStore
