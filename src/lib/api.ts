import axios, { type AxiosInstance, type AxiosResponse } from 'axios'

// Create axios instance with environment variables
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Admin-Bypass': import.meta.env.VITE_ADMIN_BYPASS_KEY,
  },
  timeout: 10000,
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Handle errors gracefully
    return Promise.reject(error)
  }
)

export { api }
export default api