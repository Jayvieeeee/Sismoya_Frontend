import axios from 'axios'

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: 'https://sismoya.com/api',
  timeout: 10000,
})

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)

export default axiosInstance