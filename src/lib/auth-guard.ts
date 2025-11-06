import { useAuthStore } from '@/stores/auth-store'

export const isAuthenticated = (): boolean => {
  const { user, isAuthenticated } = useAuthStore.getState().auth
  return !!(user && isAuthenticated)
}

export const requireAuth = () => {
  const authenticated = isAuthenticated()
  if (!authenticated) {
    throw new Error('Authentication required')
  }
  return authenticated
}

export const getAuthHeaders = () => {
  // Admin bypass key is automatically included in all requests via api.ts
  return {}
}