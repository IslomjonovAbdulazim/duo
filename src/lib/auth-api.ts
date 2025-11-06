import api from './api'

// Types for API responses
export interface AuthUser {
  id: number
  email: string
  role: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user?: AuthUser
}

// Auth API functions with bypass key
export const authApi = {
  // Admin authentication using bypass key
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      // Since bypass key is in headers, just verify admin access
      const response = await api.post<LoginResponse>('/admin/verify', credentials)
      return response.data
    } catch (error) {
      return { success: false }
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    // Client-side logout only since we use bypass key
    return Promise.resolve()
  },
}