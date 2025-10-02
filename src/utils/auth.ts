// src/utils/auth.ts
import axiosInstance from "@/utils/axios"

export async function getProfile() {
  try {
    const res = await axiosInstance.get("/profile") 
    return res.data.user
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch profile")
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
    return { success: false, message: "Something went wrong" }
  }
}

// ✅ Token validator using /profile
export async function validateToken(): Promise<boolean> {
  try {
    await getProfile() // if this works, token is valid
    return true
  } catch {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    return false
  }
}
