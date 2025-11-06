import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ADMIN_SESSION = 'admin_session_data'

interface AuthUser {
  id: number
  email: string
  role: string
}

interface AuthState {
  auth: {
    user: AuthUser | null
    isAuthenticated: boolean
    setUser: (user: AuthUser | null) => void
    setAuthenticated: (authenticated: boolean) => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const sessionCookie = getCookie(ADMIN_SESSION)
  const initUser = sessionCookie ? JSON.parse(sessionCookie) : null
  
  return {
    auth: {
      user: initUser,
      isAuthenticated: !!initUser,
      setUser: (user) =>
        set((state) => {
          if (user) {
            setCookie(ADMIN_SESSION, JSON.stringify(user))
          } else {
            removeCookie(ADMIN_SESSION)
          }
          return { 
            ...state, 
            auth: { 
              ...state.auth, 
              user,
              isAuthenticated: !!user
            } 
          }
        }),
      setAuthenticated: (authenticated) =>
        set((state) => ({
          ...state,
          auth: { ...state.auth, isAuthenticated: authenticated }
        })),
      reset: () =>
        set((state) => {
          removeCookie(ADMIN_SESSION)
          return {
            ...state,
            auth: { 
              ...state.auth, 
              user: null, 
              isAuthenticated: false 
            },
          }
        }),
    },
  }
})
