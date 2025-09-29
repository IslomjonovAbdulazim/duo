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
  access_token: string
  token_type: string
}

// Auth API functions
export const authApi = {
  // Super Admin Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/admin/login', credentials)
    return response.data
  },

  // Logout (optional - if backend supports it)
  logout: async (): Promise<void> => {
    try {
      await api.post('/admin/logout')
    } catch (error) {
      // Logout endpoint may not exist, continue with client-side logout
      console.warn('Logout endpoint not available:', error)
    }
  },
}