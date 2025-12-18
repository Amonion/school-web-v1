import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BioUser } from './BioUser'
import { BioUserState } from './BioUserState'
import { User } from './User'
import { BioUserSchoolInfo } from './BioUserSchoolInfo'
import { BioUserSettings } from './BioUserSettings'
import { Office } from '../utility/Office'
import { Staff } from '../app/Staff'

interface AuthState {
  bioUser: BioUser | null
  staff: Staff | null
  bioUserSettings: BioUserSettings | null
  bioUserState: BioUserState | null
  bioUserSchoolInfo: BioUserSchoolInfo | null
  activeOffice: Office | null
  userOffices: Office[]
  user: User | null
  token: string | null
  login: (
    user: User,
    bioUserSettings: BioUserSettings,
    bioUser: BioUser,
    bioUserState: BioUserState,
    bioUserSchoolInfo: BioUserSchoolInfo,
    token: string
  ) => void
  setUser: (userData: User) => void
  setAllUser: (
    bioUserState: BioUserState,
    bioUser?: BioUser,
    bioUserSchoolInfo?: BioUserSchoolInfo,
    bioUserSettings?: BioUserSettings
  ) => void
  setBioUserState: (bioUserState: BioUserState) => void
  setStaff: (staff: Staff) => void
  setBioUser: (bioUserState: BioUser) => void
  setBioUserSchoolInfo: (user: BioUserSchoolInfo) => void
  setOfficeState: (office?: Office, userOffices?: Office[]) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const AuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      bioUser: null,
      staff: null,
      bioUserState: null,
      bioUserSettings: null,
      bioUserSchoolInfo: null,
      activeOffice: null,
      userOffices: [],
      user: null,
      token: null,
      setAllUser: (
        bioUserState,
        bioUser,
        bioUserSchoolInfo,
        bioUserSettings
      ) => {
        set((prev) => {
          return {
            bioUserState: bioUserState,
            bioUser: bioUser ? bioUser : prev.bioUser,
            bioUserSchoolInfo: bioUserSchoolInfo
              ? bioUserSchoolInfo
              : prev.bioUserSchoolInfo,
            bioUserSettings: bioUserSettings
              ? bioUserSettings
              : prev.bioUserSettings,
          }
        })
      },

      setBioUserState: (bioUserState) => {
        set({ bioUserState: bioUserState })
      },
      setBioUser: (bioUserState) => {
        set({ bioUser: bioUserState })
      },
      setStaff: (staff) => {
        set({ staff: staff })
      },

      setBioUserSchoolInfo: (user) => {
        set((state) => ({
          ...state,
          bioUserSchoolInfo: user,
        }))
      },

      setOfficeState: (office, userOffices) => {
        set((prev) => {
          return {
            activeOffice: office ? office : prev.activeOffice,
            userOffices: userOffices ? userOffices : prev.userOffices,
          }
        })
      },

      login: (
        user,
        bioUserSettings,
        bioUser,
        bioUserState,
        bioUserSchoolInfo,
        token
      ) => {
        set({
          user: user,
          bioUserSettings: bioUserSettings,
          bioUser: bioUser,
          bioUserState: bioUserState,
          bioUserSchoolInfo: bioUserSchoolInfo,
          token,
        })
        const expirationDays = 30
        const expires = new Date(
          Date.now() + expirationDays * 86400000
        ).toUTCString()

        document.cookie = `token=${token}; path=/; expires=${expires}; SameSite=Lax`
        document.cookie = `user=${encodeURIComponent(
          JSON.stringify(user)
        )}; path=/; expires=${expires}; SameSite=Lax`
      },

      setUser: (userData) => {
        set({ user: userData })
        const expirationDays = 30
        const expires = new Date(
          Date.now() + expirationDays * 86400000
        ).toUTCString()
        document.cookie = `user=${encodeURIComponent(
          JSON.stringify(userData)
        )}; path=/; expires=${expires}; SameSite=Lax`
      },

      logout: () => {
        set({
          user: null,
          bioUser: null,
          bioUserSchoolInfo: null,
          bioUserState: null,
          bioUserSettings: null,
          token: null,
        })
        document.cookie =
          'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
        document.cookie =
          'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
      },

      isAuthenticated: () => {
        const { user, token } = get()
        return !!user && !!token
      },
    }),
    {
      name: 'auth-store', // key in localStorage
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        staff: state.staff,
        bioUserState: state.bioUserState,
        bioUserSchoolInfo: state.bioUserSchoolInfo,
        bioUserSettings: state.bioUserSettings,
        bioUser: state.bioUser,
        activeOffice: state.activeOffice,
        userOffices: state.userOffices,
      }),
    }
  )
)
