import axios from "axios"
import router from "@/router"



const axiosInstance = axios.create({
  baseURL: "https://sismoya.bsit3b.site/api",
  timeout: 10000,
})

// ✅ Automatically attach token for every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ✅ Handle 401 Unauthorized responses globally
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear stored user session
      localStorage.removeItem("token")
      localStorage.removeItem("user")

      router.push("/login")
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
