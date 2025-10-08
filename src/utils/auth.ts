import axiosInstance from "@/utils/axios"
import router from "@/router"


export async function getProfile() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }
    
    const res = await axiosInstance.get("/profile") 
    return res.data.user
  } catch (error: any) {
    console.error('Profile fetch error:', error.response?.status, error.response?.data)
    throw error
  }
}

export async function logout() {
  try {
    const res = await axiosInstance.post("/logout")
    if (res.data && !res.data.error) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      return { success: true, message: "Logged out successfully!" }
    }
    return { success: false, message: res.data.message || "Logout failed" }
  } catch (err: any) {
    console.error("Logout error:", err)
    // Even if logout API fails, clear local storage
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    return { success: false, message: "Something went wrong" }
  }
}

// ✅ Improved Token validator with SweetAlert notification
export async function validateToken(): Promise<boolean> {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      return false
    }
    
    await getProfile()
    return true
  } catch (error: any) {
    // Only clear token if it's an authentication error (401 from profile)
    if (error.response?.status === 401) {
      console.log("🔒 Authentication failed - clearing token")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      
      router.push('/login')
      return false
    } else {
      console.log("🔧 Other error (not authentication), keeping token:", error.message)
      // Don't clear token for other errors (network issues, server errors, etc.)
      // Return true to indicate token might still be valid
      return true
    }
  }
}

// New function: Safe profile get that doesn't throw on errors
export async function getProfileSafe() {
  try {
    return await getProfile()
  } catch (error) {
    console.log('Safe profile get failed, returning null')
    return null
  }
}